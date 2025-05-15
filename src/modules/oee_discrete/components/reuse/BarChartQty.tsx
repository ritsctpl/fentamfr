import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Tooltip, Button } from "antd";

import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import {
  AiOutlineInfoCircle,
  AiOutlineFullscreen,
  AiOutlineClose,
} from "react-icons/ai";
import NoDataFound from "./NoDataFound";
const { Title } = Typography;

interface DataPoint {
  [key: string]: number | string;
}

interface BarChartProps {
  data: DataPoint[];
  title: string;
  color: any;
  theshold: any;
  unit?: string;
  description?: any;
}

const getSeriesColor = (tabkey: string, color, theshold) => {
  switch (tabkey) {
    case "availability":
      return color;
    case "quality":
      return color;
    case "downtime":
      return color;
    case "performance":
      return color;
    case "oee":
      return color;
  }
};

const getColor = (
  value: number,
  type: string,
  key: number,
  color,
  theshold
) => {
  switch (type) {
    case "availability":
      if (value < theshold?.[0]) return color?.[2]; // Red for < 60%
      if (value < theshold?.[1]) return color?.[1]; // Yellow for 60-84%
      return color?.[0]; // Green for >= 85%
    case "quality":
      if (value < theshold?.[0]) return color?.[2];

      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    case "downtime":
      if (value > theshold?.[0]) return color?.[2];

      if (value > theshold?.[1]) return color?.[1];
      return color?.[0];

    case "performance":
      if (value < theshold?.[0]) return color?.[2]; // Red for < 60%
      if (value < theshold?.[1]) return color?.[1]; // Yellow for 60-84%
      return color?.[0]; // Green for >= 85%

    case "oee":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    default:
      if (value < 50) return "#dc3545";
      if (value < 84) return "#ffc107";
      return "#28a745";
  }
};

const BarChartQty: React.FC<BarChartProps> = ({
  data,
  title,
  color,
  theshold,
  unit,
  description,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem("activeTabIndex");
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // const { color, colors } = useFilterContext()

  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const isDownTime = activeTabIndex?.includes("downtime") ? true : false;

  const [showDetailedStats, setShowDetailedStats] = useState(false);

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

  const categoryKey =
    data && data[0]
      ? Object.keys(data[0]).find((key) => typeof data[0][key] === "string")
      : undefined;
  const metricsKeys =
    data && data[0]
      ? Object.keys(data[0]).filter((key) => typeof data[0][key] === "number")
      : [];
  console.log("categoryKey,metricsKeys", categoryKey, metricsKeys);

  const xAxisData = Array.isArray(data)
    ? data.map((item) => item[categoryKey])
    : [];

  if (!data.length) {
    return (
      <Card
        ref={chartContainerRef}
        // style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
        title={title}
      >
        <NoDataFound />
      </Card>
    );
  }

  const series = metricsKeys.map((metricKey) => ({
    name: metricKey,
    type: "bar",
    barWidth: "45%",
    data: data.map((item, idx) => {
      const value = Number(item[metricKey]);
      let itemColor;
      itemColor = metricKey.includes("good") ? "#28a745" : "#dc3545"; // Green for goodQuality, Red for badQuality
      return {
        value,
        itemStyle: {
          color: itemColor,
        },
        label: {
          show: true,
          position: "insideBottom",
          distance: 10,
          rotate: 90,
          align: "left",
          verticalAlign: "middle",
          fontSize: 10,
          fontWeight: "bold",
          formatter: function (params) {
            const resourceName = data[params.dataIndex][categoryKey];
            const prefix = metricKey.includes("good") ? "GQ" : "BQ";
            return [
              `{resourceName|${resourceName}}`,
              `{quantity|${prefix}:${params.value}}`,
            ].join("\n");
          },
          rich: {
            resourceName: {
              color: "#000",
              fontSize: 10,
              padding: [0, 0, 4, 0],
            },
            quantity: {
              color: "#ffffff",
              backgroundColor: itemColor,
              padding: [2, 4, 2, 4],
              borderRadius: 3,
              shadowColor: "rgba(0, 0, 0, 0.3)",
              shadowBlur: 3,
            },
          },
        },
      };
    }),
    colorBy: "data", // Keep color by data
  }));

  const option = {
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: {
          show: true,
        },
      },
    },
    color: getSeriesColor(tabkey, color, theshold),
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        show: false, // Hide x-axis labels for a cleaner look
      },
    },
    yAxis: {
      type: "value",
    },
    series,
    dataZoom: [
      {
        show: isFlip,
        type: "slider",
        bottom: "5%",
        height: "3%",
        start: 0,
        end: (function () {
          const itemCount = data.length;
          if (itemCount <= 10) return 100;
          return isFlip ? (50 / itemCount) * 100 : (20 / itemCount) * 100;
        })(),
      },
    ],
    grid: {
      bottom: "10%",
      containLabel: true,
      left: "2%",
      right: "2%",
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        return params
          .map(
            ({ marker, seriesName, value }) =>
              `${marker} ${seriesName}: ${value}`
          )
          .join("<br />");
      },
    },
    legend: {
      data: metricsKeys.map((key) => ({
        name: key,
        itemStyle: {
          color: key.includes("good") ? "#28a745" : "#dc3545",
        },
      })),
      bottom: "bottom",
    },
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(true);
  };

  return (
    <Card
      ref={chartContainerRef}
      // style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ margin: 0, fontFamily: "roboto", fontSize: "16px" }}>
            {title}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <AiOutlineFullscreen onClick={showDetail} />
            {/* {!isModalOpen && (
                            <Tooltip placement='topRight' title='FullScreen'>
                                <FullscreenOutlined onClick={showModal} />
                            </Tooltip>
                        )} */}
          </div>
        </div>
      }
    >
      <ReactECharts
        ref={echartsRef}
        option={option}
        style={{ height: "calc(100vh - 305px)" }}
      />
      <Modal
        title={title}
        open={isModalOpen}
        centered
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="100%"
      >
        <ReactECharts
          option={option}
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
              <Button
                type="text"
                icon={<AiOutlineInfoCircle style={{ fontSize: "20px" }} />}
                onClick={() => setOpen((prev) => !prev)}
              />
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
            option={option}
            ref={echartsRef}
            style={{
              height: "calc(100vh - 100px)",
              width: open ? "70%" : "100%",
              transition: "width 0.3s ease-in-out",
            }}
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

              <Title level={5}>Quality Metrics</Title>
              <div style={{ marginBottom: "20px" }}>
                {metricsKeys.map(
                  (metricKey, index) =>
                    metricKey && (
                      <div
                        key={index}
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
                            backgroundColor: metricKey.includes("good")
                              ? "#28a745"
                              : "#dc3545", // Green for Good, Red for Bad
                            marginRight: "10px",
                          }}
                        ></div>
                        <span>
                          {metricKey.includes("good")
                            ? "Good Quantity"
                            : "Bad Quantity"}
                          {` (${data.reduce(
                            (sum, item) => sum + Number(item[metricKey]),
                            0
                          )} units)`}
                        </span>
                      </div>
                    )
                )}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginLeft: "30px",
                    marginBottom: "12px",
                  }}
                >
                  Note: Good Quantity represents products that meet quality
                  standards, while Bad Quantity represents defective or
                  non-conforming products.
                </div>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                {metricsKeys.map((metricKey, index) => {
                  const total = data.reduce(
                    (sum, item) => sum + (Number(item[metricKey]) || 0),
                    0
                  );
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        color: metricKey.includes("good")
                          ? "#28a745"
                          : "#dc3545",
                      }}
                    >
                      <strong>
                        {metricKey.includes("good")
                          ? "Good Quantity"
                          : "Bad Quantity"}
                        :
                      </strong>
                      <span style={{ marginLeft: "8px" }}>
                        {total.toLocaleString()} units
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Graph Usage:</strong>
                </p>
                <ul style={{ paddingLeft: "20px" }}>
                  <li>Click on legend items to show/hide specific metrics</li>
                  <li>Hover over bars to see detailed values</li>
                  <li>Use the save icon to download the chart</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default BarChartQty;
