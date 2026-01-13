import dns from 'dns/promises';

async function testDNS() {
  console.log('开始测试DNS解析...');

  try {
    console.log('尝试解析IPv4地址...');
    const ipv4 = await dns.lookup('db.jtibmdmfvusjlhiuqyrn.supabase.co', { family: 4 });
    console.log('IPv4解析成功:', ipv4);
  } catch (error) {
    console.error('IPv4解析失败:', error.code, error.message);

    try {
      console.log('尝试解析IPv6地址...');
      const ipv6 = await dns.lookup('db.jtibmdmfvusjlhiuqyrn.supabase.co', { family: 6 });
      console.log('IPv6解析成功:', ipv6);
    } catch (error6) {
      console.error('IPv6解析也失败:', error6.code, error6.message);
    }
  }
}

testDNS();
