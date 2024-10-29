<template>
  <el-container>
    <el-aside style="width: auto" class="aside aside-flex" :class="{ 'aside-show': getCollapseState == false ? true : false, 'aside-hide': getCollapseState == true ? true : false }">
      <Aside></Aside>
    </el-aside>
    <el-container class="container-aside is-vertical" :style="{ paddingLeft: getCollapseState == false ? '200px' : '64px' }">
      <Header></Header>
      <el-main :style="{ paddingTop: '60px', paddingLeft: '0', paddingRight: '0', paddingBottom: '0' }">
        <AsideTitle @gohome="goHomePage" @openUrl="routeUrl"></AsideTitle>
        <!--页面的展示-->
        <transition name="compAnimate" appear>
          <keep-alive>
            <router-view :style="{ padding: '0 20px', marginTop: '55px' }" v-on:test1="testP1" @test2="testP2"></router-view>
          </keep-alive>
        </transition>
      </el-main>
      <!-- <Footer></Footer> -->
    </el-container>
  </el-container>
</template>

<script>
import Aside from '../pages/layout/leftAside/Aside'
import Header from '../pages/layout/rightMain/Header'
import AsideTitle from '../pages/layout/rightMain/AsideTitle'
import Crumbs from '../pages/layout/rightMain/Crumbs'
import Footer from '../pages/layout/rightMain/Footer'
import { mapGetters } from 'vuex'
import '../assets/css/public.css'

export default {
  name: 'Home',
  computed: {
    /*
     * 在VUEX中获得asideColor颜色值
     * */
    ...mapGetters({
      getCollapseState: 'header/CollapseState',
      getNavs: 'header/Navs',
      getAsideTitle: 'header/AsideTitle',
      getCount: 'header/Count'
    })
  },
  watch: {
    $route: function(to) {
      // console.log('to:' + JSON.stringify(to.path))
      // console.log('$route.params:' + JSON.stringify(this.$route.params))
      this.routeUrl(to.path)
    }
  },
  methods: {
    testP1: function(data) {
      console.log(data)
    },
    testP2: function(data) {
      alert(data)
    },
    // 回到空白页
    goHomePage: function() {
      let homePath = '/home'
      if (this.$route.path === homePath) {
        return
      }
      this.$router.push({
        path: homePath
      })
    },
    /**
       * 动态添加标题标签函数
       * path：当前点击左侧导航的path
       * 1.首先会处理welcome（首页）页，welcome页已在vuex中初始化了，所以，当用户再次点击时，直接定位到首页即可
       * 2.如果不是首页，则会通过当前导航的path去和左侧导航数据比对，如果path相等存入vuex asideTitle
       * 3.如果vuex的asideTitle已有数据，再次点击时，只定位，不新增
       * 注意：vuex中的count（标题标签的增值变量，可以保证每次添加的标题标签不重复，作用于后面的标题标签定位），count每次进来都需要自增，保证唯一，默认为0
       * vuex中的asideTitle格式：
       * {
            title: '主控制台', // tab显示名
            path: '/welcome',  // 注意: path必须唯一!!!否则会影响框架菜单和tab显示
            idIndex: 0, // tab编号，唯一，来自count控制
            crumbs: [] // 顶部显示面包屑路径链
          }
       *
       * */
    routeUrl(path) {
      let result = this.getAsideTitle.filter(item => {
        return (item.path === path) & this.isEqualQuery(item.query, this.$route.query)
      })
      if (result.length > 0) {
        this.$store.commit('header/setActiveIndex', result[0].idIndex)
        this.$store.commit('header/setCrumbs', result[0].crumbs)
        return
      }
      if (path === '/home') {
        // 所有tab页都关闭了，回到空白状态
        this.$store.commit('header/setActiveIndex', 0)
        this.$store.commit('header/setCrumbs', [])
        return
      }
      // 创建tab
      let nav = this.getNavs.nav
      let asideItem = this.createAsideItemByPath(path, nav)
      if (!asideItem) {
        // 自由创建
        let titlestr = this.$route.query.title
        let title
        if (titlestr) {
          title = titlestr
        } else {
          title = '新页面'
        }
        let crumbs = []
        let crumbstr = this.$route.query.crumbs
        if (crumbstr) {
          crumbs = crumbstr.split(',')
        }
        asideItem = {
          title: title,
          path: path,
          crumbs: crumbs
        }
      }
      asideItem.query = this.$route.query
      this.createTabGo(asideItem)
    },
    createAsideItemByPath(path, nav) {
      if (!nav || nav.length == 0) {
        return null
      }
      for (let i = 0; i < nav.length; i++) {
        if (nav[i].child && nav[i].child.length > 0) {
          let ret = this.createAsideItemByPath(path, nav[i].child)
          if (ret != null) {
            ret.crumbs.unshift(nav[i].title)
            return ret
          }
        } else {
          if (nav[i].path === path) {
            let asideItem = {
              title: nav[i].title,
              path: path,
              crumbs: [nav[i].title]
            }
            return asideItem
          }
        }
      }
      return null
    },
    createTabGo(asideItem) {
      // 添加标题标签
      let count = this.getCount
      count++
      this.$store.commit('header/setCount', count)
      asideItem.idIndex = count
      this.$store.commit('header/setAside', asideItem)
      this.$store.commit('header/setActiveIndex', count)
      this.$store.commit('header/setCrumbs', asideItem.crumbs)
    },
    refreshToken() {
      let thisuser = JSON.parse(localStorage.getItem('user'))
      if (!thisuser || !thisuser.token || !thisuser.token.refreshToken) {
        return
      }
      this.$AxiosUtil({
        url: this.PMS_API_HOST + '/api/public/pms/refreshToken?refresh_token=' + thisuser.token.refreshToken,
        method: 'post'
      }).then(res => {
        if (res.code == '200') {
          thisuser.token = res.data
          localStorage.setItem('user', JSON.stringify(thisuser))
        }
      })
    },
    isEqualQuery(query1, query2) {
      let q1 = query1 || {}
      let q2 = query2 || {}
      if (Object.keys(q1).length != Object.keys(q2).length) {
        return false
      }
      for (var key in q1) {
        if (q1[key] != q2[key]) {
          return false
        }
      }
      return true
    }
  },
  mounted() {
    setInterval(() => {
      this.refreshToken()
    }, 1000 * 60 * 60)
  },
  components: {
    Aside,
    Header,
    // GlbSetting,
    AsideTitle,
    Crumbs,
    Footer
  }
}
</script>

<style scoped>
.el-aside {
  color: #333;
}

.el-tabs--card > .el-tabs__header {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 1000;
  opacity: 1;
  background-color: #ffffff;
  margin: 0;
  padding-right: 20px;
}

.el-row {
  margin-bottom: 15px;
}

/*组件过渡动画*/
.compAnimate-enter {
  opacity: 0;
  transform: translateY(-60px);
}

.compAnimate-leave-to {
  opacity: 0;
}

.compAnimate-enter-active {
  transition: all 0.8s ease-in-out;
}
.compAnimate-leave-active {
  transition: all 0.2s ease;
}
</style>
