#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// 确保环境变量文件存在
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env 文件不存在，将使用默认配置');
  // 复制.env.example到.env
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ 已从.env.example创建.env文件');
  }
}

// 启动开发服务器
const tscProcess = spawn('pnpm', ['tsc', '--watch'], { stdio: 'inherit', shell: true });

// 使用nodemon监视dist目录并自动重启服务器
const nodemonProcess = spawn(
  'pnpm',
  ['nodemon', '--watch', 'dist', '--exec', 'node dist/index.js'],
  { stdio: 'inherit', shell: true }
);

// 处理进程退出
process.on('SIGINT', () => {
  tscProcess.kill();
  nodemonProcess.kill();
  process.exit();
});