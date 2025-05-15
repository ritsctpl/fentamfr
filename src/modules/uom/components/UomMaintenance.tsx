"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/Uom.module.css";
import { useAuth } from "@/context/AuthContext";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';
import { Modal, notification, Tabs } from "antd"; // Import Tabs from Ant Design
import { UomContext } from "../hooks/UomContext";
import CommonAppBar from "@components/CommonAppBar";
import UomTable from "./UomTable";
import CycleTimeForm from "./CycleTimeForm";
import UomConversion from "./UomConversion";

interface DecodedToken {
  preferred_username: string;
}

const UomMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);
  const [mainSchema, setMainSchema] = useState<any>();
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [payloadData, setPayloadData] = useState<object>({});
  const [uomPayloadData, setUomPayloadData] = useState<object>({});
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [uomConversionPayload, setUomConversionPayload] = useState<any>({baseUnit: 'Kilogram (kg)', convertionItem: 'Multiply',baseAmt: '',conversionUnit: 'Gram (g)', count: 0, material: '', materialVersion: ''});
  const [activeTab, setActiveTab] = useState<number>(0);
  const { t } = useTranslation();
  const activeKey = "1"; // Assuming default active key is '1'
  const [showAlertForConversion, setShowAlertForConversion] = useState<boolean>(false);

  useEffect(() => {
    const fetchWCData = async () => {
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
    };

    fetchWCData();
  }, [isAuthenticated, token]); // Removed username and call as dependencies

  

  // Define items array for Tabs
  const items = [
    // {
    //   key: '1',
    //   label: t('cycleTime'),
    //   children: <CycleTimeForm />,
    // },
    {
      key: '1',
      label: t('uom'),
      children: <UomTable />,
    }, 
    {
      key: '2',
      label: t('conversion'),
      children: <UomConversion />,
    },
  ];

  // Add this new constant for tab bar style
  const tabBarStyle = {
    paddingLeft: '20px', // Adjust this value as needed
  };

  return (
    <UomContext.Provider value={{ payloadData, setPayloadData, addClickCount, mainSchema, showAlert, setShowAlert, username, uomPayloadData, setUomPayloadData
      , uomConversionPayload, setUomConversionPayload, activeTab, setActiveTab, showAlertForConversion, setShowAlertForConversion
     }}>
      <div className={styles.container}>
        <div className={styles.fixedHeader}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("operationalSettingAppTitle")}
            onSiteChange={(newSite: string) => {
              setCall(call + 1);
            }} 
          />
        </div>

        <div  style={{overflowY:'auto', maxHeight:'calc(100vh - 1px)'}}>
          <Tabs defaultActiveKey="1" items={items} tabBarStyle={tabBarStyle} />
        </div>
      </div>
    </UomContext.Provider>
  );
};

export default UomMaintenance;
