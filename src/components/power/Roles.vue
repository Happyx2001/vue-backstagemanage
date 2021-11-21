<template>
  <div id="roles">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleVisible = true">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- <pre>{{ scope.row }}</pre> -->
            <!-- 通过for循环嵌套渲染一级权限 -->
            <el-row
              :class="['vcenter', 'bbottom', index === 0 ? 'btop' : '']"
              v-for="(item, index) in scope.row.children"
              :key="index"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限、三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="['vcenter', index === 0 ? '' : 'btop']"
                  v-for="(item2, index) in item.children"
                  :key="index"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环嵌套渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3, index) in item2.children"
                      :key="index"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRole(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色时出现的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleVisible"
      width="50%"
      @close="addRoleClosed"
    >
      <!-- 对话框主题区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 修改角色时出现的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleVisible"
      width="50%"
      @close="editRoleClosed"
    >
      <!-- 对话框主题区 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="90px"
      >
        <el-form-item label="角色ID" prop="roleId">
          <el-input v-model="editForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 分配权限时出现的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 对话框主题区 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      // 保存角色列表数据
      roleList: [],
      // 控制添加角色对话框的显示与隐藏
      addRoleVisible: false,
      // 控制编辑角色对话框的显示与隐藏
      editRoleVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 保存每个角色默认选中的节点ID值
      defKeys: [],
      // 保存当前即将分配权限的角色 id
      roleId: '',

      addForm: {
        roleName: '',
        roleDesc: '',
      },
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur',
          },
        ],
      },
      editForm: {
        roleId: '',
        roleName: '',
        roleDesc: '',
      },
      editFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    // 添加数据
    this.getRoleList()
  },
  methods: {
    // 获取所有角色的列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
      } else {
        this.roleList = res.data
      }
    },

    // 监听添加角色中，对话框的关闭事件（关闭对话框，代表重置）
    addRoleClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加角色，点击确定，添加新角色
    addRole() {
      // (预校验)
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 通过，则发起 添加角色 的网络请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
        } else {
          this.$message.success('添加角色成功')
          // 添加成功后关闭 添加角色的对话框
          this.addRoleVisible = false
          // 添加之后，刷新页面（实现方法：重新获取角色数据）
          this.getRoleList()
        }
      })
    },

    // 监听 编辑角色 中，对话框的开启事件
    async showEditRole(id) {
      console.log(id)
      // 根据id查询角色数据
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败')
      } else {
        this.editForm = res.data
        this.editRoleVisible = true
      }
    },

    // 监听 编辑角色 中，对话框的关闭事件（关闭对话框，代表重置）
    editRoleClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 修改角色信息的对话框中，点击 确定 按钮，修改用户
    editRole() {
      // 预校验
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 通过，则发起 修改用户数据 的请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          this.editForm
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败')
        } else {
          this.$message.success('更新用户信息成功')
          // 修改成功后关闭 添加用户的对话框
          this.editRoleVisible = false
          // 修改成功之后，刷新页面（实现方法：重新获取用户数据）
          this.getRoleList()
        }
      })
    },

    // 删除角色：根据角色id 删除对应的角色
    async removeRoleById(id) {
      // 弹框 询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色，是否继续',
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
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('删除角色失败！')
        } else {
          this.$message.success('删除角色成功！')
          this.getRoleList()
        }
      }
    },

    // 根据 right id 删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框 提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限，是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      // 判断用户是否要删除权限
      if (confirmResult !== 'confirm') {
        this.$message.info('取消了删除！')
      } else {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          this.$message.error('删除权限失败！')
        } else {
          // this.getRoleList()
          role.children = res.data
        }
      }
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 保存当前角色的 id
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('获取权限数据失败！')
      } else {
        // 保存获取到的权限数据
        this.rightsList = res.data
        console.log(this.rightsList)
        // 递归获取三级节点的id，并保存
        this.getLeafKeys(role, this.defKeys)
        // 打开对话框
        this.setRightDialogVisible = true
      }
    },

    // 通过递归的形式，获取角色下的全部三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 没有children的节点，才是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },

    // 监听 分配角色 中，对话框的关闭事件（关闭对话框，代表重置）
    setRightDialogClosed() {
      // 将 defkeys 清空，防止堆叠到其他角色中
      this.defKeys = []
    },

    // 点击为角色分配权限
    async allotRights() {
      // 获取权限树中被选中的key
      // getCheckedKeys 获取所有被选中的节点 id
      // getHalfCheckedKeys 获取所有被半选中的节点 id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败！')
      } else {
        this.$message.success('分配权限成功！')
        // 成功之后重新请求权限数据
        this.getRoleList()
        this.setRightDialogVisible = false
      }
    },
  },
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 20px;
  font-size: 16px;
}

.el-table {
  margin-top: 20px;
}

.el-tag {
  margin: 10px;
}

.btop {
  border-top: 1px solid #eee;
}

.bbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
