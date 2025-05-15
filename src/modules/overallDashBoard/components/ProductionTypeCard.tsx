import React from "react";
import { Card } from "antd";
import styles from "../styles/OverallDashBoardMain.module.css";
import { MdOutlineFactory } from "react-icons/md";
import { FiActivity } from "react-icons/fi";

interface WorkcenterData {
  workcenter_id: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  itemData: any;
}

interface ProductionCardProps {
  oeeValue: number;
  onViewChange: (view: WorkcenterData) => void;
  workcenterName: string;
  availability: number;
  performance: number;
  quality: number;
  itemData?: WorkcenterData;
}

const ProductionCard: React.FC<ProductionCardProps> = ({
  oeeValue,
  onViewChange,
  workcenterName,
  availability,
  performance,
  quality,
  itemData,
}) => {
  const metrics = {
    availability: availability,
    quality: quality,
    performance: performance,
  };



  return (
    <Card
      style={{
        height: "160px", // Back to original height
        width: "100%",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.04)",
        borderRadius: "10px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
        background:
          "linear-gradient(120deg, rgba(58, 160, 128, 0.15) 0%, rgba(58, 160, 128, 0.25) 100%)",
        border: "3px solid rgba(58, 160, 128, 0.15)",
      }}
      bodyStyle={{
        padding: "12px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      hoverable
      onClick={() => onViewChange(itemData)}
      className={styles.clickableSection}
    >
      {/* Top section - Workcenter name and icon */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            background: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
            border: "1px solid rgba(58, 160, 128, 0.2)",
            marginRight: "8px",
          }}
        >
          {/* <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="14" width="4" height="6" fill="#3aa080" />
            <rect x="10" y="10" width="4" height="10" fill="#3aa080" />
            <rect x="16" y="6" width="4" height="14" fill="#3aa080" />
          </svg> */}
          <FiActivity />
        </div>
        <div
          style={{
            color: "#1f2937",
            fontSize: workcenterName?.length > 10 ? "14px" : "16px",
            fontWeight: "600",
            lineHeight: "1.2",
          }}
        >
          {workcenterName}
        </div>
      </div>

      {/* Middle section - OEE Value */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div
          style={{
            color: "#4b5563",
            fontSize: "13px",
            fontWeight: "500",
            marginBottom: "2px",
          }}
        >
          Overall Equipment Effectiveness
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#3aa080",
            lineHeight: "1.2",
          }}
        >
          {oeeValue === 0 ? '0' : oeeValue === 100 ? '100' : oeeValue?.toFixed(1)}%
        </div>
      </div>

      {/* Bottom section - Metrics */}
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: "4px" }}
      >
        <MetricItem
          label="Performance"
          value={metrics.performance}
          color="#3aa080"
        />
        <MetricItem
          label="Availability"
          value={metrics.availability}
          color="#3aa080"
        />
        <MetricItem label="Quality" value={metrics.quality} color="#3aa080" />
      </div>
    </Card>
  );
};

// Helper component for metric items with optimized spacing
const MetricItem: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div
      style={{
        color: "#4b5563",
        fontSize: "11px",
        fontWeight: "500",
        marginBottom: "1px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "15px",
        fontWeight: "600",
        color,
        lineHeight: "1.2",
      }}
    >
      {value === 0 ? '0' : value === 100 ? '100' : value.toFixed(1)}%
    </div>
  </div>
);

interface ProductionTypeCardProps {
  onViewChange: (view: WorkcenterData) => void;
  data: WorkcenterData[];
}

const ProductionTypeCard: React.FC<ProductionTypeCardProps> = ({
  onViewChange,
  data,
}) => {

  // Calculate card width based on number of items
  const getCardWidth = () => {
    const count = data.length;
    if (count <= 4) {
      switch (count) {
        case 1: return '100%';
        case 2: return 'calc(50% - 7px)'; // Accounting for gap
        case 3: return 'calc(33.33% - 10px)';
        case 4: return 'calc(25% - 11px)';
        default: return 'calc(25% - 11px)';
      }
    }
    return 'calc(25% - 11px)'; // Fixed width for scrollable cards
  };

  console.log(data, "datass");
  

  return (
    <div
      className={styles.scrollContainer}
      style={{
        width: '100%',
        overflowX: data.length > 4 ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '10px',
        paddingTop: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          paddingLeft: '2px',
          paddingRight: '2px',
        }}
      >
        {data.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              width: getCardWidth(),
              minWidth: data.length > 4 ? '300px' : 'auto',
              flexShrink: 0,
            }}
          >
            <ProductionCard
              oeeValue={item?.oee}
              onViewChange={onViewChange}
              workcenterName={item?.workcenter_id}
              availability={item?.availability}
              performance={item?.performance}
              quality={item?.quality}
              itemData={item}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionTypeCard;
