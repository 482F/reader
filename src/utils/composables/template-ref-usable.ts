import { useTemplateRef as vutr, watch } from 'vue'

export async function useTemplateRef<T>(key: string) {
  const tr = vutr<T>(key)
  const { promise, resolve } = Promise.withResolvers<typeof tr>()

  const unwatch = watch(
    () => tr.value,
    (nv) => {
      if (!nv) {
        return
      }

      resolve(tr)
      unwatch()
    },
    { flush: 'post' }
  )

  return await promise
}
