<template>
  <button class="btn" @click="emits('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
const emits = defineEmits<{ (e: 'click'): void }>()
</script>

<style lang="scss" scoped>
.btn {
  border: solid 1px lightgray;
  border-radius: 4px;
  background-color: #00000000;
  &:hover,
  &:focus {
    background-color: #00000006;
  }
}
</style>
