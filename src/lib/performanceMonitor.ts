/**
 * 性能监控器
 * 监控系统性能指标，包括API响应时间、数据库查询时间、内存使用等
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
	timestamp: string;
	apiEndpoint: string;
	responseTime: number; // ms
	memoryUsage?: {
		heapUsed: number;
		heapTotal: number;
		external: number;
	};
	cpuUsage?: number;
	status: 'success' | 'error';
	error?: string;
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
	private metrics: PerformanceMetrics[] = [];
	private maxMetrics = 1000; // 最大存储指标数
	private startTime = Date.now();

	/**
	 * 记录API性能
	 */
	recordApiPerformance(
		apiEndpoint: string,
		responseTime: number,
		status: 'success' | 'error',
		error?: string
	): void {
		const metric: PerformanceMetrics = {
			timestamp: new Date().toISOString(),
			apiEndpoint,
			responseTime,
			status,
			error,
		};

		// 添加内存使用信息（如果可用）
		if (typeof process !== 'undefined' && process.memoryUsage) {
			const memoryUsage = process.memoryUsage();
			metric.memoryUsage = {
				heapUsed: memoryUsage.heapUsed,
				heapTotal: memoryUsage.heapTotal,
				external: memoryUsage.external,
			};
		}

		this.metrics.push(metric);

		// 保持最大指标数
		if (this.metrics.length > this.maxMetrics) {
			this.metrics.shift();
		}
	}

	/**
	 * 获取性能指标
	 */
	getMetrics(options?: {
		apiEndpoint?: string;
		limit?: number;
		startTime?: Date;
		endTime?: Date;
	}): PerformanceMetrics[] {
		let filtered = [...this.metrics];

		if (options?.apiEndpoint) {
			filtered = filtered.filter(m => m.apiEndpoint === options.apiEndpoint);
		}

		if (options?.startTime) {
			filtered = filtered.filter(m => new Date(m.timestamp) >= options.startTime!);
		}

		if (options?.endTime) {
			filtered = filtered.filter(m => new Date(m.timestamp) <= options.endTime!);
		}

		if (options?.limit) {
			filtered = filtered.slice(-options.limit);
		}

		return filtered;
	}

	/**
	 * 获取性能统计
	 */
	getStats(options?: {
		apiEndpoint?: string;
		startTime?: Date;
		endTime?: Date;
	}): {
		totalRequests: number;
		successRequests: number;
		errorRequests: number;
		averageResponseTime: number;
		minResponseTime: number;
		maxResponseTime: number;
		p95ResponseTime: number;
		p99ResponseTime: number;
		errorRate: number;
	} {
		const metrics = this.getMetrics(options);

		if (metrics.length === 0) {
			return {
				totalRequests: 0,
				successRequests: 0,
				errorRequests: 0,
				averageResponseTime: 0,
				minResponseTime: 0,
				maxResponseTime: 0,
				p95ResponseTime: 0,
				p99ResponseTime: 0,
				errorRate: 0,
			};
		}

		const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
		const successMetrics = metrics.filter(m => m.status === 'success');
		const errorMetrics = metrics.filter(m => m.status === 'error');

		const sum = responseTimes.reduce((a, b) => a + b, 0);
		const average = sum / responseTimes.length;

		const p95Index = Math.floor(responseTimes.length * 0.95);
		const p99Index = Math.floor(responseTimes.length * 0.99);

		return {
			totalRequests: metrics.length,
			successRequests: successMetrics.length,
			errorRequests: errorMetrics.length,
			averageResponseTime: Math.round(average),
			minResponseTime: responseTimes[0],
			maxResponseTime: responseTimes[responseTimes.length - 1],
			p95ResponseTime: responseTimes[p95Index],
			p99ResponseTime: responseTimes[p99Index],
			errorRate: (errorMetrics.length / metrics.length) * 100,
		};
	}

	/**
	 * 获取系统健康状态
	 */
	getHealthStatus(): {
		status: 'healthy' | 'warning' | 'critical';
		uptime: number;
		memoryUsage?: {
			heapUsed: number;
			heapTotal: number;
			external: number;
			usagePercent: number;
		};
		requestsPerMinute: number;
		averageResponseTime: number;
		errorRate: number;
	} {
		const now = Date.now();
		const uptime = now - this.startTime;
		const oneMinuteAgo = new Date(now - 60 * 1000);

		// 最近1分钟的指标
		const recentMetrics = this.getMetrics({
			startTime: oneMinuteAgo,
		});

		const stats = this.getStats({ startTime: oneMinuteAgo });
		const requestsPerMinute = recentMetrics.length;

		// 内存使用
		let memoryUsage;
		if (typeof process !== 'undefined' && process.memoryUsage) {
			const mem = process.memoryUsage();
			const usagePercent = (mem.heapUsed / mem.heapTotal) * 100;
			memoryUsage = {
				heapUsed: mem.heapUsed,
				heapTotal: mem.heapTotal,
				external: mem.external,
				usagePercent: Math.round(usagePercent),
			};
		}

		// 判断健康状态
		let status: 'healthy' | 'warning' | 'critical' = 'healthy';

		// 错误率超过5%或平均响应时间超过3秒
		if (stats.errorRate > 5 || stats.averageResponseTime > 3000) {
			status = 'warning';
		}

		// 错误率超过20%或平均响应时间超过10秒
		if (stats.errorRate > 20 || stats.averageResponseTime > 10000) {
			status = 'critical';
		}

		// 内存使用超过80%
		if (memoryUsage && memoryUsage.usagePercent > 80) {
			status = status === 'critical' ? 'critical' : 'warning';
		}

		return {
			status,
			uptime,
			memoryUsage,
			requestsPerMinute,
			averageResponseTime: stats.averageResponseTime,
			errorRate: stats.errorRate,
		};
	}

	/**
	 * 清理旧指标
	 */
	cleanupOldMetrics(olderThanHours: number = 24): number {
		const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
		const originalLength = this.metrics.length;

		this.metrics = this.metrics.filter(m => new Date(m.timestamp) >= cutoff);

		return originalLength - this.metrics.length;
	}

	/**
	 * 重置指标
	 */
	resetMetrics(): void {
		this.metrics = [];
		this.startTime = Date.now();
	}
}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor();
