"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/WorkCenterMaintenance.module.css";

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

import { fetchAllWorkCenter, fetchTop50WorkCenter, retrieveCustomDataList, retrieveWorkCenter } from "@services/workCenterService";

import { Modal, notification } from "antd";

import WorkCenterCommonBar from "./WorkCenterCommonBar";
import { WorkCenterContext } from "../hooks/workCenterContext";
import WorkCenterBody from "./WorkCenterBody";
import { fetchTop50Activity } from "@services/activityService";
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "./userInstructions";

interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}

interface CustomDataRow {
  customData: string;
  value: any;
}





const WorkCenterMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [top50Data, setTop50Data] = useState<DataRow[]>([]);
  const [rowData, setRowData] = useState<DataRow[]>([]);
  const [itemRowData, setItemRowData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [resetValueCall, setResetValueCall] = useState<number>(0);
  const [rowClickCall, setRowClickCall] = useState<number>(0);
  const [mainSchema, setMainSchema] = useState<any>();
  const [customDataForCreate, setCustomDataForCreate] = useState<
    CustomDataRow[]
  >([]);


  const [customDataOnRowSelect, setCustomDataOnRowSelect] = useState<
    any[]
  >([]);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);

  const [payloadData, setPayloadData] = useState<object>({});
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { t } = useTranslation();


  const router = useRouter();

  useEffect(() => {
    const fetchWCData = async () => {
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
          // debugger;
          const item = await fetchTop50WorkCenter(site);
          console.log("top 50 WC: ", item);
          setTop50Data(item);
          setFilteredData(item); // Initialize filtered data
        } catch (error) {
          console.error("Error fetching work center:", error);
        }
      }, 1000);

    };

    fetchWCData();
  }, [isAuthenticated, username, call]);

  useEffect(() => {
    const element: any = document.querySelector('.MuiBox-root.css-19midj6');
    if (element) {
      element.style.padding = '0px';
    }
  }, []);

  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site; // You can replace this with cookies.site if needed
    const userId = username;

    try {
      // Fetch the item list and wait for it to complete
      const lowercasedTerm = searchTerm.toLowerCase();
      const oAllWC = await fetchAllWorkCenter(site, searchTerm);

      // Once the item list is fetched, filter the data
      let filtered;

      if (lowercasedTerm) {
        filtered = oAllWC.filter(row =>
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
      console.error('Error fetching wc on search:', error);
    }
  };



  const routingTableColumns = [
    { title: t("routing"), dataIndex: 'routing', key: 'routing' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
    { title: t("version"), dataIndex: 'version', key: 'version' },
  ];

  const workCenterTableColumns = [
    { title: t("workCenter"), dataIndex: 'workCenter', key: 'workCenter' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
  ];


  let schemaData = [

    {
      type: 'input',
      label: 'workCenter',
      name: 'workCenter',
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
      label: 'status',
      name: 'status',
      placeholder: '',
      required: true,
      defaultValue: "Available",
      width: "70%",
      options: [
        { value: 'Available', label: 'Available' },
        { value: 'Not Available', label: 'Not Available' },
      ],
    },
    {
      type: 'browse',
      label: 'routing',
      name: 'routing',
      placeholder: '',
      icon: true,
      correspondingVersion: 'routingVersion',
      required: false,
      tableColumns: routingTableColumns,
      tableData: [],
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'switch',
      label: 'trackOee',
      name: 'trackOee',
      placeholder: '',
      required: false,
      width: "70%",
    },
    {
      type: 'browse',
      label: 'routingVersion',
      name: 'routingVersion',
      placeholder: '',
      required: false,
      icon: false,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'select',
      label: 'workCenterCategory',
      name: 'workCenterCategory',
      placeholder: '',
      required: true,
      defaultValue: "Cell",
      options: [
        { value: 'Cell', label: 'Cell' },
        { value: 'Line', label: 'Line' },
        { value: 'Cell Group', label: 'Cell Group' },
      ],
      width: "70%",
    },
    {
      type: 'input',
      label: 'erpWorkCenter',
      name: 'erpWorkCenter',
      placeholder: '',
      required: false,
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      width: "70%",
    },

    {
      type: 'browse',
      label: 'defaultParentWorkCenter',
      name: 'defaultParentWorkCenter',
      placeholder: '',
      icon: true,
      correspondingVersion: '',
      required: false,
      tableColumns: workCenterTableColumns,
      tableData: [],
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },

  ];




  const handleAddClick = async () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsAdding(true);
    //setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setAddClickCount(addClickCount + 1);
    setShowAlert(false);
    let updatedCustomDataList, oCustomDataList;

    try {
      const category = "Work Center";
      const userId = username;
      const cookies = parseCookies();
      const site = cookies.site;
      oCustomDataList = await retrieveCustomDataList(site, category, userId); // Assuming retrieve document is an API call or a data fetch function
      updatedCustomDataList = oCustomDataList.map((item, index) => ({
        ...item,
        id: index + 1, // Assign a unique ID
        value: ""
      }));
      // console.log("Custom Data list: ", updatedCustomDataList);
      setCustomDataOnRowSelect(updatedCustomDataList);
      setCustomDataForCreate(updatedCustomDataList);
      // setFilteredData(oItem); // Initialize filtered data
      setPayloadData((prevData) => ({
        ...prevData,
        customDataList: updatedCustomDataList
      }))
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setPayloadData((prevData) => ({
      ...prevData,
      workCenter: "",
      description: "",
      status: "Available",
      trackOee: false,
      routing: "",
      routingVersion: "",
      activityHookList: [],
      workCenterCategory: "Cell",
      defaultParentWorkCenter: "",
      erpWorkCenter: "",
      associationList: [],

    }));
    setShowAlert(false)
  };

  const handleRowSelect = (row: DataRow) => {



    // setShowAlert(false);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);

    const fetchWorkCenterData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const workCenter = row.workCenter as string;

      // try {
      //   const oWorkCenter = await retrieveWorkCenter(site, workCenter); // Fetch the item data
      //   console.log("Retrieved work center: ", oWorkCenter);

      //   if (!oWorkCenter.errorCode) {

      //     setMainSchema(schemaData);

      //     const transformedCustomDataList = oWorkCenter.customDataList?.map((data, index) => ({
      //       ...data,
      //       key: index,
      //       id: uuidv4(),
      //     }));
      //     oWorkCenter.customDataList = transformedCustomDataList;

      //     const transformedActivityHookList = oWorkCenter.activityHookList?.map((data, index) => ({
      //       ...data,
      //       key: index,
      //       id: uuidv4(),
      //     }));
      //     oWorkCenter.activityHookList = transformedActivityHookList;

      //     const transformedAssociationList = oWorkCenter.associationList?.map((data, index) => ({
      //       ...data,
      //       key: index,
      //       id: uuidv4(),
      //     }));
      //     oWorkCenter.associationList = transformedAssociationList;

      //     setSelectedRowData(oWorkCenter);
      //     setRowData(oWorkCenter);
      //     setItemRowData(oWorkCenter);

      //     setPayloadData(oWorkCenter);
      //     // console.log("Schema data changed: ", schemaData);
      //   }
      // } catch (error) {
      //   console.error("Error fetching work center:", error);
      // }

      try {
        const oWorkCenter = await retrieveWorkCenter(site, workCenter);
        console.log("Retrieved work center: ", oWorkCenter);

        if (!oWorkCenter.errorCode) {
          setMainSchema(schemaData);

          let combinedCustomDataList = oWorkCenter.customDataList?.map((data, index) => ({
            ...data,
            key: index,
            id: uuidv4(),
          })) || [];

          try {
            const category = "Work Center";
            const userId = username;
            const oCustomDataList = await retrieveCustomDataList(site, category, userId);

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
                  itemData => itemData.customData === templateData.customData
                );
                if (!isMatching) {
                  combinedCustomDataList.push({
                    ...templateData,
                    key: combinedCustomDataList.length,
                  });
                }
              });
            }
          } catch (error) {
            console.error("Error fetching custom data list:", error);
            // If there's an error, we'll use only the data from the first API
          }

          const transformedActivityHookList = oWorkCenter.activityHookList?.map((data, index) => ({
            ...data,
            key: index,
            id: uuidv4(),
          }));

          const transformedAssociationList = oWorkCenter.associationList?.map((data, index) => ({
            ...data,
            key: index,
            id: uuidv4(),
          }));

          const updatedWorkCenter = {
            ...oWorkCenter,
            customDataList: combinedCustomDataList,
            activityHookList: transformedActivityHookList,
            associationList: transformedAssociationList,
          };

          setSelectedRowData(updatedWorkCenter);
          setRowData(updatedWorkCenter);
          setItemRowData(updatedWorkCenter);
          setPayloadData(updatedWorkCenter);
          // console.log("Schema data changed: ", schemaData);
        }
      } catch (error) {
        console.error("Error fetching work center:", error);
      }
    };

    setTimeout(() => {
      if (showAlert == true && isAdding == true) {
        Modal.confirm({
          title: t('confirm'),
          content: t('rowSelectionMsg'),
          okText: t('ok'),
          cancelText: t('cancel'),
          onOk: async () => {
            // Proceed with the API call if confirmed
            await fetchWorkCenterData();
            setShowAlert(false)
          },
          onCancel() {
            console.log('Action canceled');
          },
        });
      } else {
        // If no data to confirm, proceed with the API call
        fetchWorkCenterData();
      }
    }, 0);
    setIsAdding(true);


  };


  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };


  return (
    <WorkCenterContext.Provider value={{ payloadData, setPayloadData, schemaData, addClickCount, mainSchema, showAlert, setShowAlert }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("workCenterAppTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""}`}>
              <WorkCenterCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
                button={
                  <InstructionModal title="Work Center Maintenance">
                    <UserInstructions />
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("workCenter")} ({filteredData ? filteredData.length : 0})
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
              <WorkCenterBody
                call={call}
                setCall={setCall}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                isAdding={isAdding}
                customDataForCreate={customDataForCreate}
                customDataOnRowSelect={customDataOnRowSelect}
                setFullScreen={setFullScreen}
                username={username}
                setCustomDataOnRowSelect={setCustomDataOnRowSelect}
                addClickCount={addClickCount}
                setAddClick={setAddClick}
                itemRowData={itemRowData}
                fullScreen={fullScreen} setIsAdding={function (): void {
                  throw new Error("Function not implemented.");
                }} setResetValueCall={function (): void {
                  throw new Error("Function not implemented.");
                }} resetValue={false} oCustomDataList={[]} itemData={[]} rowClickCall={0} resetValueCall={0} availableDocuments={[]} assignedDocuments={[]} availableDocumentForCreate={[]} addClick={false} payloadData={undefined} setPayloadData={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </WorkCenterContext.Provider>
  );
};

export default WorkCenterMaintenance;


