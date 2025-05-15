'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/item/styles/ItemMaintenance.module.css';
import ItemCommonBar from '@modules/item/components/ItemCommonBar';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CommonTable from '@modules/item/components/CommonTable';
import { parseCookies } from 'nookies';
import ItemMaintenanceBody from '@modules/item/components/ItemBodyContent';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';
import { fetchTop50, retrieveItem, retrieveCustomDataList, retrieveAvailableDocumentList, retrieveAllItem } from '@services/itemServices';
import { Modal, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { ItemContext } from '@modules/item/hooks/itemContext';

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

interface DocumentRow {
  document: string;
}

const ItemMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [itemData, setItemData] = useState<DataRow[]>([]);
  const [itemRowData, setItemRowData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [resetValueCall, setResetValueCall] = useState<number>(0);
  const [rowClickCall, setRowClickCall] = useState<number>(0);
  const [customDataForCreate, setCustomDataForCreate] = useState<CustomDataRow[]>([]);
  const [availableDocumentForCreate, setAvailableDocumentForCreate] = useState<DocumentRow[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
  const [assignedDocuments, setAssignedDocuments] = useState<Document[]>([]);
  const [customDataOnRowSelect, setCustomDataOnRowSelect] = useState<Document[]>([]);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [formModifiedData, setFormModifiedData] = useState<Document[]>([]);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [payloadData, setPayloadData] = useState<any>();
  const [showAlert, setShowAlert] = useState<boolean>(false);

  let oDocumentList, oCustomDataList;

  useEffect(() => {
    const fetchItemData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    
      setTimeout(async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        console.log("SIte changed: ", site)
        try {
          const item = await fetchTop50(site);
          setItemData(item);
          setFilteredData(item);
        } catch (error) {
          console.error('Error fetching top 50 items:', error);
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
      debugger
      const oAllItem = await retrieveAllItem(site, searchTerm);
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = oAllItem.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = itemData;
      }
      setFilteredData(filtered);
    } catch (error) {
      console.error('Error searching item:', error);
    }
  };

  const handleAddClick = () => {
    setResetValue(true);
    setSelectedRowData(null);
    setIsAdding(true);
    setAddClickCount(addClickCount + 1);
    setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setAddClick(true);
    setShowAlert(false)
    let updatedCustomDataList, updatedAvailableDocumentList;

    const fetchDocumentList = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        oDocumentList = await retrieveAvailableDocumentList(site, "", "");
        setAvailableDocumentForCreate(oDocumentList);
        updatedAvailableDocumentList = oDocumentList?.map((item, index) => ({
          ...item,
          id: index,
          key: index,
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      try {
        const category = "Material";
        const userId = username;
        oCustomDataList = await retrieveCustomDataList(site, category, userId);
        updatedCustomDataList = oCustomDataList?.map((item, index) => ({
          ...item,
          id: index + 1,
          value: ""
        }));
        setCustomDataOnRowSelect(updatedCustomDataList);
        setCustomDataForCreate(updatedCustomDataList);
        setPayloadData((prevData) => ({
          ...prevData,
          customDataList: updatedCustomDataList
        }))
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDocumentList();
    setTimeout(() => {
      setPayloadData((prevData) => ({
        ...prevData,
        item: "",
        revision: "",
        description: "",
        itemGroup: "",
        status: "New",
        procurementType: "Manufactured",
        currentVersion: true,
        itemType: "Manufactured",
        lotSize: 1,
        routing: "",
        routingVersion: "",
        bom: "",
        bomVersion: "",
        assemblyDataType: "",
        removalDataType: "",
        receiptDataType: "",
        printAvailableDocuments: updatedAvailableDocumentList,
        printDocuments: [],
        availableDocuments: [],
        customDataList: updatedCustomDataList,
        alternateComponentList: []
      }));
    }, 500);

  };



  const handleRowSelect = async (row: DataRow) => {
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);

    const item = row.item as string;
    const revision = row.revision as string;

    const fetchItemData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      // try {
      //   const oItem = await retrieveItem(site, item, revision);
      //   console.log("Retrieved item: ", oItem);

      //   const transformedCustomDataList = oItem.customDataList.map((data, index) => ({
      //     ...data,
      //     key: index,
      //     id: uuidv4(),
      //   }));

      //   const transformedAlternateComponentList = oItem.alternateComponentList.map((data, index) => ({
      //     ...data,
      //     key: index,
      //     id: uuidv4(),
      //   }));

      //   setSelectedRowData(oItem);
      //   setCustomDataOnRowSelect(transformedCustomDataList);
      //   setItemRowData(oItem);
      //   oItem.customDataList = transformedCustomDataList;
      //   oItem.alternateComponentList = transformedAlternateComponentList;
      //   setPayloadData(oItem);
      // } catch (error) {
      //   console.error('Error fetching data fields:', error);
      // }

      try {
        let oItem = await retrieveItem(site, item, revision);
        console.log("Retrieved item: ", oItem);
        if (oItem.customDataList == null) {
          oItem.customDataList = [];
        }

        if (!oItem.errorCode) {
          const transformedCustomDataList = oItem?.customDataList?.map(data => ({
            ...data,
            key: uuidv4(),
            id: uuidv4(),
          }));

          const transformedAlternateComponentList = oItem?.alternateComponentList?.map(data => ({
            ...data,
            key: uuidv4(),
            id: uuidv4(),
          }));

          let combinedCustomDataList = [...transformedCustomDataList];

          try {
            const category = "Material"; // Changed from "Reason Code" to "Material"
            const userId = username;
            oCustomDataList = await retrieveCustomDataList(site, category, userId);

            if (!oCustomDataList.errorCode) {
              const transformedCustomDataTemplate = oCustomDataList?.map(data => ({
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
                  combinedCustomDataList.push(templateData);
                }
              });
            }
          } catch (error) {
            console.error("Error fetching custom data list:", error);
            // If there's an error, we'll use only the data from the first API
          }
          if(oItem?.customDataList){
            oItem.customDataList = combinedCustomDataList;
          }
          // console.log("Combined Custom Data list: ", combinedCustomDataList);

          setSelectedRowData({
            ...oItem,
            customDataList: combinedCustomDataList,
            alternateComponentList: transformedAlternateComponentList
          });
          setCustomDataOnRowSelect(combinedCustomDataList);
          setItemRowData(oItem);
          setPayloadData({
            ...oItem,
            customDataList: combinedCustomDataList,
            alternateComponentList: transformedAlternateComponentList
          });
        }

        // ... existing code ...

        const transformedCustomDataList = oItem?.customDataList
          ? oItem.customDataList.map((data, index) => ({
            ...data,
            key: index,
            id: uuidv4(),
          }))
          : [];

        // ... existing code ...

        const transformedAlternateComponentList = oItem?.alternateComponentList?.map((data, index) => ({
          ...data,
          key: index,
          id: uuidv4(),
        }));

        setSelectedRowData(oItem);
        setCustomDataOnRowSelect(transformedCustomDataList);
        setItemRowData(oItem);
        oItem.customDataList = transformedCustomDataList || [];
        oItem.alternateComponentList = transformedAlternateComponentList;
        setPayloadData(oItem);

      } catch (error) {
        console.error('Error fetching item data:', error);
      }
    };

    const fetchDocuments = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      // debugger
      try {
        const response = await retrieveAvailableDocumentList(site, item, revision);
        const available = response || [];
        const assigned = selectedRowData?.printDocuments || [];

        const availableWithKeys = available?.map((doc: any) => ({
          document: doc.document,
          key: uuidv4(),
          id: uuidv4()
        }));

        const assignedWithKeys = assigned?.map((doc: any) => ({
          document: doc.document,
          key: uuidv4(),
          id: uuidv4()
        }));

        await setAvailableDocuments(availableWithKeys);
        await setAssignedDocuments(assignedWithKeys);


      } catch (error) {
        console.log("There was an error fetching the documents data. Please try again later.");
      }
    };

    if (showAlert == true && isAdding == true) {
      Modal.confirm({
        title: t('confirm'),
        content: t('rowSelectionMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk: async () => {
          await fetchItemData();
          await fetchDocuments();
          setShowAlert(false);
        },
        onCancel() { },
      });
    } else {
      await fetchItemData();
      await fetchDocuments();
    }
    setIsAdding(true);
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  const { t } = useTranslation();

  return (
    <ItemContext.Provider value={{ payloadData, setPayloadData, showAlert, setShowAlert, username }}>

      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("appTitle")} onSiteChange={function (newSite: string): void { setCall(call + 1) }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <ItemCommonBar onSearch={handleSearch} setFilteredData={setFilteredData} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("item")} ({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
            </div>
            <div className={`${styles.formContainer} ${isAdding ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}` : ''}`}>

              <ItemMaintenanceBody call={call} setCall={setCall} resetValueCall={resetValueCall} onClose={handleClose}
                selectedRowData={selectedRowData} resetValue={resetValue} oCustomDataList={oCustomDataList} documentList={oDocumentList}
                isAdding={isAdding} customDataForCreate={customDataForCreate} itemData={itemData}
                availableDocuments={availableDocuments} assignedDocuments={assignedDocuments}
                customDataOnRowSelect={customDataOnRowSelect} availableDocumentForCreate={availableDocumentForCreate}
                itemRowData={itemRowData} rowClickCall={rowClickCall} setFullScreen={setFullScreen} setItemRowData={setItemRowData}
                setCustomDataOnRowSelect={setCustomDataOnRowSelect} setFormModifiedData={setFormModifiedData} addClick={addClick} setAddClick={setAddClick}
                addClickCount={addClickCount} fullScreen={fullScreen} setIsAdding={function (boolean: any): void {
                  throw new Error('Function not implemented.');
                }} setResetValueCall={function (): void {
                  throw new Error('Function not implemented.');
                }} payloadData={undefined} setPayloadData={function (): void {
                  throw new Error('Function not implemented.');
                }} />

            </div>
          </div>
        </div>
      </div>
    </ItemContext.Provider>
  );
};

export default ItemMaintenance;

