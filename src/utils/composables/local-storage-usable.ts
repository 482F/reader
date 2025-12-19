import throttle from 'lodash/throttle'
import { ref, watch } from 'vue'

const createStorageKey = (key: string) => 'github-pages--482F--reader--' + key

export function useLocalStorage<T>(key: string, defaultValue?: T) {
  const actualKey = createStorageKey(key)

  const getValue = (): T =>
    JSON.parse(localStorage.getItem(actualKey) ?? 'null') ??
    defaultValue ??
    null
  const value = ref(getValue())

  const throttledUpdate = throttle((nv: T) => {
    localStorage.setItem(actualKey, JSON.stringify(nv))
  }, 100)
  watch(() => value.value, throttledUpdate, { deep: true })
  return value
}
