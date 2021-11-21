import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    // 设置默认路由
    path: '/',
    // redirect 表示重定向到路由，这里表示默认 /login
    redirect: '/login'
  },
  {
    path: '/login',
    // 路由懒加载
    component: () => import('../components/Login.vue')
  },
  {
    path: '/home',
    // 路由懒加载
    component: () => import('../components/Home.vue'),
    // redirect 表示重定向到路由，这里表示到 /home 之后重定向跳转到子路由 /welcome
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import('../components/Welcome.vue')
      },
      {
        path: '/users',
        component: () => import('../components/users/Users.vue')
      },
      {
        path: '/rights',
        component: () => import('../components/power/Rights.vue')
      },
      {
        path: '/roles',
        component: () => import('../components/power/Roles.vue')
      },
      {
        path: '/categories',
        component: () => import('../components/goods/Cate.vue')
      },
      {
        path: '/params',
        component: () => import('../components/goods/Params.vue')
      },
      {
        path: '/goods',
        component: () => import('../components/goods/GoodsList.vue')
      },
      {
        path: '/goods/add',
        component: () => import('../components/goods/Add.vue')
      },
      {
        path: '/orders',
        component: () => import('../components/order/Order.vue')
      },
      {
        path: '/reports',
        component: () => import('../components/report/Report.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 如果用户没有登录，直接通过URL访问特定页面，则需要重新定位到登录页面 使用路由导航守卫
// 挂载路由导航守卫 beforEach
// to: 将要访问的路径
// from: 表示从那个路径跳转而来
// next 是一个函数，表示执行
router.beforeEach((to, from, next) => {
  // 如果用户访问的是登录页面，直接放行
  if (to.path === '/login') return next()
  // 从 sessionStorage 中获取保存的 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有 token 则强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
