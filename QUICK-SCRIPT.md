# 🚀 快速登录脚本（复制即可用）

## 使用方法

1. 打开任意 `http://localhost:5000` 页面
2. 按 `F12` 打开控制台
3. 复制下面代码，粘贴到控制台，按回车

---

```javascript
(async()=>{
console.clear();
console.log('%c🚀 开始自动登录...','color:#3b82f6;font-size:16px;font-weight:bold;');
const email='admin@tomato-ai.com';
const password='Admin@123456';
try{
const r=await fetch('/api/auth/login',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({email,password}),
credentials:'include'
});
const d=await r.json();
if(!d.success)throw new Error(d.error||'登录失败');
const token=d.data.token;
console.log('%c✅ Token获取成功','color:#16a34a;');
localStorage.setItem('token',token);
sessionStorage.setItem('token',token);
document.cookie=`token=${token};path=/;max-age=604800`;
const v=await fetch('/api/admin/superadmin/verify',{
method:'POST',
headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
credentials:'include'
});
const dv=await v.json();
if(dv.success){
console.log('%c✅ 登录成功！准备跳转...','color:#16a34a;font-size:18px;font-weight:bold;');
setTimeout(()=>window.location.href='/admin/dashboard',1000);
}else{
throw new Error(dv.error||'验证失败');
}
}catch(e){
console.error('%c❌ 失败: '+e.message,'color:#dc2626;font-size:16px;');
console.log('默认账号:',email);
console.log('默认密码:',password);
}
})();
```

---

## 第一次粘贴时

如果浏览器提示："不要将代码粘贴到不了解的控制台中"

输入：`允许粘贴` 然后回车，再重新粘贴脚本。

---

## 完成

成功后会自动跳转到管理后台！
