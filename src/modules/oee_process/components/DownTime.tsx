import React, { useEffect, useState, useRef } from 'react';
import { Layout, Row, Col } from 'antd';
import { useFilterContext } from '../hooks/filterData';
import BarChart from './reuse/BarChart';
import PiChart from './reuse/PiChart';
import StackedBarChart from './reuse/StackBar';
import Histogram from './reuse/Histogram';
import AreaChart from './reuse/AreaChart';
import BubbleChart from './reuse/BubbleChart';
import TreeMap from './reuse/TreeMap';
import RadarChart from './reuse/RadarChar';
import WaterfallChart from './reuse/WaterfallChart';
import FunnelChart from './reuse/FunnelChart';
import BoxPlot from './reuse/BoxPlot';
import MyGaugeChart from './reuse/Gauge';
import ParetoChart from './reuse/ParetoChart';

import NewLineChart from './reuse/NewLineChart';
import LineChart from './reuse/LineChart';
import HeatMap from './reuse/HeatMap';
import DowntimeHistogram from './reuse/DownTimeHistograme';
import { useSettingsData } from '../hooks/settingsData';

const { Content } = Layout;

const DownTime: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
 
  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener('resize', checkZoom);
    checkZoom();
    return () => window.removeEventListener('resize', checkZoom);
  }, []);
  const { color } = useFilterContext()
  const { filterColors } = useSettingsData();
  return (
    <Content ref={contentRef} style={{ padding: "0 50px", marginTop: "20px" }}>
      <div className="site-layout-content">
        <Row gutter={[16, 16]}>
          <Col span={isZoomed ? 24 : 12}>
            <MyGaugeChart
              value={6.25}
              color={color}
              title={"Overall Downtime Percentage"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <LineChart
              data={[
                { date: "2024-09-01", downtimePercentage: 5 },
                { date: "2024-09-02", downtimePercentage: 7 },
                { date: "2024-09-03", downtimePercentage: 10 },
                { date: "2024-09-04", downtimePercentage: 6 },
                { date: "2024-09-05", downtimePercentage: 8 },
                { date: "2024-09-06", downtimePercentage: 12 },
                { date: "2024-09-07", downtimePercentage: 9 },
                { date: "2024-09-08", downtimePercentage: 11 },
                { date: "2024-09-09", downtimePercentage: 4 },
                { date: "2024-09-10", downtimePercentage: 8 },
              ]}
              title={"Downtime Over Time"}
              color={filterColors.downtimeOverTime}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <PiChart
              data={[
                { reason: "Maintenance", downtimePercentage: 25 },
                { reason: "Breakdown", downtimePercentage: 20 },
                { reason: "Operator Error", downtimePercentage: 15 },
                { reason: "Setup Time", downtimePercentage: 12 },
                { reason: "Material Shortage", downtimePercentage: 8 },
                { reason: "Quality Issues", downtimePercentage: 7 },
              ]}
              title={"Downtime by Reason"}
              color={filterColors.downtimeByReason.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <BarChart
              data={[
                { machine: "Machine A", downtimePercentage: 10 },
                { machine: "Machine B", downtimePercentage: 35 },
                { machine: "Machine C", downtimePercentage: 5 },
                { machine: "Machine D", downtimePercentage: 15 },
                { machine: "Machine E", downtimePercentage: 28 },
                { machine: "Machine F", downtimePercentage: 8 },
                { machine: "Machine G", downtimePercentage: 18 },
              ]}
              title={"Downtime By Machine"}
              color={filterColors.downtimeByMachine.itemcolor}
              theshold={filterColors.downtimeByMachine.threshold}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <StackedBarChart
              data={[
                {
                  shift: "Shift A",
                  reasons: {
                    Maintenance: 85,
                    Breakdown: 45,
                    Setup: 15,
                    Other: 30,
                  },
                },
                {
                  shift: "Shift B",
                  reasons: {
                    Maintenance: 2,
                    Breakdown: 8,
                    Setup: 25,
                    Other: 42,
                  },
                },
                {
                  shift: "Shift C",
                  reasons: {
                    Maintenance: 78,
                    Breakdown: 12,
                    Setup: 55,
                    Other: 28,
                  },
                },
                {
                  shift: "Shift D",
                  reasons: {
                    Maintenance: 15,
                    Breakdown: 88,
                    Setup: 35,
                    Other: 8,
                  },
                },
                {
                  shift: "Shift E",
                  reasons: {
                    Maintenance: 65,
                    Breakdown: 2,
                    Setup: 18,
                    Other: 72,
                  },
                },
                {
                  shift: "Shift F",
                  reasons: {
                    Maintenance: 45,
                    Breakdown: 75,
                    Setup: 32,
                    Other: 22,
                  },
                },
                {
                  shift: "Shift G",
                  reasons: {
                    Maintenance: 25,
                    Breakdown: 5,
                    Setup: 68,
                    Other: 35,
                  },
                },
                {
                  shift: "Shift H",
                  reasons: {
                    Maintenance: 82,
                    Breakdown: 8,
                    Setup: 5,
                    Other: 58,
                  },
                },
                {
                  shift: "Shift I",
                  reasons: {
                    Maintenance: 5,
                    Breakdown: 8,
                    Setup: 22,
                    Other: 8,
                  },
                },
                {
                  shift: "Shift J",
                  reasons: {
                    Maintenance: 32,
                    Breakdown: 62,
                    Setup: 4,
                    Other: 15,
                  },
                },
              ]}
              title={"Downtime by Reason and Shift"}
              color={filterColors.downtimeByReasonAndShift.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <AreaChart
              data={[
                { date: "2024-09-01", cumulativeDowntime: 15 },
                { date: "2024-09-02", cumulativeDowntime: 10 },
                { date: "2024-09-03", cumulativeDowntime: 3 },
                { date: "2024-09-04", cumulativeDowntime: 8 },
                { date: "2024-09-05", cumulativeDowntime: 12 },
                { date: "2024-09-06", cumulativeDowntime: 36 },
                { date: "2024-09-07", cumulativeDowntime: 49 },
                { date: "2024-09-08", cumulativeDowntime: 54 },
                { date: "2024-09-09", cumulativeDowntime: 67 },
                { date: "2024-09-10", cumulativeDowntime: 31 },
                { date: "2024-09-11", cumulativeDowntime: 35 },
                { date: "2024-09-12", cumulativeDowntime: 13 },
                { date: "2024-09-13", cumulativeDowntime: 4 },
                { date: "2024-09-14", cumulativeDowntime: 16 },
                { date: "2024-09-15", cumulativeDowntime: 8 },
              ]}
              title={"Cumulative Downtime"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <NewLineChart
              data={[
                { date: "2024-09-01", output: 1000, downtime: 5 },
                { date: "2024-09-02", output: 800, downtime: 7 },
                { date: "2024-09-03", output: 600, downtime: 3 },
                { date: "2024-09-04", output: 950, downtime: 4 },
                { date: "2024-09-05", output: 1200, downtime: 2 },
                { date: "2024-09-06", output: 750, downtime: 8 },
                { date: "2024-09-07", output: 850, downtime: 6 },
                { date: "2024-09-08", output: 1100, downtime: 3 },
                { date: "2024-09-09", output: 900, downtime: 5 },
                { date: "2024-09-10", output: 1050, downtime: 4 },
                { date: "2024-09-11", output: 700, downtime: 9 },
                { date: "2024-09-12", output: 950, downtime: 5 },
                { date: "2024-09-13", output: 1150, downtime: 2 },
                { date: "2024-09-14", output: 800, downtime: 7 },
                { date: "2024-09-15", output: 1000, downtime: 4 },
              ]}
              title={"Downtime vs. Production Output"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <HeatMap
              data={[
                {
                  reason: "Maintenance",
                  meachine: "Machine A",
                  occurrences: 4,
                },
                {
                  reason: "Maintenance",
                  meachine: "Machine B",
                  occurrences: 6,
                },
                {
                  reason: "Maintenance",
                  meachine: "Machine C",
                  occurrences: 3,
                },
                { reason: "Breakdown", meachine: "Machine A", occurrences: 2 },
                { reason: "Breakdown", meachine: "Machine B", occurrences: 5 },
                { reason: "Breakdown", meachine: "Machine C", occurrences: 4 },
                { reason: "Setup Time", meachine: "Machine A", occurrences: 6 },
                { reason: "Setup Time", meachine: "Machine B", occurrences: 8 },
                { reason: "Setup Time", meachine: "Machine C", occurrences: 5 },
                {
                  reason: "Tool Change",
                  meachine: "Machine A",
                  occurrences: 8,
                },
                {
                  reason: "Tool Change",
                  meachine: "Machine B",
                  occurrences: 7,
                },
                {
                  reason: "Tool Change",
                  meachine: "Machine C",
                  occurrences: 9,
                },
                {
                  reason: "Material Shortage",
                  meachine: "Machine A",
                  occurrences: 3,
                },
                {
                  reason: "Material Shortage",
                  meachine: "Machine B",
                  occurrences: 4,
                },
                {
                  reason: "Material Shortage",
                  meachine: "Machine C",
                  occurrences: 2,
                },
                {
                  reason: "Quality Issues",
                  meachine: "Machine A",
                  occurrences: 5,
                },
                {
                  reason: "Quality Issues",
                  meachine: "Machine B",
                  occurrences: 6,
                },
                {
                  reason: "Quality Issues",
                  meachine: "Machine C",
                  occurrences: 4,
                },
                {
                  reason: "Power Outage",
                  meachine: "Machine A",
                  occurrences: 1,
                },
                {
                  reason: "Power Outage",
                  meachine: "Machine B",
                  occurrences: 2,
                },
                {
                  reason: "Power Outage",
                  meachine: "Machine C",
                  occurrences: 1,
                },
                {
                  reason: "Operator Break",
                  meachine: "Machine A",
                  occurrences: 10,
                },
                {
                  reason: "Operator Break",
                  meachine: "Machine B",
                  occurrences: 8,
                },
                {
                  reason: "Operator Break",
                  meachine: "Machine C",
                  occurrences: 9,
                },
                {
                  reason: "Equipment Calibration",
                  meachine: "Machine A",
                  occurrences: 7,
                },
                {
                  reason: "Equipment Calibration",
                  meachine: "Machine B",
                  occurrences: 5,
                },
                {
                  reason: "Equipment Calibration",
                  meachine: "Machine C",
                  occurrences: 6,
                },
                {
                  reason: "Safety Checks",
                  meachine: "Machine A",
                  occurrences: 12,
                },
                {
                  reason: "Safety Checks",
                  meachine: "Machine B",
                  occurrences: 10,
                },
                {
                  reason: "Safety Checks",
                  meachine: "Machine C",
                  occurrences: 11,
                },
              ]}
              xKey={"reason"}
              yKey={"meachine"}
              valueKey={"occurrences"}
              title={"Downtime Analysis"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <RadarChart
              data={[
                {
                  downtime: 35,
                  productionEfficiency: 85,
                  maintenanceFrequency: 25,
                  setupTime: 45,
                  qualityRate: 92,
                  operatorEfficiency: 78,
                  equipmentReliability: 88,
                  materialAvailability: 95,
                  plannedDowntime: 15,
                  unplannedDowntime: 22,
                },
              ]}
              title={"Performance Metrics"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <ParetoChart
              data={[
                {
                  category: "Machine Stoppage",
                  hours: 24,
                  cumulativePercentage: 30,
                },
                {
                  category: "Maintenance",
                  hours: 18,
                  cumulativePercentage: 45,
                },
                { category: "Setup Time", hours: 15, cumulativePercentage: 60 },
                {
                  category: "Material Issues",
                  hours: 12,
                  cumulativePercentage: 72,
                },
                {
                  category: "Quality Checks",
                  hours: 10,
                  cumulativePercentage: 80,
                },
                {
                  category: "Operator Breaks",
                  hours: 8,
                  cumulativePercentage: 87,
                },
                {
                  category: "Tool Changes",
                  hours: 6,
                  cumulativePercentage: 92,
                },
                { category: "Cleaning", hours: 4, cumulativePercentage: 95 },
                {
                  category: "Power Issues",
                  hours: 3,
                  cumulativePercentage: 98,
                },
                { category: "Other", hours: 2, cumulativePercentage: 100 },
              ]}
              title="Downtime Impact"
              color={filterColors.downtimeImpact}
            />
          </Col>

          <Col span={isZoomed ? 24 : 12}>
            <DowntimeHistogram />
          </Col>
        </Row>
      </div>
    </Content>
  );
};

export default DownTime;
