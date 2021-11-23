# Vue后台管理系统

# 登录

## 1.1. 登录概述

### 1.1.1. 支持的请求方法

- 在登录页面输入用户名和密码
- 调用后台接口进行验证
- 通过验证之后，根据后台的响应状态跳转到项目主页

### 1.1.2. 登录业务的相关技术点

- http是无状态的
- 通过cookie在客户端记录状态
- 通过session在服务端记录状态
- 通过token方式维持状态

------

## 1.2. 登录—token原理分析

1. 客户端：登录页面输入用户名和密码进行登录
2. 服务器：服务器验证通过之后生成该用户的token并返回
3. 客户端：客户端存储该token
4. 客户端：后续所有的请求都携带该token发送请求
5. 服务器：服务器验证请求携带的token是否通过

## 1.3. 登录功能实现

### 1.3.1. 登录页面的布局

- 通过 Element-Ul 组件实现布局

### 1.3.3 路由导航守卫控制访问权限

如果用户没有登录，直接通过URL访问特定页面，则需要重新定位到登录页面

```javascript
// 为路由对象，添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
    // 如果用户访问的是登录页面，直接放行
    if(to.path === '/login') return next()
    // 从 sessionStorage 中获取保存的 token 值
    const tokenStr = window.sessionStorage.getItem('token')
    // 没有 token 则强制跳转到登录页
    if(!tokenStr) return next('/login')
    next()
})
```

### 1.3.4 退出的实现

基于token方式实现退出：销毁本地的token，这样后续的请求就不会携带token，必须重新登录生成一个新的token之后才可以访问页面。

```javascript
// 清空token
window.sessionStorage.clear()
// 跳转到登录页
this.$router.push('/login')
```





# 主页

## 2.1 主页布局

### 2.1.x 数据权限验证

通过 axios 请求拦截器添加 token，保证拥有获取数据的权限。

```javascript
// axios请求拦截
axios.interceptors.request.use(config => {
    // 为请求头对象，添加 Token 验证的 Authorization 字段
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
```































