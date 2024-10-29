<template>
  <div class="titleNavBox" :style="{ width: getCollapseState == false ? 'calc(100% - 200px)' : 'calc(100% - 64px)' }">
    <div style="position: relative">
      <i v-if="isShow" leftIcon class="el-icon-d-arrow-left scroll" @click="toLeft"></i>
      <div class="titleNav" @click.right.prevent="mouseRight">
        <el-tag v-for="(item, index) in getAsideTitle" :key="index" ref="tag" :active-index="item.idIndex" :class="{ title: true, active: active === item.idIndex ? true : false, marginR: index != getAsideTitle.length - 1 }" @click="toUrl(item.path, item.query)" @close="closeTag(item.idIndex)" :closable="true">
          {{ item.title }}
        </el-tag>
      </div>
      <i v-if="isShow" rightIcon class="el-icon-d-arrow-right scroll" @click="toRight"></i>
      <component v-if="mouseR" :is="RightFunComponent" :clientX="clientX" :clientY="clientY" @close-r="closeRightF" @gohome="goHomePage"></component>
    </div>
  </div>
</template>

<script>
import RightFun from '../../../components/RightFun'
import { mapGetters } from 'vuex'

export default {
  name: 'AsideTitle',
  data() {
    return {
      RightFunComponent: 'RightFun',
      navWidth: '', // 标题导航条宽度
      pageWidth: '', // 页面宽度
      isShow: false, // 标题导航超出页面宽度 则显示方向键
      mouseR: false, // 是否渲染鼠标右键事件
      clientX: '',
      clientY: ''
    }
  },
  computed: {
    ...mapGetters({
      getAsideTitle: 'header/AsideTitle',
      active: 'header/active',
      getCollapseState: 'header/CollapseState',
      getCrumbs: 'header/Crumbs',
      getNavs: 'header/Navs'
    })
  },
  methods: {
    /*
     * 点击导航标题，跳转到对应的导航页面
     *   path: 当前标题的导航路径
     *   index:当前标题标签的活跃下标
     * */
    toUrl(path, query) {
      let q = query || {}
      // 跳转路由
      this.$router.push({
        path: path,
        query: q
      })
    },
    /*
     * 删除当前标题函数
     * title: 当前被删除的标题标签
     * index: 当前被删除的标题标签的下标
     * */
    closeTag(index) {
      /*
       *1.判断当前被删除标题标签下标是否是正则活跃的下标，如果是则
       * 判断当前被删除的标题标签右侧是否有标题标签，如果有，
       * 删除当前标题标签后，下一个被活跃的标题为其右侧的标题标签，否则，为其左侧的标题标签
       * 否则，直接删除即可
       * */
      if (index === this.active) {
        for (let i = 0; i < this.getAsideTitle.length; i++) {
          if (this.getAsideTitle[i].idIndex == index) {
            // 判断下一个活跃的标题标签
            let nextIndex = this.getAsideTitle[i + 1] || this.getAsideTitle[i - 1]
            if (nextIndex) {
              this.toUrl(nextIndex.path, nextIndex.query)
            } else {
              // 所有tab都关闭，回到空白页状态
              this.$emit('gohome')
            }
          }
        }
      }
      /*
       * 得到除了当前被删除的标题标签外的所有标题标签
       * */
      let result = this.getAsideTitle.filter(item => {
        return item.idIndex != index
      })
      this.$store.commit('header/delOrAddAside', result)
    },
    /*
     * 左侧滚动
     * */
    toLeft() {
      this.$nextTick(function() {
        this.move('left')
      })
    },
    /*
     * 右侧滚动
     * */
    toRight() {
      this.$nextTick(function() {
        this.move('right')
      })
    },
    /*
     * 是否显示左右滚动按钮 当标题导航宽度大于（当前页面宽度 - 左侧导航栏宽度）时显示左右滚动按钮，否则隐藏
     * */
    showBtn() {
      this.$nextTick(function() {
        // 页面长度----页面宽度-左侧导航栏
        if (this.getCollapseState == false) {
          this.pageWidth = document.documentElement.clientWidth - 200
        } else {
          this.pageWidth = document.documentElement.clientWidth - 64
        }
        // 标题导航宽度
        this.navWidth = this.$el.querySelector('.titleNav').scrollWidth

        // 如果标题导航超出页面宽度 则显示方向键 否则隐藏
        if (this.navWidth >= this.pageWidth) {
          this.isShow = true
          this.$el.querySelector('.titleNav').style.right = '20px'
        } else {
          this.isShow = false
        }
      })
    },
    /*
     * 移动函数,移动距离为当前可滚动距离的三分之一
     * */
    move(direction) {
      if (direction === 'left') {
        let num = 0
        num += (this.navWidth - this.pageWidth + 40) / 3
        this.$el.querySelector('.titleNav').scrollLeft -= num
      } else {
        let num = 0
        num += (this.navWidth - this.pageWidth + 40) / 3
        this.$el.querySelector('.titleNav').scrollLeft += num
      }
    },
    /*
     * 鼠标右键事件，阻止浏览器默认的右键事件，弹出关闭标题标签的选项
     * */
    mouseRight(event) {
      // 渲染右键功能
      this.mouseR = true
      // 获得当前鼠标点击右键的X, y轴坐标 传递给子组件做初始化位置
      this.clientX = event.clientX
      this.clientY = event.clientY
    },
    // 关闭右键功能
    closeRightF(state) {
      this.mouseR = state
    },
    // 回到空白页
    goHomePage: function() {
      this.$emit('gohome')
    }
  },
  mounted() {
    /**
     * 监听页面是否执行刷新，如果刷新则把当前的标题标签存入vuex中，供刷新后重新渲染
     * */
    let _this = this
    window.addEventListener('beforeunload', e => {
      sessionStorage.setItem(
        'titleItem',
        JSON.stringify({
          asideTitle: _this.getAsideTitle,
          activeIndex: _this.active,
          crumbs: _this.getCrumbs
        })
      )
    })
    /*
     * 监听窗口的变化，如果条件符合，显示左右方向滚动按钮
     * */
    window.addEventListener('resize', function() {
      _this.showBtn()
    })
    /*
     * 监听整个页面的点击事件，如果mouseR(标题导航打开右键功能时)关闭这个功能
     * */
    window.addEventListener('click', function() {
      _this.mouseR = false
    })
  },
  updated() {
    this.showBtn()
  },
  created() {
    this.showBtn()
    // 读取刷新前存储在session域中的数据，然后存入vuex中
    let loadBeforeRes = JSON.parse(sessionStorage.getItem('titleItem'))
    if (loadBeforeRes != null) {
      if (loadBeforeRes.asideTitle != null && loadBeforeRes.asideTitle.length > 0) {
        this.$store.commit('header/delOrAddAside', loadBeforeRes.asideTitle)
        // 过滤出session缓存数据中activeIndex最大值，并赋值给最新的增值下标变量（header/count）
        const maxResult = this.getAsideTitle.reduce((pre, las) => (pre.idIndex > las.idIndex ? pre : las))
        this.$store.commit('header/setCount', maxResult.idIndex)
      }
    }
    // 由于地址栏首次打开，不会触发Home对route变化的侦听，这样转发
    // 此时的nav可能尚未读取完毕，创建的tab可能是'新页面'
    this.$emit('openUrl', this.$route.path)
  },
  components: {
    RightFun
  }
}
</script>

<style scoped>
.titleNav {
  position: absolute;
  left: 0;
  right: 0;
  height: 42px;
  max-height: 42px;
  line-height: 42px;
  margin-bottom: 10px;
  margin-left: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  background-color: #ffffff;
  transition: all 3s ease-in-out;
}

.titleNav::-webkit-scrollbar {
  display: none;
}

.title {
  position: relative;
  cursor: pointer;
  background-color: #eeeeee;
  color: #666666;
  border: 0px;
  padding-left: 15px;
  font-size: 14px;
  box-shadow: 1px 1px 1px 1px #cccccc;
}

.active {
  background-color: #303133;
  color: #ffffff;
}

.marginR {
  margin-right: 6px;
}

[leftIcon],
[rightIcon] {
  position: absolute;
  cursor: pointer;
  height: 42px;
  line-height: 42px;
  margin-top: -5px;
  z-index: 500;
}

[leftIcon] {
  left: 0;
  top: 6px;
  box-shadow: 2px 0 5px 0 #bfbfbf;
}

[rightIcon] {
  right: 0;
  top: 6px;
  box-shadow: 0 2px 5px 0 #bfbfbf;
}

.titleNavBox {
  position: fixed;
  height: 42px;
  z-index: 200;
  box-shadow: 0 1px 3px 0 #595959;
  /*background-color: #f3f3f3;*/
}
</style>
