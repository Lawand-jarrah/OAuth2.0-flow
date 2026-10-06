export function refreshTokenRepository(pool) {
  return {
    async createa({
      token,
      user_sub,
      client_id,
      scope,
      expires_at,
    }) {
      await pool.query(
        `INSERT INTO refresh_tokens (token, user_sub, client_id, scope, expires_at)
            VALUES ($1, $2, $3, $4, $5)`,
        [token, user_sub, client_id, scope, new Date(expires_at)],
      );
    },

    async findByToken(token) {
      const { rows } = await pool.query(
        "SELECT * FROM refresh_tokens WHERE token = $1",
        [token],
      );
      return rows[0];
    },

    async deleteByToken(token) {
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    },
  };
}
