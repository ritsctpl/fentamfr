import React from "react";
import { Card } from "antd";
import { BsClockFill } from "react-icons/bs";
import { AiFillThunderbolt } from "react-icons/ai";
import { BsCheckCircleFill } from "react-icons/bs";
import { BiTargetLock } from "react-icons/bi";
import { BsSpeedometer2 } from "react-icons/bs";

interface DivisionSnapCardProps {
  availability: number;
  performance: number;
  quality: number;
  oeeScore: number;
  availabilityNote?: string;
  performanceNote?: string;
  qualityNote?: string;
  oeeNote?: string;
}

const DivisionSnapCard: React.FC<DivisionSnapCardProps> = ({
  availability,
  performance,
  quality,
  oeeScore,
  availabilityNote = "",
  performanceNote = "",
  qualityNote = "",
  oeeNote = ""
}) => {
  return (
    <Card
      style={{
        borderRadius: "12px",
        height: "180px",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        transition: "box-shadow 0.3s ease-in-out",
        border: "1px solid rgba(0, 0, 0, 0.05)",
      }}
      bodyStyle={{
        padding: "20px",
        height: "100%",
        backgroundColor: "#ffffff",
      }}
      hoverable
      className="division-snap-card"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BsSpeedometer2 style={{ fontSize: "12px" }} />
          <span style={{ fontWeight: "600", fontSize: "16px" }}>
            Current Day vs Previous Day Analysis
          </span>
        </div>
        <MetricRow
          icon={<BsClockFill color="#ff7875" size={16}/>}
          label="Availability"
          value={availability}
          note={availabilityNote}
        />
        <MetricRow
          icon={<AiFillThunderbolt color="#ffc53d" size={16} />}
          label="Performance"
          value={performance}
          note={performanceNote}
        />
        <MetricRow
          icon={<BsCheckCircleFill color="#52c41a" size={16} />}
          label="Quality"
          value={quality}
          note={qualityNote}
        />
        <MetricRow
          icon={<BiTargetLock color="#1890ff" size={16} />}
          label="OEE"
          value={oeeScore}
          note={oeeNote}
        />
      </div>
    </Card>
  );
};

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  note?: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ icon, label, value, note }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: 0,
        flex: 1,
      }}
    >
      {icon}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "nowrap",
          overflow: "hidden",
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          style={{
            fontWeight: "500",
            fontSize: "15px",
            color: "#333",
            whiteSpace: "nowrap",
          }}
        >
          {label}: {value === 0 ? '0' : value.toFixed(2)}%
        </span>
        <span
          style={{
            color: "#666",
            fontSize: "13px",
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {note || `- ${label}`}
        </span>
      </div>
    </div>
  </div>
);

// Update the style tag
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  .division-snap-card {
    overflow: hidden;
  }

  @media screen and (max-width: 768px) {
    .division-snap-card {
      height: auto !important;
      min-height: 160px !important;
    }
    .division-snap-card .ant-card-body {
      padding: 12px !important;
    }
    .division-snap-card [class*="MetricRow"] {
      gap: 4px !important;
    }
    .division-snap-card [class*="MetricRow"] span {
      font-size: 13px !important;
    }
  }
  
  @media screen and (max-width: 480px) {
    .division-snap-card {
      min-height: 140px !important;
    }
    .division-snap-card .ant-card-body {
      padding: 8px !important;
    }
    .division-snap-card [class*="MetricRow"] {
      gap: 3px !important;
      margin-bottom: 4px !important;
    }
    .division-snap-card [class*="MetricRow"] span {
      font-size: 11px !important;
    }
    .division-snap-card [class*="MetricRow"] svg {
      width: 12px !important;
      height: 12px !important;
      flex-shrink: 0;
    }
  }
`;
document.head.appendChild(styleTag);

export default DivisionSnapCard;
