<template>
  <div class="container" @scroll="onScroll" ref="container">
    <div class="input-file">
      <input type="file" @change="onInputFiles" accept="plain/text" />
    </div>
    <div class="reader" v-html="DOMPurify.sanitize(html)" />
  </div>
</template>

<script setup lang="ts">
import throttle from 'lodash/throttle'
import DOMPurify from 'dompurify'
import { ref } from 'vue'
import { useLocalStorage } from '../../utils/composables/local-storage-usable'
import { useTemplateRef } from '../../utils/composables/template-ref-usable'

const html = useLocalStorage<string>('html')
const scroll = useLocalStorage<number>('scroll')

useTemplateRef<HTMLElement>('container').then(async ({ value: container }) => {
  if (!container) {
    return
  }
  while (container.scrollWidth < scroll.value) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  container.scrollTo({ left: scroll.value })
})

const onScroll = ref(
  throttle(function (e) {
    scroll.value = e.target.scrollLeft
  }, 1000)
)

async function onInputFiles(e: Event) {
  const files = e.currentTarget?.files
  if (!files || files.length <= 0) return
  const file = files[0]
  html.value = await file.text()
}
</script>

<style lang="scss" scoped>
.container {
  --bg-color: #f7f1ec;
  background-color: var(--bg-color);
  padding: 3rem;

  box-sizing: border-box;
  height: 100%;
  width: 100%;
  overflow-x: scroll;

  word-wrap: break-word;

  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>
