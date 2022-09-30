<script lang="ts" setup>
import { Base, Link, ThemeProvider } from '@/components'
const test = () => {
  console.log('点击')
}
</script>

<template>
  <ThemeProvider>
    <Base style="display: grid; place-items: center; width: 90%; height: 90%">
      <div style="display: flex; flex-direction: column; gap: 1em">
        <Link href="https://www.baidu.com/" target="_blank" disabled @click="test">
          Link
        </Link>
      </div>
    </Base>
  </ThemeProvider>
</template>
