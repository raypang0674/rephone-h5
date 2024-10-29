<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">导入状态：</span>
        <el-select v-model="queryCondition.importStatus" :style="{ width: '100px' }">
          <el-option v-for="item in importStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">修复状态：</span>
        <el-select v-model="queryCondition.repairStatus" :style="{ width: '100px' }">
          <el-option v-for="item in repairStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">商户：</span>
        <el-select v-model="queryCondition.merchant" placeholder="请输入关键词" filterable remote reserve-keyword clearable
          :remote-method="reloadMerchant4Select" :loading="loadingMerchant">
          <el-option v-for="item in merchantOptions" :key="item.id" :label="item.name" :value="item.entityId">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
          </el-option>
        </el-select>
        <span class="lab">创建日期：</span>
        <el-date-picker v-model="queryCondition.queryDate" type="daterange" value-format="yyyy-MM-dd" :picker-options="pickerQueryDate" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        <span class="lab">备注：</span>
        <el-input v-model="queryCondition.memo" placeholder="输入备注内容" :clearable="true" :style="{ width: '200px' }"></el-input>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search" :loading="loadingTableData">查询</el-button>
      </div>
      <div class="tbl-btns-r">
        <el-button type="success" @click="clickNew" icon="el-icon-circle-plus">新增</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="id" label="批号" min-width="120"> </el-table-column>
      <el-table-column prop="gmtCreate" label="创建时间" min-width="120">
        <template slot-scope="scope">{{scope.row.gmtCreate| dateFormatYMDHMS}}</template>
      </el-table-column>
      <el-table-column prop="merchantName" label="商户" min-width="100"> </el-table-column>
      <el-table-column label="导入状态" min-width="60" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.importStatus == 0">未导入</span>
          <span v-if="scope.row.importStatus == 7">导入中</span>
          <span v-if="scope.row.importStatus == 1">导入完成</span>
          <span v-if="scope.row.importStatus == 2">导入失败</span>
        </template>
      </el-table-column>
      <el-table-column label="修复状态" min-width="60" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.repairStatus == 0">未修复</span>
          <span v-if="scope.row.repairStatus == 7">修复中</span>
          <span v-if="scope.row.repairStatus == 1">修复完成</span>
          <span v-if="scope.row.repairStatus == 2">修复失败</span>
        </template>
      </el-table-column>
      <el-table-column prop="caseTotal" label="号码总数" min-width="100" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.caseTotal}}</span>
          <el-button v-if="scope.row.importStatus != 7 && scope.row.repairStatus == 0" @click.native.prevent="onClickImport(scope.row, scope.$index)" @click.stop="stopEvent" type="primary" size="small" icon="el-icon-plus" plain class="btn-import-case">导入</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="caseSuccess" label="修复成功计数" min-width="100" align="center"> </el-table-column>
      <el-table-column prop="caseFailed" label="修复失败计数" min-width="100" align="center"> </el-table-column>
      <el-table-column prop="memo" label="备注">
        <template slot-scope="scope">
          <span>{{scope.row.memo}}</span>
          <el-button @click.native.prevent="editRow(scope.row, scope.$index)" @click.stop="stopEvent" type="text" size="small" icon="el-icon-edit-outline"></el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="180" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.caseTotal > 0" @click.native.prevent="onClickDetail(scope.row, scope.$index)" @click.stop="stopEvent" type="" size="small" icon="el-icon-folder-opened" plain>号码</el-button>
          <el-button v-if="scope.row.importStatus != 7 && scope.row.repairStatus != 7 && scope.row.caseTotal > scope.row.caseSuccess + scope.row.caseFailed" @click.native.prevent="onClickRepair(scope.row, scope.$index)" @click.stop="stopEvent" type="danger" size="small" icon="el-icon-caret-right" plain>修复</el-button>
          <el-button v-if="scope.row.caseTotal > 0" @click.native.prevent="onClickLog(scope.row, scope.$index)" @click.stop="stopEvent" type="" size="small" icon="el-icon-document" plain>日志</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>

    <el-dialog title="编辑批次" :visible.sync="eForm.visible" @closed="formClosed('editForm')" width="500px">
      <el-form ref="editForm" :model="eForm" :rules="ruleForm" label-width="80px">
        <el-form-item v-if="eForm.id == ''" label="商户" prop="merchantid">
          <el-select v-model="eForm.merchantid" placeholder="请输入关键词" filterable remote reserve-keyword clearable
           :remote-method="reloadMerchant4Edit4Select" :loading="loadingMerchant4Edit">
            <el-option v-for="item in merchantOptions4Edit" :key="item.id" :label="item.name" :value="item.entityId">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备忘" prop="memo">
          <el-input v-model="eForm.memo"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editFormCancel">取 消</el-button>
        <el-button type="primary" @click="editFormConfirm('editForm')">保 存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="导入号码" :visible.sync="importForm.visible" @closed="importFormClosed('importCasesForm')" width="500px">
      <el-form ref="importCasesForm" :model="importForm" :rules="ruleImportForm" label-width="80px">
        <el-form-item label="文件" prop="file">
          <el-upload
            ref="importCasesFile"
            action=""
            accept=".txt,.csv,.xls,.xlsx"
            :limit=1
            :on-change="onChangeImportFile"
            :file-list="importFiles"
            :auto-upload="false">
            <el-button size="small" type="primary">浏览</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div>
        <el-link :underline="false" :href="demoImportCasesExcelUrl" download="号码导入模板.xlsx" target="_blank"><el-button type="text">Excel导入模板</el-button></el-link>
      </div>
      <div>
        <el-link :underline="false" :href="demoImportCasesUrl" download="号码导入模板.txt" target="_blank"><el-button type="text">TXT导入模板</el-button></el-link>
        <span style="margin-left: 10px; color: #ff0000; font-size: 12px;">请注意确保TXT文件的编码是UTF-8</span>
      </div>
      <span slot="footer">
        <div>
          <el-button @click="importFormCancel">取 消</el-button>
          <el-button type="primary" @click="importFormConfirm('importCasesForm')">上 传</el-button>
        </div>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Paging from '../../../components/Paging'

export default {
  data() {
    let vldMerchant = (rule, value, callback) => {
      if (this.eForm.id) {
        callback()
        return
      }
      if (value === '' || value.length == 0) {
        callback(new Error('请选择商户'))
      } else {
        callback()
      }
    }
    let vldMemo = (rule, value, callback) => {
      if (value) {
        if (!/^[\u4e00-\u9fa5\w\\.-]{1,50}$/.test(value)) {
          callback(new Error('中文、英文、数字或.-_，且长度不超过50'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    let _minTime = null
    let _maxTime = null
    return {
      merchantOptions: [],
      loadingMerchant: false,
      merchantOptions4Edit: [],
      loadingMerchant4Edit: false,
      loadingTableData: false,
      demoImportCasesUrl: '/static/demoImportCases.txt',
      demoImportCasesExcelUrl: '/static/demoImportCases.xlsx',
      importStatusOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '未导入'
      }, {
        value: 7,
        label: '导入中'
      }, {
        value: 1,
        label: '导入完成'
      }, {
        value: 2,
        label: '导入失败'
      }],
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
        label: '修复完成'
      }, {
        value: 2,
        label: '修复失败'
      }],
      pickerQueryDate: {
        onPick(time) { // 如果选择了只选择了一个时间
          if (!time.maxDate) {
            let timeRange = 30 * 24 * 60 * 60 * 1000 // 30天
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
      eForm: {
        id: '',
        memo: '',
        merchantid: '',
        visible: false
      },
      importForm: {
        id: '',
        visible: false
      },
      importFiles: [],
      ruleForm: {
        merchantid: [{ validator: vldMerchant, trigger: 'blur' }],
        memo: [{ validator: vldMemo, trigger: 'blur' }]
      },
      ruleImportForm: {},
      tableData: [],
      queryCondition: {
        importStatus: -1,
        repairStatus: -1,
        merchant: '',
        queryDate: [new Date().toLocaleDateString().split('/').join('-'), new Date().toLocaleDateString().split('/').join('-')], // 默认选择当天，看个人需求
        memo: ''
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
        url: this.BIZ_API_HOST + '/api/auth/admin/repairBatchList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          beginDate: this.queryCondition.queryDate[0],
          endDate: this.queryCondition.queryDate[1],
          merchantId: this.queryCondition.merchant,
          memo: this.queryCondition.memo,
          importStatus: this.queryCondition.importStatus,
          repairStatus: this.queryCondition.repairStatus
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
    // 当前页发生改变时触发，重新请求数据
    goPage(page) {
      this.page = page
      this.refreshList()
    },
    editRow(row, index) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/repairBatch',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: row.id
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.eForm.id = res.data.id
            this.eForm.memo = res.data.memo
            this.eForm.merchantid = res.data.merchantId
            this.eForm.visible = true
            return
          }
          this.$message.error('读取数据异常')
          return
        }
        this.$message.error('读取数据异常')
      })
    },
    clickNew() {
      this.eForm.id = ''
      this.eForm.memo = ''
      this.eForm.merchantid = ''
      this.eForm.visible = true
      this.reloadMerchant4Edit4Select()
    },
    formClosed(formName) {
      this.$refs[formName].resetFields()
    },
    editFormCancel() {
      this.eForm.visible = false
    },
    editFormConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.BIZ_API_HOST + '/api/auth/admin/repairBatchEdit',
          method: 'post',
          data: {
            merchantId: this.eForm.merchantid,
            id: this.eForm.id,
            memo: this.eForm.memo
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.eForm.visible = false
              this.refreshList()
              return
            }
            this.$message.error('数据保存异常')
            return
          }
          this.$message.error('数据保存异常')
        })
      })
    },
    onClickImport(row, index) {
      this.importForm.id = row.id
      this.importForm.visible = true
      // this.importFiles = []
    },
    onChangeImportFile(file) {
      let suffixList = '.txt,.csv,.xls,.xlsx'
      let x = file.name.lastIndexOf('.')
      let filesuffix = file.name.substring(x + 1)
      if (suffixList.indexOf(filesuffix) === -1) {
        this.$message.error('文件类型不符')
        this.importFiles = []
        return false
      }
      const sizeChk = file.size / 1024 / 1024 < 5
      if (!sizeChk) {
        this.$message.error('文件大小不能超过5M')
        this.importFiles = []
        return false
      }
    },
    importFormClosed(formName) {
      this.formClosed(formName)
      this.importFiles = []
    },
    importFormCancel() {
      this.importForm.visible = false
    },
    importFormConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        if (this.$refs.importCasesFile.uploadFiles.length === 0) {
          return
        }
        let formData = new FormData()
        formData.append('id', this.importForm.id)
        formData.append('file', this.$refs.importCasesFile.uploadFiles[0].raw)
        // formData.append('file', this.$refs.importCasesFile.uploadFiles.pop().raw) // pop方式会把页面上的文件清掉，不利于再次提交
        this.$AxiosWithToken({
          url: this.BIZ_API_HOST + '/api/auth/admin/repairBatchImportCases',
          method: 'post',
          headers: {
            'Content-Type': 'multipart/form-data' // 'application/x-www-form-urlencoded'
          },
          data: formData
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              if (res.data) {
                let msg = ''
                let err = false
                if (res.data.cntSuccess > 0) {
                  msg += '<p style="line-height: 26px; color: #67C23A;">成功导入' + res.data.cntSuccess + '条数据</p>'
                } else {
                  msg += '<p style="line-height: 26px; color: #E6A23C;">本次没有数据被导入</p>'
                }
                if (res.data.cntFail > 0) {
                  err = true
                  msg += '<p style="line-height: 26px;color: #ff0000;">有<span style="font-size: 18px; margin: 0 5px; font-weight: bold;">' + res.data.cntFail + '</span>条数据<strong>保存失败</strong></p>'
                }
                if (res.data.cntExist > 0) {
                  err = true
                  msg += '<p style="line-height: 26px;color: #777777;">有<span style="font-size: 18px; margin: 0 5px;">' + res.data.cntExist + '</span>条数据已存在，被忽略</p>'
                }
                if (err) {
                  this.$message.warning({
                    dangerouslyUseHTMLString: true,
                    message: msg,
                    duration: 20000,
                    showClose: true
                  })
                } else {
                  this.$message.success({
                    dangerouslyUseHTMLString: true,
                    message: msg,
                    duration: 10000,
                    showClose: true
                  })
                }
              } else {
                this.$message.success('导入成功')
              }
              this.importForm.visible = false
              this.refreshList()
              return
            } else if (res.code === 400) {
              if (res.data) {
                if (res.data.errCode === -3) {
                  this.$message.error('当前状态不允许导入操作')
                  return
                } else if (res.data.errCode === -11) {
                  this.$message.error('文件读取异常')
                  return
                } else if (res.data.errCode === -12) {
                  this.$message.error('没有符合格式的数据')
                  return
                }
              }
            }
            this.$message.error('数据保存异常')
            return
          }
          this.$message.error('数据保存异常')
        })
      })
    },
    onClickRepair(row, index) {
      let txt = '<p>确定要修复这批号码?</p>'
      txt += '<p>批号：' + row.id + '</p>'
      txt += '<p>除去已修复过的号码(包括成功和失败)，共' + (row.caseTotal - row.caseSuccess - row.caseFailed) + '条将开始执行修复</p>'
      this.$confirm(txt, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doRepair(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doRepair(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/repairBatchStart',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: id
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.refreshList()
            this.$message.success('操作成功')
            return
          } else if (res.code === 400) {
            if (res.msg && res.msg === '-2') {
              this.$message.error('该批目前状态不能开始修复')
            } else if (res.msg && res.msg === '-3') {
              this.$message.error('该批还有号码尚未修复完成，不能新开始修复')
            } else if (res.msg && res.msg === '-101') {
              this.$message.error('余额不足，请确保账户充足')
            } else if (res.msg && res.msg === '-102') {
              this.$message.error('获取价格信息失败，请联系管理员')
            } else if (res.msg && res.msg === '-302') {
              this.$message.error('待修复号码数不足50个')
            } else {
              this.$message.error('操作失败')
            }
            return
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    },
    onClickDetail(row, index) {
      this.$router.push({
        query: {
          batch: row.id,
          merchant: row.merchantId,
          title: '批次号码[批号' + row.id + ']',
          crumbs: '号码修复,批次管理,批次号码'
        },
        path: '/admin/repairphone/batchdetail'
      })
    },
    onClickLog(row, index) {
      this.$router.push({
        query: {
          batch: row.id,
          title: '修复日志[批号' + row.id + ']',
          crumbs: '号码修复,批次管理,修复日志'
        },
        path: '/admin/repairphone/repairlog'
      })
    },
    reloadMerchant4Select(query) {
      this.loadingMerchant = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/merchantList4Select',
        // method: 'post',
        params: {
          name: query,
          pageIndex: 1,
          pageSize: 9999
        }
      }).then(res => {
        this.loadingMerchant = false
        if (res && res.code) {
          if (res.code === 200) {
            this.merchantOptions = res.data.rows
            return
          }
        }
        this.merchantOptions = []
      })
    },
    reloadMerchant4Edit4Select(query) {
      this.loadingMerchant4Edit = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/merchantList4Select',
        // method: 'post',
        params: {
          name: query,
          pageIndex: 1,
          pageSize: 9999
        }
      }).then(res => {
        this.loadingMerchant4Edit = false
        if (res && res.code) {
          if (res.code === 200) {
            this.merchantOptions4Edit = res.data.rows
            return
          }
        }
        this.merchantOptions4Edit = []
      })
    }
  },
  created() {
    let now = new Date()
    let beginDay = new Date()
    beginDay.setDate(beginDay.getDate() - 30)
    beginDay = new Date(beginDay)
    this.queryCondition.queryDate[0] = beginDay.toLocaleDateString().split('/').join('-')
    this.queryCondition.queryDate[1] = now.toLocaleDateString().split('/').join('-')
    this.refreshList()
    this.reloadMerchant4Select()
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
.el-button--small.btn-import-case{
  padding: 5px;
  margin-left: 10px;
}
</style>
