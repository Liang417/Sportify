import { Pool, types } from 'pg';

types.setTypeParser(20, (val) => parseInt(val, 10));

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB_NAME,
  user: process.env.POSTGRES_USER_NAME,
  password: process.env.POSTGRES_PASSWORD,
});

export default pool;
