const { getDb } = require('coze-coding-dev-sdk');

async function checkChaptersTable() {
  try {
    const db = await getDb();

    // 检查chapters表是否存在
    const tableResult = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'chapters'
      )
    `);

    const tableExists = tableResult.rows[0].exists;
    console.log('chapters表存在:', tableExists);

    if (tableExists) {
      // 检查表结构
      const columnsResult = await db.execute(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'chapters'
        ORDER BY ordinal_position
      `);

      console.log('\nchapters表结构:');
      columnsResult.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    }

  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkChaptersTable();
