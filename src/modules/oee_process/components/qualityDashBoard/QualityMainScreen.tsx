// pages/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { Layout, Row, Col } from "antd";

import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import LineChart from "../reuse/LineChart";
import BarChart from "../reuse/BarChart";
import PiChart from "../reuse/PiChart";
import ParetoChart from "../reuse/ParetoChart";
import StackedBarChart from "../reuse/StackBar";
import RadarChart from "../reuse/RadarChar";
import MyGaugeChart from "../reuse/Gauge";
import { useSettingsData } from "@modules/oee_process/hooks/settingsData";

const { Content } = Layout;

interface QualityScreenData {
  downloadAllPDF: () => void;
}

const QualityScreen: React.FC = () => {


  //gauge chart
  const qualityPercentage = {
    timePeriod: "2024-09-01 to 2024-09-07",
    machine: "Machine 1",
    shift: "Shift A",
    qualityPercentage: 95,
  };
  //line chart
  const qualityOverTime = {
    timePeriod: "2024-09-01 to 2024-09-07",
    machine: "Machine 1",
    qualityOverTime: [
      {
        date: "2024-09-01",
        qualityPercentage: 30,
      },
      {
        date: "2024-09-01",
        qualityPercentage: 94,
      },
      {
        date: "2024-09-01",
        qualityPercentage: 93,
      },
    ],
  };
  const resourceByShift = {
    timePeriod: "2024-09-01 to 2024-09-07",
    resourceByShift: [
      { shift: "MACHINE 1", goodQuality: 95, badQuality: 5 },
      { shift: "MACHINE 2", goodQuality: 78, badQuality: 22 },
      { shift: "MACHINE 3", goodQuality: 88, badQuality: 12 },
      { shift: "MACHINE 4", goodQuality: 62, badQuality: 38 },
      { shift: "MACHINE 5", goodQuality: 91, badQuality: 9 },
      { shift: "MACHINE 6", goodQuality: 85, badQuality: 15 },
      { shift: "MACHINE 7", goodQuality: 73, badQuality: 27 }
    ],
  };
  //bar chart
  const qualityByShift = {
    timePeriod: "2024-09-01 to 2024-09-07",
    qualityByShift: [
      {
        shift: "SHIFT A",
        qualityPercentage: 95,
      },
      {
        shift: "SHIFT B",
        qualityPercentage: 92,
      },
    ],
  };
  //pie chart
  const qualityByMachine = {
    timePeriod: "2024-09-01 to 2024-09-07",
    qualityByMachine: [
      {
        machine: "MACHINE 1",
        qualityPercentage: 96,
      },
      {
        machine: "MACHINE 2",
        qualityPercentage: 93,
      },
      {
        machine: "MACHINE 3",
        qualityPercentage: 94,
      },
    ],
  };
  //stack bar chart
  const QualitybyProduct = {
    timePeriod: "2024-09-01 to 2024-09-07",
    qualityByProduct: [
      {
        product: "PRODUCT A",
        machine: "MACHINE 1",
        qualityPercentage: 97,
      },
      {
        product: "PRODUCT B",
        machine: "MACHINE 2",
        qualityPercentage: 94,
      },
    ],
  };
  //pareto chart
  const defectsByReason = {
    timePeriod: "2024-09-01 to 2024-09-07",
    defectsByReason: [
      {
        reason: "Material Failure",
        occurrences: 10,
        cumulativePercentage: 60,
      },
      {
        reason: "Human Error",
        occurrences: 5,
        cumulativePercentage: 80,
      },
      {
        reason: "Machine Fault",
        occurrences: 2,
        cumulativePercentage: 90,
      },
    ],
  };
  //stack bar chart
  const qualityLossByProductionLine = {
    timePeriod: "2024-09-01 to 2024-09-07",
    qualityLossByProductionLine: [
      {
        line: "LINE 1",
        reason: "MATERIAL DEFECT",
        lossPercentage: 5,
      },
      {
        line: "LINE 2",
        reason: "MACHINE ERROR",
        lossPercentage: 3,
      },
      {
        line: "LINE 3",
        reason: "OPERATOR ERROR",
        lossPercentage: 4,
      },
    ],
  };
  //Radar Chart
  const qualityByOperator = {
    timePeriod: "2024-09-01 to 2024-09-07",
    qualityByOperator: [
      { operator: "OPERATOR A", qualityPercentage: 30 },
      { operator: "OPERATOR B", qualityPercentage: 92 },
      { operator: "OPERATOR c", qualityPercentage: 50 },
    ],
  };
  //pie chart
  const defectDistributionByProduct = {
    timePeriod: "2024-09-01 TO 2024-09-07",
    defectDistributionByProduct: [
      {
        PRODUCT: "PRODUCT A",
        DEFECTPERCENTAGE: 3,
      },
      {
        PRODUCT: "PRODUCT B",
        DEFECTPERCENTAGE: 5,
      },
      {
        PRODUCT: "PRODUCT C",
        DEFECTPERCENTAGE: 2,
      },
    ],
  };
 
  const defectTrendOverTime = {
    timePeriod: "2024-09-01 to 2024-09-07",
    defectTrendOverTime: [
      {
        date: "2024-09-01",
        defects: 3,
      },
      {
        date: "2024-09-02",
        defects: 5,
      },
      {
        date: "2024-09-03",
        defects: 2,
      },
    ],
  };

  //heat map chart
  const data7 = [
    [1, 2, 3, 4, 5, 6, 7], // Defect counts for 00:00
    [2, 3, 4, 5, 6, 7, 8], // Defect counts for 01:00
    [3, 4, 5, 6, 7, 8, 9], // Defect counts for 02:00
    [4, 5, 6, 7, 8, 9, 10], // Defect counts for 03:00
    [5, 6, 7, 8, 9, 10, 11], // Defect counts for 04:00
    [6, 7, 8, 9, 10, 11, 12], // Defect counts for 05:00
    [7, 8, 9, 10, 11, 12, 13], // Defect counts for 06:00
  ];

  const contentRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener("resize", checkZoom);
    checkZoom(); // Check initial state
    return () => window.removeEventListener("resize", checkZoom);
  }, []);
  const { color,qualityOeeData } = useFilterContext();
 const { filterColors } = useSettingsData();
  return (
    <Content ref={contentRef} style={{ padding: "0 50px", marginTop: "20px" }}>
      <div className="site-layout-content">
        <Row gutter={[18, 18]}>
          <Col span={isZoomed ? 24 : 12}>
            <MyGaugeChart
              value={qualityOeeData?.overallQuality?.qualityPercentage}
              color={color}
              title={"Quality OverAll Percentage"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* LineChart */}
            <LineChart
              data={
                qualityOeeData?.qualityByTime?.qualityOverTime 
                // ||
                // qualityOverTime.qualityOverTime
              }
              title={"Quality Over Time"}
              color={filterColors.qualityOverTime}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* BarChart */}
            <BarChart
              data={
                qualityOeeData?.qualityByShift?.qualityByShift 
                  // ||
                  // qualityByShift.qualityByShift
              }
              title={"Quality by Shift"}
              color={filterColors.qualityByShift.itemcolor}
              theshold={filterColors.qualityByShift.threshold}
              
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* PieChart */}
            <PiChart
              data={
                qualityOeeData?.qualityByMachine?.qualityByMachine 
                // ||
                // qualityByMachine.qualityByMachine
              }
              title={"Quality by Machine"}
              color={filterColors.qualityByMachine.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* StackBar */}
            <StackedBarChart
              data={
                qualityOeeData?.qualityByProduct?.qualityByProduct 
                // ||
                // QualitybyProduct.qualityByProduct
              }
              title={"Quality by Product"}
              color={filterColors.qualityByProduct.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* ParetoChart */}
            <ParetoChart
              data={
                qualityOeeData?.defectsByReason?.defectsByReason 
                // ||
                // defectsByReason.defectsByReason
              }
              title={"Defects by Reason"}
              color={filterColors.downtimeImpact}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* StackedBarChart */}
            <StackedBarChart
              data={
                qualityOeeData?.qualityLossByProductionLine
                  ?.qualityLossByProductionLine
                //    ||
                // qualityLossByProductionLine.qualityLossByProductionLine
              }
              title={"Quality Loss by Production Line"}
              color={filterColors.qualityLossByProductionLine.itemcolor}
            />
          </Col>
          {/* <Col span={isZoomed ? 24 : 12}>
            <RadarChart
              data={qualityByOperator.qualityByOperator}
              title="Quality by Operator"
            />
          </Col> */}
          <Col span={isZoomed ? 24 : 12}>
            {/* PieChart */}
            <PiChart
              data={
                qualityOeeData?.defectDistributionByProduct?.defectsByProduct 
                ||
                defectDistributionByProduct.defectDistributionByProduct
              }
              title={"Defect Distribution by Product"}
              color={filterColors.defectDistributionByProduct.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* LineChart */}
            <LineChart
              data={
                qualityOeeData?.defectTrendByTime?.defectTrendOverTime ||
                defectTrendOverTime.defectTrendOverTime
              }
              title={"Defect Trend Over Time"}
              color={filterColors.defectTrendOverTime}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            {/* BarChart */}
            <BarChart
              data={qualityOeeData?.getGoodVsBadQtyForResource?.qualityOverTime || resourceByShift?.resourceByShift}
              title={"Good Quality Vs Bad Quality Against Resource"}
              color={filterColors.goodQualityVsBadQuality?.itemcolor}
              theshold={filterColors.goodQualityVsBadQuality?.threshold}
            />
          </Col>
          {/* <Col span={isZoomed ? 24 : 12}>
            <LineChart
              data={qualityOeeData?.getScrapAndReworkTrend?.qualityByShift || [
                { date: "2024-09-01", scrap: 20, rework: 95 },
                { date: "2024-09-02", scrap: 25, rework: 90 },
                { date: "2024-09-03", scrap: 30, rework: 85 },
                { date: "2024-09-04", scrap: 35, rework: 80 },
                { date: "2024-09-05", scrap: 28, rework: 75 },
                { date: "2024-09-06", scrap: 40, rework: 70 },
                { date: "2024-09-07", scrap: 32, rework: 65 },
                { date: "2024-09-08", scrap: 37, rework: 20 }
              ]
              }
              title={"Scrap and Rework Trend"}
              color={filterColors.scrapReworkTrend}
            />
          </Col> */}
          <Col span={isZoomed ? 24 : 12}>
            {/*HeatMapChart*/}
            {/* <DefectHeatmap data={data7} color={color} /> */}
          </Col>
        </Row>
      </div>
    </Content>
  );
};

export default QualityScreen;
