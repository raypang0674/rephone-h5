
const state = {
  asideColor: '#303133', // 左侧菜单栏背景色
  aTextColor: '#FFFFFF', // 菜单文字色
  aActiveColor: '#ff6600', // 选中菜单文字色
  headerBColor: '#303133', // 顶部背景色
  headerColor: '#FFFFFF', // 顶部文字色
  doubleOpen: true // unique-opened 设置展开时只保持有一个子菜单展开
}

const getters = {
  AsideColor: state => {
    return state.asideColor
  },
  ATextColor: state => {
    return state.aTextColor
  },
  ActiveColor: state => {
    return state.aActiveColor
  },
  HeaderBColor: state => {
    return state.headerBColor
  },
  HeaderColor: state => {
    return state.headerColor
  },
  DoubleOpen: state => {
    return state.doubleOpen
  }
}

const mutations = {
  asideChange(state, changeColor) {
    state.asideColor = changeColor
  },
  textChange(state, changeColor) {
    state.aTextColor = changeColor
  },
  activeChange(state, changeColor) {
    state.aActiveColor = changeColor
  },
  headerBChange(state, changeColor) {
    state.headerBColor = changeColor
  },
  headerChange(state, changeColor) {
    state.headerColor = changeColor
  },
  valueChange(state, changeValue) {
    state.doubleOpen = changeValue
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
