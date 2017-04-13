<template>
  <div id="app">
    <Navi></Navi>
    <div class="view">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Navi from '@comp/Nav';

export default {
  name: 'app',
  components: {
    Navi
  }
}
</script>

<style lang="scss">

#app {
  // background: #eee;
}
</style>
