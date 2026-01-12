const {getDb} = require('coze-coding-dev-sdk');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    const db = await getDb();
    const newPassword = 'test123456';
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    const result = await db.execute(`UPDATE users SET password_hash = '${newPasswordHash}' WHERE email = 'test@example.com'`);
    console.log('Password updated successfully');
    console.log('New hash:', newPasswordHash);

    // Verify
    const userResult = await db.execute(`SELECT password_hash FROM users WHERE email = 'test@example.com'`);
    const isValid = await bcrypt.compare(newPassword, userResult.rows[0].password_hash);
    console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePassword();
