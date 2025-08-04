const ci = require("miniprogram-ci")
const path = require("path")
const fs = require("fs")
const dotenv = require("dotenv")

dotenv.config()

const project = new ci.Project({
  appid: process.env.WECHAT_APPID,
  type: "miniProgram",
  projectPath: path.resolve(__dirname, "../out/weapp"), // 项目路径
  privateKeyPath: path.resolve(__dirname, "../private.key"),
  ignores: ["node_modules/**/*"],
})

ci.upload({
  project,
  version: "0.0.1",
  desc: "CI 自动上传",
  setting: {
    useProjectConfig: true,
    useCOS: true
  },
})
  .then((res) => {
    console.log("上传成功", res)
  })
  .catch((err) => {
    console.error("上传失败", err)
  })
