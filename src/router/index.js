import Vue from 'vue'
import VueRouter from 'vue-router'
// import Layout from '@/pages/layout/layout'

Vue.use(VueRouter)

const login = () => import('../pages/Login')
const home = () => import('../components/Home')
const notPath = () => import('../pages/error/NotPath_404')

const helloworld = () => import('../components/HelloWorld')
const helloworld2 = () => import('../components/HelloWorld2')
const homeUpdatePass = () => import('../pages/HomeUpdatePass')

const ApplicationList = () => import('../pages/pms/ApplicationList')
const MenuList = () => import('../pages/pms/MenuList')
const RoleList = () => import('../pages/pms/RoleList')
const PermissionList = () => import('../pages/pms/PermissionList')
const PermissionMenuList = () => import('../pages/pms/PermissionMenuList')
const RolePermissionList = () => import('../pages/pms/RolePermissionList')
const UserList = () => import('../pages/pms/UserList')
const UserRoleList = () => import('../pages/pms/UserRoleList')

// repair phone
const AdmMerchantList = () => import('../pages/repairphone/admin/MerchantList')
const AdmBatchList = () => import('../pages/repairphone/admin/BatchList')
const AdmBatchDetail = () => import('../pages/repairphone/admin/BatchDetail')
const AdmCallerList = () => import('../pages/repairphone/admin/CallerList')
const AdmCallNumberAList = () => import('../pages/repairphone/admin/CallNumberAList')
const AdmCallNumberXList = () => import('../pages/repairphone/admin/CallNumberXList')
const AdmCallNumberDist = () => import('../pages/repairphone/admin/CallNumberDist')
const AdmRepairFeeRateList = () => import('../pages/repairphone/admin/RepairFeeRateList')
const AdmAccountingLog = () => import('../pages/repairphone/admin/AccountingLog')
const AdmRepairLog = () => import('../pages/repairphone/admin/RepairLog')

const AdmDevTestLtjfQueryRepair = () => import('../pages/repairphone/admin/DevTestLtjfQueryRepair')

const MchBatchList = () => import('../pages/repairphone/merchant/BatchList')
const MchBatchDetail = () => import('../pages/repairphone/merchant/BatchDetail')
const MchCallerList = () => import('../pages/repairphone/merchant/CallerList')

const TelephonistTaskList = () => import('../pages/repairphone/telephonist/TaskList')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    meta: {
      title: '号码修复控制台 - 登录'
    },
    component: login
  },
  {
    path: '/404',
    meta: {
      title: '错误页面-404'
    },
    component: notPath
  },
  {
    path: '/home',
    // redirect: '/welcome',
    meta: {
      title: '号码修复'
    },
    component: home,
    children: [
      {
        // 测试
        path: '/welcome1/:id',
        meta: {
          title: '欢迎1'
        },
        component: helloworld
      },
      {
        // 测试
        path: '/welcome1/:id',
        meta: {
          title: '欢迎2'
        },
        component: helloworld
      },
      {
        // 测试
        path: '/welcome2',
        meta: {
          title: '欢迎2x'
        },
        component: helloworld2
      },
      {
        // 修改密码
        path: '/updatePass',
        meta: {
          title: '修改密码'
        },
        component: homeUpdatePass
      },
      {
        // 应用列表
        path: '/applicationList',
        meta: {
          title: '应用列表'
        },
        component: ApplicationList
      },
      {
        // 菜单列表
        path: '/menuList',
        meta: {
          title: '菜单列表'
        },
        component: MenuList
      },
      {
        // 角色列表
        path: '/roleList',
        meta: {
          title: '角色列表'
        },
        component: RoleList
      },
      {
        // 权限列表
        path: '/permissionList',
        meta: {
          title: '权限列表'
        },
        component: PermissionList
      },
      {
        // 角色关联权限列表
        path: '/rolePermissionList',
        meta: {
          title: '角色关联权限列表'
        },
        component: RolePermissionList
      },
      {
        // 权限关联菜单列表
        path: '/permissionMenuList',
        meta: {
          title: '权限关联菜单列表'
        },
        component: PermissionMenuList
      },
      {
        // 用户列表
        path: '/userList',
        meta: {
          title: '用户列表'
        },
        component: UserList
      },
      {
        // 用户关联角色列表
        path: '/userRoleList',
        meta: {
          title: '用户关联角色列表'
        },
        component: UserRoleList
      },
      // 号码修复系统相关菜单 begin
      // 号码修复系统相关菜单 admin 部分
      {
        // 商户列表
        path: '/admin/merchantlist',
        meta: {
          title: '商户列表'
        },
        component: AdmMerchantList
      },
      {
        // 资金流水列表
        path: '/admin/merchantaccountinglog',
        meta: {
          title: '资金流水'
        },
        component: AdmAccountingLog
      },
      {
        // 号码修复批次列表
        path: '/admin/repairphone/batchlist',
        meta: {
          title: '修复批次'
        },
        component: AdmBatchList
      },
      {
        // 号码修复批次-号码列表
        path: '/admin/repairphone/batchdetail',
        meta: {
          title: '批次号码'
        },
        component: AdmBatchDetail
      },
      {
        // 修复日志
        path: '/admin/repairphone/repairlog',
        meta: {
          title: '修复日志'
        },
        component: AdmRepairLog
      },
      {
        // 坐席列表
        path: '/admin/callerlist',
        meta: {
          title: '坐席列表'
        },
        component: AdmCallerList
      },
      {
        // A号码列表
        path: '/admin/callnumberlist/1',
        meta: {
          title: 'A号列表'
        },
        component: AdmCallNumberAList
      },
      {
        // X号码列表
        path: '/admin/callnumberlist/2',
        meta: {
          title: 'X号列表'
        },
        component: AdmCallNumberXList
      },
      {
        // 号码分配
        path: '/admin/callnumberdist',
        meta: {
          title: '号码分配'
        },
        component: AdmCallNumberDist
      },
      {
        // 价格配置
        path: '/admin/repairfeeratelist',
        meta: {
          title: '费率配置'
        },
        component: AdmRepairFeeRateList
      },
      {
        // 开发测试
        path: '/admin/testltjfqueryrepair',
        meta: {
          title: '联通金服查询调用'
        },
        component: AdmDevTestLtjfQueryRepair
      },
      // 号码修复系统相关菜单 merchant 部分
      {
        // 号码修复批次列表
        path: '/merchant/repairphone/batchlist',
        meta: {
          title: '修复批次'
        },
        component: MchBatchList
      },
      {
        // 号码修复批次-号码列表
        path: '/merchant/repairphone/batchdetail',
        meta: {
          title: '批次号码'
        },
        component: MchBatchDetail
      },
      {
        // 坐席列表
        path: '/merchant/repairphone/callerlist',
        meta: {
          title: '坐席管理'
        },
        component: MchCallerList
      },
      {
        // 坐席-呼叫任务列表
        path: '/telephonist/repairphone/calltask',
        meta: {
          title: '外呼任务'
        },
        component: TelephonistTaskList
      }
      // 号码修复系统相关菜单 end
    ]
  }
]

const router = new VueRouter({
  // mode: 'history', // Ray 删除，否则发布环境会点不开页面
  base: process.env.BASE_URL,
  routes
})

/*
 * 全局前置路由
 * */
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  if (to.matched.length === 0) {
    next('/404')
  }
  // TODO
  // 校验是否登录，防止不登录，直接进入其他页面
  // if ((to.path == '/login' && from.path === '/') || (to.path == '/welcome' && from.path === '/login')) {
  //   next()
  // } else {
  //   if (sessionStorage.getItem('profile') === null) {
  //     next('/login')
  //   } else {
  //     next()
  //   }
  // }
  next()
})

// 重写路由的push方法
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

export default router
