/**
 * SQL查询辅助工具
 * 提供安全的SQL查询构建方法，防止SQL注入攻击
 */

/**
 * SQL参数类型
 */
type SqlValue = string | number | boolean | null | Date | undefined;

/**
 * 转义SQL字符串值
 * 防止SQL注入攻击
 */
export function escapeSqlString(value: string): string {
  // 替换单引号为两个单引号
  return value.replace(/'/g, "''");
}

/**
 * 构建参数化的SQL查询语句
 * 使用$1, $2, $3...作为参数占位符（PostgreSQL风格）
 *
 * @param query SQL查询语句，使用?作为参数占位符
 * @param params 参数值数组
 * @returns 转换后的SQL语句和参数数组
 */
export function buildParameterizedQuery(
  query: string,
  params: SqlValue[]
): { sql: string; values: any[] } {
  let paramIndex = 0;
  const values: any[] = [];

  // 替换所有?为$1, $2, $3...
  const sql = query.replace(/\?/g, () => {
    const value = params[paramIndex];
    paramIndex++;

    // 将值添加到values数组
    if (value === null || value === undefined) {
      values.push(null);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      values.push(value);
    } else if (value instanceof Date) {
      values.push(value.toISOString());
    } else {
      values.push(String(value));
    }

    return `$${paramIndex}`;
  });

  return { sql, values };
}

/**
 * 构建安全的WHERE条件
 * 支持AND和OR逻辑
 */
export function buildWhereClause(
  conditions: Record<string, SqlValue>,
  operator: 'AND' | 'OR' = 'AND'
): { clause: string; values: any[] } {
  const values: any[] = [];
  const clauses: string[] = [];

  Object.entries(conditions).forEach(([key, value], index) => {
    if (value !== null && value !== undefined) {
      clauses.push(`${key} = $${index + 1}`);

      if (typeof value === 'number' || typeof value === 'boolean') {
        values.push(value);
      } else if (value instanceof Date) {
        values.push(value.toISOString());
      } else {
        values.push(String(value));
      }
    }
  });

  return {
    clause: clauses.length > 0 ? `${clauses.join(` ${operator} `)}` : '1=1',
    values,
  };
}

/**
 * 构建安全的IN子句
 */
export function buildInClause(
  column: string,
  values: SqlValue[]
): { clause: string; params: any[] } {
  if (values.length === 0) {
    return { clause: '1=0', params: [] };
  }

  const params = values.map((v) => {
    if (typeof v === 'number' || typeof v === 'boolean') {
      return v;
    } else if (v instanceof Date) {
      return v.toISOString();
    } else {
      return String(v);
    }
  });

  const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');

  return {
    clause: `${column} IN (${placeholders})`,
    params,
  };
}

/**
 * 构建安全的INSERT语句
 */
export function buildInsertQuery(
  table: string,
  data: Record<string, SqlValue>
): { sql: string; values: any[] } {
  const columns = Object.keys(data);
  const values: any[] = [];
  const placeholders: string[] = [];

  columns.forEach((col, index) => {
    const value = data[col];
    placeholders.push(`$${index + 1}`);

    if (value === null || value === undefined) {
      values.push(null);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      values.push(value);
    } else if (value instanceof Date) {
      values.push(value.toISOString());
    } else {
      values.push(String(value));
    }
  });

  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
  `;

  return { sql, values };
}

/**
 * 构建安全的UPDATE语句
 */
export function buildUpdateQuery(
  table: string,
  data: Record<string, SqlValue>,
  where: Record<string, SqlValue>
): { sql: string; values: any[] } {
  const setValues: any[] = [];
  const whereValues: any[] = [];
  const setClauses: string[] = [];

  // 构建SET子句
  Object.entries(data).forEach(([key, value], index) => {
    setClauses.push(`${key} = $${index + 1}`);

    if (value === null || value === undefined) {
      setValues.push(null);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      setValues.push(value);
    } else if (value instanceof Date) {
      setValues.push(value.toISOString());
    } else {
      setValues.push(String(value));
    }
  });

  // 构建WHERE子句
  const whereResult = buildWhereClause(where);

  const sql = `
    UPDATE ${table}
    SET ${setClauses.join(', ')}
    WHERE ${whereResult.clause}
  `;

  return {
    sql,
    values: [...setValues, ...whereResult.values],
  };
}

/**
 * 验证SQL查询安全性（防止SQL注入）
 * 检查是否包含危险的SQL关键字
 */
export function validateSqlSafety(query: string): { safe: boolean; warning?: string } {
  const dangerousPatterns = [
    /;\s*DROP\s+TABLE/i,  // DROP TABLE
    /;\s*DELETE\s+FROM/i, // DELETE FROM
    /;\s*TRUNCATE\s+TABLE/i, // TRUNCATE
    /;\s*ALTER\s+TABLE/i,  // ALTER TABLE
    /;\s*EXEC\s*\(/i,     // EXECUTE
    /;\s*EXECUTE\s*\(/i,  // EXECUTE
    /UNION\s+SELECT/i,    // UNION SELECT
    /--/,                 // SQL注释
    /\/\*/i,              // SQL注释
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return {
        safe: false,
        warning: '检测到潜在的SQL注入攻击',
      };
    }
  }

  return { safe: true };
}

/**
 * 格式化查询结果
 * 将snake_case字段转换为camelCase
 */
export function formatQueryResults<T = any>(
  rows: any[]
): T[] {
  return rows.map((row) => {
    const formatted: any = {};

    Object.entries(row).forEach(([key, value]) => {
      // 将snake_case转换为camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      formatted[camelKey] = value;
    });

    return formatted;
  });
}
