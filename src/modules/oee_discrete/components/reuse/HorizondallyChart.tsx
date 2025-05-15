import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Tooltip, Button } from "antd";
import { FileSearchOutlined, FullscreenOutlined } from "@ant-design/icons";
import {
  AiOutlineClose,
  AiOutlineFileSearch,
  AiOutlineFullscreen,
} from "react-icons/ai";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { AiOutlineInfoCircle } from "react-icons/ai";
import NoDataFound from "./NoDataFound";
const { Title } = Typography;

interface DataPoint {
  [key: string]: number | string;
}

interface HorizondallyChartProps {
  data: DataPoint[];
  title: string;
  color?: any;
  theshold?: any;
  unit?: string;
  description?: any;
}

const getSeriesColor = (
  tabkey: string,
  color = ["#28a745", "#F1BA88", "#FF6363"],
  theshold = [60, 85]
) => {
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
    default:
      return color;
  }
};

const getColor = (
  value: number,
  type: string,
  key: number,
  color = ["#28a745", "#F1BA88", "#FF6363"],
  theshold = [60, 85]
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

const HorizondallyChart: React.FC<HorizondallyChartProps> = ({
  data,
  title,
  color = ["#28a745", "#F1BA88", "#FF6363"],
  theshold = [60, 85],
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
  const [barName, setBarName] = useState("");
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const isDownTime = activeTabIndex?.includes("downtime") ? true : false;

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
      ? Object.keys(data[0]).filter(
          (key) => key !== categoryKey && typeof data[0][key] === "number"
        )
      : [];

  const yAxisData = Array.isArray(data)
    ? data.map((item) => item[categoryKey])
    : [];

  // console.log('categoryKey,metricsKeys', categoryKey, metricsKeys, xAxisData,title)
  if (!data.length) {
    return (
      <Card ref={chartContainerRef} title={title}>
        <NoDataFound />
      </Card>
    );
  }

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
    yAxis: {
      type: "category",
      data: yAxisData,
      position: "left",
      axisLabel: {
        rotate: 0,
        interval: 0,
        formatter: function (value) {
          if (data.length > 5 && value.length > 10) {
            return value.substring(0, 10) + "...";
          }
          return value;
        },
        color: "#666",
        fontWeight: "normal",
        align: "right",
        padding: [0, 15, 0, 0],
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    xAxis: {
      type: "value",
      axisLabel: {
        color: "#666",
        formatter: function (value) {
          return isDownTime
            ? value + " min"
            : unit === "count"
            ? value
            : value + "%";
        },
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#ddd",
        },
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    grid: {
      left: "5%",
      right: "10%",
      top: "10%",
      bottom: "15%",
      containLabel: true,
    },
    series: metricsKeys.map((metricKey) => ({
      name: metricKey,
      type: "bar",
      barWidth: "50%",
      data: data.map((item) => {
        const value = Number(item[metricKey]);
        let itemColor;
        itemColor = getColor(
          value,
          tabkey,
          metricsKeys.length,
          color,
          theshold
        );
        if (metricsKeys.length == 1) {
          return {
            value,
            itemStyle: {
              color: itemColor,
              borderRadius: [0, 4, 4, 0],
            },
            label: {
              show: true,
              position: "right",
              formatter: isDownTime
                ? "{c} min"
                : unit === "count"
                ? "{c}"
                : "{c}%",
              color: "#666",
              fontSize: 12,
              fontWeight: "bold",
              distance: 5,
            },
          };
        } else {
          return {
            value,
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
            },
            label: {
              show: true,
              position: "right",
              formatter: isDownTime
                ? "{c} min"
                : unit === "count"
                ? "{c}"
                : "{c}%",
              color: "#666",
              fontSize: 12,
              fontWeight: "bold",
              distance: 5,
            },
          };
        }
      }),
      colorBy: metricsKeys.length > 2 ? "series" : "data",
    })),
    dataZoom: [
      {
        show: true,
        type: "slider",
        top: "auto",
        left: "10%",
        width: "80%",
        height: "30px",
        bottom: "0%",
        yAxisIndex: 0,
        start: 0,
        end: Math.min(100, (8 / data.length) * 100),
        handleSize: 8,
        showDetail: false,
        showDataShadow: false,
        backgroundColor: "#f5f5f5",
        fillerColor: "rgba(220,220,220,0.5)",
        borderColor: "#ddd",
        orient: "horizontal",
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        shadowStyle: {
          color: "rgba(0,0,0,0.05)",
        },
      },
      backgroundColor: "rgba(255,255,255,0.9)",
      borderColor: "#ccc",
      borderWidth: 1,
      textStyle: {
        color: "#333",
      },
      formatter: function (params) {
        const param = params[0];
        return `<div style="font-weight:bold">${param.name}</div>
                <div>${param.seriesName}: ${param.value}${
          isDownTime ? " min" : unit === "count" ? "" : "%"
        }</div>`;
      },
    },
    legend:
      metricsKeys.length > 2
        ? {
            data: metricsKeys,
            top: "0%",
            textStyle: {
              color: "#666",
            },
            itemWidth: 15,
            itemHeight: 10,
            itemGap: 20,
          }
        : undefined,
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(true);
  };
  // Add the click event handler to the chart
  // const handleChartClick = (params) => {
  //     if (params && params.data) {
  //         console.log('Clicked bar data:', params);
  //         setBarName(params.name)
  //     }
  // };
  // console.log(barName,"barName");
  return (
    <Card
      ref={chartContainerRef}
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              margin: 0,
              fontFamily: "roboto",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {title}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <AiOutlineFullscreen
              onClick={showDetail}
              style={{ cursor: "pointer", fontSize: "18px" }}
            />
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
                  <strong>Range:</strong> {yAxisData[0]} to{" "}
                  {yAxisData[yAxisData.length - 1]}
                </p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: "20px" }}>
                {metricsKeys.length > 1 ? (
                  <>
                    {metricsKeys.map((metricKey, index) => (
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
                            backgroundColor: color?.[index],
                            marginRight: "10px",
                          }}
                        ></div>
                        <span>{metricKey}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {tabkey === "availability" && (
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
                                backgroundColor: color?.[0],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Good: ≥ {theshold?.[1]}%</span>
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
                                backgroundColor: color?.[1],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>
                              Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                backgroundColor: color?.[2],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                          </div>
                        </>
                      </div>
                    )}
                    {tabkey === "quality" && (
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
                                backgroundColor: color?.[0],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Good: ≥ {theshold?.[1]}%</span>
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
                                backgroundColor: color?.[1],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>
                              Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                backgroundColor: color?.[2],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                          </div>
                        </>
                      </div>
                    )}
                    {tabkey === "downtime" && (
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
                                backgroundColor: color?.[0],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Good: ≤ {theshold?.[1]}%</span>
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
                                backgroundColor: color?.[1],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>
                              Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                backgroundColor: color?.[2],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Critical: &gt; {theshold?.[0]}%</span>
                          </div>
                        </>
                      </div>
                    )}
                    {tabkey === "performance" && (
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
                                backgroundColor: color?.[0],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Good: ≥ {theshold?.[1]}%</span>
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
                                backgroundColor: color?.[1],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>
                              Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                backgroundColor: color?.[2],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Critical: &gt; {theshold?.[0]}%</span>
                          </div>
                        </>
                      </div>
                    )}
                    {tabkey === "oee" && (
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
                                backgroundColor: color?.[0],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Good: ≥ {theshold?.[1]}%</span>
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
                                backgroundColor: color?.[1],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>
                              Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                backgroundColor: color?.[2],
                                marginRight: "10px",
                              }}
                            ></div>
                            <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                          </div>
                        </>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p>
                  <strong>Average:</strong>{" "}
                  {(
                    data.reduce(
                      (acc, item) => acc + (Number(item[metricsKeys[0]]) || 0),
                      0
                    ) / data.length
                  ).toFixed(2)}
                  %
                </p>
                <p>
                  <strong>Highest Value:</strong>{" "}
                  {Math.max(
                    ...data.map((item) => Number(item[metricsKeys[0]]) || 0)
                  ).toFixed(2)}
                  %
                </p>
                <p>
                  <strong>Lowest Value:</strong>{" "}
                  {Math.min(
                    ...data.map((item) => Number(item[metricsKeys[0]]) || 0)
                  ).toFixed(2)}
                  %
                </p>
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
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default HorizondallyChart;
