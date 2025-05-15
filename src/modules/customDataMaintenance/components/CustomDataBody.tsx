/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useContext } from "react";
import styles from "../styles/customData.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { parseCookies } from "nookies";
import { Form, message, Modal, Tooltip } from "antd";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, Tabs, Tab, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CustomDataContext } from "../hooks/CustomDataContext";
import CustomDataTable from "./CustomDataTable";
import { defaultCustomDataRequest } from "../types/customdatatypes";
import { CustomDataUpdate } from "@services/customDataService";
import { decryptToken } from "@utils/encryption";
import { useAuth } from "@context/AuthContext";
import jwtDecode from "jwt-decode";

interface CustomDataBodyProps {
  isAdding: boolean;
  selected: any;
  drag: boolean;
  fullScreen: boolean;
  resetValue: boolean;
  call: number;
  onClose: () => void;
  setCall: (val: number) => void;
  setIsAdding: (val: boolean) => void;
  setFullScreen: (val: boolean) => void;
  selectRowData: any;
}

interface DecodedToken {
  preferred_username: string;
}

const CustomDataBody: React.FC<CustomDataBodyProps> = ({
  selected,
  fullScreen,
  setIsAdding,
  call,
  setCall,
  isAdding,
  onClose,
  // resetValue,
  setFullScreen,
  selectRowData,
}) => {
  const { formData, setFormData, setFormChange } =
    useContext<any>(CustomDataContext);
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const [form] = Form.useForm();
  // const [userGroupUsers, setUserGroupUsers] = useState<any>([]);
  // const [activityGroup, setActivityGroup] = useState<any>([]);
  // const [customTableData, setCustomTableData] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  // const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  // const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
  const [oper, setOper] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  console.log(selectRowData);
  useEffect(() => {
    const fetchItemGroupData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
          console.log("user name: ", username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    fetchItemGroupData();
  }, [isAuthenticated, username, call]);

  useEffect(() => {
    if (formData) {
      form.setFieldsValue(formData);
    }
  }, [form, formData]);

  // useEffect(() => {
  //   if (resetValue) {
  //     setUserGroupUsers([]);
  //     setActivityGroup([]);
  //     setCustomTableData([]);
  //   }
  // }, [resetValue]);

  const handleOpenChange = () => {
    setFullScreen(true);
  };

  const handleCloseChange = () => {
    setFullScreen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClose = () => {
    // Check if there's any data inserted
    const hasInsertedData = Object.values(formData).some(
      (value) => value !== null && value !== undefined && value !== ""
    );

    if (hasInsertedData) {
      Modal.confirm({
        title: t("confirm"),
        content: t("closePageMsg"),
        okText: t("ok"),
        cancelText: t("cancel"),
        onOk: async () => {
          onClose();
        },
        onCancel() {},
      });
    } else {
      // If no data is inserted, close without confirmation
      onClose();
    }
  };

  const handleSave = async () => {
    // Check if formData is empty or contains only empty values
    const hasData = formData.some((entry) =>
      Object.values(entry).some((value) => value !== null && value !== undefined && value !== "")
    );

    // if (!hasData) {
    //   message.info(t("noInsertedValueFound"));
    //   return;
    // }

    const errors = [];
    // Check if all required fields are present in formData
    const requiredFields = [
      "sequence",
      "customData",
      "fieldLabel",
      "required",
    ];
    const missingFields = formData.reduce((acc, entry, index) => {
      const missingInEntry = requiredFields.filter(
        (field) =>
          !entry.hasOwnProperty(field) ||
          entry[field] === null ||
          entry[field] === undefined ||
          entry[field] === ""
      );
      if (missingInEntry.length > 0) {
        acc.push({ index, fields: missingInEntry });
      }
      return acc;
    }, []);

    if (missingFields.length > 0) {
      const errorMessages = missingFields.map(
        ({ index, fields }) =>
          `Row ${index + 1} is missing: ${fields.join(", ")}`
      );
      message.error(
        `Missing required data fields:\n${errorMessages.join(
          "\n"
        )} not be empty`
      );
      return; // Exit the function early
    }

    // Check for duplicate entries
    const customDataSet = new Set();
    const duplicates = formData.filter((entry) => {
      const customData = entry.customData?.trim().toLowerCase();
      if (customDataSet.has(customData)) {
        return true;
      }
      customDataSet.add(customData);
      return false;
    });

    if (duplicates.length > 0) {
      const duplicateMessages = duplicates.map(
        (entry) => `Duplicate entry: ${entry.customData}`
      );
      message.error(
        `Duplicate data fields found:\n${duplicateMessages.join("\n")}`
      );
      return; // Exit the function early
    }

    console.log(formData, "formData");

    try {
      const cookies = parseCookies();
      const site = cookies.site;

      const payload = {
        site: site,
        customDataList: formData
          .filter((entry) => entry.customData?.trim())
          .map((entry) => ({
            sequence: entry.sequence,
            customData: entry.customData.trim(),
            fieldLabel: entry.fieldLabel?.trim() || "",
            required: entry.required || false,
          })),
        UserId: username,
        category: selectRowData?.category,
      };
      // console.log("Request: ", payload);
      const response = await CustomDataUpdate(payload);
      console.log("response: ", response);
      if (response.message) {
        message.error(`Error: ${response.message}`);
      } else {
        message.success(`Success: ${response.message_details.msg}`);
      }

      setCall(call + 1);
      setFormChange(false);

      if (selected?.createdDateTime) {
        setActiveTab(0);
      } else {
        setIsAdding(false);
        setFormData(defaultCustomDataRequest);
      }
    } catch (error) {
      console.error("Error saving Custom Data:", error);
      message.error("An error occurred while saving the Custom Data.");
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: t("confirm"),
      content: t("closePageMsg"),
      okText: t("ok"),
      cancelText: t("cancel"),
      onOk: async () => {
        onClose();
        setOper(true);
      },
      onCancel() {},
    });
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <CustomDataTable />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.dataFieldBodyContents}>
          <div className={isAdding ? styles.heading : styles.headings}>
            <div className={styles.split}>
              <div>
                <p className={styles.headingtext}>
                  {/* {selected?.activityGroupName
                    ? selected?.activityGroupName
                    : selectRowData?.category} */}
                  {selectRowData?.category}
                </p>
              </div>

              <div className={styles.actionButtons}>
                {fullScreen ? (
                  <Tooltip title={t("exitFullScreen")}>
                    <Button
                      onClick={handleCloseChange}
                      className={styles.actionButton}
                    >
                      <CloseFullscreenIcon />
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip title={t("enterFullScreen")}>
                    <Button
                      onClick={handleOpenChange}
                      className={styles.actionButton}
                    >
                      <OpenInFullIcon />
                    </Button>
                  </Tooltip>
                )}
                <Tooltip title={t("close")}>
                  <Button onClick={handleClose} className={styles.actionButton}>
                    <CloseIcon />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="custom Data Group Tabs"
            >
              <Tab label={t("home")} />
            </Tabs>
          </Box>
          <Box sx={{ padding: 2 }}>{renderTabContent()}</Box>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.floatingButtonContainer}>
          <button
            className={`${styles.floatingButton} ${styles.saveButton}`}
            onClick={handleSave}
          >
            {/* {selected?.customData ? t("save") : t("create")} */}
            {t("update")}
          </button>
          <button
            className={`${styles.floatingButton} ${styles.cancelButton}`}
            onClick={handleCancel}
          >
            {t("cancel")}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CustomDataBody;
