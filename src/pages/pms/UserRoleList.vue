<template>
  <div>
    <div class="tbl-upper">
      <div class="condition">
        <span class="lab">名称/编码：</span>
        <el-input v-model="queryCondition.name" placeholder="输入角色名称或编码" :clearable="true" :style="{ width: '180px' }"></el-input>
        <el-button type="primary" @click="clickQuery" icon="el-icon-search">查询</el-button>
      </div>
    </div>

    <el-table ref="elTable" :data="tableData" class="table" stripe empty-text="没有匹配到数据">
      <el-table-column prop="code" label="编码" min-width="100"> </el-table-column>
      <el-table-column prop="name" label="名称" min-width="180"> </el-table-column>
      <el-table-column prop="description" label="描述" min-width="300"> </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="120" align="center">
        <template slot-scope="scope">
          <el-button type="success" icon="el-icon-check" circle size="mini" v-if="scope.row.relId != null" @click.native.prevent="unRelRole(scope.row, scope.$index)"></el-button>
          <el-button type="info" icon="el-icon-check" circle size="mini" v-else @click.native.prevent="relRole(scope.row, scope.$index)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <Paging @currentChange="goPage" :total="total" :layout="pageLayout" :pageSize="pageSize" :currentPage="page"></Paging>
  </div>
</template>

<script>
import Paging from '../../components/Paging'

export default {
  data() {
    return {
      userId: 0,
      tableData: [],
      queryCondition: {
        name: ''
      },
      pageLayout: null, // 'full'
      pageSize: 20,
      page: 1, // 当前页码
      total: 0 // 返回数据的总数
    }
  },
  watch: {
    // 同个页面组件，由于不同参数切换显示，需要监听此方法达到刷新，不会再次触发mounted和created
    $route: function(to) {
      this.userId = to.query.user || 0
      this.queryCondition.name = ''
      this.refreshList()
    }
  },
  methods: {
    clickQuery() {
      this.page = 1
      this.refreshList()
    },
    refreshList() {
      this.$AxiosWithToken({
        url: this.PMS_API_HOST + '/api/auth/pms/userRoleList',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          pageIndex: this.page,
          pageSize: this.pageSize,
          orderBy: '',
          user: this.userId,
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
    unRelRole(row, index) {
      this.$AxiosWithToken({
        url: this.PMS_API_HOST + '/api/auth/pms/userRoleDelete',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          id: row.relId
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.refreshList()
            // this.$message.success('操作成功')
            return
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    },
    relRole(row, index) {
      this.$AxiosWithToken({
        url: this.PMS_API_HOST + '/api/auth/pms/userRoleAdd',
        // method: 'post',
        params: {
          // 用data适合后台用@RequestBody方式
          role: row.id,
          user: this.userId
        }
      }).then(res => {
        if (res && res.code) {
          if (res.code === 200) {
            this.refreshList()
            // this.$message.success('操作成功')
            return
          }
          this.$message.error('操作异常')
          return
        }
        this.$message.error('操作异常')
      })
    }
  },
  mounted() {
    this.userId = this.$route.query.user || 0
    this.refreshList()
  },
  components: {
    Paging
  }
}
</script>

<style scoped></style>
