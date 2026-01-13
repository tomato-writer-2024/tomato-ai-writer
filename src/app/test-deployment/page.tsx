export default function TestDeploymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          部署测试成功！
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          这个页面可以正常访问，说明Next.js应用已成功部署到Vercel
        </p>
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            返回首页
          </a>
          <a
            href="/login"
            className="inline-block px-6 py-3 ml-4 border-2 border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all"
          >
            前往登录页
          </a>
        </div>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">
            部署时间: {new Date().toLocaleString('zh-CN')}
          </p>
          <p className="text-sm text-gray-600">
            Node.js版本: {process.version}
          </p>
          <p className="text-sm text-gray-600">
            环境: {process.env.NODE_ENV}
          </p>
        </div>
      </div>
    </div>
  );
}
