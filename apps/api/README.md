# NowBites API Server

这是NowBites应用的API服务器，基于Fastify框架构建，提供微信小程序认证登录等功能。

## 功能特性

- 微信小程序登录认证
- JWT令牌生成与验证
- PostgreSQL数据库集成
- Prisma ORM
- 食谱管理CRUD操作
- API文档（Swagger）
- CORS支持

## 开发环境设置

### 前置条件

- Node.js (v18+)
- PostgreSQL (v12+)
- pnpm

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后根据你的需求修改配置：

```bash
cp .env.example .env
```

必须配置以下环境变量：

- `WECHAT_APPID`: 微信小程序的AppID
- `WECHAT_SECRET`: 微信小程序的AppSecret
- `DATABASE_URL`: PostgreSQL数据库连接URL

### 启动开发服务器

```bash
# 使用脚本启动（推荐）
./dev.sh

# 或者直接使用npm命令
pnpm dev
```

服务器将在 http://localhost:3100 上运行，API文档可在 http://localhost:3100/documentation 访问。

### 数据库设置

详细的数据库设置指南请参考 [DATABASE_SETUP.md](./DATABASE_SETUP.md)

快速设置：
```bash
# 生成Prisma客户端
pnpm db:generate

# 推送数据库架构（开发环境）
pnpm db:push

# 填充示例数据
pnpm db:seed
```

## API端点

### 认证

#### 微信小程序登录

```
POST /api/auth/wechat-login
```

请求体：

```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "gender": 1,
    "country": "国家",
    "province": "省份",
    "city": "城市",
    "language": "zh_CN"
  }
}
```

响应：

```json
{
  "token": "JWT令牌",
  "userInfo": {
    "openid": "用户openid",
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "gender": 1,
    "country": "国家",
    "province": "省份",
    "city": "城市",
    "language": "zh_CN"
  }
}
```

#### 验证令牌

```
GET /api/auth/verify
```

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "user": {
    "openid": "用户openid",
    "nickName": "用户昵称"
  },
  "message": "Valid token"
}
```

### 食谱管理

#### 获取所有食谱

```
GET /api/recipes
```

查询参数：
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：10）
- `search`: 搜索关键词
- `tags`: 标签过滤（逗号分隔）
- `difficulty`: 难度过滤（easy/medium/hard）
- `userId`: 用户ID过滤

#### 获取食谱详情

```
GET /api/recipes/:id
```

#### 创建食谱（需要认证）

```
POST /api/recipes
```

请求头：
```
Authorization: Bearer <token>
```

请求体：
```json
{
  "title": "食谱标题",
  "description": "食谱描述",
  "ingredients": [
    {"name": "食材名称", "amount": "用量", "unit": "单位"}
  ],
  "instructions": [
    "步骤1",
    "步骤2"
  ],
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "medium",
  "imageUrl": "图片URL",
  "tags": ["标签1", "标签2"],
  "isPublic": true
}
```

#### 更新食谱（需要认证）

```
PUT /api/recipes/:id
```

#### 删除食谱（需要认证）

```
DELETE /api/recipes/:id
```

#### 获取用户食谱（需要认证）

```
GET /api/recipes/my
```

## 生产环境部署

```bash
# 使用脚本部署（推荐）
./start.sh

# 或者手动执行以下命令
# 构建项目
pnpm build

# 启动服务器
pnpm start
```

## 测试工具

项目提供了一个简单的测试脚本，用于测试微信登录API：

```bash
# 安装依赖
pnpm install axios

# 运行测试脚本
./test-wechat-login.js
```

测试脚本会提示你输入微信登录code（在实际开发中通过`wx.login()`获取），然后模拟小程序登录请求，并验证返回的JWT令牌。

## 与小程序集成

在小程序端，你需要修改登录逻辑，将登录请求发送到API服务器。以下是一个示例：

```typescript
// 在小程序中调用登录API
Taro.login({
  success: (loginRes) => {
    if (loginRes.code) {
      // 获取用户信息
      Taro.getUserProfile({
        desc: '用于完善会员资料',
        success: (userRes) => {
          const userInfo = userRes.userInfo;
          
          // 发送code和用户信息到后端
          Taro.request({
            url: 'http://your-api-server.com/api/auth/wechat-login',
            method: 'POST',
            data: {
              code: loginRes.code,
              userInfo: userInfo
            },
            success: (res) => {
              // 保存后端返回的token和用户信息
              Taro.setStorageSync('token', res.data.token);
              Taro.setStorageSync('userInfo', res.data.userInfo);
              
              // 登录成功提示
              Taro.showToast({
                title: '登录成功',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('登录请求失败:', err);
              Taro.showToast({
                title: '登录失败',
                icon: 'none'
              });
            }
          });
        }
      });
    }
  }
});
```