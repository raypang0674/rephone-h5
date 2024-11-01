// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint' // ������Ϊbabel-eslint,����package.json�ļ�������
  },
  env: {
    //��������Ϊ�����
    browser: true
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    // ray 关闭双等号的检查
    'eqeqeq': 'off',
    // �����Զ������
    // ray����������Ҫ�����ӿո�
    'space-before-function-paren': 0,
    // ray������4�ո񲻱���
    indent: ['off', 2],
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
