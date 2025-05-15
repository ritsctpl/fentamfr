"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/WorkFlowMaintenance.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';


import { Modal } from "antd";

import ApiConfigurationCommonBar from "./WorkFlowCommonBar";

import { parseCookies } from "nookies";
import { MyProvider, useMyContext } from "../hooks/workFlowContext";
import ApiConfigurationMaintenanceBody from "./WorkFlowMaintenanceBody";
import { defaultQualityApprovalProcess } from "../types/workFlowTypes";
import { retrieveAllApiConfigurations, retrieveApiConfigurations, retrieveTop50ApiConfigurations } from "@services/apiConfigurationService";
import axios from "axios";
import { fetchAllUserGroup, retrieveUserGroup } from "@services/workFlowService";
import UserGroup from "@modules/userGroup/components/UserGroupMain";



interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}


const WorkFlowMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
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
  const {setActiveTab, setUserGroupList, payloadData, setPayloadData, 
     showAlert, setShowAlert, isAdding, setIsAdding} = useMyContext();


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
            // Make the API call using Axios
            const response = await axios.get('https://mocki.io/v1/4dfc06a3-2397-47d5-a64c-c51cf0ec7e8f');
            // debugger
            if (response.data) {
              setTop50Data(response.data);
              setFilteredData(response.data);
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
        // setFilteredData(filtered);

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
    setPayloadData(defaultQualityApprovalProcess);
    setShowAlert(false);
    setActiveTab(0);
    handleLevelConfig();
    

  };

  const handleLevelConfig = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies?.site;
      
      // Fetch user group list
      const userGroupResponse = await fetchAllUserGroup(site);
      let userGroupList = [];
      
      if (!userGroupResponse?.errorCode) {
        userGroupList = userGroupResponse.map((item, index) => ({
          ...item,
          id: index,
          userRole: item?.description
        }));
      }
      
      // Set user group list
      setUserGroupList(userGroupList);
      setPayloadData(prev => ({
        ...prev,
        userGroupList: userGroupList
      }));
      
      // Fetch users for the first user group
      const userGroup = userGroupList[0]?.userGroup;
      const userResponse = await retrieveUserGroup(site, userGroup);
      let userList = [];
      
      if (!userResponse?.errorCode) {
        userList = userResponse?.users?.map((item, index) => ({
          id: index,
          user: item?.user
        })) || [];
      }
      
      // Set user list
      setPayloadData(prev => ({
        ...prev,
        userList: userList
      }));
      
    } catch (e) {
      console.log("Error in retrieving user configuration: ", e);
      // Set empty lists in case of error
      setUserGroupList([]);
      setPayloadData(prev => ({
        ...prev,
        userGroupList: [],
        userList: []
      }));
    }
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
          // Make the API call using Axios
          const apiResponse = await axios.get('https://mocki.io/v1/9e6f15b1-9374-4049-a5a1-6d63983018e6');
          response = apiResponse.data;
    
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
          appTitle={t("approvalWorkFlowConfiguration")} onSiteChange={function (newSite: string): void {
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
            />
            <div className={styles.dataFieldBodyContentsTop}>
              <Typography className={styles.dataLength}>
                {t("configuration")} ({filteredData ? filteredData.length : 0})
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

export default WorkFlowMaintenance;


