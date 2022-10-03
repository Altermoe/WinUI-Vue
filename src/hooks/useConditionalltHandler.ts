import type { Ref } from 'vue'

export interface EventHandlerHookOptions<T extends Event = Event> {
  disabled?: Ref<boolean> | boolean
  preventDefault?: boolean
  onClick?: (ev: T) => void
}

export const useConditionalltHandler = <T extends Event>(emits: (...args: any[]) => any, options: EventHandlerHookOptions<T> = {}) => {
  const { disabled = false, preventDefault = false, onClick } = options

  const handler = (e: string, ev: Event) => {
    if (unref(disabled)) {
      preventDefault && ev.preventDefault()
      return
    }
    onClick?.(ev as T)
    emits(e, ev)
  }

  return { handler }
}
