import pool from './databasePool';

export async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
  return rows[0];
}

export async function create(name, email, hashedPassword, avatar) {
  const { rows } = await pool.query(
    'INSERT INTO "user"(name, email, password, avatar) VALUES($1,$2,$3,$4) RETURNING id,name,email,avatar',
    [name, email, hashedPassword, avatar],
  );
  return rows[0];
}

export async function getAllUsers() {
  const { rows } = await pool.query('SELECT id, name, email, avatar FROM "user"');
  return rows;
}
