import { eq, and, SQL, like, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { materials, insertMaterialSchema, updateMaterialSchema } from "./shared/schema";
import type { Material, InsertMaterial, UpdateMaterial } from "./shared/schema";

/**
 * 素材库管理器
 */
export class MaterialManager {
	/**
	 * 创建素材
	 */
	async createMaterial(data: InsertMaterial): Promise<Material> {
		const db = await getDb();
		const validated = insertMaterialSchema.parse(data);
		const [material] = await db.insert(materials).values(validated).returning();
		return material;
	}

	/**
	 * 获取素材列表
	 */
	async getMaterials(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<Material, 'id' | 'userId' | 'category' | 'novelId' | 'isFavorite' | 'isDeleted'>>;
		searchQuery?: string;
		sortBy?: 'createdAt' | 'updatedAt' | 'usageCount';
		sortOrder?: 'asc' | 'desc';
	} = {}): Promise<Material[]> {
		const { skip = 0, limit = 100, filters = {}, searchQuery, sortBy = 'createdAt', sortOrder = 'desc' } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.id !== undefined) {
			conditions.push(eq(materials.id, filters.id));
		}
		if (filters.userId !== undefined) {
			conditions.push(eq(materials.userId, filters.userId));
		}
		if (filters.category !== undefined) {
			conditions.push(eq(materials.category, filters.category));
		}
		if (filters.novelId !== undefined) {
			conditions.push(eq(materials.novelId, filters.novelId));
		}
		if (filters.isFavorite !== undefined) {
			conditions.push(eq(materials.isFavorite, filters.isFavorite));
		}
		if (filters.isDeleted !== undefined) {
			conditions.push(eq(materials.isDeleted, filters.isDeleted));
		}

		// 默认过滤已删除的素材
		if (filters.isDeleted === undefined) {
			conditions.push(eq(materials.isDeleted, false));
		}

		// 搜索查询（模糊匹配标题和内容）
		if (searchQuery) {
			conditions.push(
				sql`(${like(materials.title, `%${searchQuery}%`)} OR ${like(materials.content, `%${searchQuery}%`)})`
			);
		}

		let query = db.select().from(materials);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		// 排序
		if (sortOrder === 'desc') {
			query = query.orderBy(desc(materials[sortBy]));
		} else {
			query = query.orderBy(materials[sortBy]);
		}

		return query.limit(limit).offset(skip);
	}

	/**
	 * 根据ID获取素材
	 */
	async getMaterialById(id: string): Promise<Material | null> {
		const db = await getDb();
		const [material] = await db.select().from(materials).where(eq(materials.id, id));
		return material || null;
	}

	/**
	 * 更新素材
	 */
	async updateMaterial(id: string, data: UpdateMaterial): Promise<Material | null> {
		const db = await getDb();
		const validated = updateMaterialSchema.parse(data);
		const [material] = await db
			.update(materials)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(materials.id, id))
			.returning();
		return material || null;
	}

	/**
	 * 删除素材（软删除）
	 */
	async deleteMaterial(id: string): Promise<Material | null> {
		return this.updateMaterial(id, { isDeleted: true });
	}

	/**
	 * 永久删除素材
	 */
	async permanentlyDeleteMaterial(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db.delete(materials).where(eq(materials.id, id));
		return (result.rowCount || 0) > 0;
	}

	/**
	 * 增加素材使用次数
	 */
	async incrementUsageCount(id: string): Promise<Material | null> {
		const db = await getDb();
		const [material] = await db
			.update(materials)
			.set({
				usageCount: sql`${materials.usageCount} + 1`,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(materials.id, id))
			.returning();
		return material || null;
	}

	/**
	 * 切换收藏状态
	 */
	async toggleFavorite(id: string): Promise<Material | null> {
		const material = await this.getMaterialById(id);
		if (!material) return null;
		return this.updateMaterial(id, { isFavorite: !material.isFavorite });
	}

	/**
	 * 获取用户的素材统计
	 */
	async getUserMaterialStats(userId: string): Promise<{
		total: number;
		byCategory: Record<string, number>;
		favorites: number;
	}> {
		const materials = await this.getMaterials({
			filters: { userId },
			limit: 10000,
		});

		const stats = {
			total: materials.length,
			byCategory: {} as Record<string, number>,
			favorites: 0,
		};

		for (const material of materials) {
			// 按分类统计
			stats.byCategory[material.category] = (stats.byCategory[material.category] || 0) + 1;

			// 收藏统计
			if (material.isFavorite) {
				stats.favorites++;
			}
		}

		return stats;
	}

	/**
	 * 批量创建素材
	 */
	async bulkCreateMaterials(data: InsertMaterial[]): Promise<Material[]> {
		const db = await getDb();
		const validated = data.map(item => insertMaterialSchema.parse(item));
		return db.insert(materials).values(validated).returning();
	}

	/**
	 * 搜索素材（高级搜索）
	 */
	async searchMaterials(options: {
		userId: string;
		query: string;
		category?: string;
		novelId?: string;
		isFavorite?: boolean;
		skip?: number;
		limit?: number;
	}): Promise<Material[]> {
		const { userId, query, category, novelId, isFavorite, skip = 0, limit = 50 } = options;
		const db = await getDb();

		const conditions: SQL[] = [
			eq(materials.userId, userId),
			eq(materials.isDeleted, false),
		];

		// 搜索关键词
		if (query) {
			conditions.push(
				sql`(${like(materials.title, `%${query}%`)} OR ${like(materials.content, `%${query}%`)} OR ${like(materials.tags, `%${query}%`)})`
			);
		}

		// 分类筛选
		if (category) {
			conditions.push(eq(materials.category, category));
		}

		// 小说筛选
		if (novelId) {
			conditions.push(eq(materials.novelId, novelId));
		}

		// 收藏筛选
		if (isFavorite !== undefined) {
			conditions.push(eq(materials.isFavorite, isFavorite));
		}

		return db
			.select()
			.from(materials)
			.where(and(...conditions))
			.orderBy(desc(materials.usageCount), desc(materials.updatedAt))
			.limit(limit)
			.offset(skip);
	}
}

// 导出单例
export const materialManager = new MaterialManager();
