<template>
  <el-header class="header-flex" :style="{ width: getCollapseState == false ? 'calc(100% - 200px)' : 'calc(100% - 64px)', left: getCollapseState == true ? '64px' : '', backgroundColor: getHeaderBColor, color: getHeaderColor }">
    <!--左侧导航收缩按钮-->
    <div float="left" @click="isOpen">
      <p multiBtn>
        <i :class="{ 'el-icon-s-fold': getCollapseState == false ? true : false, 'el-icon-s-unfold': getCollapseState == true ? true : false }"> </i>
      </p>
    </div>
    <Crumbs :crumbs="getCrumbs"></Crumbs>
    <!--右侧按钮组-->
    <div float="right">
      <!--刷新按钮-->
      <el-tooltip class="item" effect="dark" content="刷新页面" placement="bottom">
        <p multiBtn @click="$router.go(0)"><i class="el-icon-refresh"></i></p>
      </el-tooltip>

      <div class="user-name">欢迎，{{ this.userName }}</div>
      <!--个人信息-->
      <el-dropdown trigger="hover" placement="bottom" @command="handleCommand">
        <p class="el-dropdown-link" multiBtn>
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
        </p>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="updatePass">修改密码</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script>
import Crumbs from './Crumbs'
import { mapGetters } from 'vuex'

export default {
  name: 'Header',
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      getHeaderBColor: 'globalSetting/HeaderBColor',
      getHeaderColor: 'globalSetting/HeaderColor',
      getCollapseState: 'header/CollapseState',
      getCrumbs: 'header/Crumbs'
    }),
    userName() {
      let thisuser = JSON.parse(localStorage.getItem('user'))
      if (!thisuser || !thisuser.username) {
        return '匿名用户'
      }
      return thisuser.username
    }
  },
  methods: {
    isOpen() {
      // 判断左侧栏是否展开或收缩
      if (this.getCollapseState == false) {
        this.$store.commit('header/setCollapse', true)
      } else {
        this.$store.commit('header/setCollapse', false)
      }
    },
    // 个人信息按钮
    handleCommand(command) {
      if (command === 'updatePass') {
        this.$router.push({
          query: {
            title: '修改密码',
            crumbs: '个人信息,修改密码'
          },
          path: '/updatePass'
        })
      } else if (command == 'logout') {
        localStorage.removeItem('user')
        sessionStorage.removeItem('titleItem') // 清除原来打开页面的记录
        this.$router.push({
          path: '/login'
        })
      }
    }
  },
  components: {
    Crumbs
  }
}
</script>

<style scoped>
.el-header {
  line-height: 55px;
}

p[multiBtn] {
  width: 38px;
  max-width: 38px;
  height: 38px;
  max-height: 38px;
  font-size: 18px;
  border-radius: 38px;
  margin: 2px;
  cursor: pointer;
  display: inline-flex;
  vertical-align: middle;
}

[multiBtn] i {
  line-height: 38px;
  margin: 0 auto;
}

[multiBtn]:hover {
  box-shadow: 0 0 6px #b3b3b3 inset;
  transition: all 0.5s ease;
}

[float='left'] {
  position: absolute;
  left: 0;
  cursor: pointer;
}

[float='right'] {
  position: absolute;
  right: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.user-name {
  margin: 0 5px;
}
</style>
