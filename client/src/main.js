// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// iView
import iView from 'iview';
import 'iview/dist/styles/iview.css'; 
// vue-resource
import VueResource from 'vue-resource';

// SCSS
// import "./common/scss/index.scss";

Vue.use(iView);
Vue.use(VueResource);

Vue.directive('focus', {
    inserted: function(el) {
        Vue.nextTick(() => {
          el.querySelector('input').focus();
        });
    }
});

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
