import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui' // element-ui的全部组件
import 'element-ui/lib/theme-chalk/index.css' // element-ui的css
import store from './store/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// import axios from 'axios'
import apiConfig from '../config/api.config.js'

import { axiosUtil, axiosWithToken } from './network/axiosUtil'
import moment from 'moment'
Vue.prototype.$AxiosUtil = axiosUtil
Vue.prototype.$AxiosWithToken = axiosWithToken
Vue.prototype.moment = moment

// axios.defaults.withCredentials = true
Vue.config.productionTip = false

Vue.use(ElementUI) // 使用elementUI
Vue.use(NProgress)

// Vue.prototype.PMS_API_HOST = '/pmsapi' // 用于后台请求前缀区分服务器，然后在config/index.js的proxyTable做改写
// Vue.prototype.BIZ_API_HOST = '/bizapi'
Vue.prototype.PMS_API_HOST = apiConfig.pmsBaseURL
Vue.prototype.BIZ_API_HOST = apiConfig.bizBaseURL

Vue.filter('dateFormatYMDHMS', function(dateStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dateStr).format(pattern)
})
Vue.filter('dateFormatYMD', function(dateStr, pattern = 'YYYY-MM-DD') {
  return moment(dateStr).format(pattern)
})

// 全局进度条配置
NProgress.configure({
  showSpinner: true,
  parent: 'body',
  easing: 'ease',
  speed: '500'
})

/*
 * 全局前置路由 在路由进入前start进度条
 * */
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

/*
 * 全局后置路由 在路由完成时done进度条
 * */
router.afterEach(() => {
  NProgress.done()
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
