"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/WorkFlowMaintenance.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';
import { message, Modal } from "antd";
import { parseCookies } from "nookies";
import { MyProvider, useMyContext } from "../hooks/WorkFlowConfigurationContext";
import WorkFlowConfigurationMaintenanceBody from "./WorkFlowMaintenanceBody";
import { defaultConfiguration } from "../types/workFlowTypes";
import UserGroup from "@modules/userGroup/components/UserGroupMain";
import { retrieveAllWorkFlowStatesMaster, retrieveTop50Configurations } from "@services/workflowConfigurationService";



interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}


const WorkFlowConfigurationMaintenance: React.FC = () => {
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
     showAlert, setShowAlert, isAdding, setIsAdding, configurationList, setConfigurationList} = useMyContext();


  const { t } = useTranslation();



  useEffect(() => {
    const fetchItemData = async () => {
      
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
            const response = await retrieveTop50Configurations({site});
            // debugger
            if (!response?.errorCode) {
              setTop50Data(response);
              setFilteredData(response);
              setConfigurationList(response);
            }
            else{
              setTop50Data([]);
              setConfigurationList([]);
              message.error(response?.message)
            }
          }
          catch (e) {
            console.error("Error in retrieving top 50 configurations", e);
          }
        } catch (error) {
          console.error("Error fetching data fields:", error);
        }

       
            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const user = cookies?.rl_user_id
                const request = {
                    site: site,
                    userId: user,
                    name: ""
                }
                const response = await retrieveAllWorkFlowStatesMaster(request);
                setPayloadData((prev) => ({
                    ...prev,
                    statesList: response
                }));
                // setPredefinedStates(response);
            }
            catch (error) {
                console.error('Error fetching states:', error);
            }
        
        

      }, 1000);

    
    };

    fetchItemData();
    
}, [isAuthenticated, username, call]);

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
          appTitle={t("workFlowConfiguration")} onSiteChange={function (newSite: string): void {
            setCall(call + 1);
          }} />
      </div>
      <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
           
            <WorkFlowConfigurationMaintenanceBody
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
              setSelectedRowData={setSelectedRowData}
            />
          </div>
          </div>
        </div>
      </div>
  );
};

export default WorkFlowConfigurationMaintenance;


