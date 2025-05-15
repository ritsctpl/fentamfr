import React, { useEffect, useState, useRef } from 'react';
import { Layout, Row, Col, Button, Card, Dropdown, Menu } from 'antd';
import GaugeChart from './GaugeChart';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import LineChart from '../reuse/LineChart';
import BarChart from '../reuse/BarChart';
import StackedBarChart from '../reuse/StackBar';
import ParetoChart from '../reuse/ParetoChart';
import RadarChart from '../reuse/RadarChar';
import { useSettingsData } from '@modules/oee_process/hooks/settingsData';

const { Content } = Layout;

const data5 = 35
const data6 = 88
const data7 = 62


const OeeScreen: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { overallOeeData, color } = useFilterContext()
  const [isZoomed, setIsZoomed] = useState(false);
  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener('resize', checkZoom);
    checkZoom();
    return () => window.removeEventListener('resize', checkZoom);
  }, []);
 const { filterColors } = useSettingsData();
  return (
    <Content ref={contentRef} style={{ padding: "0 50px", marginTop: "20px" }}>
      <div className="site-layout-content">
        <Row
          gutter={[16, 16]}
          justify="center"
          style={{
            marginBottom: "20px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "10px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart
              value={overallOeeData?.getOverallOEE?.oeePercentage || 0}
              type={"OEE Overview"}
            />
          </Col>
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart value={data5} type={"Availability Rate"} />
          </Col>
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart value={data6} type={"Performance Rate"} />
          </Col>
          <Col span={isZoomed ? 10 : 6}>
            <GaugeChart value={data7} type={"Quality Rate"} />
          </Col>
        </Row>
        <Row gutter={[16, 16]} justify="center">
          <Col span={isZoomed ? 24 : 12}>
            <LineChart
              title={"OEE Over Time"}
              data={
                overallOeeData?.getOEEOverTime?.oeeOverTime 
                // || [
                //   { date: "2024-09-01", OEEPERCENTAGE: 92 },
                //   { date: "2024-09-02", OEEPERCENTAGE: 45 },
                //   { date: "2024-09-03", OEEPERCENTAGE: 78 },
                //   { date: "2024-09-04", OEEPERCENTAGE: 23 },
                //   { date: "2024-09-05", OEEPERCENTAGE: 95 },
                //   { date: "2024-09-06", OEEPERCENTAGE: 67 },
                //   { date: "2024-09-07", OEEPERCENTAGE: 82 },
                // ]
              }
              color={filterColors.oeeOverTime}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <BarChart
              title={"OEE by Machine"}
              data={
                overallOeeData?.getOEEByMachine?.oeeByMachine 
                // || [
                //   { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
                //   { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
                //   { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
                //   { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
                //   { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
                //   { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
                //   { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
                // ]
              }
              color={filterColors.oeeByMachine.itemcolor}
              theshold={filterColors.oeeByMachine.threshold}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <StackedBarChart
              data={
                overallOeeData?.getOEEByShift?.oeeByShift 
                // || [
                //   {
                //     SHIFT: "SHIFT A",
                //     AVAILABILITY: 90,
                //     PERFORMANCE: 45,
                //     QUALITY: 95,
                //   },
                //   {
                //     SHIFT: "SHIFT B",
                //     AVAILABILITY: 38,
                //     PERFORMANCE: 84,
                //     QUALITY: 72,
                //   },
                //   {
                //     SHIFT: "SHIFT C",
                //     AVAILABILITY: 65,
                //     PERFORMANCE: 92,
                //     QUALITY: 28,
                //   },
                //   {
                //     SHIFT: "SHIFT D",
                //     AVAILABILITY: 78,
                //     PERFORMANCE: 55,
                //     QUALITY: 89,
                //   },
                //   {
                //     SHIFT: "SHIFT E",
                //     AVAILABILITY: 92,
                //     PERFORMANCE: 78,
                //     QUALITY: 45,
                //   },
                //   {
                //     SHIFT: "SHIFT F",
                //     AVAILABILITY: 45,
                //     PERFORMANCE: 95,
                //     QUALITY: 67,
                //   },
                // ]
              }
              title="OEE by Shift"
              color={filterColors.oeeByShift.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <BarChart
              title={"OEE Breakdown"}
              data={
                overallOeeData?.getOEEBreakdown?.oeeBreakdown 
                // || [
                //   {
                //     MACHINE: "MACHINE 1",
                //     AVAILABILITY: 92,
                //     PERFORMANCE: 83,
                //     QUALITY: 94,
                //   },
                //   {
                //     MACHINE: "MACHINE 2",
                //     AVAILABILITY: 45,
                //     PERFORMANCE: 78,
                //     QUALITY: 65,
                //   },
                //   {
                //     MACHINE: "MACHINE 3",
                //     AVAILABILITY: 78,
                //     PERFORMANCE: 92,
                //     QUALITY: 88,
                //   },
                //   {
                //     MACHINE: "MACHINE 4",
                //     AVAILABILITY: 35,
                //     PERFORMANCE: 45,
                //     QUALITY: 72,
                //   },
                //   {
                //     MACHINE: "MACHINE 5",
                //     AVAILABILITY: 89,
                //     PERFORMANCE: 67,
                //     QUALITY: 83,
                //   },
                //   {
                //     MACHINE: "MACHINE 6",
                //     AVAILABILITY: 67,
                //     PERFORMANCE: 88,
                //     QUALITY: 45,
                //   },
                //   {
                //     MACHINE: "MACHINE 7",
                //     AVAILABILITY: 73,
                //     PERFORMANCE: 55,
                //     QUALITY: 91,
                //   },
                // ]
              }
              color={filterColors.oeeByMachine.itemcolor}
              theshold={filterColors.oeeByMachine.threshold}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <ParetoChart
              title={"OEE Loss by Reason"}
              data={[
                {
                  REASON: "DOWNTIME",
                  LOSSPERCENTAGE: 35,
                  CUMULATIVEPERCENTAGE: 35,
                },
                {
                  REASON: "SETUP TIME",
                  LOSSPERCENTAGE: 28,
                  CUMULATIVEPERCENTAGE: 63,
                },
                {
                  REASON: "DEFECTS",
                  LOSSPERCENTAGE: 20,
                  CUMULATIVEPERCENTAGE: 83,
                },
                {
                  REASON: "SPEED LOSS",
                  LOSSPERCENTAGE: 12,
                  CUMULATIVEPERCENTAGE: 95,
                },
                {
                  REASON: "MAINTENANCE",
                  LOSSPERCENTAGE: 8,
                  CUMULATIVEPERCENTAGE: 97,
                },
                {
                  REASON: "CHANGEOVER",
                  LOSSPERCENTAGE: 5,
                  CUMULATIVEPERCENTAGE: 99,
                },
                {
                  REASON: "OTHER",
                  LOSSPERCENTAGE: 2,
                  CUMULATIVEPERCENTAGE: 100,
                },
              ]}
              color={filterColors.oeeLossByReason}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <RadarChart
              data={
                overallOeeData?.getOEEByProductionLine?.oeeByProductionLine 
                // || [
                //   { LINE: "LINE A", OEEPERCENTAGE: 92 },
                //   { LINE: "LINE B", OEEPERCENTAGE: 34 },
                //   { LINE: "LINE C", OEEPERCENTAGE: 78 },
                //   { LINE: "LINE D", OEEPERCENTAGE: 55 },
                //   { LINE: "LINE E", OEEPERCENTAGE: 89 },
                //   { LINE: "LINE F", OEEPERCENTAGE: 67 },
                //   { LINE: "LINE G", OEEPERCENTAGE: 45 },
                // ]
              }
              title="OEE by Production Line"
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <StackedBarChart
              title="OEE by Product"
              data={[
                {
                  PRODUCT: "PRODUCT A",
                  AVAILABILITY: 90,
                  PERFORMANCE: 85,
                  QUALITY: 95,
                },
                {
                  PRODUCT: "PRODUCT B",
                  AVAILABILITY: 45,
                  PERFORMANCE: 92,
                  QUALITY: 78,
                },
                {
                  PRODUCT: "PRODUCT C",
                  AVAILABILITY: 78,
                  PERFORMANCE: 67,
                  QUALITY: 88,
                },
                {
                  PRODUCT: "PRODUCT D",
                  AVAILABILITY: 92,
                  PERFORMANCE: 78,
                  QUALITY: 45,
                },
                {
                  PRODUCT: "PRODUCT E",
                  AVAILABILITY: 67,
                  PERFORMANCE: 89,
                  QUALITY: 92,
                },
                {
                  PRODUCT: "PRODUCT F",
                  AVAILABILITY: 88,
                  PERFORMANCE: 45,
                  QUALITY: 67,
                },
              ]}
              color={filterColors.oeeByShift.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <LineChart
              title={"OEE Component Trend Over Time"}
              data={
                overallOeeData?.getOEEByComponent?.oeeByComponent 
                // || [
                //   {
                //     date: "2024-09-01",
                //     AVAILABILITY: 92,
                //     PERFORMANCE: 85,
                //     QUALITY: 94,
                //   },
                //   {
                //     date: "2024-09-02",
                //     AVAILABILITY: 45,
                //     PERFORMANCE: 92,
                //     QUALITY: 78,
                //   },
                //   {
                //     date: "2024-09-03",
                //     AVAILABILITY: 78,
                //     PERFORMANCE: 67,
                //     QUALITY: 88,
                //   },
                //   {
                //     date: "2024-09-04",
                //     AVAILABILITY: 92,
                //     PERFORMANCE: 78,
                //     QUALITY: 45,
                //   },
                //   {
                //     date: "2024-09-05",
                //     AVAILABILITY: 67,
                //     PERFORMANCE: 89,
                //     QUALITY: 92,
                //   },
                //   {
                //     date: "2024-09-06",
                //     AVAILABILITY: 88,
                //     PERFORMANCE: 45,
                //     QUALITY: 67,
                //   },
                //   {
                //     date: "2024-09-07",
                //     AVAILABILITY: 73,
                //     PERFORMANCE: 82,
                //     QUALITY: 85,
                //   },
                // ]
              }
              color={filterColors.oeeByComponent}
            />
          </Col>
        </Row>
      </div>
    </Content>
  );
};


export default OeeScreen;
