"use client";
import React, { useEffect, useState } from "react";
import { Tabs as AntTabs, Button, Card, Col, Row, TabsProps } from "antd";
import styled from "styled-components";
import Performance from "./performance";
import Quality from "./quality";
import MachineTimeLine from "./MachineTimeLine";
import AvailabiltyAgainstShift from "./AvailabiltyAgainstShift";
import AvailabilityChart from "./AvailabiltyChart";
import { parseCookies } from "nookies";
import { setDefaultAutoSelectFamily } from "net";
import { useFilterContext } from "../hooks/HistoricalReportContext";
import { Text } from "recharts";
import { getApiRegistry } from "@services/oeeServices";
import { LeftOutlined } from "@ant-design/icons";
import { AiOutlineFieldTime } from "react-icons/ai";

type TabKey = "availability" | "performance" | "quality";

interface OEETabsProps {
  defaultActiveKey?: TabKey;
  onChange?: (activeKey: TabKey) => void;
  availabilityContent?: React.ReactNode;
  performanceContent?: React.ReactNode;
  qualityContent?: React.ReactNode;
  availability?: number;
  performance?: number;
  quality?: number;
  oee?: number;
  record?: any;
  tableType?: "7days" | "3months" | null;
  onBack?: () => void;
  eventType?: string;
}

const Container = styled.div`
  position: relative;
  .ant-tabs-extra-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const TabsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
`;

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  padding: 4px 8px;
  height: 32px;
  margin-right: 24px;

  &:hover {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.1);
  }

  .anticon {
    font-size: 12px;
  }
`;

const OeeMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  flex: 1;
`;

const HeaderRightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
`;

const OeeLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const StyledTabs = styled(AntTabs)`
  .ant-tabs-nav {
    margin-bottom: 0;
    background-color: #ffffff;
    padding: 0 12px;
    border-bottom: 1px solid #f0f0f0;

    &::before {
      display: none;
    }
  }

  .ant-tabs-nav-wrap {
    display: flex;
    justify-content: center;
    flex: 1;
  }

  .ant-tabs-nav-list {
    width: auto;
    gap: 32px;
  }

  .ant-tabs-nav-operations {
    display: none;
  }

  .ant-tabs-tab {
    padding: 12px 24px;
    margin: 0;
    transition: all 0.3s ease;
    font-size: 14px;
    position: relative;

    &:hover {
      color: #1890ff;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background: #1890ff;
      transition: width 0.3s ease;
    }
  }

  .ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: #1890ff;
      font-weight: 500;
    }

    &::after {
      width: 80%;
    }
  }

  .ant-tabs-ink-bar {
    display: none;
  }

  .ant-tabs-content {
    background: #ffffff;
    border-radius: 0 0 6px 6px;
    height: calc(100vh - 60px);
  }

  .ant-tabs-nav-operations {
    display: none;
  }

  .ant-tabs-extra-content {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }
`;

const TabContent = styled.div`
  min-height: 150px;
  padding: 12px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const TabLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OeeValue = styled.span<{ value: number }>`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${({ value }) => {
    if (value >= 90) return "#f6ffed";
    if (value >= 80) return "#e6f7ff";
    if (value >= 70) return "#fff7e6";
    return "#fff1f0";
  }};
  color: ${({ value }) => {
    if (value >= 90) return "#52c41a";
    if (value >= 80) return "#1890ff";
    if (value >= 70) return "#fa8c16";
    return "#f5222d";
  }};
  border: 1px solid
    ${({ value }) => {
      if (value >= 90) return "#b7eb8f";
      if (value >= 80) return "#91d5ff";
      if (value >= 70) return "#ffd591";
      return "#ffa39e";
    }};
`;

const OverallOeeValue = styled(OeeValue)`
  font-size: 14px;
  padding: 4px 8px;
`;

const TimelineLegend = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 15px;
  height: 15px;
  border-radius: 2px;
  background: ${(props) => props.color};
`;

const OeeTabs: React.FC<OEETabsProps> = ({
  defaultActiveKey = "availability",
  onChange,
  availabilityContent,
  performanceContent,
  qualityContent,
  availability = 0,
  performance = 0,
  quality = 0,
  oee = 0,
  record,
  tableType,
  onBack,
  eventType,
}) => {
  const [activeKey, setActiveKey] = useState<TabKey>(defaultActiveKey);
  const {
    setSelectedResource,
    setSelectedShift,
    selectedBarsRef,
    selectedResource,
    selectedShift,
    setAvailabilityData,
    setMachineTimeLine,
    setAvailabilityAgainstShiftData,
    availabilityData,
    machineTimeLine,
    availabilityAgainstShiftData,
    selectedResources,
    formattedShiftsData,
    showLegend,
  } = useFilterContext();
  const [forceUpdate, setForceUpdate] = useState(false);

  // Replace the MutationObserver with this useEffect
  useEffect(() => {
    // Create a simple interval to check for changes
    const interval = setInterval(() => {
      setForceUpdate((prev) => !prev);
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // This effect will run whenever the active tab changes
    switch (activeKey) {
      case "performance":
        // Performance component has its own useEffect for data fetching
        break;
      case "quality":
        // Trigger quality data fetch
        break;
    }
  }, [activeKey]);

  const handleChange: TabsProps["onChange"] = (key) => {
    setActiveKey(key as TabKey);
    onChange?.(key as TabKey);
  };

  // useEffect(() => {
  //   // debugger
  //   if (activeKey === "availability") {
  //     setSelectedShift(shiftData[0]?.shift);
  //     const fetchMachineTimeline = async () => {
  //       try {
  //         const cookies = parseCookies();
  //         const site = cookies?.site;
  //         const request = {
  //           resource: selectedResource,
  //           p_site: site,
  //           workcenter: "LIQUIDLINE1_WC",
  //           eventSource: "machine",
  //           date: "2025-04-28",
  //           shift: selectedShift
  //         };
  //         try {
  //           const response = await getApiRegistry(
  //             request,
  //             "get_shift_and_downtime_summary"
  //           );
  //           if (!response?.errorCode) {
  //             // setMachineWiseData(response?.data[0]);
  //           }
  //         } catch (e) {
  //           console.error("Error retrieving availabilty data for resources: ", e);
  //         }

  //         // get the resource name with least availablility from the const dummyAvailabilityData
  //         // Get resource with least availability

  //       } catch (error) {
  //         console.error('Error fetching availabilty data for resources:', error);
  //       }
  //     };
  //     fetchMachineTimeline();
  //   }
  // }, [selectedBarsRef]);

  useEffect(() => {
    let resourceList, leastAvailableResource, mappedData, formattedData;
    const fetchAvailabilityData = async () => {
      try {
        const cookies = parseCookies();
        const site = cookies?.site;
        const request = {
          site: site,
          workcenter: record?.workCenter,
          eventsource: eventType,
          date: record?.date,
        };
        try {
          resourceList = await getApiRegistry(
            request,
            "getResourceByWorkcenter"
          );
          if (!resourceList?.errorCode) {
            // debugger
            if (resourceList?.data && resourceList?.data?.length > 0) {
              mappedData = resourceList.data.map((item) => ({
                resource: item.resource_id,
                value: parseFloat(Number(item.availability).toFixed(2)),
              }));
              setAvailabilityData(mappedData);
            } else {
              setAvailabilityData([]);
            }
          }
        } catch (e) {
          console.error("Error retrieving availabilty data for resources: ", e);
        }

        // get the resource name with least availablility from the const dummyAvailabilityData
        // Get resource with least availability
        if (mappedData?.length > 0) {
          // debugger
          leastAvailableResource = mappedData
            ?.filter(item => item.value > 0) // Exclude resources with 0 availability
            ?.reduce((prev, curr) => 
              curr.value < prev.value ? curr : prev
            );
          // console.log('Resource with least availability:', leastAvailableResource?.resource);
          setSelectedResource(leastAvailableResource?.resource);
          selectedResources.current = leastAvailableResource?.resource;
        }
      } catch (error) {
        console.error("Error fetching availability data:", error);
      }
    };
    const fetchAvailabilityOverShift = async () => {
      try {
        const cookies = parseCookies();
        const site = cookies?.site;
        //  debugger
        try {
          const req = {
            date: record?.date,
            workcenter: record?.workCenter,
            resource: leastAvailableResource?.resource,
            site: site,
            eventsource: eventType,
          };

          let response = await getApiRegistry(req, "getShiftByResourceData");
          // debugger
          if (response?.data && response?.data?.length > 0) {
            formattedData = response.data.map((item) => ({
              shift: item.shift_id.split(",")[2], // Extract 'GENERAL' from the shift_id
              availableTime: Math.round(item.actual_time / 60), // Convert seconds to minutes
              downTime: Math.round(item.total_downtime / 60),
              shiftBo: item.shift_id,
            }));
            formattedShiftsData.current = formattedData;
            setAvailabilityAgainstShiftData(formattedData);
            setSelectedShift(formattedData?.[0]?.shiftBo);
          }
          else {
            setAvailabilityAgainstShiftData([]);
          }
        } catch (e) {
          console.error(`Error retrieving machine details for shift :`, e);
        }

        // Get resource with least availability
      } catch (error) {
        console.error("Error fetching availability over shift:", error);
      }
    };

    const fetchMachineTimeline = async () => {
      try {
        const cookies = parseCookies();
        const site = cookies?.site;
        let response;
        try {
          // debugger
          const req = {
            resource: leastAvailableResource?.resource,
            p_site: site,
            workcenter: record?.workCenter,
            eventSource: eventType,
            date: record?.date,
            shift: formattedData?.[0]?.shiftBo,
          };

          response = await getApiRegistry(
            req,
            "get_shift_and_downtime_summary"
          );

          if (!response?.errorCode && response?.data?.[0]) {
            // Process breaks data
            if (!response.data[0].breaks?.value) {
              response.data[0].breaks = { value: [] };
            } else {
              response.data[0].breaks.value = JSON.parse(
                response.data[0].breaks.value
              );
            }

            // Process downtimes data
            if (!response.data[0].downtimes?.value) {
              response.data[0].downtimes = { value: [] };
            } else {
              response.data[0].downtimes.value = JSON.parse(
                response.data[0].downtimes.value
              );
            }
            setMachineTimeLine(response?.data?.[0]);
            showLegend.current = true;
            // Add to the collection
          }
          else{
            setMachineTimeLine({});
            showLegend.current = false;
          }
        } catch (e) {
          console.error(`Error retrieving machine details for shift :`, e);
        }

        // Get resource with least availability
        const firstShift = response?.data?.[0];
        //  console.log('First shift:', firstShift?.shift);
        setSelectedShift(firstShift?.shift);
      } catch (error) {
        console.error("Error fetching MAchine timeline:", error);
      }
    };

    if (activeKey === "availability") {
      const fetchData = async () => {
        await fetchAvailabilityData();
        await fetchAvailabilityOverShift();
        await fetchMachineTimeline();
      };
      fetchData();
    }
  }, []);

  const formatOeeValue = (value: number) => `${value.toFixed(1)}%`;

  const leftExtraContent = (
    <>
      {/* <BackButton onClick={onBack} icon={<LeftOutlined />}>
        Back
      </BackButton> */}
      <span style={{ fontSize: "14px", color: "#666" }}>
        {record?.workCenter} - {record?.date} 
      </span>
    </>
  );

  const rightExtraContent = (
    <HeaderRightSection>
      <OeeMetrics>
        <OeeLabel>Overall OEE:</OeeLabel>
        <OverallOeeValue value={oee}>{formatOeeValue(oee)}</OverallOeeValue>
      </OeeMetrics>
      <BackButton onClick={onBack} icon={<LeftOutlined />}>
        Back
      </BackButton>
    </HeaderRightSection>
  );

  const items: TabsProps["items"] = [
    {
      key: "availability",
      label: (
        <TabLabel>
          Availability
          <OeeValue value={availability}>
            {formatOeeValue(availability)}
          </OeeValue>
        </TabLabel>
      ),
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col span={12} style={{ marginTop: "8px", width: "99%" }}>
              <AvailabilityChart
                title="Availability Against Resource"
                color="#1890ff"
                theshold={80}
                data={availabilityData}
                date={record?.date}
                workcenter={record?.workCenter}
                eventType={eventType}
              />
            </Col>
            <Col span={12} style={{ marginTop: "8px", width: "99%" }}>
              <AvailabiltyAgainstShift
                data={availabilityAgainstShiftData}
                title="Availability Against Shift"
                color="#1890ff"
                theshold={80}
                showXAxisLabel={true}
                date={record?.date}
                workcenter={record?.workCenter}
                eventType={eventType}
              />
            </Col>
          </Row>
          <div style={{ marginTop: "5px", width: "99%", marginLeft: "9px" }}>
            <Card
              size="small"
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <AiOutlineFieldTime style={{ fontSize: "14px" }} />
                  Machine Timeline
                </div>
              }
            >
              {selectedBarsRef.current.size >= 0 && (
                <MachineTimeLine
                  key={Array.from(selectedBarsRef.current)[0]}
                  shiftName={Array.from(selectedBarsRef.current)[0]}
                  shiftData={machineTimeLine}
                  date={record?.date}
                  workcenter={record?.workCenter}
                  eventType={eventType}
                />
              )}
              { showLegend?.current == true &&
                <TimelineLegend style={{ marginTop: "-0.2%" }}>
                  <LegendItem>
                    <LegendColor color="#3aa080" />
                    <Text>Available</Text>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="#FFD700" />
                    <Text>Scheduled Downtime</Text>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="red" />
                    <Text>Unscheduled Downtime</Text>
                  </LegendItem>
                </TimelineLegend>
              }
            </Card>
          </div>
        </>
      ),
    },

    {
      key: "performance",
      label: (
        <TabLabel>
          Performance
          <OeeValue value={performance}>{formatOeeValue(performance)}</OeeValue>
        </TabLabel>
      ),
      children: (
        <TabContent>
          <Performance activeTab={activeKey} record={record} eventType={eventType}/>
        </TabContent>
      ),
    },
    {
      key: "quality",
      label: (
        <TabLabel>
          Quality
          <OeeValue value={quality}>{formatOeeValue(quality)}</OeeValue>
        </TabLabel>
      ),
      children: (
        <TabContent>
          <Quality activeTab={activeKey} record={record} eventType={eventType}/>
        </TabContent>
      ),
    },
  ];

  return (
    <Container>
      <StyledTabs
        activeKey={activeKey}
        onChange={handleChange}
        items={items}
        type="line"
        size="middle"
        tabBarExtraContent={{
          left: leftExtraContent,
          right: rightExtraContent,
        }}
      />
    </Container>
  );
};

export default OeeTabs;
