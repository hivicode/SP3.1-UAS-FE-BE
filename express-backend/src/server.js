const app = require("./app");
const { port } = require("./config");
const { runMigrations } = require("./db/migrate");

async function start() {
  await runMigrations();
  app.listen(port, () => {
    console.log(`Express backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
