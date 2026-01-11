#!/bin/bash

# 番茄AI写作助手 - 代码推送脚本
# 使用前请先配置你的GitHub Personal Access Token

echo "=========================================="
echo "  番茄AI写作助手 - 代码推送脚本"
echo "=========================================="
echo ""

# 检查是否配置了GitHub Token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 错误：未配置GITHUB_TOKEN环境变量"
    echo ""
    echo "请先获取GitHub Personal Access Token："
    echo "1. 访问：https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token' -> 'Generate new token (classic)'"
    echo "3. Note: tomato-ai"
    echo "4. Expiration: 90 days"
    echo "5. Select scopes: 勾选 repo (全部勾选)"
    echo "6. 点击 Generate token"
    echo "7. 复制生成的token"
    echo ""
    echo "然后执行："
    echo "export GITHUB_TOKEN='你的token'"
    echo ""
    exit 1
fi

# 配置Git凭据
git config --global credential.helper store
echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials

# 推送代码
echo "开始推送代码到GitHub..."
echo ""

cd /workspace/projects

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
    echo "现在可以访问："
    echo "https://github.com/tomato-writer-2024/tomato-ai-writer"
    echo ""
else
    echo ""
    echo "❌ 代码推送失败"
    echo ""
    echo "请检查："
    echo "1. GitHub Token是否正确"
    echo "2. 仓库名称是否正确"
    echo "3. 网络连接是否正常"
    echo ""
fi
