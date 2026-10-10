export const config = {
    port: Number(process.env.RESOURCE_SERVER_PORT || 5050),
    issuer: process.env.ISSUER || 'http://localhost:3000',
    audience: 'demo-client-id',
}