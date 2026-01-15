# Windows环境彻底清理指南

## 问题诊断
JWT Token生成后立即过期（iat=exp），说明Next.js缓存了旧版本的编译代码。

## 清理步骤（在项目根目录的CMD中执行）

### 1. 停止开发服务器
在运行 `pnpm run dev` 的窗口中按 **Ctrl+C** 停止服务器。

### 2. 删除所有缓存目录
```cmd
del /F /Q .next\*.* 2>nul
for /d %i in (.next\*) do @rmdir /s /q "%i" 2>nul
```

如果上面命令报错，尝试更简单的方式：
```cmd
rmdir /s /q .next
```

如果还是提示"找不到文件"，说明.next可能不存在，继续下一步。

### 3. 删除node_modules缓存
```cmd
rmdir /s /q node_modules\.cache
```

### 4. 重新安装依赖
```cmd
pnpm install --force
```

### 5. 清理Next.js编译缓存
```cmd
pnpm run build
```

如果build失败也没关系，这会强制重新编译。

### 6. 启动开发服务器
```cmd
pnpm run dev
```

## 验证步骤

### 1. 测试诊断API
在浏览器中访问：
```
http://localhost:5000/api/debug/test-login-token
```

然后在浏览器控制台执行：
```javascript
fetch('http://localhost:5000/api/debug/test-login-token', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@test.com', password: 'test'})
}).then(r => r.json()).then(data => {
  console.log('Token有效期:', data.data?.analysis?.expiresIn, '秒');
  console.log('Token有效期（天）:', data.data?.analysis?.expiresInDays);
  if (data.data?.analysis?.expiresIn === 604800) {
    console.log('✅ Token生成正常（7天）');
  } else {
    console.log('❌ Token生成异常');
  }
});
```

### 2. 测试模拟登录API
```javascript
fetch('http://localhost:5000/api/debug/simulate-login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: '208343256@qq.com', password: '你的真实密码'})
}).then(r => r.json()).then(data => {
  console.log('Access token有效期:', data.data?.analysis?.access?.expiresIn, '秒');
  console.log('Access token有效期（天）:', data.data?.analysis?.access?.expiresInDays);
  if (data.data?.analysis?.access?.expiresIn === 604800) {
    console.log('✅ 登录Token生成正常（7天）');
  } else {
    console.log('❌ 登录Token生成异常');
  }
});
```

### 3. 清理浏览器缓存
在浏览器中按 **F12**，在控制台执行：
```javascript
localStorage.clear();
console.log('✅ 浏览器缓存已清理');
```

### 4. 重新登录
访问：`http://localhost:5000/admin/login`

登录成功后，在控制台执行：
```javascript
const token = localStorage.getItem('admin_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiresIn = payload.exp - payload.iat;
  console.log('Token有效期（秒）:', expiresIn);
  console.log('Token有效期（天）:', (expiresIn / 86400).toFixed(2));
  if (expiresIn === 604800) {
    console.log('✅ 问题已解决！Token有效期正确（7天）');
  } else {
    console.log('❌ 问题未解决');
  }
}
```

## 期望结果

如果一切正常，你应该看到：
```
Token有效期（秒）: 604800
Token有效期（天）: 7.00
✅ 问题已解决！Token有效期正确（7天）
```

## 如果问题仍然存在

如果执行上述步骤后问题仍然存在，请提供以下信息：

1. **浏览器控制台的完整输出**
2. **CMD窗口中的服务器日志**
3. **诊断API的返回结果**

```cmd
curl -X POST http://localhost:5000/api/debug/test-login-token -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test\"}"
```

## 注意事项

- 确保在执行清理命令前先停止服务器
- `Ctrl+C` 停止服务器可能需要等待几秒钟
- 如果权限问题导致无法删除文件，尝试以管理员身份运行CMD
