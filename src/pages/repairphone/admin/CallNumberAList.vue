<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">号码：</span>
        <el-input v-model="queryCondition.number" :clearable="true" :style="{ width: '160px' }"></el-input>
        <span class="lab">状态：</span>
        <el-select v-model="queryCondition.status" :style="{ width: '100px' }">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">分配(给商户)状态：</span>
        <el-select v-model="queryCondition.distStatus" :style="{ width: '100px' }">
          <el-option v-for="item in distStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <span class="lab">商户：</span>
        <el-select v-model="queryCondition.merchant" placeholder="请输入关键词" filterable remote reserve-keyword clearable
          :remote-method="reloadMerchant4Select" :loading="loadingMerchant">
          <el-option v-for="item in merchantOptions" :key="item.id" :label="item.name" :value="item.entityId">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
          </el-option>
        </el-select>
        <span class="lab">分配(给坐席)状态：</span>
        <el-select v-model="queryCondition.occupyStatus" :style="{ width: '100px' }">
          <el-option v-for="item in distStatusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search">查询</el-button>
      </div>
      <div class="tbl-btns-r">
        <el-button type="success" @click="clickNew" icon="el-icon-circle-plus">新增</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="id" label="号码" min-width="120"> </el-table-column>
      <el-table-column label="状态" min-width="80" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.status == 0">
            <span>正常</span>
            <el-button @click.native.prevent="lockCallNumber(scope.row, scope.$index)" @click.stop="stopEvent" type="info" size="mini" icon="el-icon-lock" circle></el-button>
          </div>
          <div v-if="scope.row.status == 1">
            <span style="color: #aaa;">锁定</span>
            <el-button @click.native.prevent="resumeCallNumber(scope.row, scope.$index)" @click.stop="stopEvent" type="danger" size="mini" icon="el-icon-unlock" circle></el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="商户" min-width="250" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.distributionId == 0">-</span>
          <div v-if="scope.row.distributionId > 0">
            <span>{{scope.row.merchantName}}</span>
            <span style="color: #8492a6; font-size: 13px"> - {{scope.row.merchantCode}}</span>
            <span style="color: #aaa; font-size: 12px; margin-left: 5px">{{new Date(Number(scope.row.distBeginTime))| dateFormatYMDHMS}}</span>
            <el-button @click.native.prevent="unDistCallNumber(scope.row, scope.$index)" @click.stop="stopEvent" type="danger" size="mini" icon="el-icon-close" circle></el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="坐席" min-width="150" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.callerId == 0">-</span>
          <div v-if="scope.row.callerId > 0"><span>{{scope.row.callerName}}</span> <span style="color: #8492a6; font-size: 13px"> - {{scope.row.callerCode}}</span></div>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>

    <el-dialog title="新增号码" :visible.sync="eForm.visible" @closed="formClosed('editForm')" width="500px">
      <el-form ref="editForm" :model="eForm" :rules="ruleForm" label-width="80px">
        <el-form-item label="号码" prop="number">
          <el-input v-model="eForm.number" autofocus></el-input>
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
    let vldCallNumber = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入编码'))
      } else if (!/^[0-9]{1,20}$/.test(value)) {
        callback(new Error('数字且长度不超过20'))
      } else {
        callback()
      }
    }
    return {
      numberType: 1, // this.$route.params.numberType,
      merchantOptions: [],
      loadingMerchant: false,
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
      distStatusOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '未分配'
      }, {
        value: 1,
        label: '已分配'
      }],
      eForm: {
        number: '',
        visible: false
      },
      ruleForm: {
        number: [{ validator: vldCallNumber, trigger: 'blur' }]
      },
      tableData: [],
      queryCondition: {
        number: '',
        status: 0,
        merchant: '',
        distStatus: -1,
        occupyStatus: -1
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
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          number: this.queryCondition.number,
          numberType: this.numberType,
          status: this.queryCondition.status,
          merchantId: this.queryCondition.merchant,
          distStatus: this.queryCondition.distStatus,
          occupyStatus: this.queryCondition.occupyStatus
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
    lockCallNumber(row, index) {
      this.$confirm('确定要锁定号码【' + row.id + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doLockCallNumber(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doLockCallNumber(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberDelete',
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
    resumeCallNumber(row, index) {
      this.$confirm('确定要解锁号码【' + row.id + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doResumeCallNumber(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doResumeCallNumber(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberResume',
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
    unDistCallNumber(row, index) {
      this.$confirm('确定要收回号码【' + row.id + '】?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 点击确定的操作(调用接口)
          this.doUnDistCallNumber(row.id)
        })
        .catch(() => {
          // 点击取消的提示
        })
    },
    doUnDistCallNumber(id) {
      this.$AxiosWithToken({
        url: this.BIZ_API_HOST + '/api/auth/admin/callNumberUnDist2Merchant',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: id
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.refreshList()
            this.$message.success('收回成功')
            return
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    },
    clickNew() {
      this.eForm.number = ''
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
          url: this.BIZ_API_HOST + '/api/auth/admin/callNumberAdd',
          method: 'post',
          data: {
            id: this.eForm.number,
            numberType: this.numberType
          }
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
              }
              this.$message.error('保存失败')
              return
            }
            this.$message.error('数据保存异常')
            return
          }
          this.$message.error('数据保存异常')
        })
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
</style>
