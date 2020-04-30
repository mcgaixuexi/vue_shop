import Vue from 'vue'
import App from './App.vue'
import router from './router'
import qs from 'qs'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

// 导入进度条
import NProgress from 'nprogress'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8090/api'
axios.interceptors.request.use(config => {
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token');
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if (config.method === 'post' || config.method === 'put') { 
      config.data = qs.stringify({
        ...config.data
      })
    }
    return config;
})
axios.interceptors.response.use(config => {
    NProgress.done();
    return config;
})
Vue.prototype.$http = axios

import './assets/css/global.css'
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable);

Vue.use(VueQuillEditor)
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)
  
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
  
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
  
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  })

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')