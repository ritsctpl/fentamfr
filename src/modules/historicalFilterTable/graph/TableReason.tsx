import React, { useEffect, useState } from "react";
import { Table, Card, Modal, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { BsTable } from "react-icons/bs";
import { AiOutlineClose, AiOutlineFullscreen } from "react-icons/ai";
import NoDataScreen from "../components/NoData";

// Add this to your styles
const styles = `
  .summary-row td {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    background-color: #f5f9ff !important;
    border-top: 1px solid #e6f0ff !important;
    border-bottom: 1px solid #e6f0ff !important;
  }

  .summary-row {
    font-weight: 600 !important;
  }

  .summary-row:hover td {
    background-color: #edf4ff !important;
  }

  /* Reduce Ant Design table header height and font size */
  .ant-table-thead > tr > th {
    padding: 8px 4px !important;
    font-size: 12px !important;
    height: auto !important;
    white-space: normal !important;
    text-align: center !important;
    line-height: 1.2 !important;
  }

  .ant-table-cell {
    padding: 8px 4px !important;
  }

  .empty-table-container {
    height: calc(100vh - 580px);
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
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

const TableReason: React.FC<DynamicTableProps> = ({
  data,
  title = "Data Table",
  columnOrder,
}) => {
  const [isFlip, setIsFlip] = useState(false);

  // Update the formatDateTime function
  const formatDateTime = (dateStr: string) => {
    if (!dayjs(dateStr).isValid()) return dateStr;
    return dayjs(dateStr).format("DD-MM-YYYY HH:mm");
  };

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

  // Move dataWithKeys before columns definition
  const mappedDataWithKeys = data.map((item, index) => ({
    key: index.toString(),
    ...item,
    isSummary: item.type === "summary",
  }));

  const columns: ColumnsType<Record<string, any>> = orderedColumns.map(
    (key) => ({
      title: formatColumnTitle(key),
      dataIndex: key,
      key,
      render: (value: any, record: any) => {
        // Handle interval_start and interval_end date formatting
        if (key === "interval_start" || key === "interval_end") {
          return dayjs(value).format("DD-MM-YYYY HH:mm");
        }

        // Handle hour_block date formatting
        if (key === "hour_block") {
          return dayjs(value).format("DD-MM-YYYY HH:mm");
        }

        // Handle result column with potential long text
        if (key === "result") {
          return (
            <div
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.4",
              }}
            >
              {value}
            </div>
          );
        }

        // Existing number formatting
        if (typeof value === "number") {
          return value.toLocaleString();
        }

        return value;
      },
      align: typeof safeData[0][key] === "number" ? "center" : "left",
      width: (() => {
        if (key === "interval_start" || key === "interval_end") {
          return 120; // Reduced width for date columns
        }
        if (key === "result") {
          return 400; // Increased width for result/reason column
        }
        if (key === "hour_block") {
          return 120;
        }
        if (
          key.toLowerCase().includes("target") ||
          key.toLowerCase().includes("actual")
        ) {
          return 100;
        }
        return undefined;
      })(),
      ellipsis: key !== "result", // Disable ellipsis for result column
    })
  );

  // Update the Table component props
  <Table
    columns={columns}
    dataSource={mappedDataWithKeys}
    scroll={{ y: "calc(100vh - 580px)", x: 800 }} // Set minimum scroll width
    size="small"
    bordered
  />;
  // Add keys to data for table rendering and handle summary rows
  // Move dataWithKeys definition before any Table usage
  const dataWithKeys = data.map((item, index) => ({
    key: index.toString(),
    ...item,
    isSummary: item.type === "summary",
  }));

  // Check if data is empty or invalid
  const isDataEmpty = !Array.isArray(data) || data.length === 0;

  return (
    <Card
      style={{
        width: "100%",
        height: "calc(100vh - 510px)",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: "0px" }}
    >
      <span
        style={{
          margin: 0,
          fontSize: "14px",
          fontWeight: "600",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <BsTable style={{ fontSize: "14px" }} />
          {title}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <AiOutlineFullscreen
            onClick={() => setIsFlip(true)}
            style={{ cursor: "pointer" }}
          />
        </div>
      </span>

      {isDataEmpty ? (
        <div className="empty-table-container">
          <NoDataScreen
            message="No Table Data"
            subMessage="There is no data available to display in the table"
          />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={dataWithKeys}
          scroll={{ y: "calc(100vh - 580px)", x: 800 }}
          pagination={false}
          bordered
          size="small"
          rowClassName={(record) => (record.isSummary ? "summary-row" : "")}
          onRow={(record) => ({
            style: {
              backgroundColor: record.isSummary ? "#f0f7ff" : "inherit",
              fontWeight: record.type === "summary" ? "normal" : "inherit",
              height: record.isSummary ? "32px" : "inherit",
            },
          })}
          locale={{
            emptyText: (
              <NoDataScreen
                message="No Table Data"
                subMessage="There is no data available to display in the table"
              />
            ),
          }}
        />
      )}

      <Modal
        closable={false}
        open={isFlip}
        centered
        onCancel={() => setIsFlip(false)}
        footer={null}
        width="100%"
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ flex: 1, textAlign: "center" }}>{title}</span>
            <Button
              type="text"
              icon={<AiOutlineClose style={{ fontSize: "20px" }} />}
              onClick={() => setIsFlip(false)}
              style={{ position: "absolute", right: 24 }}
            />
          </div>
        }
      >
        <div style={{ height: "calc(100vh - 120px)", overflow: "auto" }}>
          <Table
            columns={columns}
            dataSource={dataWithKeys}
            scroll={{ x: 800 }}
            pagination={false}
            bordered
            size="small"
            rowClassName={(record) => (record.isSummary ? "summary-row" : "")}
            onRow={(record) => ({
              style: {
                backgroundColor: record.isSummary ? "#f0f7ff" : "inherit",
                fontWeight: record.type === "summary" ? "normal" : "inherit",
                height: record.isSummary ? "32px" : "inherit",
              },
            })}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default TableReason;
