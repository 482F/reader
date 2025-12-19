<template>
  <div class="container">
    <div
      :class="{
        header: true,
        show: isShowHeader,
      }"
      ref="header"
    >
      <file-input-button class="file-input-button" @input="onFile">
        HTMLファイルを選択
      </file-input-button>
    </div>
    <div
      class="body"
      ref="body"
      @scroll="
        (e) => {
          // @ts-expect-error
          onScroll(e)
        }
      "
      v-html="DOMPurify.sanitize(file?.html ?? '')"
    />
  </div>
</template>

<script setup lang="ts">
import throttle from 'lodash/throttle'
import DOMPurify from 'dompurify'
import { ref, computed } from 'vue'
import { useLocalStorage } from '../../utils/composables/local-storage-usable'
import { useTemplateRef } from '../../utils/composables/template-ref-usable'

import FileInputButton from '../../components/atoms/file-input-button.vue'

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

const bodyRefPromise = useTemplateRef<HTMLElement>('body')
async function init() {
  const { value: body } = await bodyRefPromise
  if (!body) {
    return
  }
  while (body.scrollWidth < scroll.value) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  body.scrollTo({ left: scroll.value })
}
init()

const headerRefPromise = useTemplateRef<HTMLElement>('header')
const throttledUpdateScroll = throttle((nv) => {
  scroll.value = nv
}, 1000)
let lastScrollLeft = Infinity
let lastRightStarted = Infinity
const isShowHeader = ref(true)
async function onScroll(e: { target: { scrollLeft: number } }) {
  const { scrollLeft } = e.target
  throttledUpdateScroll(scrollLeft)

  const { value: header } = await headerRefPromise
  if (!header) {
    return
  }

  const threshold = 30

  isShowHeader.value = threshold < scrollLeft - lastRightStarted

  const toLeftDelta = lastScrollLeft - scrollLeft
  if (0 <= toLeftDelta) {
    lastRightStarted = scrollLeft
  } else if (threshold <= -toLeftDelta) {
    lastRightStarted = scrollLeft - threshold
  }
  lastScrollLeft = scrollLeft
}

async function onFile(rawFile: File) {
  file.value = { name: rawFile.name, html: await rawFile.text() }
  await init()
}
</script>

<style lang="scss" scoped>
.container {
  --header-width: 6rem;
  --bg-color: #f7f1ec;
  background-color: var(--bg-color);

  height: 100%;
  width: 100%;

  writing-mode: vertical-rl;
  text-orientation: mixed;
  > .body {
    padding: 3rem;
    padding-right: var(--header-width);
    box-sizing: border-box;

    height: 100%;
    width: 100%;
    overflow-x: scroll;

    word-wrap: break-word;

    :deep(p) {
      margin: 0;
    }
  }

  > .header {
    border-left: solid 1px lightgray;
    background-color: #fdfdfd;

    width: var(--header-width);
    box-sizing: border-box;
    padding: 0.5rem;
    height: 100%;

    transition: right 0.3s ease-in-out;
    position: fixed;
    right: calc(-1 * var(--header-width));
    &.show {
      right: 0;
    }

    display: flex;
    gap: 32px;
    align-items: center;
    > .file-input-button {
      text-orientation: upright;
      width: calc(var(--header-width) - 2rem);
    }
  }
}
</style>
