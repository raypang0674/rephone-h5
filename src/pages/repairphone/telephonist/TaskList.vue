<template>
  <el-row>
    <el-col :span="5"><div class="left-area">
      <div class="area-title">
        <span>号码批次</span>
        <el-button type="text" @click="clickQueryBatch" icon="el-icon-refresh-right" :loading="loadingTableDataBatch" circle></el-button>
      </div>
      <div class="left-content">
        <el-table ref="elTable-batch" :data="batchTableData" class="table tbl-batch" stripe empty-text="没有找到批次数据" :show-header="false" highlight-current-row
            @current-change="pickBatch">
          <el-table-column>
            <template slot-scope="scope">
              <div>
                <span class="batchli-id">{{scope.row.id}}</span>
              </div>
              <div>
                <span class="batchli-date">{{scope.row.gmtCreate| dateFormatYMDHMS}}</span>
              </div>
              <div style="float: left;">
                <span class="batchli-label">共：</span><span class="batchli-task">{{scope.row.countDone + scope.row.countTodo}}</span>
              </div>
              <div style="float: right;">
                <span class="batchli-label">待呼：</span>
                <span v-if="scope.row.countTodo == 0" class="batchli-todo">{{scope.row.countTodo}}</span>
                <span v-if="scope.row.countTodo > 0" class="batchli-todo mark">{{scope.row.countTodo}}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Paging @currentChange="goPageBatch" :total="batchTotal" :layout="batchPageLayout" :pageSize="batchPageSize" :currentPage="batchPage"></Paging>

      </div>
    </div></el-col>
    <el-col :span="13"><div class="middle-area">
      <div class="area-title">任务清单</div>
      <div class="middle-content">
        <div class="tbl-upper">
          <div class="condition">
            <span class="lab">状态：</span>
            <el-select v-model="caseQueryCondition.callStatus" :style="{ width: '100px' }">
              <el-option v-for="item in callStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
            <span class="lab">姓名：</span>
            <el-input v-model="caseQueryCondition.caseName" :clearable="true" :style="{ width: '100px' }"></el-input>
            <el-button type="primary" @click="clickQueryCases" icon="el-icon-search" :loading="loadingTableDataCases">刷新</el-button>
          </div>
        </div>

        <el-table ref="elTable-case" :data="caseTableData" class="table" stripe empty-text="没有匹配到数据" highlight-current-row
          @current-change="pickCase">
          <el-table-column prop="id" label="编号" min-width="120"> </el-table-column>
          <el-table-column prop="caseName" label="姓名" width="100"> </el-table-column>
          <el-table-column label="状态" width="60" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.callStatus == 0">未呼</span>
              <span v-if="scope.row.callStatus == 1">已呼</span>
            </template>
          </el-table-column>
          <el-table-column label="呼叫记录" min-width="300" align="left">
            <template slot-scope="scope">
              <span v-if="scope.row.callLog == ''">-</span>
              <div v-if="scope.row.callLog != ''">
                <el-row v-for="item in scope.row.jCallLog" :key="item.id" class="call-log-row">
                  <span class="call-log-time">{{item.time}}</span>
                  <span class="call-log-caller-name">{{item.callerName}}</span>
                  <span class="call-log-caller-code"> - {{item.callerCode}}</span>
                  <span class="call-log-msg" v-if="item.msg != ''">{{item.msg}}</span>
                  <span class="call-log-msg" v-if="item.msg == ''">-</span>
                </el-row>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Paging @currentChange="goPageCase" @pageSizeChange="changePageSizeCase" :total="caseTotal" :layout="casePageLayout" :pageSize="casePageSize" :currentPage="casePage"></Paging>
      </div>
    </div></el-col>
    <el-col :span="6"><div v-if="pickedCase.visible" class="right-area">
      <div class="area-title">外呼操作</div>
      <div class="right-content">
        <div class="callout-case-info">
          <div class="callout-case-info-row"><div class="label">编号</div><span class="val">{{pickedCase.data.id}}</span></div>
          <div class="callout-case-info-row"><div class="label">姓名</div><span class="val">{{pickedCase.data.caseName}}</span></div>
          <div v-if="pickedCase.ltjf.visible">
            <div class="callout-case-info-row">
              <div class="label">修复号码</div>
              <el-table ref="elTablePhone" :data="pickedCase.data.phones" class="table tbl-phone" stripe empty-text="没有号码数据" :show-header="false" highlight-current-row
                  @current-change="pickPhoneNumber" :cell-style="tblPhoneCellStyle">
                <el-table-column>
                  <template slot-scope="scope">{{scope.row.id}}</template>
                </el-table-column>
              </el-table>
            </div>
            <div class="callout-case-info-row">
              <div class="label">我的A号</div>
              <span v-if="myPhone.numberA != null && myPhone.numberA !=''" class="val">{{myPhone.numberA}}</span>
              <span v-if="myPhone.numberA == null || myPhone.numberA ==''" class="val phone-not-ready">未绑定</span>
            </div>
            <div class="callout-case-info-row">
              <div class="label">我的X号</div>
              <span v-if="myPhone.numberX != null && myPhone.numberX !=''" class="val phone-ready">{{myPhone.numberX}}</span>
              <span v-if="myPhone.numberX == null || myPhone.numberX ==''" class="val phone-not-ready">未绑定</span>
            </div>
            <div class="callout-case-info-row">
              <el-button v-if="!bindSuccess" type="danger" @click="clickBindCall" icon="el-icon-phone-outline" style="margin: 0 auto;" :loading="doingBindingX">绑定X号</el-button>
              <el-button v-if="bindSuccess" type="success" icon="el-icon-phone-outline" style="margin: 0 auto;">绑定成功</el-button>
            </div>
            <div class="split"></div>
          </div>
          <div class="callout-case-info-row">
            <div class="label">呼叫备注</div>
          </div>
          <div class="callout-case-info-row">
            <el-input type="textarea" placeholder="额外备注本次呼叫信息" v-model="txtCallLog" maxlength="100" show-word-limit :autosize="{ minRows: 2, maxRows: 4}"></el-input>
          </div>
          <div class="callout-case-info-row">
            <el-button type="primary" :loading="doingSubmitCallLog" @click="clickLogCall" icon="el-icon-finished" style="margin: 0 auto;">确认完成呼叫</el-button>
          </div>
        </div>
      </div>
    </div></el-col>
  </el-row>
</template>

<script>
import Paging from '../../../components/Paging'

export default {
  data() {
    return {
      callStatusOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '未呼'
      }, {
        value: 1,
        label: '已呼'
      }],
      loadingTableDataBatch: false,
      batchQueryCondition: {
        queryDate: ['', ''],
        repairStatus: 1
      },
      batchTableData: [],
      batchPageLayout: null, // 'full'
      batchPageSize: 5,
      batchPage: 1, // 当前页码
      batchTotal: 0, // 返回数据的总数
      loadingTableDataCases: false,
      caseQueryCondition: {
        batchId: 0,
        callStatus: 0,
        caseName: ''
      },
      caseTableData: [],
      casePageLayout: 'full', // 'full'
      casePageSize: 10,
      casePage: 1, // 当前页码
      caseTotal: 0, // 返回数据的总数
      pickedCase: {
        data: {},
        visible: false,
        ltjf: {
          visible: false
        }
      },
      myPhone: {},
      pickedPhone: '',
      doingBindingX: false,
      bindSuccess: false,
      txtCallLog: '',
      doingSubmitCallLog: false
    }
  },
  methods: {
    stopEvent(event) {
      // 阻止按钮事件继续冒泡，影响行选择
    },
    clickQueryBatch() {
      this.batchPage = 1
      this.refreshBatchList()
    },
    refreshBatchList() {
      this.loadingTableDataBatch = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/telephonist/repairBatchList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.batchPage,
          pageSize: this.batchPageSize,
          orderBy: '',
          beginDate: this.batchQueryCondition.queryDate[0],
          endDate: this.batchQueryCondition.queryDate[1],
          repairStatus: this.batchQueryCondition.repairStatus
        }
      }).then(res => {
        this.loadingTableDataBatch = false
        if (res && res.code && res.code === 200) {
          this.batchTotal = res.data.total
          this.batchTableData = res.data.rows
          if (this.batchTableData && this.batchTableData.length > 0) {
              this.$refs['elTable-batch'].setCurrentRow(this.batchTableData[0])
          }
          return
        }
        this.$message.error('批次数据刷新异常')
      })
    },
    // 当前页发生改变时触发，重新请求数据
    goPageBatch(page) {
      this.batchPage = page
      this.refreshBatchList()
    },
    pickBatch(currentRow, oldCurrentRow) {
      // console.log(currentRow.id)
      this.caseQueryCondition.batchId = currentRow.id
      this.refreshCaseList()
    },
    clickQueryCases() {
      this.casePage = 1
      this.refreshCaseList()
    },
    goPageCase(page) {
      this.casePage = page
      this.refreshCaseList()
    },
    changePageSizeCase(pagesize) {
      this.casePageSize = pagesize
      this.refreshCaseList()
    },
    refreshCaseList() {
      this.clearPickedCase()
      this.loadingTableDataCases = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/telephonist/repairCaseList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.casePage,
          pageSize: this.casePageSize,
          // orderBy: 'case_name',
          batchId: this.caseQueryCondition.batchId,
          callStatus: this.caseQueryCondition.callStatus,
          caseName: this.caseQueryCondition.caseName
        }
      }).then(res => {
        this.loadingTableDataCases = false
        if (res && res.code && res.code === 200) {
          this.caseTotal = res.data.total
          this.caseTableData = res.data.rows
          for (var j = 0; j < this.caseTableData.length; j++) {
            if (this.caseTableData[j].callLog) {
              this.caseTableData[j].jCallLog = JSON.parse(this.caseTableData[j].callLog)
            }
          }
          return
        }
        this.$message.error('任务数据刷新异常')
      })
    },
    pickCase(currentRow, oldCurrentRow) {
      // console.log(JSON.stringify(currentRow))
      if (currentRow == null) {
        this.clearPickedCase()
        return
      }
      this.pickedCase.data = currentRow
      this.txtCallLog = ''
      this.pickedCase.visible = true
      if (currentRow.repairApiId == 1) {
        this.pickedCase.ltjf.visible = true
        let phones = []
        this.pickedCase.data.phones = phones
        if (currentRow.repairResultContent != '') {
          let pr = JSON.parse(currentRow.repairResultContent)
          if (pr && pr.phones && pr.phones.length > 0) {
            for (let j = 0; j < pr.phones.length; j++) {
              let p = {
                id: pr.phones[j]
              }
              phones.push(p)
            }
          }
        }
        if (phones.length > 0) {
          setTimeout(() => { // 用setTimeout是因为有可能元素尚未渲染，this.$refs会undefined
            this.$refs.elTablePhone.setCurrentRow(phones[0])
          }, 0)
        }
      }
    },
    clearPickedCase() {
      this.pickedCase.data = {}
      this.pickedCase.visible = false
      this.txtCallLog = ''
      this.pickedCase.ltjf.visible = false
      this.pickPhoneNumber(null)
    },
    pickPhoneNumber(currentRow, oldCurrentRow) {
      if (currentRow == null) {
        this.pickedPhone = ''
        this.bindSuccess = false
        return
      }
      if (currentRow.id == this.pickedPhone) {
        return
      }
      this.pickedPhone = currentRow.id
      this.bindSuccess = false
    },
    tblPhoneCellStyle(column) {
      return 'padding: 5px 0'
    },
    refreshMyPhone() {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/telephonist/myPhoneNumber'
        // method: 'post',
      }).then(res => {
        if (res && res.code && res.code === 200) {
          this.myPhone = res.data
          return
        }
        this.$message.error('我的号码信息加载异常...')
      })
    },
    clickBindCall() {
      if (!this.myPhone || !this.myPhone.numberA) {
        this.$message.error('您尚未配置A号')
        return
      }
      if (!this.myPhone.numberX) {
        this.$message.error('您尚未配置X号')
        return
      }
      if (!this.pickedPhone) {
        this.$message.warning('请先选择修复的号码')
        return
      }
      if (!this.pickedCase || !this.pickedCase.data || !this.pickedCase.data.id) {
        return
      }
      this.doingBindingX = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/telephonist/repairCaseBindX',
        method: 'post',
        data: {
          caseId: this.pickedCase.data.id,
          numberA: this.myPhone.numberA,
          numberX: this.myPhone.numberX,
          targetPhone: this.pickedPhone
        }
      }).then(res => {
        this.doingBindingX = false
        if (res && res.code) {
          if (res.code === 200) {
            this.bindSuccess = true
            return
          } else if (res.code === 400) {
            if (res.msg && res.msg === '-1') {
              this.$message.error('未找到修复记录')
              return
            } else if (res.msg && res.msg === '-2') {
              this.$message.error('您配置的号码不一致')
              return
            } else if (res.msg && res.msg === '-101') {
              this.$message.error('号码尚未修复成功')
              return
            }
          }
        }
        this.$message.error('绑定失败')
      })
    },
    clickLogCall() {
      if (this.doingSubmitCallLog || !this.pickedCase || !this.pickedCase.data || !this.pickedCase.data.id) {
        return
      }
      this.doingSubmitCallLog = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/telephonist/logCall',
        method: 'post',
        data: {
          caseId: this.pickedCase.data.id,
          msg: this.txtCallLog
        }
      }).then(res => {
        this.doingSubmitCallLog = false
        if (res && res.code) {
          if (res.code === 200) {
            this.refreshCaseList()
            return
          } else if (res.code === 400) {
            this.$message.error('数据保存失败')
            return
          }
          this.$message.error('数据保存异常')
          return
        }
        this.$message.error('数据保存异常')
      })
    }
  },
  created() {
    let now = new Date()
    let beginDay = new Date()
    beginDay.setDate(beginDay.getDate() - 30)
    beginDay = new Date(beginDay)
    this.batchQueryCondition.queryDate[0] = beginDay.toLocaleDateString().split('/').join('-')
    this.batchQueryCondition.queryDate[1] = now.toLocaleDateString().split('/').join('-')
    this.refreshBatchList()
    this.refreshMyPhone()
  },
  components: {
    Paging
  }
}
</script>

<style scoped>
  .left-area {
    padding-right: 20px;
  }
  .right-area {
    padding-left: 20px;
  }
  .area-title {
    font-size: 14px;
    font-weight: bolder;
    color: #333;
    margin-bottom: 10px;
  }
  .right-content {
    border-radius: 4px;
    min-height: 200px;
    background-color: #fcfbf9;
    border: 1px solid #c9b5b0;
    padding: 15px;
  }
  .table.tbl-batch {
    margin-top: 0;
    border-radius: 4px;
    background-color: #f9fafc;
    border: 1px solid #b0b8c9;
  }
  .batchli-date {
    font-size: 12px;
    color: #aaa;
  }
  .batchli-label {
    font-size: 14px;
    color: #999;
  }
  .batchli-todo.mark {
    color: #db0000;
    font-size: 18px;
    font-weight: bolder;
  }
  .call-log-row {
    margin-bottom: 0;
  }
  .call-log-time {
    color: #aaa;
    font-size: 12px;
  }
  .call-log-caller-name {
    color: #333;
    font-size: 13px;
    margin-left: 3px;
  }
  .call-log-caller-code {
    color: #8492a6;
    font-size: 12px;
  }
  .call-log-msg {
    margin-left: 5px;
  }
  .callout-case-info .label {
    font-size: 14px;
    color: #999;
    width: 70px;
  }
  .callout-case-info-row {
    margin-bottom: 10px;
    display: flex;
  }
  .tbl-phone {
    border-radius: 4px;
    border: 1px solid #c9c5b0;
  }
  .phone-not-ready {
    color: #aaa;
  }
  .phone-ready {
    font-size: 16px;
    font-weight: bolder;
  }
  .split {
    border-top: 1px dashed #c9b5b0;
    margin: 20px 0;
  }
</style>
