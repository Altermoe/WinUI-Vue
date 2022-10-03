<script lang="ts" setup>

</script>

<template>
  <div class="win-contextmenu" v-bind="$attrs">
    <div class="win-contextmenu-group">
      <div v-for="i in 2" :key="i" class="win-contextmenu-item">
        <div class="win-contextmenu-item-wrapper">
          分组 1:{{ i }}
        </div>
      </div>
    </div>
    <div class="win-contextmenu-group">
      <div v-for="i in 3" :key="i" class="win-contextmenu-item">
        <div class="win-contextmenu-item-wrapper">
          分组 2:{{ i }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-contextmenu {
  padding: 1px;
  display: flex;
  flex-direction: column;
  background: rgba(252, 252, 252, 0.85);
  filter: drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.14));
  backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 0, 0, 0.0578);
  border-radius: 8px;
}

.win-contextmenu-group {
  &:not(:last-of-type) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.0803);
  }
}

.win-contextmenu-item {
  padding: 3px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    .win-contextmenu-item-wrapper {
      background: rgba(0, 0, 0, 0.0373);
    }
  }

  .win-contextmenu-item-wrapper {
    padding: 6px 11px 8px;
    border-radius: 4px;
  }
}
</style>
