import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { parseCookies, setCookie } from "nookies";

// Define the theme type
type ThemeType = {
  buttonColor: string;
  iconColor: string;
  tabColor: string;
  tabTextColor: string;
  textColor: string;
  backgroundColor: string;
  lineColor: string;
};

// Define default theme values
const DEFAULT_THEME: ThemeType = {
  buttonColor: "#124561",
  iconColor: "#124561",
  tabColor: "#124561",
  tabTextColor: "#666666",
  textColor: "#ffffff",
  backgroundColor: "#124561",
  lineColor: "#124561",
};

// Update the ThemeContextType to use ThemeType
interface ThemeContextType {
  themeData: ThemeType;
  setThemeData: React.Dispatch<React.SetStateAction<ThemeType>>;
  updateThemeFromSite: (newSiteDetails: any) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProviderComponent = ({ children }) => {
  const [themeData, setThemeData] = useState(DEFAULT_THEME);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Updates CSS custom properties in the document root based on current theme
   * @param theme - Current theme object containing color values
   */
  const updateCSSVariables = (theme) => {
    const cssVars = {
      "--icon-color": theme.iconColor,
      "--tab-active-color": theme.tabColor,
      "--tab-text-color": theme.tabTextColor,
      "--button-color": theme.buttonColor,
      "--text-color": theme.textColor,
      "--background-color": theme.backgroundColor,
      "--line-color": theme.lineColor,
    };

    Object.entries(cssVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  };

  /**
   * Updates theme based on site details and saves to cookies
   * Falls back to default theme if no valid theme data is provided
   * @param newSiteDetails - Site configuration containing theme information
   */
  const updateThemeFromSite = async (newSiteDetails: any) => {
    try {
      const theme = newSiteDetails?.theme?.background || "";
      const color = newSiteDetails?.theme?.color || "";
      const lineColor = newSiteDetails?.theme?.lineColor || "";

      if (!theme) {
        setThemeData(DEFAULT_THEME);
        setCookie(null, "themeData", JSON.stringify(DEFAULT_THEME), {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
        return;
      }

      const defaultColor = "#124561";
      const newTheme = {
        buttonColor:
          theme === "#ffffff" ? color || defaultColor : theme || defaultColor,
        iconColor:
          theme === "#ffffff" ? color || defaultColor : theme || defaultColor,
        tabColor:
          theme === "#ffffff" ? color || defaultColor : theme || defaultColor,
        tabTextColor: "#666666",
        textColor: color || "#ffffff",
        backgroundColor: theme || defaultColor,
        lineColor: lineColor || "#ffffff",
      };

      setThemeData(newTheme);
      setCookie(null, "themeData", JSON.stringify(newTheme), {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      setThemeData(DEFAULT_THEME);
      setCookie(null, "themeData", JSON.stringify(DEFAULT_THEME), {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
  };

  // Modified initialization useEffect
  useEffect(() => {
    async function initializeTheme() {
      try {
        const cookies = parseCookies();
        const savedTheme = cookies.themeData
          ? JSON.parse(cookies.themeData)
          : null;

        if (savedTheme) {
          setThemeData(savedTheme);
          updateCSSVariables(savedTheme);
        } else {
          const site = cookies.site;
          if (site) {
            // If site exists in cookies but no theme, fetch site details
            const siteResponse = await fetch(`/api/site/${site}`); // Adjust this endpoint to match your API
            const siteDetails = await siteResponse.json();
            await updateThemeFromSite(siteDetails);
          }
        }
      } catch (error) {
        console.error("Error initializing theme:", error);
      } finally {
        setIsInitialized(true);
      }
    }
    initializeTheme();
  }, []);

  // Ensure CSS variables are updated whenever themeData changes
  useEffect(() => {
    if (isInitialized) {
      updateCSSVariables(themeData);
    }
  }, [themeData, isInitialized]);

  // Ant Design theme configuration
  const antdThemeConfig = {
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: themeData.buttonColor || "#124561", // Ensure fallback
    },
  };

  return (
    <ThemeContext.Provider
      value={{ themeData, setThemeData, updateThemeFromSite }}
    >
      <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme context
 * @throws Error if used outside ThemeProvider
 * @returns ThemeContextType
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
