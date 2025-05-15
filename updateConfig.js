const fs = require("fs");
const path = require("path");
const runtimeConfigPath = path.join(__dirname, "public/manufacturing/runtimeConfig.js");

// Simulated environment variables (or use `process.env` if coming from Docker).
const config = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
  NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "my-realm",
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "my-client-id",
};

// Write the config into runtimeConfig.js
const runtimeConfigContent = `window.runtimeConfig = ${JSON.stringify(config, null, 2)};`;

fs.writeFileSync(runtimeConfigPath, runtimeConfigContent);
console.log(`Generated runtimeConfig.js at: ${runtimeConfigPath}`);
