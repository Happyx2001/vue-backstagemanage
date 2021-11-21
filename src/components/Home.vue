<template>
  <!-- <h2>我是Home</h2>
    <el-button type="info" @click="loginOut">退出</el-button> -->
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/img/logo.png" alt="" />
        <span>Vue后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="this.isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- ↑ :router="true" 打开el-menu的 router 模式，以:index为path路径跳转 -->
          <!-- 双重 v-for 循环绘制菜单 -->
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="(item, index) in menuList"
            :key="index"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main style="height: 1228px; flex-grow: 1">
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// import HomeHeader from './HomeHeader.vue'

export default {
  name: 'Home',
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data',
      },
      // 决定是否折叠，默认不折叠
      isCollapse: false,
      // 保存激活的菜单栏链接地址
      activePath: '',
    }
  },
  components: {
    // HomeHeader,
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出功能：
    loginOut() {
      // 基于token方式实现退出：
      // 销毁本地的token，这样后续的请求就不会携带token。
      // 必须重新登录生成一个新的token之后才可以访问页面。
      // 1. 清空token
      window.sessionStorage.clear()
      // 2. 跳转到登录页
      this.$router.push('/login')
    },

    // 获取所有的侧边栏菜单列表数据:
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status != 200) {
        this.$message.error(res.meta.msg)
      } else {
        // this.$message.success(res.meta.msg)
        console.log(res.meta.msg)
      }
      console.log(res)
      this.menuList = res.data
    },

    // 折叠菜单栏功能
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },

    // 保存菜单栏的激活状态
    saveNavState(activePath) {
      // 将点击的菜单链接的index保存到 sessionStorage 中
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = window.sessionStorage.getItem('activePath')
    },
  },
}
</script>

<style scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  background-color: #373d41;
  font-size: 30px;
}

.el-header div {
  display: flex;
  align-items: center;
}

.el-header div img {
  height: 58px;
  width: 58px;
}

.el-header span {
  margin-left: 20px;
}

.el-aside {
  background-color: #333744;
}

.el-menu {
  border-right: 0px;
}

.el-main {
  background-color: #eaedf1;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>