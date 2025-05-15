/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/customData.module.css";
import { useAuth } from "@/context/AuthContext";
import { Typography } from "@mui/material";
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import CommonAppBar from "@components/CommonAppBar";
import CommonTable from "@components/CommonTable";
import { useTranslation } from "react-i18next";
import { Modal, Alert } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import CustomDataBar from "./CustomDataBar";
import {
  fetchCustomDataRetrive,
  fetchCustomDataTop50,
} from "@services/customDataService";
import CustomDataBody from "./CustomDataBody";
import { CustomDataContext } from "../hooks/CustomDataContext";
import {
  CustomDataRequest,
  defaultCustomDataRequest,
} from "../types/customdatatypes";

const categoryList = [
  {
    category: "BOM",
  },
  {
    category: "BOM Component",
  },
  {
    category: "Buyoff",
  },
  {
    category: "Certification",
  },
  {
    category: "CNC/DNC",
  },
  {
    category: "Container",
  },
  {
    category: "Data Collection",
  },
  {
    category: "Document",
  },
  {
    category: "Labor Charge Code",
  },
  {
    category: "Material",
  },
  {
    category: "Material Group",
  },
  {
    category: "Message Type",
  },
  {
    category: "NC Code",
  },
  {
    category: "Operation",
  },
  {
    category: "POD",
  },
  {
    category: "Reason Code",
  },
  {
    category: "Resource",
  },
  {
    category: "Routing",
  },
  {
    category: "Routing Step(Operation)",
  },
  {
    category: "Sample Plan",
  },
  {
    category: "Shop Order",
  },
  {
    category: "Tool Group",
  },
  {
    category: "Tool Number",
  },
  {
    category: "User",
  },
  {
    category: "Shift",
  },
  {
    category: "User Group",
  },
  {
    category: "User Shift",
  },
  {
    category: "Work Center",
  },
  {
    category: "Work Instruction",
  },
];

interface DataRow {
  [key: string]: string | number;
}

interface DecodedToken {
  preferred_username: string;
}

const CustomDataMain: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<CustomDataRequest>(
    defaultCustomDataRequest
  );
  const { isAuthenticated, token } = useAuth();
  const [itemData, setItemData] = useState<DataRow[]>([]);
  const [selected, setSelected] = useState<object>({});
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [drag, setDrag] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [rowClickCall, setRowClickCall] = useState<number>(0);
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<DataRow | null>(null);
  const [value, setValue] = useState<string>("");
  const [filteredData, setFilteredData] = useState(categoryList);
  const [previousSelectedRow, setpreviousSelectedRow] =
    useState<DataRow | null>(null);

  // useEffect(() => {
  //   const fetchCustomDataCategory = async () => {
  //     if (isAuthenticated && token) {
  //       try {
  //         const decryptedToken = decryptToken(token);
  //         const decoded: DecodedToken = jwtDecode(decryptedToken);
  //         setUsername(decoded.preferred_username);
  //       } catch (error) {
  //         console.error('Error decoding token:', error);
  //       }
  //     }

  //     const cookies = parseCookies();
  //     const site = cookies.site;

  //     try {
  //       const item = await fetchCustomDataTop50(site);
  //       console.log(item, "item");
  //       // setItemData(item);
  //       // setFilteredData(item);
  //       // setCall(0)
  //     } catch (error) {
  //       console.error('Error fetching data fields:', error);
  //     }
  //   };

  //   fetchCustomDataCategory();
  // }, [isAuthenticated, username, call]);

  const handleSearch = (searchTerm: string) => {
    setValue(searchTerm);
  };

  useEffect(() => {
    const filtered = categoryList.filter((item) =>
      item.category.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  }, [value]);
  const handleRowSelect = (row) => {
    if (isAdding && formChange) {
      // If there are unsaved changes, show confirmation message
      setSelectRowData(row);
      setIsModalVisible(true);
      setDrag(false);
    } else {
      // If there are no changes, directly select the row without confirmation
      setDrag(false);
      SelectRow(row);
      setSelected(row);
    }
  };

  const handleModalOk = () => {
    if (selectRowData) {
      SelectRow(selectRowData);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectRowData(previousSelectedRow);
  };

  const SelectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    console.log(row, "row");
    setSelectRowData(row);
    setpreviousSelectedRow(row);
    try {
      const payload = {
        site: site,
        category: row?.category,
      };
      const rowData = await fetchCustomDataRetrive(site, payload);
      setRowClickCall(rowClickCall + 1);
      setFormData(rowData);
      setIsAdding(true);
      setResetValue(false);
      setFullScreen(false);
      setSelected(rowData);
      setFormChange(false); // Reset formChange when a new row is selected
    } catch (error) {
      console.error("Error fetching data fields:", error);
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };
  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };
  return (
    <CustomDataContext.Provider
      value={{ formData, setFormData, setFormChange, formChange }}
    >
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("customdataMaintenance")}
            onSiteChange={handleSiteChange}
            onSearchChange={function (): void {
              null
            }}
          />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${
                isAdding ? styles.shrink : ""
              }`}
            >
              <CustomDataBar
                categoryList={categoryList}
                onSearch={handleSearch}
                value={value}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("category")}(
                  {value
                    ? filteredData.length
                    : categoryList
                    ? categoryList.length
                    : 0}
                  )
                </Typography>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
              <Modal
                title={
                  <span>
                    <ExclamationCircleOutlined
                      style={{ marginRight: 8, color: "#faad14" }}
                    />
                    {t("confirmation")}
                  </span>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={t("confirm")}
                cancelText={t("cancel")}
              >
                <Alert
                  message={t("alertRow")}
                  type="warning"
                  showIcon={false}
                  style={{
                    marginBottom: 16,
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                />
              </Modal>
            </div>
            <div
              className={`${styles.formContainer} ${
                isAdding
                  ? `${styles.show} ${
                      fullScreen ? styles.showFullScreen : styles.show
                    }`
                  : ""
              }`}
            >
              <CustomDataBody
                selected={selected}
                isAdding={isAdding}
                resetValue={resetValue}
                fullScreen={fullScreen}
                drag={drag}
                call={call}
                setCall={setCall}
                onClose={handleClose}
                setIsAdding={setIsAdding}
                setFullScreen={setFullScreen}
                selectRowData={selectRowData || {}}
              />
            </div>
          </div>
        </div>
      </div>
    </CustomDataContext.Provider>
  );
};

export default CustomDataMain;
