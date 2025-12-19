<template>
  <div
    class="container"
    :style="{
      '--em': `${setting.emPx}px`,
      '--color': setting.color,
      '--bg-color': setting.bgColor,
      '--line-height': `${lineHeight}px`,
    }"
  >
    <btn class="header-button" @click="isShowHeader = !isShowHeader">
      {{ isShowHeader ? '>' : '<' }}
    </btn>
    <div
      :class="{
        vertical: true,
        header: true,
        show: isShowHeader,
      }"
      ref="header"
    >
      <file-input-button class="file-input-button" @input="onFile">
        HTMLファイルを選択
      </file-input-button>
      <div class="font-range">
        <dit class="buttons">
          <btn @click="setting.emPx--">-</btn>
          <btn @click="setting.emPx++">+</btn>
        </dit>
        <div>
          フォントサイズ<span class="px">{{ setting.emPx }}px</span>
        </div>
      </div>

      <label class="color">
        <input type="color" v-model="setting.color" />
        <div>文字色</div>
      </label>

      <label class="bg-color">
        <input type="color" v-model="setting.bgColor" />
        <div>背景色</div>
      </label>
    </div>
    <div
      class="body vertical"
      ref="body"
      @scroll="
        (e) => {
          // @ts-expect-error
          onScroll(e)
        }
      "
      v-html="DOMPurify.sanitize(file?.html ?? '')"
    />
    <div class="pager">
      <btn @click="move(-1)">&lt;</btn>
      <btn @click="move(1)">&gt;</btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import throttle from 'lodash/throttle'
import DOMPurify from 'dompurify'
import { ref, computed } from 'vue'
import { useLocalStorage } from '../../utils/composables/local-storage-usable'
import { useTemplateRef } from '../../utils/composables/template-ref-usable'

import FileInputButton from '../../components/atoms/file-input-button.vue'
import Btn from '../../components/atoms/btn.vue'

const setting = useLocalStorage<{
  emPx: number
  color: string
  bgColor: string
}>('settings', { emPx: 18, color: '#332222', bgColor: '#f7f1ec' })
const lineHeight = computed(() => Math.round(setting.value.emPx * 1.4))

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

const throttledUpdateScroll = throttle((nv) => {
  scroll.value = nv
}, 1000)
async function onScroll(e: { target: { scrollLeft: number } }) {
  const { scrollLeft } = e.target
  throttledUpdateScroll(scrollLeft)
}

const isShowHeader = ref(false)

async function onFile(rawFile: File) {
  file.value = { name: rawFile.name, html: await rawFile.text() }
  await init()
}

async function move(delta: number) {
  const { value: body } = await bodyRefPromise
  if (!body) {
    return
  }

  const movePx =
    Math.floor(body.clientWidth / lineHeight.value) * lineHeight.value
  body.scrollBy({ left: delta * movePx })
}
</script>

<style lang="scss" scoped>
.container {
  --em: 12px;
  --header-width: 6rem;
  --bg-color: #f7f1ec;
  --color: #332222;
  --line-height: 24px;
  background-color: var(--bg-color);
  color: var(--color);
  line-height: var(--line-height);

  height: 100%;
  width: 100%;

  .vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  > .body {
    font-size: var(--em);

    padding: calc(3 * var(--em));
    padding-right: var(--header-width);
    box-sizing: border-box;

    height: 100%;
    width: 100%;
    overflow-x: scroll;

    word-wrap: break-word;

    :deep {
      p {
        margin: 0;
      }
      ruby > rt {
        // ルビがある p タグの幅が line-height より大きくなるため、負のマージンで詰める
        margin-right: -1em;
        margin-left: -0.4em;
      }
    }
  }

  > .header-button {
    position: fixed;
    bottom: 1rem;
    right: 1rem;

    opacity: 0.3;

    height: 4rem;
    width: 4rem;
    z-index: 1;
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
    > .font-range {
      display: flex;
      flex-direction: column;
      gap: 2px;
      > div > .px {
        writing-mode: initial;
      }
      > .buttons {
        display: flex;
        justify-content: center;
        gap: 4px;
        > * {
          flex-grow: 1;
        }
      }
    }
  }
  .pager {
    position: fixed;
    bottom: 1rem;
    left: 1rem;

    display: flex;
    gap: 8px;

    opacity: 0.3;
    > button {
      height: 4rem;
      width: 4rem;
    }
  }
}
</style>
