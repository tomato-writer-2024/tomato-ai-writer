@echo off
chcp 65001 >nul

echo ========================================
echo Windows 本地登录测试
echo ========================================
echo.

cd /d C:\tomato-ai-writer\tomato-ai-writer

echo [信息] 测试管理员账号登录...
echo.
echo 登录信息:
echo   邮箱: 208343256@qq.com
echo   密码: TomatoAdmin@2024
echo.

REM 使用 PowerShell 的 Invoke-RestMethod 发送请求
powershell -Command "& {$body = @{email='208343256@qq.com';password='TomatoAdmin@2024'} | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login-direct' -Method Post -Body $body -ContentType 'application/json'; $response | ConvertTo-Json -Depth 3}"

echo.
echo ========================================
echo.
echo 如果看到 JSON 响应，说明登录成功！
echo.
echo 请访问以下地址测试浏览器登录:
echo   http://localhost:5000/login
echo   http://localhost:5000/test-login
echo.
echo ========================================
pause
