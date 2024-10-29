import Axios from 'axios'

// Axios.defaults.withCredentials = true

export function axiosUtil(config) {
  const instance = Axios.create({
    // baseURL: 'http://localhost:8808', // 这行与跨域设置有冲突而注释掉
    // timeout: 5000
  })
  // 响应拦截器
  instance.interceptors.response.use(
    res => {
      return res.data
    },
    error => {
      console.log(error)
      // throw error
    }
  )
  return instance(config)
}

// Axios.defaults.headers.post['Content-type'] = 'application/json;charset=UTF-8'

// 上面的微改动，带token的ajax
export function axiosWithToken(config) {
  let thisuser = JSON.parse(localStorage.getItem('user'))
  if (!thisuser || !thisuser.token || !thisuser.token.accessToken) {
    this.$router.push({
      path: '/login'
    })
    return { then: function() {} }
  }
  const instance = Axios.create({})
  config.headers = config.headers || {}
  config.headers.access_token = thisuser.token.accessToken
  // let qchar = config.url.indexOf('?') >= 0 ? '&' : '?'
  // config.url = config.url + qchar + 'token=' + thisuser.token
  // 响应拦截器
  instance.interceptors.response.use(
    res => {
      if (res && res.data && res.data.code && res.data.code === 401) {
        this.$router.push({
          path: '/login'
        })
      }
      return res.data
    },
    error => {
      console.log(error)
      // throw error
    }
  )
  return instance(config)
}

// config 里可以加的内容：
// {
//   url: '', // 请求地址
//   method: 'post',
//   headers: { // 上传文件时用得上
//     'Content-Type': 'multipart/form-data' // 'application/x-www-form-urlencoded'
//   },
//   data: // post时，请求体方式传参
//   params: {} // query string(跟在url里)方式传参，不管是否post
// }
// 文件参数赋值样例
// let formData = new FormData()
// formData.append('id', this.importForm.id)
// formData.append('file', this.$refs.importCasesFile.uploadFiles[0].raw)

// 前端用post请求体方式提交参数，后台对象要用@RequestBody接收
