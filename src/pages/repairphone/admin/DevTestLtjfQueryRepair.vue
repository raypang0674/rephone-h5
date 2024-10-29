<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">BatchId：</span>
        <el-input v-model="queryCondition.batchId" :clearable="true" :style="{ width: '200px' }"></el-input>
        <span class="lab">商户：</span>
        <el-select v-model="queryCondition.merchant" placeholder="请输入关键词" filterable remote reserve-keyword clearable
          :remote-method="reloadMerchant4Select" :loading="loadingMerchant">
          <el-option v-for="item in merchantOptions" :key="item.id" :label="item.name" :value="item.entityId">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
          </el-option>
        </el-select>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search" :loading="loadingResult">查询</el-button>
      </div>
    </div>
    <div>{{ queryResult }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      merchantOptions: [],
      loadingMerchant: false,
      queryCondition: {
        batchId: '',
        merchant: ''
      },
      loadingResult: false,
      queryResult: ''
    }
  },
  methods: {
    clickQuery() {
      if (!this.queryCondition.batchId || !this.queryCondition.merchant) {
        return
      }
      this.queryResult = ''
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/devTestRepairPhoneLtjfQueryResult',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          batchId: this.queryCondition.batchId,
          merchantId: this.queryCondition.merchant
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200 || res.code === 400) {
            if (res.msg) {
              this.queryResult = res.msg
            } else {
              this.queryResult = '请求失败'
            }
            return
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
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
    }
  },
  created() {
    this.reloadMerchant4Select()
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
