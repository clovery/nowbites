#!/bin/bash

# 检查环境变量文件
if [ ! -f .env ]; then
  echo "⚠️  .env 文件不存在，将使用默认配置"
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ 已从.env.example创建.env文件"
  fi
fi

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
pnpm build

# 启动服务器
echo "🚀 启动API服务器..."
pnpm start