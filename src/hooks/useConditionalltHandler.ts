import type { Ref } from 'vue'

export interface EventHandlerHookOptions {
  disabled?: Ref<boolean> | boolean
  preventDefault?: boolean
}

export const useConditionalltHandler = (emits: (...args: any[]) => any, options: EventHandlerHookOptions = {}) => {
  const { disabled = false, preventDefault = false } = options

  const handler = (e: string, ev: Event) => {
    if (unref(disabled)) {
      preventDefault && ev.preventDefault()
      return
    }
    emits(e, ev)
  }

  return { handler }
}
