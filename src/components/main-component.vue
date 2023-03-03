<template>
  <div class="main-component" @scroll="onScroll" ref="mainComponentRef">
    <div class="input-file">
      <input type="file" @change="onInputFiles" accept="plain/text" />
    </div>
    <div class="reader">
      {{ storage.text }}
    </div>
  </div>
</template>

<script setup>
import throttle from 'lodash/throttle'
import { ref, watch } from 'vue'

const mainComponentRef = ref(null)

const storageKey = (key) => 'github-pages--482F--reader--' + key
const storage = ref({
  text: localStorage.getItem(storageKey('text')) ?? '',
  scroll: Number(localStorage.getItem(storageKey('scroll')) ?? 0),
})

watch(mainComponentRef, async () => {
  while (mainComponentRef.value?.scrollTop < storage.scroll) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  mainComponentRef.value.scrollTo({ top: storage.value.scroll })
})

watch(
  () => storage.value.text,
  () => {
    localStorage.setItem(storageKey('text'), storage.value.text)
  }
)
watch(
  () => storage.value.scroll,
  () => {
    localStorage.setItem(storageKey('scroll'), storage.value.scroll)
  }
)

async function onInputFiles(e) {
  const files = e.currentTarget.files
  if (!files || files.length <= 0) return
  const file = files[0]
  storage.value.text = await file.text()
}

const onScroll = ref(
  throttle(function (e) {
    storage.value.scroll = e.target.scrollTop
  }, 1000 * 5)
)
</script>

<style lang="scss" scoped>
.main-component {
  --bg-color: #f7f1ec;
  background-color: var(--bg-color);

  height: 100vh;
  overflow-y: scroll;
}
</style>
