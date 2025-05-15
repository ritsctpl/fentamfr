import React, { useRef } from "react";
import { Layout, Row, Col, Tabs, Progress } from "antd";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import LineChart from "../reuse/LineChart";
import BarChart from "../reuse/BarChart";
import ParetoChart from "../reuse/ParetoChart";
import { useSettingsData } from "@modules/oee_discrete/hooks/settingsData";
import TimeByPeriod from "../reuse/TimeByPeriod";
import MultilineChart from "../reuse/multilineChart";

const { Content } = Layout;
const { TabPane } = Tabs;

const Availability: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { availabilityOeeData } = useFilterContext();
  const { filterColors } = useSettingsData();

  const getColorByPercentage = (value: number) => {
    if (value >= 85) return "#52c41a"; // Green for good
    if (value >= 60) return "#faad14"; // Yellow for warning
    return "#f5222d"; // Red for poor
  };

  const overallAvailability = availabilityOeeData?.getOverall || 0;

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
        Overall Availability
      </div>
      <div style={{ flex: 1 }}>
        <Progress
          percent={Number(overallAvailability.toFixed(1))}
          size="small"
          strokeColor={{
            "0%": getColorByPercentage(overallAvailability),
            "100%": getColorByPercentage(overallAvailability),
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
              label: "Availability Trend",
              key: "1",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    {/* <LineChart
                      color={filterColors.availabilityOverTime}
                      data={availabilityOeeData?.availabilityOverTime || []}
                      title={"Availability Over Time"}
                      description={
                        "Tracks equipment availability trends over time. This chart helps identify long-term patterns, seasonal variations, and the impact of improvement initiatives on equipment availability."
                      }
                    /> */}
                     <MultilineChart
                        data={availabilityOeeData?.availabilityOverTime || []}
                        title="Availability Over Time"
                        yAxisLabel={"Availability Percentage %"}
                        unit="%"
                        valueField="percentage"
                        resourceField="resource"
                      />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Resource Analysis",
              key: "2",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <BarChart
                      color={filterColors.availabilityByShift.itemcolor}
                      data={availabilityOeeData?.availabilityByShift || []}
                      title={"Availability by Shift"}
                      theshold={filterColors.availabilityByShift.threshold}
                      description={
                        "Compares equipment availability across different shifts. This visualization helps identify patterns in equipment utilization and potential scheduling improvements between shifts."
                      }
                      showXAxisLabel={true}
                    />
                  </Col>
                  <Col span={12}>
                    <BarChart
                      data={availabilityOeeData?.availabilityByMachine || []}
                      title={"Availability by Machine"}
                      color={filterColors.availabilityByMachine.itemcolor}
                      theshold={filterColors.availabilityByMachine.threshold}
                      description={
                        "Shows availability metrics for different machines. This helps identify which equipment might be experiencing more downtime or requiring additional maintenance attention."
                      }
                    />
                  </Col>
                </Row>
              ),
            },
            // {
            //   label: "Operation Analysis",
            //   key: "3",
            //   children: (
            //     <Row gutter={[16, 16]}>
            //       <Col span={24}>
            //         <BarChart
            //           title={"Availability by Operation"}
            //           data={availabilityOeeData?.oeeByOperation || []}
            //           color={filterColors.oeeByMachine.itemcolor}
            //           theshold={filterColors.oeeByMachine.threshold}
            //           description={
            //             "This bar chart displays the Overall Equipment Effectiveness (OEE) for different operations within the production process. By analyzing OEE at the operational level, you can identify bottlenecks, measure efficiency variations, and pinpoint areas that need improvement. Each bar represents the OEE percentage for a specific operation, helping assess performance trends over time and optimize production workflows."
            //           }
            //         />
            //       </Col>
            //     </Row>
            //   ),
            // },
            {
              label: "Downtime Analysis",
              key: "3",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    <ParetoChart
                      data={availabilityOeeData?.availabilityByDowntime || []}
                      title={"Availability Downtime Pareto"}
                      color={filterColors.availabilityByMachine}
                      description={
                        "A Pareto analysis of downtime causes affecting availability. This helps prioritize improvement efforts by identifying the vital few issues causing the majority of availability losses."
                      }
                    />
                  </Col>
                </Row>
              ),
            },
            // {
            //   label: "Availability Time by Period",
            //   key: "6",
            //   children: <TimeByPeriod historicalData={availabilityOeeData?.availabilityTimePeriodData?.availabilitydata || []} type="availability"/>,
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

export default Availability;
