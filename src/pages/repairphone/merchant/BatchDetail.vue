<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">修复状态：</span>
        <el-select v-model="queryCondition.repairStatus" :style="{ width: '110px' }">
          <el-option v-for="item in repairStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">呼叫状态：</span>
        <el-select v-model="queryCondition.callStatus" :style="{ width: '100px' }">
          <el-option v-for="item in callStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">呼叫记录：</span>
        <el-select v-model="queryCondition.callStatusHistory" :style="{ width: '100px' }">
          <el-option v-for="item in callStatusHistoryOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">坐席：</span>
        <el-select v-model="queryCondition.caller" placeholder="请输入关键词" filterable remote reserve-keyword clearable
          :remote-method="reloadCaller4Query4Select" :loading="loadingCaller4Query">
          <el-option v-for="item in caller4QueryOptions" :key="item.id" :label="item.name" :value="item.entityId">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
          </el-option>
        </el-select>
        <span class="lab">姓名：</span>
        <el-input v-model="queryCondition.caseName" :clearable="true" :style="{ width: '100px' }"></el-input>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search" :loading="loadingTableData">查询</el-button>
        <el-button type="info" @click="clickExport" icon="el-icon-download" :loading="loadingExportData">导出</el-button>
      </div>
      <div class="tbl-btns-r">
        <el-button type="danger" @click="clickAssign" icon="el-icon-phone-outline">分派呼叫任务</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="id" label="编号" min-width="120"> </el-table-column>
      <el-table-column prop="caseName" label="姓名" min-width="100"> </el-table-column>
      <el-table-column label="修复状态" min-width="100" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.repairStatus == 0">未修复</span>
          <span v-if="scope.row.repairStatus == 1">修复成功</span>
          <span v-if="scope.row.repairStatus == 2">修复失败</span>
          <span v-if="scope.row.repairStatus == 7">修复中</span>
        </template>
      </el-table-column>
      <el-table-column label="坐席" min-width="150" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.callerId == 0">-</span>
          <div v-if="scope.row.callerId > 0">
            <span>{{scope.row.callerName}}</span>
            <span style="color: #8492a6; font-size: 13px"> - {{scope.row.callerCode}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="呼叫状态" min-width="100" align="center">
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
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>

    <el-dialog :title="'分派呼叫任务 - 匹配到 ' + assignForm.rowCount + '条数据'" :visible.sync="assignForm.visible" @closed="formClosed('assign2CallersForm')" width="500px">
      <el-form ref="assign2CallersForm" :model="assignForm" :rules="ruleAssignForm" label-width="80px">
        <el-form-item label="坐席" prop="callers">
          <el-select v-model="assignForm.callers" filterable remote reserve-keyword clearable multiple
            :remote-method="reloadCaller4Assign4Select" :style="{ width: '360px' }">
            <el-option v-for="item in caller4AssignOptions" :key="item.id" :label="item.name" :value="item.entityId">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="assignFormCancel">取 消</el-button>
        <el-button type="primary" @click="assignFormConfirm('assign2CallersForm')">分 派</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Paging from '../../../components/Paging'

export default {
  data() {
    let vldAssignCallers = (rule, value, callback) => {
      if (value === '' || value.length == 0) {
        callback(new Error('请选择坐席'))
      } else {
        callback()
      }
    }
    return {
      batchId: 0,
      loadingTableData: false,
      loadingCaller4Query: false,
      loadingPrepareAssign: false,
      loadingAssign: false,
      loadingExportData: false,
      caller4QueryOptions: [],
      caller4AssignOptions: [],
      repairStatusOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '未修复'
      }, {
        value: 7,
        label: '修复中'
      }, {
        value: 1,
        label: '修复成功'
      }, {
        value: 2,
        label: '修复失败'
      }],
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
      callStatusHistoryOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '无'
      }, {
        value: 1,
        label: '有'
      }],
      assignForm: {
        rowCount: 0,
        callers: [],
        visible: false
      },
      ruleAssignForm: {
        callers: [{ validator: vldAssignCallers, trigger: 'blur' }]
      },
      tableData: [],
      queryCondition: {
        repairStatus: -1,
        callStatus: -1,
        callStatusHistory: -1,
        caller: '',
        caseName: ''
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
      this.loadingTableData = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/merchant/repairCaseList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: 'case_name',
          batchId: this.batchId,
          repairStatus: this.queryCondition.repairStatus,
          callStatus: this.queryCondition.callStatus,
          callStatusHistory: this.queryCondition.callStatusHistory,
          callerId: this.queryCondition.caller,
          caseName: this.queryCondition.caseName
        }
      }).then(res => {
        this.loadingTableData = false
        if (res && res.code && res.code === 200) {
          this.total = res.data.total
          this.tableData = res.data.rows
          for (var j = 0; j < this.tableData.length; j++) {
            if (this.tableData[j].callLog) {
              // console.log(this.tableData[j].callLog)
              this.tableData[j].jCallLog = JSON.parse(this.tableData[j].callLog)
              // console.log(JSON.stringify(this.tableData[j].jCallLog))
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
    reloadCaller4Query4Select(query) {
      this.loadingCaller4Query = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/merchant/callerList4Select',
        // method: 'post',
        params: {
          name: query,
          pageIndex: 1,
          pageSize: 9999
        }
      }).then(res => {
        this.loadingCaller4Query = false
        if (res && res.code) {
          if (res.code === 200) {
            this.caller4QueryOptions = res.data.rows
            return
          }
        }
        this.caller4QueryOptions = []
      })
    },
    reloadCaller4Assign4Select(query) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/merchant/callerList4Select',
        // method: 'post',
        params: {
          name: query,
          status: 0,
          pageIndex: 1,
          pageSize: 9999
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.caller4AssignOptions = res.data.rows
            return
          }
        }
        this.caller4AssignOptions = []
      })
    },
    clickAssign() {
      if (this.queryCondition.repairStatus != 1) {
        this.$message.warning('分派呼叫任务仅对修复成功的号码有效，请调整"修复状态"选项')
        return
      }
      this.loadingPrepareAssign = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/merchant/repairBatchCountCase4Assign',
        method: 'post',
        data: {
          batchId: this.batchId,
          callStatus: this.queryCondition.callStatus,
          callStatusHistory: this.queryCondition.callStatusHistory,
          callerId: this.queryCondition.caller,
          caseName: this.queryCondition.caseName
        }
      }).then(res => {
        this.loadingPrepareAssign = false
        if (res && res.code) {
          if (res.code === 200) {
            let r = parseInt(res.msg)
            if (r <= 0) {
              this.$message.warning('没有找到符合条件的记录')
              return
            }
            this.assignForm.rowCount = r
            this.assignForm.callers = []
            this.assignForm.visible = true
            this.reloadCaller4Assign4Select('')
            return
          }
        }
        this.$message.error('读取数据失败')
      })
    },
    formClosed(formName) {
      this.$refs[formName].resetFields()
    },
    assignFormCancel() {
      this.assignForm.visible = false
    },
    assignFormConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        if (this.assignForm.callers == null || this.assignForm.callers.length == 0) {
          this.$message.warning('请选择坐席')
          return
        }
        this.$AxiosWithToken({
          url: this.BIZ_API_HOST + '/api/auth/merchant/repairBatchAssign',
          method: 'post',
          data: {
            batchId: this.batchId,
            callStatus: this.queryCondition.callStatus,
            callStatusHistory: this.queryCondition.callStatusHistory,
            callerId: this.queryCondition.caller,
            caseName: this.queryCondition.caseName,
            callers: this.assignForm.callers
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('分派成功')
              this.assignForm.visible = false
              this.refreshList()
              return
            } else if (res.code === 400) {
              if (res.msg && res.msg === '-1') {
                this.$message.error('批次不存在')
                return
              } else if (res.msg && res.msg === '-11') {
                this.$message.error('所选坐席部分不可用')
                return
              }
            }
            this.$message.error('数据保存异常')
            return
          }
          this.$message.error('数据保存异常')
        })
      })
    },
    clickExport () {
      this.loadingExportData = true
      this.$AxiosWithToken({
        responseType: 'blob',
        url: this.BIZ_API_HOST + '/api/auth/merchant/repairExportBatch',
        method: 'post',
        params: {
          batchId: this.batchId,
          repairStatus: this.queryCondition.repairStatus,
          callStatus: this.queryCondition.callStatus,
          callStatusHistory: this.queryCondition.callStatusHistory,
          callerId: this.queryCondition.caller,
          caseName: this.queryCondition.caseName
        }
      }).then(res => {
        this.loadingExportData = false
        let blob = new Blob([res], {
          type: 'application/vnd.ms-excel;charset=utf-8' // 加上这个，导出的excel文件才正常。导出txt或cvs文件不加没关系
        })
        let fileName = Date.parse(new Date()) + '.xlsx'
        var link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        link.click()
        // 释放内存
        window.URL.revokeObjectURL(link.href)
      })
    }
  },
  watch: {
    // 同个页面组件，由于不同参数切换显示，需要监听此方法达到刷新，不会再次触发mounted和created
    $route: function(to) {
      this.batchId = to.query.batch || 0
      this.refreshList()
      this.reloadCaller4Query4Select('')
    }
  },
  mounted() {
    this.batchId = this.$route.query.batch || 0
    this.refreshList()
    this.reloadCaller4Query4Select('')
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
.call-log-time{
  color: #aaa;
  font-size: 12px;
}
.call-log-caller-name{
  color: #333;
  font-size: 13px;
  margin-left: 3px;
}
.call-log-caller-code{
  color: #8492a6;
  font-size: 12px;
}
.call-log-msg{
  margin-left: 5px;
}
</style>
