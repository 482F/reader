<template>
  <div class="file-input-button">
    <btn
      class="button"
      @click="async () => (await inputRefPromise).value?.click()"
    >
      <slot />
    </btn>
    <input ref="input" type="file" @change="onInputFiles" accept=".html" />
  </div>
</template>

<script setup lang="ts">
import Btn from './btn.vue'

import { useTemplateRef } from '../../utils/composables/template-ref-usable'

const inputRefPromise = useTemplateRef('input')

const emits = defineEmits<{ (e: 'input', payload: File): void }>()
async function onInputFiles(e: Event) {
  // @ts-expect-error
  const [file]: File[] = e.currentTarget?.files ?? []
  if (!file) {
    return
  }
  emits('input', file)
}
</script>

<style lang="scss" scoped>
.file-input-button {
  > .button {
    width: 100%;
    height: 100%;
  }
  > input {
    display: none;
  }
}
</style>
