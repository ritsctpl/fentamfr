declare global {
    interface Window {
      runtimeConfig: {
        NEXT_PUBLIC_HOST?: string;
        NEXT_PUBLIC_KEYCLOAK_PORT?: string;
        NEXT_PUBLIC_REDIRECT_PORT?: string;
        NEXT_PUBLIC_API_PORT?: string;
        NEXT_PUBLIC_KEYCLOAK_REALM?: string;
        NEXT_PUBLIC_KEYCLOAK_CLIENT_ID?: string;
        NEXT_PUBLIC_KEYCLOAK_URL?: string;
        NEXT_PUBLIC_REDIRECT_URI?: string;
        NEXT_PUBLIC_API_BASE_URL?: string;
        NEXT_PUBLIC_ENCRYPTION_KEY?: string;
      };
    }
  }
  export {};
  