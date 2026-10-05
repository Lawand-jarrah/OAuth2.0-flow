export function createClientRepository(pool) {
  return {
    async createClient({ client_id, redirect_uri }) {
      await pool.query(
        `INSERT INTO clients (client_id, redirect_uri)
                VALUES ($1, $2)
                ON CONFLICT (client_id) DO NOTHING`,
        [client_id, redirect_uri],
      );
    },

    async findById(client_id) {
      const { rows } = await pool.query(
        "SELECT * FROM clients WHERE client_id = $1",
        [client_id],
      );
      return rows[0];
    }
  };
}
