<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">日志级别：</span>
        <el-select v-model="queryCondition.loglevel" :style="{ width: '110px' }">
          <el-option v-for="item in logLevelOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">号码编号：</span>
        <el-input v-model="queryCondition.caseId" :clearable="true" :style="{ width: '200px' }"></el-input>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search" :loading="loadingTableData">查询</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据" :row-style="tblLogLevelRowStyle">
      <el-table-column prop="gmtCreate" label="时间" min-width="90">
        <template slot-scope="scope">{{scope.row.gmtCreate| dateFormatYMDHMS}}</template>
      </el-table-column>
      <el-table-column label="日志级别" min-width="80" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.logLevel == 1" class="loglevel-trace">跟踪</span>
          <span v-if="scope.row.logLevel == 2" class="loglevel-debug">调试</span>
          <span v-if="scope.row.logLevel == 3" class="loglevel-info">信息</span>
          <span v-if="scope.row.logLevel == 4" class="loglevel-important">重要</span>
          <span v-if="scope.row.logLevel == 5" class="loglevel-warning">警告</span>
          <span v-if="scope.row.logLevel == 6" class="loglevel-error">错误</span>
          <span v-if="scope.row.logLevel == 7" class="loglevel-fatal">灾难</span>
        </template>
      </el-table-column>
      <el-table-column prop="caseId" label="号码编号" min-width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.caseId == 0">-</span>
          <span v-if="scope.row.caseId > 0">{{scope.row.caseId}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="logContent" label="内容" min-width="380">
        <template slot-scope="scope">
          <span v-if="scope.row.logContent == ''">-</span>
          <span v-if="scope.row.logContent != ''">{{scope.row.logContent}}</span>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" @pageSizeChange="changePageSize" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>
  </div>
</template>

<script>
import Paging from '../../../components/Paging'

export default {
  data() {
    return {
      batchId: 0,
      loadingTableData: false,
      logLevelOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 3,
        label: '信息'
      }, {
        value: 4,
        label: '重要'
      }, {
        value: 5,
        label: '警告'
      }, {
        value: 6,
        label: '错误'
      }],
      tableData: [],
      queryCondition: {
        caseId: '',
        loglevel: 4
      },
      // multipleSelection: [],
      pageLayout: 'full', // 'full'
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
      this.loadingTableData = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/repairLogList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: ' gmt_create DESC',
          batchId: this.merchantId,
          logLevelGE: this.queryCondition.loglevel,
          caseId: this.queryCondition.caseId
        }
      }).then(res => {
        this.loadingTableData = false
        if (res && res.code && res.code === 200) {
          this.total = res.data.total
          this.tableData = res.data.rows
          return
        }
        this.$message.error('数据刷新异常')
      })
    },
    tblLogLevelRowStyle({row, rowIndex}) {
      // row-style 新版本要求返回对象
      let styleJson = {}
      if (row.logLevel == 1) {
        styleJson.color = '#00aeae'
      } else if (row.logLevel == 2) {
        styleJson.color = '#909399'
      } else if (row.logLevel == 3) {
        styleJson.color = '#333333'
      } else if (row.logLevel == 4) {
        styleJson.color = '#409EFF'
      } else if (row.logLevel == 5) {
        styleJson.color = '#cf9236'
      } else if (row.logLevel == 6) {
        styleJson.color = '#f56c6c'
      } else if (row.logLevel == 7) {
        styleJson.color = '#6f00d2'
      }
      return styleJson
    },
    // 当前页发生改变时触发，重新请求数据
    goPage(page) {
      this.page = page
      this.refreshList()
    },
    changePageSize(pagesize) {
      this.pageSize = pagesize
      this.refreshList()
    }
  },
  watch: {
    // 同个页面组件，由于不同参数切换显示，需要监听此方法达到刷新，不会再次触发mounted和created
    $route: function(to) {
      this.batchId = to.query.batch || 0
      this.refreshList()
    }
  },
  mounted() {
    this.batchId = this.$route.query.batch || 0
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
