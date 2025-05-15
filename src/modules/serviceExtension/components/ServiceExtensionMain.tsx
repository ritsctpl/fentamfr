"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/ServiceExtension.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';
import { Modal } from "antd";
import { ServiceExtensionContext } from "../hooks/serviceExtension";
import { fetchTop50List, retrieveAllHook, retrieveHook, } from "@services/serviceExtensionServices";
import ServiceExtensionCommonBar from "./ServiceExtensionCommonBar";
import { defaultHookType } from "../types/extensionTypes";
import ServiceExtensionBody from "./ServiceExtensionBody";

interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}


const HookMaintenance: React.FC = () => {
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
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [payloadData, setPayloadData] = useState<any>(defaultHookType);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);


  useEffect(() => {
    const fetchHookData = async () => {
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
        let aList = [];
        
        try {
          //debugger;
          let oList = await fetchTop50List(site);
          aList = oList.map(item => ({
            activityHookId: item.activityHookId,
            description: item.description,
            hookPoint: item.hookPoint,
            executionMode: item.executionMode,
          }))
          setTop50Data(oList);
          setFilteredData(aList); // Initialize filtered data
        } catch (error) {
          console.error("Error fetching top 50 hook:", error);
        }
      }, 1000);

    };

    fetchHookData();
  }, [isAuthenticated, username, call]);




  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    try {
      const lowercasedTerm = searchTerm.toLowerCase();
      const activityHookId = searchTerm;
      const oAllItem = await retrieveAllHook(site, activityHookId);
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
      filtered = filtered.map(item => ({
        activityHookId: item.activityHookId,
        description: item.description,
        hookPoint: item.hookPoint,
        executionMode: item.executionMode,
      }));
      // Update the filtered data state
      setFilteredData(filtered);

      // console.log("Filtered items: ", filtered);
    } catch (error) {
      console.error('Error fetching hook on search:', error);
    }
  };

  const { t } = useTranslation();





  const handleAddClick = () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsAdding(true);
    //setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setAddClickCount(addClickCount + 1)
    setActiveTab(0);
    // debugger
    setPayloadData((prevData) => (
      defaultHookType
    ));

    setShowAlert(false)
  };

  const handleRowSelect = (row: DataRow) => {
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);


    const fetchHookData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const activityHookId = row.activityHookId as string;

      try {
        const oHook = await retrieveHook(site, activityHookId);

        if (!oHook.errorCode) {

          setSelectedRowData(oHook);
          setRowData(oHook);
          setItemRowData(oHook);
          setPayloadData(oHook);
        }
      } catch (error) {
        console.error("Error fetching Hook:", error);
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
          await fetchHookData();
          setShowAlert(false)
        },
        onCancel() {
          // console.log('Action canceled');
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchHookData();
    }
    setIsAdding(true);

  };


  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };


  return (
    <ServiceExtensionContext.Provider value={{ payloadData, setPayloadData, addClickCount, showAlert, setShowAlert, resetValue, activeTab, setActiveTab }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("serviceExtensionAppTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <ServiceExtensionCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("serviceExtension")} ({filteredData ? filteredData.length : 0})
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
              <ServiceExtensionBody
                call={call}
                setCall={setCall}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                rowSelectedData={selectedRowData}
                isAdding={isAdding}
                setFullScreen={setFullScreen}
                username={username}
                setAddClick={setAddClick}
                itemRowData={itemRowData}
                fullScreen={fullScreen}
              />
            </div>
          </div>
        </div>
      </div>
    </ServiceExtensionContext.Provider>
  );
};

export default HookMaintenance;


