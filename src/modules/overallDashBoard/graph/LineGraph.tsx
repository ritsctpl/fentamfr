import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Tooltip, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFileSearch,
  AiOutlineFullscreen,
} from "react-icons/ai";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { CloseOutlined } from "@mui/icons-material";
import { BsGraphUp } from "react-icons/bs";
import NoDataScreen from "../components/NoData";
// import NoDataScreen from "../components/NoData";
const { Title } = Typography;

interface DataPoint {
  date: string;
  [key: string]: number | string;
}

interface LineChartProps {
  data: DataPoint[];
  title: String;
  color: any;
  description?: any;
  type?: string;
  onLineClick?: (date: string, values: any) => void;
}
export const getColor = (value: number, type: string, color) => {
  switch (type) {
    case "availability":
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case "quality":
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case "downtime":
      if (value > color?.threshold[0]) return color?.itemcolor[0];
      if (value > color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case "performance":
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case "oee":
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    default:
      if (value < 50) return color?.itemcolor[0];
      if (value < 84) return color?.itemcolor[1];
      return color?.itemcolor[2];
  }
};

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color,
  description,
  type,
  onLineClick,
}) => {
  console.log(data, "lineData");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem("activeTabIndex");
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
    if (isFlip && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
  }, [isModalOpen, isFlip]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (echartsRef.current) {
        echartsRef.current.getEchartsInstance().resize();
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      if (chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
    };
  }, [data]);
  useEffect(() => {
    if (data && data.length > 0) {
      // Extract the xAxisData
      const newXAxisData = data.map((item) => item.date);

      // Extract the series keys (all keys except 'date')
      const newSeriesKeys = Object.keys(data[0]).filter(
        (key) => key !== "date"
      );
    }
  }, [data, tabkey, color]);
  const getColor = (value: number, type: string) => {
    switch (type) {
      case "availability":
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      case "quality":
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      case "downtime":
        if (value > color?.threshold[1]) return color?.itemcolor[2]; // Red for high downtime
        if (value > color?.threshold[0]) return color?.itemcolor[1]; // Yellow for medium downtime
        return color?.itemcolor[0]; // Green for low downtime
      case "performance":
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      case "oee":
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      default:
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
    }
  };

  const xAxisData = data?.length ? data.map((item) => item.date) : [];
  const seriesKeys = Object.keys(data[0] || {}).filter((key) => key !== "date");
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const isDownTime = activeTabIndex?.includes("downtime") ? true : false;
  const series = seriesKeys.map((key, index) => {
    const dataPoints = data.map((item) => item[key] as number);
    return {
      name: key,
      type: "line",
      smooth: 0.5,
      smoothMonotone: "x",
      data: dataPoints,
      stack: "Total",
      areaStyle: {
        color: "#3aa080",
        opacity: 0.2,
      },
      clip: true,
      itemStyle: {
        color: "#3aa080",
      },
      label: {
        show: true,
        position: "top",
        formatter: (params: any) => {
          const value = params.value;
          if (isDownTime) {
            return `${value} sec`;
          } else if (
            title.toLowerCase() === "scrap and rework trend" ||
            type === "count"
          ) {
            return `${value}`;
          } else {
            // Format number to always show 2 decimal places
            return `${Number(value).toFixed(2)} %`;
          }
        },
        fontSize: 12,
      },
      lineStyle: {
        color: "#3aa080",
        width: 3,
        cap: "round",
      },
    };
  });

  const options = {
    // color:colors,
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        interval: 0,
        formatter: (value: string, index: number) => {
          const dateSeparator = value.includes('T') ? 'T' : ' ';
          const [datePart, timePart] = value.split(dateSeparator);
          // For first entry always show date
          if (index === 0) return datePart;
          
          // Get previous date part
          const prevDate = (index > 0 && xAxisData[index - 1]) ? xAxisData[index - 1].split(dateSeparator)[0] : '';
          
          // Show date only if different from previous
          return datePart === prevDate ? timePart : datePart;
        },
        rotate: 0,
      },
      splitNumber: data?.length || 0,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      splitNumber: 5,
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          opacity: 0.3,
        },
      },
      axisLabel: {
        formatter: (value: number) => {
          return isDownTime ? `${value} sec` : `${value}%`;
        },
      },
    },
    series: seriesKeys.map((key, index) => ({
      name: key,
      type: "line",
      smooth: 0.5,
      smoothMonotone: "x",
      data: data.map((item) => {
        const value = Number(item[key]);
        return {
          value: Math.min(value, 100), // Cap at 100 for visual
          actualValue: value, // Store actual value for tooltip
        };
      }),
      stack: "Total",
      areaStyle: {
        color: "#3aa080",
        opacity: 0.2,
      },
      clip: true,
      itemStyle: {
        color: "#3aa080",
      },
      label: {
        show: true,
        position: "top",
        formatter: (params: any) => {
          const value = params.data.actualValue;
          if (isDownTime) {
            return `${value} sec`;
          } else if (
            title.toLowerCase() === "scrap and rework trend" ||
            type === "count"
          ) {
            return `${value}`;
          } else {
            return `${Number(value).toFixed(2)}%`;
          }
        },
        fontSize: 11,
        padding: [4, 0, 0, 0],
        color: "#08181c",
      },
      lineStyle: {
        color: "#3aa080",
        width: 3,
        cap: "round",
      },
      symbol: "circle",
      symbolSize: 6,
    })),
    dataZoom: [
      {
        show: isFlip, 
        type: "slider", 
        bottom: "bottom",
        height: "2%",
        start: isFlip ? 0 : Math.max(0, ((data.length - 7) / data.length) * 100),
        end: 100,
      },
    ],

    toolbox: {
      show: false,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
      formatter: (params: any) => {
        const header = params[0].name;
        const body = params
          .map(({ marker, seriesName, data }) => {
            const value = data.actualValue;
            if (isDownTime) {
              return `${marker} ${seriesName}: ${value} sec`;
            } else if (
              title.toLowerCase() === "scrap and rework trend" ||
              type === "count"
            ) {
              return `${marker} ${seriesName}: ${value}`;
            } else {
              return `${marker} ${seriesName}: ${Number(value).toFixed(2)}%`;
            }
          })
          .join("<br />");
        return `${header}<br />${body}`;
      },
    },
    legend: {
      data: seriesKeys,
      top: "bottom",
      left: "center",
    },
    grid: {
      triggerEvent: true,
      top: "40px", // Increased top margin
      bottom: "40px", // Increased bottom margin
      left: "40px", // Increased left margin
      right: "40px", // Increased right margin
      containLabel: true,
    },
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(true);
  };

  console.log(color, "color");

  return (
    <Card
      ref={chartContainerRef}
      style={{
        background: "white",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        borderRadius: "8px",
      }}
      bodyStyle={{ padding: "10px" }}
    >
      <span
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#08181c",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BsGraphUp style={{ fontSize: "12px" }} />
          {title}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <AiOutlineFullscreen onClick={showDetail} />
        </div>
      </span>
      {data.length === 0 ? (
        <NoDataScreen subMessage="current shift has no data" />
      ) : (
        <ReactECharts
          ref={echartsRef}
          option={options}
          style={{
            height: "220px",
            width: "100%",
          }}
          onEvents={{
            click: (params) => {
              if (onLineClick) {
                // Get the clicked series name (legend value)
                const seriesName = params.seriesName;
                const date = params.name;
                const value = params.value;

                console.log("Clicked Series (Legend):", seriesName);
                console.log("Date:", date);
                console.log("Value:", value);

                const values = {
                  [seriesName]: value,
                };

                onLineClick(date, values);
              }
            },
          }}
        />
      )}
      <Modal
        title={title}
        open={isModalOpen}
        centered
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="100%"
      >
        <ReactECharts
          opts={{ locale: "FR" }}
          option={options}
          style={{ height: "calc(100vh - 100px)", width: "100%" }}
          ref={echartsRef}
        />
      </Modal>

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
              justifyContent: "space-between",
            }}
          >
            <span>{title}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* <Button type="text" icon={<AiOutlineInfoCircle style={{fontSize:'20px'}} onClick={() => setOpen(prev => !prev)} />} /> */}
              <Button
                type="text"
                icon={
                  <AiOutlineClose
                    style={{ fontSize: "20px" }}
                    onClick={() => setIsFlip(false)}
                  />
                }
              />
            </div>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <ReactECharts
            opts={{ locale: "FR" }}
            option={options}
            style={{
              height: "calc(100vh - 100px)",
              width: open ? "70%" : "100%",
              transition: "width 0.3s ease-in-out",
            }}
            ref={echartsRef}
          />
          {open && (
            <div
              style={{
                width: "30%",
                padding: "20px",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "all 0.3s ease-in-out",
                overflow: "hidden",
              }}
            >
              <Title level={5}>Graph Details</Title>
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Description:</strong>
                </p>
                <p>{description}</p>
                <p>
                  <strong>Date Range:</strong> {xAxisData[0]} to{" "}
                  {xAxisData[xAxisData.length - 1]}
                </p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: "20px" }}>
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: color?.itemcolor[0],
                        marginRight: "10px",
                      }}
                    ></div>
                    <span>Good: ≥ {color?.threshold[1]}%</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: color?.itemcolor[1],
                        marginRight: "10px",
                      }}
                    ></div>
                    <span>
                      Warning: {color?.threshold[0]}-{color?.threshold[1] - 1}%
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: color?.itemcolor[2],
                        marginRight: "10px",
                      }}
                    ></div>
                    <span>Critical: ≤ {color?.threshold[0] - 1}%</span>
                  </div>
                </>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p>
                  <strong>Average:</strong>{" "}
                  {(
                    data.reduce(
                      (acc, item) => acc + (Number(item[seriesKeys[0]]) || 0),
                      0
                    ) / data.length
                  ).toFixed(2)}
                  %
                </p>
                <p>
                  <strong>Highest Value:</strong>{" "}
                  {Math.max(
                    ...data.map((item) => Number(item[seriesKeys[0]]) || 0)
                  ).toFixed(2)}
                  %
                </p>
                <p>
                  <strong>Lowest Value:</strong>{" "}
                  {Math.min(
                    ...data.map((item) => Number(item[seriesKeys[0]]) || 0)
                  ).toFixed(2)}
                  %
                </p>
                <p>
                  <strong>Data Points:</strong> {data.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default LineChart;
