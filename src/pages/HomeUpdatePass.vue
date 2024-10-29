<template>
  <section class="section">
    <el-form :model="form" ref="passW" :rules="ruleForm" label-width="120" label-position="top">
      <el-form-item prop="oldPass" label="旧密码">
        <el-input v-model="form.oldPass" show-password></el-input>
      </el-form-item>
      <el-form-item prop="newPass" label="新密码">
        <el-input v-model="form.newPass" show-password></el-input>
      </el-form-item>
      <el-form-item prop="requirePass" label="确认密码">
        <el-input v-model="form.requirePass" show-password></el-input>
      </el-form-item>
      <el-form-item class="btn-group">
        <el-button type="primary" @click="submit('passW')">确认修改</el-button>
        <el-button type="danger" @click="cancel('passW')">取 消</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
// import md5 from 'js-md5'

export default {
  name: 'HomeUpdatePass',
  data() {
    let oldPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入旧密码'))
      } else if (!/^[\w\W]{1,20}$/.test(value)) {
        callback(new Error('长度不超过20'))
      } else {
        callback()
      }
    }
    let newPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else if (!/^[\w\W]{1,20}$/.test(value)) {
        callback(new Error('长度不超过20'))
      } else {
        callback()
      }
    }
    let rePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认密码'))
      } else if (value != this.form.newPass) {
        callback(new Error('两次密码不一致，请重新输入'))
      } else {
        callback()
      }
    }
    return {
      form: {
        oldPass: '',
        newPass: '',
        requirePass: ''
      },
      ruleForm: {
        oldPass: [{ validator: oldPass, trigger: 'blur' }],
        newPass: [{ validator: newPass, trigger: 'blur' }],
        requirePass: [{ validator: rePass, trigger: 'blur' }]
      }
    }
  },
  methods: {
    submit(form) {
      this.$refs[form].validate(state => {
        if (!state) {
          return
        }
        this.$AxiosWithToken({
          url: this.PMS_API_HOST + '/api/auth/user/changePassword',
          // method: 'get',
          // withCredentials: true,
          // headers: { token: thisuser.token }, // head方式提交参数
          params: {
            // 用data适合后台用@RequestBody方式
            oldPassword: this.form.oldPass, // md5(this.form.oldPass), // .toLowerCase()
            password: this.form.newPass
          }
        }).then(res => {
          if (res != null && res.code === 200) {
            this.$message.success('修改密码成功')
            this.$refs[form].resetFields()
          } else {
            if (res != null && res.code === 400) {
              if (res.data === -13) {
                this.$message.error('旧密码错误')
                return
              }
            }
            this.$message.error('保存失败')
          }
        })
      })
    },
    cancel(form) {
      this.$refs[form].resetFields()
    }
  }
}
</script>

<style scoped>
.section {
  width: 40%;
  margin: 0 auto;
}

.btn-group {
  text-align: center;
}

.codeItem {
  position: relative;
}

.codeRes {
  width: 30%;
}

.code {
  width: 25%;
  height: 40px;
  position: absolute;
  top: 0;
  left: 35%;
}
</style>
