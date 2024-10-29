<template>
  <div style="height: 100%">
    <!--logo栏位-->
    <div v-if="sysInfo.LOGO && sysInfo.LOGO.id === '1'" class="avatar avatar-flex" :style="{ width: getCollapseState == false ? '200px' : '64px', backgroundColor: getAsideColor }">
      <div>
        <a href="javascript:;">
          <img :src="require('@/assets' + sysInfo.LOGO.img)" alt="" class="aside-logo" />
          <span class="sys-name">{{ sysInfo.LOGO.title }}</span>
        </a>
      </div>
    </div>
    <el-menu :default-active="String(activeNav)" class="el-menu-vertical" :collapse="getCollapseState" :background-color="getAsideColor" :text-color="getATextColor" :active-text-color="getActiveColor" :unique-opened="getDoubleOpen" :default-openeds="defaultOpen" ref="menu" router>
      <!--动态生成sideItem-->
      <template v-for="(item, parentIndex) in nav">
        <SideNav :item="item" :index="parentIndex" :state="getCollapseState" :key="item.id"></SideNav>
      </template>
    </el-menu>
  </div>
</template>

<script>
import SideNav from './SideNav'
import { mapGetters } from 'vuex'
import Axios from 'axios'
// import style from '@/assets/css/public.css'

export default {
  name: 'Aside',
  data() {
    return {
      sysInfo: {}, // 系统名称、图标等
      nav: [], // 左侧导航数据数组
      defaultOpen: ['0']
    }
  },
  computed: {
    activeNav() {
      // 当前激活的导航
      return this.$route.path
    },
    /*
     * 在VUEX中获得asideColor颜色值
     * */
    ...mapGetters({
      getAsideColor: 'globalSetting/AsideColor',
      getATextColor: 'globalSetting/ATextColor',
      getActiveColor: 'globalSetting/ActiveColor',
      getDoubleOpen: 'globalSetting/DoubleOpen',
      getCollapseState: 'header/CollapseState'
    })
  },
  methods: {
    loadNav() {
      this.$AxiosWithToken({
        url: this.PMS_API_HOST + '/api/auth/user/getUserMenu',
        // method: 'post',
        params: {
          app: this.sysInfo.applicationId
        }
      }).then(res => {
        if (res && res.code && res.code === 200) {
          // 把导航数据存入vuex中
          this.$store.dispatch('header/setNavs', {
            nav: res.data.nav
          })
          this.nav = res.data.nav
        }
      })
    }
  },
  created() {
    // 获得导航的json数据
    Axios({
      url: location.protocol + '/static/nav.json',
      method: 'get'
    }).then(res => {
      // // 把导航数据存入vuex中
      // this.$store.dispatch('header/setNavs', {
      //   nav: res.data.nav
      // })
      this.sysInfo = res.data
      this.loadNav()
    })
  },
  components: {
    SideNav
  }
}
</script>

<style scoped>
.el-menu-vertical:not(.el-menu--collapse) {
  padding-top: 60px;
  width: 200px;
  min-height: 400px;
  height: calc(100% - 60px);
}

.aside-show {
  width: 200px;
  max-width: 200px;
  min-height: 400px;
  height: 100%;
}

.aside-hide {
  width: 64px;
  max-width: 64px;
  min-height: 400px;
  height: 100%;
}

.el-menu--collapse {
  height: 100%;
  margin-top: 60px;
}

.el-submenu [class^='fa'] {
  vertical-align: middle;
  margin-right: 5px;
  width: 24px;
  text-align: center;
  font-size: 16px;
}

.aside-logo {
  width: 30px;
  height: 30px;
}

.aside-hide .sys-name {
  display: none;
}
</style>
