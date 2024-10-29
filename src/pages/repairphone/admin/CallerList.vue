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
        <el-button type="primary" @click="clickQuery" icon="el-icon-search" :loading="loadingTableData">查询</el-button>
      </div>
      <div class="tbl-btns-r">
        <el-button type="success" @click="clickNew" icon="el-icon-circle-plus">新增</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="code" label="编码" min-width="100">
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
            <el-button @click.native.prevent="lockCaller(scope.row, scope.$index)" @click.stop="stopEvent" type="info" size="mini" icon="el-icon-lock" circle></el-button>
          </div>
          <div v-if="scope.row.status == 1">
            <span style="color: #aaa;">锁定</span>
            <el-button @click.native.prevent="resumeCaller(scope.row, scope.$index)" @click.stop="stopEvent" type="danger" size="mini" icon="el-icon-unlock" circle></el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="numberA" label="A号" min-width="120" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.numberA == ''">-</span>
          <div v-if="scope.row.numberA != ''">
            <span>{{scope.row.numberA}}</span>
            <el-button @click.native.prevent="unBindCallNumber(scope.row, scope.$index, 1)" @click.stop="stopEvent" type="danger" size="mini" icon="el-icon-close" circle></el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="numberX" label="X号" min-width="120" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.numberX == ''">-</span>
          <div v-if="scope.row.numberX != ''">
            <span>{{scope.row.numberX}}</span>
            <el-button @click.native.prevent="unBindCallNumber(scope.row, scope.$index, 2)" @click.stop="stopEvent" type="danger" size="mini" icon="el-icon-close" circle></el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="memo" label="备忘" min-width="160"> </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="120" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status == 0" @click.native.prevent="resetPassword(scope.row, scope.$index)" @click.stop="stopEvent" type="warning" size="small" plain>重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>

    <el-dialog title="编辑坐席" :visible.sync="eForm.visible" @closed="formClosed('editForm')" width="500px">
      <el-form ref="editForm" :model="eForm" :rules="ruleForm" label-width="80px">
        <el-form-item label="编码" prop="code">
          <el-input v-model="eForm.code" autofocus>
            <template slot="prepend">{{shortCode}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="eForm.name"></el-input>
        </el-form-item>
        <el-form-item label="备忘" prop="memo">
          <el-input v-model="eForm.memo"></el-input>
        </el-form-item>
        <el-form-item v-if="eForm.id == ''" label="密码" prop="pwd">
          <el-input v-model="eForm.pwd" show-password></el-input>
        </el-form-item>
        <el-form-item label="A号" prop="numbera">
          <el-select v-model="eForm.numbera" clearable
           :loading="loadingNumberA">
            <el-option v-for="item in numberAOptions" :key="item.value" :label="item.label" :value="item.value">
              <span style="float: left">{{ item.value }}</span>
              <span v-if="item.caller != ''" style="float: right; color: #8492a6; font-size: 13px">{{ item.caller }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="X号" prop="numberx">
          <el-select v-model="eForm.numberx" clearable
           :loading="loadingNumberX">
            <el-option v-for="item in numberXOptions" :key="item.value" :label="item.label" :value="item.value">
              <span style="float: left">{{ item.value }}</span>
              <span v-if="item.caller != ''" style="float: right; color: #8492a6; font-size: 13px">{{ item.caller }}</span>
            </el-option>
          </el-select>
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
    return {
      merchantId: 0,
      shortCode: '',
      numberAOptions: [],
      numberXOptions: [],
      loadingNumberA: false,
      loadingNumberX: false,
      loadingTableData: false,
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
        numbera: '',
        numberx: '',
        pwd: '',
        visible: false
      },
      pwdForm: {
        id: '',
        pwd: '',
        name: '',
        visible: false
      },
      ruleForm: {
        code: [{ validator: vldCode, trigger: 'blur' }],
        name: [{ validator: vldName, trigger: 'blur' }],
        memo: [{ validator: vldMemo, trigger: 'blur' }],
        pwd: [{ validator: vldPwd, trigger: 'blur' }]
      },
      rulePwdForm: {
        pwd: [{ validator: vldResetPwd, trigger: 'blur' }]
      },
      tableData: [],
      queryCondition: {
        name: '',
        status: 0
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
        url: this.BIZ_API_HOST + '/api/auth/admin/callerList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          merchantId: this.merchantId,
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          name: this.queryCondition.name,
          status: this.queryCondition.status
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
      if (!this.shortCode) {
        this.$message.error('缺少简码前缀')
        return
      }
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/caller',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: row.id
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.eForm.id = res.data.id
            let idx = res.data.code.indexOf(this.shortCode)
            if (idx == 0) {
              this.eForm.code = res.data.code.substr(this.shortCode.length)
            } else {
              this.eForm.code = res.data.code
            }
            this.eForm.name = res.data.name
            this.eForm.memo = res.data.memo
            this.eForm.numbera = res.data.numberA
            this.eForm.numberx = res.data.numberX
            this.eForm.pwd = ''
            this.eForm.visible = true
            this.reloadNumberA4Select('')
            this.reloadNumberX4Select('')
            return
          }
          this.$message.error('读取数据异常')
          return
        }
        this.$message.error('读取数据异常')
      })
    },
    lockCaller(row, index) {
      this.$confirm('确定要锁定坐席【' + row.name + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doLockCaller(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doLockCaller(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callerDelete',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          merchantId: this.merchantId,
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
    resumeCaller(row, index) {
      this.$confirm('确定要解锁坐席【' + row.name + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doResumeCaller(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doResumeCaller(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callerResume',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          merchantId: this.merchantId,
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
    unBindCallNumber(row, index, numType) {
      let nTypeName = numType === 1 ? 'A' : 'X'
      let numberId = numType === 1 ? row.numberA : row.numberX
      this.$confirm('确定要解除坐席【' + row.name + '】与' + nTypeName + '号【' + numberId + '】的关联?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doUnBindCallNumber(numberId)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doUnBindCallNumber(n) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callerUnBindCallNumber',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          merchantId: this.merchantId,
          number: n
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
      if (!this.shortCode) {
        this.$message.warning('缺少简码前缀')
        return
      }
      this.eForm.id = ''
      this.eForm.code = ''
      this.eForm.name = ''
      this.eForm.memo = ''
      this.eForm.numbera = ''
      this.eForm.numberx = ''
      this.eForm.pwd = ''
      this.eForm.visible = true
      this.reloadNumberA4Select('')
      this.reloadNumberX4Select('')
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
          editUrl = this.BIZ_API_HOST + '/api/auth/admin/callerEdit'
          reqParam = {
            id: this.eForm.id,
            code: this.shortCode + this.eForm.code,
            name: this.eForm.name,
            memo: this.eForm.memo,
            numberA: this.eForm.numbera,
            numberX: this.eForm.numberx
          }
        } else {
          editUrl = this.BIZ_API_HOST + '/api/auth/admin/callerAdd'
          reqParam = {
            merchantId: this.merchantId,
            password: this.eForm.pwd,
            code: this.shortCode + this.eForm.code,
            name: this.eForm.name,
            memo: this.eForm.memo,
            numberA: this.eForm.numbera,
            numberX: this.eForm.numberx
          }
        }
        this.$AxiosWithToken({
          url: editUrl,
          method: 'post',
          data: reqParam
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              if (res.msg && res.msg === '1') {
                this.$message.error('基本信息保存成功，但A号保存失败！')
                this.refreshList()
                if (!this.eForm.id > 0) {
                  this.eForm.visible = false
                }
              } else if (res.msg && res.msg === '2') {
                this.$message.error('基本信息保存成功，但X号保存失败！')
                this.refreshList()
                if (!this.eForm.id > 0) {
                  this.eForm.visible = false
                }
              } else if (res.msg && res.msg === '3') {
                this.$message.error('基本信息保存成功，但A号和X号保存失败！')
                this.refreshList()
                if (!this.eForm.id > 0) {
                  this.eForm.visible = false
                }
              } else {
                this.$message.success('保存成功')
                this.eForm.visible = false
                this.refreshList()
              }
              return
            } else if (res.code === 400) {
              if (res.msg && res.msg === '-2') {
                this.$message.error('编码已经存在')
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
    reloadNumberA4Select(query) {
      this.loadingNumberA = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberList4Select',
        // method: 'post',
        params: {
          merchantId: this.merchantId,
          number: query,
          numberType: 1,
          showOccupied: 1
        }
      }).then(res => {
        this.loadingNumberA = false
        if (res && res.code) {
          if (res.code === 200) {
            this.numberAOptions = res.data.rows
            return
          }
        }
        this.numberAOptions = []
      })
    },
    reloadNumberX4Select(query) {
      this.loadingNumberX = true
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberList4Select',
        // method: 'post',
        params: {
          merchantId: this.merchantId,
          number: query,
          numberType: 2,
          showOccupied: 1
        }
      }).then(res => {
        this.loadingNumberX = false
        if (res && res.code) {
          if (res.code === 200) {
            this.numberXOptions = res.data.rows
            return
          }
        }
        this.numberXOptions = []
      })
    }
  },
  watch: {
    // 同个页面组件，由于不同参数切换显示，需要监听此方法达到刷新，不会再次触发mounted和created
    $route: function(to) {
      this.shortCode = to.query.shortcode || ''
      this.merchantId = to.query.merchant || 0
      // this.queryCondition.name = ''
      this.shortCode = this.shortCode + '_'
      this.refreshList()
    }
  },
  mounted() {
    this.shortCode = this.$route.query.shortcode || ''
    this.merchantId = this.$route.query.merchant || 0
    this.shortCode = this.shortCode + '_'
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
