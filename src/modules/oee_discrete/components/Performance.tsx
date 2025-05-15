import React, { useEffect, useRef, useState } from "react";
import { Layout, Row, Col, Button, Tabs, Progress, Splitter } from "antd";
import { useFilterContext } from "../hooks/filterData";
import LineChart from "./reuse/LineChart";
import BarChart from "./reuse/BarChart";
import StackedBarChart from "./reuse/StackBar";
import ParetoChart from "./reuse/ParetoChart";
import PiChart from "./reuse/PiChartDown";
import { useSettingsData } from "../hooks/settingsData";
import NoDataFound from "./reuse/NoDataFound";
import SpeedLoss from "./reuse/speedloss";
import DynamicTable from "./reuse/Table";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import { parseCookies } from "nookies";
import dayjs from "dayjs";
import BarChartPopup from "./reuse/BarChartPopup";
import MultilineChart from "./reuse/multilineChart";
import RadarChart from "./reuse/RadarChar";
import HorizondallyChart from "./reuse/HorizondallyChart";

const { Content } = Layout;
const Performance: React.FC = () => {
  const cookies = parseCookies();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showTimeIntervals, setShowTimeIntervals] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const { overallfilter,machineToggle } = useFilterContext();
  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener("resize", checkZoom);
    checkZoom(); // Check initial state
    return () => window.removeEventListener("resize", checkZoom);
  }, []);
  const { color, performanceOeeData } = useFilterContext();
  const { filterColors } = useSettingsData();

  const getColorByPercentage = (value: number) => {
    if (value >= 85) return "#52c41a"; // Green for good
    if (value >= 60) return "#faad14"; // Yellow for warning
    return "#f5222d"; // Red for poor
  };

  const handleBarClick = async (xValue: string, yValue: number) => {
    setSelectedMachine(xValue);
    console.log(machineToggle);
    try {
      const payload = {
        site: cookies.site,
        resourceId: [xValue],
        startTime: overallfilter?.TimePeriod?.[0]
          ? dayjs(overallfilter?.TimePeriod[0]).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        endTime: overallfilter?.TimePeriod?.[1]
          ? dayjs(overallfilter?.TimePeriod[1]).format("YYYY-MM-DDTHH:mm:ss")
          : null,
          eventSource: machineToggle ? "MACHINE" : "MANUAL",
      };
      console.log(payload, "payload from performance");
      const response = await fetchEndpointsData(
        payload,
        "oee-service",
        "getByresourceTimeAndInterval"
      );
      console.log(response, "response from performance");
      setTableData(response);
      setShowTimeIntervals(true);
    } catch (error) {
      console.log(error, "error from performance");
      setTableData([]);
      setShowTimeIntervals(true);
    }
  };

  const overallPerformance = performanceOeeData?.getOverall?.percentage || 0;

  const tabBarExtraContent = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#fff",
        padding: "8px 16px",
        borderRadius: "6px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        marginRight: "12px",
        minWidth: "340px",
      }}
    >
      <div style={{ fontWeight: "500", fontSize: "13px", color: "#666" }}>
        Overall Performance
      </div>
      <div style={{ flex: 1 }}>
        <Progress
          percent={Number(overallPerformance.toFixed(1))}
          size="small"
          strokeColor={{
            "0%": getColorByPercentage(overallPerformance),
            "100%": getColorByPercentage(overallPerformance),
          }}
          format={(percent) => `${percent}%`}
        />
      </div>
    </div>
  );

  return (
    <Content ref={contentRef}>
      <div className="site-layout-content">
        <Tabs
          defaultActiveKey="1"
          type="card"
          tabBarExtraContent={tabBarExtraContent}
          size="small"
          style={{
            marginTop: "-12px",
          }}
          tabBarStyle={{
            marginBottom: "8px",
            height: "32px",
          }}
          items={[
            {
              label: "Performance Trend",
              key: "1",
              children: (
                <div
                  style={{
                    height: "calc(100vh - 200px)",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[12, 12]}>
                    <Col span={24}>
                      {/* <LineChart
                        data={performanceOeeData?.performanceOverTime || []}
                        title={"Performance Over Time"}
                        color={filterColors.performanceOverTime}
                        description={
                          "Tracks performance trends over time. This chart helps identify patterns, improvements, or degradation in performance, enabling proactive management of production efficiency."
                        }
                      /> */}
                      <MultilineChart
                      data={performanceOeeData?.performanceOverTime || []}
                      title="Performance Over Time"
                      yAxisLabel={"Performance Percentage %"}
                      unit="%"
                      valueField="percentage"
                      resourceField="resource"
                    />
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              label: "Resource Analysis",
              key: "2",
              children: (
                <div
                  style={{
                    height: "calc(100vh - 200px)",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  {showTimeIntervals ? (
                    <Splitter
                      style={{
                        height: "calc(100vh - 240px)",
                        overflow: "hidden",
                      }}
                    >
                      <Splitter.Panel
                        defaultSize="50%"
                        min="30%"
                        max="70%"
                        style={{
                          overflow: "auto",
                          height: "100%",
                        }}
                      >
                        <BarChartPopup
                          data={performanceOeeData?.performanceByMachine || []}
                          title="Performance By Machine"
                          color={filterColors.performanceByMachine.itemcolor}
                          description={
                            "Shows the distribution of performance across different machines. Helps identify which machines are performing optimally and which ones might need attention or optimization."
                          }
                          onBarClick={handleBarClick}
                          theshold={filterColors.performanceByMachine.threshold}
                          timebyperiod={true}
                        />
                      </Splitter.Panel>
                      <Splitter.Panel
                        style={{
                          overflow: "auto",
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Button
                            type="text"
                            style={{
                              position: "absolute",
                              right: 5,
                              top: 0,
                              zIndex: 10,
                              color: "white",
                            }}
                            onClick={() => setShowTimeIntervals(false)}
                          >
                            ✕
                          </Button>
                          <DynamicTable
                            data={tableData}
                            title={`Time Intervals for ${selectedMachine}`}
                            columnOrder={[
                              "interval_start_date_time",
                              "interval_end_date_time",
                              "Production_Actual_Quantity",
                              "plan_Target_Quantity",
                              "good_qty",
                              "bad_qty",
                            ]}
                          />
                        </div>
                      </Splitter.Panel>
                    </Splitter>
                  ) : (
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <BarChart
                          data={performanceOeeData?.performanceByShift || []}
                          title="Performance by Shift"
                          color={filterColors.performanceByShift.itemcolor}
                          theshold={filterColors.performanceByShift.threshold}
                          description={
                            "Compares performance metrics across different shifts. This visualization helps identify variations in productivity between shifts and potential areas for standardization or improvement."
                          }
                          showXAxisLabel={true}
                        />
                      </Col>
                      <Col span={12}>
                        <BarChartPopup
                          data={performanceOeeData?.performanceByMachine || []}
                          title="Performance By Machine"
                          color={filterColors.performanceByMachine.itemcolor}
                          theshold={filterColors.performanceByMachine.threshold}
                          description={
                            "Shows the distribution of performance across different machines. Helps identify which machines are performing optimally and which ones might need attention or optimization."
                          }
                          onBarClick={handleBarClick}
                          timebyperiod={true}
                        />
                      </Col>
                    </Row>
                  )}
                </div>
              ),
            },
            {
              label: "Operation Analysis",
              key: "3",
              children: (
                <div
                  style={{
                    height: "calc(100vh - 200px)",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <BarChart
                        title={"Performance by Operation"}
                        data={performanceOeeData?.oeeByOperation || []}
                        color={filterColors.oeeByMachine.itemcolor}
                        theshold={filterColors.oeeByMachine.threshold}
                        description={
                          "This bar chart displays the Overall Equipment Effectiveness (OEE) for different operations within the production process. By analyzing OEE at the operational level, you can identify bottlenecks, measure efficiency variations, and pinpoint areas that need improvement. Each bar represents the OEE percentage for a specific operation, helping assess performance trends over time and optimize production workflows."
                        }
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              label: "Production Analysis",
              key: "4",
              children: (
                <div
                  style={{
                    height: "calc(100vh - 200px)",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <HorizondallyChart
                        data={performanceOeeData?.performanceByProductionLine || []}
                        title="Performance by Production Line"
                        description={
                          "Breaks down performance metrics by production line. This visualization enables comparison between different lines and helps identify best practices or areas needing improvement."
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <BarChart
                        title={"Performance Efficiency by Product"}
                        data={performanceOeeData?.performanceByProduct || []}
                        color={
                          filterColors.performanceByProductionLine?.itemcolor
                        }
                        description={
                          "Analyzes performance efficiency for different products. Helps identify which products are running efficiently and which ones might be causing production bottlenecks."
                        }
                        theshold={undefined}
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              label: "Loss Analysis",
              key: "5",
              children: (
                <div
                  style={{
                    height: "calc(100vh - 200px)",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <ParetoChart
                        data={
                          performanceOeeData?.performanceDowntimeAnalysis || []
                        }
                        title="Performance Downtime Analysis"
                        color={filterColors.performanceLossReasons}
                        description={
                          "Shows the relationship between performance and downtime events. This analysis helps understand how different types of stops or delays impact overall performance."
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <ParetoChart
                        data={performanceOeeData?.performanceLossReason || []}
                        title="Performance Loss Reasons"
                        color={filterColors.performanceLossReasons}
                        description={
                          "Analyzes the reasons for performance losses, helping identify and prioritize areas for improvement."
                        }
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            // {
            //   label: "Speed Loss",
            //   key: "6",
            //   children: (
            //     <div
            //       style={{ height: "calc(100vh - 200px)", paddingRight: "8px" }}
            //     >
            //       <Tabs
            //         defaultActiveKey="1"
            //         style={{ width: "100%" }}
            //         items={[
            //           {
            //             key: "1",
            //             label: "Workcenter",
            //             children: (
            //               <div
            //                 style={{
            //                   height: "calc(100vh - 280px)",
            //                   overflowY: "auto",
            //                   paddingRight: "8px",
            //                 }}
            //               >
            //                 {!performanceOeeData?.getSpeedLossByWorkcenter ||
            //                 performanceOeeData?.getSpeedLossByWorkcenter
            //                   .length === 0 ? (
            //                   <NoDataFound />
            //                 ) : (
            //                   <div
            //                     style={{
            //                       width: "100%",
            //                       padding: "16px",
            //                     }}
            //                   >
            //                     <div
            //                       style={{
            //                         display: "grid",
            //                         gridTemplateColumns:
            //                           "repeat(auto-fill, minmax(300px, 300px))",
            //                         gap: "16px",
            //                         width: "100%",
            //                       }}
            //                     >
            //                       {performanceOeeData?.getSpeedLossByWorkcenter?.length > 0 &&
            //                       performanceOeeData?.getSpeedLossByWorkcenter?.map(
            //                         (
            //                           item: {
            //                             speedLoss: any;
            //                             workcenterId: any;
            //                           },
            //                           index: React.Key
            //                         ) => (
            //                           <div
            //                             key={index}
            //                             style={{
            //                               height: "280px",
            //                               width: "300px",
            //                             }}
            //                           >
            //                             <SpeedLoss
            //                               data={[
            //                                 {
            //                                   value:
            //                                     Number(item?.speedLoss) || 0,
            //                                 },
            //                               ]}
            //                               title={
            //                                 item?.workcenterId ||
            //                                 "Unknown Workcenter"
            //                               }
            //                               color={color}
            //                               type={"downtimeByWorkcenter"}
            //                               description={`Speed metrics for ${
            //                                 item?.workcenterId ||
            //                                 "Unknown Workcenter"
            //                               }`}
            //                             />
            //                           </div>
            //                         )
            //                       )}
            //                     </div>
            //                   </div>
            //                 )}
            //               </div>
            //             ),
            //           },
            //           {
            //             key: "2",
            //             label: "Resource",
            //             children: (
            //               <div
            //                 style={{
            //                   height: "calc(100vh - 280px)",
            //                   overflowY: "auto",
            //                   paddingRight: "8px",
            //                 }}
            //               >
            //                 {!performanceOeeData?.getSpeedLossByResource ||
            //                 performanceOeeData?.getSpeedLossByResource
            //                   .length === 0 ? (
            //                   <NoDataFound />
            //                 ) : (
            //                   <div
            //                     style={{
            //                       width: "100%",
            //                       padding: "16px",
            //                     }}
            //                   >
            //                     <div
            //                       style={{
            //                         display: "grid",
            //                         gridTemplateColumns:
            //                           "repeat(auto-fill, minmax(300px, 300px))",
            //                         gap: "16px",
            //                         width: "100%",
            //                       }}
            //                     >
            //                       {performanceOeeData?.getSpeedLossByResource?.length > 0 &&
            //                         performanceOeeData?.getSpeedLossByResource?.map(
            //                           (
            //                             item: {
            //                               speedLoss: any;
            //                               resourceId: any;
            //                             },
            //                             index: React.Key
            //                           ) => (
            //                             <div
            //                               key={index}
            //                               style={{
            //                                 height: "280px",
            //                                 width: "300px",
            //                               }}
            //                             >
            //                               <SpeedLoss
            //                                 data={[
            //                                   {
            //                                     value:
            //                                       Number(item?.speedLoss) || 0,
            //                                   },
            //                                 ]}
            //                                 title={
            //                                   item?.resourceId ||
            //                                   "Unknown Resource"
            //                                 }
            //                                 color={color}
            //                                 type={"downtimeByMachine"}
            //                                 description={`Speed metrics for ${
            //                                   item?.resourceId ||
            //                                   "Unknown Resource"
            //                                 }`}
            //                               />
            //                             </div>
            //                           )
            //                         )}
            //                     </div>
            //                   </div>
            //                 )}
            //               </div>
            //             ),
            //           },
            //         ]}
            //       />
            //     </div>
            //   ),
            // },
          ]}
        />
      </div>

      <style jsx global>{`
        .ant-tabs-nav::before {
          border-bottom: none !important;
        }
      `}</style>
    </Content>
  );
};

export default Performance;
