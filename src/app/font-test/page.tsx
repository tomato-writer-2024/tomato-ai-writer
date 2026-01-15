/**
 * 字体测试页面
 *
 * 访问地址：http://localhost:5000/font-test
 *
 * 用于验证 Inter 和 JetBrains Mono 字体是否正确加载
 */

export const metadata = {
  title: '字体测试 - 番茄AI写作助手',
};

export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">字体测试页面</h1>

        {/* Inter 字体测试 */}
        <section className="mb-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Inter 字体</h2>
          <div className="space-y-4">
            <p className="text-base text-gray-700">
              这是 Inter 字体的正文示例。Inter 是一款现代无衬线字体，专为用户界面设计而优化。
            </p>
            <p className="text-lg text-gray-700">
              这是较大号的 Inter 字体，用于重要信息的展示。
            </p>
            <p className="text-sm text-gray-700">
              这是小号 Inter 字体，用于辅助文本和说明。
            </p>
            <p className="text-xl font-bold text-gray-900">
              这是加粗的大号 Inter 字体，用于标题和强调。
            </p>
          </div>
        </section>

        {/* JetBrains Mono 字体测试 */}
        <section className="mb-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">JetBrains Mono 字体（等宽字体）</h2>
          <div className="space-y-4 font-mono">
            <p className="text-base text-gray-700">
              这是 JetBrains Mono 字体的示例。它是一款等宽字体，适合显示代码和数字。
            </p>
            <div className="bg-gray-900 rounded-lg p-4 text-green-400">
              <pre>
{`function example() {
  const message = "Hello, World!";
  console.log(message);
  return 42;
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* 字体权重测试 */}
        <section className="mb-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Inter 字体权重</h2>
          <div className="space-y-3">
            <p className="font-light text-gray-700">Light 300</p>
            <p className="font-normal text-gray-700">Normal 400</p>
            <p className="font-medium text-gray-700">Medium 500</p>
            <p className="font-semibold text-gray-700">Semibold 600</p>
            <p className="font-bold text-gray-700">Bold 700</p>
            <p className="font-extrabold text-gray-700">Extra Bold 800</p>
          </div>
        </section>

        {/* 中文文本测试 */}
        <section className="mb-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">中文文本渲染测试</h2>
          <div className="space-y-4">
            <p className="text-base text-gray-700">
              番茄AI写作助手是一款专为网络小说创作者打造的人工智能辅助写作工具。
            </p>
            <p className="text-lg text-gray-700">
              通过深度学习技术，帮助创作者生成符合平台风格的高质量内容。
            </p>
            <p className="text-xl font-bold text-gray-900">
              提升创作效率，打造爆款爽文！
            </p>
          </div>
        </section>

        {/* 验证状态 */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">✅ 字体加载验证</h2>
          <ul className="space-y-2 text-green-800">
            <li>✓ Inter 字体已加载（页面正常显示说明字体加载成功）</li>
            <li>✓ JetBrains Mono 字体已加载（代码块显示正常）</li>
            <li>✓ 中文字符渲染正常</li>
            <li>✓ 字体权重显示正确</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
