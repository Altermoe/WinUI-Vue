import type { Ref } from 'vue'

export interface EventHandlerHookOptions {
  disabled?: Ref<boolean> | boolean
}

export const useConditionalltHandler = (emits: (...args: any[]) => any, options: EventHandlerHookOptions = {}) => {
  const { disabled = false } = options

  const handler = (e: string, ev: Event) => {
    if (unref(disabled))
      return
    emits(e, ev)
  }

  return { handler }
}
