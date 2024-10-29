<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">用户名/昵称：</span>
        <el-input v-model="queryCondition.name" placeholder="输入用户名或昵称" :clearable="true" :style="{ width: '160px' }"></el-input>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search">查询</el-button>
      </div>
      <div class="tbl-btns-r">
        <el-button type="success" @click="clickNew" icon="el-icon-circle-plus">新增</el-button>
        <el-button type="danger" @click="clickDeleteSelected" icon="el-icon-remove">删除所选</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据" @row-click="clickRow" @selection-change="handleTableSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="code" label="用户名" min-width="200"> </el-table-column>
      <el-table-column prop="name" label="昵称" min-width="200"> </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="200" align="center">
        <template slot-scope="scope">
          <el-button @click.native.prevent="editRow(scope.row, scope.$index)" @click.stop="stopEvent" type="text" size="small">编辑</el-button>
          <el-button @click.native.prevent="resetPassword(scope.row, scope.$index)" @click.stop="stopEvent" type="text" size="small">重置密码</el-button>
          <el-button @click.native.prevent="editRoleRel(scope.row, scope.$index)" @click.stop="stopEvent" type="text" size="small">关联角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>

    <el-dialog title="编辑用户" :visible.sync="eForm.visible" @closed="formClosed('editForm')" width="500px">
      <el-form ref="editForm" :model="eForm" :rules="ruleForm" label-width="80px">
        <el-form-item label="用户名" prop="code">
          <el-input v-model="eForm.code" autofocus></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="eForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="eForm.passVisible">
          <el-input show-password v-model="eForm.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password2" v-if="eForm.passVisible">
          <el-input show-password v-model="eForm.password2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="formCancel">取 消</el-button>
        <el-button type="primary" @click="formConfirm('editForm')">保 存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="重置密码" :visible.sync="formResetPassword.visible" @closed="formClosed('formResetPwd')" width="500px">
      <el-form ref="formResetPwd" :model="formResetPassword" :rules="ruleFormResetPassword" label-width="80px">
        <el-form-item label="密码" prop="password">
          <el-input show-password v-model="formResetPassword.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password2">
          <el-input show-password v-model="formResetPassword.password2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="formResetPwdCancel">取 消</el-button>
        <el-button type="primary" @click="formResetPwdConfirm('formResetPwd')">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Paging from '../../components/Paging'

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
    let vldPassword = (rule, value, callback) => {
      if (value) {
        if (!/^[\w\W]{1,20}$/.test(value)) {
          callback(new Error('英文、数字等，且长度不超过20'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    let vldRePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认密码'))
      } else if (value != this.eForm.password) {
        callback(new Error('两次密码不一致，请重新输入'))
      } else {
        callback()
      }
    }
    let vldResetPwdPassword = (rule, value, callback) => {
      if (value) {
        if (!/^[\w\W]{1,20}$/.test(value)) {
          callback(new Error('英文、数字等，且长度不超过20'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    let vldResetPwdRePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认密码'))
      } else if (value != this.formResetPassword.password) {
        callback(new Error('两次密码不一致，请重新输入'))
      } else {
        callback()
      }
    }
    return {
      eForm: {
        id: 0,
        code: '',
        name: '',
        password: '',
        password2: '',
        passVisible: false,
        visible: false
      },
      ruleForm: {
        code: [{ validator: vldCode, trigger: 'blur' }],
        name: [{ validator: vldName, trigger: 'blur' }],
        password: [{ validator: vldPassword, trigger: 'blur' }],
        password2: [{ validator: vldRePass, trigger: 'blur' }]
      },
      formResetPassword: {
        id: 0,
        password: '',
        password2: '',
        visible: false
      },
      ruleFormResetPassword: {
        password: [{ validator: vldResetPwdPassword, trigger: 'blur' }],
        password2: [{ validator: vldResetPwdRePass, trigger: 'blur' }]
      },
      tableData: [],
      queryCondition: {
        name: ''
      },
      multipleSelection: [],
      pageLayout: null, // 'full'
      pageSize: 20,
      page: 1, // 当前页码
      total: 0 // 返回数据的总数
    }
  },
  methods: {
    clickQuery() {
      this.page = 1
      this.refreshList()
    },
    clickRow(row, column, event) {
      this.$refs.elTable.toggleRowSelection(row) // 补完行选中
    },
    stopEvent(event) {
      // 阻止按钮事件继续冒泡，影响行选择
    },
    refreshList() {
      this.$AxiosWithToken({
        url: this.PMS_API_HOST + '/api/auth/pms/userList',
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
      this.$AxiosWithToken({
        url: this.PMS_API_HOST + '/api/auth/pms/user',
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
            this.eForm.password = ''
            this.eForm.password2 = ''
            this.eForm.passVisible = false
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
      this.eForm.id = 0
      this.eForm.code = ''
      this.eForm.name = ''
      this.eForm.password = ''
      this.eForm.password2 = ''
      this.eForm.passVisible = true
      this.eForm.visible = true
    },
    handleTableSelectionChange(val) {
      this.multipleSelection = val
    },
    clickDeleteSelected() {
      if (!this.multipleSelection || this.multipleSelection.length <= 0) {
        return
      }
      this.$confirm('确定要删除所选?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doDeleteSelected()
        })
        .catch(() => {
          // 几点取消的提示
        })
    },
    doDeleteSelected() {
      let ids = ''
      for (var i = 0; i < this.multipleSelection.length; i++) {
        ids += this.multipleSelection[i].id + ','
      }
      this.$AxiosWithToken({
        url: this.PMS_API_HOST + '/api/auth/pms/userDelete',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: ids
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            if (res.data && res.data.err && res.data.successCnt) {
              if (res.data.successCnt <= 0) {
                this.$message.warning('未删除数据')
              } else {
                if (res.data.err === 0) {
                  this.$message.success('操作成功，共删除' + res.data.successCnt + '条数据')
                } else {
                  this.$message.warning('操作异常，已删除' + res.data.successCnt + '条数据')
                }
              }
              this.refreshList()
              return
            }
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
    formCancel() {
      this.eForm.visible = false
    },
    formConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.PMS_API_HOST + '/api/auth/pms/userEdit',
          // method: 'post',
          params: {
            // 用data适合后台用@RequestBody方式
            id: this.eForm.id,
            code: this.eForm.code,
            name: this.eForm.name,
            password: this.eForm.password
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.eForm.visible = false
              this.refreshList()
              return
            } else if (res.code === 400) {
              if (res.data && res.data === -2) {
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
    formClosed(formName) {
      this.$refs[formName].resetFields()
    },
    editRoleRel(row, index) {
      this.$router.push({
        query: {
          user: row.id,
          // parent: 0,
          title: '用户[' + row.name + ']的角色',
          crumbs: '用户管理,关联角色'
        },
        path: '/userRoleList'
      })
    },
    resetPassword(row, index) {
      this.formResetPassword.id = row.id
      this.formResetPassword.password = ''
      this.formResetPassword.password2 = ''
      this.formResetPassword.visible = true
    },
    formResetPwdConfirm(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.PMS_API_HOST + '/api/auth/pms/userResetPassword',
          // method: 'post',
          params: {
            // 用data适合后台用@RequestBody方式
            id: this.formResetPassword.id,
            password: this.formResetPassword.password
          }
        }).then(res => {
          if (res && res.code) {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.formResetPassword.visible = false
              return
            } else if (res.code === 400) {
              if (res.data && res.data === -2) {
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
    formResetPwdCancel() {
      this.formResetPassword.visible = false
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

<style scoped></style>
