const {getDb} = require('coze-coding-dev-sdk');

async function checkTables() {
  try {
    const db = await getDb();

    // Check materials table structure
    const materialsResult = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'materials'
      ORDER BY ordinal_position
    `);

    console.log('Materials table structure:');
    if (materialsResult.rows.length === 0) {
      console.log('  Table does not exist or has no columns');
    } else {
      materialsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTables();
