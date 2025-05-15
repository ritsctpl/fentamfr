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

interface BarChartProps {
  data: DataPoint[];
  title: string;
  color: any;
  theshold: any;
  unit?: string;
  description?: any;
  showXAxisLabel?: boolean;
  group?: boolean;
}

const getSeriesColor = (tabkey: string, theshold: any) => {
  const defaultColors = ["#FF6363", "#F1BA88", "#FF6363"];
  switch (tabkey) {
    case "availability":
      return defaultColors;
    case "quality":
      return defaultColors;
    case "downtime":
      return defaultColors;
    case "performance":
      return defaultColors;
    case "oee":
      return defaultColors;
  }
};

const getColor = (value: number, type: string, key: number, theshold: any) => {
  const defaultColors = ["#FF6363", "#F1BA88", "#FF6363"];
  switch (type) {
    case "availability":
      if (value < theshold?.[0]) return defaultColors[2]; // Red for low
      if (value < theshold?.[1]) return defaultColors[1]; // Orange for medium
      return defaultColors[0]; // Red for high
    case "quality":
      if (value < theshold?.[0]) return defaultColors[2];
      if (value < theshold?.[1]) return defaultColors[1];
      return defaultColors[0];
    case "downtime":
      if (value > theshold?.[0]) return defaultColors[2];
      if (value > theshold?.[1]) return defaultColors[1];
      return defaultColors[0];
    case "performance":
      if (value < theshold?.[0]) return defaultColors[2];
      if (value < theshold?.[1]) return defaultColors[1];
      return defaultColors[0];
    case "oee":
      if (value < theshold?.[0]) return defaultColors[2];
      if (value < theshold?.[1]) return defaultColors[1];
      return defaultColors[0];
    default:
      if (value < 50) return "#FF6363";
      if (value < 84) return "#F1BA88";
      return "#FF6363";
  }
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  theshold,
  unit,
  description,
  showXAxisLabel = false,
  group = false,
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

  const xAxisData = Array.isArray(data)
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

  const series = metricsKeys.map((metricKey) => ({
    name: metricKey,
    type: "bar",
    data: data.map((item) => {
      const value = Number(item[metricKey]);
      let itemColor;
      itemColor = getColor(value, tabkey, metricsKeys.length, theshold);
      if (metricsKeys.length == 1) {
        return {
          value,
          itemStyle: {
            color: itemColor,
          },
          label: {
            show: true,
            position: showXAxisLabel ? "top" : "insideBottom",
            distance: showXAxisLabel ? 10 : 15,
            formatter: function (params) {
              if (showXAxisLabel) {
                return `${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              } else {
                // return [
                //   `{name|${params.name}}`,
                //   `{value|${params.value}${
                //     isDownTime ? " min" : unit === "count" ? "" : "%"
                //   }}`,
                // ].join("\n");
                return `{name|${params.name}}  ${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              }
            },
            rich: !showXAxisLabel
              ? {
                  name: {
                    color: "#000",
                    fontSize: 10,
                    padding: [0, 0, 4, 0],
                    align: "left",
                  },
                  value: {
                    color: "#000",
                    fontSize: 10,
                    padding: [4, 0, 0, 0],
                    align: "left",
                  },
                }
              : undefined,
            fontSize: 12,
            color: "#000",
            rotate: showXAxisLabel ? 0 : 90,
            align: "left",
            verticalAlign: "middle",
          },
        };
      } else {
        return {
          value,
          label: {
            show: true,
            position: showXAxisLabel ? "top" : "insideBottom",
            distance: showXAxisLabel ? 10 : 15,
            formatter: function (params) {
              if (showXAxisLabel) {
                return `${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              } else {
                // return [
                //   `{name|${params.name}}`,
                //   `{value|${params.value}${
                //     isDownTime ? " min" : unit === "count" ? "" : "%"
                //   }}`,
                // ].join("\n");
                return `{name|${params.name}}  ${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              }
            },
            rich: !showXAxisLabel
              ? {
                  name: {
                    color: "#000",
                    fontSize: 10,
                    padding: [0, 0, 4, 0],
                    align: "left",
                  },
                  value: {
                    color: "#000",
                    fontSize: 10,
                    padding: [4, 0, 0, 0],
                    align: "left",
                  },
                }
              : undefined,
            fontSize: 12,
            color: "#000",
            rotate: showXAxisLabel ? 0 : 90,
            align: "left",
            verticalAlign: "middle",
          },
        };
      }
    }),
    colorBy: metricsKeys.length > 2 ? "series" : "data",
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
    color: ["#A0C878", "#F1BA88", "#FF6363"],
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        show: showXAxisLabel,
        rotate: 0,
        interval: 0,
        formatter: function (value) {
          if (data.length > 5 && value.length > 10) {
            return value.substring(0, 10) + "...";
          }
          return value;
        },
      },
    },
    yAxis: {
      type: "value",
    },
    series,
    dataZoom: [
      {
        show: true,
        type: "slider",
        bottom: "bottom",
        height: "6%",
        start: 0,
        end: group ? (9 / data.length) * 100 : (25 / data.length) * 100,
      },
    ],

    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend:
      metricsKeys.length > 2
        ? {
            data: metricsKeys,
            top: "0%",
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
                  <strong>Range:</strong> {xAxisData[0]} to{" "}
                  {xAxisData[xAxisData.length - 1]}
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
                            backgroundColor: getSeriesColor(tabkey, theshold)[
                              index
                            ],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[0],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[1],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[2],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[0],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[1],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[2],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[0],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[1],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[2],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[0],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[1],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[2],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[0],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[1],
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
                                backgroundColor: getSeriesColor(
                                  tabkey,
                                  theshold
                                )[2],
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

export default BarChart;
