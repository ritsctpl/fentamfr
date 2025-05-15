import React, { useRef } from "react";
import { Layout, Row, Col, Tabs, Progress } from "antd";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import LineChart from "../reuse/LineChart";
import BarChart from "../reuse/BarChart";
import StackedBarChart from "../reuse/StackBar";
import ParetoChart from "../reuse/ParetoChart";
import RadarChart from "../reuse/RadarChar";
import { useSettingsData } from "@modules/oee_discrete/hooks/settingsData";
import TimeByPeriod from "../reuse/TimeByPeriod";
import MultilineChart from "../reuse/multilineChart";
import HorizondallyChart from "../reuse/HorizondallyChart";

const { Content } = Layout;
const { TabPane } = Tabs;

const OeeScreen: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { overallOeeData } = useFilterContext();
  const { filterColors } = useSettingsData();

  const getColorByPercentage = (value: number) => {
    if (value >= 85) return "#52c41a"; // Green for good
    if (value >= 60) return "#faad14"; // Yellow for warning
    return "#f5222d"; // Red for poor
  };

  const overallOee = overallOeeData?.getOverall?.percentage || 0;

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
        Overall OEE
      </div>
      <div style={{ flex: 1 }}>
        <Progress
          percent={Number(overallOee.toFixed(1))}
          size="small"
          strokeColor={{
            "0%": getColorByPercentage(overallOee),
            "100%": getColorByPercentage(overallOee),
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
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          tabBarStyle={{
            marginBottom: "8px",
            height: "32px",
          }}
          items={[
            {
              label: "OEE Trend",
              key: "1",
              children: (
                <div
                  style={{
                    height: "100%",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[12, 12]}>
                    <Col span={24}>
                      {/* <LineChart
                        title={"OEE Over Time"}
                        data={overallOeeData?.oeeOverTime || []}
                        color={filterColors.oeeOverTime}
                        description={
                          "A line chart tracking OEE over time is an invaluable tool for visualizing the fluctuations in equipment effectiveness across a specific period. By plotting OEE values on the vertical axis (Y-axis) and time intervals on the horizontal axis (X-axis), this chart provides a clear, easy-to-understand representation of operational performance over time."
                        }
                      /> */}
                      <MultilineChart
                        data={overallOeeData?.oeeOverTime || []}
                        title="OEE Over Time"
                        yAxisLabel={"OEE Percentage %"}
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
              label: "Component Trend",
              key: "2",
              children: (
                <div
                  style={{
                    height: "100%",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[12, 12]}>
                    <Col span={24}>
                      {/* <LineChart
                        title={"OEE Component Trend Over Time"}
                        data={overallOeeData?.oeeByComponent || []}
                        color={filterColors.oeeByComponent}
                        description={
                          "The OEE Component Trend Over Time chart tracks how the individual components of OEE (Availability, Performance, and Quality) change over time. This temporal view helps identify patterns, trends, and potential correlations between different OEE components, enabling more informed decision-making for continuous improvement efforts."
                        }
                      /> */}
                       <BarChart
                        title="OEE Component Trend"
                        data={overallOeeData?.oeeByComponent || []}
                        color={filterColors.oeeByComponent}
                        description={
                          "The OEE Component Trend Over Time chart tracks how the individual components of OEE (Availability, Performance, and Quality) change over time. This temporal view helps identify patterns, trends, and potential correlations between different OEE components, enabling more informed decision-making for continuous improvement efforts."
                        }
                        theshold={undefined}
                        group={true}
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              label: "Resource Analysis",
              key: "3",
              children: (
                <div
                  style={{
                    height: "100%",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <BarChart
                        data={overallOeeData?.oeeByShift || []}
                        title="OEE by Shift"
                        unit="%"
                        color={filterColors.oeeByShift.itemcolor}
                        description={
                          "The OEE by Shift chart presents a stacked bar visualization that breaks down performance across different work shifts. This allows managers to identify patterns in efficiency between shifts, compare shift performance, and understand how different teams or operating conditions might affect overall equipment effectiveness."
                        }
                        theshold={undefined}
                        showXAxisLabel={true}
                      />
                    </Col>
                    <Col span={12}>
                      <BarChart
                        data={overallOeeData?.oeeByMachine || []}
                        color={filterColors.oeeByMachine.itemcolor}
                        theshold={undefined}
                        title="OEE by Machine"
                        unit="%"
                        description={
                          "A bar chart displaying OEE by Machine is a powerful tool for comparing the performance of individual machines across a specific time period. This type of chart provides a clear visual representation of each machine's Overall Equipment Effectiveness (OEE), making it easy to identify underperforming equipment and prioritize areas for improvement."
                        }
                        showXAxisLabel={false}
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              label: "OEE Component Analysis",
              key: "4",
              children: (
                <div
                  style={{
                    height: "100%",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <BarChart
                        title={"OEE by Operation"}
                        data={overallOeeData?.oeeByOperation || []}
                        color={filterColors.oeeByMachine.itemcolor}
                        theshold={filterColors.oeeByMachine.threshold}
                        description={
                          "This bar chart displays the Overall Equipment Effectiveness (OEE) for different operations within the production process. By analyzing OEE at the operational level, you can identify bottlenecks, measure efficiency variations, and pinpoint areas that need improvement. Each bar represents the OEE percentage for a specific operation, helping assess performance trends over time and optimize production workflows."
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <BarChart
                        title={"OEE Component Breakdown"}
                        data={overallOeeData?.oeeBreakdown || []}
                        color={filterColors?.oeeBreakdown?.itemcolor}
                        theshold={filterColors?.oeeBreakdown?.threshold}
                        description={
                          "The OEE Component Breakdown chart displays the three fundamental components of OEE: Availability, Performance, and Quality. This visualization helps identify which factors are having the greatest impact on overall equipment effectiveness, enabling targeted improvement initiatives in specific areas."
                        }
                        group={true}
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              label: "Production Analysis",
              key: "5",
              children: (
                <div
                  style={{
                    height: "100%",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <HorizondallyChart
                        data={overallOeeData?.oeeByProductionLine || []}
                        title="OEE by Production Line"
                        description={"The OEE by Production Line radar chart provides a multi-dimensional view of OEE across different production lines. This visualization makes it easy to compare multiple production lines simultaneously and identify which lines are performing optimally or need attention across various performance metrics."} color={undefined} theshold={undefined}                      />
                    </Col>
                    <Col span={12}>
                      <BarChart
                        title="OEE by Product"
                        data={overallOeeData?.oeeByProduct || []}
                        color={filterColors?.oeeByProduct?.itemcolor}
                        description={
                          "The OEE by Product chart shows how equipment effectiveness varies across different products being manufactured. This helps identify which products might be causing efficiency challenges or which ones are performing optimally, enabling better production planning and process optimization."
                        }
                        theshold={undefined}
                        group={true}
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },
            // {
            //   label: "Oee Time by Period",
            //   key: "6",
            //   children: <TimeByPeriod historicalData={overallOeeData?.oeeTimePeriodData?.oeeData || []} type="oee"/>
            // },
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

export default OeeScreen;
