/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值 */
/**
 * 展开层：面板开合（受控 / 非受控）+ 展开收尾时序 + 弹层落点同步。
 *
 * 该 hook 只依赖 computed / ref，不依赖组件实例 —— 直接调用即可，无需挂载；
 * afterOpen / getPopupElement 用回调注入，时序用微任务刷新后断言。
 */
import { describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { useComboboxPopup } from '../use-combobox-popup'
import type {
  ComboboxPopupDeps,
  ComboboxPopupEvents,
  ComboboxPopupProps,
} from '../use-combobox-popup'

const createHarness = (props: ComboboxPopupProps = {}, side?: 'top' | 'bottom') => {
  const state = reactive<ComboboxPopupProps>({ ...props })
  const openChange = vi.fn()
  const dropDownOpened = vi.fn()
  const dropDownClosed = vi.fn()
  const events: ComboboxPopupEvents = { openChange, dropDownOpened, dropDownClosed }

  const popupElement = document.createElement('div')
  if (side !== undefined) {
    popupElement.dataset.side = side
  }
  const afterOpen = vi.fn()
  const deps: ComboboxPopupDeps = { afterOpen, getPopupElement: () => popupElement }
  const model = useComboboxPopup(state, events, deps)
  return { state, model, openChange, dropDownOpened, dropDownClosed, afterOpen }
}

describe('useComboboxPopup 开合状态', () => {
  it('非受控：defaultOpen 起手，applyOpen 写本地状态并抛三个事件', async () => {
    const { model, openChange, dropDownOpened, afterOpen } = createHarness()
    expect(model.isOpen.value).toBe(false)

    model.applyOpen(true)
    expect(model.isOpen.value).toBe(true)
    expect(openChange).toHaveBeenLastCalledWith(true)
    expect(dropDownOpened).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(afterOpen).toHaveBeenCalledTimes(1)

    model.applyOpen(false)
    expect(model.isOpen.value).toBe(false)
    expect(openChange).toHaveBeenLastCalledWith(false)
  })

  it('状态相同直接忽略（不抛事件、不跑收尾）', async () => {
    const { model, openChange, dropDownOpened, afterOpen } = createHarness()
    model.applyOpen(false)
    expect(openChange).not.toHaveBeenCalled()
    expect(dropDownOpened).not.toHaveBeenCalled()
    expect(afterOpen).not.toHaveBeenCalled()
  })

  it('受控：applyOpen 只抛事件不本地生效，父级不回写就不展开', async () => {
    const { state, model, openChange, dropDownOpened } = createHarness({ open: false })
    model.applyOpen(true)

    expect(model.isOpen.value).toBe(false)
    expect(openChange).toHaveBeenLastCalledWith(true)
    expect(dropDownOpened).toHaveBeenCalledTimes(1) // DropDownOpened 照常抛

    state.open = true // 父级回写
    expect(model.isOpen.value).toBe(true)
  })

  it('收起只抛 dropDownClosed，不再跑 afterOpen', async () => {
    const { model, dropDownClosed, afterOpen } = createHarness()
    model.applyOpen(true)
    await nextTick()
    afterOpen.mockClear()

    model.applyOpen(false)
    expect(dropDownClosed).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(afterOpen).not.toHaveBeenCalled()
  })
})

describe('useComboboxPopup 落点同步（KeepInteriorCornersSquare 依据）', () => {
  it('初始 bottom；展开收尾后按 data-side 同步落点', async () => {
    const { model } = createHarness({}, 'top')
    expect(model.placement.value).toBe('bottom')

    model.applyOpen(true)
    await nextTick()
    expect(model.placement.value).toBe('top')
  })

  it('data-side 缺省 / 异常值回落 bottom', async () => {
    const { model } = createHarness({}, undefined)
    model.applyOpen(true)
    await nextTick()
    expect(model.placement.value).toBe('bottom')
  })

  it('syncPlacement 可手动调用（弹层被 reka 翻转后组件按需同步）', () => {
    const { model } = createHarness({}, 'top')
    model.syncPlacement()
    expect(model.placement.value).toBe('top')
  })
})
