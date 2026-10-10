import { config } from "./src/config/config.js";
import { createApp } from "./src/app.js";

const app = createApp({ issuer: config.issuer, audience: config.audience });

app.listen(config.port, () => {
  console.log(`Resource Server running on http://localhost:${config.port}`);
});
