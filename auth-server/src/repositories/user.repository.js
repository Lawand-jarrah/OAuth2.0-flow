export function createUserRepository(pool) {
  return {
    async findByEmail(email) {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );
      return rows[0];
    },

    async findBySub(sub) {
      const { rows } = await pool.query("SELECT * FROM users WHERE sub = $1", [
        sub,
      ]);
      return rows[0];
    },

    async createUser(sub, name, email, password_hash, password_salt) {
      await pool.query(
        `INSERT INTO users (sub, name, email, password_hash, password_salt)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (sub) DO UPDATE SET
                    sub = EXCLUDED.sub,
                    name = EXCLUDED.name,
                    password_hash = EXCLUDED.password_hash,
                    password_salt = EXCLUDED.password_salt`,
        [sub, name, email, password_hash, password_salt],
      );
    }
  };
}
