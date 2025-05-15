import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from "../styles/WorkcenterTile.module.css";
interface OEEData {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  planned_quantity: number;
  total_good_quantity: number;
  total_bad_quantity: number;
  workcenter?: string;
  workcenter_id?: string;
  resource_id?: string;
  item?: string;
  resource?: string;
  total_quantity?: number;
}

interface WorkcenterTitleProps {
  data: OEEData[];
  titleType: string;
}
const WorkcenterTitle = ({ data, titleType }: WorkcenterTitleProps) => {
  const oeeData =
    data && data.length > 0
      ? data[0]
      : {
          oee: 0,
          availability: 0,
          performance: 0,
          quality: 0,
          total_quantity: 0,
          planned_quantity: 0,
          total_good_quantity: 0,
          total_bad_quantity: 0,
        };

  // Format numbers to remove unnecessary decimals
  const formatNumber = (num: number) => {
    return Number.isInteger(num) ? Math.round(num).toString() : num.toFixed(2);
  };

  const oeeValue = formatNumber(oeeData.oee || 0);
  const availabilityValue = formatNumber(oeeData.availability || 0);
  const performanceValue = formatNumber(oeeData.performance || 0);
  const qualityValue = formatNumber(oeeData.quality || 0);

  // Production data
  const actualQuantity = oeeData?.total_quantity || 0;
  const planQuantity = oeeData?.planned_quantity?.toFixed(2) || 0;
  const goodQuantity = oeeData?.total_good_quantity || 0;
  const badQuantity = oeeData?.total_bad_quantity || 0;

  // Update createRingData to use the raw values
  const createRingData = (value) => [
    { name: "Value", value: parseFloat(value) },
    { name: "Remainder", value: 100 - parseFloat(value) },
  ];

  const availabilityData = createRingData(availabilityValue);
  const performanceData = createRingData(performanceValue);
  const qualityData = createRingData(qualityValue);

  // Colors for the rings
  const availabilityColors = ["#4caf50", "#e0e0e0"];
  const performanceColors = ["#FFA725", "#e0e0e0"];
  const qualityColors = ["#8967B3", "#e0e0e0"];

  // Add this function to determine border style
  const getBorderStyle = () => {
    const numericOee = parseFloat(oeeValue);
    if (numericOee <= 30) {
      return "3px solid #ef4444"; // Red bottom border for very low OEE (1-30)
    } else if (numericOee <= 80) {
      return "3px solid #eab308"; // Yellow bottom border for medium OEE (31-80)
    }
    return "3px solid #22c55e"; // Green bottom border for high OEE (81-100)
  };

  return (
    <div
      className={styles.container}
      style={{ borderBottom: getBorderStyle() }}
    >
      {/* Header Section */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title} style={{ fontSize: oeeData?.workcenter_id?.length > 10 ? "12px" : "16px" }}>
            {titleType === "Workcenter"
              ? oeeData?.workcenter_id : oeeData?.resource_id}
          </h2>
          <p className={styles.subtitle}>{titleType}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className={styles.chartContainer} style={{ userSelect: "none" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ outline: "none" }}>
            {/* Quality Ring (Inner) */}
            <Pie
              data={qualityData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              style={{ outline: "none" }}
              isAnimationActive={false}
            >
              {qualityData.map((entry, index) => (
                <Cell
                  key={`cell-quality-${index}`}
                  fill={qualityColors[index]}
                  strokeWidth={0}
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>

            {/* Performance Ring (Middle) */}
            <Pie
              data={performanceData}
              cx="50%"
              cy="50%"
              innerRadius={73}
              outerRadius={83}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              style={{ outline: "none" }}
              isAnimationActive={false}
            >
              {performanceData.map((entry, index) => (
                <Cell
                  key={`cell-performance-${index}`}
                  fill={performanceColors[index]}
                  strokeWidth={0}
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>

            {/* Availability Ring (Outer) */}
            <Pie
              data={availabilityData}
              cx="50%"
              cy="50%"
              innerRadius={86}
              outerRadius={96}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              style={{ outline: "none" }}
              isAnimationActive={false}
            >
              {availabilityData.map((entry, index) => (
                <Cell
                  key={`cell-availability-${index}`}
                  fill={availabilityColors[index]}
                  strokeWidth={0}
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center OEE Value */}
        <div className={styles.centerValue}>
          <p
            className={styles.changeText}
            style={{
              color:
                parseFloat(oeeValue) >= 80
                  ? "#22c55e"
                  : parseFloat(oeeValue) >= 60
                  ? "#FFA725"
                  : parseFloat(oeeValue) >= 30
                  ? "#eab308"
                  : "#ef4444",
            }}
          >
            OEE
          </p>
          <p
            className={styles.oeeValue}
            style={{
              color:
                parseFloat(oeeValue) >= 80
                  ? "#22c55e"
                  : parseFloat(oeeValue) >= 60
                  ? "#FFA725"
                  : parseFloat(oeeValue) >= 30
                  ? "#eab308"
                  : "#ef4444",
            }}
          >
            {oeeValue}%
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className={styles.metricsSection}>
        {/* <div className={styles.metricItem}>
          <p className={`${styles.metricLabel} ${styles.targetLabel}`}>Target</p>
          <p className={styles.targetValue}>{targetValue}%</p>
        </div> */}
        <div className={styles.metricItem}>
          <p className={`${styles.metricLabel} ${styles.availabilityLabel}`}>
            Availability
          </p>
          <p className={styles.availabilityValue}>{availabilityValue}%</p>
        </div>
        <div className={styles.metricItem}>
          <p className={`${styles.metricLabel} ${styles.performanceLabel}`}>
            Performance
          </p>
          <p className={styles.performanceValue}>{performanceValue}%</p>
        </div>
        <div className={styles.metricItem}>
          <p className={`${styles.metricLabel} ${styles.qualityLabel}`}>
            Quality
          </p>
          <p className={styles.qualityValue}>{qualityValue}%</p>
        </div>
      </div>

      {/* Production Data */}
      <div className={styles.productionSection}>
        <div className={styles.productionGrid}>
          <div>
            <p className={styles.dataLabel}>Actual:</p>
            <p className={styles.dataValue}>{actualQuantity}</p>
          </div>
          <div>
            <p className={styles.dataLabel}>Plan:</p>
            <p className={styles.dataValue}>{planQuantity}</p>
          </div>
          <div>
            <p className={styles.dataLabel} style={{ color: "#10b981" }}>
              Good Quantity:
            </p>
            <p className={`${styles.dataValue} ${styles.goodQuantity}`}>
              {goodQuantity}
            </p>
          </div>
          <div>
            <p className={styles.dataLabel} style={{ color: "#ef4444" }}>
              Rejections:
            </p>
            <p className={`${styles.dataValue} ${styles.badQuantity}`}>
              {badQuantity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkcenterTitle;
