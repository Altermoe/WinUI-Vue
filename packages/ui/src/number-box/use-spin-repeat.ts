/**
 * 增减按钮的长按重复（对应 WinUI `RepeatButton`，NumberBox 的 Up/Down 按钮就是它）。
 *
 * 口径（WinRT 文档：`RepeatButton.Delay` 与 `RepeatButton.Interval` 缺省都是 250ms）：
 *   按下立即触发一次 → 等待 Delay → 每 Interval 重复一次 → 抬起 / 移出 / 取消即停止。
 *
 * 抽成 hook 是为了：SSR 安全（setup 阶段不碰定时器）、可单测（假定时器即可覆盖时序）、
 * 内联按钮与紧凑弹层按钮共用同一份逻辑。
 */
import { getCurrentScope, onScopeDispose, ref } from 'vue'
import type { Ref } from 'vue'
import { SPIN_REPEAT_DELAY_MS, SPIN_REPEAT_INTERVAL_MS } from './constants'

export interface SpinRepeatOptions {
  /** 每次触发的动作 */
  onTrigger: () => void
  /** 判定当前是否不可用：返回 true 时不触发，且长按过程中一旦变为不可用立即停止 */
  isDisabled?: () => boolean
  /** 按下到开始重复的等待毫秒数 */
  delay?: number
  /** 重复间隔毫秒数 */
  interval?: number
}

export interface SpinRepeatController {
  /** 是否处于按下态（用于 `data-pressed` / `:active` 之外的视觉反馈） */
  pressed: Ref<boolean>
  /** 按下：立即触发一次并开启重复 */
  start: () => void
  /** 抬起 / 移出 / 取消：停止重复 */
  stop: () => void
}

export const useSpinRepeat = (options: SpinRepeatOptions): SpinRepeatController => {
  const pressed = ref(false)
  const delay = options.delay ?? SPIN_REPEAT_DELAY_MS
  const interval = options.interval ?? SPIN_REPEAT_INTERVAL_MS
  let delayTimer: ReturnType<typeof setTimeout> | undefined = undefined
  let intervalTimer: ReturnType<typeof setInterval> | undefined = undefined

  const stop = (): void => {
    if (delayTimer !== undefined) {
      clearTimeout(delayTimer)
      delayTimer = undefined
    }
    if (intervalTimer !== undefined) {
      clearInterval(intervalTimer)
      intervalTimer = undefined
    }
    pressed.value = false
  }

  const start = (): void => {
    stop()
    if (options.isDisabled?.() === true) {
      return
    }
    pressed.value = true
    options.onTrigger()
    delayTimer = setTimeout(() => {
      delayTimer = undefined
      intervalTimer = setInterval(() => {
        if (options.isDisabled?.() === true) {
          stop()
          return
        }
        options.onTrigger()
      }, interval)
    }, delay)
  }

  // 只有处于 effect scope 内才登记清理（脱离组件直接调用时也保持可用）
  if (getCurrentScope() !== undefined) {
    onScopeDispose(stop)
  }

  return { pressed, start, stop }
}
