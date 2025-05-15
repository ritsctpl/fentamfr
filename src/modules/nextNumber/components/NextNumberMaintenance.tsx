"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/NextNumberMaintenance.module.css";

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

import NextNumberCommonBar from "./NextNumberCommonBar";
import { NextNumberContext } from "../hooks/nextNumberContext";
import NextNumberForm from "./NextNumberForm";


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





const NextNumberMaintenance: React.FC = () => {
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
  const [mainSchema, setMainSchema] = useState();
  const [customDataForCreate, setCustomDataForCreate] = useState<
    CustomDataRow[]
  >([]);


  const [customDataOnRowSelect, setCustomDataOnRowSelect] = useState<
    any[]
  >([]);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);

  const [payloadData, setPayloadData] = useState<any>();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>();

  const { t } = useTranslation();


  const router = useRouter();
  let oCustomDataList;

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

      const cookies = parseCookies();
      const site = cookies.site;


    };

    fetchWCData();
  }, [isAuthenticated, username, call]);




  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  const handleClear = () => {

  }


  return (
    <NextNumberContext.Provider value={{
      formData, setFormData, resetForm, setResetForm, payloadData, setPayloadData,
      username, addClickCount, mainSchema, showAlert, setShowAlert
    }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("nextNumberAppTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />

        </div>

        <div
        // className={styles.dataFieldBodyContentsBottom}
        >

          <NextNumberCommonBar
            setFilteredData={setFilteredData}
            onSearch={function (searchTerm: string): void {
              throw new Error("Function not implemented.");
            }}
          />


          <div className={styles.dataFieldBodyContentsTop} style={{maxHeight: 'calc(100vh - 175px)'}}>
            
            <NextNumberForm

              onChange={function (values: Record<string, any>): void {
                throw new Error("Function not implemented.");
              }}
              setNewData={function (values: Record<string, any>): void {
                throw new Error("Function not implemented.");
              }}
              onValuesChange={function (values: Record<string, any>): void {
                throw new Error("Function not implemented.");
              }} />
          </div>

        </div>



      </div>
    </NextNumberContext.Provider>
  );
};

export default NextNumberMaintenance;


