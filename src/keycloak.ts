import Keycloak, { KeycloakConfig, KeycloakInstance, KeycloakInitOptions } from "keycloak-js";

let keycloakInstance: KeycloakInstance | null = null;
let runtimeConfig: Record<string, string> | null = null;

// Fetch runtime configuration
const fetchRuntimeConfig = async (): Promise<Record<string, string>> => {
  if (!runtimeConfig) {
    try {
      const response = await fetch("/manufacturing/api/config");
      runtimeConfig = await response.json();
      // console.log("Fetched runtime config:", runtimeConfig);

      // Set window.runtimeConfig if window is defined
      if (typeof window !== "undefined") {
        window.runtimeConfig = runtimeConfig;
        // console.log("Set window.runtimeConfig:", window.runtimeConfig);
      }
    } catch (error) {
      console.error("Failed to fetch runtime config:", error);
      throw new Error("Unable to load runtime configuration");
    }
  }
  return runtimeConfig;
};

export const getKeycloakInstance = async (): Promise<KeycloakInstance> => {
  if (!keycloakInstance) {
    const config = await fetchRuntimeConfig(); // Fetch the runtime config when initializing Keycloak

    const keycloakConfig: KeycloakConfig = {
      url: config.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080", // Fallback for dev
      realm: config.NEXT_PUBLIC_KEYCLOAK_REALM || "default-realm",
      clientId: config.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "default-client-id",
    };

    // console.log("Final Keycloak configuration used:", keycloakConfig); // Debug final Keycloak config

    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance!;
};

export const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: "login-required",
  checkLoginIframe: false,
  pkceMethod: "S256",
};

export default getKeycloakInstance;

/*
import Keycloak, { KeycloakConfig, KeycloakInstance, KeycloakInitOptions } from 'keycloak-js';
import runtimeConfig from "../config/config"; // Adjust path as needed

let keycloakInstance: KeycloakInstance | null = null;

// Load KeycloakConfig dynamically from `config.js` at runtime
const keycloakConfig: KeycloakConfig = {
  url: runtimeConfig.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: runtimeConfig.NEXT_PUBLIC_KEYCLOAK_REALM || 'default-realm',
  clientId: runtimeConfig.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'default-client-id',
};

const getKeycloakInstance = (): KeycloakInstance => {
  if (typeof window !== 'undefined' && !keycloakInstance) {
    // Initialize Keycloak instance
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance!;
};

export const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256', // Ensure PKCE is used with S256 method
};

export default getKeycloakInstance;
///second one 

import Keycloak, { KeycloakConfig, KeycloakInstance, KeycloakInitOptions } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
};

let keycloakInstance: KeycloakInstance | null = null;

const getKeycloakInstance = (): KeycloakInstance => {
  if (typeof window !== 'undefined' && !keycloakInstance) {
    //console.log("Initializing Keycloak instance");
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance!;
};

export const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256', // Ensure PKCE is used with S256 method
};

export default getKeycloakInstance;

*/

/*import Keycloak, { KeycloakConfig, KeycloakInstance, KeycloakInitOptions } from 'keycloak-js';

const keycloakConfig: KeycloakConfig & { checkLoginIframe?: boolean; pkceMethod?: 'S256' } = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  pkceMethod: 'S256',
};

let keycloakInstance: KeycloakInstance | null = null;

const getKeycloakInstance = (): KeycloakInstance => {
  if (typeof window !== 'undefined' && !keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance!;
};

const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: 'login-required' as KeycloakInitOptions['onLoad'],
  checkLoginIframe: false,
};

const keycloak = getKeycloakInstance();

keycloak.init(keycloakInitOptions).then(authenticated => {
  if (authenticated) {
    console.log("User is authenticated");
  } else {
    console.log("User is not authenticated");
  }
}).catch(error => {
  console.error("Failed to initialize Keycloak", error);
});

export default getKeycloakInstance;

import Keycloak, { KeycloakConfig, KeycloakInitOptions, KeycloakInstance } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
};

let keycloakInstance: KeycloakInstance | undefined;

const getKeycloakInstance = (): KeycloakInstance => {
  if (typeof window !== 'undefined' && !keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }''
  return keycloakInstance!;
};

export default getKeycloakInstance;

*/