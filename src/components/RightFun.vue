<template>
  <div class="rightF" :style="{ left: xPoint + 'px', top: clientY - 65 + 'px' }">
    <ul>
      <li class="closeCurr" @click="closeCurr"><i class="el-icon-arrow-down"></i>关闭当前页面</li>
      <li class="closeLeft" @click="closeLeft"><i class="el-icon-back"></i>关闭左侧页面</li>
      <li class="closeRight" @click="closeRight"><i class="el-icon-right"></i>关闭右侧页面</li>
      <li class="closeOther" @click="closeOther"><i class="el-icon-minus"></i>关闭其他页面</li>
      <li class="closeAll" @click="closeAll"><i class="el-icon-close"></i>关闭全部页面</li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'RightFun',
  props: {
    clientX: {
      type: Number,
      required: true
    },
    clientY: {
      type: Number,
      required: true
    }
  },
  computed: {
    xPoint() {
      let x = this.getCollapseState ? this.clientX - 64 : this.clientX - 200
      let w = this.getCollapseState ? document.documentElement.clientWidth - 64 : document.documentElement.clientWidth - 200
      let maxX = w - 140
      return maxX > x ? x : maxX
    },
    ...mapGetters({
      getCollapseState: 'header/CollapseState',
      getAsideTitle: 'header/AsideTitle',
      getActiveIndex: 'header/active'
    })
  },
  methods: {
    toUrl(path, query) {
      let q = query || {}
      // 跳转路由
      this.$router.push({
        path: path,
        query: q
      })
    },
    /*
     * 监听关闭页面功能
     * 1.关闭全部页面 closeAll
     * 2.关闭当前页面 closeCurr
     * 3.关闭左侧页面 closeLeft
     * 4.关闭右侧页面 closeRight
     * 5.关闭其他页面 closeOther
     * 使用filter（）函数 过滤不符合的结果返回， 并需要响应式改动tabsItem tabsPath
     * */
    closeCurr() {
      if (this.getAsideTitle.length > 0) {
        const currIndex = this.getActiveIndex
        if (currIndex != '0') {
          // 判断下一个活跃的tabs标签
          for (let i = 0; i < this.getAsideTitle.length; i++) {
            if (this.getAsideTitle[i].idIndex == currIndex) {
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
          /*
           * 得到除了当前被删除的标题标签外的所有标题标签
           * */
          let result = this.getAsideTitle.filter(item => {
            return item.idIndex != currIndex
          })
          this.$store.commit('header/delOrAddAside', result)
        }
      }
      this.$emit('close-r', false)
    },
    // 因为idIndex的生成规则，造成必然是左小右大顺序
    closeLeft() {
      if (this.getAsideTitle.length > 0) {
        const currIndex = this.getActiveIndex
        if (currIndex != '0') {
          this.$store.commit(
            'header/delOrAddAside',
            this.getAsideTitle.filter(item => {
              return item.idIndex >= currIndex
            })
          )
        }
      }
      this.$emit('close-r', false)
    },
    closeRight() {
      if (this.getAsideTitle.length > 0) {
        const currIndex = this.getActiveIndex
        if (currIndex != '0') {
          this.$store.commit(
            'header/delOrAddAside',
            this.getAsideTitle.filter(item => {
              return item.idIndex <= currIndex
            })
          )
        }
      }
      this.$emit('close-r', false)
    },
    closeOther() {
      if (this.getAsideTitle.length > 0) {
        const currIndex = this.getActiveIndex
        if (currIndex != '0') {
          this.$store.commit(
            'header/delOrAddAside',
            this.getAsideTitle.filter(item => {
              return item.idIndex == currIndex
            })
          )
        }
      }
      this.$emit('close-r', false)
    },
    closeAll() {
      if (this.getAsideTitle.length > 0) {
        this.$store.commit('header/delOrAddAside', [])
        this.$emit('gohome')
      }
      this.$emit('close-r', false)
    }
  }
}
</script>

<style scoped>
.rightF {
  position: absolute;
  top: 20px;
  width: 140px;
  min-width: 140px;
  background-color: #eeeeee;
  z-index: 2000;
  padding: 10px 0;
  border-radius: 10px;
  -webkit-box-shadow: 1px 1px 3px 0px #595959;
  box-shadow: 1px 1px 3px 0px #595959;
}

.rightF ul {
  margin: 0;
  padding: 0;
  text-align: center;
  list-style-type: none;
}

.rightF ul li {
  margin: 5px 0;
  padding: 5px 0;
  cursor: pointer;
  font-size: 14px;
}

.rightF ul li:hover {
  background-color: #303133;
  color: #ffffff;
}

.rightF ul i {
  font-weight: bold;
  margin-right: 6px;
}
</style>
