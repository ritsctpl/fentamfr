"use client";

import React, { useEffect, useState } from "react";
import { Layout, Spin, Switch } from "antd";
import Navigation from "./components/Navigation";
import WorkcenterTitle from "./components/WorkcenterTitle";
import { Footer } from "antd/es/layout/layout";
import FentaLogo from "../../images/fenta_logo.png";
import OeePlantHeader from "./components/OeePlantHeader";
import NoDataScreen from "./components/NoData";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import ChatbotButton from "./components/ChatbotButton";
const { Header, Content } = Layout;
import { parseCookies } from "nookies";
import CommonAppBar from "@components/CommonAppBar";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useAuth } from "@context/AuthContext";
import { RobotOutlined, MessageOutlined } from "@ant-design/icons";
import { retrieveActivity } from "@services/activityService";

interface DecodedToken {
  preferred_username: string;
}

function OeeManagementReportMain() {
  const cookies = parseCookies();
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("main");
  const [headerData, setHeaderData] = useState([]);
  const [workcenterData, setWorkcenterData] = useState([]);
  const [selectedWorkcenter, setSelectedWorkcenter] = useState([]);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const [machineToggle, setMachineToggle] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && token) {
        try {
          setIsLoading(true);
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      const payload = machineToggle
      ? { site: cookies.site, eventSource: "machine" }
      : { site: cookies.site, eventSource: "manual" };
      try {
        setIsLoading(true);
        const [plantResponse, workcenterResponse] = await Promise.all([
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "getoeeplantdata"
          ),
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "getworkcenter"
          ),
        ]);

        setHeaderData(plantResponse?.data?.data || []);
        setWorkcenterData(workcenterResponse?.data?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHeaderData([]);
        setWorkcenterData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, username, token, cookies.site,machineToggle]);
  useEffect(() => {
    const fetchActivityId = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const machineParam = urlParams.get('ActivityId')?.replace(/['"]/g, '');
      console.log(machineParam , "machineParam");
      try {
          const payload = {
            site: cookies.site,
            activityId: machineParam,
            currentSite: cookies.site,
          };
          const activityId = await retrieveActivity(payload.site, payload.activityId, payload.currentSite);
          console.log(activityId?.activityRules[0]?.setting, "activityId");
          const machineRule = activityId?.activityRules?.find(
            (rule: { ruleName: string; }) => rule?.ruleName?.toLowerCase() === "machinedata"
          );
          
          if (machineRule?.setting?.toLowerCase() === 'true') {
            setShowToggle(true);
            setMachineToggle(true);
          } else {
            setShowToggle(false);
            setMachineToggle(false);
          }
      } catch (error) {
        console.error("Error retrieving activity:", error);
      }
    }
    fetchActivityId();
  }, [cookies.site]);

  const handleTileClick = async (machineItem: any) => {
    setSelectedMachine(machineItem);
    setCurrentScreen("navigation");
  };

  const handleNavigateBack = () => {
    if (currentScreen === "navigation") {
      setCurrentScreen("main");
    }
  };

  const handleNavigateToDays = () => {
    setCurrentScreen("days");
  };

  const handleNavigateToHome = () => {
    setCurrentScreen("main");
  };

  return (
    <Layout
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CommonAppBar
        onSearchChange={() => {}}
        allActivities={[]}
        username={username}
        site={null}
        appTitle={"OEE Management Dashboard"}
        onSiteChange={() => {}}
      />
      {headerData.length > 0 && <OeePlantHeader plantData={headerData} />}
      <Content
        style={{
          background: "#fff",
          flex: 1,
          overflow: "auto",
          position: "relative",
          height: "calc(100vh - 120px)",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <Spin size="large" />
          </div>
        )}
        <div style={{ opacity: isLoading ? 0.5 : 1 }}>
          {workcenterData.length > 0 ? (
            currentScreen === "main" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                  padding: "15px",
                  minHeight: "100%",
                }}
              >
                {workcenterData.map((machineItem, index) => (
                  <div
                    key={index}
                    onClick={() => handleTileClick(machineItem)}
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                      transform:
                        machineItem.oee < 60 ? "scale(1.05)" : "scale(1)",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform =
                        machineItem.oee < 60 ? "scale(1.05)" : "scale(1)")
                    }
                  >
                    <WorkcenterTitle
                      data={[machineItem]}
                      titleType={"Workcenter"}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
              }}
            >
              {" "}
              <NoDataScreen />
            </div>
          )}
          {currentScreen === "navigation" && (
            <Navigation
              selectedMachine={selectedMachine}
              selectedWorkcenter={selectedWorkcenter}
              onBack={handleNavigateBack}
              onDays={handleNavigateToDays}
              onHome={handleNavigateToHome}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              machineToggle={machineToggle?"machine":"manual"}
            />
          )}
        </div>
      </Content>
      <ChatbotButton />
      <Footer
        style={{
          zIndex: 1000,
          textAlign: "center",
          height: "30px",
          display: "flex",
          alignItems: "center",
          background: "#f0f2f5",
          padding: "12px 24px",
          borderTop: "1px solid #e0e0e0",
          position: "relative", // Added for absolute positioning of switch
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={FentaLogo.src}
            alt="Fenta Logo"
            style={{ height: "50px", marginRight: "10px" }}
          />
          <div style={{ color: "#555", fontSize: "12px" }}>
            &copy; {new Date().getFullYear()} Fenta Powered by RITS | All Rights
            Reserved
          </div>
        </div>
        {showToggle && <div
          style={{
            position: "absolute",
            right: "24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: "8px", fontSize: "12px", color: "#555",fontWeight: "bold" }}>
            Machine Data : 
          </span>
          <Switch
            checked={machineToggle}
            onChange={(checked) => setMachineToggle(checked)}
            style={{
              backgroundColor: machineToggle ? "var(--button-color)" : "grey",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
        </div>}
      </Footer>
    </Layout>
  );
}

export default OeeManagementReportMain;
