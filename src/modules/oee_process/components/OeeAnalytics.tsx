import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Checkbox, Drawer, Dropdown, Input, Layout, Menu, Modal, Row, Col, Slider, InputNumber, ConfigProvider, Select, Card, Space } from 'antd';
import img2 from '../../../images/FENTA-LOGO-F.png';
import CommonTabs from './subComponents/CommonTabs';
import { MyProvider, useFilterContext } from '@modules/oee_process/hooks/filterData';
import { useTranslation } from "react-i18next";
import { useAuth } from "@context/AuthContext";
import { SettingsDataProvider } from '../hooks/settingsData';
import LiveOeeWorkcenter from './liveOee/LiveOeeWorkcenter';
import CommonAppBar from '@components/CommonAppBar';
import { parseCookies } from 'nookies';
import { useSearchParams } from 'next/navigation';
import { retrieveActivity } from '@services/oeeServices';



const { Footer, Content } = Layout;

// Create a completely separate TabContent component to avoid re-renders
const TabContent = React.memo(() => {
  return (
    <div style={{ height: 'calc(100vh - 100px - 50px)', overflowY: 'auto' }}>
      <LiveOeeWorkcenter />
    </div>
  );
});

const OeeAnalytics: React.FC = () => {
  
  const [deactive, setDeactive] = useState([]);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [componentIds, setComponentIds] = useState<string[]>([]);
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const [machineToggle, setMachineToggle] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const { setShowToggle} = useFilterContext();
 
  const allActivities = [];
  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
  };


  


  useEffect(() => {
     const fetchActitivty = async () => {
      
        try {
           const cookies = parseCookies();
           const site = cookies?.site;
           const activityIDFromUrl = searchParams.get('activityId');
          //  const activityId = "R_LIVE_DASH_APP";
          //  debugger
           const response = await retrieveActivity(site, activityIDFromUrl);
           if (!response?.errorCode) {
              let activityRule = response?.activityRules;
              activityRule = activityRule.filter(rule => rule?.ruleName?.toLowerCase()?.replaceAll(" ","").includes('machinedata'));
              let rule = activityRule?.[0]?.setting;
              rule = rule?.toLowerCase()?.replaceAll(" ","") == "true";
              setShowToggle(rule);
           }
        } catch (error) {
          console.error('Error retrieveing activity:', error);
        }
     };
     fetchActitivty();
    
  }, []);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    // styleSheet.innerHTML = `.ant-card .ant-card-head {border-bottom: 1px solid #f41d1d}`;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
    const activeTabIndex = sessionStorage.getItem('activeTabIndex');
    if (activeTabIndex?.includes('live oee')) {
      setComponentIds(['live oee']);
    }

  }, []);




  // Use a single LiveOeeWorkcenter instance and memoize it
  const liveOeeWorkcenterComponent = useMemo(() => (
    <div style={{ height: 'calc(100vh - 100px - 50px)', overflowY: 'auto' }}>
      <LiveOeeWorkcenter />
    </div>
  ), []);

  // Define tabData outside the component or memoize it
  const tabData = useMemo(() => {
    // console.log("tab data called")
    const createTab = (tabname: string) => ({
      tabname,
      icon: null,
      component: <TabContent />
    });

    return [
      createTab('Live OEE Resource'),
      createTab('Live OEE Operation'),
      createTab('Live OEE Batch'),
      createTab('Live OEE Workcenter'),
      createTab('Live OEE Shift'),
      createTab('Live OEE Plant'),
      // createTab('Live OEE Machine'),
    ];
  }, []);


  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            headerHeight: 30,
            headerBg: '#006568',
            colorTextHeading: 'white',
            headerHeightSM: 30,
          },
        },
      }}
    >
      <SettingsDataProvider>
        {/* <MyProvider> */}
          <Layout
            style={{ overflow: "hidden", height: "100vh" }}
          >

            <CommonAppBar
              allActivities={allActivities}
              username={username}
              site={site}
              appTitle={`${t("OEE REPORT")}`}
              onSiteChange={handleSiteChange}
              onSearchChange={function (): void { }}
            />


            <Layout style={{ background: "#F2FCFF" }}>

              <Content style={{ color: "#fff" }}>
                <CommonTabs data={tabData} setDeactive={setDeactive} 
                machineToggle={machineToggle} setMachineToggle={setMachineToggle}  />
              </Content>
            </Layout>
            <Footer
              style={{
                zIndex: 1000,
                textAlign: "center",
                height: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={img2.src}
                alt="Fenta Logo"
                style={{ width: "5vw", height: "8vh" }}
              />
              <div style={{ color: "gray", fontSize: "2vh" }}>
                &copy; {new Date().getFullYear()} Fenta Powered by RITS | All
                Rights Reserved
              </div>
            </Footer>

          </Layout>
        {/* </MyProvider> */}
      </SettingsDataProvider>
    </ConfigProvider>
  );
};

export default React.memo(OeeAnalytics);


