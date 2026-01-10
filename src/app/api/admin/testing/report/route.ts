import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * 获取测试报告
 * GET /api/admin/testing/report?testId=xxx
 */
export async function GET(request: NextRequest) {
	try {
		// 验证管理员身份
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json(
				{ error: '未提供认证token' },
				{ status: 401 }
			);
		}

		const token = authHeader.substring(7);
		const payload = verifyToken(token);

		if (!payload || !payload.userId) {
			return NextResponse.json(
				{ error: '无效的token' },
				{ status: 401 }
			);
		}

		const db = await getDb();

		// 验证超级管理员身份
		try {
			const userIdEscaped = payload.userId.replace(/'/g, "''");
			const result = await db.execute(`
				SELECT id, is_super_admin FROM users
				WHERE id = '${userIdEscaped}' AND is_super_admin = true
				LIMIT 1
			`);

			if (!result || !result.rows || result.rows.length === 0) {
				return NextResponse.json(
					{ error: '无权访问此资源' },
					{ status: 403 }
				);
			}
		} catch (e) {
			console.error('验证管理员身份失败:', e);
			return NextResponse.json(
				{ error: '验证管理员身份失败' },
				{ status: 500 }
			);
		}

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const testId = searchParams.get('testId');

		try {
			if (testId) {
				// 获取指定测试报告
				const testIdEscaped = testId.replace(/'/g, "''");
				const result = await db.execute(`
					SELECT * FROM test_results WHERE id = '${testIdEscaped}' LIMIT 1
				`);

				if (!result || !result.rows || result.rows.length === 0) {
					return NextResponse.json(
						{ error: '测试报告不存在' },
						{ status: 404 }
					);
				}

				return NextResponse.json({
					success: true,
					report: result.rows[0],
				});
			} else {
				// 获取所有测试报告列表
				const result = await db.execute(`
					SELECT * FROM test_results
					ORDER BY completed_at DESC
					LIMIT 50
				`);

				return NextResponse.json({
					success: true,
					reports: result.rows || [],
					total: result.rows?.length || 0,
				});
			}
		} catch (e) {
			console.error('获取测试报告失败:', e);
			return NextResponse.json(
				{ error: '获取测试报告失败' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('获取测试报告失败:', error);
		return NextResponse.json(
			{ error: '获取测试报告失败' },
			{ status: 500 }
		);
	}
}

/**
 * 生成测试报告（HTML格式）
 * POST /api/admin/testing/report
 */
export async function POST(request: NextRequest) {
	try {
		// 验证管理员身份
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json(
				{ error: '未提供认证token' },
				{ status: 401 }
			);
		}

		const token = authHeader.substring(7);
		const payload = verifyToken(token);

		if (!payload || !payload.userId) {
			return NextResponse.json(
				{ error: '无效的token' },
				{ status: 401 }
			);
		}

		const db = await getDb();

		// 验证超级管理员身份
		try {
			const userIdEscaped = payload.userId.replace(/'/g, "''");
			const result = await db.execute(`
				SELECT id, is_super_admin FROM users
				WHERE id = '${userIdEscaped}' AND is_super_admin = true
				LIMIT 1
			`);

			if (!result || !result.rows || result.rows.length === 0) {
				return NextResponse.json(
					{ error: '无权访问此资源' },
					{ status: 403 }
				);
			}
		} catch (e) {
			console.error('验证管理员身份失败:', e);
			return NextResponse.json(
				{ error: '验证管理员身份失败' },
				{ status: 500 }
			);
		}

		// 获取参数
		const body = await request.json();
		const { testId } = body;

		if (!testId) {
			return NextResponse.json(
				{ error: '缺少testId参数' },
				{ status: 400 }
			);
		}

		// 获取测试结果
		try {
			const testIdEscaped = testId.replace(/'/g, "''");
			const result = await db.execute(`
				SELECT * FROM test_results WHERE id = '${testIdEscaped}' LIMIT 1
			`);

			if (!result || !result.rows || result.rows.length === 0) {
				return NextResponse.json(
					{ error: '测试报告不存在' },
					{ status: 404 }
				);
			}

			// 生成HTML报告
			const html = generateHTMLReport(result.rows[0]);

			return NextResponse.json({
				success: true,
				html,
				testId,
			});
		} catch (e) {
			console.error('获取测试报告失败:', e);
			return NextResponse.json(
				{ error: '获取测试报告失败' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('生成测试报告失败:', error);
		return NextResponse.json(
			{ error: '生成测试报告失败' },
			{ status: 500 }
		);
	}
}

/**
 * 生成HTML格式的测试报告
 */
function generateHTMLReport(testResult: any) {
	const {
		id,
		testType,
		testConfig,
		totalTests,
		successCount,
		failureCount,
		successRate,
		averageQualityScore,
		averageCompletionRate,
		averageResponseTime,
		startedAt,
		completedAt,
		duration,
		summary,
		details,
	} = testResult;

	const moduleResults = details.moduleResults || {};

	const moduleRows = Object.entries(moduleResults).map(([module, result]: [string, any]) => {
		const moduleSuccessRate = result.total > 0 ? ((result.success / result.total) * 100).toFixed(2) : '0.00';
		const moduleAvgTime = result.responseTimes.length > 0
			? (result.responseTimes.reduce((a: number, b: number) => a + b, 0) / result.responseTimes.length).toFixed(0)
			: '0';

		return `
			<tr>
				<td class="border px-4 py-2">${module}</td>
				<td class="border px-4 py-2 text-center">${result.total}</td>
				<td class="border px-4 py-2 text-center text-green-600">${result.success}</td>
				<td class="border px-4 py-2 text-center text-red-600">${result.failure}</td>
				<td class="border px-4 py-2 text-center">${moduleSuccessRate}%</td>
				<td class="border px-4 py-2 text-center">${moduleAvgTime}ms</td>
			</tr>
		`;
	}).join('');

	return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI辅助写作工具 - 测试报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            color: #1e293b;
        }
        .header .meta {
            color: #64748b;
            font-size: 14px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #1e293b;
            border-left: 4px solid #3b82f6;
            padding-left: 12px;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table th, table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 600;
        }
        .success-rate-high {
            color: #059669;
            font-weight: bold;
        }
        .success-rate-medium {
            color: #d97706;
            font-weight: bold;
        }
        .success-rate-low {
            color: #dc2626;
            font-weight: bold;
        }
        .timestamp {
            color: #64748b;
            font-size: 14px;
        }
        .recommendations {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI辅助写作工具 - 自动化测试报告</h1>
            <div class="meta">
                <div>测试ID: ${id}</div>
                <div class="timestamp">
                    开始时间: ${new Date(startedAt).toLocaleString('zh-CN')}
                    | 结束时间: ${new Date(completedAt).toLocaleString('zh-CN')}
                    | 耗时: ${duration}秒
                </div>
            </div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>总测试数</h3>
                <div class="value">${totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>成功</h3>
                <div class="value">${successCount}</div>
            </div>
            <div class="summary-card">
                <h3>失败</h3>
                <div class="value">${failureCount}</div>
            </div>
            <div class="summary-card">
                <h3>成功率</h3>
                <div class="value">${Number(successRate).toFixed(2)}%</div>
            </div>
        </div>

        <div class="summary" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
            <div class="summary-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <h3>平均质量评分</h3>
                <div class="value">${Number(averageQualityScore).toFixed(1)}</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <h3>平均完读率</h3>
                <div class="value">${Number(averageCompletionRate).toFixed(1)}%</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <h3>平均响应时间</h3>
                <div class="value">${Number(averageResponseTime).toFixed(0)}ms</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <h3>测试用户数</h3>
                <div class="value">${testConfig.userCount || 0}</div>
            </div>
        </div>

        <div class="section">
            <h2>测试总结</h2>
            <p style="line-height: 1.6; color: #334155;">${summary}</p>
        </div>

        <div class="section">
            <h2>模块测试详情</h2>
            <table>
                <thead>
                    <tr>
                        <th>模块名称</th>
                        <th class="text-center">测试数</th>
                        <th class="text-center">成功</th>
                        <th class="text-center">失败</th>
                        <th class="text-center">成功率</th>
                        <th class="text-center">平均响应时间</th>
                    </tr>
                </thead>
                <tbody>
                    ${moduleRows}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>测试目标达成情况</h2>
            <table>
                <thead>
                    <tr>
                        <th>目标指标</th>
                        <th>目标值</th>
                        <th>实际值</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>双视角评分（编辑+读者）</td>
                        <td>9.8分+</td>
                        <td>${(Number(averageQualityScore) / 10).toFixed(2)}分</td>
                        <td class="${Number(averageQualityScore) >= 98 ? 'success-rate-high' : 'success-rate-low'}">
                            ${Number(averageQualityScore) >= 98 ? '✓ 达成' : '✗ 未达成'}
                        </td>
                    </tr>
                    <tr>
                        <td>质量评分</td>
                        <td>85分+</td>
                        <td>${Number(averageQualityScore).toFixed(1)}分</td>
                        <td class="${Number(averageQualityScore) >= 85 ? 'success-rate-high' : 'success-rate-low'}">
                            ${Number(averageQualityScore) >= 85 ? '✓ 达成' : '✗ 未达成'}
                        </td>
                    </tr>
                    <tr>
                        <td>首章完读率</td>
                        <td>60%+</td>
                        <td>${Number(averageCompletionRate).toFixed(1)}%</td>
                        <td class="${Number(averageCompletionRate) >= 60 ? 'success-rate-high' : 'success-rate-low'}">
                            ${Number(averageCompletionRate) >= 60 ? '✓ 达成' : '✗ 未达成'}
                        </td>
                    </tr>
                    <tr>
                        <td>AI首字响应时间</td>
                        <td><1秒</td>
                        <td>${(Number(averageResponseTime) / 1000).toFixed(2)}秒</td>
                        <td class="${Number(averageResponseTime) < 1000 ? 'success-rate-high' : 'success-rate-low'}">
                            ${Number(averageResponseTime) < 1000 ? '✓ 达成' : '✗ 未达成'}
                        </td>
                    </tr>
                    <tr>
                        <td>功能覆盖率</td>
                        <td>95%+</td>
                        <td>${Number(successRate).toFixed(2)}%</td>
                        <td class="${Number(successRate) >= 95 ? 'success-rate-high' : 'success-rate-low'}">
                            ${Number(successRate) >= 95 ? '✓ 达成' : '✗ 未达成'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>错误详情</h2>
            ${details.errors && details.errors.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>模块</th>
                            <th>用户ID</th>
                            <th>错误信息</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.errors.slice(0, 50).map((err: any) => `
                            <tr>
                                <td>${err.module}</td>
                                <td>${err.userId}</td>
                                <td>${err.error}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${details.errors.length > 50 ? `<p style="color: #64748b; margin-top: 10px;">... 还有 ${details.errors.length - 50} 个错误未显示</p>` : ''}
            ` : '<p style="color: #059669;">✓ 无错误</p>'}
        </div>

        <div class="section">
            <h2>优化建议</h2>
            <div class="recommendations">
                <ul style="margin: 0; padding-left: 20px;">
                    ${Number(successRate) < 95 ? '<li>功能覆盖率低于95%，需要修复失败的功能模块</li>' : ''}
                    ${Number(averageResponseTime) >= 1000 ? '<li>AI响应时间超过1秒，需要优化LLM调用性能</li>' : ''}
                    ${Number(averageQualityScore) < 85 ? '<li>质量评分低于85分，需要优化内容生成质量</li>' : ''}
                    ${Number(averageCompletionRate) < 60 ? '<li>完读率低于60%，需要优化内容吸引力</li>' : ''}
                    ${details.errors && details.errors.length > 0 ? '<li>存在错误用例，需要修复相关功能</li>' : ''}
                    ${details.moduleResults && Object.keys(details.moduleResults).length < 20 ? '<li>测试模块数量不足，建议扩展测试覆盖范围</li>' : ''}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}
