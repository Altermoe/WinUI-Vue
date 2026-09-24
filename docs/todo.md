# 0.1.0-rc.1 组件实施清单（TODO）

> 依据：使用频率 × 需求度 × WinUI 还原成本 × `reka-ui@2.10.1` 底座可用性。
> 核心交付基准：**不用手写任何 HTML，即可搭出「设置页 + 数据录入表单 + 带加载/提示反馈的页面」的 WinUI 应用。**
> 已落地约束：SSR 安全（见 [ssr-guide.md](./ssr-guide.md)）、`@fluere-vue/designs` 令牌、`@fluere-vue/hooks` / `utils` 共享原语、`pnpm check`（lint + format + tsc）+ SSR smoke 测试。

- [ ] 0. 收尾 Input：补齐 password / textarea 形态、大小与有效性状态，跑通测试与文档

## Wave 1 · 核心表单（最高频，先形成"数据录入"闭环）

按 ① 被依赖程度 ② 还原成本 从低到高排：

- [x] 1. `Checkbox`（对应 CheckBox）
- [x] 2. `ToggleSwitch`（ToggleSwitch，WinUI 标志性控件，自定义实现）
- [x] 3. `RadioButton` + `RadioGroup`（RadioButton，复用 reka RadioGroup）
- [x] 4. `Slider`（Slider，复用 reka Slider）
- [ ] 5. `NumberBox`（NumberBox，复用 reka NumberField）
- [ ] 6. `Combobox`（ComboBox，复用 reka Listbox/Combobox；下拉箭头动画、popup 定位、选中态还原最费劲，放队尾）

## Wave 2 · 反馈与状态（满足"加载 / 提示"）

- [ ] 7. `ProgressRing`（ProgressRing，不确定转圈；自定义实现，参考 ScrollView 动效基建）
- [ ] 8. `ProgressBar`（ProgressBar，复用 reka Progress）
- [ ] 9. `InfoBar`（InfoBar，信息横幅，自定义实现）
- [ ] 10. `Badge`（Badge，自定义实现）

## Wave 3 · 必要弹层与微交互

> 先补齐共享原语，再实现弹层，避免后续所有弹层组件返工。

- [ ] 11. 共享原语：`use-disclosure` / 门户 `Teleport` / 遮罩层（放入 `hooks` / `utils`）
- [ ] 12. `Tooltip`（ToolTip，复用 reka Tooltip + Popper）
- [ ] 13. `ContentDialog`（ContentDialog，复用 reka Dialog）

---

## 加分项（有余力并入 rc.1，低成本高收益）

- [ ] 14. `ToggleButton` / `ToggleGroup`（复用 reka ToggleGroup）
- [ ] 15. `Avatar` / `Persona`（复用 reka Avatar，成本很低）
- [ ] 16. `DropDownButton`（复用 reka Menu）

## rc.1 明确不做（推给 0.2）

- NavigationView、ListView/GridView/DataGrid、TreeView、CalendarDatePicker/TimePicker、MenuBar 完整版、RatingControl、CommandBar —— 工程量与还原风险高，硬塞会稀释核心质感。

## 发布检查（每波结束执行）

- [ ] `pnpm check`（lint + format + tsc）
- [ ] `pnpm test` / SSR smoke（`packages/ui/src/__tests__/ssr-smoke.test.ts`）
- [ ] 用 Wave 1 子集在 `apps/playground` 搭一个真实设置页做视觉回归（rest / hover / pressed / selected / focus / disabled）
- [ ] 为每个新组件补文档页（`apps/docs/content/components/*.md` + `demos/*/`）+ 更新 README「组件进度」索引
