<script lang="ts" setup>
import { Button } from '@/components'
</script>

<template>
  <div class="h-full overflow-auto flex flex-col">
    <div class="flex gap-4 p-4">
      <div>普通</div>
      <Button type="standard">
        按钮
      </Button>
      <Button type="accent">
        按钮
      </Button>
      <Button type="text">
        按钮
      </Button>
    </div>
    <div class="flex gap-4 p-4">
      <div>文字</div>
      <Button type="text">
        按钮
      </Button>
    </div>
    <div class="flex gap-4 p-4">
      <div>禁用</div>
      <Button type="standard" disabled>
        按钮
      </Button>
      <Button type="accent" disabled>
        按钮
      </Button>
      <Button type="text" disabled>
        按钮
      </Button>
    </div>
  </div>
</template>
