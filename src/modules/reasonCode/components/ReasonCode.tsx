"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/ReasonCodeMaintenance.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from 'react-i18next';
import { fetchAllReasonCode, retrieveCustomDataList, retrieveReasonCode } from "@services/reasonCodeService";
import { Modal } from "antd";
import { fetchTop50ReasonCode } from "@services/reasonCodeService";
import ReasonCodeMaintenanceBody from "./ReasonCodeBodyContent";
import ReasonCodeCommonBar from "./ReasonCodeCommonBar";
import { ReasonCodeContext } from "../hooks/reasonCodeContext";

interface DataRow {
  [key: string]: string | number;
  createdDateTime: string;
  modifiedDateTime: string;

}

interface DecodedToken {
  preferred_username: string;
}

interface CustomDataRow {
  customData: string;
  value: any;
}

const ReasonCodeMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [top50Data, setTop50Data] = useState<DataRow[]>([]);
  const [rowData, setRowData] = useState<DataRow[]>([]);
  const [itemRowData, setItemRowData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<DataRow | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [resetValueCall, setResetValueCall] = useState<number>(0);
  const [rowClickCall, setRowClickCall] = useState<number>(0);
  const [customDataForCreate, setCustomDataForCreate] = useState<CustomDataRow[]>([]);
  const [customDataOnRowSelect, setCustomDataOnRowSelect] = useState<CustomDataRow[]>([]);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [payloadData, setPayloadData] = useState<any>();
  let oCustomDataList;

  useEffect(() => {
    const fetchItemData = async () => {
      // debugger;
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

      setTimeout(async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        try {
          const item = await fetchTop50ReasonCode(site);
          setTop50Data(item);
          setFilteredData(item); // Initialize filtered data
        } catch (error) {
          console.error("Error fetching data fields:", error);
        }
      }, 1000);

    };

    fetchItemData();
  }, [isAuthenticated, username, call]);

  useEffect(() => {
    const element: any = document.querySelector('.MuiBox-root.css-19midj6');
    if (element) {
      element.style.padding = '0px';
    }
  }, []);

  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = username;

    try {
      // Fetch the item list and wait for it to complete
      const oAllItem = await fetchAllReasonCode(site, searchTerm);

      // Once the item list is fetched, filter the data
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = oAllItem.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = top50Data; // If no search term, show all items
      }

      // Update the filtered data state
      setFilteredData(filtered);

      // console.log("Filtered items: ", filtered);
    } catch (error) {
      console.error('Error fetching reason code on search:', error);
    }
  };

  const handleAddClick = () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsAdding(true);
    //setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setAddClickCount(addClickCount + 1)

    const fetchCustomDataList = async () => {
      // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      console.log("cookies: ", cookies);
      const site = cookies.site;

      try {
        const category = "Reason Code";
        const userId = username;
        oCustomDataList = await retrieveCustomDataList(site, category, userId); // Assuming retrieve document is an API call or a data fetch function
        if (!oCustomDataList.errorCode) {
          const transformedCustomDataList = oCustomDataList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: uuidv4(),
              value: ""
            })
          );

          console.log("Custom Data list: ", transformedCustomDataList);
          setCustomDataOnRowSelect(transformedCustomDataList);
          setPayloadData((prevData) => ({
            ...prevData,
            customDataList: transformedCustomDataList
          }))
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCustomDataList(); // Call the renamed function

    setPayloadData((prevData) => ({
      // ...prevData,
      reasonCode: "",
      description: "",
      category: "Corrective Action", // This remains the same
      status: "Enabled", // This remains the same
      messageType: "",
      type: "Resource",
      resource: [],
      workCenter: [],
      customDataList: customDataOnRowSelect, // Keep the existing customDataList unchanged
    }));
    setShowAlert(false)

  };

  const { t } = useTranslation();


  const handleRowSelect = (row: DataRow) => {
    //setRowClickCall(rowClickCall + 1);
    //setSelectedRowData(row);
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);


    const fetchReasonCodeData = async () => {
      // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;
      const reasonCode = row.reasonCode as string;

      try {
        const oReasonCode = await retrieveReasonCode(site, reasonCode);
        console.log("Retrieved Reason Code: ", oReasonCode);
        // debugger;
        if (!oReasonCode.errorCode) {
          const transformedReasonCodeCustomData = oReasonCode.customDataList.map(data => ({
            ...data,
            key: uuidv4(),
            id: uuidv4(),
          }));

          let combinedCustomDataList = [...transformedReasonCodeCustomData];

          try {
            const category = "Reason Code";
            const userId = username;
            oCustomDataList = await retrieveCustomDataList(site, category, userId);

            if (!oCustomDataList.errorCode) {
              const transformedCustomDataTemplate = oCustomDataList.map(data => ({
                ...data,
                key: uuidv4(),
                id: uuidv4(),
                value: ""
              }));

              // Add non-matching items from transformedCustomDataTemplate to combinedCustomDataList
              transformedCustomDataTemplate.forEach(templateData => {
                const isMatching = combinedCustomDataList.some(
                  rcData => rcData.customData === templateData.customData
                );
                if (!isMatching) {
                  combinedCustomDataList.push(templateData);
                }
              });
            }
          } catch (error) {
            console.error("Error fetching custom data list:", error);
            // If there's an error, we'll use only the data from the first API
          }

          console.log("Combined Custom Data list: ", combinedCustomDataList);

          setSelectedRowData({
            ...oReasonCode,
            customDataList: combinedCustomDataList
          });
          setCustomDataOnRowSelect(combinedCustomDataList);
          setRowData(oReasonCode);
          setItemRowData(oReasonCode);
          // debugger
          setPayloadData({
            ...oReasonCode,
            customDataList: combinedCustomDataList,
            // resource: oReasonCode?.resource.map(res => ({ resource: res }))
          });
          // debugger
        }
      } catch (error) {
        console.error("Error fetching reason code or custom data:", error);
      }
    };

    if (showAlert == true && isAdding == true) {
      Modal.confirm({
        title: t('confirm'),
        content: t('rowSelectionMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk: async () => {
          // Proceed with the API call if confirmed
          await fetchReasonCodeData();
          setShowAlert(false);
        },
        onCancel() {
          console.log('Action canceled');
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchReasonCodeData();

    }
    setIsAdding(true);

  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };


  return (
    <ReasonCodeContext.Provider value={{ payloadData, setPayloadData, showAlert, setShowAlert }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("reasonCodeAppTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <ReasonCodeCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("reasonCode")} ({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton
                  onClick={handleAddClick}
                  className={styles.circleButton}
                >
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
            </div>
            <div
              className={`${styles.formContainer} ${isAdding
                ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show
                }`
                : ""
                }`}
            >
              <ReasonCodeMaintenanceBody
                call={call}
                setCall={setCall}
                resetValueCall={resetValueCall}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                resetValue={resetValue}
                oCustomDataList={oCustomDataList}
                isAdding={isAdding}
                customDataForCreate={customDataForCreate}
                top50Data={top50Data}
                customDataOnRowSelect={customDataOnRowSelect}
                rowData={rowData}
                rowClickCall={rowClickCall}
                setFullScreen={setFullScreen}
                username={username}
                setCustomDataOnRowSelect={setCustomDataOnRowSelect}
                addClick={addClick}
                addClickCount={addClickCount}
                setAddClick={setAddClick}
                itemRowData={itemRowData}
                fullScreen={fullScreen} setIsAdding={function (): void {
                  throw new Error("Function not implemented.");
                }} setResetValueCall={function (): void {
                  throw new Error("Function not implemented.");
                }} itemData={[]} availableDocuments={[]} assignedDocuments={[]} availableDocumentForCreate={[]} payloadData={undefined} setPayloadData={function (): void {
                  throw new Error("Function not implemented.");
                }} />
            </div>
          </div>
        </div>
      </div>
    </ReasonCodeContext.Provider>
  );
};

export default ReasonCodeMaintenance;