"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/DataFieldMaintenance.module.css";
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
  retrieveCustomDataList,
  retrieveDataField,
  retrieveTop50DataField,
} from "@services/dataFieldService";
import { Modal } from "antd";
import DataFieldBody from "./DataFieldBody";
import ReasonCodeCommonBar from "./DataFieldCommonBar";
import { DataFieldContext } from "../hooks/DataFieldContext";


interface DataRow {
  [key: string]: string | number;
  createdDateTime: string;
  modifiedDateTime: string;

}

interface DecodedToken {
  preferred_username: string;
}







const DataFieldMaintenance: React.FC = () => {
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
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [payloadData, setPayloadData] = useState<any>();
  const [isList, setIsList] = useState<boolean>(false);
  const [showColumns, setShowColumns] = useState<boolean>();

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
          const item = await retrieveTop50DataField(site);
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
      const oAllItem = await retrieveAllDataField(site, searchTerm);

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
      console.error('Error fetching data field on search:', error);
    }
  };

  let schemaData = [

    {
      type: 'input',
      label: 'dataField',
      name: 'dataField',
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
      type: 'select',
      label: 'type',
      name: 'type',
      placeholder: '',
      required: true,
      defaultValue: "Text",
      width: "70%",
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'Number', label: 'Number' },
        { value: 'Textarea', label: 'Textarea' },
        { value: 'DatePicker', label: 'DatePicker' },
        { value: 'CheckBox', label: 'CheckBox' },
        { value: 'List', label: 'List' },
      ],
    },
    {
      type: 'input',
      label: 'fieldLabel',
      name: 'fieldLabel',
      placeholder: '',
      required: false,
      width: "70%",
      uppercase: true,
      noSpaces: false,
      noSpecialChars: false
    },
    {
      type: 'browse',
      label: 'maskGroup',
      name: 'maskGroup',
      placeholder: '',
      icon: true,
      correspondingVersion: '',
      required: false,
      tableColumns: [],
      tableData: [],
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'switch',
      label: 'browseIcon',
      name: 'browseIcon',
      placeholder: '',
      required: false,
      icon: false,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      checked: false
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
    {
      type: 'switch',
      label: 'qmSelectedSet',
      name: 'qmSelectedSet',
      placeholder: '',
      required: false,
      icon: false,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'switch',
      label: 'isTrackable',
      name: 'trackable',
      placeholder: '',
      required: false,
      icon: false,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'switch',
      label: 'isMrfRef',
      name: 'mfrRef',
      placeholder: '',
      required: false,
      icon: false,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,

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
      dataField: "",
      type: "Text",
      description: "",
      fieldLabel: "",
      maskGroup: "",
      browseIcon: false,
      preSaveActivity: "",
      qmSelectedSet: false,
      trackable: false,
      mfrRef: false,
    }));
    setShowColumns(false)

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
      const dataField = row.dataField as string;

      try {
        const oDataField = await retrieveDataField(site, dataField);
        console.log("Retrieved Data Field: ", oDataField);

        if (!oDataField.errorCode) {
          // Process listDetails if it exists
          let processedListDetails = oDataField.listDetails;
          if (Array.isArray(oDataField.listDetails)) {
            processedListDetails = oDataField.listDetails.map((item, index) => ({
              ...item,
              key: index,
              id: uuidv4()
            }));
          }
          if(oDataField.mfrRef)
            setShowColumns(true);

          setSelectedRowData({
            ...oDataField,
            listDetails: processedListDetails
          });
          setRowData(oDataField);
          setItemRowData(oDataField);
          setPayloadData({
            ...oDataField,
            listDetails: processedListDetails
          });
          if (oDataField.type == "List") {
            setIsList(true);
          }
          else {
            setIsList(false);
          }
        }
      } catch (error) {
        console.error("Error fetching data field:", error);
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
          console.log('Action canceled');
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
    <DataFieldContext.Provider value={{ payloadData, setPayloadData, showAlert, setShowAlert, schemaData, isList, setIsList,
      showColumns, setShowColumns }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("dataFieldAppTitle")} onSiteChange={function (newSite: string): void {
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
                  {t("dataField")} ({filteredData ? filteredData.length : 0})
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
              <DataFieldBody
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
                }} />
            </div>
          </div>
        </div>
      </div>
    </DataFieldContext.Provider>
  );
};

export default DataFieldMaintenance;