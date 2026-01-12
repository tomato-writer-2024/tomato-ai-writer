const {getDb} = require('coze-coding-dev-sdk');

async function checkUser() {
  try {
    const db = await getDb();
    const result = await db.execute('SELECT id, email, password_hash FROM users WHERE email = \'test@example.com\'');
    console.log('Users found:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('User data:', JSON.stringify(result.rows[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
