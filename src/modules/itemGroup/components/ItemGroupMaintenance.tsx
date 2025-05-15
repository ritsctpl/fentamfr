"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/ItemGroupMaintenance.module.css";
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
import { Modal, notification } from "antd";
import { ItemGroupContext } from "../hooks/itemGroupContext";
import { retrieveItemGroup, retrieveTop50ItemGroup } from "@services/itemGroupServices";
import { retrieveAllItemGroup } from "@services/itemServices";
import ItemGroupMaintenanceBody from "./ItemGroupMaintenanceBody";
import ItemGroupCommonBar from "./ItemGroupCommonBar";
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "./userInstructions";

interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}


const ItemGroupMaintenance: React.FC = () => {
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
  const [mainSchema, setMainSchema] = useState<any>();
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [payloadData, setPayloadData] = useState<any>();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);


  useEffect(() => {
    const fetchItemGroupData = async () => {
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
          //debugger;
          let item = await retrieveTop50ItemGroup(site);
          item = item.map(item => ({
            ...item,
            itemGroup: item.itemGroup
          }));
          setTop50Data(item);
          setFilteredData(item); // Initialize filtered data
        } catch (error) {
          console.error("Error fetching top 50 item group:", error);
        }
    }, 1000);

    };

    fetchItemGroupData();
  }, [isAuthenticated, username, call]);




  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = username;
    // debugger
    try {
      // Fetch the item list and wait for it to complete
      const lowercasedTerm = searchTerm.toLowerCase();
      const oAllItem = await retrieveAllItemGroup(site, searchTerm);
      // console.log("reatrieve all", oAllItem)
      // Once the item list is fetched, filter the data
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
      console.error('Error fetching item group on search:', error);
    }
  };

  const { t } = useTranslation();

  let schemaData = [

    {
      type: 'input',
      label: 'itemGroup',
      name: 'itemGroup',
      placeholder: '',
      required: true,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'input',
      label: 'groupDescription',
      name: 'groupDescription',
      placeholder: '',
      required: false,
      width: "70%",
    },
    {
      type: 'number',
      label: 'unitPrice',
      name: 'unitPrice',
      placeholder: '',
      required: false,
      width: "70%",
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
    setActiveTab(0);

    setPayloadData((prevData) => ({
      itemGroup: '',
      groupDescription: '',
      unitPrice: 0,
      groupMemberList: [],
    }));
    setShowAlert(false)
  };

  const handleRowSelect = (row: DataRow) => {
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);
   

    const fetchItemGroupData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const itemGroup = row.itemGroup as string;

      try {
        const oItemGroup = await retrieveItemGroup(site, itemGroup); 
        console.log("Retrieved Item Group: ", oItemGroup);

        if (!oItemGroup.errorCode) {
          setMainSchema(schemaData);
          setSelectedRowData(oItemGroup);
          setRowData(oItemGroup);
          setItemRowData(oItemGroup);
          setPayloadData(oItemGroup);
        }
      } catch (error) {
        console.error("Error fetching item group:", error);
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
          await fetchItemGroupData();
          setShowAlert(false)
        },
        onCancel() {
          // console.log('Action canceled');
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchItemGroupData();
    }
    setIsAdding(true);

  };


  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };


  return (
    <ItemGroupContext.Provider value={{ payloadData, setPayloadData, schemaData, addClickCount, mainSchema, showAlert, setShowAlert, resetValue, activeTab, setActiveTab  }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("itemGroupAppTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <ItemGroupCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
                button={
                  <InstructionModal title="Item Group Maintenance">
                    <UserInstructions />
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("itemGroup")} ({filteredData ? filteredData.length : 0})
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
              <ItemGroupMaintenanceBody
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
    </ItemGroupContext.Provider>
  );
};

export default ItemGroupMaintenance;


