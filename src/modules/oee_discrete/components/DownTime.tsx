import React, { useEffect, useState, useRef } from "react";
import { Layout, Row, Col, Tabs, Progress } from "antd";
import { useFilterContext } from "../hooks/filterData";
import BarChart from "./reuse/BarChart";
import PiChart from "./reuse/PiChartDown";
import StackedBarChart from "./reuse/StackBarDown";
import StackedBarChartDynamic from "./reuse/StackBar";
import Histogram from "./reuse/Histogram";
import AreaChart from "./reuse/AreaChart";
import BubbleChart from "./reuse/BubbleChart";
import TreeMap from "./reuse/TreeMap";
import RadarChart from "./reuse/RadarChar";
import WaterfallChart from "./reuse/WaterfallChart";
import FunnelChart from "./reuse/FunnelChart";
import BoxPlot from "./reuse/BoxPlot";
import MyGaugeChart from "./reuse/Gauge";
import ParetoChart from "./reuse/ParetoChart";

import NewLineChart from "./reuse/NewLineChart";
import LineChart from "./reuse/LineChart";
import HeatMap from "./reuse/HeatMap";
import DowntimeHistogram from "./reuse/DownTimeHistograme";
import { useSettingsData } from "../hooks/settingsData";
import GaugeChart from "./reuse/GaugeCharts";
import TimeLineChart from "./reuse/TimeLineChart";
import BarChartPopup from "./reuse/BarChartPopup";
import DownTimeCard from "./reuse/DownTimeCard";
import DoNutChart from "./reuse/DoNutChart";
import ParetoChartTime from "./reuse/ParetoChartTime";
import HeatmapDownTime from "./reuse/HeatMapDownTime";

const { Content } = Layout;
const { TabPane } = Tabs;

const DownTime: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [clickedGraph, setClickedGraph] = useState<number>(0);

  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener("resize", checkZoom);
    checkZoom();
    return () => window.removeEventListener("resize", checkZoom);
  }, []);
  const { color, downtimeOeeData, setFilter, setCall, call } =
    useFilterContext();
  const { filterColors } = useSettingsData();

  const getColorByPercentage = (value: number) => {
    if (value >= 85) return "#52c41a"; // Green for good
    if (value >= 60) return "#faad14"; // Yellow for warning
    return "#f5222d"; // Red for poor
  };

  const overallDowntime = downtimeOeeData?.getOverall?.percentage || 0;

  const handleBarClick = (
    xValue: string,
    yValue: number,
    graphLevel: number
  ) => {
    console.log(`Clicked on ${xValue}: ${yValue} from graph ${graphLevel}`);
    if (graphLevel === 1) {
      setFilter((prev) => ({
        ...prev,
        Workcenter: [xValue],
      }));
    } else if (graphLevel === 2) {
      setFilter((prev) => ({
        ...prev,
        Resource: [xValue],
      }));
    } else if (graphLevel === 3) {
      setFilter((prev) => ({
        ...prev,
        Resource: [xValue],
      }));
    }
    setCall(call + 1);
    setClickedGraph(graphLevel);
  };

  // Add helper function to get dynamic title and data
  const getChartConfig = (level: number, parentValue?: string) => {
    switch (level) {
      case 1:
        return {
          title: "Downtime By Work Center",
          type: "workcenter",
        };
      case 2:
        return {
          title: `Downtime By Machine for ${parentValue}`,
          type: "machine",
        };
      case 3:
        return {
          title: `Downtime By Reason for ${parentValue}`,
          type: "reason",
        };
      case 4:
        return {
          title: `Detailed Analysis for ${parentValue}`,
          type: "detail",
        };
      default:
        return {
          title: "Downtime Analysis",
          type: "default",
        };
    }
  };

  return (
    <Content ref={contentRef}>
      <div className="site-layout-content">
        <Tabs
          defaultActiveKey="1"
          type="card"
          size="small"
          style={{
            marginTop: "-12px",
          }}
          tabBarStyle={{
            marginBottom: "8px",
            height: "32px",
          }}
          tabBarExtraContent={<DownTimeCard />}
          items={[
            {
              label: "Downtime Trend",
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
                    {/* <Col span={24}>
                      <GaugeChart data={downtimeOeeData?.getOverall || []} />
                    </Col> */}
                    <Col span={24}>
                      {/* <TimeLineChart
                        title={"Downtime Over Time"}
                        data={downtimeOeeData?.downtimeOverTime || []}
                      /> */}
                      {/* <ParetoChartTime
                        data={downtimeOeeData?.downtimeOverTime}
                        title="Downtime Over Time"
                        color={{
                          itemcolor: ["#4F95FF"],
                          linecolor: ["#e74c3c"],
                        }}
                        keyMappings={{
                          xAxis: "resourceId",
                          leftYaxis: "downtimeDuration",
                          rightYaxis: "occurredAt",
                        }}
                      /> */}
                      <HeatmapDownTime
                        data={downtimeOeeData?.downtimeOverTime || []}
                        xKey={"reason"}
                        yKey={"machine"}
                        valueKey={"occurrences"}
                        title={"Downtime Analysis"}
                        description={
                          "A heat map showing the relationship between machines and downtime reasons. Helps identify patterns and combinations of issues that may require specific attention or intervention."
                        }
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            // {
            //   label: "Cumulative Trend",
            //   key: "2",
            //   children: (
            //     <div style={{ height: "calc(100vh - 200px)", overflowY: "auto", paddingRight: "8px" }}>
            //       <Row gutter={[16, 16]}>
            //         <Col span={24}>
            //           {/* <AreaChart
            //             color={filterColors.oeeOverTime}
            //             data={downtimeOeeData?.cumulativeDowntime || []}
            //             title={"Cumulative Downtime"}
            //             description={
            //               "Displays the accumulation of downtime over a period. This visualization helps understand the total impact of downtime and identify periods of accelerated equipment stoppage."
            //             }
            //           /> */}
            //           <BarChart
            //             data={downtimeOeeData?.cumulativeDowntime || []}
            //             title={"Cumulative Downtime"}
            //             color={filterColors.downtimeByMachine.itemcolor}
            //             theshold={filterColors.downtimeByMachine.threshold}
            //             description={
            //               "Displays the accumulation of downtime over a period. This visualization helps understand the total impact of downtime and identify periods of accelerated equipment stoppage."
            //             }
            //           />
            //         </Col>
            //       </Row>
            //     </div>
            //   ),
            // },
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
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <PiChart
                        data={downtimeOeeData?.downtimeByReason || []}
                        title={"Downtime by Reason"}
                        color={filterColors.downtimeByReason.itemcolor}
                        description={
                          "Breaks down downtime events by their root causes. This pie chart helps identify the most frequent or significant reasons for equipment stoppage, enabling focused problem-solving efforts."
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <BarChart
                        data={downtimeOeeData?.downtimeByMachine || []}
                        title={"Downtime By Machine"}
                        color={filterColors.downtimeByMachine.itemcolor}
                        theshold={filterColors.downtimeByMachine.threshold}
                        description={
                          "Compares downtime across different machines or equipment. Helps identify problematic machines that may require more maintenance attention or replacement."
                        }
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              label: "Detailed Analysis",
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
                    <Col span={12}>
                      <StackedBarChartDynamic
                        data={downtimeOeeData?.downtimeByShift || []}
                        title={"Downtime by Reason and Shift"}
                        color={filterColors.downtimeByReasonAndShift.itemcolor}
                        description={
                          "Shows how different types of downtime events distribute across shifts. Useful for identifying shift-specific issues and optimizing shift operations and maintenance schedules."
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <HeatMap
                        data={downtimeOeeData?.downtimeAnalysis || []}
                        xKey={"reason"}
                        yKey={"machine"}
                        valueKey={"occurrences"}
                        title={"Downtime Analysis"}
                        description={
                          "A heat map showing the relationship between machines and downtime reasons. Helps identify patterns and combinations of issues that may require specific attention or intervention."
                        }
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            // {
            //   label: "Cumulative Data",
            //   key: "5",
            //   children: (
            //     <Row gutter={[16, 16]}>
            //       <Col span={24}>
            //         <AreaChart
            //           color={filterColors.oeeOverTime}
            //           data={downtimeOeeData?.cumulativeDowntime || []}
            //           title={"Cumulative Downtime"}
            //           description={
            //             "Displays the accumulation of downtime over a period. This visualization helps understand the total impact of downtime and identify periods of accelerated equipment stoppage."
            //           }
            //         />
            //       </Col>
            //     </Row>
            //   ),
            // },
            {
              label: "Trend Analysis",
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
                      <BarChartPopup
                        data={downtimeOeeData?.downtimeByWorkCenter || []}
                        title={"Downtime By Workcenter"}
                        color={filterColors.downtimeByMachine.itemcolor}
                        theshold={filterColors.downtimeByMachine.threshold}
                        type={getChartConfig(1).type}
                        description="Compares downtime across different work centers. Click to see machine-level details."
                        onBarClick={(x, y) => handleBarClick(x, y, 1)}
                      />
                    </Col>

                    {2 >= 1 && (
                      <Col span={12}>
                        <PiChart
                          data={downtimeOeeData?.downtimeByMachine || []}
                          title={"Downtime By Machine"}
                          color={filterColors.downtimeByMachine.itemcolor}
                          theshold={filterColors.downtimeByMachine.threshold}
                          type={getChartConfig(2).type}
                          description="Shows machine-specific downtime. Click to see reason breakdown."
                          onBarClick={(x, y) => handleBarClick(x, y, 2)}
                        />
                      </Col>
                    )}

                    {3 >= 2 && (
                      <Col span={12}>
                        <StackedBarChart
                          data={downtimeOeeData.downtimeByReasonMachine || []}
                          title={"Downtime By Resource And Interval"}
                          color={filterColors?.qualityByMachine?.itemcolor}
                          theshold={filterColors.downtimeByMachine.threshold}
                          type={getChartConfig(3).type}
                          description="Displays downtime reasons for the selected machine. Click for detailed analysis."
                          onBarClick={(x, y) => handleBarClick(x, y, 3)}
                        />
                      </Col>
                    )}

                    {4 >= 3 && (
                      <Col span={12}>
                        <ParetoChart
                          data={downtimeOeeData?.detailedAnalysisReason || []}
                          title="Downtime By Reason Code"
                          threshold={filterColors.performanceLossReasons}
                          color={filterColors.performanceLossReasons}
                          description={
                            "Shows the relationship between performance and downtime events. This analysis helps understand how different types of stops or delays impact overall performance."
                          }
                        />
                      </Col>
                    )}
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </div>

      <style jsx global>{`
        .ant-tabs-nav::before {
          border-bottom: none !important;
        }
        .ant-tabs {
          height: calc(100vh - 120px) !important;
        }
        .ant-tabs-content-holder {
          height: calc(100vh - 170px) !important;
        }
        .ant-tabs-content {
          height: 100%;
        }
        .ant-tabs-tabpane {
          height: 100%;
        }
      `}</style>
    </Content>
  );
};

export default DownTime;
