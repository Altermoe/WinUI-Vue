<script lang="ts">
import type { Component } from 'vue'

/**
 * Fluent Button 组件 Props 契约
 *
 * 设计规范来源：Fluent Design 2 — Button & Toggle button
 *
 * 变体 (appearance)：
 * - primary    主按钮：品牌色填充，用于主要行动点
 * - secondary  次按钮（默认）：中性填充，最常用
 * - outline    描边按钮：透明背景 + 边框
 * - subtle     微妙按钮：极低对比度背景，用于工具栏等
 * - transparent 透明按钮：完全透明背景，仅悬停时有反馈
 *
 * 尺寸 (size)：small / medium (默认) / large
 *
 * 形状 (shape)：
 * - rounded  圆角（默认）
 * - circular 圆形 / 全圆角
 * - square   直角
 *
 * 内容模式：
 * - 纯文本：默认
 * - 图标 + 文本：设置 icon 属性
 * - 纯图标：设置 icon + iconOnly
 *
 * 状态：rest / hover / pressed / selected / focus / disabled
 * - selected 同时作为 toggle button 的受控状态
 */
export interface FluentButtonProps {
  /**
   * 按钮外观变体
   * @default 'secondary'
   */
  appearance?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'transparent'

  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * 按钮形状
   * @default 'rounded'
   */
  shape?: 'rounded' | 'circular' | 'square'

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否为选中状态（Toggle button 模式）
   * @default false
   */
  selected?: boolean

  /**
   * 是否块级显示（占满父容器宽度）
   * @default false
   */
  block?: boolean

  /**
   * 原生 button 类型
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'

  /**
   * 图标组件（如 @fluentui/svg-icons 中的图标）
   */
  icon?: Component

  /**
   * 图标位置（文本 + 图标模式下生效）
   * @default 'before'
   */
  iconPosition?: 'before' | 'after'

  /**
   * 是否仅显示图标（圆形紧凑模式）
   * @default false
   */
  iconOnly?: boolean
}
</script>

<script setup lang="ts" generic="TIcon extends Component = Component">
import { computed } from 'vue'

const props = withDefaults(defineProps<FluentButtonProps>(), {
  appearance: 'secondary',
  size: 'medium',
  shape: 'rounded',
  disabled: false,
  selected: false,
  block: false,
  type: 'button',
  iconPosition: 'before',
  iconOnly: false,
})

const appearanceClassMap: Record<NonNullable<FluentButtonProps['appearance']>, string> = {
  primary: 'fluent-btn-primary',
  secondary: 'fluent-btn-secondary',
  outline: 'fluent-btn-outline',
  subtle: 'fluent-btn-subtle',
  transparent: 'fluent-btn-transparent',
}

const sizeClassMap: Record<NonNullable<FluentButtonProps['size']>, string> = {
  small: 'fluent-btn-sm',
  medium: 'fluent-btn-md',
  large: 'fluent-btn-lg',
}

const shapeClassMap: Record<NonNullable<FluentButtonProps['shape']>, string> = {
  rounded: 'fluent-btn-rounded',
  circular: 'fluent-btn-circular',
  square: 'fluent-btn-square',
}

const iconSizeClassMap: Record<NonNullable<FluentButtonProps['size']>, string> = {
  small: 'fluent-btn-icon-sm',
  medium: 'fluent-btn-icon-md',
  large: 'fluent-btn-icon-lg',
}

const iconOnlySizeClassMap: Record<NonNullable<FluentButtonProps['size']>, string> = {
  small: 'fluent-btn-icon-only-sm',
  medium: 'fluent-btn-icon-only-md',
  large: 'fluent-btn-icon-only-lg',
}

const buttonClass = computed(() => [
  'fluent-btn-base',
  appearanceClassMap[props.appearance],
  sizeClassMap[props.size],
  shapeClassMap[props.shape],
  {
    'fluent-btn-icon-only': props.iconOnly,
    [iconOnlySizeClassMap[props.size]]: props.iconOnly,
    'fluent-btn-block': props.block,
  },
])

const iconClass = computed(() => [
  iconSizeClassMap[props.size],
  {
    'fluent-btn-icon-after': props.iconPosition === 'after' && !props.iconOnly,
  },
])

defineOptions({
  name: 'FluentButton',
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-pressed="selected || undefined"
    :class="buttonClass"
  >
    <slot name="icon">
      <component
        v-if="icon"
        :is="icon"
        :class="iconClass"
      />
    </slot>

    <span
      v-if="!iconOnly"
      class="fluent-btn-content"
    >
      <slot />
    </span>
  </button>
</template>
