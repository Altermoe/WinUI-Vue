<script lang="ts" setup>
import { Slider, TextBox } from '../'

const props = withDefaults(defineProps<{
  modelValue?: string
  type?: 'rgba' | 'hsl'
}>(), {
  type: 'rgba',
})

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

const opacity = ref('1')
</script>

<template>
  <div class="win-colorpicker">
    <div class="win-colorpicker__colormap" :class="{ round: type === 'hsl' }" />
    <div class="win-colorpicker__swatch-preview" />
    <div class="win-colorpicker__slider">
      <Slider
        width="100%"
        :track-height="12"
        track-color="linear-gradient(to right, #000, transparent)"
        thumb-color="#000"
      />
      <TextBox v-model="opacity" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-colorpicker {
  --border-radius: 0;

  display: grid;
  grid-template-columns: auto auto;

  &.round {
    --border-radius: 50%
  }
}

// 左上的大框颜色选择器
.win-colorpicker__colormap {
  width: 256px;
  height: 256px;
  overflow: hidden;
  position: relative;
  border-radius: 4px;
  background: linear-gradient(90deg,
    #FF0000 0.26%,
    #FF9700 10.36%,
    #CEFF00 20.46%,
    #32FF00 30.56%,
    #00FF67 40.66%,
    #00FFFF 50.76%,
    #0068FF 60.86%,
    #2B00FF 70.96%,
    #CD00FF 80.16%,
    #FF009E 91.16%,
    #FF0000 101.26%
  );
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: linear-gradient(360deg, #FFFFFF 0%, rgba(255, 255, 255, 0.0001) 100%);
  }
  &.round {
    border-radius: 50%;
    background: conic-gradient(from -90deg at 50% 50%,
      #FF0000 0deg,
      #FF9700 36deg,
      #CEFF00 72deg,
      #32FF00 108deg,
      #00FF67 144deg,
      #00FFFF 180deg,
      #0068FF 216deg,
      #2B00FF 252deg,
      #CD00FF 284.8deg,
      #FF009E 324deg,
      #FF0000 360deg
    );
    &::before {
      background: radial-gradient(42.08% 42.08% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0.0001) 100%);
    }
  }
}

// 右边的颜色预览器
.win-colorpicker__swatch-preview {
  width: 42px;
  height: 256px;
  margin-left: 13px;
  border: 1px solid rgba(0, 0, 0, 0.0578);
  border-radius: 4px;
}

// 饱和度滑动选择器
// TODO 换成内部组件
.win-colorpicker__slider {
  margin-top: 21px;
  grid-column: span 2;
  width: 100%;
  height: 32px;
  // border: 1px solid red;
}
</style>
