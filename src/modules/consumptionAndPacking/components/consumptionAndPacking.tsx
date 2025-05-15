"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/ConsumptionAndPackingBody.module.css";

import { useAuth } from "@/context/AuthContext";
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';
import headLogo from '../images/headerLogo.jpeg';
import footerLogo from '../images/footerLogo.png';
import { LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';


import { Modal, Select, Spin, notification } from "antd";

import ConsumptionAndPackingBody from "./MainPage";



interface DecodedToken {
  preferred_username: string;
}


const { Option } = Select;
// const { i18n, t } = useTranslation();
const headerStyle: React.CSSProperties = {
  backgroundColor: '#fff11',
  color: 'white',
  padding: '10px',
  textAlign: 'center',

};

const footerStyle: React.CSSProperties = {
  backgroundColor: '#282c34',
  color: 'white',
  padding: '10px',
  textAlign: 'center',
  width: '100%',
  position: "fixed",
  bottom: 0
};

const logoStyle = {
  marginRight: '10px',
};



const ConsumptionAndPacking: React.FC = () => {
  const { isAuthenticated, token ,logout} = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust time as needed
    return () => clearTimeout(timer);
  }, []);

  


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

      

     
    };

    fetchWCData();
  }, [isAuthenticated, username, call]);
  Spin
  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };
  const handleLogoClick = () => {
    router.push('/');
  };
  // if (loading) {
  //   return (
  //     <div style={{ textAlign: 'center', marginTop: '20%' }}>
  //       <Spin size="large" style={{ color: '#BFA061' }} />
  //     </div>
  //   );

  // }

  return (
    // <WorkCenterContext.Provider value={{ payloadData, setPayloadData, }}>
    <div className={styles.container}>
      <div className={styles.dataFieldNav}>
        {/* <CommonAppBar
          // onSearchChange={() => { }}
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("consumptionAndPackingAppTitle")} onSiteChange={function (newSite: string): void {
            throw new Error("Function not implemented.");
          } } onSearchChange={function (): void {
            throw new Error("Function not implemented.");
          } } /> */}
        <div className={styles.pickListHeading}>
          {/* <Image src={image} alt="RITS Logo" style={logoStyle} width={70} height={70} /> */}
          <img src={headLogo.src} alt="RITS Logo" className={styles.logo} onClick={handleLogoClick}/>
          <h2>{t('consumptionAndPackingAppTitle')}</h2>
          <div className={styles.logOutSection}>
            <Select defaultValue='en' style={{ width: 120 }} onChange={changeLanguage}>
              <Option value="en">English</Option>
              <Option value="ka">ಕನ್ನಡ</Option>
              <Option value="ta">தமிழ்</Option>
              <Option value="hi">हिंदी</Option>
            </Select>
            <span style={{ marginLeft: '20px' }}>RITS  |</span>
            {/* <span>  LOGOUT</span> */}
            <span style={{ marginRight: '20px', marginLeft: '3px' }}>  <LogoutOutlined onClick={logout}/> </span>
          </div>
        </div>
      </div>
      <div >
        <div >
          <ConsumptionAndPackingBody />


        </div>
      </div>
      <div className={styles.footer}>

        <img src={footerLogo.src} alt="Fenta Logo" style={{ width: '95px', height: '55px' }} />

        {/* <div style={{ color: 'gray' }}>© YYYY Fenta Powered by Rits | All Rights Reserved</div> */}
        <div style={{ color: 'gray' }}>&copy; {new Date().getFullYear()} Fenta Powered by Rits | All Rights Reserved</div>

      </div>
    </div>
    // </WorkCenterContext.Provider>
  );
};

export default ConsumptionAndPacking;


