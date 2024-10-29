const state = {
  nav: [], // 左侧导航栏数据
  isCollapse: false, // 是否收缩左侧导航栏 false为展开 true为收缩
  asideTitle: [
    // {
    //   title: '主控制台', // tab显示名
    //   path: '/welcome', // 路径
    //   idIndex: 0, // tab编号，唯一，来自count控制
    //   crumbs: [], // 顶部显示面包屑路径链
    //   query:{} // query传参
    // }
  ], // 存储点击左侧导航栏后的导航名，作为标题显示头
  crumbs: [], // ['控制台', '主控制台'], // 存储面包屑
  activeIndex: 0, // 当前活跃的tab的idIndex
  count: 0 // tab（即asideTitle项）的activeIndex来源，自增，只增不减
}

const getters = {
  CollapseState: state => {
    return state.isCollapse
  },
  AsideTitle: state => {
    return state.asideTitle
  },
  active: state => {
    return state.activeIndex
  },
  Count: state => {
    return state.count
  },
  Crumbs: state => {
    return state.crumbs
  },
  Navs: state => {
    return state.nav
  }
}

const mutations = {
  setCollapse(state, payload) {
    state.isCollapse = payload
  },
  setAside(state, values) {
    state.asideTitle.push(values)
  },
  delOrAddAside(state, value) {
    state.asideTitle = value
  },
  setActiveIndex(state, value) {
    state.activeIndex = value
  },
  setCount(state, value) {
    state.count = value
  },
  setCrumbs(state, crumbs) {
    state.crumbs = crumbs
  },
  setNav(state, values) {
    state.nav = values
  }
}

const actions = {
  setNavs(context, nav) {
    context.commit('setNav', nav)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
