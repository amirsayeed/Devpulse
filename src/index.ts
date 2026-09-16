import dotenv from 'dotenv';
import pool, { initDB } from './config/database.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer= async () => {
  try {
    await initDB();
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    
    app.listen(PORT, () => {
      console.log("Dev pulse server is running!");
    })
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();