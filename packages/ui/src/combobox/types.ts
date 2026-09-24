/**
 * FluereCombobox 公共类型契约
 *
 * 设计规范来源：WinUI 3 / Windows App SDK 2.0 — ComboBox
 *   src/controls/dev/ComboBox/ComboBox_themeresources.xaml   （模板 / 资源 / 动画）
 *   src/dxaml/xcp/dxaml/lib/ComboBox_Partial.cpp             （键位 / 搜索 / 弹层定位）
 *   src/dxaml/xcp/dxaml/lib/ComboBoxItem_Partial.cpp         （下拉项状态机）
 * 交互底座复用 reka-ui 的 Combobox 原语（ComboboxRoot / Anchor / Input / Content /
 * Item 等），把 roving highlight、ARIA combobox 语义、弹层定位交给底座；
 * 本组件负责 WinUI 的键位口径、文本搜索、可编辑态与视觉状态。
 *
 * 类型与 Props 说明集中在这一层：combobox.vue 只做组合与呈现，
 * 纯逻辑模块（constants / items / text-search / keyboard）反向依赖本文件。
 */
import type { AcceptableValue, Direction } from 'reka-ui'

/**
 * 下拉项数据（对应 WinUI 的 `ItemsSource` 元素 + `ItemTemplate` 的纯文本）
 *
 * WinUI 的项文本来自 `ToString()`（或 `DisplayMemberPath`）；Web 侧无法从对象推断
 * 可读文本，故显式给出 `text`，缺省回落到 `String(value)`。
 */
export interface FluereComboboxItem<T = AcceptableValue> {
  /** 该项的值（对应 WinUI 选中项的 `SelectedItem`） */
  value: T
  /** 显示文本 + 文本搜索用的纯文本；缺省 `String(value)`（对应 WinUI `ToString()`） */
  text?: string
  /** 该项不可选（对应 WinUI `ComboBoxItem.IsEnabled = false`） */
  disabled?: boolean
}

/**
 * 选择提交时机（对应 WinUI `ComboBox.SelectionChangedTrigger`）
 * - `committed`（WinUI 缺省）：点击 / 回车 / 文本搜索才提交选中；开着面板用方向键
 *   只会移动高亮，不改变 `SelectedItem`
 * - `always`：高亮走到哪就提交到哪（WinUI 的 `ComboBoxSelectionChangedTrigger.Always`）
 */
export type FluereComboboxSelectionChangedTrigger = 'committed' | 'always'

/**
 * 选中变化载荷（对应 WinUI `SelectionChangedEventArgs`）
 *
 * WinUI 的 ComboBox 单选，故 `AddedItems` / `RemovedItems` 各至多一项。
 */
export interface FluereComboboxSelectionChangedEventArgs<T = AcceptableValue> {
  /** 新选中项（无选中时为 null，对应 WinUI `SelectedItem = null`） */
  addedItem: T | null
  /** 此前的选中项 */
  removedItem: T | null
  /** 新选中项下标；无选中为 -1（对应 WinUI `SelectedIndex` 的 -1 语义） */
  addedIndex: number
  /** 此前选中项下标 */
  removedIndex: number
}

/**
 * 可编辑态「文本提交」载荷（对应 WinUI `ComboBoxTextSubmittedEventArgs`）
 *
 * 触发条件与 WinUI 一致：`editable` 为真、输入文本不匹配任何已有项、且用户按下
 * 回车或焦点离开。把 `handled` 置为 true 可阻止组件更新选中项（WinUI `e.Handled = true`）。
 */
export interface FluereComboboxTextSubmittedEventArgs {
  /** 用户提交的文本 */
  text: string
  /** 置 true 表示消费方已处理，组件不再改动选中项 */
  handled: boolean
}

export interface FluereComboboxProps<T = AcceptableValue> {
  /**
   * 当前选中值（v-model，对应 WinUI `SelectedItem`）。
   * `null` 表示无选中（WinUI 缺省 `SelectedIndex = -1`）；不传即非受控。
   */
  modelValue?: T | null

  /**
   * 非受控初始选中值（对应 WinUI 在 `Loaded` 里设 `SelectedItem`）
   * @default null
   */
  defaultValue?: T | null

  /**
   * 下拉项数据源（对应 WinUI `ItemsSource`）
   */
  items?: readonly FluereComboboxItem<T>[]

  /**
   * 下拉面板是否展开（`v-model:open`，对应 WinUI `IsDropDownOpen`）
   */
  open?: boolean

  /**
   * 非受控初始展开状态
   * @default false
   */
  defaultOpen?: boolean

  /**
   * 是否禁用（对应 WinUI `IsEnabled = false`）
   * @default false
   */
  disabled?: boolean

  /**
   * 可编辑态（对应 WinUI `IsEditable`）：文本框可输入自定义值，
   * 输入不做列表过滤（WinUI 可编辑 ComboBox 不过滤），面板只由箭头 / F4 / Alt+↓ 打开
   * @default false
   */
  editable?: boolean

  /**
   * 可编辑态的文本（`v-model:text`，对应 WinUI `Text`）。不传即非受控。
   */
  text?: string

  /**
   * 可编辑态非受控初始文本
   * @default ''
   */
  defaultText?: string

  /**
   * 占位符（对应 WinUI `PlaceholderText`），仅无选中值时显示
   */
  placeholder?: string

  /**
   * 顶部标题（对应 WinUI `Header`），同时作为缺省的可访问名
   */
  header?: string

  /**
   * 可访问名称（优先于 `header`）
   */
  label?: string

  /**
   * 控件下方说明（对应 WinUI `Description`），并作为 `aria-describedby`
   */
  description?: string

  /**
   * 表单提交名：位于 `<form>` 内时补隐藏原生 input，提交 `name=value`
   */
  name?: string

  /**
   * 对象值的项身份比较：字段名或自定义比较函数（对应 reka `by`）
   */
  by?: string | ((a: T, b: T) => boolean)

  /**
   * 阅读方向（一般无需设置，由 ConfigProvider / LTR 推断）
   */
  dir?: Direction

  /**
   * 下拉面板最大高度（px，对应 WinUI `MaxDropDownHeight`）。
   * WinUI `DefaultComboBoxStyle` 把它压到 504（15 项），这里保持一致。
   * @default 504
   */
  maxDropDownHeight?: number

  /**
   * 是否启用文本搜索（对应 WinUI `IsTextSearchEnabled`）：非可编辑态下按字符做
   * 前缀匹配（忽略大小写）并直接选中命中项
   * @default true
   */
  textSearchEnabled?: boolean

  /**
   * 选择提交时机（对应 WinUI `SelectionChangedTrigger`）
   * @default 'committed'
   */
  selectionChangedTrigger?: FluereComboboxSelectionChangedTrigger
}
