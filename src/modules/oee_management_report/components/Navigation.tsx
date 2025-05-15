import React, { useState, useEffect } from "react";
import { ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { Card, Col, Row, Spin } from "antd";
import Days from "./days";
import ResourceScreen from "./Resource";
import Shift from "./shift";
import ShiftDetails from "./shiftdetails";
import { parseCookies } from "nookies";
import "./style.css";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import NoDataScreen from "./NoData";

// API functions and type definitions
interface FetchPayload {
  site: string;
  workcenter?: string;
  resource?: string;
  duration?: string;
  eventSource?: string;
}

interface ResourceData {
  resource: string;
}

interface ShiftData {
  shift: string;
}

const formatDateWithFixedTime = (date: {
  getFullYear: () => any;
  getMonth: () => number;
  getDate: () => any;
}) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T06:00:00`;
};

const fetchShiftByResource = async (
  site: string,
  resource: string,
  workcenter: string,
  eventSource: string,
  selectedShift: any
): Promise<ShiftData[]> => {
  const payloadData = {
    site: site,
    shift: selectedShift,
    workcenter: workcenter,
    resource: resource,
    eventSource: eventSource,
  };
  console.log(payloadData);
  try {
    const response = await fetchEndpointsData(
      payloadData,
      "oee-service/apiregistry",
      "getShiftTimeIntervel"
    );

    if (
      !response ||
      response.errorCode ||
      response.message?.includes("java.lang.IllegalArgumentException")
    ) {
      return [];
    }
    console.log(response);
    return response?.data?.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

function Navigation({
  selectedMachine,
  onBack,
  onDays,
  onHome,
  selectedWorkcenter,
  isLoading,
  setIsLoading,
  machineToggle,
}) {
  const cookies = parseCookies();
  const [currentLevel, setCurrentLevel] = useState("days");
  const [animationClass, setAnimationClass] = useState("fade-in");
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [selectDay, setSelectDay] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [selectedResource, setSelectedResource] = useState([]);
  // const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [shiftData, setShiftData] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [currentShift, setCurrentShift] = useState(null);

  const changeScreen = (
    level: React.SetStateAction<string>,
    isBack = false,
    data = null
  ) => {
    setIsGoingBack(isBack);
    setAnimationClass(isBack ? "fade-out-reverse" : "fade-out");
    setTimeout(() => {
      setCurrentLevel(level);
      if (data) {
        setSelectedResource(data);
        console.log(data);
        // setTitle((prevTitle) => {
        //   const newTitle = `${prevTitle} -> ${data.resource_id}`;
        //   return newTitle;
        // });
      }
      setAnimationClass(isBack ? "fade-in-reverse" : "fade-in");
    }, 300);
  };

  useEffect(() => {
    if (selectedMachine?.workcenter_id) {
      // setTitle(selectedMachine.workcenter_id);
    }
  }, [selectedMachine]);

  const handleGraphClick = async (x: any) => {
    try {
      const shiftData = await fetchEndpointsData(
        {
          site: cookies.site,
          workcenter: x?.workcenter_id,
          eventSource: machineToggle,
        },
        "oee-service/apiregistry",
        "getcurrentshift"
      );
      const resourceData = await fetchEndpointsData(
        {
          site: cookies.site,
          workcenter: x?.workcenter_id,
          eventSource: machineToggle,
        },
        "oee-service/apiregistry",
        "getResourceByDuration"
      );
      setCurrentShift(shiftData?.data?.data || []);
      setResourceData(resourceData?.data?.data || []);
      changeScreen("resource", false);
    } catch (error) {
      setCurrentShift([]);
      setResourceData([]);
      console.log(error);
    }
  };

  const ResourceClick = async (resourceItem: any) => {
    console.log(currentShift);
    try {
      const response = await fetchShiftByResource(
        cookies.site,
        resourceItem?.resource_id,
        selectedMachine?.workcenter_id,
        machineToggle,
        currentShift[0]?.shift_id
      );
      setShiftData(response);
    } catch (error) {
      console.log(error);
      setShiftData([]);
    }
  };

  const handleBackNavigation = () => {
    if (currentLevel === "shiftdetails") {
      // setTitle((prevTitle) =>
      //   prevTitle.split(" -> ").slice(0, -1).join(" -> ")
      // );
      changeScreen("shift", true);
    } else if (currentLevel === "shift") {
      // setTitle((prevTitle) =>
      //   prevTitle.split(" -> ").slice(0, -1).join(" -> ")
      // );
      changeScreen("resource", true);
    } else if (currentLevel === "resource") {
      // setTitle((prevTitle) =>
      //   prevTitle.split(" -> ").slice(0, -1).join(" -> ")
      // );
      changeScreen("days", true);
    } else {
      onBack();
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 160px)",
        width: "100%",
        display: "flex",
      }}
    >
      <Card
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          flex: 1,
          width: "100%",
        }}
        bodyStyle={{
          padding: 15,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "auto",
        }}
        headStyle={{
          minHeight: "10px",
        }}
        // title={
        //   <div style={{ display: "flex", alignItems: "center" }}>
        //     {title.split(" -> ").map((segment, index, array) => (
        //       <React.Fragment key={index}>
        //         <span
        //           style={{
        //             fontSize: array.length > 1 ? "14px" : "16px",
        //             fontWeight: index === array.length - 1 ? 600 : 400,
        //             color: index === array.length - 1 ? "#1890ff" : "#666",
        //             cursor: index < array.length - 1 ? "pointer" : "default",
        //             transition: "all 0.3s ease",
        //           }}
        //           onClick={() => {
        //             if (index < array.length - 1) {
        //               // Navigate to the clicked level
        //               if (index === 0) {
        //                 // First level (workcenter)
        //                 // setTitle(segment);
        //                 changeScreen("days", true);
        //               } else if (index === 1) {
        //                 // Second level (day)
        //                 // setTitle(`${array[0]} -> ${segment}`);
        //                 changeScreen("resource", true);
        //               } else if (index === 2) {
        //                 // Third level (resource)
        //                 // setTitle(`${array[0]} -> ${array[1]} -> ${segment}`);
        //                 changeScreen("shift", true);
        //               }
        //               // Add more conditions if you have more levels
        //             }
        //           }}
        //         >
        //           {segment}
        //         </span>
        //         {index < array.length - 1 && (
        //           <span
        //             style={{
        //               margin: "0 8px",
        //               color: "#999",
        //               fontSize: "12px",
        //             }}
        //           >
        //             →
        //           </span>
        //         )}
        //       </React.Fragment>
        //     ))}
        //   </div>
        // }
        extra={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {currentLevel !== "days" && (
              <span
                onClick={handleBackNavigation}
                style={{
                  fontSize: "14px",
                  cursor: "pointer",
                  marginRight: "15px",
                  display: "flex",
                  alignItems: "center",
                  color: "#1890ff",
                  transition: "color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#40a9ff")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#1890ff")}
              >
                <ArrowLeftOutlined style={{ marginRight: "6px" }} />
                {currentLevel === "shiftdetails"
                  ? "Shift"
                  : currentLevel === "shift"
                  ? "Resource"
                  : currentLevel === "days"
                  ? "Home"
                  : "Days"}
              </span>
            )}
            <span
              onClick={onHome}
              style={{
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#1890ff",
                transition: "color 0.3s",
                borderRadius: "4px",
                padding: "4px 8px",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#40a9ff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#1890ff")}
            >
              <HomeOutlined style={{ marginRight: "6px" }} /> Home
            </span>
          </div>
        }
      >
        <div
          style={{
            flex: 1,
            height: "100%",
            overflow: "auto",
            position: "relative",
          }}
        >
          {isLoading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1000,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "20px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Spin size="large" />
              <span style={{ color: "#1890ff" }}>Loading...</span>
            </div>
          )}
          <div
            style={{ opacity: isLoading ? 0.5 : 1 }}
            className={animationClass}
          >
            {currentLevel === "days" && (
              <Days
                selectedMachine={selectedMachine}
                selectedWorkcenter={selectedWorkcenter}
                onGraphClick={(x) => handleGraphClick(x)}
                machineToggle={machineToggle}
              />
            )}
            {currentLevel === "resource" &&
              (resourceData?.length > 0 ? (
                <ResourceScreen
                  currentShift={currentShift}
                  resourceData={resourceData}
                  onShiftClick={(machineItem: any) => {
                    setIsLoading(true);
                    ResourceClick(machineItem);
                    setTimeout(() => {
                      changeScreen("shift", false, machineItem);
                      setIsLoading(false);
                    }, 500);
                  }}
                />
              ) : (
                <NoDataScreen
                  message="No Resource Data Available"
                  subMessage="There is no resource data available for the selected day"
                />
              ))}

            {currentLevel === "shift" &&
              (shiftData?.length ? (
                <Shift
                  currentShift={currentShift[0].shift_id}
                  selectedMachine={selectedMachine}
                  shiftData={shiftData}
                  selectedResource={selectedResource}
                  onBarClick={(x: any, y: any) => {
                    console.log(x, y + "shift");
                    setIsLoading(true);
                    const selectedShiftData = shiftData.find(
                      (shift) => shift.shift_id === x
                    );
                    console.log("Selected Shift Data:", selectedShiftData);
                    setSelectedShift(selectedShiftData);

                    setTimeout(() => {
                      // setTitle((prevTitle) => `${prevTitle} -> ${x}`);
                      changeScreen("shiftdetails", false);
                      setIsLoading(false);
                    }, 500);
                  }}
                />
              ) : (
                <NoDataScreen
                  message="No Shift Data Available"
                  subMessage="There is no shift data available for the selected resource"
                />
              ))}

            {currentLevel === "shiftdetails" &&
              (selectedShift ? (
                <ShiftDetails
                  duration={duration}
                  selectedShift={[selectedShift]}
                  selectedWorkcenter={selectedMachine}
                  selectedResource={selectedResource}
                  onShiftClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      changeScreen("shift");
                      setIsLoading(false);
                    }, 500);
                  }}
                />
              ) : (
                <NoDataScreen
                  message="No Shift Details Available"
                  subMessage="There is no detailed data available for the selected shift"
                />
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Navigation;
