<template>
  <div class="hello" style="height: 1000px;">
    <h1>{{ msg }}</h1>
    <button @click="childMethod1()">点击1</button>
    <button @click="childMethod2()">点击2</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome'
    }
  },
  methods: {
    childMethod1() {
      // debugger
      this.$emit('test1', { a: 'abc', b: true, c: 1, d: '中文' })
    },
    childMethod2() {
      this.$emit('test2', '把我带给父组件吧！第' + this.$route.params.id + '次！')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
