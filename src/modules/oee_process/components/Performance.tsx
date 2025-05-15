import React, { useEffect, useRef, useState } from 'react';
import { Layout, Row, Col, Button, Dropdown, Menu } from 'antd';
import { useFilterContext } from '../hooks/filterData';
import LineChart from './reuse/LineChart';
import BarChart from './reuse/BarChart';
import StackedBarChart from './reuse/StackBar';
import ParetoChart from './reuse/ParetoChart';
import PiChart from './reuse/PiChart';
import Heatmap from './reuse/HeatMap';
import ScatterPlot from './reuse/ScatterPlot';
import MyGaugeChart from './reuse/Gauge';
import { useSettingsData } from '../hooks/settingsData';


const { Content } = Layout;

const data = 78

const Performance: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  useEffect(() => {
    const checkZoom = () => {
      setIsZoomed(window.devicePixelRatio > 1.5);
    };
    window.addEventListener('resize', checkZoom);
    checkZoom(); // Check initial state
    return () => window.removeEventListener('resize', checkZoom);
  }, []);
  const { color, performanceOeeData } = useFilterContext()
 const { filterColors } = useSettingsData();
  return (
    <Content ref={contentRef} style={{ padding: "0 50px", marginTop: "20px" }}>
      <div className="site-layout-content">
        <Row gutter={[16, 16]}>
          <Col span={isZoomed ? 24 : 12}>
            <MyGaugeChart
              value={performanceOeeData?.overall?.overallPerformancePercentage||0}
              color={color}
              title={"Performance OverAll Percentage"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <LineChart
              data={performanceOeeData?.performanceByTime?.performanceOverTime
              //   ||[
              //   { date: "2024-09-01", performancePercentage: 82 },
              //   { date: "2024-09-02", performancePercentage: 65 },
              //   { date: "2024-09-03", performancePercentage: 95 },
              //   { date: "2024-09-04", performancePercentage: 73 },
              //   { date: "2024-09-05", performancePercentage: 88 },
              //   { date: "2024-09-06", performancePercentage: 92 },
              //   { date: "2024-09-07", performancePercentage: 45 },
              // ]
            }
              title={"Performance Over Time"}
              color={filterColors.performanceOverTime}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <BarChart
              data={performanceOeeData?.performanceByShift?.performanceByShift
              //   ||[
              //   { shift: "Shift A", performancePercentage: 88 },
              //   { shift: "Shift B", performancePercentage: 92 },
              //   { shift: "Shift C", performancePercentage: 75 },
              //   { shift: "Shift D", performancePercentage: 95 },
              //   { shift: "Shift E", performancePercentage: 62 },
              // ]
            }
              title=" Performance by Shift"
              color={filterColors.performanceByShift.itemcolor}
              theshold={filterColors.performanceByShift.threshold}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <PiChart
              data={performanceOeeData?.performanceByMachine?.performanceByMachine
              //   ||[
              //   { machine: "Machine 1", performancePercentage: 90 },
              //   { machine: "Machine 2", performancePercentage: 45 },
              //   { machine: "Machine 3", performancePercentage: 88 },
              //   { machine: "Machine 4", performancePercentage: 95 },
              //   { machine: "Machine 5", performancePercentage: 72 },
              //   { machine: "Machine 6", performancePercentage: 83 },
              // ]
            }
              title="Performance By Machine"
              color={filterColors.performanceByMachine.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <StackedBarChart
              data={performanceOeeData?.performanceByProductionLine?.performanceByProductionLine
              //   ||[
              //   {
              //     line: "Line 1",
              //     machine: "Machine 1",
              //     performancePercentage: 88,
              //   },
              //   {
              //     line: "Line 1",
              //     machine: "Machine 2",
              //     performancePercentage: 35,
              //   },
              //   {
              //     line: "Line 2",
              //     machine: "Machine 1",
              //     performancePercentage: 92,
              //   },
              //   {
              //     line: "Line 2",
              //     machine: "Machine 2",
              //     performancePercentage: 78,
              //   },
              //   {
              //     line: "Line 3",
              //     machine: "Machine 1",
              //     performancePercentage: 95,
              //   },
              //   {
              //     line: "Line 3",
              //     machine: "Machine 2",
              //     performancePercentage: 65,
              //   },
              // ]
            }
              title="Performance by Production Line"
              color={filterColors.performanceByProductionLine.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <ParetoChart
              data={[
                {
                  reason: "Machine Stoppage",
                  occurrences: 0,
                  cumulativePercentage: 0,
                },
                {
                  reason: "Slowdown", 
                  occurrences: 0,
                  cumulativePercentage: 0,
                },
                {
                  reason: "Changeover",
                  occurrences: 0,
                  cumulativePercentage: 0,
                },
                {
                  reason: "Material Shortage",
                  occurrences: 0,
                  cumulativePercentage: 0,
                },
                {
                  reason: "Power Outage",
                  occurrences: 0,
                  cumulativePercentage: 0,
                },
                { reason: "Other", occurrences: 0, cumulativePercentage: 0 },
              ]}
              title="Performance Loss Reasons"
              color={filterColors.performanceLossReasons}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <Heatmap
              data={[
                {
                  product: "Product A",
                  machine: "Machine 1",
                  performancePercentage: 88,
                },
                {
                  product: "Product B",
                  machine: "Machine 1",
                  performancePercentage: 85,
                },
                {
                  product: "Product A",
                  machine: "Machine 2",
                  performancePercentage: 90,
                },
              ]}
              xKey="machine"
              yKey="product"
              valueKey="performancePercentage"
              title={"Performance Efficiency by Product"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <StackedBarChart
              data={[
                {
                  reason: "Machine Failure",
                  machine: "Machine 1",
                  downtimeDuration: 60,
                },
                {
                  reason: "Maintenance",
                  machine: "Machine 2",
                  downtimeDuration: 40,
                },
              ]}
              title="Performance Downtime Analysis"
              color={filterColors.performanceDowntimeAnalysis.itemcolor}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <BarChart
              data={[
                {
                  machine: "Machine 1",
                  performancePercentage: 85,
                  downtimeDuration: 10,
                  qualityPercentage: 90,
                },
                {
                  machine: "Machine 2",
                  performancePercentage: 87,
                  downtimeDuration: 20,
                  qualityPercentage: 85,
                },
                {
                  machine: "Machine 3",
                  performancePercentage: 90,
                  downtimeDuration: 30,
                  qualityPercentage: 95,
                },
              ]}
              title={"Performance Comparison"}
              color={filterColors.downtimeByReasonAndShift.itemcolor}
              theshold={filterColors.downtimeByReasonAndShift.threshold}
            />
          </Col>
        </Row>
      </div>
    </Content>
  );
};

export default Performance;
