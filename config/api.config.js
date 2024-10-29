var isPro = process.env.NODE_ENV === 'production' //process.env.NODE_ENV用于区分是生产环境还是开发环境
//根据环境不同导出不同的baseURL
module.exports = {
    pmsBaseURL: isPro ? 'http://112.124.19.48:8093' : '/pmsapi',
    bizBaseURL: isPro ? 'http://112.124.19.48:8098' : '/bizapi'
    // pmsBaseURL: '/pmsapi',
    // bizBaseURL: '/bizapi'
}