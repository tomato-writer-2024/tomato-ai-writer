const {getDb} = require('coze-coding-dev-sdk');

async function createMaterialsTable() {
  try {
    const db = await getDb();

    // Check if materials table exists
    const checkResult = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'materials'
    `);

    if (checkResult.rows.length > 0) {
      console.log('Materials table already exists');
      return;
    }

    // Create materials table
    console.log('Creating materials table...');
    await db.execute(`
      CREATE TABLE materials (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        tags JSONB DEFAULT '[]'::jsonb,
        novel_id VARCHAR(36),
        notes TEXT,
        is_favorite BOOLEAN DEFAULT false,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        is_deleted BOOLEAN DEFAULT false NOT NULL
      )
    `);

    // Create indexes
    console.log('Creating indexes...');
    await db.execute(`
      CREATE INDEX materials_user_id_idx ON materials(user_id)
    `);
    await db.execute(`
      CREATE INDEX materials_novel_id_idx ON materials(novel_id)
    `);
    await db.execute(`
      CREATE INDEX materials_category_idx ON materials(category)
    `);
    await db.execute(`
      CREATE INDEX materials_created_at_idx ON materials(created_at)
    `);

    console.log('✅ Materials table and indexes created successfully');

  } catch (error) {
    console.error('Error creating materials table:', error.message);
    process.exit(1);
  }
}

createMaterialsTable();
