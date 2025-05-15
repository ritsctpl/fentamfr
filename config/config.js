const runtimeConfig = {
    NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST || "localhost",
    NEXT_PUBLIC_KEYCLOAK_PORT: process.env.NEXT_PUBLIC_KEYCLOAK_PORT || "8080",
    NEXT_PUBLIC_REDIRECT_PORT: process.env.NEXT_PUBLIC_REDIRECT_PORT || "8686",
    NEXT_PUBLIC_API_PORT: process.env.NEXT_PUBLIC_API_PORT || "8181",
    NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "spring-boot-microservices-realm",
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "rmfg-init-client",
    NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
    NEXT_PUBLIC_REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:8686/callback",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
    NEXT_PUBLIC_ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "fcde2b2e9076d5276fb63525ec1ae7ad5276fb63525ec1ae7ad5276fb63525ec",
  };
  
  export default runtimeConfig;
  