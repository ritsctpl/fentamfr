import { Card } from "antd";
import React from "react";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";

interface DurationCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  period: string;
}

const DurationCard: React.FC<DurationCardProps> = ({
  title,
  currentValue,
  previousValue,
  period,
}) => {
  const isHigher = currentValue >= previousValue;
  const difference = Math.abs(currentValue - previousValue);

  // Dynamic colors based on trend
  const colors = {
    success: {
      text: "#52c41a",
      border: "#b7eb8f",
      bg: "#f6ffed",
    },
    danger: {
      text: "#ff4d4f",
      border: "#ffccc7",
      bg: "#fff1f0",
    },
  };

  const theme = isHigher ? colors.success : colors.danger;

  return (
    <Card
      size="small"
      style={{
        width: "150px",
        height: "68px",
        borderRadius: "6px",
        margin: "0 4px",
        boxShadow: `0 2px 8px ${isHigher ? "rgba(82, 196, 26, 0.08)" : "rgba(255, 77, 79, 0.08)"
          }`,
        border: `1px solid ${theme.border}`,
        background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
        transition: "all 0.2s ease",
      }}
      bodyStyle={{
        padding: "8px 12px",
      }}
      hoverable
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#262626",
              fontWeight: "600",
            }}
          >
            {title}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              backgroundColor: theme.bg,
              padding: "1px 6px",
              borderRadius: "10px",
              border: `1px solid ${theme.border}`,
            }}
          >
            {isHigher ? (
              <CaretUpOutlined
                style={{ fontSize: "12px", color: theme.text }}
              />
            ) : (
              <CaretDownOutlined
                style={{ fontSize: "12px", color: theme.text }}
              />
            )}
            <span
              style={{
                fontSize: "10px",
                color: theme.text,
                fontWeight: "600",
              }}
            >
              {difference === 0 ? '0' : difference === 100 ? '100' : difference.toFixed(2)}%
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#262626",
            }}
          >
            {/* {currentValue.toFixed(2)}% */}
            {currentValue === 0 ? '0' : currentValue === 100 ? '100' : currentValue.toFixed(2)}%
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "1px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#8c8c8c",
              }}
            >
              {period}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "#595959",
              }}
            >
              {/* {previousValue.toFixed(2)}% */}
              {previousValue === 0 ? '0' : previousValue === 100 ? '100' : previousValue.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DurationCard;
