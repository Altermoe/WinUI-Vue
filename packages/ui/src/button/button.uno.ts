import type { Preset } from 'unocss'

/**
 * Fluent Button 样式 preset
 *
 * 通过 UnoCSS shortcuts 将 Fluent Design 2 Button 规范封装为语义化类名。
 * 所有颜色/尺寸/圆角/间距均引用 Fluent 主题令牌，天然支持明/暗主题切换。
 *
 * 使用方式：
 *   <button class="fluent-btn-base fluent-btn-primary fluent-btn-md fluent-btn-rounded">
 *     ...
 *   </button>
 */
const buttonPreset: Preset = {
  name: 'unocss-preset-fluent-button',

  /* -------------------------------------------------------------------------- */
  /*                              自定义 Variants                                */
  /* -------------------------------------------------------------------------- */

  variants: [
    // Aria-pressed 状态（toggle button 使用）
    (matcher) => {
      if (!matcher.startsWith('aria-pressed:')) {
        return
      }
      return {
        matcher: matcher.slice('aria-pressed:'.length),
        selector: (str) => `${str}[aria-pressed="true"]`,
      }
    },
  ],

  /* -------------------------------------------------------------------------- */
  /*                               Shortcuts                                    */
  /* -------------------------------------------------------------------------- */

  shortcuts: {
    /* -------------------------------------------------------------------------- */
    /*                                   基础样式                                   */
    /* -------------------------------------------------------------------------- */

    'fluent-btn-base': [
      'inline-flex items-center justify-center gap-xs',
      'font-medium text-base-300',
      'border border-solid',
      'cursor-pointer select-none',
      'transition-colors duration-fast ease-easy-ease',
      'outline-none',
      'focus-visible:outline-2 focus-visible:outline-brand-stroke1 focus-visible:outline-offset-2',
      'disabled:cursor-not-allowed',
    ].join(' '),

    /* -------------------------------------------------------------------------- */
    /*                                 五种外观变体                                 */
    /* -------------------------------------------------------------------------- */

    // --- Primary 主按钮 ---
    'fluent-btn-primary': [
      'bg-brand-background',
      'text-neutral-foreground-on-brand',
      'border-transparent',
      'hover:bg-brand-background-hover',
      'active:bg-brand-background-pressed',
      'aria-pressed:bg-brand-background-selected',
      'disabled:bg-neutral-background-disabled',
      'disabled:text-neutral-foreground-disabled',
      'disabled:border-transparent',
    ].join(' '),

    // --- Secondary 次按钮（默认）---
    'fluent-btn-secondary': [
      'bg-neutral-background1',
      'text-neutral-foreground1',
      'border-neutral-stroke1',
      'hover:bg-neutral-background1-hover',
      'active:bg-neutral-background1-pressed',
      'aria-pressed:bg-neutral-background1-selected',
      'disabled:bg-neutral-background-disabled',
      'disabled:text-neutral-foreground-disabled',
      'disabled:border-neutral-stroke-disabled',
    ].join(' '),

    // --- Outline 描边按钮 ---
    'fluent-btn-outline': [
      'bg-transparent-background',
      'text-neutral-foreground1',
      'border-neutral-stroke1',
      'hover:bg-neutral-background1-hover',
      'active:bg-neutral-background1-pressed',
      'aria-pressed:bg-neutral-background1-selected',
      'disabled:bg-transparent-background',
      'disabled:text-neutral-foreground-disabled',
      'disabled:border-neutral-stroke-disabled',
    ].join(' '),

    // --- Subtle 微妙按钮 ---
    'fluent-btn-subtle': [
      'bg-subtle-background',
      'text-neutral-foreground1',
      'border-transparent-stroke',
      'hover:bg-subtle-background-hover',
      'active:bg-subtle-background-pressed',
      'aria-pressed:bg-subtle-background-selected',
      'disabled:bg-transparent-background',
      'disabled:text-neutral-foreground-disabled',
      'disabled:border-transparent-stroke-disabled',
    ].join(' '),

    // --- Transparent 透明按钮 ---
    'fluent-btn-transparent': [
      'bg-transparent-background',
      'text-neutral-foreground1',
      'border-transparent-stroke',
      'hover:bg-transparent-background-hover',
      'active:bg-transparent-background-pressed',
      'aria-pressed:bg-transparent-background-selected',
      'disabled:bg-transparent-background',
      'disabled:text-neutral-foreground-disabled',
      'disabled:border-transparent-stroke-disabled',
    ].join(' '),

    /* -------------------------------------------------------------------------- */
    /*                                    尺寸                                     */
    /* -------------------------------------------------------------------------- */

    'fluent-btn-sm': ['text-base-200', 'px-s py-xs'].join(' '),

    'fluent-btn-md': ['text-base-300', 'px-m py-s'].join(' '),

    'fluent-btn-lg': ['text-base-400', 'px-l py-m'].join(' '),

    // 纯图标模式下的内边距覆盖（方形等边长）
    'fluent-btn-icon-only-sm': 'p-xs',
    'fluent-btn-icon-only-md': 'p-s',
    'fluent-btn-icon-only-lg': 'p-m',

    // 内部图标尺寸
    'fluent-btn-icon-sm': 'w-4 h-4',
    'fluent-btn-icon-md': 'w-5 h-5',
    'fluent-btn-icon-lg': 'w-6 h-6',

    /* -------------------------------------------------------------------------- */
    /*                                    形状                                     */
    /* -------------------------------------------------------------------------- */

    'fluent-btn-rounded': 'rounded-medium',
    'fluent-btn-circular': 'rounded-circular',
    'fluent-btn-square': 'rounded-none',

    /* -------------------------------------------------------------------------- */
    /*                                 纯图标模式                                  */
    /* -------------------------------------------------------------------------- */

    'fluent-btn-icon-only': ['p-0', 'aspect-square'].join(' '),

    /* -------------------------------------------------------------------------- */
    /*                                   块级模式                                  */
    /* -------------------------------------------------------------------------- */

    'fluent-btn-block': 'w-full',

    /* -------------------------------------------------------------------------- */
    /*                                 图标位置                                    */
    /* -------------------------------------------------------------------------- */

    'fluent-btn-icon-after': 'order-1',

    /* -------------------------------------------------------------------------- */
    /*                                   内容元素                                  */
    /* -------------------------------------------------------------------------- */

    'fluent-btn-content': 'truncate',
  },
}

export default buttonPreset
