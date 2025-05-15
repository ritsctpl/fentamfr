"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/DataTypeMaintenance.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { useTranslation } from 'react-i18next';

import {
  retrieveAllDataField,
  retrieveAllDataType,
  retrieveDataField,
  retrieveDataType,
  retrieveTop50DataField,
  retrieveTop50DataType,
} from "@services/dataTypeService";
import { Modal } from "antd";
import DataTypeBody from "./DataTypeBody";
import DataTypeCommonBar from "./DataTypeCommonBar";
import { DataTypeContext } from "../hooks/DataTypeContext";
import { defaultDataTypeRequest } from "../types/DataTypeTypes";


interface DataRow {
  [key: string]: string | number;
  createdDateTime: string;
  modifiedDateTime: string;

}

interface DecodedToken {
  preferred_username: string;
}



const DataTypeMaintenance: React.FC = () => {
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
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [payloadData, setPayloadData] = useState<any>();
  const [isList, setIsList] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("Assembly");



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
          const item = await retrieveTop50DataType(site);
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

    try {
      // Fetch the item list and wait for it to complete
      debugger
      const oAllItem = await retrieveAllDataType(site, searchTerm, category);

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
      console.error('Error fetching data type on search:', error);
    }
  };

  let schemaData = [
    {
      type: 'select',
      label: 'category',
      name: 'category',
      placeholder: '',
      required: true,
      defaultValue: "Assembly",
      width: "70%",
      options: [
        { value: 'Assembly', label: 'Assembly' },
        { value: 'NC', label: 'NC' },
        { value: 'Packing Container', label: 'Packing Container' },
        { value: 'Packing PCU', label: 'Packing PCU' },
        { value: 'RMA PCU', label: 'RMA PCU' },
        { value: 'RMA Shop Order', label: 'RMA Shop Order' },
        { value: 'PCU', label: 'PCU' },
      ],
    },
    {
      type: 'input',
      label: 'dataType',
      name: 'dataType',
      placeholder: '',
      required: true,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'input',
      label: 'description',
      name: 'description',
      placeholder: '',
      required: false,
      width: "70%",
    },
   
    
    {
      type: 'browse',
      label: 'preSaveActivity',
      name: 'preSaveActivity',
      placeholder: '',
      icon: true,
      correspondingVersion: '',
      required: false,
      tableColumns: [],
      tableData: [],
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },

  ];

  const handleAddClick = () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsAdding(true);
    //setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setAddClickCount(addClickCount + 1)
    setIsList(false);

  
    setPayloadData(defaultDataTypeRequest);
    setShowAlert(false)

  };

  const { t } = useTranslation();


  const handleRowSelect = (row: DataRow) => {
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);
    const fetchDataFieldData = async () => {
      // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;
      const dataType = row.dataType as string;
      const oCategory = row.category as string;
      try {
        const oDataType = await retrieveDataType(site, dataType, oCategory);
        console.log("Retrieved Data Field: ", oDataType);
        
        if (!oDataType.errorCode) {
          const dataFieldListWithKeys = oDataType.dataFieldList.map(item => ({
            ...item,
            key: uuidv4(), // Generate a unique key using uuid
            id: uuidv4() // Generate a unique key using uuid
          }));
          setSelectedRowData({
            ...oDataType,
          });
          setRowData(oDataType);
          setItemRowData(oDataType);
          setPayloadData({
            ...oDataType,
            dataFieldList: dataFieldListWithKeys
          });
          
        }
      } catch (error) {
        console.error("Error fetching data type:", error);
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
          await fetchDataFieldData();
          setShowAlert(false);
        },
        onCancel() {
          // console.log('Action canceled');
        },
      });
    } else {
      fetchDataFieldData();
    }
    setIsAdding(true);

  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };


  return (
    <DataTypeContext.Provider value={{ payloadData, setPayloadData, showAlert, setShowAlert, schemaData, isList, setIsList,
      category, setCategory
     }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("dataTypeAppTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <DataTypeCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("dataType")} ({filteredData ? filteredData.length : 0})
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
              <DataTypeBody
                call={call}
                setCall={setCall}
                resetValueCall={resetValueCall}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                resetValue={resetValue}
                isAdding={isAdding}
                top50Data={top50Data}
                rowData={rowData}
                setFullScreen={setFullScreen}
                username={username}
                addClick={addClick}
                addClickCount={addClickCount}
                setAddClick={setAddClick}
                itemRowData={itemRowData}
                fullScreen={fullScreen} setIsAdding={function (): void {
                  throw new Error("Function not implemented.");
                } }   />
            </div>
          </div>
        </div>
      </div>
    </DataTypeContext.Provider>
  );
};

export default DataTypeMaintenance;