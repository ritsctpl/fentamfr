/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Box,
  Autocomplete,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fetchSiteAll, siteServices } from "@services/siteServices"; // Import siteServices
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import FactoryIcon from "@mui/icons-material/Factory"; // Plant icon
import styles from "./CommonAppBar.module.css";
import logo from "../images/rits-logo-removebg-preview.png"; // Import the image
import { destroyCookie, parseCookies, setCookie } from "nookies";
import api from "@services/api";
import { useTranslation } from "react-i18next";
import { message, Modal, Select } from "antd";
import { DecodedToken } from "@modules/changeEquipmentStatus/types/changeEquipmentType";
import { decryptToken } from "@utils/encryption";
import jwtDecode from "jwt-decode";
import { updateUserSite } from "@services/userService";
import { HomeOutlined, LogoutOutlined } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ritsLogo from "../images1/rits-logo.png";
import himalayaLogo from "../images/image1.png"; // Add this import
import exideLogo from "../images/EXIDE-logo.png"; // Add this import
import LoadingWrapper from "./LoadingWrapper";
import { MdFactory } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useTheme as useAppTheme } from "./ThemeContext"; // Rename to avoid conflict with MUI useTheme
import { CiLogin } from "react-icons/ci";
const { Option } = Select;
interface CommonAppBarProps {
  allActivities?: { description: string; url: string }[];
  username?: string | null;
  site?: string | null;
  appTitle: string;
  color?: string;
  onSiteChange?: (newSite: string) => void; // Add this prop
  onSearchChange?: (searchTerm: string) => void;
  logoHeader?: string;
}
 
const CommonAppBar: React.FC<CommonAppBarProps> = ({
  color,
  appTitle,
  onSiteChange,
  onSearchChange,
  logoHeader,
}) => {
  const { isAuthenticated, token, logout } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userActivityGroups, setUserActivityGroups] = useState<any[]>([]);
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<any>(null);
  const [siteDetails, setSiteDetails] = useState<any>();
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const theme = useTheme();
 
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { i18n, t } = useTranslation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientSide, setIsClientSide] = useState(false);
  const { updateThemeFromSite } = useAppTheme();
 
  useEffect(() => {
    setIsClientSide(true);
  }, []);
 
  useEffect(() => {
    // This will handle showing content only after initial data is loaded
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading]);
 
  useEffect(() => {
    const cleanedUrl = window.location.pathname
      ?.replace(/.*\/rits/, "/rits")
      .replace(/\/index\.html$/, "");
    const filteredDescriptions = allActivities
      ?.filter((activity) => activity.url.startsWith(cleanedUrl))
      ?.map((activity) => activity.description);
    // console.log(cleanedUrl,"filteredDescriptions");
    if (filteredDescriptions?.length > 0 && cleanedUrl !== "/rits/pod_app") {
      document.title = filteredDescriptions[0];
    } else if (cleanedUrl === "/manufacturing") {
      document.title = "Welcome";
    } else if (cleanedUrl !== "/rits/pod_app") {
      document.title = "App";
    }
  }, [allActivities]);
 
  const modalShownRef = useRef(false);

 
  useEffect(() => {
    const currentPath = window.location.pathname.split("/").pop() || "";
 
    if (!allActivities?.length) {
      return;
    }
 
    const newActivitiesUrl = allActivities.map((activity) => {
      const cleanedUrl = activity.url
        .replace(/\/rits/, "")
        .replace(/\/index\.html$/, "");
      return cleanedUrl;
    });
 
    const isValidPath = newActivitiesUrl.some((activity) => {
      const urlParts = activity.replace(/^\/|\/$/g, "").split(/[\/\?]/);
      // console.log(urlParts,currentPath,"urlParts");
 
      return urlParts.some(
        (part) => part && part !== "index.html" && part === currentPath
      );
    });
    // console.log(isValidPath,currentPath,"isValidPath");
 
    if (
      !isValidPath &&
      currentPath !== "manufacturing" &&
      !modalShownRef.current
    ) {
      modalShownRef.current = true;
      Modal.warning({
        title: "Access Denied",
        content:
          "You do not have access to this page. Redirecting to home page...",
        icon: <HomeOutlined />,
        closable: false,
        maskClosable: false,
        keyboard: false,
        mask: true,
        maskStyle: { backdropFilter: "blur(8px)" },
        onOk: () => {
          router.push("/");
        },
      });
    }
  }, [allActivities, router]);
 
  const getImageSource = (imageIcon: string) => {
    const imageMap = {
      "/images/rits-logo.png": ritsLogo.src,
      "/images/image1.png": himalayaLogo.src,
      "/images/EXIDE-logo.png": exideLogo.src,
    };
 
    return imageMap[imageIcon] || imageIcon; // This already returns the image source
  };
 
  const changeLanguage = (value) => {
    try {
      i18n.changeLanguage(value);
      localStorage.setItem("language", value);
 
      // Clear any existing language cookie first
      destroyCookie(null, "language", { path: "/" });
 
      // Then, set the new language cookie
      setCookie(null, "language", value, {
        path: "/", // makes it available across all pages
        maxAge: 30 * 24 * 60 * 60, // optional: set expiry for 30 days
      });
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };
  useEffect(() => {
    if (isAuthenticated && token) {
      try {
        const decryptedToken = decryptToken(token);
        const decoded: DecodedToken = jwtDecode<DecodedToken>(decryptedToken);
        setUsername(decoded.preferred_username);
        setCookie(null, "rl_user_id", decoded.preferred_username, {
          path: "/", // makes it available across all pages
          maxAge: 30 * 24 * 60 * 60, // optional: set expiry for 30 days
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [isAuthenticated, token]);
 
  useEffect(() => {
    const fetchSites = async () => {
      try {
        let response = await siteServices(username);
        // debugger
        if (Array.isArray(response)) {
          // response = response.map(site => site == 'RITS' ? '*' : site);
         
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching sites:", error);
      }
    };
 
    // fetchSites();
  }, [username]);
 
  useEffect(() => {
    message.destroy();
    const fetchUserDetails = async () => {
      if (isAuthenticated && username) {
        try {
          setIsLoading(true);
          const response = await api.post(
            "/user-service/retrieve_detailed_user",
            { user: username }
          );
          const groups = response.data.userActivityGroupDetails;
          // console.log("Retrieve detailed user response: ", response.data);
          // debugger
          setUserActivityGroups(groups);
 
          // Fetch site details first
          const responseSite = await fetchSiteAll(response.data.currentSite);
          setSiteDetails(responseSite);
          console.log(response.data.site, "responseSite");
          // localStorage.setItem("theme", JSON.stringify(responseSite.theme));
          // console.log(JSON.parse(localStorage.getItem("theme"))["color"]);
          // Then update other state and cookies
          setCookie(null, "site", response.data.currentSite, { path: "/" });
          setSite(response.data.currentSite);
          setFilteredActivities(groups);
          setCookie(
            null,
            "activities",
            JSON.stringify(response.data.userActivityGroupDetails),
            { path: "/" }
          );
 
          const activities = groups?.flatMap(
            (group: any) => group.activityList
          );
          // console.log(activities, 'activities');
          // Check if any activity URL matches the current browser URL path
 
          setAllActivities(activities);
          setAvailableSites(response.data.site);
        } catch (error) {
          console.error("Error fetching retrieve detailed user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
 
    fetchUserDetails();
  }, [isAuthenticated, username]);
 
  useEffect(() => {}, []);
 
  const handleLogoClick = () => {
    router.push("/");
  };
 
  const handleSearchChange = (
    event: React.ChangeEvent<{}>,
    newValue: string | null
  ) => {
    const value = newValue || "";
    setSearchTerm(value);
    onSearchChange(value);
  };
 
  const handleActivitySelect = (event: any, newValue: string | null) => {
    const selectedActivity = allActivities.find(
      (activity) => activity.description === newValue
    );

    if (selectedActivity) {
      const cleanedUrl = `/manufacturing${selectedActivity.url.replace(
        /\/index\.html$/,
        ""
      )}`;
      let activityId = selectedActivity.activityId;
      const url = `${window.location.origin}${cleanedUrl}`;
 
      if (event.ctrlKey) {
        const newTab = window.open(url, "_blank");
        if (newTab) newTab.focus();
        sessionStorage.setItem("activityId", activityId);
      } else {
        window.location.href = url;
      }
    }
   
    // Clear the search term after selection
    setSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };
 
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // debugger
    setAnchorEl(event.currentTarget);
  };
 
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
 
  const handleSiteChange = async (newSite: string) => {
    try {
      message.destroy();
      setIsLoading(true);
 
      const cookies = parseCookies();
      const userId = cookies.rl_user_id;
      const site = cookies.site;
      const payload = {
        defaultSite: newSite,
        site: site,
        user: userId,
      };
 
      const res = await updateUserSite(payload);
      if (res.errorCode) {
        message.destroy();
        message.error(res.message || "Failed to update site");
        return;
      }
 
      // Fetch new site details immediately
      const newSiteDetails = await fetchSiteAll(newSite);
      setSiteDetails(newSiteDetails);
      setSite(newSite);
 
      // Update theme and store in cookie
      await updateThemeFromSite(newSiteDetails);
 
      // Set the site cookie
      setCookie(null, "site", newSite, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
 
      if (onSiteChange) {
        onSiteChange(newSite);
        window.location.reload();
      }
 
      // Show success message based on available response structure
      if (res.message_details?.msg) {
        message.success(res.message_details.msg);
      } else if (res.message) {
        message.success(res.message);
      } else {
        message.success("Site updated successfully");
      }
 
      // Optionally refresh user details to ensure everything is in sync
      const response = await api.post("/user-service/retrieve_detailed_user", {
        user: username,
      });
 
      if (response.data) {
        const groups = response.data.userActivityGroupDetails;
        setUserActivityGroups(groups);
        setFilteredActivities(groups);
        setCookie(null, "activities", JSON.stringify(groups), { path: "/" });
 
        const activities = groups?.flatMap((group: any) => group.activityList);
        setAllActivities(activities);
        setAvailableSites(response.data.site);
      }
    } catch (e) {
      console.error("Error updating site:", e);
      message.error("Failed to update site");
    } finally {
      setIsLoading(false);
      setAnchorEl(null);
    }
  };
 
 

  useEffect(() => {
    message.destroy();
    const fetchUserDetails = async () => {
      if (isAuthenticated && username) {
        try {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 10000));
          const response = await api.post(
            "/user-service/retrieve_detailed_user",
            { user: username }
          );
          const groups = response.data.userActivityGroupDetails;
          // console.log("Retrieve detailed user response: ", response.data);
          // debugger
          setUserActivityGroups(groups);
 
          // Fetch site details first
          const responseSite = await fetchSiteAll(response.data.currentSite);
          setSiteDetails(responseSite);
          // console.log(responseSite.theme, "responseSite");
          // localStorage.setItem("theme", JSON.stringify(responseSite.theme));
          // console.log(JSON.parse(localStorage.getItem("theme"))["color"]);
          // Then update other state and cookies
          setCookie(null, "site", response.data.currentSite, { path: "/" });
          setSite(response.data.currentSite);
          setFilteredActivities(groups);
          setCookie(
            null,
            "activities",
            JSON.stringify(response.data.userActivityGroupDetails),
            { path: "/" }
          );
 
          const activities = groups?.flatMap(
            (group: any) => group.activityList
          );
          // console.log(activities, 'activities');
          // Check if any activity URL matches the current browser URL path
 
          setAllActivities(activities);
          setAvailableSites(response.data.site);
        } catch (error) {
          console.error("Error fetching retrieve detailed user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
 
    fetchUserDetails();
  }, [isAuthenticated, username]);

  const cookies = parseCookies();
  const language = cookies.language || "en";
  const uniqueActivities = Array.from(
    new Set(allActivities?.map((activity) => activity.description))
  ); // Remove duplicates
  const currentLanguage = cookies.language || "en";
  const values =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("batchTop50Data") || "{}")
      : {};
 
  return (
    <LoadingWrapper isLoading={isInitialLoad || (isClientSide && isLoading)}>
      {!isInitialLoad && (
        <AppBar
          position="static"
          style={{
            boxShadow: "none",
            backgroundColor: siteDetails?.theme?.background,
            color: siteDetails?.theme?.color,
            borderBottom:"1px solid var(--line-color)",
            width: "100%",
          }}
          className={styles.appBar}
        >
          <Toolbar
            className={styles.toolbar}
            sx={{ flexDirection: isSmallScreen ? "column" : "row" }}
          >
            <img
              src={
                siteDetails?.theme?.logo
                  ? getImageSource(siteDetails?.theme?.logo)
                  : logo.src
              }
              alt="company Logo"
              className={styles.logo}
              onClick={handleLogoClick}
            />
            <Typography
              variant="h6"
              className={styles.title}
              style={{
                color: siteDetails?.theme?.color,
                fontFamily:
                  siteDetails?.theme?.background === "#ffffff"
                    ? "roboto"
                    : "inherit",
              }}
            >
              {appTitle}
            </Typography>
 
            <Box className={styles.searchBox}>
              <Autocomplete
                freeSolo
                options={uniqueActivities}
                inputValue={searchTerm}
                value={null}
                onInputChange={handleSearchChange}
                onChange={(event, newValue) => {
                  handleActivitySelect(event, newValue);
                  setSearchTerm("");
                  if (onSearchChange) {
                    onSearchChange("");
                  }
                }}
                filterOptions={(options, state) =>
                  options.filter(
                    (option) =>
                      state.inputValue &&
                      option
                        .toLowerCase()
                        .includes(state.inputValue.toLowerCase())
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder={t("searchActivities")}
                    style={{ borderRadius: "5px", width: "300px" }}
                    className={styles.searchField}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <CiSearch />,
                      classes: {
                        root: styles.searchFieldRoot,
                        notchedOutline: styles.noBorder,
                      },
                    }}
                  />
                )}
              />
            </Box>
 
            <Box className={styles.userInfo}>
              <Typography
                variant="body1"
                className={styles.userText}
                style={{
                  color: siteDetails?.theme?.color,
                }}
              >
                {username} | {site}
              </Typography>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                className={styles.iconButton}
              >
                <MdFactory style={{ color: siteDetails?.theme?.color }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  style: {
                    maxHeight: 200,
                    width: "20ch",
                  },
                }}
              >
                {availableSites?.map((siteOption, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleSiteChange(siteOption)}
                  >
                    {siteOption}
                  </MenuItem>
                ))}
              </Menu>
              <div>
                <Select
                  defaultValue={currentLanguage}
                  style={{ width: 90 }}
                  onChange={changeLanguage}
                >
                  <Option value="en">English</Option>
                  <Option value="ka">ಕನ್ನಡ</Option>
                  <Option value="ta">தமிழ்</Option>
                  <Option value="hi">हिंदी</Option>
                </Select>
              </div>
              <Button
                color="inherit"
                onClick={() => logout()}
                className={styles.logoutButton}
                style={{
                  color: siteDetails?.theme?.color,
                }}
              >
                {isSmallScreen ? (
                  <CiLogin
                    size={25}
                    style={{
                      color:
                        siteDetails?.theme?.background === "#ffffff"
                          ? "#0c4da2"
                          : siteDetails?.theme?.color,
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  />
                ) : (
                  <>{t("logout")}</>
                )}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      )}
    </LoadingWrapper>
  );
};
 
export default CommonAppBar;