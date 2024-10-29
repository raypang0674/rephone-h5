<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">名称：</span>
        <el-input v-model="queryCondition.name" :clearable="true" :style="{ width: '160px' }"></el-input>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search">查询</el-button>
      </div>
      <div class="tbl-btns-r">
        <el-button type="success" @click="clickNew" icon="el-icon-circle-plus">新增</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="id" label="ID" min-width="120"> </el-table-column>
      <el-table-column label="名称" min-width="120">
        <template slot-scope="scope">
          <span>{{scope.row.feeRateName}}</span>
          <el-button @click.native.prevent="editRow(scope.row, scope.$index)" @click.stop="stopEvent" type="text" size="small" icon="el-icon-edit"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="feeRepair" label="修复费/笔" min-width="100" align="right" :formatter="moneyFormatter"> </el-table-column>
      <el-table-column prop="feeXRent" label="X号租金/月" min-width="100" align="right" :formatter="moneyFormatter"> </el-table-column>
      <el-table-column prop="feeXCall" label="X号通讯费/分钟" min-width="120" align="right" :formatter="moneyFormatter"> </el-table-column>
      <el-table-column prop="countUsers" label="在用商户" min-width="100" align="center"> </el-table-column>
      <el-table-column prop="memo" label="备忘" min-width="250"> </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="120" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.countUsers == 0" @click.native.prevent="deleteFeeRate(scope.row, scope.$index)" @click.stop="stopEvent" type="danger" size="small" icon="el-icon-delete" plain>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>

    <el-dialog title="编辑费率" :visible.sync="eForm.visible" @closed="formClosed('editForm')" width="500px">
      <el-form ref="editForm" :model="eForm" :rules="ruleForm" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="eForm.name"></el-input>
        </el-form-item>
        <el-form-item label="修复费" prop="feeRepair">
          <el-input v-model="eForm.feeRepair" placeholder="单位：元"></el-input>
        </el-form-item>
        <el-form-item label="X月租" prop="feeXRent">
          <el-input v-model="eForm.feeXRent" placeholder="单位：元"></el-input>
        </el-form-item>
        <el-form-item label="X通讯" prop="feeXCall">
          <el-input v-model="eForm.feeXCall" placeholder="单位：元"></el-input>
        </el-form-item>
        <el-form-item label="备忘" prop="memo">
          <el-input v-model="eForm.memo"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="formCancel">取 消</el-button>
        <el-button type="primary" @click="formConfirm('editForm')">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Paging from '../../../components/Paging'

export default {
  data() {
    let vldName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入名称'))
      } else if (!/^[\u4e00-\u9fa5\w\\.-]{1,20}$/.test(value)) {
        callback(new Error('中文、英文、数字或.-_，且长度不超过20'))
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
    let vldFee = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入金额'))
      } else if (!/^([1-9]{1}\d*)|([0]{1})(\\.\d{0,2})?$/.test(value)) {
        callback(new Error('2位小数'))
      } else {
        callback()
      }
    }
    return {
      eForm: {
        id: '',
        name: '',
        memo: '',
        feeRepair: 0,
        feeXRent: 0,
        feeXCall: 0,
        visible: false
      },
      ruleForm: {
        name: [{ validator: vldName, trigger: 'blur' }],
        memo: [{ validator: vldMemo, trigger: 'blur' }],
        bindip: [{ validator: vldFee, trigger: 'blur' }],
        shortcode: [{ validator: vldFee, trigger: 'blur' }],
        pwd: [{ validator: vldFee, trigger: 'blur' }]
      },
      queryCondition: {
        name: ''
      },
      tableData: [],
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
        url: this.BIZ_API_HOST + '/api/auth/admin/repairFeeRateList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          name: this.queryCondition.name
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
    editRow(row, index) {
      this.eForm.id = row.id
      this.eForm.name = row.feeRateName
      this.eForm.memo = row.memo
      this.eForm.feeRepair = this.moneyFormatter(row, '', row.feeRepair)
      this.eForm.feeXRent = this.moneyFormatter(row, '', row.feeXRent)
      this.eForm.feeXCall = this.moneyFormatter(row, '', row.feeXCall)
      this.eForm.visible = true
    },
    clickNew() {
      this.eForm.id = ''
      this.eForm.name = ''
      this.eForm.memo = ''
      this.eForm.feeRepair = ''
      this.eForm.feeXRent = ''
      this.eForm.feeXCall = ''
      this.eForm.visible = true
    },
    formClosed(formName) {
      this.$refs[formName].resetFields()
    },
    formCancel() {
      this.eForm.visible = false
    },
    formConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.BIZ_API_HOST + '/api/auth/admin/repairFeeRateEdit',
          method: 'post',
          data: {
            id: this.eForm.id,
            name: this.eForm.name,
            memo: this.eForm.memo,
            feeRepair: Number(this.eForm.feeRepair) * 100,
            feeXRent: Number(this.eForm.feeXRent) * 100,
            feeXCall: Number(this.eForm.feeXCall) * 100
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.eForm.visible = false
              this.refreshList()
              return
            }
            this.$message.error('数据保存失败')
            return
          }
          this.$message.error('数据保存异常')
        })
      })
    },
    deleteFeeRate(row, index) {
      this.$confirm('确定要删除费率【' + row.feeRateName + '】?删除后将无法恢复！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doDeleteFeeRate(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doDeleteFeeRate(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/repairFeeRateDelete',
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
            if (res.msg && res.msg === '-3') {
              this.$message.error('还有商户在用，不能删除')
              return
            }
            this.$message.error('删除失败')
            return
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    },
    moneyFormatter(row, column, cellValue) {
      var p = cellValue / 100
      return p.toFixed(2)
    }
  },
  created() {
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
