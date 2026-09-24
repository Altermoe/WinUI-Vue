import type { NumberFormatSettings } from './format'
/* oxlint-disable import/prefer-default-export -- 模块只对外暴露一个求值入口（与 WinUI 的 NumberBoxParser::Compute 对应） */
/**
 * NumberBox 的内联表达式求值（纯函数，无 Vue 依赖）。
 *
 * 逐行对照 WinUI 3 / Windows App SDK `src/controls/dev/NumberBox/NumberBoxParser.cpp`：
 *   1. `GetTokens`      分词：先数字后运算符交替，括号可任意嵌套
 *   2. `ConvertInfixToPostfix` 调度场算法（中缀 → 后缀）
 *   3. `ComputePostfixExpression` 逆波兰求值
 *
 * 与 WinUI 完全一致的口径：
 *   - 运算符优先级 `^` > `*` `/` > `+` `-`（文档 Remarks 的排序）
 *   - 同级运算符左结合（WinUI 的弹出条件是 `precedence(top) >= precedence(cur)`，
 *     所以 `2^3^2` 求值为 `(2^3)^2 = 64`，而不是数学上的右结合 512）
 *   - 除以 0 返回 `NaN`（WinUI 返回一个值为 NaN 的 `IReference<double>`，与「解析失败返回
 *     空引用」是两条路径：前者会把值清空，后者由 `ValidationMode` 决定是否覆盖输入）
 *   - 任何一步出错（无法分词 / 括号不匹配 / 栈上数目不对）都返回 `null` 表示求值失败
 *
 * 数字字面量交给 `parseNumberText`，因此表达式里的数字同样按区域设置解析。
 */
import { parseNumberText } from './parse'

/** 令牌类型（对应 WinUI `MathTokenType`） */
type MathTokenType = 'number' | 'operator' | 'parenthesis'

/** 表达式令牌（对应 WinUI `MathToken`） */
interface MathToken {
  type: MathTokenType
  /** 数字令牌的值，非数字令牌固定为 `NO_NUMBER_VALUE` */
  value: number
  /** 运算符 / 括号令牌的字符，数字令牌为空串 */
  char: string
}

/** WinUI `c_numberBoxOperators` */
const OPERATORS = '+-*/^'
const PARENTHESIS_OPEN = '('
const PARENTHESIS_CLOSE = ')'

/** 运算符优先级（WinUI `GetPrecedenceValue`） */
const OPERATOR_PRECEDENCE: Record<string, number> = { '+': 0, '-': 0, '*': 1, '/': 1, '^': 2 }

/** WinUI `GetNextNumber` 的取数正则：可选负号 + 直到运算符/括号/空白为止的一段（整段都是字面量） */
const NEXT_NUMBER_PATTERN = /^-?[^-+/*()^\s]+/

/** 首个下标 */
const FIRST_INDEX = 0
/** `length - 1` 里的偏移量 */
const LAST_INDEX_OFFSET = 1
/** 空集合长度 */
const EMPTY_LENGTH = 0
/** 集合推进步长 */
const INDEX_STEP = 1
/** 运算符缺省优先级（`+` / `-`） */
const DEFAULT_PRECEDENCE = 0
/** 非数字令牌的 value 占位 */
const NO_NUMBER_VALUE = 0
/** 判定「除数为 0」 */
const ZERO_DIVISOR = 0

/** 逆波兰求值所需的操作数个数 */
const BINARY_OPERAND_COUNT = 2
/** 成功求值后栈上应剩下的元素个数 */
const SINGLE_RESULT_COUNT = 1

const precedenceOf = (char: string): number => OPERATOR_PRECEDENCE[char] ?? DEFAULT_PRECEDENCE

/** 取数组中最后一个元素（`length - 1` 的具名写法） */
const lastOf = <T>(items: readonly T[]): T | undefined => items[items.length - LAST_INDEX_OFFSET]

const isOperator = (char: string): boolean => OPERATORS.includes(char)

/**
 * 从输入开头取一个数字（对应 WinUI `GetNextNumber`）。
 * 返回 `null` 表示这一段不是合法数字。
 */
const getNextNumber = (
  input: string,
  settings: NumberFormatSettings,
): { value: number; length: number } | null => {
  const matched = NEXT_NUMBER_PATTERN.exec(input)?.[FIRST_INDEX]
  if (matched === undefined) {
    return null
  }
  const parsed = parseNumberText(matched, settings)
  if (parsed.status !== 'valid') {
    return null
  }
  return { value: parsed.value, length: matched.length }
}

/**
 * 分词（对应 WinUI `GetTokens`）。
 * 返回 `null` 表示分词失败（下一个令牌既不是数字也不是运算符 / 括号）。
 */
const getTokens = (input: string, settings: NumberFormatSettings): MathToken[] | null => {
  const tokens: MathToken[] = []
  let expectNumber = true
  let index = FIRST_INDEX

  while (index < input.length) {
    // WinUI 只跳过半角空格（表达式在进入这里之前已 trim）
    const char = input.charAt(index)
    if (char !== ' ') {
      if (expectNumber) {
        if (char === PARENTHESIS_OPEN) {
          // 左括号不改变「下一个应为数字」的期待
          tokens.push({ type: 'parenthesis', value: NO_NUMBER_VALUE, char })
        } else {
          const next = getNextNumber(input.slice(index), settings)
          if (next === null) {
            return null
          }
          tokens.push({ type: 'number', value: next.value, char: '' })
          index += next.length - LAST_INDEX_OFFSET // 推进到令牌末尾
          expectNumber = false
        }
      } else if (isOperator(char)) {
        tokens.push({ type: 'operator', value: NO_NUMBER_VALUE, char })
        expectNumber = true
      } else if (char === PARENTHESIS_CLOSE) {
        tokens.push({ type: 'parenthesis', value: NO_NUMBER_VALUE, char })
      } else {
        return null
      }
    }
    index += INDEX_STEP
  }

  return tokens
}

/** 弹出运算符栈顶中优先级不低于 `precedence` 的运算符（WinUI 的 while 循环） */
const popHigherOrEqual = (
  operatorStack: MathToken[],
  postfixTokens: MathToken[],
  precedence: number,
): void => {
  let top = lastOf(operatorStack)
  while (top !== undefined && top.type !== 'parenthesis' && precedenceOf(top.char) >= precedence) {
    operatorStack.pop()
    postfixTokens.push(top)
    top = lastOf(operatorStack)
  }
}

/** 弹出到最近的左括号（WinUI 处理右括号的分支）；返回 false 表示括号不匹配 */
const popUntilOpenParenthesis = (
  operatorStack: MathToken[],
  postfixTokens: MathToken[],
): boolean => {
  let top = lastOf(operatorStack)
  while (top !== undefined && top.char !== PARENTHESIS_OPEN) {
    operatorStack.pop()
    postfixTokens.push(top)
    top = lastOf(operatorStack)
  }
  if (top === undefined) {
    return false
  }
  operatorStack.pop() // 丢弃左括号
  return true
}

/**
 * 中缀 → 后缀（对应 WinUI `ConvertInfixToPostfix`）。
 * 返回 `null` 表示括号不匹配。
 */
const convertInfixToPostfix = (infixTokens: readonly MathToken[]): MathToken[] | null => {
  const postfixTokens: MathToken[] = []
  const operatorStack: MathToken[] = []

  for (const token of infixTokens) {
    if (token.type === 'number') {
      postfixTokens.push(token)
    } else if (token.type === 'operator') {
      popHigherOrEqual(operatorStack, postfixTokens, precedenceOf(token.char))
      operatorStack.push(token)
    } else if (token.char === PARENTHESIS_OPEN) {
      operatorStack.push(token)
    } else if (!popUntilOpenParenthesis(operatorStack, postfixTokens)) {
      return null
    }
  }

  // 弹出剩余运算符；栈里还剩括号说明不匹配
  let top = lastOf(operatorStack)
  while (top !== undefined) {
    if (top.type === 'parenthesis') {
      return null
    }
    operatorStack.pop()
    postfixTokens.push(top)
    top = lastOf(operatorStack)
  }

  return postfixTokens
}

/** 单次二元运算（对应 WinUI 求值 switch 分支）；`null` 表示未知运算符 */
const applyOperator = (char: string, left: number, right: number): number | null => {
  switch (char) {
    case '-': {
      return left - right
    }
    case '+': {
      return left + right
    }
    case '*': {
      return left * right
    }
    case '/': {
      // 除以 0：WinUI 返回值为 NaN 的引用（调用方会据此清空值）
      return right === ZERO_DIVISOR ? Number.NaN : left / right
    }
    case '^': {
      return left ** right
    }
    default: {
      return null
    }
  }
}

/** 逆波兰求值（对应 WinUI `ComputePostfixExpression`） */
const computePostfixExpression = (tokens: readonly MathToken[]): number | null => {
  const stack: number[] = []

  for (const token of tokens) {
    if (token.type === 'number') {
      stack.push(token.value)
    } else if (token.type !== 'operator' || stack.length < BINARY_OPERAND_COUNT) {
      return null
    } else {
      // WinUI 先弹出的是右操作数（op1），再是左操作数（op2）
      const right = stack.pop()
      const left = stack.pop()
      if (left === undefined || right === undefined) {
        return null
      }
      const result = applyOperator(token.char, left, right)
      if (result === null) {
        return null
      }
      stack.push(result)
    }
  }

  if (stack.length !== SINGLE_RESULT_COUNT) {
    return null
  }
  return stack[FIRST_INDEX] ?? null
}

/**
 * 求值内联表达式（对应 WinUI `NumberBoxParser::Compute`）。
 *
 * @returns 数值结果；`NaN` 表示「求值成功但结果是 NaN」（除以 0）；`null` 表示求值失败
 */
export const evaluateExpression = (
  expression: string,
  settings: NumberFormatSettings,
): number | null => {
  const tokens = getTokens(expression, settings)
  if (tokens === null || tokens.length === EMPTY_LENGTH) {
    return null
  }
  const postfixTokens = convertInfixToPostfix(tokens)
  if (postfixTokens === null || postfixTokens.length === EMPTY_LENGTH) {
    return null
  }
  return computePostfixExpression(postfixTokens)
}
