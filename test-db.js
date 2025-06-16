const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'backstage',
  password: 'backstage',
  database: 'backstage',
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');
    const result = await client.query('SELECT 1 as test');
    console.log('Query result:', result.rows);
    await client.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
