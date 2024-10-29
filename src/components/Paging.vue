<template>
  <el-pagination :layout="getLayout" :page-sizes="getPageSizes" :page-size="getPageSize" :total="total" :current-page="currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" :style="{ textAlign: 'center' }" :hide-on-single-page="hideOnSinglePage"> </el-pagination>
</template>

<script>
export default {
  name: 'Paging',
  props: {
    total: {
      type: Number,
      required: true
    },
    layout: {
      type: String,
      required: false
    },
    pageSizes: {
      type: Array,
      required: false
    },
    pageSize: {
      type: Number,
      required: false
    },
    currentPage: {
      type: Number,
      required: false
    },
    hideOnSinglePage: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  computed: {
    getLayout() {
      if (this.layout == null) {
        return 'prev, pager, next'
      }
      if (this.layout === 'full') {
        return 'total, sizes, prev, pager, next, jumper'
      } else if (this.layout === 'sizes') {
        return 'total, sizes, prev, pager, next'
      } else if (this.layout === 'total') {
        return 'total, prev, pager, next'
      } else {
        return this.layout
      }
    },
    getPageSizes() {
      if (this.pageSizes == null) {
        return [10, 20, 50, 100]
      } else {
        return this.pageSizes
      }
    },
    getPageSize() {
      if (this.pageSize != null) {
        return this.pageSize
      }
      let pageSizesArray = this.getPageSizes
      if (pageSizesArray && pageSizesArray.length > 0) {
        return pageSizesArray[0]
      } else {
        return 10
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pageSizeChange', val)
    },
    // 当前页发生改变时触发
    handleCurrentChange(page) {
      this.$emit('currentChange', page)
    }
  }
}
</script>

<style scoped></style>
