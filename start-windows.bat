@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 番茄AI写作助手 - Windows 快速启动脚本
echo ========================================
echo.

cd /d C:\tomato-ai-writer\tomato-ai-writer

if %errorlevel% neq 0 (
    echo [错误] 无法进入项目目录
    echo 请检查路径是否正确: C:\tomato-ai-writer\tomato-ai-writer
    pause
    exit /b 1
)

echo [信息] 当前目录: %CD%
echo.

echo ========================================
echo 步骤 1/3: 检查依赖
echo ========================================
echo.

if not exist "node_modules\" (
    echo [信息] node_modules 不存在，正在安装依赖...
    echo.
    call npm install

    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败
        echo 请检查网络连接或使用淘宝镜像:
        echo   npm config set registry https://registry.npmmirror.com
        pause
        exit /b 1
    )

    echo.
    echo [成功] 依赖安装完成
) else (
    echo [成功] 依赖已存在
)

echo.
echo ========================================
echo 步骤 2/3: 检查管理员账号
echo ========================================
echo.

echo [信息] 检查管理员账号...
echo.

REM 检查 tsx 是否安装
where tsx >nul 2>nul
if %errorlevel% neq 0 (
    echo [信息] tsx 未安装，正在安装...
    call npm install -g tsx
)

if %errorlevel% neq 0 (
    echo [警告] tsx 安装失败，跳过管理员账号检查
    echo 您可以稍后手动运行: npx tsx src/scripts/create-admin-direct.ts
) else (
    echo [信息] 正在创建管理员账号...
    call npx tsx src/scripts/create-admin-direct.ts

    if %errorlevel% neq 0 (
        echo [警告] 管理员账号创建失败，但继续启动服务
    ) else (
        echo [成功] 管理员账号检查完成
    )
)

echo.
echo ========================================
echo 步骤 3/3: 启动开发服务器
echo ========================================
echo.
echo [信息] 正在启动开发服务器...
echo.
echo 服务启动后，请访问以下地址:
echo   - 主页: http://localhost:5000
echo   - 登录: http://localhost:5000/login
echo   - 测试登录: http://localhost:5000/test-login
echo.
echo 管理员登录信息:
echo   邮箱: 208343256@qq.com
echo   密码: TomatoAdmin@2024
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

call npm run dev

endlocal
