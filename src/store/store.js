import Vue from 'vue'
import Vuex from 'vuex'
import globalSetting from './modules/globalSetting'
import header from './modules/header'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    globalSetting,
    header
  }
})
