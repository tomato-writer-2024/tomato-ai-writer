const {getDb} = require('coze-coding-dev-sdk');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const db = await getDb();

    // Test basic connection
    const result = await db.execute('SELECT NOW() as current_time');
    console.log('Database connected successfully');
    console.log('Server time:', result.rows[0].current_time);

    // Check if tables exist
    const tablesResult = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\nTables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check user count
    const userCountResult = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('\nTotal users:', userCountResult.rows[0].count);

    // Check novel count
    const novelCountResult = await db.execute('SELECT COUNT(*) as count FROM novels');
    console.log('Total novels:', novelCountResult.rows[0].count);

    // Check chapter count
    const chapterCountResult = await db.execute('SELECT COUNT(*) as count FROM chapters');
    console.log('Total chapters:', chapterCountResult.rows[0].count);

  } catch (error) {
    console.error('Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
