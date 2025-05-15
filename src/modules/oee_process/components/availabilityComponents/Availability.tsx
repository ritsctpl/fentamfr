import React, { useEffect, useRef, useState } from "react";
import { Layout, Row, Col, Button, Dropdown, Menu } from 'antd';
import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import LineChart from "../reuse/LineChart";
import BarChart from "../reuse/BarChart";
import ParetoChart from "../reuse/ParetoChart";
import Heatmap from "../reuse/HeatMap";
import MyGaugeChart from "../reuse/Gauge";
import { useSettingsData } from "@modules/oee_process/hooks/settingsData";

const { Content } = Layout;

interface AvailabilityData {
  downloadAllPDF: () => void;
}

const Availability: React.FC= () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { availabilityOeeData, color } = useFilterContext()
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
        <Row gutter={[16, 16]}>
          <Col span={isZoomed ? 24 : 12}>
            <MyGaugeChart
              value={availabilityOeeData?.overallAvailability?.availabilityPercentage || 89}
              color={color}
              title={"Availability OverAll Percentage"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <LineChart
              color={filterColors.availabilityOverTime}
              data={availabilityOeeData?.availabilityByTime?.availabilityData || [
                { date: "2024-09-01", availabilityPercentage: 95 },
                { date: "2024-09-02", availabilityPercentage: 90 },
                { date: "2024-09-03", availabilityPercentage: 85 },
                { date: "2024-09-04", availabilityPercentage: 92 },
                { date: "2024-09-05", availabilityPercentage: 89 },
              ]}
              title={"Availability Over Time"}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <BarChart
              color={filterColors.availabilityByShift.itemcolor}
              data={availabilityOeeData?.availabilityByShift?.availabilityByShift || [
                { shift: "Shift A", availabilityPercentage: 93 },
                { shift: "Shift B", availabilityPercentage: 88 },
                { shift: "Shift C", availabilityPercentage: 90 },
              ]}
              title={"Availability by Shift"}
              theshold={filterColors.availabilityByShift.threshold}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <BarChart
              data={availabilityOeeData?.availabilityByMachine?.availabilityByMachine || [
                { machine: "Machine 1", availabilityPercentage: 92 },
                { machine: "Machine 2", availabilityPercentage: 88 },
                { machine: "Machine 3", availabilityPercentage: 95 },
              ]}
              title={"Availability by Machine"}
              color={filterColors.availabilityByMachine.itemcolor}
              theshold={filterColors.availabilityByMachine.threshold}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <ParetoChart
              data={[
                {
                  reason: "Maintenance",
                  downtimeMinutes: 300,
                  cumulativePercentage: 40,
                },
                {
                  reason: "Setup",
                  downtimeMinutes: 200,
                  cumulativePercentage: 65,
                },
                {
                  reason: "Machine Breakdown",
                  downtimeMinutes: 150,
                  cumulativePercentage: 85,
                },
                {
                  reason: "Operator Error",
                  downtimeMinutes: 100,
                  cumulativePercentage: 100,
                },
              ]}
              title={"Availability Downtime Pareto"}
              color={filterColors.availabilityByMachine}
            />
          </Col>
          <Col span={isZoomed ? 24 : 12}>
            <Heatmap
              data={[
                { day: "Monday", hour: 9, downtimeMinutes: 20 },
                { day: "Monday", hour: 10, downtimeMinutes: 10 },
                { day: "Tuesday", hour: 14, downtimeMinutes: 30 },
              ]}
              title={"Downtime Heatmap"}
              xKey={"day"}
              yKey={"hour"}
              valueKey={"downtimeMinutes"}
            />
          </Col>
        </Row>
      </div>
    </Content>
  );
};

export default Availability;
