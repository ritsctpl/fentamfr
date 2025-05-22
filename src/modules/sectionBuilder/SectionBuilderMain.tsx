/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { t } from "i18next";
import { parseCookies } from "nookies";
import jwtDecode from "jwt-decode";
import { debounce } from "lodash";

// Ant Design Imports
import { Button, Input, message, Typography } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

// Material UI Imports
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// Context and Authentication
import { useAuth } from "@context/AuthContext";
import { SectionBuilderProvider } from "./hooks/sectionBuilderContex";

// Utility Imports
import { decryptToken } from "@utils/encryption";

// Component Imports
import CommonAppBar from "@components/CommonAppBar";
import CommonTable from "@components/CommonTable";
import SectionBuilderSidePanel from "./components/SectionBuilderSidePanel";

// Style Imports
import styles from "./styles/SidePannel.module.css";

// Type Imports
import {
  defaulSectionBuilderform,
  SectionBuilderDataItem,
  SectionBuilderDatatable,
} from "./types/SectionBuilderTypes";
import {
  fetchSectionBuilderData,
  SectionBuilderResponse,
} from "@services/sectionBuilderService";

// Type Definitions
interface DecodedToken {
  preferred_username: string;
}

type DataRow = {
  [key: string]: string | number | boolean;
  sectionLabel: string;
  // description: string;
  effectiveDateTime: string;
};

function SectionBuilderMain() {
  // Cookies and Authentication
  const cookies = parseCookies();
  const { isAuthenticated, token } = useAuth();

  // Utility Functions
  const transformToDataRows = useCallback(
    (data: SectionBuilderResponse | SectionBuilderDatatable): DataRow[] => {
      // If data is a SectionBuilderResponse with a sectionBuilder property
      if (data && "sectionBuilder" in data) {
        const sectionBuilderData = data.sectionBuilder
          ? [data.sectionBuilder]
          : [];
        return sectionBuilderData.map((item) => ({
          sectionLabel: item.sectionLabel,
          effectiveDateTime: item.effectiveDateTime,
        }));
      }

      // If data is already an array of DataRow-like objects
      return (data as SectionBuilderDatatable).map(
        (item: { sectionLabel: string; effectiveDateTime: string }) => ({
          sectionLabel: item.sectionLabel,
          effectiveDateTime: item.effectiveDateTime,
        })
      );
    },
    []
  );

  // State Declarations
  const [formData, setFormData] = useState<SectionBuilderDataItem>(
    defaulSectionBuilderform
  );
  const [sectionBuilderData, setSectionBuilderData] = useState<
    SectionBuilderDataItem[]
  >([]);
  const [selected, setSelected] = useState<SectionBuilderDataItem>(
    defaulSectionBuilderform
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSections, setFilteredSections] = useState(
    transformToDataRows(sectionBuilderData)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [drag, setDrag] = useState(false);
  const [call, setCall] = useState(0);
  const [formChange, setFormChange] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(cookies.site);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  // Effects
  useEffect(() => {
    // Create an async function inside the effect
    const fetchSectionBuilder = async () => {
      // Prevent multiple simultaneous calls
      if (isFetchingRef.current || !isAuthenticated || !token) return;

      try {
        // Set flag to prevent concurrent fetches
        isFetchingRef.current = true;
        setIsLoading(true);

        // Decode token
        const decryptedToken = decryptToken(token);
        const decoded: DecodedToken = jwtDecode(decryptedToken);
        setUsername(decoded.preferred_username);

        // Fetch section builder data
        const sectionBuilderData = await fetchSectionBuilderData(
          { site: site },
          "sectionbuilder-service",
          "getTop50"
        );

        // Use the new transformation and type assertion
        setSectionBuilderData(
          Array.isArray(sectionBuilderData)
            ? sectionBuilderData
            : sectionBuilderData.sectionBuilder
            ? [sectionBuilderData.sectionBuilder]
            : []
        );
      } catch (error) {
        console.error("Error fetching section builder data:", error);
      } finally {
        // Reset flag and loading state
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchSectionBuilder();
  }, [isAuthenticated, site, token, transformToDataRows]);

  useEffect(() => {
    const transformedData = transformToDataRows(sectionBuilderData);
    setFilteredSections(
      transformedData.filter((section) =>
        section.sectionLabel.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, sectionBuilderData]);

  // Fetch Section Builder Data Function
  const handleFetchSectionBuilderData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) return;

    try {
      // Set flag to prevent concurrent fetches
      isFetchingRef.current = true;
      setIsLoading(true);

      // Fetch section builder data
      const fetchedSectionBuilderData = await fetchSectionBuilderData(
        { site: site },
        "sectionbuilder-service",
        "getTop50"
      );

      // Use the new transformation and type assertion
      setSectionBuilderData(
        Array.isArray(fetchedSectionBuilderData)
          ? fetchedSectionBuilderData
          : fetchedSectionBuilderData.sectionBuilder
          ? [fetchedSectionBuilderData.sectionBuilder]
          : []
      );

      // Reset search term
      setSearchTerm("");

      // Reset filtered sections
      setFilteredSections(transformToDataRows(fetchedSectionBuilderData));
    } catch (error) {
      console.error("Error fetching section builder data:", error);
      message.error("Failed to fetch section builder data");
    } finally {
      // Reset flag and loading state
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [site, transformToDataRows]);

  // Modify the Go button's onClick to use the new function
  const handleGoButtonClick = () => {
    handleFetchSectionBuilderData();
  };

  // Event Handlers
  const handleAddClick = () => {
    setFormData(defaulSectionBuilderform);
    setIsAdding(true);
    setFullScreen(false);
    setDrag(true);
    setSelected(defaulSectionBuilderform);
  };

  const handleRowSelect = async (row: DataRow) => {
    // Null and type checks
    if (!row || !row?.sectionLabel) {
      message.warning("Invalid section selection");
      return;
    }

    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      message.info("Another operation is in progress");
      return;
    }

    try {
      // Set fetching flag to prevent concurrent operations
      isFetchingRef.current = true;
      setIsLoading(true);

      // Validate site before making API call
      if (!site) {
        throw new Error("No site selected");
      }

      // Prepare API call parameters
      const apiParams = {
        site: site,
        sectionLabel: row?.sectionLabel,
      };

      // Fetch section details
      const sectionBuilderRetrive = await fetchSectionBuilderData(
        apiParams,
        "sectionbuilder-service",
        "getSectionById"
      );

      // Validate retrieved data
      if (!sectionBuilderRetrive) {
        throw new Error("No section data retrieved");
      }

      // Extract the section data, handling both response types
      const selectedSection =
        sectionBuilderRetrive.sectionBuilder ||
        (Array.isArray(sectionBuilderRetrive)
          ? sectionBuilderRetrive[0]
          : sectionBuilderRetrive);

      // Update component state
      setSelected(selectedSection);
      setIsAdding(true);
      setFullScreen(false);
      setDrag(true);

      // Optional: Log successful retrieval
      console.log("Section retrieved successfully:", selectedSection);
    } catch (error) {
      // Comprehensive error handling
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Section Builder Retrieve failed";

      message.error(errorMessage);

      // Log detailed error for debugging
      console.error("Section retrieval error:", error);

      // Reset states in case of error
      setSelected(defaulSectionBuilderform);
      setIsAdding(false);
    } finally {
      // Always reset fetching flag and loading state
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (formChange) {
      // TODO: Implement confirmation modal for unsaved changes
      setIsAdding(false);
      setFullScreen(false);
      setFormChange(false);
      setDrag(false);
    } else {
      setIsAdding(false);
      setFullScreen(false);
      setDrag(false);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setFilteredSections(transformToDataRows(sectionBuilderData));
  };

  const handleSiteChange = (newSite: string) => {
    if (newSite !== site) {
      setSite(newSite);
    }
  };
  // Add a new method to handle search with Enter key
  const handleSearchEnter = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Check if the pressed key is Enter
      if (e.key === "Enter" && searchTerm.trim() !== "") {
        // Prevent multiple simultaneous calls
        if (isFetchingRef.current) return;

        try {
          // Set flag to prevent concurrent fetches
          isFetchingRef.current = true;
          setIsLoading(true);

          // Prepare search payload
          const searchPayload = {
            site: site,
            sectionLabel: searchTerm.trim(),
          };

          // Fetch section builder data using search endpoint
          const searchResults = await fetchSectionBuilderData(
            searchPayload,
            "sectionbuilder-service",
            "getAllSection"
          );

          // Determine the sections to display
          const sectionsToDisplay = Array.isArray(searchResults)
            ? searchResults
            : searchResults.sectionBuilder
            ? [searchResults.sectionBuilder]
            : [];

          // Update state with search results
          setSectionBuilderData(sectionsToDisplay);

          // Update filtered sections
          setFilteredSections(transformToDataRows(sectionsToDisplay));

          // Show message if no results found
          if (sectionsToDisplay.length === 0 && searchTerm.trim() !== "") {
            message.info(`No sections found for "${searchTerm}"`);
          }
        } catch (error) {
          console.error("Error searching section builder data:", error);
          message.error("Failed to search section builder data");
        } finally {
          // Reset flag and loading state
          isFetchingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [site, searchTerm, transformToDataRows]
  );

  // Render
  return (
    <SectionBuilderProvider>
      <>
        <CommonAppBar
          onSearchChange={() => {}}
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("Section Builder")}
          onSiteChange={handleSiteChange}
        />
        <div
          style={{
            width: "100%",
            height: "calc(100vh - 100px)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div className={styles.mainContainer}>
            <div
              className={`${styles.mainContent} ${
                isAdding ? styles.mainContentShrink : ""
              }`}
            >
              {/* Search Row */}
              <div
                style={{
                  width: "100%",
                  height: "8%",
                  display: "flex",
                  padding: "20px",
                  boxSizing: "border-box",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                }}
              >
                <Input
                  placeholder="Search Section Builder..."
                  style={{ width: 250 }}
                  suffix={<SearchOutlined />}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                  onKeyDown={handleSearchEnter}
                />
                <Button type="primary" onClick={handleGoButtonClick}>
                  Go
                </Button>
              </div>

              {/* Groups Row */}
              <div
                style={{
                  width: "100%",
                  height: "8%",
                  display: "flex",
                  padding: "20px",
                  boxSizing: "border-box",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>
                  <strong>
                    Section Builder ({sectionBuilderData?.length})
                  </strong>
                </Typography.Text>
                <IconButton onClick={handleAddClick}>
                  <PlusOutlined style={{ fontSize: "20px", color: "#000" }} />
                </IconButton>
              </div>

              {/* Table */}
              <CommonTable
                data={transformToDataRows(sectionBuilderData)}
                onRowSelect={handleRowSelect}
              />
            </div>

            {/* Side Panel */}
            <div
              className={`${styles.formContainer} ${
                isAdding
                  ? `${styles.show} ${
                      fullScreen ? styles.showFullScreen : styles.show
                    }`
                  : ""
              }`}
            >
              <SectionBuilderSidePanel
                selected={selected}
                isAdding={isAdding}
                fullScreen={fullScreen}
                drag={drag}
                call={call}
                setCall={setCall}
                onClose={handleClose}
                setIsAdding={setIsAdding}
                setFullScreen={setFullScreen}
                onRefreshData={handleFetchSectionBuilderData}
                // setFormChange={setFormChange}
                username={username}
              />
            </div>
          </div>
        </div>
      </>
    </SectionBuilderProvider>
  );
}

export default SectionBuilderMain;
