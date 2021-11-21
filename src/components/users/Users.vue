<template>
  <div id="user">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <!-- input搜索功能的实现，v-model绑定值查询关键字query，通过按钮的click事件触发获取数据 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="handleCurrentChange(1)"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleCurrentChange(1)"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">
            添加用户
          </el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <!-- v-slot="scope" 获取table里的数据（作为scope)，传给 作用域插槽 -->
            <!-- scope.row 是表格中当前行的数据 -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 4, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户时出现的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 对话框主题区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 修改用户时出现的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <h3>当前的用户：{{ userInfo.username }}</h3>
        <h3>当前的角色：{{ userInfo.role_name }}</h3>
        <h3>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </h3>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 自定义验证邮箱规则（添加用户时）
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        return callback()
      }

      callback(new Error('请输入合法的邮箱'))
    }

    // 自定义验证手机号的规则（添加用户时）
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return callback()
      }

      callback(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // query 配合input输入框进行搜索用户
        query: '',
        // 当前的页码
        pagenum: 1,
        // 页码中包含的个数
        pagesize: 5,
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 添加用户时的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加用户时的表单验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度应该在3~10个字符之间',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
          {
            min: 6,
            max: 15,
            message: '密码的长度应该在6~15个字符之间',
            trigger: 'blur',
          },
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
          },
          {
            validator: checkEmail,
            trigger: 'blur',
          },
        ],
        mobile: [
          {
            required: true,
            message: '请输入电话号码',
            trigger: 'blur',
          },
          {
            validator: checkMobile,
            trigger: 'blur',
          },
        ],
      },
      // 修改用户时的表单验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
          },
          {
            validator: checkEmail,
            trigger: 'blur',
          },
        ],
        mobile: [
          {
            required: true,
            message: '请输入电话号码',
            trigger: 'blur',
          },
          {
            validator: checkMobile,
            trigger: 'blur',
          },
        ],
      },

      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 保存获取到的角色列表
      rolesList: [],
      // 分配角色时，选中的角色id值
      selectedRoleId: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表数据（数据请求）
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status != 200) {
        thi.$message.error('用户列表数据获取失败')
      } else {
        this.userList = res.data.users
        this.total = res.data.total
        console.log(this.userList, this.total)
      }
    },

    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log('设置每页有：' + newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },

    // 监听 页码值 改变数据
    handleCurrentChange(newPage) {
      // console.log('改变页码为：' + newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    // 监听 switch 开关状态的改变
    async userStateChanged(userinfo) {
      console.log(userinfo)
      // put 请求方式，修改数据库中的数据
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status != 200) {
        userinfo.mg_state = !userinfo.mg_state
        this.$message.error('更新用户状态失败')
      } else {
        this.$message.success('更新用户状态成功')
      }
    },

    // 监听添加用户中，对话框的关闭事件（关闭对话框，代表重置）
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加用户的对话框中，点击 确定 按钮，添加新用户
    addUser() {
      // (预校验)
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 通过，则发起 添加用户 的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          // 添加成功后关闭 添加用户的对话框
          this.addDialogVisible = false
          // 添加之后，刷新页面（实现方法：重新获取用户数据）
          this.getUserList()
        }
      })
    },

    // 展示修改用户的对话框（修改按钮）
    async showEditDialog(id) {
      // console.log(id)
      // 根据id查询用户数据
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败')
      } else {
        this.editForm = res.data
        this.editDialogVisible = true
      }
    },

    // 监听修改用户中，对话框的关闭事件（关闭对话框，代表重置）
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 修改用户信息的对话框中，点击 确定 按钮，修改用户
    editUserInfo() {
      // 预校验
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 通过，则发起 修改用户数据 的请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败')
        } else {
          this.$message.success('更新用户信息成功')
          // 修改成功后关闭 添加用户的对话框
          this.editDialogVisible = false
          // 修改成功之后，刷新页面（实现方法：重新获取用户数据）
          this.getUserList()
        }
      })
    },

    // 删除用户：根据用户id 删除对应的用户
    async removeUserById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户，是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      // 如果用户确认了删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('删除用户失败！')
        } else {
          this.$message.success('删除用户成功！')
          this.getUserList()
        }
      }
    },

    // 分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在展示对话框之前，获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败！')
      } else {
        this.rolesList = res.data
        this.setRoleDialogVisible = true
      }
    },

    // 点击 分配角色的对话框 中的确定按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        this.$message.error('请选择要分配的角色！')
      } else {
        const { data: res } = await this.$http.put(
          `users/${this.userInfo.id}/role`,
          { rid: this.selectedRoleId }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新角色失败！')
        } else {
          this.$message.success('更新角色成功！')
          this.getUserList()
          this.setRoleDialogVisible = false
        }
      }
    },

    // 监听分配角色的对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
  },
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 20px;
  font-size: 16px;
}

.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
}

.el-table {
  margin-top: 20px;
  font-style: 12px;
}

.el-pagination {
  margin-top: 20px;
}
</style>