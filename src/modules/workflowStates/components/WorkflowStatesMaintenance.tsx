"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/WorkflowStates.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';


import { Modal } from "antd";

import ApiConfigurationCommonBar from "./WorkflowStatesCommonBar";

import { parseCookies } from "nookies";
import { MyProvider, useMyContext } from "../hooks/WorkflowStatesContext";
import ApiConfigurationMaintenanceBody from "./WorkflowStatesBody";
import { defaultFormData } from "../types/WorkflowStatesTypes";
import { retrieveAllApiConfigurations, retrieveApiConfigurations, retrieveTop50ApiConfigurations } from "@services/apiConfigurationService";
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "./userInstructions";



interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}


const WorkflowStatesMain: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const { setPayloadData, showAlert, setShowAlert, isAdding, setIsAdding } = useMyContext();
  const [top50Data, setTop50Data] = useState<DataRow[]>([]);
  const [rowData, setRowData] = useState<DataRow[]>([]);
  const [itemRowData, setItemRowData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<DataRow | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);

  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);



  const { t } = useTranslation();



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
        try {
          // debugger;
          const cookies = parseCookies();
          const site = cookies?.site;
          try {
            const item = await retrieveTop50ApiConfigurations(site);
            if (!item?.errorCode) {
              setTop50Data(item);
              setFilteredData(item); // Initialize filtered data
            }
          }
          catch (e) {
            console.error("Error in retrieving top 50 configurations", e);
          }
        } catch (error) {
          console.error("Error fetching data fields:", error);
        }
      }, 1000);

    };

    fetchItemData();
  }, [isAuthenticated, username, call]);





  const handleSearch = async (searchTerm: string) => {
    try {
      // Fetch the item list and wait for it to complete
      const lowercasedTerm = searchTerm.toLowerCase();
      const cookies = parseCookies();
      const site = cookies?.site;
      try {
        let oAllItem = await retrieveAllApiConfigurations(searchTerm);
        // Once the item list is fetched, filter the data
        let filtered;
        if (lowercasedTerm) {
          if (!oAllItem?.errorCode)
            filtered = [oAllItem];
        } else {
          filtered = top50Data; // If no search term, show all items
        }
        // Update the filtered data state
        setFilteredData(filtered);

      }
      catch (e) {
        console.log("Error in retrieving all configuration", e);
      }
    } catch (error) {
      console.error('Error fetching config on search:', error);
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
    setPayloadData(defaultFormData);
    setShowAlert(false);
  };

  const handleRowSelect = (row: DataRow) => {

    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);

    const fetchConfig = async () => {
      try {
        let response;
        const id = row.id;
        const cookies = parseCookies();
        const site = cookies?.site;
        try {
          response = await retrieveApiConfigurations(id);
          if (!response?.errorCode) {
            setPayloadData(response);
            setSelectedRowData(response);
          }

        }
        catch (e) {
          console.error("Error in retrieveing the configuration", e);
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
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
          try {
            await fetchConfig();
          }
          catch (e) {
            console.error("Error in retrieveing the configuartion: ", e);
          }
          setShowAlert(false)
        },
        onCancel() {
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchConfig();
    }
    setIsAdding(true);

  };


  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };


  return (
    <div className={styles.container}>
      <div className={styles.dataFieldNav}>
        <CommonAppBar
          onSearchChange={() => { }}
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("workflowStates")} onSiteChange={function (newSite: string): void {
            setCall(call + 1);
          }} />
      </div>
      <div className={styles.dataFieldBody}>
        <div className={styles.dataFieldBodyContentsBottom}>
          <div
            className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
              }`}
          >
            <ApiConfigurationCommonBar
              onSearch={handleSearch}
              setFilteredData={setFilteredData}
              // button={
              //   <InstructionModal title="Workflow States">
              //     <UserInstructions />
              //   </InstructionModal>
              // }
            />
            <div className={styles.dataFieldBodyContentsTop}>
              <Typography className={styles.dataLength}>
                {t("states")} ({filteredData ? filteredData.length : 0})
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
            <ApiConfigurationMaintenanceBody
              call={call}
              onClose={handleClose}
              selectedRowData={selectedRowData}
              setCall={setCall}
              isAdding={isAdding}
              setFullScreen={setFullScreen}
              addClickCount={addClickCount}
              setAddClick={setAddClick}
              itemRowData={itemRowData}
              fullScreen={fullScreen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStatesMain;


