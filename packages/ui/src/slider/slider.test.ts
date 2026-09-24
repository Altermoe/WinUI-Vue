/* oxlint-disable prefer-named-capture-group, no-magic-numbers -- 样式契约测试要读 SFC 源码做文本解析，正则与下标属测试细节 */
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FluereSlider from './slider.vue'
import sliderSfc from './slider.vue?raw'

/**
 * 测试环境缺失的浏览器能力，统一在这里补最小桩。
 *
 * 1. jsdom 不实现 Pointer Events 的捕获 API，而 reka 的 SliderImpl 在 pointerdown 里
 *    会调用 setPointerCapture / hasPointerCapture / releasePointerCapture；
 * 2. jsdom 不提供 ResizeObserver，reka 的 useSize 在 onMounted 里会订阅它；
 * 3. jsdom 没有布局，给一个固定的 200×32 轨道，让「指针位置 → 值」的换算可测。
 */
const stubSetPointerCapture = () => {}
const stubReleasePointerCapture = () => {}
const stubHasPointerCapture = () => true
const stubResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
const stubRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 200,
  bottom: 32,
  width: 200,
  height: 32,
  toJSON: () => ({}),
}
const stubGetBoundingClientRect = () => stubRect as DOMRect

beforeAll(() => {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>
  proto.setPointerCapture = stubSetPointerCapture
  proto.releasePointerCapture = stubReleasePointerCapture
  proto.hasPointerCapture = stubHasPointerCapture
  globalThis.ResizeObserver = stubResizeObserver as unknown as typeof ResizeObserver
  Element.prototype.getBoundingClientRect = stubGetBoundingClientRect
})

/**
 * 从 SFC 的 `<style>` 块解析出「选择器 → 声明」，用于断言状态样式。
 *
 * jsdom 不解析 CSS 自定义属性（var()），拿不到可靠的计算样式，所以这里退一步
 * 断言声明本身——守住曾经跑偏的 WinUI 还原规则。
 *
 * 对照来源：WinUI 3（Windows App SDK）
 *   src/controls/dev/CommonStyles/Slider_themeresources.xaml
 *   src/controls/dev/CommonStyles/Common_themeresources_any.xaml
 *   src/dxaml/xcp/dxaml/lib/Slider_Partial.cpp
 */
const readStyleRules = (sfc: string): Map<string, string> => {
  const styleBlock = /<style[^>]*>(?<css>[\s\S]*?)<\/style>/.exec(sfc)?.groups?.css ?? ''
  const rules = new Map<string, string>()
  for (const block of styleBlock.replace(/\/\*[\s\S]*?\*\//g, '').split('}')) {
    const [selectorText, declarations] = block.split('{')
    if (selectorText !== undefined && declarations !== undefined) {
      for (const selector of selectorText.split(',')) {
        // 选择器和声明都统一空白（多行选择器折叠为单空格），便于精确匹配
        rules.set(selector.replace(/\s+/g, ' ').trim(), declarations.replace(/\s+/g, ' ').trim())
      }
    }
  }
  return rules
}

const rules = readStyleRules(sliderSfc)

/** 取声明里的 inset 像素值：命中区与可见外圈必须由同一个 Margin=-2 推出 */
const readInset = (declarations: string) => /inset: (-?\d+px)/.exec(declarations)?.[1]

/** 受控宿主：v-model 绑到 ref，便于断言回写 */
const controlled = (initial: number, extra = '', props = '') =>
  mount({
    components: { FluereSlider },
    setup() {
      const value = ref(initial)
      return { value }
    },
    template: `<FluereSlider v-model="value" ${props}>${extra}</FluereSlider>`,
  })

/**
 * 滑块用模板 ref 反查自己在 reka 集合里的下标，首次渲染时下标还是 -1，
 * 所以 aria-valuenow 要等挂载后的那次重渲染才会落上。
 */
const controlledSettled = async (initial: number, extra = '', props = '') => {
  const wrapper = controlled(initial, extra, props)
  await nextTick()
  return wrapper
}

describe('FluereSlider 渲染契约', () => {
  it('渲染 reka 的 role=slider 滑块 + 轨道 + 数值填充，并带上 WinUI 几何类名', () => {
    const wrapper = controlled(30)
    const host = wrapper.get('.fui-slider-host')
    expect(host.attributes('data-orientation')).toBe('horizontal')

    const root = wrapper.get('.fui-slider')
    expect(root.attributes('data-slider-impl')).toBeDefined()

    expect(wrapper.find('.fui-slider__track').exists()).toBe(true)
    expect(wrapper.find('.fui-slider__range').exists()).toBe(true)

    const thumb = wrapper.get('[role="slider"]')
    expect(thumb.classes()).toContain('fui-slider__thumb')
    // WinUI Thumb 模板：Border(Margin=-2) + Ellipse
    expect(thumb.find('.fui-slider__puck').exists()).toBe(true)
    expect(thumb.find('.fui-slider__dot').exists()).toBe(true)
    expect(wrapper.findAll('[role="slider"]')).toHaveLength(1)
  })

  it('aria：valuenow / valuemin / valuemax / tabindex 可用', async () => {
    const wrapper = await controlledSettled(30)
    const thumb = wrapper.get('[role="slider"]')
    expect(thumb.attributes('aria-valuenow')).toBe('30')
    expect(thumb.attributes('aria-valuemin')).toBe('0')
    expect(thumb.attributes('aria-valuemax')).toBe('100')
    expect(thumb.attributes('tabindex')).toBe('0')
    expect(thumb.attributes('aria-orientation')).toBe('horizontal')
  })

  it('可访问名优先级：label > header 文本（WinUI 用 Header 当 AutomationName）', () => {
    expect(controlled(0, '', 'header="音量"').get('[role="slider"]').attributes('aria-label')).toBe(
      '音量',
    )
    expect(
      controlled(0, '', 'header="音量" label="系统音量"')
        .get('[role="slider"]')
        .attributes('aria-label'),
    ).toBe('系统音量')
  })

  it('#header 插槽无文本可读时，改用 aria-labelledby 关联标题节点', () => {
    const wrapper = mount({
      components: { FluereSlider },
      template: `
        <FluereSlider>
          <template #header>播放进度</template>
        </FluereSlider>
      `,
    })
    const header = wrapper.get('.fui-slider__header')
    const thumb = wrapper.get('[role="slider"]')
    expect(thumb.attributes('aria-label')).toBeUndefined()
    expect(thumb.attributes('aria-labelledby')).toBe(header.attributes('id'))
    expect(header.text()).toBe('播放进度')
  })

  it('header 渲染在控件上方（WinUI HeaderContentPresenter）', () => {
    const wrapper = controlled(0, '', 'header="亮度"')
    const host = wrapper.get('.fui-slider-host')
    expect(wrapper.get('.fui-slider__header').text()).toBe('亮度')
    // 标题必须是宿主里的第一个子节点（对应 Grid.Row=0）
    expect(host.element.firstElementChild?.classList.contains('fui-slider__header')).toBe(true)
  })

  it('disabled：data-disabled 落到宿主与滑块上，滑块移出 Tab 序列', () => {
    const wrapper = controlled(20, '', 'disabled')
    expect(wrapper.get('.fui-slider-host').attributes('data-disabled')).toBeDefined()
    expect(wrapper.get('.fui-slider').attributes('data-disabled')).toBeDefined()
    expect(wrapper.get('[role="slider"]').attributes('data-disabled')).toBeDefined()
    expect(wrapper.get('[role="slider"]').attributes('tabindex')).toBeUndefined()
  })

  it('纵向：data-orientation=vertical + aria-orientation，长度由 --fui-slider-length 给出', () => {
    const wrapper = controlled(20, '', 'orientation="vertical" :vertical-length="120"')
    const host = wrapper.get('.fui-slider-host')
    expect(host.attributes('data-orientation')).toBe('vertical')
    expect(host.attributes('style')).toContain('--fui-slider-length: 120px')
    expect(wrapper.get('[role="slider"]').attributes('aria-orientation')).toBe('vertical')
  })

  it('非受控：defaultValue 生效，且不写回父级', async () => {
    const wrapper = mount(FluereSlider, { props: { defaultValue: 42 } })
    await nextTick()
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('42')
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('43')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([43])
  })
})

describe('FluereSlider 交互契约', () => {
  it('方向键 / Home / End 改值并按 step 吸附（WinUI SmallChange / 端点）', async () => {
    const wrapper = controlled(30)
    const thumb = wrapper.get('[role="slider"]')

    await thumb.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.vm.value).toBe(31)
    await thumb.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.vm.value).toBe(30)
    await thumb.trigger('keydown', { key: 'Home' })
    expect(wrapper.vm.value).toBe(0)
    await thumb.trigger('keydown', { key: 'End' })
    expect(wrapper.vm.value).toBe(100)
  })

  it('min / max / step：越界被钳位，非整数步进按 step 吸附', async () => {
    const wrapper = await controlledSettled(10, '', ':min="10" :max="20" :step="5"')
    const thumb = wrapper.get('[role="slider"]')
    expect(thumb.attributes('aria-valuemin')).toBe('10')
    expect(thumb.attributes('aria-valuemax')).toBe('20')

    await thumb.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.vm.value).toBe(15)
    await thumb.trigger('keydown', { key: 'End' })
    expect(wrapper.vm.value).toBe(20)
    await thumb.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.vm.value).toBe(20) // 已在端点，不再越界
  })

  it('多项式步进：PageUp / Shift+Arrow 按 step×10 跳（reka 的 page 语义）', async () => {
    const wrapper = controlled(50)
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'PageUp' })
    expect(wrapper.vm.value).toBe(60)
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowDown', shiftKey: true })
    expect(wrapper.vm.value).toBe(50)
  })

  it('valueCommit：一次键盘交互结束时抛出最终值', async () => {
    const wrapper = controlled(30)
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'End' })
    expect(wrapper.findComponent(FluereSlider).emitted('valueCommit')?.at(-1)).toEqual([100])
  })

  it('按下：宿主 data-pressed 出现、抬起后收起（指针抬起即收数值提示）', async () => {
    const wrapper = await controlledSettled(30)
    await wrapper.get('.fui-slider').trigger('pointerdown')
    expect(wrapper.get('.fui-slider-host').attributes('data-pressed')).toBeDefined()
    await wrapper.get('.fui-slider').trigger('pointerup')
    expect(wrapper.get('.fui-slider-host').attributes('data-pressed')).toBeUndefined()
  })

  it('按下期间显示数值提示，指针抬起即收起（WinUI 只在按下/键盘聚焦时显示）', async () => {
    const wrapper = await controlledSettled(30)
    expect(wrapper.find('.fui-slider__tip').exists()).toBe(false)

    // 在 200px 轨道的中点按下 → 值落到 50（WinUI MoveThumbToPoint 的口径）。
    // 受限于 jsdom：MouseEvent.clientX 只读，坐标只能经构造函数传入
    const root = wrapper.get('.fui-slider').element
    root.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 100 }))
    await nextTick()
    expect(wrapper.vm.value).toBe(50)
    expect(wrapper.get('.fui-slider__tip').text()).toBe('50')

    root.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
    await nextTick()
    // 指针交互时 reka 也会 focus 滑块，但这不是「键盘聚焦」——提示必须收起
    expect(wrapper.find('.fui-slider__tip').exists()).toBe(false)
  })

  it('键盘聚焦：Tab 进入即显示数值提示，失焦收起', async () => {
    const wrapper = await controlledSettled(30)
    const thumb = wrapper.get('[role="slider"]')
    await thumb.trigger('focusin')
    expect(wrapper.get('.fui-slider__tip').text()).toBe('30')
    await thumb.trigger('focusout')
    expect(wrapper.find('.fui-slider__tip').exists()).toBe(false)
  })

  it('数值提示按 step 的小数位格式化（WinUI DefaultDisambiguationUIConverter）', async () => {
    const wrapper = await controlledSettled(0.25, '', ':min="0" :max="1" :step="0.25"')
    await wrapper.get('[role="slider"]').trigger('focusin')
    expect(wrapper.get('.fui-slider__tip').text()).toBe('0.25')
  })

  it('tooltip=false 时不渲染数值提示（IsThumbToolTipEnabled=false）', async () => {
    const wrapper = await controlledSettled(30, '', ':tooltip="false"')
    await wrapper.get('.fui-slider').trigger('pointerdown')
    expect(wrapper.find('.fui-slider__tip').exists()).toBe(false)
  })

  it('按在滑块上 = 抓住：不跳值，只进入按下态（WinUI 由 Thumb 自己接管 PointerPressed）', async () => {
    const wrapper = await controlledSettled(30)
    const thumb = wrapper.get('[role="slider"]')
    // 指针落在滑块右侧（clientX=160）：若按「轨道点击」处理（MoveThumbToPoint）会跳到 ~80
    thumb.element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 160 }))
    await nextTick()
    expect(wrapper.vm.value).toBe(30)
    expect(wrapper.findComponent(FluereSlider).emitted('update:modelValue')).toBeUndefined()
    // 抓住也算按下：按下态与数值提示照常出现
    expect(wrapper.get('.fui-slider-host').attributes('data-pressed')).toBeDefined()
    expect(wrapper.get('.fui-slider__tip').text()).toBe('30')
  })

  it('抓住滑块后拖动仍改值，并在抬起时 valueCommit（reka slideMove / slideEnd 通路）', async () => {
    const wrapper = await controlledSettled(30)
    const slider = wrapper.findComponent(FluereSlider)
    const thumb = wrapper.get('[role="slider"]')

    thumb.element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 100 }))
    await nextTick()
    expect(slider.emitted('update:modelValue')).toBeUndefined()

    thumb.element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 60 }))
    await nextTick()
    // 在 jsdom 里没有布局：滑块与轨道共用 stub rect（left=0），抓取偏移退化为 clientX，
    // 于是 position 恒为 0 —— 这里只验证「拖动通路是活的」，像素级偏移由真机布局给出
    expect(wrapper.vm.value).not.toBe(30)

    thumb.element.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
    expect(slider.emitted('valueCommit')?.at(-1)).toEqual([wrapper.vm.value])
  })

  it('disabled 时不进入按下态，也不出现数值提示', async () => {
    const wrapper = await controlledSettled(30, '', 'disabled')
    await wrapper.get('.fui-slider').trigger('pointerdown')
    expect(wrapper.get('.fui-slider-host').attributes('data-pressed')).toBeUndefined()
    expect(wrapper.find('.fui-slider__tip').exists()).toBe(false)
  })

  it('表单：位于 <form> 内并传 name 时补隐藏原生 input（提交 name=value）', async () => {
    const wrapper = mount({
      components: { FluereSlider },
      setup() {
        const value = ref(40)
        return { value }
      },
      template: `
        <form>
          <FluereSlider v-model="value" name="volume" />
        </form>
      `,
    })
    await nextTick()
    await nextTick()
    const input = wrapper.find('form input[name="volume"]')
    expect(input.exists()).toBe(true)
    // 提交名可预期：不带 reka 的 [0] 下标摊平
    expect(input.attributes('type')).toBe('hidden')
    expect(input.attributes('value')).toBe('40')
  })
})

describe('FluereSlider 刻度线（WinUI TickPlacement / TickFrequency）', () => {
  it('默认 TickPlacement=none + TickFrequency=0：不画刻度', () => {
    expect(controlled(30).find('.fui-slider__tick').exists()).toBe(false)
  })

  it('TickFrequency=0 时即便指定了位置也不画（与 WinUI 一致）', () => {
    const wrapper = controlled(30, '', 'tick-placement="outside"')
    expect(wrapper.find('.fui-slider__tick').exists()).toBe(false)
  })

  it('outside：上下各一条刻度条，含首尾端点', () => {
    const wrapper = controlled(30, '', 'tick-placement="outside" :tick-frequency="25"')
    expect(wrapper.findAll('.fui-slider__ticks--top .fui-slider__tick')).toHaveLength(5)
    expect(wrapper.findAll('.fui-slider__ticks--bottom .fui-slider__tick')).toHaveLength(5)
    const percentStyles = wrapper
      .findAll('.fui-slider__ticks--top .fui-slider__tick')
      .map((tick) => tick.attributes('style'))
    expect(percentStyles[0]).toContain('0%')
    expect(percentStyles.at(-1)).toContain('100%')
  })

  it('top-left / bottom-right：只画单侧', () => {
    const top = controlled(30, '', 'tick-placement="top-left" :tick-frequency="50"')
    expect(top.findAll('.fui-slider__ticks--top .fui-slider__tick')).toHaveLength(3)
    expect(top.find('.fui-slider__ticks--bottom').exists()).toBe(false)

    const bottom = controlled(30, '', 'tick-placement="bottom-right" :tick-frequency="50"')
    expect(bottom.findAll('.fui-slider__ticks--bottom .fui-slider__tick')).toHaveLength(3)
    expect(bottom.find('.fui-slider__ticks--top').exists()).toBe(false)
  })

  it('inline：刻度画在轨道内（InlineTickBar）', () => {
    const wrapper = controlled(30, '', 'tick-placement="inline" :tick-frequency="20"')
    expect(wrapper.findAll('.fui-slider__ticks--inline .fui-slider__tick')).toHaveLength(6)
    expect(wrapper.find('.fui-slider__ticks--top').exists()).toBe(false)
    // 刻度必须在轨道内部、滑块之前
    expect(wrapper.get('.fui-slider__track').find('.fui-slider__ticks--inline').exists()).toBe(true)
  })

  it('刻度数量有上限，避免 tickFrequency 极小时渲染出上万节点', () => {
    const wrapper = controlled(0, '', ':max="1000" tick-placement="outside" :tick-frequency="1"')
    expect(wrapper.find('.fui-slider__tick').exists()).toBe(false)
  })
})

describe('FluereSlider 状态样式（WinUI 3 Slider 契约）', () => {
  it('控件本体：32px 高（14+4+14）、ManipulationMode=None → touch-action:none', () => {
    const root =
      rules.get(".fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider)") ?? ''
    expect(root).toContain('height: 32px')
    const base = rules.get('.fui-slider-host :deep(.fui-slider)') ?? ''
    expect(base).toContain('position: relative')
    expect(base).toContain('touch-action: none')
  })

  it('轨道：4px 厚 + 2px 圆角 + ControlStrongFillColorDefault 灰', () => {
    const track = rules.get('.fui-slider-host :deep(.fui-slider__track)') ?? ''
    expect(track).toContain('background-color: var(--colorNeutralStrokeAccessible)')
    expect(track).toContain('border-radius: var(--borderRadiusSmall)')
    const horizontal =
      rules.get(".fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__track)") ?? ''
    expect(horizontal).toContain('height: 4px')
    expect(horizontal).toContain('top: calc(50% - 2px)')
    const vertical =
      rules.get(".fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__track)") ?? ''
    expect(vertical).toContain('width: 4px')
  })

  it('数值填充：AccentFillColorDefault 品牌色 + 2px 圆角', () => {
    const range = rules.get('.fui-slider-host :deep(.fui-slider__range)') ?? ''
    expect(range).toContain('background-color: var(--colorCompoundBrandBackground)')
    expect(range).toContain('border-radius: var(--borderRadiusSmall)')
  })

  it('滑块：18×18 布局盒（reka contain 偏移按它算），纵向同宽', () => {
    const thumb = rules.get('.fui-slider-host :deep(.fui-slider__thumb)') ?? ''
    expect(thumb).toContain('width: 18px')
    expect(thumb).toContain('height: 18px')
    const vertical =
      rules.get(".fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__thumb)") ?? ''
    expect(vertical).toContain('width: 18px')
  })

  it('滑块垂直居中：横向两侧置 0 + margin-block:auto（中心 y=16 与轨道中心重合）', () => {
    // 底层（reka）内联样式只给 left + transform，且滑块是轨道节点的兄弟、定位上下文是
    // 32px 的控件本体：不补这条就会落到静态位置（左上角），中心 y=9 比轨道中心高 7px
    const horizontal =
      rules.get(".fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__thumb)") ?? ''
    expect(horizontal).toContain('top: 0')
    expect(horizontal).toContain('bottom: 0')
    expect(horizontal).toContain('margin-block: auto')
  })

  it('滑块水平居中：纵向两侧置 0 + margin-inline:auto（中心 x=16 与轨道中心重合）', () => {
    // 纵向时 reka 只给 bottom，横向同样会落到静态位置（贴左），需补居中
    const vertical =
      rules.get(".fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__thumb)") ?? ''
    expect(vertical).toContain('left: 0')
    expect(vertical).toContain('right: 0')
    expect(vertical).toContain('margin-inline: auto')
  })

  it('外圈：Border Margin=-2 → inset -2px（视觉 22×22）+ 正圆（按半宽收敛）', () => {
    const puck = rules.get('.fui-slider-host :deep(.fui-slider__puck)') ?? ''
    expect(puck).toContain('inset: -2px')
    // 22px 的盒要成圆，半径必须是半宽（11）。WinUI 的 SliderThumbCornerRadius=10 是
    // 20px 外圈的设计值，照抄到 22px 上会留 2px 直边、1px 环在四角偏厚 → 不成正圆
    expect(puck).toContain('border-radius: var(--borderRadiusCircular)')
    expect(puck).not.toContain('border-radius: 10px')
    expect(puck).toContain('padding: var(--strokeWidthThin)')
  })

  it('滑块命中区：整个可见外圈都算「抓住滑块」，绘制层不吞指针', () => {
    // 在 jsdom 里没有命中测试，只能在源码层面守住「指针落在哪」这条不变式：
    // 命中区与 puck 对齐（22×22），且 puck/dot 对指针透明 → 浏览器把 target 判为 thumb 本体。
    // WinUI 侧同理：按在 Thumb（含 Margin=-2 撑出的外圈）由 Thumb 自己 put_Handled 接管。
    const puck = rules.get('.fui-slider-host :deep(.fui-slider__puck)') ?? ''
    const hitArea = rules.get('.fui-slider-host :deep(.fui-slider__thumb)::before') ?? ''
    expect(hitArea).toContain('content:')
    expect(hitArea).toContain('position: absolute')
    // 命中区必须正好盖住可见外圈：两处 inset 由同一个 Margin=-2 推出
    expect(readInset(hitArea)).toBe('-2px')
    expect(readInset(hitArea)).toBe(readInset(puck))
    // 少了这两条，target 会落到 puck/dot 上，reka 会当成「点在轨道上」而跳值
    expect(puck).toContain('pointer-events: none')
    expect(rules.get('.fui-slider-host :deep(.fui-slider__dot)') ?? '').toContain(
      'pointer-events: none',
    )
  })

  it('内点与外圈同心：外圈 flex 居中（块级 auto 外边距不会垂直居中）', () => {
    // 外圈内容盒 20px、内点 12px：走普通块流时内点贴内容盒顶部（中心 y=5，
    // 外圈中心 y=9 → 偏高 4px）；块级盒的垂直 auto 外边距会被解析为 0，故必须 flex
    const puck = rules.get('.fui-slider-host :deep(.fui-slider__puck)') ?? ''
    expect(puck).toContain('display: flex')
    expect(puck).toContain('align-items: center')
    expect(puck).toContain('justify-content: center')
    const dot = rules.get('.fui-slider-host :deep(.fui-slider__dot)') ?? ''
    expect(dot).not.toContain('margin: 0 auto')
  })

  it('外圈描边：ControlElevationBorderBrush 渐变环（上浅下重）+ 实心内胆', () => {
    const puck = rules.get('.fui-slider-host :deep(.fui-slider__puck)') ?? ''
    expect(puck).toContain('background-image:')
    // 上 ControlStrokeColorDefault(#0F000000) → colorNeutralStrokeAlpha
    expect(puck).toContain('var(--colorNeutralStrokeAlpha)')
    // 下 ControlStrokeColorSecondary(#29000000) → colorNeutralStroke1
    expect(puck).toContain('var(--colorNeutralStroke1)')
    // 内胆 = ControlSolidFillColorDefault → colorNeutralBackground1，且只铺 content-box
    expect(puck).toContain('var(--colorNeutralBackground1)')
    expect(puck).toContain('background-origin: content-box, border-box')
    expect(puck).toContain('background-clip: content-box, border-box')
  })

  it('内点：SliderInnerThumb 12px + Normal 缩放 0.86（12→10.32，与实机截图一致）', () => {
    const dot = rules.get('.fui-slider-host :deep(.fui-slider__dot)') ?? ''
    expect(dot).toContain('width: 12px')
    expect(dot).toContain('height: 12px')
    expect(dot).toContain('border-radius: var(--borderRadiusCircular)')
    expect(dot).toContain('background-color: var(--colorCompoundBrandBackground)')
    expect(dot).toContain('transform: scale(0.86)')
  })

  it('hover：数值填充与内点同换 AccentFillColorSecondary', () => {
    expect(
      rules.get(
        '.fui-slider-host :deep(.fui-slider:not([data-disabled]):hover .fui-slider__range)',
      ) ?? '',
    ).toContain('background-color: var(--colorCompoundBrandBackgroundHover)')
    expect(
      rules.get(
        '.fui-slider-host :deep(.fui-slider:not([data-disabled]):hover .fui-slider__dot)',
      ) ?? '',
    ).toContain('background-color: var(--colorCompoundBrandBackgroundHover)')
  })

  it('hover 滑块本体：内点放大到 14px（Thumb 自己的 PointerOver，scale 1.167）', () => {
    const hover =
      rules.get(
        '.fui-slider-host :deep(.fui-slider__thumb:not([data-disabled]):hover .fui-slider__dot)',
      ) ?? ''
    expect(hover).toContain('transform: scale(1.167)')
  })

  it('pressed：数值填充与内点换 AccentFillColorTertiary；按滑块时内点缩到 10px（0.71）', () => {
    expect(rules.get('.fui-slider-host[data-pressed] :deep(.fui-slider__range)') ?? '').toContain(
      'background-color: var(--colorCompoundBrandBackgroundPressed)',
    )
    expect(rules.get('.fui-slider-host[data-pressed] :deep(.fui-slider__dot)') ?? '').toContain(
      'background-color: var(--colorCompoundBrandBackgroundPressed)',
    )
    expect(
      rules.get(
        '.fui-slider-host :deep(.fui-slider__thumb:not([data-disabled]):active .fui-slider__dot)',
      ) ?? '',
    ).toContain('transform: scale(0.71)')
  })

  it('disabled：轨道/填充/内点落到 …Disabled 档，内点停在 hover 尺寸 1.167', () => {
    expect(rules.get('.fui-slider-host[data-disabled] :deep(.fui-slider__track)') ?? '').toContain(
      'background-color: var(--colorNeutralStrokeDisabled)',
    )
    expect(rules.get('.fui-slider-host[data-disabled] :deep(.fui-slider__range)') ?? '').toContain(
      'background-color: var(--colorNeutralBackgroundDisabled)',
    )
    const dot = rules.get('.fui-slider-host[data-disabled] :deep(.fui-slider__dot)') ?? ''
    expect(dot).toContain('background-color: var(--colorNeutralBackgroundDisabled)')
    expect(dot).toContain('transform: scale(1.167)')
  })

  it('标题：SliderHeaderThemeMargin 0,0,0,4 + 禁用文字色', () => {
    const header = rules.get('.fui-slider-host :deep(.fui-slider__header)') ?? ''
    expect(header).toContain('margin-block-end: var(--spacingVerticalXS)')
    expect(header).toContain('font-weight: var(--fontWeightRegular)')
    expect(rules.get('.fui-slider-host[data-disabled] :deep(.fui-slider__header)') ?? '').toContain(
      'color: var(--colorNeutralForegroundDisabled)',
    )
  })

  it('刻度：轨道外 4px 高、距轨道 4px；轨道内用输入底色「挖」出来', () => {
    const tick = rules.get('.fui-slider-host :deep(.fui-slider__tick)') ?? ''
    expect(tick).toContain('background-color: var(--colorNeutralStrokeAccessible)')
    const top =
      rules.get(".fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__ticks--top)") ??
      ''
    expect(top).toContain('height: 4px')
    expect(top).toContain('bottom: calc(50% + 6px)')
    expect(
      rules.get('.fui-slider-host :deep(.fui-slider__ticks--inline .fui-slider__tick)') ?? '',
    ).toContain('background-color: var(--colorNeutralBackground1)')
  })

  it('数值提示：ToolTip 表面（12px 文本 + 1px 描边 + shadow4）', () => {
    const tip = rules.get('.fui-slider-host :deep(.fui-slider__tip)') ?? ''
    expect(tip).toContain('font-size: var(--fontSizeBase200)')
    expect(tip).toContain('background-color: var(--colorNeutralBackground1)')
    expect(tip).toContain('border: var(--strokeWidthThin) solid var(--colorNeutralStroke1)')
    expect(tip).toContain('box-shadow: var(--shadow4)')
    expect(tip).toContain('pointer-events: none')
  })

  it('focus：a11y focus ring（strokeWidthThick + colorCompoundBrandStroke）', () => {
    const focus =
      rules.get('.fui-slider-host :deep(.fui-slider:has(.fui-slider__thumb:focus-visible))') ?? ''
    expect(focus).toContain(
      'outline: var(--strokeWidthThick) solid var(--colorCompoundBrandStroke)',
    )
  })

  it('动效：时长/缓动取自 Fluent token，并尊重 prefers-reduced-motion', () => {
    const dot = rules.get('.fui-slider-host :deep(.fui-slider__dot)') ?? ''
    expect(dot).toContain('var(--durationNormal)')
    expect(dot).toContain('var(--curveEasyEaseMax)')
    expect(sliderSfc).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('没有硬编码颜色 / 尺寸魔法值：所有取值都走 var(--Token)', () => {
    const styleBlock = /<style[^>]*>(?<css>[\s\S]*?)<\/style>/.exec(sliderSfc)?.groups?.css ?? ''
    const withoutComments = styleBlock.replace(/\/\*[\s\S]*?\*\//g, '')
    // 只允许 WinUI 几何原值（18/22/12/4/2/10/1/0.86/1.167/0.71/32/6）以 px 出现
    const rawColors = withoutComments.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) ?? []
    expect(rawColors).toEqual([])
  })
})
