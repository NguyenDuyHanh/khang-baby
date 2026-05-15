import "dotenv/config";

import app from "./src/app.js";
import { ensureDbReady } from "./src/startup/ensureDbReady.js";

const port = Number(process.env.PORT || 4000);

await ensureDbReady();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
});
