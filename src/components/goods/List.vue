<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable
                    @clear = getGoodsList>
                    <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表表格区域 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column label="#"  type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="商品数量" prop="goods_number" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140px">
                    <template slot-scope="scope">
                      {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                    <template slot-scope="scope">
                     <!-- 修改按钮 -->
                     <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
                     <!-- 删除按钮 -->
                     <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
             <el-pagination @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
                 :total="total" background>
            </el-pagination>
        </el-card>
         <!-- 修改用户的对话框 -->
        <el-dialog title="修改商品" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="150px" >
            <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editForm.goods_price" ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight" ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editForm.goods_number" ></el-input>
            </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      // 商品列表
      goodslist: [],
      // 总数据条数
      total: 0,
      // 查询的商品信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 控制修改商品对话框的显示与隐藏
      editDialogVisible: false
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params:
        this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败 !')
      }

      // this.$message.success('获取商品列表成功！')
      // console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 监听 pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 根据id删除对应的商品信息
    async removeGoodsById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      this.getGoodsList()
    },
    // 添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 展示编辑商品的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败!')
      }
      // console.log(res.data)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改商品对话框的关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editGoodsInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改商品信息的数据请求
        const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, {
          goods_name: this.editForm.goods_name,
          goods_price: this.editForm.goods_price,
          goods_number: this.editForm.goods_number,
          goods_weight: this.editForm.goods_weight,
          goods_cat: this.editForm.goods_cat
        })
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败!')
        }

        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getGoodsList()
        // 提示修改成功
        this.$message.success('更新商品信息成功!')
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
