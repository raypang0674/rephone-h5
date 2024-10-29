<template>
  <div class="loginBox" id="loginBox">
    <div class="login" login>
      <el-card shadow="always">
        <el-avatar :src="require('../assets/images/logo.png')" :size="80" avatar></el-avatar>
        <div class="form" form>
          <el-form :model="loginForm" :rules="rules" ref="loginF" label-width="70px" label-position="left">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" autofocus></el-input>
            </el-form-item>
            <el-form-item label="密 码" prop="password">
              <el-input show-password v-model="loginForm.password"></el-input>
            </el-form-item>
            <el-form-item label="验证码" prop="captcha">
              <el-input v-model="loginForm.captcha" style="width: 150px;"></el-input>
              <img id="img-captcha" class="captcha-img btn-captcha" @click="refreshCaptcha()" title="换一张" :src="require('@/assets/images/blank.png')" v-if="captcha.img == ''" />
              <img id="img-captcha" class="captcha-img btn-captcha" @click="refreshCaptcha()" title="换一张" :src="captcha.img" v-else />
            </el-form-item>
            <el-form-item marginBottom>
              <el-checkbox v-model="remPs">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :style="{ width: '100%' }" @click="login('loginF')">登 录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { axiosUtil } from '../network/axiosUtil'
// import axios from 'axios'
// import md5 from 'js-md5'

export default {
  name: 'Login',
  data() {
    let username = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入用户名'))
      } else if (!/^[\w\\.-]{1,20}$/.test(value)) {
        callback(new Error('请输入英文、数字或.-_，且长度不超过20'))
      } else {
        callback()
      }
    }
    let password = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (!/^[\w\W]{1,20}$/.test(value)) {
        callback(new Error('密码可以是数字、英文等，且长度不超过20'))
      } else {
        callback()
      }
    }
    let captcha = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入验证码'))
      } else {
        callback()
      }
    }
    return {
      remPs: false, // 是否勾选记住密码
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      captcha: {
        uuid: '',
        img: '' // '/static/images/blank.png'
      },
      rules: {
        username: [{ validator: username, trigger: 'blur' }],
        password: [{ validator: password, trigger: 'blur' }],
        captcha: [{ validator: captcha, trigger: 'blur' }]
      }
    }
  },
  methods: {
    refreshCaptcha() {
      axiosUtil({
        url: this.PMS_API_HOST + '/api/public/pms/captcha' // captcha0?w=131&h=38
      }).then(res => {
        if (res && res.code && res.code == '200') {
          this.captcha.img = 'data:image/png;base64,' + res.data.img
          this.captcha.uuid = res.data.uuid
        }
      })
    },
    login(formName) {
      this.$refs[formName].validate(state => {
        if (!state) {
          return
        }
        // 校验后台用户数据
        axiosUtil({
          url: this.PMS_API_HOST + '/api/public/pms/login',
          // method: 'post',
          // withCredentials: true,
          params: {
            // 用data适合后台用@RequestBody方式
            username: this.loginForm.username,
            password: this.loginForm.password, // md5(this.loginForm.password), // .toLowerCase()
            uuid: this.captcha.uuid,
            captcha: this.loginForm.captcha
          }
        }).then(res => {
          if (res != null && res.code === 200) {
            // 勾选记住密码选项，用户名密码保存
            if (this.remPs == true) {
              let obj = {
                remember: true,
                user: {
                  username: this.loginForm.username,
                  password: this.loginForm.password
                }
              }
              window.localStorage.setItem('remember', JSON.stringify(obj))
            } else {
              window.localStorage.removeItem('remember')
            }
            /* 把登录成功的个人信息存入session域中 */
            localStorage.setItem('user', JSON.stringify(res.data))
            sessionStorage.removeItem('titleItem') // 清除原来打开页面的记录
            this.$store.commit('header/delOrAddAside', [])
            this.$store.commit('header/setActiveIndex', 0)
            this.$store.commit('header/setCrumbs', [])
            this.$router.push({
              path: '/home'
            })
          } else {
            this.refreshCaptcha()
            this.loginForm.captcha = ''
            if (res != null && res.code === 400) {
              if (res.data.code === -10 || res.data.code === -11) {
                this.$message.error('验证码错误，请重新登录')
                return
              } else if (res.data.code === -12 || res.data.code === -13) {
                this.$message.error('登录失败，用户名或密码错误，请重新登录')
                return
              }
            }
            this.$message.error('登录失败，请重新登录')
          }
          // })
          // .catch(err => {
          //   console.log(err, '异常')
        })

        // 测试账号
        // if (this.loginForm.username === 'test' && this.loginForm.password === 'test123') {
        //   // 勾选记住密码选项，用户名密码保存
        //   if (this.remPs == true) {
        //     let obj = {
        //       remember: true,
        //       user: {
        //         username: this.loginForm.username,
        //         password: this.loginForm.password
        //       }
        //     }
        //     window.localStorage.setItem('remember', JSON.stringify(obj))
        //   } else {
        //     window.localStorage.removeItem('remember')
        //   }
        //   sessionStorage.setItem(
        //     'user',
        //     JSON.stringify({
        //       user: this.loginForm.username,
        //       token: '2020all666'
        //     })
        //   )
        //   sessionStorage.removeItem('titleItem') // 清除原来打开页面的记录
        //   this.$message({
        //     type: 'success',
        //     message: '登录成功',
        //     duration: 2000
        //   })
        //   // 登录成功 跳转到首页
        //   this.$router.push({
        //     path: '/home'
        //   })
        // } else {
        //   // 登录失败继续登录
        //   this.$message.error('登录失败，用户名或密码错误，请重新登录')
        //   this.$router.push({
        //     path: '/login'
        //   })
        // }
      })
    }
  },
  mounted() {
    let _this = this
    window.addEventListener('keyup', function(event) {
      // 回车触发form提交
      if (event.key == 'Enter') {
        _this.login('loginF')
      }
    })

    // 进来先判断，上次登录是否勾选了自动登录和记住密码
    // 勾选了记住密码
    let remember = window.localStorage.getItem('remember')
    if (remember != null) {
      let obj = JSON.parse(remember)
      this.remPs = obj.remember
      this.loginForm.username = obj.user.username
      this.loginForm.password = obj.user.password
    }
    this.refreshCaptcha()
  }
}
</script>

<style scoped>
#loginBox {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('../assets/images/login_bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
}

.login[login] {
  position: fixed;
  top: 160px;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  width: 400px;
  height: 500px;
}

.login [avatar] {
  position: absolute;
  top: -40px;
  left: 40%;
}

.login .form[form] {
  margin-top: 40px;
}

[marginBottom] {
  margin-bottom: 0;
}

.captcha-img {
  vertical-align: top; /* 与input平 */
  height: 38px;
  width: 131px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
