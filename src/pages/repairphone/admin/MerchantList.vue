<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">名称/编码：</span>
        <el-input v-model="queryCondition.name" placeholder="输入名称或编码" :clearable="true" :style="{ width: '160px' }"></el-input>
        <span class="lab">状态：</span>
        <el-select v-model="queryCondition.status" :style="{ width: '100px' }">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search">查询</el-button>
      </div>
      <div class="tbl-btns-r">
        <el-button type="success" @click="clickNew" icon="el-icon-circle-plus">新增</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="code" label="编码" min-width="120">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
          <el-button v-if="scope.row.status == 0" @click.native.prevent="editRow(scope.row, scope.$index)" @click.stop="stopEvent" type="text" size="small" icon="el-icon-edit"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="120"> </el-table-column>
      <el-table-column label="状态" min-width="80" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.status == 0">
            <span>正常</span>
            <el-button @click.native.prevent="lockMerchant(scope.row, scope.$index)" @click.stop="stopEvent" type="info" size="mini" icon="el-icon-lock" circle></el-button>
          </div>
          <div v-if="scope.row.status == 1">
            <span style="color: #aaa;">锁定</span>
            <el-button @click.native.prevent="resumeMerchant(scope.row, scope.$index)" @click.stop="stopEvent" type="danger" size="mini" icon="el-icon-unlock" circle></el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="余额" min-width="120" align="right">
        <template slot-scope="scope">
          {{moneyFormatter(null,null,scope.row.balance)}}
          <el-button v-if="scope.row.status == 0" @click.native.prevent="editRecharge(scope.row, scope.$index)" @click.stop="stopEvent" title="加款" type="text" size="small" icon="el-icon-plus"></el-button>
          <el-button @click.native.prevent="viewAccoutingLog(scope.row, scope.$index)" @click.stop="stopEvent" title="资金流水" type="text" size="small" icon="el-icon-document"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="frozenAmount" label="冻结" min-width="80" align="right" :formatter="moneyFormatter"> </el-table-column>
      <el-table-column prop="creditLine" label="授信" min-width="100" align="right">
        <template slot-scope="scope">
          {{moneyFormatter(null,null,scope.row.creditLine)}}
          <el-button v-if="scope.row.status == 0" @click.native.prevent="editCreditLine(scope.row, scope.$index)" @click.stop="stopEvent" title="授信" type="text" size="small" icon="el-icon-edit-outline"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="countCaller" label="坐席" min-width="90" align="center">
        <template slot-scope="scope">
          {{scope.row.countCaller}}
          <el-button @click.native.prevent="manageCaller(scope.row, scope.$index)" @click.stop="stopEvent" title="坐席管理" type="text" size="small" icon="el-icon-edit-outline"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="countNumberA" label="A号" min-width="90" align="center">
        <template slot-scope="scope">
          {{scope.row.countNumberA}}
          <el-button @click.native.prevent="distCallNumber(scope.row, scope.$index, 1)" @click.stop="stopEvent" title="A号分配" type="text" size="small" icon="el-icon-edit-outline"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="countNumberX" label="X号" min-width="90" align="center">
        <template slot-scope="scope">
          {{scope.row.countNumberX}}
          <el-button @click.native.prevent="distCallNumber(scope.row, scope.$index, 2)" @click.stop="stopEvent" title="X号分配" type="text" size="small" icon="el-icon-edit-outline"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="repairFeeRateId" label="修复费率" min-width="120" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.repairFeeRateId == 0">-</span>
          <div v-if="scope.row.repairFeeRateId > 0">
            <span>{{scope.row.repairFeeRateVO.feeRateName}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="bindIP" label="接口IP" min-width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.bindIP == ''">-</span>
          <span v-if="scope.row.bindIP != ''">{{scope.row.bindIP}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="memo" label="备忘" min-width="120"> </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="120" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status == 0" @click.native.prevent="resetPassword(scope.row, scope.$index)" @click.stop="stopEvent" type="warning" size="small" plain>重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>

    <el-dialog title="编辑商户" :visible.sync="eForm.visible" @closed="formClosed('editForm')" width="500px">
      <el-form ref="editForm" :model="eForm" :rules="ruleForm" label-width="80px">
        <el-form-item label="编码" prop="code">
          <el-input v-model="eForm.code" autofocus></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="eForm.name"></el-input>
        </el-form-item>
        <el-form-item label="备忘" prop="memo">
          <el-input v-model="eForm.memo"></el-input>
        </el-form-item>
        <el-form-item label="费率" prop="numbera">
          <el-select v-model="eForm.repairFeeRateId" clearable
           :loading="loadingRepairFeeRate">
            <el-option v-for="item in repairFeeRateOptions" :key="item.id" :label="item.feeRateName" :value="item.id">
              <span>{{ item.feeRateName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="IP" prop="bindip">
          <el-input v-model="eForm.bindip" placeholder="请输入接口绑定IP,多个IP用英文逗号“,”分隔"></el-input>
        </el-form-item>
        <el-form-item v-if="eForm.id == ''" label="简码" prop="shortcode">
          <el-input v-model="eForm.shortcode" placeholder="用于坐席编码前缀"></el-input>
        </el-form-item>
        <el-form-item v-if="eForm.id == ''" label="密码" prop="pwd">
          <el-input v-model="eForm.pwd" show-password></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="formCancel">取 消</el-button>
        <el-button type="primary" @click="formConfirm('editForm')">保 存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="'重置密码 - ' + pwdForm.name" :visible.sync="pwdForm.visible" @closed="formClosed('resetPwdForm')" width="500px">
      <el-form ref="resetPwdForm" :model="pwdForm" :rules="rulePwdForm" label-width="80px">
        <el-form-item label="新密码" prop="pwd">
          <el-input v-model="pwdForm.pwd" show-password></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="resetPwdFormCancel">取 消</el-button>
        <el-button type="primary" @click="resetPwdFormConfirm('resetPwdForm')">保 存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="'授信 - ' + creditForm.name" :visible.sync="creditForm.visible" @closed="formClosed('editCreditForm')" width="500px">
      <el-form ref="editCreditForm" :model="creditForm" :rules="ruleCreditForm" label-width="80px">
        <el-form-item label="金额" prop="credit">
          <el-input v-model="creditForm.credit" placeholder="单位：元, 填负数相当于保证金"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="creditFormCancel">取 消</el-button>
        <el-button type="primary" @click="creditFormConfirm('editCreditForm')">保 存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="'加款 - ' + rechargeForm.name" :visible.sync="rechargeForm.visible" @closed="formClosed('editRechargeForm')" width="500px">
      <el-form ref="editRechargeForm" :model="rechargeForm" :rules="ruleRechargeForm" label-width="80px">
        <el-form-item label="金额" prop="amount">
          <el-input v-model="rechargeForm.amount" placeholder="单位：元, 填负数相当于扣款"></el-input>
        </el-form-item>
        <el-form-item label="备忘" prop="memo">
          <el-input v-model="rechargeForm.memo"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="rechargeFormCancel">取 消</el-button>
        <el-button type="primary" @click="rechargeFormConfirm('editRechargeForm')">加 款</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Paging from '../../../components/Paging'

export default {
  data() {
    let vldCode = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入编码'))
      } else if (!/^[\w\\.-]{1,20}$/.test(value)) {
        callback(new Error('英文、数字或.-_，且长度不超过20'))
      } else {
        callback()
      }
    }
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
    let vldBindIP = (rule, value, callback) => {
      if (value) {
        if (!/^[0-9\\.,]{1,500}$/.test(value)) {
          callback(new Error('数字或,或.且长度不超过50'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    let vldShortCode = (rule, value, callback) => {
      if (this.eForm.id) {
        callback()
        return
      }
      if (value === '') {
        callback(new Error('请输入简码'))
      } else if (!/^[A-Za-z0-9]{1,10}$/.test(value)) {
        callback(new Error('英文、数字，且长度不超过10'))
      } else {
        callback()
      }
    }
    let vldPwd = (rule, value, callback) => {
      if (this.eForm.id) {
        callback()
        return
      }
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (!/^[\w\W]{1,20}$/.test(value)) {
        callback(new Error('长度不超过20'))
      } else {
        callback()
      }
    }
    let vldResetPwd = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else if (!/^[\w\W]{1,20}$/.test(value)) {
        callback(new Error('长度不超过20'))
      } else {
        callback()
      }
    }
    let vldCreditLine = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入金额'))
      } else if (!/^-?(([1-9]{1}\d*)|([0]{1}))(\.\d{0,2})?$/.test(value)) {
        callback(new Error('2位小数，可以为负数'))
      } else {
        callback()
      }
    }
    return {
      repairFeeRateOptions: [],
      loadingRepairFeeRate: false,
      statusOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '正常'
      }, {
        value: 1,
        label: '锁定'
      }],
      eForm: {
        id: '',
        code: '',
        name: '',
        memo: '',
        repairFeeRateId: '',
        bindip: '',
        shortcode: '',
        pwd: '',
        visible: false
      },
      pwdForm: {
        id: '',
        pwd: '',
        name: '',
        visible: false
      },
      creditForm: {
        id: '',
        credit: '',
        name: '',
        visible: false
      },
      rechargeForm: {
        id: '',
        amount: '',
        memo: '',
        name: '',
        visible: false
      },
      ruleForm: {
        code: [{ validator: vldCode, trigger: 'blur' }],
        name: [{ validator: vldName, trigger: 'blur' }],
        memo: [{ validator: vldMemo, trigger: 'blur' }],
        bindip: [{ validator: vldBindIP, trigger: 'blur' }],
        shortcode: [{ validator: vldShortCode, trigger: 'blur' }],
        pwd: [{ validator: vldPwd, trigger: 'blur' }]
      },
      rulePwdForm: {
        pwd: [{ validator: vldResetPwd, trigger: 'blur' }]
      },
      ruleCreditForm: {
        credit: [{ validator: vldCreditLine, trigger: 'blur' }]
      },
      ruleRechargeForm: {
        memo: [{ validator: vldMemo, trigger: 'blur' }],
        amount: [{ validator: vldCreditLine, trigger: 'blur' }]
      },
      tableData: [],
      queryCondition: {
        name: '',
        status: -1
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
        url: this.BIZ_API_HOST + '/api/auth/admin/merchantList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          name: this.queryCondition.name,
          status: this.queryCondition.status
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
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/merchant',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: row.id
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.eForm.id = res.data.id
            this.eForm.code = res.data.code
            this.eForm.name = res.data.name
            this.eForm.memo = res.data.memo
            if (res.data.repairFeeRateId > 0) {
              this.eForm.repairFeeRateId = res.data.repairFeeRateId
            } else {
              this.eForm.repairFeeRateId = ''
            }
            this.eForm.bindip = res.data.bindIP
            this.eForm.shortcode = ''
            this.eForm.pwd = ''
            this.eForm.visible = true
            return
          }
          this.$message.error('读取数据异常')
          return
        }
        this.$message.error('读取数据异常')
      })
    },
    lockMerchant(row, index) {
      this.$confirm('确定要锁定商户【' + row.name + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doLockMerchant(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doLockMerchant(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/merchantDelete',
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
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    },
    resumeMerchant(row, index) {
      this.$confirm('确定要解锁商户【' + row.name + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doResumeMerchant(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doResumeMerchant(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/merchantResume',
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
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    },
    clickNew() {
      this.eForm.id = ''
      this.eForm.code = ''
      this.eForm.name = ''
      this.eForm.memo = ''
      this.eForm.repairFeeRateId = ''
      this.eForm.bindip = ''
      this.eForm.shortcode = ''
      this.eForm.pwd = ''
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
        let editUrl
        let reqParam
        if (this.eForm.id > 0) {
          editUrl = this.BIZ_API_HOST + '/api/auth/admin/merchantEdit'
          reqParam = {
            id: this.eForm.id,
            code: this.eForm.code,
            name: this.eForm.name,
            memo: this.eForm.memo,
            bindIP: this.eForm.bindip,
            repairFeeRateId: this.eForm.repairFeeRateId
          }
        } else {
          editUrl = this.BIZ_API_HOST + '/api/auth/admin/merchantAdd'
          reqParam = {
            password: this.eForm.pwd,
            shortCode: this.eForm.shortcode,
            code: this.eForm.code,
            name: this.eForm.name,
            memo: this.eForm.memo,
            bindIP: this.eForm.bindip,
            repairFeeRateId: this.eForm.repairFeeRateId
          }
        }
        this.$AxiosWithToken({
          url: editUrl,
          method: 'post',
          data: reqParam
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.eForm.visible = false
              this.refreshList()
              return
            } else if (res.code === 400) {
              if (res.msg && res.msg === '-2') {
                this.$message.error('编码已经存在')
                return
              } else if (res.msg && res.msg === '-4') {
                this.$message.error('简码已经存在')
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
    resetPassword(row, index) {
      this.pwdForm.id = row.pmsUserId
      this.pwdForm.name = row.name
      this.pwdForm.pwd = ''
      this.pwdForm.visible = true
    },
    resetPwdFormCancel() {
      this.pwdForm.visible = false
    },
    resetPwdFormConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.BIZ_API_HOST + '/api/auth/admin/userResetPassword',
          method: 'post',
          data: {
            id: this.pwdForm.id,
            password: this.pwdForm.pwd
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('重置成功')
              this.pwdForm.visible = false
              // this.refreshList()
              return
            }
            this.$message.error('重置失败')
            return
          }
          this.$message.error('数据保存异常')
        })
      })
    },
    viewAccoutingLog(row, index) {
      this.$router.push({
        query: {
          merchant: row.id,
          title: '商户[' + row.name + ']的资金流水',
          crumbs: '商户管理,资金流水'
        },
        path: '/admin/merchantaccountinglog'
      })
    },
    editRecharge(row, index) {
      this.rechargeForm.id = row.id
      this.rechargeForm.name = row.name
      this.rechargeForm.amount = ''
      this.rechargeForm.memo = ''
      this.rechargeForm.visible = true
    },
    rechargeFormCancel() {
      this.rechargeForm.visible = false
    },
    rechargeFormConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.BIZ_API_HOST + '/api/auth/admin/merchantAccountIncrease',
          method: 'post',
          data: {
            id: this.rechargeForm.id,
            memo: this.rechargeForm.memo,
            amount: Number(this.rechargeForm.amount) * 100
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('加款成功')
              this.rechargeForm.visible = false
              this.refreshList()
              return
            }
            this.$message.error('执行异常')
            return
          }
          this.$message.error('执行异常')
        })
      })
    },
    editCreditLine(row, index) {
      this.creditForm.id = row.id
      this.creditForm.name = row.name
      this.creditForm.credit = ''
      this.creditForm.visible = true
    },
    creditFormCancel() {
      this.creditForm.visible = false
    },
    creditFormConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.BIZ_API_HOST + '/api/auth/admin/merchantEditCreditLine',
          method: 'post',
          data: {
            id: this.creditForm.id,
            creditLine: Number(this.creditForm.credit) * 100
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.creditForm.visible = false
              this.refreshList()
              return
            }
            this.$message.error('保存失败')
            return
          }
          this.$message.error('数据保存异常')
        })
      })
    },
    distCallNumber(row, index, numberType) {
      let ntype
      if (numberType === 1) {
        ntype = 'A'
      } else if (numberType === 2) {
        ntype = 'X'
      } else {
        return
      }
      this.$router.push({
        query: {
          numtype: numberType,
          merchant: row.id,
          title: '商户[' + row.name + ']的' + ntype + '号分配',
          crumbs: '商户管理,号码分配'
        },
        path: '/admin/callnumberdist'
      })
    },
    manageCaller(row, index) {
      this.$router.push({
        query: {
          merchant: row.id,
          shortcode: row.shortCode,
          title: '商户[' + row.name + ']的坐席',
          crumbs: '商户管理,坐席管理'
        },
        path: '/admin/callerlist'
      })
    },
    reloadRepairFeeRate4Select(query) {
      this.loadingRepairFeeRate = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/repairFeeRateList4Select',
        // method: 'post',
        params: {
          name: query
        }
      }).then(res => {
        this.loadingRepairFeeRate = false
        if (res && res.code) {
          if (res.code === 200) {
            this.repairFeeRateOptions = res.data.rows
            return
          }
        }
        this.repairFeeRateOptions = []
      })
    },
    moneyFormatter(row, column, cellValue) {
      var p = cellValue / 100
      return p.toFixed(2)
    }
  },
  created() {
    this.refreshList()
    this.reloadRepairFeeRate4Select()
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
