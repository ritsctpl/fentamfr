"use client";

import "./globals.css";
import { ReactNode, useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import "@/utils/i18n";
import LoadingWrapper from "@components/LoadingWrapper";
import { ThemeProviderComponent } from "@components/ThemeContext";
import himalayaLogo from "../../public/ico/himalaya.ico";
import ritsLogo from "../../public/ico/rits.ico";
import exideLogo from "../../public/ico/exide.ico";
import tempicon from "./favicon.ico";
import { parseCookies } from "nookies";
import { fetchSiteAll } from "@services/siteServices";

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const loadConfig = async () => {
      // console.log("before Loading layout tsx window runtime config:", window.runtimeConfig);
      if (!window.runtimeConfig) {
        const response = await fetch("/manufacturing/api/config");
        const config = await response.json();
        window.runtimeConfig = config; // Set to window for global usage
        // console.log("Loaded runtime config:", config);
      }
    };

    const setFavicon = async () => {
      const favicon = document.querySelector(
        "link[rel='icon']"
      ) as HTMLLinkElement;
      const cookies = parseCookies();
      const currentSite = cookies.site;

      let iconPath = tempicon.src;

      if (currentSite) {
        try {
          const siteDetails = await fetchSiteAll(currentSite);
          if (siteDetails?.theme?.logo) {
            const imageMap = {
              "/images/rits-logo.png": ritsLogo.src,
              "/images/image1.png": himalayaLogo.src,
              "/images/EXIDE-logo.png": exideLogo.src,
            };
            iconPath =
              imageMap[siteDetails.theme.logo] || siteDetails.theme.logo;
          }
        } catch (error) {
          iconPath = tempicon.src
          console.error("Error fetching site details:", error);
        }
      }

      if (!favicon) {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = iconPath;
        document.head.appendChild(newFavicon);
      } else {
        favicon.href = iconPath;
      }
    };

    loadConfig();
    setFavicon();
  }, []);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProviderComponent>
            <LoadingWrapper>{children}</LoadingWrapper>
          </ThemeProviderComponent>
        </AuthProvider>
      </body>
    </html>
  );
}

/*
'use client';

import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>My Application</title>
      </head>
      <body>
        <header>
          <h1>My Application</h1>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
};

export default Layout;
*/
