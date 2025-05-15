import React, { useState } from "react";
import { Row, Col, Button, Modal, Table, message } from "antd";
import WorkcenterTitle from "./WorkcenterTitle";
import NoDataScreen from "./NoData";
import BarChartPopup from "../graph/Barchartclick";
import LineGraph from "../graph/LineGraph";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import { parseCookies } from "nookies";
import type { ColumnsType } from "antd/es/table";

const color = ["#FFB366", "#66B2FF", "#B366FF", "#FF6666"];

function Shift({
  onBarClick,
  selectedResource,
  shiftData,
  currentShift,
  selectedMachine,
}) {
  const [tableData, setTableData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [seriesName, setSeriesName] = useState("");
  const cookies = parseCookies();
  console.log(shiftData);
  if (!shiftData?.length) {
    return (
      <NoDataScreen
        message="No Shift Data Available"
        subMessage="There is no shift data available for the selected resource"
      />
    );
  }

  const item = selectedResource ? [selectedResource] : [];
  const handleLineClick = async (date: string, values: any) => {
    try {
      const seriesName = Object.keys(values)[0];
      setSeriesName(seriesName);
      const value = values[seriesName];
      const payload = {
        site: cookies.site,
        resource: [selectedResource.resource_id],
        workcenter: [selectedMachine.workcenter_id],
        shiftId: [currentShift],
      };

      let endpoint = "";
      switch (seriesName) {
        case "oee":
          endpoint = "get_roee";
          break;
        case "availability":
          endpoint = "get_ravailability";
          break;
        case "performance":
          endpoint = "get_rperformance";
          break;
        case "quality":
          endpoint = "get_rquality";
          break;
        default:
          throw new Error("Invalid series name");
      }

      const response = await fetchEndpointsData(
        payload,
        "oee-service/apiregistry",
        endpoint
      );

      if (!response?.data?.data) {
        throw new Error("No data received from server");
      }

      setTableData(response.data.data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching shift details:", error);
      message.error(error.message || "Failed to fetch shift details");
    }
  };

  // Dynamic column generation function
  const generateColumns = (data): ColumnsType<any> => {
    try {
      if (!data || data.length === 0) return [];

      const keys = Object.keys(data[0]);
      return keys.map((key) => {
        try {
          // Determine column type and width based on key name and data
          const isDateColumn =
            key.includes("datetime") || key.includes("date_time");
          const isNumberColumn = data.some(
            (item: { [x: string]: any }) => typeof item[key] === "number"
          );
          const isStatusColumn =
            key.includes("status") || key.includes("type") || key === "active";
          const isIDColumn = key.includes("id") || key === "id";

          // Dynamic width based on content type
          const width = isDateColumn
            ? 180
            : isNumberColumn
            ? 120
            : isStatusColumn
            ? 120
            : isIDColumn
            ? 100
            : 150;

          return {
            title: key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            dataIndex: key,
            key: key,
            width: width,
            fixed: key === "id" ? ("left" as const) : undefined,
            render: (text, record) => {
              try {
                // Handle null/undefined
                if (text === null || text === undefined) return "-";

                // Handle dates
                if (isDateColumn) {
                  return new Date(text).toLocaleString();
                }

                // Handle numbers
                if (typeof text === "number") {
                  // Percentage handling
                  if (
                    key.includes("percentage") ||
                    key.includes("efficiency") ||
                    key.includes("quality") ||
                    key.includes("availability")
                  ) {
                    return `${text.toFixed(2)}%`;
                  }
                  // Regular number handling
                  return Number.isInteger(text)
                    ? text.toLocaleString()
                    : text.toFixed(2);
                }

                // Handle boolean
                if (typeof text === "boolean") {
                  return text ? "Yes" : "No";
                }

                // Default text handling
                return text;
              } catch (error) {
                console.error(`Error rendering cell value for ${key}:`, error);
                return "-";
              }
            },
            ellipsis: {
              showTitle: true,
            },
            sorter: (a, b) => {
              if (typeof a[key] === "number") {
                return a[key] - b[key];
              }
              if (typeof a[key] === "string") {
                return a[key].localeCompare(b[key]);
              }
              return 0;
            },
          };
        } catch (error) {
          console.error(`Error generating column for key ${key}:`, error);
          return {
            title: key,
            dataIndex: key,
            key: key,
          };
        }
      });
    } catch (error) {
      console.error("Error generating columns:", error);
      return [];
    }
  };

  const downloadAsExcel = () => {
    try {
      // Add logging to debug the data
      console.log("Table data length:", tableData?.length);

      // If no data, return
      if (!tableData || tableData.length === 0) {
        message.error("No data to download");
        return;
      }

      // Get headers from the first object's keys
      const headers = Object.keys(tableData[0]);
      console.log("Headers:", headers);

      // Create CSV content
      let csvContent = headers.join(",") + "\n"; // Headers row

      // Add data rows
      tableData.forEach((row, index) => {
        console.log(`Processing row ${index + 1}`);
        const rowData = headers.map((header) => {
          const value = row[header];
          // Handle special characters and commas
          if (value === null || value === undefined) {
            return "";
          }
          const stringValue = String(value);
          // If value contains comma, quote, or newline, wrap in quotes
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvContent += rowData.join(",") + "\n";
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${seriesName}_details_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error("Failed to download file");
    }
  };

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={16} sm={16} md={6} lg={6} xl={6}>
          <WorkcenterTitle data={item} titleType={"Resource"} />
        </Col>
        <Col xs={24} sm={24} md={18} lg={18} xl={18}>
          {/* <LineGraph
            data={shiftData?.map((item: any) => ({
              date: item?.interval_end_date_time
                ? new Date(item.interval_end_date_time).toLocaleString()
                : "",
              oee: item?.oee,
              availability: item?.availability,
              quality: item?.quality,
              performance: item?.performance,
            }))}
            title={"TIME INTERVAL"}
            color={color}
            onLineClick={handleLineClick}
          /> */}
          <LineGraph
            data={shiftData?.map((item: any) => ({
              date: item?.interval_start_date_time
                ? new Date(item.interval_start_date_time).toISOString()
                : "",
              oee: item?.oee,
              availability: item?.availability, 
              quality: item?.quality,
              performance: item?.performance
            })) || []}
            title={"TIME INTERVAL"}
            color={color}
            onLineClick={handleLineClick}
          />
        </Col>
      </Row>

      <Modal
        title={seriesName.toUpperCase()}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          <Button type="primary" onClick={downloadAsExcel}>
            Export to CSV
          </Button>
        }
        width="95vw"
        centered
        bodyStyle={{
          height: "calc(95vh - 120px)",
          padding: "16px",
          overflow: "hidden",
        }}
      >
        <div style={{ height: "100%", overflow: "hidden" }}>
          <Table
            dataSource={tableData}
            columns={generateColumns(tableData)}
            rowKey={(record) => record.id || record.interval_end_date_time}
            scroll={{ x: "max-content", y: "calc(95vh - 200px)" }}
            size="middle"
            pagination={false}
            bordered
            sticky
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          />
        </div>
      </Modal>
    </>
  );
}

export default Shift;
