<template>
  <div id="app">
    <reader />
  </div>
</template>

<script setup lang="ts">
import Reader from './features/reader/component.vue'
</script>

<style lang="scss">
* {
  font-family: 'Cica';
  &::-webkit-scrollbar-track {
    background-color: #eee;
  }
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 30px;
  }
}
</style>
