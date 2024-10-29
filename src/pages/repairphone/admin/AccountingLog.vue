<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">类型：</span>
        <el-select v-model="queryCondition.bizcode" :style="{ width: '110px' }">
          <el-option v-for="item in bizCodeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">时间：</span>
        <el-date-picker v-model="queryCondition.queryDate" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerQueryDate" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"></el-date-picker>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search" :loading="loadingTableData">查询</el-button>
      </div>
    </div>

    <el-table v-if="loadedTableData" ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="gmtCreate" label="时间" min-width="120">
        <template slot-scope="scope">{{scope.row.gmtCreate| dateFormatYMDHMS}}</template>
      </el-table-column>
      <el-table-column label="类型" min-width="100" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.bizCode == 0">账户充值</span>
          <span v-if="scope.row.bizCode == 1">号码修复</span>
          <span v-if="scope.row.bizCode == 3">通讯费</span>
          <span v-if="scope.row.bizCode == 7">号码租金</span>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" min-width="80" align="right" :formatter="moneyFormatter"> </el-table-column>
      <el-table-column prop="balance" label="余额" min-width="100" align="right" :formatter="moneyFormatter"> </el-table-column>
      <el-table-column prop="summary" label="摘要" min-width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.summary == ''">-</span>
          <span v-if="scope.row.summary != ''">{{scope.row.summary}}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="300" align="left">
        <template slot-scope="scope">
          <span v-if="scope.row.notes == ''">-</span>
          <div v-if="scope.row.notes != ''">
            <div v-if="scope.row.bizCode == 0">
              <span class="tblcell-label">操作人:</span><span class="al-operator-name">{{scope.row.jNotes.operatorName}}</span>
              <span class="tblcell-label">备注:</span>
              <span class="al-memo" v-if="scope.row.jNotes.memo != ''">{{scope.row.jNotes.memo}}</span>
              <span class="al-memo" v-if="scope.row.jNotes.memo == ''">-</span>
            </div>
            <div v-if="scope.row.bizCode == 1">
              <span class="tblcell-label">批号:</span><span class="al-operator-name">{{scope.row.jNotes.batchId}}</span>
              <span class="tblcell-label">编号:</span><span class="al-operator-name">{{scope.row.jNotes.caseId}}</span>
            </div>
          </div>
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
    let _minTime = null
    let _maxTime = null
    return {
      loadedTableData: false,
      merchantId: 0,
      loadingTableData: false,
      bizCodeOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '账户充值'
      }, {
        value: 1,
        label: '号码修复'
      }, {
        value: 3,
        label: '通讯费'
      }, {
        value: 7,
        label: '号码租金'
      }],
      pickerQueryDate: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }],
        onPick(time) { // 如果选择了只选择了一个时间
          if (!time.maxDate) {
            let timeRange = 100 * 24 * 60 * 60 * 1000 // 100天
            _minTime = time.minDate.getTime() - timeRange // 最小时间
            _maxTime = time.minDate.getTime() + timeRange // 最大时间
          } else { // 如果选了两个时间，那就清空本次范围判断数据，以备重选
            _minTime = _maxTime = null
          }
        },
        disabledDate: (time) => {
          // onPick后触发
          if (_minTime && _maxTime) { // 该方法会轮询当3个月内的每一个日期，返回false表示该日期禁选
            return time.getTime() < _minTime || time.getTime() > _maxTime
          }
        }
      },
      tableData: [],
      queryCondition: {
        bizcode: -1,
        queryDate: [new Date().toLocaleDateString().split('/').join('-') + ' 00:00:00', new Date(new Date().getTime() + 3600 * 1000 * 24).toLocaleDateString().split('/').join('-') + ' 00:00:00'] // 默认选择当天，看个人需求
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
      if (!this.queryCondition.queryDate || !this.queryCondition.queryDate[0] || !this.queryCondition.queryDate[1]) {
        this.$message.warning('请选择日期范围')
        return
      }
      this.page = 1
      this.refreshList()
    },
    stopEvent(event) {
      // 阻止按钮事件继续冒泡，影响行选择
    },
    refreshList() {
      this.loadingTableData = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/merchantAccountingLogList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          beginDate: this.queryCondition.queryDate[0],
          endDate: this.queryCondition.queryDate[1],
          merchantId: this.merchantId,
          accountingType: -1,
          bizCode: this.queryCondition.bizcode
        }
      }).then(res => {
        this.loadedTableData = true
        this.loadingTableData = false
        if (res && res.code && res.code === 200) {
          this.total = res.data.total
          this.tableData = res.data.rows
          for (var j = 0; j < this.tableData.length; j++) {
            if (this.tableData[j].notes) {
              this.tableData[j].jNotes = JSON.parse(this.tableData[j].notes)
            }
          }
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
    changePageSize(pagesize) {
      this.pageSize = pagesize
      this.refreshList()
    },
    moneyFormatter(row, column, cellValue) {
      var p = cellValue / 100
      return p.toFixed(2)
    }
  },
  watch: {
    // 同个页面组件，由于不同参数切换显示，需要监听此方法达到刷新，不会再次触发mounted和created
    $route: function(to) {
      this.merchantId = to.query.merchant || 0
      // this.refreshList()
      this.loadedTableData = false
      this.tableData = []
    }
  },
  mounted() {
    this.merchantId = this.$route.query.merchant || 0
    // this.refreshList()
    this.loadedTableData = false
    this.tableData = []
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
.tblcell-label{
  color: #aaa;
  font-size: 12px;
  margin-right: 5px;
}
.al-operator-name{
  color: #8492a6;
  font-size: 13px;
  margin-right: 10px;
}
.al-operator-memo{
  color: #333;
  font-size: 13px;
  margin-left: 3px;
}
</style>
