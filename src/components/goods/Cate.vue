<template>
  <div id="cate">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">
            添加分类
          </el-button>
        </el-col>
      </el-row>

      <!-- 商品表格 运用 treetable 组件-->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 有效列 -->
        <template v-slot:isOk="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color: lightgreen"
          ></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
        <!-- 排序列 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">
            二级
          </el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template v-slot:option="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row.cat_id)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类 的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options 用于指定数据源 -->
          <!-- props 用于指定配置对象 -->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类时的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,

      // 为 treetable 指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          // 表示 当前列定义为模板列
          type: 'template',
          // 表示 当前这一列使用的模板名称
          template: 'isOk',
        },
        {
          label: '排序',
          // 表示 当前列定义为模板列
          type: 'template',
          // 表示 当前这一列使用的模板名称
          template: 'order',
        },
        {
          label: '操作',
          // 表示 当前列定义为模板列
          type: 'template',
          // 表示 当前这一列使用的模板名称
          template: 'option',
        },
      ],

      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,

      // 添加分类中 的表单数据对象 (将要 "添加的分类" 的属性)
      addCateForm: {
        // 将要添加的 分类名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的层级(默认等级为 1 级)
        cat_level: 0,
      },
      // 添加分类 的表单验证规则对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur',
          },
        ],
      },
      // 编辑分类中 的表单数据对象
      editCateForm: {},
      // 编辑分类 的表单验证规则对象
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur',
          },
        ],
      },

      // 商品分类的父级分类的数据列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 选择的父级分类的Id数组
      // selectedKey 获取的是, 级联选择器的配置对象中, 设置的 value 即: cat_id
      selectedKeys: [],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类数据失败！')
      } else {
        console.log(res.data.result)
        // 保存商品数据列表给 cateList
        this.cateList = res.data.result
        // 保存总数据条数给 total
        this.total = res.data.total
      }
    },

    // 监听 pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    // 监听 pagenum 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    // 点击按钮展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类列表
      this.getParentCateList()
      // 再展示对话框
      this.addCateDialogVisible = true
    },

    // 关闭 添加分类 对话框的事件, 重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },

    // 获取父级分类的 数据列表 (只有前两层级, 才是父级分类, 因此 type=2)
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类数据失败!')
      } else {
        // console.log(res.data)
        this.parentCateList = res.data
      }
    },

    // 选择项发生变化, 则触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0, 证明选中了父级分类
      // 反之, 就说明没有父级分类, 自身就是第一层级
      if (this.selectedKeys.length > 0) {
        // 父级分类的 id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值(当前分类等级, 就是selectedKeys数组的长度)
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 反之, 就说明没有父级分类, 自身就是第一层级
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    // 点击按钮, 添加新的分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败!')
        } else {
          this.$message.success('添加分类成功!')
          // 重新请求数据, 刷新页面
          this.getCateList()
          // 关闭对话框
          this.addCateDialogVisible = false
        }
      })
    },

    // 编辑分类, 出现对话框
    async showEditCateDialog(id) {
      // console.log(id)
      // 根据id查询用户数据
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询分类信息失败')
      } else {
        console.log(res.data)
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      }
    },

    // 关闭 编辑分类 对话框事件, 重置表单数据
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },

    // 点击按钮, 编辑分类
    editCate() {
      // 预校验
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return
        // 通过，则发起 修改用户数据 的请求
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('编辑分类信息失败')
        } else {
          this.$message.success('编辑分类信息成功')
          // 修改成功之后，刷新页面（实现方法：重新获取用户数据）
          this.getCateList()
          // 修改成功后关闭 添加用户的对话框
          this.editCateDialogVisible = false
        }
      })
    },

    // 删除分类, 根据 cat_id 删除分类
    async removeCateById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类，是否继续',
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
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('删除分类失败！')
        } else {
          this.$message.success('删除分类成功！')
          this.getCateList()
        }
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

.tree-table {
  margin: 15px 0;
}

.el-cascader {
  width: 100%;
}
</style>