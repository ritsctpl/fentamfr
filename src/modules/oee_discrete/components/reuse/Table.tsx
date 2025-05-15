import React, { useEffect, useState } from "react";
import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

// Add styles
const styles = `
  .summary-row td {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }

  .summary-row:hover {
    background-color: #f0f7ff !important;
  }

  .summary-row:hover td {
    background-color: #f0f7ff !important;
  }
`;

// Add style tag to document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface DynamicTableProps {
  data: Record<string, any>[];
  title?: string;
  columnOrder?: string[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  title = "Data Table",
  columnOrder,
}) => {
  // Format time for display if data includes time fields
  const formatTime = (dateStr: string) =>
    dayjs(dateStr).isValid() ? dayjs(dateStr).format("h:mm A") : dateStr;

  const formatDate = (dateStr: string) =>
    dayjs(dateStr).isValid() ? dayjs(dateStr).format("MMM DD, YYYY") : dateStr;

  // Get all unique keys from the data
  const getAllKeys = (data: Record<string, any>[]) => {
    const keysSet = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "type" && key !== "isSummary") {
          keysSet.add(key);
        }
      });
    });
    return Array.from(keysSet);
  };

  // Format column title for display
  const formatColumnTitle = (key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Generate dynamic columns
  const safeData = Array.isArray(data) && data.length > 0 ? data : [{}];
  const availableColumns = getAllKeys(safeData);
  const orderedColumns = columnOrder || availableColumns;

  const columns: ColumnsType<Record<string, any>> = orderedColumns.map(
    (key) => ({
      title: formatColumnTitle(key),
      dataIndex: key,
      key,
      render: (value: any, record: any) => {
        // Special handling for summary rows
        if (record.type === "summary") {
          // Combined cell for interval times in summary rows
          if (key === "interval_start_date_time") {
            return {
              children: (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {record.shift_name}
                  </div>
                </div>
              ),
              props: {
                colSpan: 2,
                style: {
                  backgroundColor: "#f0f7ff",
                },
              },
            };
          }
          // Hide the end time cell for summary rows
          if (key === "interval_end_date_time") {
            return {
              props: {
                colSpan: 0,
              },
            };
          }
        }

        // Normal cell rendering
        if (
          key.toLowerCase().includes("date_time") ||
          key.toLowerCase().includes("start_time") ||
          key.toLowerCase().includes("end_time")
        ) {
          return formatTime(value);
        }
        if (typeof value === "number") {
          return value.toLocaleString();
        }
        return value;
      },
      align: typeof safeData[0][key] === "number" ? "center" : "left",
      width:
        key.toLowerCase().includes("date_time") ||
        key.toLowerCase().includes("start_time") ||
        key.toLowerCase().includes("end_time")
          ? 150
          : undefined,
    })
  );

  // Add keys to data for table rendering and handle summary rows
  const dataWithKeys = data.map((item, index) => ({
    key: index.toString(),
    ...item,
    isSummary: item.type === "summary",
  }));

  return (
    <Card
      style={{ width: "100%", height: "calc(100vh - 225px)", overflow: "hidden" }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          <span style={{ margin: 0, fontFamily: "roboto", fontSize: "16px" }}>
            {title}
          </span>
        </div>
      }
    >
      <Table
        style={{ height: "100%" }}
        columns={columns}
        dataSource={dataWithKeys}
        scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
        pagination={false}
        bordered
        size="middle"
        rowClassName={(record) => (record.isSummary ? "summary-row" : "")}
        onRow={(record) => ({
          style: {
            backgroundColor: record.isSummary ? "#f0f7ff" : "inherit",
            fontWeight: record.type === "summary" ? "normal" : "inherit",
            height: record.isSummary ? "32px" : "inherit",
          },
        })}
      />
    </Card>
  );
};

export default DynamicTable;
