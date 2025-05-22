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

import { Button, Form, Input, message, Modal, Switch, Tooltip, Table } from "antd";

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





  const handleSearch = async (searchTerm: string) => {
    try {
      // Fetch the item list and wait for it to complete
      const lowercasedTerm = searchTerm.toLowerCase();
      const cookies = parseCookies();
      const site = cookies?.site;
      const request = {
        site: site,
        componentLabel: searchTerm
      }
      try {
        let oAllItem = await retrieveAllComponents(request);

        // Once the item list is fetched, filter the data
        let filtered;
        if (lowercasedTerm) {
          if (!oAllItem?.errorCode)
            filtered = oAllItem;
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
    setNavigateToNewScreen(true);
    fieldType.current = defaultFormData?.dataType;
    setSeeFullScreen(false);
  };

  const handleRowSelect = (row: DataRow) => {

    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);

    const fetchConfig = async () => {
      try {
        let response;
        const cookies = parseCookies();
        const site = cookies?.site;
        const request = {
          site: site,
          componentLabel: row.componentLabel
        }
        try {
          response = await retrieveComponent(request);
          if (!response?.errorCode) {
            const dummyData =
            {
              "site": "1004",
              "handle": "ComponentBO:1004,Active Composition",
              "componentLabel": "Active Composition",
              "dataType": "Reference Table",
              "unit": "",
              "defaultValue": null,
              "required": false,
              "validation": "",
              "active": 1,
              "userId": "rits_admin",
              "createdDateTime": "2025-05-19T13:16:37.155",
              "modifiedDateTime": null,
              "tableConfig": {},
              "referenceTableConfig": {
                  "rows": "2",
                  "rowData": {
                      "row1-col0": "1",
                      "row2-col0": "2"
                  },
                  "columns": "2",
                  "columnNames": [
                      "hi",
                      "hello"
                  ]
              }
          }
            setPayloadData(response);
            setSelectedRowData(response);
            setNavigateToNewScreen(true);
            fieldType.current = response?.dataType;
            if(response?.dataType == "Table" || response?.dataType == "Reference Table"){
              setFullScreen(true);
            }
            else{
              setFullScreen(false);
            }
          }

        }
        catch (e) {
          console.error("Error in retrieveing the component", e);
        }
      } catch (error) {
        console.error("Error fetching component:", error);
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
            console.error("Error in retrieveing the component: ", e);
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
          appTitle={t("componentBuilderMaintenance")} onSiteChange={function (newSite: string): void {
            setCall(call + 1);
          }} />
      </div>

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
              />
            </div>
            <div
              className={`${styles.formContainer} ${isAdding ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}`: ""}`}
            >
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
              />
            </div>
          </div>
        </div>


     

      




    </div >
  );
};

export default ComponentBuilderMaintenance;


