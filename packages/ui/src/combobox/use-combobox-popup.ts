/**
 * Combobox 展开层：面板开合状态（受控 / 非受控）+ 弹层落点同步。
 *
 * - 受控（传了 open）：展开状态的事实源在父级，本层只把变更向上抛出；
 * - 非受控：本地 localOpen 持有事实源，defaultOpen 只作为初值；
 * - 展开后的收尾（收回焦点 / 高亮选中项）由组件通过 `afterOpen` 接上 DOM，
 *   落点（reka 写在内容元素上的 data-side）由 `getPopupElement` 读回，
 *   本层只负责时序：展开 → afterOpen → 落点同步（对应 WinUI KeepInteriorCornersSquare）。
 *
 * 只依赖 computed / ref，不依赖组件实例，可直接在测试里调用。
 */
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

/** 本层用到的 props 视图（undefined = 非受控） */
export interface ComboboxPopupProps {
  /** 面板是否展开（v-model:open） */
  open?: boolean
  /** 非受控初始展开状态 */
  defaultOpen?: boolean
}

/** 本层向上触发的具名事件 */
export interface ComboboxPopupEvents {
  /** 展开状态变化（对应 update:open） */
  openChange: (value: boolean) => void
  /** 面板展开（对应 WinUI `DropDownOpened`） */
  dropDownOpened: () => void
  /** 面板收起（对应 WinUI `DropDownClosed`） */
  dropDownClosed: () => void
}

/** 本层依赖的 DOM 回调（组件用 template ref 接上） */
export interface ComboboxPopupDeps {
  /** 展开后的收尾：收回焦点、高亮选中项（reka 只在自身 onOpenChange 里做） */
  afterOpen: () => void | Promise<void>
  /** 弹层内容元素（reka 在其上写 data-side），供落点同步 */
  getPopupElement: () => HTMLElement | null
}

/** 展开层对外暴露的状态与回调 */
export interface ComboboxPopupModel {
  /** 面板是否展开：受控取 props.open，非受控取本地状态 */
  isOpen: ComputedRef<boolean>
  /** 弹层实际落点（决定可编辑态是否把相邻圆角切平） */
  placement: Ref<'bottom' | 'top'>
  /** 从弹层内容元素读回落点 */
  syncPlacement: () => void
  /** 切换 / 写入展开状态（唯一入口，补齐 reka 在 onOpenChange 里的动作） */
  applyOpen: (value: boolean) => void
}

export const useComboboxPopup = (
  props: ComboboxPopupProps,
  events: ComboboxPopupEvents,
  deps: ComboboxPopupDeps,
): ComboboxPopupModel => {
  const localOpen = ref(props.defaultOpen ?? false)
  const isOpen = computed(() => (props.open === undefined ? localOpen.value : props.open))

  const placement = ref<'bottom' | 'top'>('bottom')

  const syncPlacement = (): void => {
    const side = deps.getPopupElement()?.dataset.side
    placement.value = side === 'top' ? 'top' : 'bottom'
  }

  const applyOpen = (value: boolean): void => {
    if (value === isOpen.value) {
      return
    }
    if (props.open === undefined) {
      localOpen.value = value
    }
    events.openChange(value)
    if (value) {
      events.dropDownOpened()
      void (async () => {
        await deps.afterOpen()
        syncPlacement()
      })()
      return
    }
    events.dropDownClosed()
  }

  return { isOpen, placement, syncPlacement, applyOpen }
}
