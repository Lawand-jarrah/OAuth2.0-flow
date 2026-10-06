export function authenticationSessionRepository(pool) {
  return {
    async create({ session_id, user_sub, expires_at }) {
      await pool.query(
        `INSERT INTO authentication_sessions (session_id, user_sub, expires_at)
                VALUES ($1, $2, $3)`,
        [session_id, user_sub, new Date(expires_at)],
      );
    },

    async findById(session_id) {
      const { rows } = await pool.query(
        "SELECT * FROM authentication_sessions WHERE session_id = $1",
        [session_id],
      );
      return rows[0];
    },

    async deleteById(session_id) {
      await pool.query("DELETE FROM authentication_sessions WHERE session_id = $1", [
        session_id,
      ]);
    },
  };
}
