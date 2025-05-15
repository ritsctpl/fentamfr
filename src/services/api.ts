import axios from "axios";
import { parseCookies } from "nookies";
import { decryptToken } from "../utils/encryption";

// Axios instance
const api = axios.create({
  baseURL: null,
});

// Helper function to fetch runtime configuration
const fetchRuntimeConfig = async (): Promise<Record<string, string>> => {
    try {
    // Attempt to fetch from the client-side runtimeConfig if available
    if (typeof window !== "undefined" && window.runtimeConfig) {
      // console.log("Using client-side runtimeConfig:", window.runtimeConfig);
      return window.runtimeConfig;
    }

    // Attempt to fetch from the API endpoint using relative URL (client-side)
    // console.log("Fetching runtimeConfig from API...");
    const response = await fetch("/manufacturing/api/config");
    // console.log("Fetching runtimeConfig from API...", response);
    if (response.ok) {
      const runtimeConfig = await response.json();
      // console.log("Fetched runtimeConfig from API:", runtimeConfig);

      // Set window.runtimeConfig for future use (client-side only)
      if (typeof window !== 'undefined') {
        window.runtimeConfig = runtimeConfig;
      }
      // console.log('window.runtimeConfihg', window.runtimeConfig);

      return runtimeConfig;
    } else {
      console.warn(`API responded with ${response.status}: ${response.statusText}`);
      throw new Error("Failed to fetch runtime config from API");
    }
  } catch (error) {
   // console.error("Error fetching runtime config (client-side):", error);

    try {
      // Fallback to server-side fetching using an absolute URL
      const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:8686";
      const apiUrl = `${baseUrl}/manufacturing/api/config`;
      // console.log("Server-side fetching runtimeConfig from:", apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch runtime config: ${response.statusText}`);
      }

      const runtimeConfig = await response.json();
      // console.log("Fetched runtimeConfig from server-side API:", runtimeConfig);

      return runtimeConfig;
    } catch (serverError) {
     // console.error("Error fetching runtime config (server-side):", serverError);

      // Final fallback to environment variables
      console.warn("Using fallback environment variables.");
      return {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
        NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST || "http://localhost:8686",
      };
    }
  }
};

// Initialize the API's baseURL dynamically
let apiInitialized = false;

export const initializeApi = async (): Promise<void> => {
  try {
    if (!apiInitialized) {
      let config;
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Runtime config fetch timeout')), 2000)
        );
        config = await Promise.race([fetchRuntimeConfig(), timeoutPromise]);
      } catch (error) {
        console.error('Failed to fetch runtime config within timeout:', error);
        throw error;
      }
      // console.log(api.defaults.baseURL,'API initialized with base URL:');
      
       api.defaults.baseURL = config.NEXT_PUBLIC_API_BASE_URL; 
      // console.log("API initialized with base URL:", api.defaults.baseURL,config);
      apiInitialized = true;
    }
  } catch (error) {
    console.error("Failed to initialize API:", error);
    throw error; // Rethrow to notify calling code of the failure
  }
};

// Lazy initialization fallback if `initializeApi` is not called explicitly
(async () => {
  if (!apiInitialized) {
    try {
      await initializeApi();
    } catch (error) {
      console.warn(
        "API initialization failed during import. Ensure initializeApi() is called explicitly before usage."
      );
    }
  }
})();

// Add interceptors to handle authentication tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const cookies = parseCookies();
      const encryptedToken = cookies.token;
      // Retry loop for baseURL configuration
      // let retryCount = 0;
      // const maxRetries = 3;
      // console.log(api.defaults.baseURL.includes('8686'),"Second A");
      // const WrongBaseUrl=api.defaults.baseURL.includes('8686');
      // while ((!api.defaults.baseURL && retryCount < maxRetries) || (WrongBaseUrl)) {
      //   console.warn(`API initialization attempt ${retryCount + 1} failed: ${api.defaults.baseURL}`);
      //   try {
      //     await initializeApi();
      //     if (api.defaults.baseURL) break;
      //     retryCount++;
      //     await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
      //   } catch (initError) {
      //     console.warn(`API initialization attempt ${retryCount + 1} failed:`, initError);
      //   }
      // }
// console.log(api.defaults.baseURL,"api.defaults.baseURL");

      if (!api.defaults.baseURL || api.defaults.baseURL.includes('8686')) {
        const response = await fetch("/manufacturing/api/config");
        // console.log("Fetching runtimeConfig from API...", response);
        const runtimeConfig = await response.json();
        config.baseURL = runtimeConfig.NEXT_PUBLIC_API_BASE_URL;
      //  console.log(config ,"window",window.runtimeConfig,"Response", runtimeConfig,"BaseUrl Loading if Null 8686...");
      }
    
      // Add authorization token if available
      if (encryptedToken) {
        const token = decryptToken(encryptedToken);
        config.headers.Authorization = `Bearer ${token}`;
      //  console.log(config ,"window",window.runtimeConfig,"Response","BaseUrl Loading if Null...");

      }
      // console.log("API request interceptor:", config);
      
      return config;
    } catch (error) {
      console.warn("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;