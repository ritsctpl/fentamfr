"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/ActivityMaintenance.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';

import {
  encodeSpec,
  fetchTop50Specs,
  retrieveAllSpec,
  retrieveSpec,

} from "@services/joltSpecService";
import { Modal } from "antd";

import ActivityCommonBar from "./JoltSpecCommonBar";
import { JoltSpecContext } from "../hooks/joltSpecContext";
import ActivityMaintenanceBody from "./JoltSpecMaintenanceBody";
import { parseCookies } from "nookies";



interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}


const JoltSpecMaintenance: React.FC = () => {
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
  const [oReq, setOreq] = useState<any>();
  const [isModalDummyVisible, setIsModalDummyVisible] = useState<any>();

  const [disabledFields, setDisabledFields] = useState<Record<string, boolean>>({
    joltSpec: false,
    xsltSpec: true,
    encodeXsltSpec: true,
    jsonAta: true,
    encodedJsonAtaSpec: true
  });

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
          const item = await fetchTop50Specs(site);
          console.log("Top 50 response: ", item)
          if(!item?.errorCode){
            setTop50Data(item);
            setFilteredData(item); // Initialize filtered data
          }
        } catch (error) {
          console.error("Error fetching data fields:", error);
        }
    }, 1000);

    };

    fetchItemData();
  }, [isAuthenticated, username, call]);





  const handleSearch = async (searchTerm: string) => {

    debugger
    try {
      // Fetch the item list and wait for it to complete
      const lowercasedTerm = searchTerm.toLowerCase();
      const cookies = parseCookies();
      const site = cookies?.site;
      const request = {site: site, specName: searchTerm};
      const oAllItem = await retrieveAllSpec(request);
      console.log("retrieve all", oAllItem)
      // Once the item list is fetched, filter the data
      let filtered;

      if (lowercasedTerm) {
        // filtered = oAllItem.filter(row =>
        //   Object.values(row).some(value =>
        //     String(value).toLowerCase().includes(lowercasedTerm)
        //   )
        // );
        if(!oAllItem?.errorCode)
          filtered = oAllItem;
      } else {
        filtered = top50Data; // If no search term, show all items
      }

      // Update the filtered data state
      setFilteredData(filtered);

      // console.log("Filtered items: ", filtered);
    } catch (error) {
      console.error('Error fetching spec on search:', error);
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


    setPayloadData((prevData) => ({
      joltSpec: '',
      xsltSpec: null,
      encodeXsltSpec: '',
      jsonataSpec: '',
      encodedJsonataSpec: '',
      type: "JOLT",
      specName: '',
      description: '',
    }));

    const newDisabledState = {
      joltSpec: false,
      xsltSpec: true,
      encodeXsltSpec: true,
      jsonataSpec: true,
      encodedJsonAtaSpec: true
    };


    setDisabledFields(newDisabledState);
    setShowAlert(false);
  };

  const handleRowSelect = (row: DataRow) => {
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);

    const fetchSpec = async () => {
      try {
        let oSpec, oJoltSpec, oXsltSpec, oJosnAtaSpec;
        const specName = row.specName;
        const cookies = parseCookies(); 
        const site = cookies?.site;
          oSpec = await retrieveSpec({site, specName}); 

        console.log("Retrieved spec: ", oSpec);
        debugger
        if (oSpec.type == "JOLT") {
          oJoltSpec = oSpec.joltSpec;
          // oJoltSpec = oJoltSpec.toString();
          oJoltSpec = JSON.stringify(oJoltSpec);
          oSpec.joltSpec = oJoltSpec;
        }

        else if (oSpec.type == "XSLT") {
          try {
            oXsltSpec = oSpec.xsltSpec;
            const encodeXsltResponse = await encodeSpec(oXsltSpec);
            oSpec.encodeXsltSpec = encodeXsltResponse;
          } catch (error) {
            console.error("Error encoding XSLT spec:", error);
          }
        } 
        
        else if (oSpec.type == "JSONATA") {
          try {
            oJosnAtaSpec = oSpec.jsonataSpec;
            const encodeJsonAtaResponse = await encodeSpec(oJosnAtaSpec);
            oSpec.encodedJsonAtaSpec = encodeJsonAtaResponse;
          } catch (error) {
            console.error("Error encoding JSONata spec:", error);
          }
        }

        // setPayloadData(oSpec);
        if (!oSpec.errorCode) {
          setSelectedRowData(oSpec);
          setRowData(oSpec);
          setItemRowData(oSpec);
          setPayloadData(oSpec);

          const newDisabledState = {
            joltSpec: true,
            xsltSpec: true,
            encodeXsltSpec: true,
            jsonataSpec: true,
            encodedJsonAtaSpec: true
          };

          // Enable relevant fields based on type
          const type = row.type;
          switch (type) {
            case 'JOLT':
              newDisabledState.joltSpec = false;
              break;
            case 'XSLT':
              newDisabledState.xsltSpec = false;
              newDisabledState.encodeXsltSpec = false;
              break;
            case 'JSONATA':
              newDisabledState.jsonataSpec = false;
              newDisabledState.encodedJsonAtaSpec = false;
              break;
          }

          setDisabledFields(newDisabledState);

        }
      } catch (error) {
        console.error("Error fetching spec:", error);
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
          await fetchSpec();
          setShowAlert(false)
        },
        onCancel() {
          console.log('Action canceled');
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchSpec();
    }
    setIsAdding(true);

  };


  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };


  return (
    <JoltSpecContext.Provider value={{
      payloadData, setPayloadData, addClickCount, mainSchema, showAlert, setShowAlert,
      isModalDummyVisible, setIsModalDummyVisible, oReq, setOreq, disabledFields, setDisabledFields
    }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("joltAppTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <ActivityCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("spec")} ({filteredData ? filteredData.length : 0})
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
              <ActivityMaintenanceBody
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
    </JoltSpecContext.Provider>
  );
};

export default JoltSpecMaintenance;


