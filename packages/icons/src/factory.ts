import { createVNode, defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { FluentIconStyle } from '../generated/names'

/** 图标工厂入参（由生成器 scripts/sync-icons.mjs 产出的每个图标组件传入）。 */
interface FluentIconOptions {
  /** 图标名（下划线小写，如 'access_time'），会写入 `data-icon-name` */
  name: string
  /** 原生设计尺寸（px） */
  size: number
  style: FluentIconStyle
  /** 一个或多个 SVG `<path>` 的 d 数据 */
  paths: string[]
}

/** 图标组件对外 Props。另外透传所有 attrs 到根 `<svg>`（含 class / style / aria-label 等）。 */
interface FluentIconProps {
  /** 渲染尺寸（px）。默认等于图标原生设计尺寸，放大请按 2 的倍数避免糊 */
  size?: number | string
  /** 无障碍标题；提供后渲染 `<title>` 并将 `role` 置为 `img` */
  title?: string
}

interface RenderConfig {
  name: string
  nativeSize: number
  viewBox: string
  paths: string[]
}

const pascalCase = (name: string): string =>
  name
    .split('_')
    .map((part) => part.replace(/^./, (char) => char.toUpperCase()))
    .join('')

const iconAria = (
  props: FluentIconProps,
  attrs: Record<string, unknown>,
): { labelled: boolean; ariaHidden: string | undefined; role: unknown } => {
  const labelled = props.title !== undefined || attrs['aria-label'] !== undefined
  if (labelled) {
    return { labelled, ariaHidden: undefined, role: 'img' }
  }
  return { labelled, ariaHidden: 'true', role: attrs.role }
}

const renderIcon = (
  props: FluentIconProps,
  attrs: Record<string, unknown>,
  config: RenderConfig,
): ReturnType<typeof createVNode> => {
  const { ariaHidden, role } = iconAria(props, attrs)
  const renderSize = props.size ?? config.nativeSize
  // oxlint-disable-next-line id-length -- d 为 SVG <path> 属性名
  const children = config.paths.map((pathData) => createVNode('path', { d: pathData }))
  if (props.title !== undefined) {
    children.unshift(createVNode('title', undefined, props.title))
  }
  return createVNode(
    'svg',
    {
      ...attrs,
      'width': renderSize,
      'height': renderSize,
      'viewBox': config.viewBox,
      'fill': 'currentColor',
      'data-icon-name': config.name,
      'focusable': 'false',
      role,
      'aria-hidden': ariaHidden,
    },
    children,
  )
}

/**
 * 由生成器调用的图标组件工厂：返回一个渲染内联 SVG 的 Vue 组件，
 * 使用 `fill="currentColor"` 随主题/文本色变色，默认尺寸为图标原生设计尺寸。
 */
export const createFluentIcon = (options: FluentIconOptions) => {
  const { name, size: nativeSize, style, paths } = options
  const viewBox = `0 0 ${nativeSize} ${nativeSize}`
  const styleSuffix = style.replace(/^./, (char) => char.toUpperCase())

  return defineComponent({
    name: `FluentIcon${pascalCase(name)}${nativeSize}${styleSuffix}`,
    inheritAttrs: false,
    props: {
      size: { type: [Number, String] as PropType<number | string>, default: nativeSize },
      title: { type: String, default: undefined },
    },
    setup(props, { attrs }) {
      return () => renderIcon(props, attrs, { name, nativeSize, viewBox, paths })
    },
  })
}

export type { FluentIconOptions, FluentIconProps }
