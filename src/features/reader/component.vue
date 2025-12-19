<template>
  <div
    class="container"
    @scroll="
      (e) => {
        // @ts-expect-error
        onScroll(e)
      }
    "
    ref="container"
  >
    <div class="input-file">
      <input type="file" @change="onInputFiles" accept=".html" />
    </div>
    <div class="reader" v-html="DOMPurify.sanitize(file?.html ?? '')" />
  </div>
</template>

<script setup lang="ts">
import throttle from 'lodash/throttle'
import DOMPurify from 'dompurify'
import { ref, computed } from 'vue'
import { useLocalStorage } from '../../utils/composables/local-storage-usable'
import { useTemplateRef } from '../../utils/composables/template-ref-usable'

const file = useLocalStorage<null | { name: string; html: string }>(
  'file',
  null
)
const scrollMap = useLocalStorage<{ [name in string]: number }>('scrollMap', {})
const scroll = computed({
  get: () => scrollMap.value[String(file.value?.name)] ?? 0,
  set: (nv) => {
    scrollMap.value[String(file.value?.name)] = nv
  },
})

const containerRefPromise = useTemplateRef<HTMLElement>('container')
async function init() {
  const { value: container } = await containerRefPromise
  if (!container) {
    return
  }
  while (container.scrollWidth < scroll.value) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  container.scrollTo({ left: scroll.value })
}
init()

const onScroll = ref(
  throttle(function (e: { target: { scrollLeft: number } }) {
    scroll.value = e.target.scrollLeft
  }, 1000)
)

async function onInputFiles(e: Event) {
  // @ts-expect-error
  const [rawFile]: File[] = e.currentTarget?.files ?? []
  if (!rawFile) {
    return
  }
  file.value = { name: rawFile.name, html: await rawFile.text() }
  await init()
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
  :deep(p) {
    margin: 0;
  }
}
</style>
