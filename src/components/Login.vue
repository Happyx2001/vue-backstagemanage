<template>
  <div id="login">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avator-box">
        <img src="../assets/img/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 利用element-ui -->
      <!-- :model="loginForm" 数据绑定 -->
      <!-- :rules="loginFormRules" 表单验证 -->
      <el-form
        ref="loginFormRef"
        label-position="left"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            prefix-icon="el-icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btns" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登录表单的数据对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      // 表单验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
          { min: 3, max: 16, message: '长度在3至16个字符', trigger: 'blur' },
        ],
        // 验证密码是否合法
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
          { min: 3, max: 16, message: '长度在3至16个字符', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    // 重置按钮设置
    resetLoginForm() {
      // console.log(this);
      // resetFields()  el-form的重置方法
      // 重置是根据 loginForm 中的初始值重置
      this.$refs.loginFormRef.resetFields()
    },
    // 登录前的表单预验证
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) {
          this.$message.error('请输入符合格式的用户名和密码!')
        } else {
          // 用 axios 调用login地址
          // 通过解构赋值的方式, 直接接收接口返回包含data的值
          const { data: res } = await this.$http.post('login', this.loginForm)
          console.log(res)
          if (res.meta.status != 200) {
            this.$message.error('登录失败, 用户名或者密码错误!')
          } else {
            this.$message.success('登录成功!')
            /**登录成功之后的操作:
             * 1. 将登录成功之后的 token, 保存到客户端的 sessionStorage 中
             *   1.1 项目中除了登录之外的其他api接口, 必须在登录之后才能访问
             *   1.2 token 只应当在当前网站打开期间生效, 所以将 token 保存在 sessionStorage 中
             * 2. 通过$router跳转到后台主页, 路由为 /home
             */
            // 1. 如上
            window.sessionStorage.setItem('token', res.data.token)
            // 2. 如上
            this.$router.push('/home')
          }
        }
      })
    },
  },
}
</script>

<style scoped>
#login {
  height: 100%;
  background-color: #2b4b6b;
}

.login-box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
}

.avator-box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  border: 3px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  background-color: #fff;
  padding: 10px;
}

.avator-box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}

.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
}

.btns {
  margin: 0 40px 0 30px;
}
</style>