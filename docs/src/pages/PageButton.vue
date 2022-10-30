<script lang="ts" setup>
import { AppPage } from '../components'
import { Button, Card } from '@/components'
</script>

<template>
  <AppPage>
    <Card title="基础">
      <div class="flex flex-wrap gap-2">
        <Button type="standard">
          Standard
        </Button>
        <Button type="accent">
          Accent
        </Button>
        <Button type="critical">
          Critical
        </Button>
        <Button type="success">
          Success
        </Button>
        <Button type="caution">
          Caution
        </Button>
      </div>
    </Card>

    <Card title="禁用">
      <div class="flex flex-wrap gap-2">
        <Button type="standard" disabled>
          Standard
        </Button>
        <Button type="accent" disabled>
          Accent
        </Button>
        <Button type="critical" disabled>
          Critical
        </Button>
        <Button type="success" disabled>
          Success
        </Button>
        <Button type="caution" disabled>
          Caution
        </Button>
      </div>
    </Card>

    <Card title="文字按钮">
      <div class="flex flex-wrap gap-2">
        <Button type="text">
          Text
        </Button>
        <Button type="text" disabled>
          Text
        </Button>
      </div>
    </Card>
  </AppPage>
</template>
