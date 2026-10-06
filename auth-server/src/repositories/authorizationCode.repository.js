export function authorizationCodeRepository(pool) {
  return {
    async create({
      code,
      client_id,
      redirect_uri,
      code_challenge,
      user_sub,
      user_name,
      user_email,
      scope,
      expires_at,
    }) {
      await pool.query(
        `INSERT INTO authorization_codes (code, client_id, redirect_uri, code_challenge, user_sub, user_name, user_email, scope, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          code,
          client_id,
          redirect_uri,
          code_challenge,
          user_sub,
          user_name,
          user_email,
          scope,
          new Date(expires_at),
        ],
      );
    },

    async findByCode(code) {
      const { rows } = await pool.query(
        "SELECT * FROM authorization_codes WHERE code = $1",
        [code],
      );
      return rows[0];
    },

    async deleteByCode(code) {
      await pool.query("DELETE FROM authorization_codes WHERE code = $1", [code]);
    },
  };
}
