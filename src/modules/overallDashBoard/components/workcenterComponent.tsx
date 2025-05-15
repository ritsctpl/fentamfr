"use client";
import React, { useEffect, useState } from "react";
import "../styles/workcenter.css";
import RangeChart from "./RangeChart";
import MachineTile from "./MachineTile";
import NoDataScreen from "./NoData";
import { IoHomeOutline, IoArrowBack } from "react-icons/io5";
import DyanamicMachineCard from "./DyanamicMachineCard";
import { getApiRegistry } from "@services/oeeServices";
import { FiActivity } from "react-icons/fi";
import { BsLayersFill } from "react-icons/bs";
import { AiFillHdd } from "react-icons/ai";
import { parseCookies } from "nookies";
import BarChartPopup from "../graph/Barchart2";
import DonutChart from "../graph/DonutChart";
import { Badge, Card, Col, Row, Spin } from "antd";
import Sliders from "./WhatIf";
import { fetchEndpointsData } from "@services/oeeServicesGraph";

interface WorkcenterComponentProps {
  selectedView?: any;
  onBack?: () => void;
  eventSource?: string;
  workcenterDataRetrive?: any;
  selectedDate?: any;
  shiftBoValue?: any;
}

const WorkcenterComponent: React.FC<WorkcenterComponentProps> = ({
  onBack,
  selectedView,
  eventSource,
  workcenterDataRetrive,
  selectedDate,
  shiftBoValue
}) => {
  console.log(selectedView);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [workCenterData, setWorkcenterData] = useState<any>({});
  const [machineData, setMachineData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [workcenterDataList, setWorkcenterDataList] = useState([]);
  const [selectedWorkcenter, setSelectedWorkcenter] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  // Define colors at component level

  const [rejectedData, setRejectedData] = useState<any>({});
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [showAllTimelines, setShowAllTimelines] = useState(false);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);

  // Update the color mapping in the details section
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const listWorkcenter = workcenterDataRetrive.associationList?.map(
          (item: any) => item.associateId
        );
        const dashboardResponse = await getApiRegistry(
          {
            site: parseCookies().site,
            workcenter_id: selectedWorkcenter,
            eventSource: eventSource,
            date: selectedDate,
            shift: shiftBoValue
          },
          "getLiquidLineDashboard"
        );
        const listWorkcenterData = await getApiRegistry(
          {
            site: parseCookies().site,
            workcenterList: listWorkcenter,
            eventSource: eventSource,
            date: selectedDate,
            shift: shiftBoValue
          },
          "workcenterDataList"
        );
        setWorkcenterDataList(listWorkcenterData?.data || []);
        // IMPORTANT: Set both the selectedWorkcenter and selectedLine here if data exists
        if (listWorkcenterData?.data && listWorkcenterData.data.length > 0) {
          setSelectedWorkcenter(listWorkcenterData.data[0].workcenter_id);
          setSelectedLine(listWorkcenterData.data[0]); // Set selectedLine here
        }

        if (dashboardResponse?.data?.[0]) {
          try {
            // Safe parsing of each data type with null checks
            if (dashboardResponse.data[0].workcenter_data?.value) {
              const workcenterData = JSON.parse(
                dashboardResponse.data[0].workcenter_data.value
              );
              setWorkcenterData(workcenterData || []);
            }

            if (dashboardResponse.data[0].machine_data?.value) {
              setMachineData([]);
              const payload = {
                site: parseCookies().site,
                workCenter: selectedWorkcenter,
                workCenterCategory: "Line",
              };
              try {
                const [workcenterDataRetriveResponse] = await Promise.all([
                  fetchEndpointsData(payload, "workcenter-service", "retrieve").catch(
                    () => ({})
                  ),
                ]);

                const machines = JSON.parse(
                  dashboardResponse.data[0].machine_data.value
                );

                // Get list of machines from associationList
                const associationMachines = workcenterDataRetriveResponse?.associationList || [];
                
                // Create ordered machine data based on associationList
                const orderedMachines = associationMachines.map(association => {
                  // Find matching machine data or create default
                  const machineData = machines.find(m => m.resource_id === association.associateId) || {
                    resource_id: association.associateId,
                    workcenter_id: selectedWorkcenter,
                    oee: 0,
                    actual_time: 0,
                    reject_percentage: 0, 
                    plan: 0,
                    actual: 0,
                    downtime_seconds: 0
                  };
                  return machineData;
                });

                setMachineData(orderedMachines);

              } catch (error) {
                console.error("Error fetching workcenter data:", error);
                setMachineData([]);
              }
            }

            if (dashboardResponse.data[0].timeline_data?.value) {
              const timelineData = JSON.parse(
                dashboardResponse.data[0].timeline_data.value
              );
              setTimelineData(timelineData || []);
            }

            if (dashboardResponse.data[0].performance_data?.value) {
              const performanceData = JSON.parse(
                dashboardResponse.data[0].performance_data.value
              );
              setPerformanceData(performanceData || []);
            }

            // Inside your useEffect where you handle the API response
            if (dashboardResponse.data[0].rejection_data?.value) {
              const rejectionData = JSON.parse(
                dashboardResponse.data[0].rejection_data.value
              );
              setRejectedData(rejectionData || []);
            }
          } catch (e) {
            console.error("Error parsing data:", e);
            // Set default empty arrays for all states
            setWorkcenterData([]);
            setMachineData([]);
            setTimelineData([]);
            setPerformanceData([]);
            setRejectedData([]);
          }
          // finally {
          //   setIsLoading(false);
          // }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMachineData([]);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedView, workcenterDataRetrive]);
  // Separate useEffect for fetching workcenter-specific data
  useEffect(() => {
    const fetchWorkcenterData = async () => {
      // Only fetch if we have a selected workcenter
      if (!selectedWorkcenter) return;
      try {
        setIsLoading(true);
        const dashboardResponse = await getApiRegistry(
          {
            site: parseCookies().site,
            workcenter_id: selectedWorkcenter,
            eventSource: eventSource,
            date: selectedDate,
            shift: shiftBoValue
          },
          "getLiquidLineDashboard"
        );

        if (dashboardResponse?.data?.[0]) {
          try {
            // Safe parsing of each data type with null checks
            if (dashboardResponse.data[0].workcenter_data?.value) {
              const workcenterData = JSON.parse(
                dashboardResponse.data[0].workcenter_data.value
              );
              setWorkcenterData(workcenterData || {});
            }

            if (dashboardResponse.data[0].machine_data?.value) {
              setMachineData([]);
              const payload = {
                site: parseCookies().site,
                workCenter: selectedWorkcenter,
                workCenterCategory: "Line",
              };
              try {
                const [workcenterDataRetriveResponse] = await Promise.all([
                  fetchEndpointsData(payload, "workcenter-service", "retrieve").catch(
                    () => ({})
                  ),
                ]);

                const machines = JSON.parse(
                  dashboardResponse.data[0].machine_data.value
                );

                // Get list of machines from associationList
                const associationMachines = workcenterDataRetriveResponse?.associationList || [];
                
                // Create ordered machine data based on associationList
                const orderedMachines = associationMachines.map(association => {
                  // Find matching machine data or create default
                  const machineData = machines.find(m => m.resource_id === association.associateId) || {
                    resource_id: association.associateId,
                    workcenter_id: selectedWorkcenter,
                    oee: 0,
                    actual_time: 0,
                    reject_percentage: 0, 
                    plan: 0,
                    actual: 0,
                    downtime_seconds: 0
                  };
                  return machineData;
                });

                setMachineData(orderedMachines);

              } catch (error) {
                console.error("Error fetching workcenter data:", error);
                setMachineData([]);
              }
            }
            if (dashboardResponse.data[0].timeline_data?.value) {
              const timelineData = JSON.parse(
                dashboardResponse.data[0].timeline_data.value
              );
              setTimelineData(timelineData || []);
            }

            if (dashboardResponse.data[0].performance_data?.value) {
              const performanceData = JSON.parse(
                dashboardResponse.data[0].performance_data.value
              );
              setPerformanceData(performanceData || []);
            }

            if (dashboardResponse.data[0].rejection_data?.value) {
              const rejectionData = JSON.parse(
                dashboardResponse.data[0].rejection_data.value
              );
              setRejectedData(rejectionData || {});
            }
          } catch (e) {
            console.error("Error parsing data:", e);
            // Set default empty arrays/objects for all states
            setWorkcenterData({});
            setMachineData([]);
            setTimelineData([]);
            setPerformanceData([]);
            setRejectedData({});
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching workcenter data:", error);
        setMachineData([]);
      }
    };

    fetchWorkcenterData();
  }, [selectedWorkcenter, eventSource, selectedView]);

  // Update the useEffect to set the default selected workcenter
  useEffect(() => {
    if (workcenterDataList.length > 0) {
      setSelectedWorkcenter(workcenterDataList[0].workcenter_id);
    }
  }, [workcenterDataList]);

  const handleWorkcenterClick = (workcenterID: string, data: any) => {
    setSelectedWorkcenter(workcenterID);
    setSelectedLine(data);
    
    // Find the clicked card element and scroll it into view
    setTimeout(() => {
      const container = document.getElementById("workcenterScroller");
      const cardElement = document.querySelector(`[data-workcenter-id="${workcenterID}"]`) as HTMLElement;
      
      if (container && cardElement) {
        // Calculate the scroll position to center the card in the visible area
        const containerWidth = container.clientWidth;
        const cardWidth = cardElement.offsetWidth;
        const cardLeft = cardElement.offsetLeft;
        const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        
        // Smooth scroll to the position
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 50); // Small timeout to ensure DOM is updated
  };

  const handleMachineClick = (machine: any) => {
    setSelectedMachine(machine);
  };

  const MetricCard = ({ title, value, trend, icon, diff }) => {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.5rem",
          border: "1px solid #e2e8f0",
          padding: "0.75rem",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "#6b7280",
            marginBottom: "0.25rem",
          }}
        >
          {icon}
          <span>{title}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {value != null ? (
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {value}
            </span>
          ) : (
            <span>No Data</span>
          )}
          {diff && (
            <Badge
              status={trend === true ? "error" : "success"}
              count={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {trend === true ? "🔻" : "🔺"}
                </span>
              }
            />
          )}
        </div>
      </div>
    );
  };

  // New useEffect to scroll selected card into view after data loads
  useEffect(() => {
    // Only run if we're not loading and have a selected workcenter
    if (!isLoading && selectedWorkcenter) {
      // Small timeout to ensure the DOM has updated after data loading
      setTimeout(() => {
        const container = document.getElementById("workcenterScroller");
        const cardElement = document.querySelector(`[data-workcenter-id="${selectedWorkcenter}"]`) as HTMLElement;
        
        if (container && cardElement) {
          // Calculate the scroll position to center the card in the visible area
          const containerWidth = container.clientWidth;
          const cardWidth = cardElement.offsetWidth;
          const cardLeft = cardElement.offsetLeft;
          const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
          
          // Smooth scroll to the position
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }, 100); // Slightly longer timeout to ensure DOM is fully updated
    }
  }, [isLoading, selectedWorkcenter, machineData]); // Dependencies include loading state and data changes

  if (selectedMachine) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "5px",
            gap: "12px",
          }}
        >
          <button
            onClick={() => setSelectedMachine(null)}
            style={{
              padding: "6px 14px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              color: "blue",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <IoArrowBack size={14} />
            <span>Back</span>
          </button>

          <button
            onClick={onBack}
            style={{
              padding: "6px 14px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              color: "blue",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <IoHomeOutline size={14} />
            <span>Home</span>
          </button>
        </div>

        <DyanamicMachineCard
          data={{
            machine: selectedMachine?.resource_id,
            workcenter: selectedMachine?.workcenter_id,
          }}
          eventSource={eventSource}
          date={selectedDate}
          shift={shiftBoValue}
        />
      </div>
    );
  }
  

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 100px)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      {isLoading ? (
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
      ) : (
        <div style={{ width: "100%", height: "100%" }}>
          <div
            style={{
              width: "100%",
              height: "5%",
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <button
              onClick={onBack}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: "5px",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                color: "blue",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <IoHomeOutline size={14} />
              <span>Home</span>
            </button>
          </div>
          <div>
            <Card
              style={{ gridColumn: "span 1", padding: "2" }}
              bordered={false}
              bodyStyle={{ padding: 5 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px"
                }}
              >
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: "250px",
                    maxWidth: "calc(100% - 430px)", 
                    position: "relative",
                    padding: "4px",
                  }}
                >
                  {/* Left shadow */}
                  <div 
                    id="leftShadow"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "15px",
                      pointerEvents: "none",
                      background: "linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0))",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      zIndex: 5,
                      borderRadius: "8px 0 0 8px",
                      display: workcenterDataList.length > 4 ? "block" : "none"
                    }}
                  />
                  
                  {/* Scrollable content */}
                  <div
                    id="workcenterScroller"
                    className="hide-scrollbar"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "10px",
                      overflowX: "auto",
                      padding: "4px 8px",
                      scrollbarWidth: "none", /* Hide scrollbar for Firefox */
                      msOverflowStyle: "none", /* Hide scrollbar for IE/Edge */
                      // border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    onScroll={(e) => {
                      // Only apply shadow logic if there are more than 4 items
                      if (workcenterDataList.length <= 4) return;
                      
                      const container = e.currentTarget;
                      const leftShadow = document.getElementById("leftShadow");
                      const rightShadow = document.getElementById("rightShadow");
                      
                      // Show left shadow if scrolled right
                      if (leftShadow) {
                        leftShadow.style.opacity = container.scrollLeft > 10 ? "1" : "0";
                      }
                      
                      // Show right shadow if not scrolled all the way right
                      if (rightShadow) {
                        rightShadow.style.opacity = 
                          container.scrollWidth - container.scrollLeft - container.clientWidth > 10 
                            ? "1" : "0";
                      }
                    }}
                  >
                    {workcenterDataList.map((item: any) => (
                    <Card
                      key={item.workcenter_id}
                      data-workcenter-id={item.workcenter_id}
                      style={{
                        background: "#f5f9f7",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        padding: "8px",
                        minWidth: "250px",
                        maxWidth: "250px", /* Fixed width for cards */
                        flex: "0 0 auto",
                        border:
                          selectedWorkcenter === item.workcenter_id
                            ? "2px solid #3aa080"
                            : "none",
                      }}
                      bodyStyle={{ padding: 0 }}
                      hoverable
                      onClick={() =>
                        handleWorkcenterClick(item?.workcenter_id, item)
                      }
                    >
                      <div style={{ marginBottom: "8px" }}>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#475569",
                          }}
                        >
                          <FiActivity /> {item?.workcenter_id}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                        }}
                      >
                        <div>
                          <div style={{ color: "#64748b" }}>OEE</div>
                          <div style={{ color: "#059669", fontWeight: 500 }}>
                            {item?.oee === 0 ? "0" : item?.oee === 100 ? "100" : item?.oee?.toFixed(2) || "0"}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "#64748b" }}>Performance</div>
                          <div style={{ color: "#059669", fontWeight: 500 }}>
                            {item?.performance === 0 ? "0" : item?.performance === 100 ? "100" : item?.performance?.toFixed(2) || "0"}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "#64748b" }}>Availability</div>
                          <div style={{ color: "#059669", fontWeight: 500 }}>
                            {item?.availability === 0 ? "0" : item?.availability === 100 ? "100" : item?.availability?.toFixed(2) || "0"}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "#64748b" }}>Quality</div>
                          <div style={{ color: "#059669", fontWeight: 500 }}>
                            {item?.quality === 0 ? "0" : item?.quality === 100 ? "100" : item?.quality?.toFixed(2) || "0"}%
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  </div>
                  
                  {/* Right shadow */}
                  <div 
                    id="rightShadow"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "15px",
                      pointerEvents: "none",
                      background: "linear-gradient(to left, rgba(0,0,0,0.1), rgba(0,0,0,0))",
                      opacity: workcenterDataList.length > 4 ? 1 : 0, // Initially visible only if more than 4 items
                      transition: "opacity 0.2s ease",
                      zIndex: 5,
                      borderRadius: "0 8px 8px 0",
                      display: workcenterDataList.length > 4 ? "block" : "none"
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    flex: "0 0 auto",
                  }}
                >
                  <MetricCard
                    title={"Current OEE"}
                    value={`${workCenterData?.current_oee === 0 ? "0" : workCenterData?.current_oee === 100 ? "100" : workCenterData?.current_oee?.toFixed(2) || "0"}%`}
                    trend={false}
                    diff={false}
                    icon={<FiActivity />}
                  />
                  <MetricCard
                    title={"Output"}
                    value={workCenterData?.current_plan === 0 ? "0" : workCenterData?.current_plan === 100 ? "100" : workCenterData?.current_plan?.toFixed(2) || "0"}
                    trend={false}
                    diff={false}
                    icon={<BsLayersFill />}
                  />
                  <MetricCard
                    title={"Previous OEE"}
                    value={`${workCenterData?.oee_percentage_diff === null ? "0" : workCenterData?.oee_percentage_diff === 100 ? "100" : workCenterData?.oee_percentage_diff?.toFixed(2) || "0"}%`}
                    trend={workCenterData?.is_less}
                    diff={true}
                    icon={<FiActivity />}
                  />
                </div>
              </div>
            </Card>
          </div>
          <div style={{ width: "100%", height: "auto" }}>
            <div style={{ width: "100%", height: "100%" }}>
              <Card
                headStyle={{
                  minHeight: "10px",
                }}
                style={{
                  height: "100%",
                  width: "100%",
                }}
                bodyStyle={{
                  width: "100%",
                  padding: "10px",
                }}
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <AiFillHdd />
                    <span>Machine TimeLine</span>
                  </div>
                }
              >
                  {timelineData?.length > 0 ? (
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          overflow: 'hidden',
                        }}
                      >
                        <RangeChart data={showAllTimelines ? timelineData : timelineData.slice(currentChartIndex, currentChartIndex + 2)} />
                      </div>
                      {timelineData && timelineData?.length > 2 && (
                        <div style={{ display: 'flex', justifyContent: 'end', gap: '8px', marginTop: '-2%' }}>
                          <div
                            style={{
                              background: 'white',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => setShowAllTimelines(!showAllTimelines)}
                          >
                            <span style={{ fontSize: '11px' }}>{showAllTimelines ? 'Show Less' : 'Show All'}</span>
                            <IoArrowBack style={{ transform: showAllTimelines ? 'rotate(90deg)' : 'rotate(-90deg)' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <NoDataScreen />
                  )}
              </Card>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "auto",
            }}
          >
            <Card
              headStyle={{
                minHeight: "10px",
              }}
              style={{
                height: "100%",
              }}
              bodyStyle={{
                padding: "10px",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                overflow: "auto",
                gap: "10px",
              }}
            >
              {machineData.length > 0 ? (
                machineData.map((machine, index) => (
                  <div
                    key={index}
                    onClick={() => handleMachineClick(machine)}
                    style={{
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MachineTile data={machine} />
                  </div>
                ))
              ) : (
                <NoDataScreen />
              )}
            </Card>
          </div>
          <div
            style={{
              width: "100%",
              height: timelineData.length < 2 ? "34%" : "40%",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              <div style={{ width: "50%", height: "100%" }}>
                <BarChartPopup
                  data={performanceData}
                  title="Shift Wise OEE Performance Quality Availability"
                // color={"#3aa080"}
                />
              </div>
              <div style={{ width: "49%", height: "100%" }}>
                <DonutChart
                  title="Rejections"
                  data={rejectedData?.total_rejects}
                  rejectedData={rejectedData}
                />
              </div>
            </div>
          </div>
          <div style={{ width: "100%", height: "auto", marginTop: 50 }}>
            <Card
              headStyle={{
                minHeight: "10px",
              }}
              style={{
                height: "100%",
              }}
              styles={
                {
                  body: {
                    height: "100%",
                  }
                }
              }
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  <AiFillHdd />
                  <span>What If Scenarios</span>
                </div>
              }
            >
              {selectedLine && <Sliders machineWiseData={selectedLine} />}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkcenterComponent;
