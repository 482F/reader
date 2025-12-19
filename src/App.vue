<template>
  <div id="app">
    <main-component />
  </div>
</template>

<script>
import MainComponent from './components/main-component.vue'

export default {
  name: 'App',

  components: {
    MainComponent,
  },

  data: () => ({
    //
  }),
}
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
