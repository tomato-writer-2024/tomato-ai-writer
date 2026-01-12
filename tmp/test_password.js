const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'test123456';
  const hash = '$2b$12$qSZ15buBf1BQz5csrpn4xedRDvnm80t6DlTvL4ozgYHv5PS8ljqo6';

  const isValid = await bcrypt.compare(password, hash);
  console.log('Password valid:', isValid);
}

testPassword();
