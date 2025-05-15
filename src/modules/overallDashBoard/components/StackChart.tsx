import React from "react";
import { Card, Typography, Tooltip } from "antd";
import { AiOutlineInfoCircle } from "react-icons/ai";

const { Title } = Typography;

interface StackChartProps {
  data: {
    label: string;
    availability: number;
    downtime: number;
    breakTime: number;
  }[];
  title?: string;
  style?: React.CSSProperties;
}

// Default data if none provided
const DEFAULT_DATA = [
  {
    label: "Default",
    availability: 60,
    downtime: 15,
    breakTime: 25,
  }
];

const StackChart: React.FC<StackChartProps> = ({
  data = DEFAULT_DATA,
  title = "Machine Status",
  style,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card
        style={{
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        No data available
      </Card>
    );
  }

  // Calculate total values across all data
  const totalData = data.reduce(
    (acc, item) => {
      return {
        availability: acc.availability + item.availability,
        breakTime: acc.breakTime + item.breakTime,
        downtime: acc.downtime + item.downtime,
      };
    },
    { availability: 0, breakTime: 0, downtime: 0 }
  );

  // Normalize values to percentages based on total
  const total = totalData.availability + totalData.breakTime + totalData.downtime;
  const segments = [];
  let currentPosition = 0;
  debugger
  if (totalData.availability > 0) {
    const width = (totalData.availability / total) * 100;
    segments.push({
      left: `${currentPosition}%`,
      width: `${width}%`,
      backgroundColor: "#3aa080",
    });
    currentPosition += width;
  }

  if (totalData.breakTime > 0) {
    const width = (totalData.breakTime / total) * 100;
    segments.push({
      left: `${currentPosition}%`,
      width: `${width}%`,
      backgroundColor: "#ffd700",
    });
    currentPosition += width;
  }

  if (totalData.downtime > 0) {
    const width = (totalData.downtime / total) * 100;
    segments.push({
      left: `${currentPosition}%`,
      width: `${width}%`,
      backgroundColor: "#ff0000",
    });
  }

  return (
    <Card
      style={{
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
        height: "100%",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        <Tooltip title="Shows the breakdown of machine status: availability, break time, and downtime.">
          <AiOutlineInfoCircle style={{ cursor: "pointer" }} />
        </Tooltip>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            height: "20px",
            backgroundColor: "#f3f4f6",
            overflow: "hidden",
            position: "relative",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {segments.map((segment, idx) => (
            <div
              key={idx}
              style={{
                height: "100%",
                position: "absolute",
                ...segment,
              }}
            />
          ))}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#3aa080",
                borderRadius: "4px",
              }}
            />
            <span style={{ fontSize: "14px", color: "#4b5563" }}>Availability</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#ffd700",
                borderRadius: "4px",
              }}
            />
            <span style={{ fontSize: "14px", color: "#4b5563" }}>Break Time</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#ff0000",
                borderRadius: "4px",
              }}
            />
            <span style={{ fontSize: "14px", color: "#4b5563" }}>Downtime</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StackChart;
