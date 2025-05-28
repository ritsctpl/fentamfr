"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/ComponentBuilder.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';

import { Button, Form, Input, message, Modal, Switch, Tooltip, Table, Divider } from "antd";

import ApiConfigurationCommonBar from "./ComponentBuilderCommonBar";

import { parseCookies } from "nookies";
import { MyProvider, useMyContext } from "../hooks/componentBuilderContext";
import ComponentBuilderBody from "./ComponentBuilderBody";
import { defaultFormData } from "../types/componentBuilderTypes";
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "./userInstructions";
import { createComponent, deleteComponent, retrieveAllComponents, retrieveComponent, retrieveTop50Components, updateComponent } from "@services/componentBuilderService";



interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}



const ComponentBuilderMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const { payloadData, setPayloadData, showAlert, setShowAlert, isAdding, setIsAdding,
    setNavigateToNewScreen, fieldType, setSeeFullScreen } = useMyContext();
  const [top50Data, setTop50Data] = useState<DataRow[]>([]);
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
    const fetchTop50Data = async () => {
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
          let top50ListData;
          const cookies = parseCookies();
          const site = cookies?.site;
          try {
            top50ListData = await retrieveTop50Components({ site });
            top50ListData = top50ListData.map((item: any) => ({
              componentLabel: item.componentLabel,
              dataType: item.dataType,
              defaultValue: item.defaultValue,
              required: item.required,
            }));
            if (!top50ListData?.errorCode) {
              setTop50Data(top50ListData);
              setFilteredData(top50ListData); // Initialize filtered data
            }
          }
          catch (e) {
            console.error("Error in retrieving top 50 components", e);
          }
        } catch (error) {
          console.error("Error fetching top 50 components:", error);
        }
      }, 1000);

    };

    fetchTop50Data();
  }, [isAuthenticated, username, call]);





 


  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  

 

 

  return (
    <div className={styles.container}>
      <div className={styles.dataFieldNav}>
        {/* <div >
          <Typography
            variant="h6"
            className={styles.appTitle}
          >
            {t("componentBuilderMaintenance")}
          </Typography>
        </div> */}
      </div>

      {/* Add a horizontal divider */}
      {/* <Divider 
        style={{ 
          margin: '10px 0', 
          backgroundColor: '#e0e0e0', 
          height: '1px' 
        }} 
      /> */}

        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              {/* <ApiConfigurationCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
                button={
                  <InstructionModal title="API Configuration Maintenance">
                    <UserInstructions />
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("component")} ({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton
                  onClick={handleAddClick}
                  className={styles.circleButton}
                >
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div> */}
              {/* <CommonTable data={filteredData} onRowSelect={handleRowSelect} /> */}
              <ComponentBuilderBody
                call={call}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                setCall={setCall}
                isAdding={isAdding}
                setFullScreen={setFullScreen}
                addClickCount={addClickCount}
                setAddClick={setAddClick}
                // itemRowData={itemRowData}
                fullScreen={fullScreen}
                setSelectedRowData={setSelectedRowData}
              />
            </div>
            
          </div>
        </div>


     

      




    </div >
  );
};

export default ComponentBuilderMaintenance;


