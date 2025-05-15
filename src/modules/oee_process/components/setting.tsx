import React, { useEffect, useState } from "react";

import {
  Button,
  Form,
  Select,
  Checkbox,
  Drawer,
  Typography,
  Input,
  Layout,
  Menu,
  Modal,
  Row,
  Col,
  Slider,
  InputNumber,
  ConfigProvider,
  Space,
  ColorPicker,
  Spin,
} from "antd";
import { useFilterContext } from "../hooks/filterData";
import styles from "../styles/OeeAnalytics.module.css";
import { optionsByTab, tabDatas } from "../types/userTypes";
import LineChart from "./reuse/LineChart";
import { useSettingsData } from "../hooks/settingsData";
import BarChart from "./reuse/BarChart";
import { backdropClasses } from "@mui/material";
import ParetoChart from "./reuse/ParetoChart";
import StackedBarChart from "./reuse/StackBar";
import PiChart from "./reuse/PiChart";
const { Title } = Typography;
const commonLabelStyles = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#4a5568",
  display: "block",
  marginBottom: "8px",
};

const commonSelectStyles = {
  width: "100%",
  borderRadius: "8px",
};

interface SettingsProps {
  visible: any;
}
const allLineGraph = [
  "oeeOverTime",
  "oeeByComponent",
  "downtimeOverTime",
  "performanceOverTime",
  "availabilityOverTime",
  "qualityOverTime",
  "defectTrendOverTime",
];
const allBarGraph = ["oeeByMachine"];
const allStackGraph = ["oeeByShift"];
const allPieGraph = ["downtimeByReason","performanceByMachine","qualityByMachine","defectDistributionbyProduct"];
const FilterSettings: React.FC<SettingsProps> = ({ visible }) => {
  const [selectedTab, setSelectedTab] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [selectedType, setSelectedType] = React.useState(null);
  const [categoryOptions, setCategoryOptions] = React.useState(null);
  const { filterColors, setFilterColors } = useSettingsData();
  const [isLoading, setIsLoading] = useState(false);
  const { overallOeeData, setValue } = useFilterContext();
  useEffect(() => {
    setCategoryOptions(null);
    setSelectedCategory(null);
  }, [visible]);
  const clearBtn = () => {
    setCategoryOptions(null);
    setSelectedCategory(null);
  };
  const handleTabChange = (value: string) => {
    console.log(value,"tablue");
    if (!value) {
      console.warn('Tab value is undefined');
      return;
    }
    else {
      const newValue = value.toLowerCase();
      sessionStorage.setItem('activeTabIndex', newValue);
      const ListValue = ["oee", "downtime", "performance", "availability", "quality"];
      setValue(ListValue.indexOf(value) + 1);
    }
    setSelectedTab(value);
    setSelectedCategory(null);
    switch (value) {
      case "oee":
        setCategoryOptions([
          { value: "oeeOverTime", label: "OEE Over Time" },
          { value: "oeeByComponent", label: "OEE By Component" },
          { value: "oeeByMachine", label: "OEE by Machine" },
          { value: "oeeByShift", label: "OEE by Shift" },
          // { value: "oeeBreakdown", label: "OEE Breakdown" },
          { value: "oeeLossByReason", label: "OEE Loss by Reason" },
          // { value: "oeeByProductionLine", label: "OEE by Production Line" },
          // { value: "oeeByProduct", label: "OEE by Product" },
          {
            value: "oeeComponentTrendOverTime",
            label: "OEE Component Trend Over Time",
          },
        ]);
        break;
      case "downtime":
        setCategoryOptions([
          {
            value: "downtimeOverTime",
            label: "Downtime Over Time",
          },
          {
            value: "downtimeByReason",
            label: "Downtime by Reason",
          },
          {
            value: "downtimeByMachine",
            label: "Downtime By Machine",
          },
          {
            value: "downtimeByReasonAndShift",
            label: "Downtime by Reason and Shift",
          },
          // {
          //   value: "cumulativeDowntime",
          //   label: "Cumulative Downtime",
          // },
          // {
          //   value: "downtimeVsProductionOutput",
          //   label: "Downtime vs. Production Output",
          // },
          // {
          //   value: "downtimeAnalysis",
          //   label: "Downtime Analysis",
          // },
          // {
          //   value: "performanceMetrics",
          //   label: "Performance Metrics",
          // },
          {
            value: "downtimeImpact",
            label: "Downtime Impact",
          },
          // {
          //   value: "downtimeDurationDistribution",
          //   label: "Downtime Duration Distribution",
          // },
        ]);
        break;
      case "performance":
        setCategoryOptions([
          {
            value: "performanceOverTime",
            label: "Performance Over Time",
          },
          {
            value: "performanceByShift",
            label: "Performance by Shift",
          },
          {
            value: "performanceByMachine",
            label: "Performance by Machine",
          },
          {
            value: "performanceByProductionLine",
            label: "Performance by Production Line",
          },
          {
            value: "performanceLossReasons",
            label: "Performance Loss Reasons",
          },
          {
            value: "performanceDowntimeAnalysis",
            label: "Performance Downtime Analysis"
          },
        ]);
        break;
      case "availability":
        setCategoryOptions([
          {
            value: "availabilityOverTime",
            label: "Availability Over Time",
          },
          {
            value: "availabilityByShift",
            label: "Availability by Shift",
          },
          {
            value: "availabilityByMachine",
            label: "Availability by Machine",
          },
          {
            value: "availabilityDowntimePareto",
            label: "Availability Downtime Pareto",
          },
          // {
          //   value: "downtimeHeatmap",
          //   label: "Downtime Heatmap",
          // },
        ]);
        break;
      case "quality":
        setCategoryOptions([
          {
            value: "qualityOverTime",
            label: "Quality Over Time",
          },
          {
            value: "defectTrendOverTime",
            label: "Defect Trend Over Time",
          },
          {
            value: "qualityByShift",
            label: "Quality by Shift",
          },
          {
            value: "qualityByMachine",
            label: "Quality by Machine",
          },
          {
            value: "qualityByProduct",
            label: "Quality by Product",
          },
          {
            value: "defectsByReason",
            label: "Defects by Reason",
          },
          {
            value: "qualityLossByProductionLine",
            label: "Quality Loss by Production Line",
          },
          // {
          //   value: "qualityByOperator",
          //   label: "Quality by Operator",
          // },
          {
            value: "defectDistributionByProduct",
            label: "Defect Distribution by Product",
          }
        ]);
        break;
      default:
        setCategoryOptions([]);
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div
          style={{
            height: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="small" />
        </div>
      );
    }
    if (!selectedCategory)
      return (
        <div
          style={{
            height: "300px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>Graph goes here</p>
        </div>
      );

    switch (selectedCategory) {
      case "oeeOverTime":
        return (
          <LineChart
            data={[
              { date: "2024-09-01", OEEPERCENTAGE: 92 },
              { date: "2024-09-02", OEEPERCENTAGE: 45 },
              { date: "2024-09-03", OEEPERCENTAGE: 78 },
              { date: "2024-09-04", OEEPERCENTAGE: 23 },
              { date: "2024-09-05", OEEPERCENTAGE: 95 },
              { date: "2024-09-06", OEEPERCENTAGE: 67 },
              { date: "2024-09-07", OEEPERCENTAGE: 82 },
            ]}
            title="OEE Over Time"
            color={filterColors.oeeOverTime}
          />
        );
      case "oeeByComponent":
        return (
          <LineChart
            data={[
              {
                date: "2024-09-01",
                AVAILABILITY: 92,
                PERFORMANCE: 85,
                QUALITY: 94,
              },
              {
                date: "2024-09-02",
                AVAILABILITY: 45,
                PERFORMANCE: 92,
                QUALITY: 78,
              },
              {
                date: "2024-09-03",
                AVAILABILITY: 78,
                PERFORMANCE: 67,
                QUALITY: 88,
              },
              {
                date: "2024-09-04",
                AVAILABILITY: 92,
                PERFORMANCE: 78,
                QUALITY: 45,
              },
              {
                date: "2024-09-05",
                AVAILABILITY: 67,
                PERFORMANCE: 89,
                QUALITY: 92,
              },
              {
                date: "2024-09-06",
                AVAILABILITY: 88,
                PERFORMANCE: 45,
                QUALITY: 67,
              },
              {
                date: "2024-09-07",
                AVAILABILITY: 73,
                PERFORMANCE: 82,
                QUALITY: 85,
              },
            ]}
            title="OEE By Component"
            color={filterColors.oeeByComponent}
          />
        );
      case "downtimeOverTime":
        return (
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
            title="Downtime Over Time"
            color={filterColors.downtimeOverTime}
          />
        );
      case "performanceOverTime":
        return (
          <LineChart
            data={[
              { date: "2024-09-01", performancePercentage: 82 },
              { date: "2024-09-02", performancePercentage: 65 },
              { date: "2024-09-03", performancePercentage: 95 },
              { date: "2024-09-04", performancePercentage: 73 },
              { date: "2024-09-05", performancePercentage: 88 },
              { date: "2024-09-06", performancePercentage: 92 },
              { date: "2024-09-07", performancePercentage: 45 },
            ]}
            title="Performance Over Time"
            color={filterColors.performanceOverTime}
          />
        );
      case "availabilityOverTime":
        return (
          <LineChart
            data={[
              { date: "2024-09-01", availabilityPercentage: 95 },
              { date: "2024-09-02", availabilityPercentage: 78 },
              { date: "2024-09-03", availabilityPercentage: 92 },
              { date: "2024-09-04", availabilityPercentage: 65 },
              { date: "2024-09-05", availabilityPercentage: 88 },
              { date: "2024-09-06", availabilityPercentage: 97 },
              { date: "2024-09-07", availabilityPercentage: 72 },
            ]}
            title="Availability Over Time"
            color={filterColors.availabilityOverTime}
          />
        );
      case "qualityOverTime":
        return (
          <LineChart
            data={[
              { date: "2024-09-01", qualityPercentage: 30 },
              { date: "2024-09-02", qualityPercentage: 94 },
              { date: "2024-09-03", qualityPercentage: 45 },
              { date: "2024-09-04", qualityPercentage: 88 },
              { date: "2024-09-05", qualityPercentage: 76 },
              { date: "2024-09-06", qualityPercentage: 92 },
              { date: "2024-09-07", qualityPercentage: 65 },
              { date: "2024-09-08", qualityPercentage: 83 },
            ]}
            title="Quality Over Time"
            color={filterColors.qualityOverTime}
          />
        );
      case "defectTrendOverTime":
        return (
          <LineChart
            data={[
              { date: "2024-09-01", defects: 12 },
              { date: "2024-09-02", defects: 5 },
              { date: "2024-09-03", defects: 18 },
              { date: "2024-09-04", defects: 8 },
              { date: "2024-09-05", defects: 15 },
              { date: "2024-09-06", defects: 3 },
              { date: "2024-09-07", defects: 9 },
              { date: "2024-09-08", defects: 6 },
            ]}
            title="Defect Trend Over Time"
            color={filterColors.defectTrendOverTime}
          />
        );
      case "oeeByMachine":
        return (
          <BarChart
            title={"OEE by Machine"}
            data={[
              { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
              { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
              { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
              { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
              { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
              { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
              { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
            ]}
            color={filterColors.oeeByMachine.itemcolor}
            theshold={filterColors.oeeByMachine.threshold}
          />
        );
      case "oeeByShift":
        return (
          <StackedBarChart
            data={[
              {
                SHIFT: "SHIFT A",
                AVAILABILITY: 90,
                PERFORMANCE: 45,
                QUALITY: 95,
              },
              {
                SHIFT: "SHIFT B",
                AVAILABILITY: 38,
                PERFORMANCE: 84,
                QUALITY: 72,
              },
              {
                SHIFT: "SHIFT C",
                AVAILABILITY: 65,
                PERFORMANCE: 92,
                QUALITY: 28,
              },
              {
                SHIFT: "SHIFT D",
                AVAILABILITY: 78,
                PERFORMANCE: 55,
                QUALITY: 89,
              },
              {
                SHIFT: "SHIFT E",
                AVAILABILITY: 92,
                PERFORMANCE: 78,
                QUALITY: 45,
              },
              {
                SHIFT: "SHIFT F",
                AVAILABILITY: 45,
                PERFORMANCE: 95,
                QUALITY: 67,
              },
            ]}
            title="OEE by Shift"
            color={filterColors.oeeByShift.itemcolor}
          />
        );
        case "oeeLossByReason":
          return  <ParetoChart
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
        case "availabilityDowntimePareto":
          return <ParetoChart
            title={"Availability Downtime Pareto"}
            data={[
              {
                REASON: "MAINTENANCE",
                LOSSPERCENTAGE: 30,
                CUMULATIVEPERCENTAGE: 30,
              },
              {
                REASON: "SETUP",
                LOSSPERCENTAGE: 25,
                CUMULATIVEPERCENTAGE: 55,
              },
              {
                REASON: "MACHINE BREAKDOWN",
                LOSSPERCENTAGE: 20,
                CUMULATIVEPERCENTAGE: 75,
              },
              {
                REASON: "OPERATOR ERROR",
                LOSSPERCENTAGE: 15,
                CUMULATIVEPERCENTAGE: 90,
              },
              {
                REASON: "MATERIAL SHORTAGE",
                LOSSPERCENTAGE: 10,
                CUMULATIVEPERCENTAGE: 100,
              }
            ]}
            color={filterColors.availabilityDowntimePareto}
          />
        case "defectsByReason":
          return <ParetoChart
            title={"Defects by Reason"}
            data={[
              {
                REASON: "MATERIAL DEFECT",
                LOSSPERCENTAGE: 35,
                CUMULATIVEPERCENTAGE: 35,
              },
              {
                REASON: "OPERATOR ERROR",
                LOSSPERCENTAGE: 25,
                CUMULATIVEPERCENTAGE: 60,
              },
              {
                REASON: "MACHINE MALFUNCTION",
                LOSSPERCENTAGE: 20,
                CUMULATIVEPERCENTAGE: 80,
              },
              {
                REASON: "PROCESS DEVIATION",
                LOSSPERCENTAGE: 12,
                CUMULATIVEPERCENTAGE: 92,
              },
              {
                REASON: "QUALITY CONTROL",
                LOSSPERCENTAGE: 8,
                CUMULATIVEPERCENTAGE: 100,
              }
            ]}
            color={filterColors.defectsByReason}
          />
        case "downtimeImpact":
          return  <ParetoChart
          title={"Downtime Impact"}
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
          color={filterColors.downtimeImpact}
        />
      case "performanceLossReasons":
        return <ParetoChart
          title={"Performance Loss Reasons"}
          data={[
            {
              REASON: "MINOR STOPS",
              LOSSPERCENTAGE: 32,
              CUMULATIVEPERCENTAGE: 32,
            },
            {
              REASON: "REDUCED SPEED",
              LOSSPERCENTAGE: 28,
              CUMULATIVEPERCENTAGE: 60,
            },
            {
              REASON: "IDLE TIME",
              LOSSPERCENTAGE: 20,
              CUMULATIVEPERCENTAGE: 80,
            },
            {
              REASON: "STARTUP LOSS",
              LOSSPERCENTAGE: 10,
              CUMULATIVEPERCENTAGE: 90,
            },
            {
              REASON: "MATERIAL ISSUES",
              LOSSPERCENTAGE: 7,
              CUMULATIVEPERCENTAGE: 97,
            },
            {
              REASON: "OTHER",
              LOSSPERCENTAGE: 3,
              CUMULATIVEPERCENTAGE: 100,
            },
          ]}
          color={filterColors.performanceLossReasons}
        />
      case "downtimeByReasonAndShift":
        return (
          <StackedBarChart
            data={[
              {
                SHIFT: "SHIFT A",
                AVAILABILITY: 90,
                PERFORMANCE: 45,
                QUALITY: 95,
              },
              {
                SHIFT: "SHIFT B",
                AVAILABILITY: 38,
                PERFORMANCE: 84,
                QUALITY: 72,
              },
              {
                SHIFT: "SHIFT C",
                AVAILABILITY: 65,
                PERFORMANCE: 92,
                QUALITY: 28,
              },
              {
                SHIFT: "SHIFT D",
                AVAILABILITY: 78,
                PERFORMANCE: 55,
                QUALITY: 89,
              },
              {
                SHIFT: "SHIFT E",
                AVAILABILITY: 92,
                PERFORMANCE: 78,
                QUALITY: 45,
              },
              {
                SHIFT: "SHIFT F",
                AVAILABILITY: 45,
                PERFORMANCE: 95,
                QUALITY: 67,
              },
            ]}
            title="Downtime By Reason And Shift"
            color={filterColors.downtimeByReasonAndShift.itemcolor}
          />
        );
      case "downtimeByMachine":
        return (
          <BarChart
            title={"Downtime By Machine"}
            data={
              overallOeeData?.getOEEByMachine?.oeeByMachine || [
                { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
                { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
                { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
                { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
                { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
                { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
                { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
              ]
            }
            color={filterColors.downtimeByMachine.itemcolor}
            theshold={filterColors.downtimeByMachine.threshold}
          />
        );
      case "downtimeByReason":
        return (
          <PiChart
            data={[
              { reason: "Maintenance", downtimePercentage: 25 },
              { reason: "Breakdown", downtimePercentage: 20 },
              { reason: "Operator Error", downtimePercentage: 15 },
              { reason: "Setup Time", downtimePercentage: 12 },
              { reason: "Material Shortage", downtimePercentage: 8 },
              { reason: "Quality Issues", downtimePercentage: 7 },
            ]}
            title={"Downtime By Reason"}
            color={filterColors.downtimeByReason.itemcolor}
          />
        );
      case "performanceByMachine":
        return (
          <PiChart
            data={[
              { reason: "Maintenance", downtimePercentage: 25 },
              { reason: "Breakdown", downtimePercentage: 20 },
              { reason: "Operator Error", downtimePercentage: 15 },
              { reason: "Setup Time", downtimePercentage: 12 },
              { reason: "Material Shortage", downtimePercentage: 8 },
              { reason: "Quality Issues", downtimePercentage: 7 },
            ]}
            title={"Downtime By Reason"}
            color={filterColors.performanceByMachine.itemcolor}
          />
        );
      case "performanceByShift":
        return (
          <BarChart
            title={"Downtime By Machine"}
            data={
              overallOeeData?.getOEEByMachine?.oeeByMachine || [
                { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
                { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
                { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
                { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
                { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
                { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
                { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
              ]
            }
            color={filterColors.performanceByShift.itemcolor}
            theshold={filterColors.performanceByShift.threshold}
          />
        );
      case "performanceByProductionLine":
        return (
          <StackedBarChart
            data={[
              {
                SHIFT: "SHIFT A",
                AVAILABILITY: 90,
                PERFORMANCE: 45,
                QUALITY: 95,
              },
              {
                SHIFT: "SHIFT B",
                AVAILABILITY: 38,
                PERFORMANCE: 84,
                QUALITY: 72,
              },
              {
                SHIFT: "SHIFT C",
                AVAILABILITY: 65,
                PERFORMANCE: 92,
                QUALITY: 28,
              },
              {
                SHIFT: "SHIFT D",
                AVAILABILITY: 78,
                PERFORMANCE: 55,
                QUALITY: 89,
              },
              {
                SHIFT: "SHIFT E",
                AVAILABILITY: 92,
                PERFORMANCE: 78,
                QUALITY: 45,
              },
              {
                SHIFT: "SHIFT F",
                AVAILABILITY: 45,
                PERFORMANCE: 95,
                QUALITY: 67,
              },
            ]}
            title={"Performance By Production Line"}
            color={filterColors.performanceByProductionLine.itemcolor}
          />
        );
        case "performanceDowntimeAnalysis":
          return (
            <StackedBarChart
              data={[
                {
                  SHIFT: "SHIFT A",
                  AVAILABILITY: 90,
                  PERFORMANCE: 45,
                  QUALITY: 95,
                },
                {
                  SHIFT: "SHIFT B",
                  AVAILABILITY: 38,
                  PERFORMANCE: 84,
                  QUALITY: 72,
                },
                {
                  SHIFT: "SHIFT C",
                  AVAILABILITY: 65,
                  PERFORMANCE: 92,
                  QUALITY: 28,
                },
                {
                  SHIFT: "SHIFT D",
                  AVAILABILITY: 78,
                  PERFORMANCE: 55,
                  QUALITY: 89,
                },
                {
                  SHIFT: "SHIFT E",
                  AVAILABILITY: 92,
                  PERFORMANCE: 78,
                  QUALITY: 45,
                },
                {
                  SHIFT: "SHIFT F",
                  AVAILABILITY: 45,
                  PERFORMANCE: 95,
                  QUALITY: 67,
                },
              ]}
              title={"Performance By Production Line"}
              color={filterColors.performanceDowntimeAnalysis.itemcolor}
            />
          );
      case "availabilityByShift":
        return (
          <BarChart
            title={"Availability By Shift"}
            data={
              overallOeeData?.getOEEByMachine?.oeeByMachine || [
                { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
                { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
                { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
                { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
                { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
                { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
                { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
              ]
            }
            color={filterColors.availabilityByShift.itemcolor}
            theshold={filterColors.availabilityByShift.threshold}
          />
        );

      case "availabilityByMachine":
        return (
          <BarChart
            title={"Availability By Machine"}
            data={[
              { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
              { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
              { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
              { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
              { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
              { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
              { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
            ]}
            color={filterColors.availabilityByMachine.itemcolor}
            theshold={filterColors.availabilityByMachine.threshold}
          />
        );
      case "qualityByShift":
        return (
          <BarChart
            title={"Quality By Shift"}
            data={[
              { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
              { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
              { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
              { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
              { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
              { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
              { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
            ]}
            color={filterColors.qualityByShift.itemcolor}
            theshold={filterColors.qualityByShift.threshold}
          />
        );
      case "qualityByMachine":
        return (
          <PiChart
            data={[
              { reason: "Maintenance", downtimePercentage: 25 },
              { reason: "Breakdown", downtimePercentage: 20 },
              { reason: "Operator Error", downtimePercentage: 15 },
              { reason: "Setup Time", downtimePercentage: 12 },
              { reason: "Material Shortage", downtimePercentage: 8 },
              { reason: "Quality Issues", downtimePercentage: 7 },
            ]}
            title={"Quality By Machine"}
            color={filterColors.qualityByMachine.itemcolor}
          />
        );
      case "qualityByProduct":
        return (
          <BarChart
            title={"Quality By Product"}
            data={[
              { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
              { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
              { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
              { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
              { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
              { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
              { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
            ]}
            color={filterColors.qualityByProduct.itemcolor}
            theshold={filterColors.qualityByProduct.threshold}
          />
        );
      case "qualityLossByProductionLine":
        return (
          <BarChart
            title={"Quality Loss By Production Line"}
            data={[
              { MACHINE: "MACHINE 1", OEEPERCENTAGE: 95 },
              { MACHINE: "MACHINE 2", OEEPERCENTAGE: 42 },
              { MACHINE: "MACHINE 3", OEEPERCENTAGE: 78 },
              { MACHINE: "MACHINE 4", OEEPERCENTAGE: 15 },
              { MACHINE: "MACHINE 5", OEEPERCENTAGE: 88 },
              { MACHINE: "MACHINE 6", OEEPERCENTAGE: 63 },
              { MACHINE: "MACHINE 7", OEEPERCENTAGE: 51 },
            ]}
            color={filterColors.qualityLossByProductionLine.itemcolor}
            theshold={filterColors.qualityLossByProductionLine.threshold}
          />
        );
      case "defectDistributionByProduct":
        return (
          <PiChart
            data={[
              { reason: "Maintenance", downtimePercentage: 25 },
              { reason: "Breakdown", downtimePercentage: 20 },
              { reason: "Operator Error", downtimePercentage: 15 },
              { reason: "Setup Time", downtimePercentage: 12 },
              { reason: "Material Shortage", downtimePercentage: 8 },
              { reason: "Quality Issues", downtimePercentage: 7 },
            ]}
            title={"Quality By Machine"}
            color={filterColors.defectDistributionByProduct.itemcolor}
          />
        );
      default:
        return null;
    }
  };

  const handleCategoryChange = (value: string) => {
    setIsLoading(true); // Set loading to true
    setSelectedCategory(value);

    setTimeout(() => {
      if (allLineGraph.includes(value)) {
        setSelectedType("Line");
      }
      if (allBarGraph.includes(value)) {
        setSelectedType("Bar");
      }

      if (allStackGraph.includes(value)) {
        setSelectedType("Stack");
      }
      if (allPieGraph.includes(value)) {
        setSelectedType("Pie");
      }
      


      setIsLoading(false); // Set loading to false after 3 seconds
    }, 500); // 3000 ms = 3 seconds
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={commonLabelStyles}>Tabs</label>
          <Select
            value={categoryOptions}
            style={commonSelectStyles}
            placeholder="Select option"
            options={[
              { value: "oee", label: "OEE" },
              { value: "downtime", label: "Downtime" },
              { value: "performance", label: "Performance" },
              { value: "availability", label: "Availability" },
              { value: "quality", label: "Quality" },
            ]}
            onChange={handleTabChange}
          />
        </div>
        {categoryOptions && (
          <div style={{ flex: 1 }}>
            <label style={commonLabelStyles}>Category</label>
            <Select
              style={commonSelectStyles}
              placeholder="Select option"
              options={categoryOptions}
              value={selectedCategory}
              onChange={handleCategoryChange}
            />
          </div>
        )}
        {selectedCategory && (
          <div style={{ flex: 1 }}>
            <label style={commonLabelStyles}>Chart Type</label>
            <Input
              readOnly
              placeholder="type"
              value={selectedType}
              style={{
                ...commonSelectStyles,
                width: "50%",
                backgroundColor: "#f1f3f5",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>
        )}
      </div>
      {renderChart()}
      {selectedCategory && <Space direction="vertical">
        <label style={commonLabelStyles}>Line Color</label>
        <Space direction="horizontal">
          <Space direction="vertical">
            <ColorPicker
              onChange={(color) => {
                setFilterColors((prev) => ({
                  ...prev,
                  [selectedCategory]: {
                    ...prev[selectedCategory],
                    linecolor: [
                      color.toHexString(),
                      prev[selectedCategory].linecolor[1],
                      prev[selectedCategory].linecolor[2],
                    ],
                  },
                }));
              }}
              value={filterColors[selectedCategory]?.linecolor[0]}
              showText
            />
          </Space>

          <Space direction="vertical">
            <ColorPicker
              onChange={(color) => {
                setFilterColors((prev) => ({
                  ...prev,
                  [selectedCategory]: {
                    ...prev[selectedCategory],
                    linecolor: [
                      prev[selectedCategory].linecolor[0],
                      color.toHexString(),
                      prev[selectedCategory].linecolor[2],
                    ],
                  },
                }));
              }}
              value={filterColors[selectedCategory]?.linecolor[1]}
              showText
            />
          </Space>
          <Space direction="vertical">
            <ColorPicker
              onChange={(color) => {
                setFilterColors((prev) => ({
                  ...prev,
                  [selectedCategory]: {
                    ...prev[selectedCategory],
                    linecolor: [
                      prev[selectedCategory].linecolor[0],
                      prev[selectedCategory].linecolor[1],
                      color.toHexString(),
                    ],
                  },
                }));
              }}
              value={filterColors[selectedCategory]?.linecolor[2]}
              showText
            />
          </Space>
        </Space>
        <label style={commonLabelStyles}>Item Color</label>
        <Space direction="horizontal">
          <ColorPicker
            onChange={(color) => {
              setFilterColors((prev) => ({
                ...prev,
                [selectedCategory]: {
                  ...prev[selectedCategory],
                  itemcolor: [
                    color.toHexString(),
                    prev[selectedCategory].itemcolor[1],
                    prev[selectedCategory].itemcolor[2],
                  ],
                },
              }));
            }}
            value={filterColors[selectedCategory]?.itemcolor[0]}
            showText
          />
          <ColorPicker
            onChange={(color) => {
              setFilterColors((prev) => ({
                ...prev,
                [selectedCategory]: {
                  ...prev[selectedCategory],
                  itemcolor: [
                    prev[selectedCategory].itemcolor[0],
                    color.toHexString(),
                    prev[selectedCategory].itemcolor[2],
                  ],
                },
              }));
            }}
            value={filterColors[selectedCategory]?.itemcolor[1]}
            showText
          />
          <ColorPicker
            onChange={(color) => {
              setFilterColors((prev) => ({
                ...prev,
                [selectedCategory]: {
                  ...prev[selectedCategory],
                  itemcolor: [
                    prev[selectedCategory].itemcolor[0],
                    prev[selectedCategory].itemcolor[1],
                    color.toHexString(),
                  ],
                },
              }));
            }}
            value={filterColors[selectedCategory]?.itemcolor[2]}
            showText
          />
        </Space>
        <label style={commonLabelStyles}>Range Value</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Space direction="vertical" style={{ marginRight: '10px' }}>
            <Slider
              min={0}
              max={100}
              value={filterColors[selectedCategory]?.threshold?.[0] || 0}
              onChange={(value) => {
                setFilterColors((prev) => ({
                  ...prev,
                  [selectedCategory]: {
                    ...prev[selectedCategory],
                    threshold: [
                      value,
                      Math.max(value, prev[selectedCategory]?.threshold?.[1] || value),
                    ],
                  },
                }));
              }}
              style={{ width: '100px' }}
            />
            <span>{filterColors[selectedCategory]?.threshold?.[0] || 0}</span>
          </Space>

          <Space direction="vertical">
            <Slider
              min={0}
              max={100}
              value={filterColors[selectedCategory]?.threshold?.[1] || 0}
              onChange={(value) => {
                setFilterColors((prev) => ({
                  ...prev,
                  [selectedCategory]: {
                    ...prev[selectedCategory],
                    threshold: [
                      Math.min(prev[selectedCategory]?.threshold?.[0] || 0, value),
                      value,
                    ],
                  },
                }));
              }}
              style={{ width: '100px' }}
            />
            <span>{filterColors[selectedCategory]?.threshold?.[1] || 0}</span>
          </Space>
        </div>
      </Space>}
    </div>
  );
};

export default FilterSettings;
