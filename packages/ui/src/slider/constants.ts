/**
 * FluereSlider 命名常量。
 *
 * 集中收拢有领域含义的字面量（对齐 oxlint no-magic-numbers），
 * 让 Slider 各拆分模块共享同一份数值契约，避免魔数散落。
 *
 * 放在模块作用域（而不是 `<script setup>` 里）还因为 withDefaults() 的默认值
 * 会被提升到 setup 之外，props 默认值只能引用模块级的绑定。
 */

/** 值提示的小数位上限（WinUI DefaultDisambiguationUIConverter 最多保留 4 位） */
const TOOLTIP_MAX_DECIMALS = 4
/** 步进为整数（step=1）时，值提示保留 0 位小数 */
const TOOLTIP_MIN_DECIMALS = 0
/** String.indexOf 未命中的返回值（小数分隔符不存在） */
const INDEX_NOT_FOUND = -1
/** 小数分隔符自身的长度，用于把「小数点下标」换算成「小数位数」 */
const DECIMAL_POINT_LENGTH = 1
/** 浮点累加误差容忍，用于判定刻度是否落到 max 上 */
const TICK_EPSILON = 1e-9
/** 刻度线数量上限：避免 tickFrequency 极小时渲染出成千上万个节点 */
const TICK_COUNT_LIMIT = 200
/** 刻度下标从 0 起、每次 +1 */
const FIRST_TICK_INDEX = 0
const TICK_INDEX_STEP = 1
/** 百分比标度：percent ∈ [0, 100] */
const PERCENT_MAX = 100
/** 值域下界：range ≤ 0 视为无有效值域 */
const EMPTY_RANGE = 0
/** 单值滑块的取值口径：reka 的 modelValue 是数组，固定取第 0 项 */
const SINGLE_THUMB_INDEX = 0
/** 纵向控件的缺省长度（px）；WinUI 里由布局决定，Web 侧给一个可用缺省值 */
const DEFAULT_VERTICAL_LENGTH = 200

export {
  DECIMAL_POINT_LENGTH,
  DEFAULT_VERTICAL_LENGTH,
  EMPTY_RANGE,
  FIRST_TICK_INDEX,
  INDEX_NOT_FOUND,
  PERCENT_MAX,
  SINGLE_THUMB_INDEX,
  TICK_COUNT_LIMIT,
  TICK_EPSILON,
  TICK_INDEX_STEP,
  TOOLTIP_MAX_DECIMALS,
  TOOLTIP_MIN_DECIMALS,
}
