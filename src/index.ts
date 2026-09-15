import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

testConnection();