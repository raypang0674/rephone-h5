<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">号码：</span>
        <el-input v-model="queryCondition.number" :clearable="true" :style="{ width: '160px' }"></el-input>
        <span class="lab">分配(给商户)状态：</span>
        <el-select v-model="queryCondition.distStatus" :style="{ width: '100px' }">
          <el-option v-for="item in distStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search">查询</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="id" label="号码" min-width="120"> </el-table-column>
      <el-table-column label="状态" min-width="250" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.distributionId == 0">未分配</span>
          <span v-if="scope.row.distributionId > 0">分配于 {{new Date(Number(scope.row.distBeginTime))| dateFormatYMDHMS}}</span>
          <el-button v-if="scope.row.distributionId != 0" @click.native.prevent="unDistCallNumber(scope.row, scope.$index)" @click.stop="stopEvent" type="danger" size="mini" icon="el-icon-close" circle></el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="120" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.distributionId == 0" @click.native.prevent="distCallNumber(scope.row, scope.$index)" @click.stop="stopEvent" type="primary" size="small" icon="el-icon-circle-check" plain>分配</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>
  </div>
</template>

<script>
import Paging from '../../../components/Paging'

export default {
  data() {
    return {
      numberType: 1,
      merchantId: 0,
      distStatusOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '未分配'
      }, {
        value: 1,
        label: '已分配'
      }],
      tableData: [],
      queryCondition: {
        number: '',
        distStatus: -1
      },
      // multipleSelection: [],
      pageLayout: null, // 'full'
      pageSize: 10,
      page: 1, // 当前页码
      total: 0 // 返回数据的总数
    }
  },
  methods: {
    clickQuery() {
      this.page = 1
      this.refreshList()
    },
    stopEvent(event) {
      // 阻止按钮事件继续冒泡，影响行选择
    },
    refreshList() {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberList4Dist',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          number: this.queryCondition.number,
          numberType: this.numberType,
          merchantId: this.merchantId,
          distStatus: this.queryCondition.distStatus
        }
      }).then(res => {
        if (res && res.code && res.code === 200) {
          this.total = res.data.total
          this.tableData = res.data.rows
          return
        }
        this.$message.error('数据刷新异常')
      })
    },
    // 当前页发生改变时触发，重新请求数据
    goPage(page) {
      this.page = page
      this.refreshList()
    },
    distCallNumber(row, index) {
      this.$confirm('确定要分配号码【' + row.id + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doDistCallNumber(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doDistCallNumber(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberDist2Merchant',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: id,
          merchantId: this.merchantId
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.refreshList()
            this.$message.success('分配成功')
            return
          } else if (res.code === 400) {
            if (res.msg && res.msg === '-2') {
              this.$message.error('号码已被其他商户占用')
              return
            }
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    },
    unDistCallNumber(row, index) {
      this.$confirm('确定要收回号码【' + row.id + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doUnDistCallNumber(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doUnDistCallNumber(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberUnDist2Merchant',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: id
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.refreshList()
            this.$message.success('收回成功')
            return
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    }
  },
  watch: {
    // 同个页面组件，由于不同参数切换显示，需要监听此方法达到刷新，不会再次触发mounted和created
    $route: function(to) {
      this.numberType = to.query.numtype || 1
      this.merchantId = to.query.merchant || 0
      this.queryCondition.number = ''
      this.refreshList()
    }
  },
  mounted() {
    this.numberType = this.$route.query.numtype || 1
    this.merchantId = this.$route.query.merchant || 0
    this.refreshList()
  },
  components: {
    Paging
  }
}
</script>

<style scoped>
.el-button--mini.is-circle{
  padding: 5px;
  margin-left: 10px;
}
.el-button--text.el-button--small{
  font-size: 14px;
  margin-left: 5px;
}
</style>
