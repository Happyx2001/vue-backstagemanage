<template>
  <div id="order">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getOrdersList">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrdersList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格（元）"
          prop="order_price"
        ></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showBox(scope)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址，对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流地址，对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入 城市选择 测试
import citydata from './citydata'
// 导入 progress 物流信息 测试
import progress from './progress'

export default {
  name: 'Order',
  data() {
    return {
      // 查询参数对象（请求体）
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 订单列表
      ordersList: [],
      // 订单总数
      total: 0,

      // 修改地址对话框的显示与隐藏
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: '',
      },
      // 表单验证规则对象
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请选择省市区/县！',
            trigger: 'blur',
          },
        ],
        address2: [
          {
            required: true,
            message: '请输入详细地址！',
            trigger: 'blur',
          },
        ],
      },
      // 导入城市数据
      cityData: citydata,

      // 展示物流信息的对话框的显示与隐藏
      progressVisible: false,
      // 物流信息数据
      progressInfo: progress,
    }
  },
  computed: {},
  created() {
    this.getOrdersList()
  },
  methods: {
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },

    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },

    // 根据分页获取对应的订单列表
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取订单列表失败！')
      } else {
        // this.$message.success('获取订单列表成功！')
        this.ordersList = res.data.goods
        this.total = res.data.total
        // console.log(res)
      }
    },

    // 展示修改地址的对话框
    showBox() {
      this.addressVisible = true
    },

    // 对话框关闭重置
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },

    // 展示物流进度的对话框
    showProgressBox() {
      // 接口有误 数据已经手动导入
      //   const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      //   //   console.log(res)
      //   if (res.meta.status !== 200) {
      //     this.$message.error('获取物流信息失败!')
      //   } else {
      //     this.progressInfo = res.data
      //     console.log(this.progressInfo)
      //   }
      this.progressVisible = true
    },

    // 对话框关闭重置
    // progressDialogClosed() {
    //   this.$refs.addressFormRef.resetFields()
    // },
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

.el-cascader {
  width: 100%;
}
</style>