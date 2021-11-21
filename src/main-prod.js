import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入 vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

// 导入 nprogress 的JS文件和CSS文件
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

// 配置 网络请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 通过 axios 请求拦截器添加 token，保证拥有获取数据的权限
// 在 请求拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在 响应拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  // console.log(config)
  NProgress.start()
  return config
})

// 再将 axios 作为 http 挂载到 Vue 原型上
// 此后 $http = axios
Vue.prototype.$http = axios

// 注册 TreeTable 为全局组件
Vue.component('tree-table', TreeTable)

// 注册富文本编辑器为 全局组件
Vue.use(VueQuillEditor)

// 注册 dateFormat 全局过滤器
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

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
