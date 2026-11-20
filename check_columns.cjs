const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.vvnihmweqmbmytpggqcw',
    password: '0KEvANMln5KbdRQ5',
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_consciousness_profile'
      ORDER BY ordinal_position
    `);
    console.log('user_consciousness_profile columns:');
    res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

main();
