// pages/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { Layout, Row, Col, Tabs, Progress } from "antd";

import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import LineChart from "../reuse/LineChart";
import BarChart from "../reuse/BarChart";
import PiChart from "../reuse/PiChart";
import ParetoChart from "../reuse/ParetoChart";
import StackedBarChart from "../reuse/StackBar";
import RadarChart from "../reuse/RadarChar";
import MyGaugeChart from "../reuse/Gauge";
import { useSettingsData } from "@modules/oee_discrete/hooks/settingsData";
import TestGauge from "../oee/TestGauge";
import BarChartQty from "../reuse/BarChartQty";
import TimeByPeriod from "../reuse/TimeByPeriod";
import HeatmapDownTime from "../reuse/HeatMapDownTime";
import HeatmapQuality from "../reuse/HeatMapquality";
import MultilineChart from "../reuse/multilineChart";
import HorizondallyChart from "../reuse/HorizondallyChart";
const { Content } = Layout;
const { TabPane } = Tabs;

interface QualityScreenData {
  downloadAllPDF: () => void;
}

const QualityScreen: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { qualityOeeData } = useFilterContext();
  const { filterColors } = useSettingsData();

  const getColorByPercentage = (value: number) => {
    if (value >= 85) return "#52c41a"; // Green for good
    if (value >= 60) return "#faad14"; // Yellow for warning
    return "#f5222d"; // Red for poor
  };

  const overallQuality = qualityOeeData?.getOverall?.percentage || 0;
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
        Overall Quality
      </div>
      <div style={{ flex: 1 }}>
        <Progress
          percent={Number(overallQuality.toFixed(1))}
          size="small"
          strokeColor={{
            "0%": getColorByPercentage(overallQuality),
            "100%": getColorByPercentage(overallQuality),
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
              label: "Quality Trend",
              key: "1",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    {/* <LineChart
                      data={qualityOeeData?.qualityOverTime || []}
                      title={"Quality Over Time"}
                      color={filterColors.qualityOverTime}
                      description={
                        "Tracks quality trends over time. This visualization helps identify patterns, improvements, or degradation in product quality, enabling proactive quality management."
                      }
                    /> */}
                    <MultilineChart
                      data={qualityOeeData?.qualityOverTime || []}
                      title="Quality Over Time"
                      yAxisLabel={"Quality Percentage %"}
                      unit="%"
                      valueField="percentage"
                      resourceField="resource"
                    />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Rejection & Quality Trend Analysis",
              key: "2",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    {/* <LineChart
                      data={qualityOeeData?.scrapReworkTrend || []}
                      title={"Scrap and Rework Trend"}
                      color={filterColors.scrapReworkTrend}
                      description={
                        "Tracks trends in scrap and rework rates over time. This helps monitor the cost impact of quality issues and the effectiveness of waste reduction efforts."
                      }
                    /> */}
                    <ParetoChart
                        data={
                          qualityOeeData?.scrapReworkTrend || []
                        }
                        title="Rejection and Quality Trend"
                        color={filterColors.performanceLossReasons}
                        description={
                          "Tracks trends in scrap and Quality over time. This helps monitor the cost impact of quality issues and the effectiveness of waste reduction efforts."
                        }
                      />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Defect Trend",
              key: "3",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    {/* <LineChart
                      data={qualityOeeData?.defectTrendOverTime || []}
                      title={"Defect Trend Over Time"}
                      type="count"
                      color={filterColors.defectTrendOverTime}
                      description={
                        "Shows how defect rates change over time. This trend analysis helps identify the effectiveness of quality improvement initiatives and potential emerging quality issues."
                      }
                    /> */}
                    <MultilineChart
                      data={qualityOeeData?.defectTrendOverTime || []}
                      title="Defect Trend Over Time"
                      yAxisLabel={"Rejection count"}
                      valueField="defects"
                      resourceField="resourceId"
                      unit=""
                    />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Shift & Machine Analysis",
              key: "4",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <BarChart
                      data={qualityOeeData?.qualityByShift || []}
                      title={"Quality by Shift"}
                      color={filterColors.qualityByShift.itemcolor}
                      theshold={filterColors.qualityByShift.threshold}
                      description={
                        "Compares quality metrics across different shifts. This helps identify variations in product quality between shifts and potential areas for process standardization."
                      }
                      showXAxisLabel={true}
                    />
                  </Col>
                  <Col span={12}>
                    <PiChart
                      data={qualityOeeData?.qualityByMachine || []}
                      title={"Quality by Machine"}
                      color={filterColors.qualityByMachine.itemcolor}
                      description={
                        "Shows the distribution of quality metrics across different machines. Helps identify which machines consistently produce high-quality output and which may need adjustment or maintenance."
                      }
                    />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Production Line Analysis",
              key: "5",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    {/* <BarChart
                      data={qualityOeeData?.qualityLossByProductionLine || []}
                      title={"Quality Loss by Production Line"}
                      color={filterColors.qualityLossByProductionLine.itemcolor}
                      description={
                        "Shows quality losses across different production lines. This helps identify which lines may need process improvements or additional quality control measures."
                      }
                      theshold={undefined}
                    /> */}
                    <HorizondallyChart
                        data={qualityOeeData?.qualityLossByProductionLine || []}
                        title="Quality Loss by Production Line"
                        description={
                          "Shows quality losses across different production lines. This helps identify which lines may need process improvements or additional quality control measures."
                        }
                      />
                  </Col>
                  <Col span={12}>
                    <BarChart
                      data={qualityOeeData?.goodQualityVsBadQuality || []}
                      title={"Good vs Rejected Quantity by Resource"}
                      color={filterColors.goodQualityVsBadQuality?.itemcolor}
                      theshold={filterColors.goodQualityVsBadQuality?.threshold}
                      unit="count"
                      description={
                        "Compares the quantity of good versus defective products by resource. This helps evaluate the effectiveness of different resources in maintaining quality standards."
                      }
                      group={true}
                    />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Product Analysis",
              key: "6",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <BarChart
                      data={qualityOeeData?.qualityByProduct || []}
                      title={"Quality by Product"}
                      color={filterColors.qualityByProduct.itemcolor || []}
                      description={
                        "Breaks down quality metrics by product type. This helps identify which products have consistent quality and which ones might need process improvements."
                      }
                      theshold={undefined}
                      unit ={"count"}
                    />
                  </Col>
                  <Col span={12}>
                    <PiChart
                      data={qualityOeeData?.defectDistributionByProduct || []}
                      title={"Defect Distribution by Product"}
                      color={filterColors.defectDistributionByProduct.itemcolor}
                      description={
                        "Visualizes how defects are distributed across different products. This helps identify which products are more prone to quality issues and may need special attention."
                      }
                    />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Operation Analysis",
              key: "7",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <BarChart
                      title={"Quality by Operation"}
                      data={qualityOeeData?.oeeByOperation || []}
                      color={filterColors.oeeByMachine.itemcolor}
                      theshold={filterColors.oeeByMachine.threshold}
                      description={
                        "This bar chart displays the Overall Equipment Effectiveness (OEE) for different operations within the production process. By analyzing OEE at the operational level, you can identify bottlenecks, measure efficiency variations, and pinpoint areas that need improvement. Each bar represents the OEE percentage for a specific operation, helping assess performance trends over time and optimize production workflows."
                      }
                    />
                  </Col>
                </Row>
              ),
            },
            {
              label: "Defect Analysis",
              key: "8",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    <ParetoChart
                      data={qualityOeeData?.defectsByReason || []}
                      title={"Defects by Reason"}
                      color={filterColors.defectsByReason}
                      description={
                        "A Pareto analysis of defect causes. This helps prioritize quality improvement efforts by identifying the vital few issues causing the majority of quality problems."
                      }
                    />
                  </Col>
                </Row>
              ),
            },
            // {
            //   label: "Quality Time by Period",
            //   key: "8",
            //   children: <TimeByPeriod historicalData={qualityOeeData?.qualityTimePeriodData?.qualitydata || []} type="quality"/>,
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

export default QualityScreen;
