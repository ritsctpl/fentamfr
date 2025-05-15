import React, { useEffect, useRef, useState, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFullscreen,
  AiOutlineInfoCircle,
} from "react-icons/ai";
// import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
// import NoDataFound from "@modules/pcoPlugin/components/NoDataFound";
import { letterSpacing } from "html2canvas/dist/types/css/property-descriptors/letter-spacing";
import NoDataScreen from "../components/NoData";
// import NoDataFound from "./NoDataFound";
const { Title } = Typography;

interface DataPoint {
  [key: string]: number | string;
}

interface BarChartProps {
  data: DataPoint[];
  title: string;
  color: any;
  theshold: any;
  close?: boolean;
  unit?: string;
  description?: any;
  type?: any;
  onBarClick?: (xValue: string, yValue: number, seriesName?: string) => void;
  timebyperiod?: boolean;
}

// Move these helper functions outside component to prevent recreation
const getSeriesColor = (tabkey: any, color: any, theshold: any) => {
  return color; // Just return the color array directly
};

const getColor = (value, type, key, color, theshold) => {
  switch (type) {
    case "availability":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    case "quality":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    case "downtime":
      if (value > theshold?.[0]) return color?.[2];
      if (value > theshold?.[1]) return color?.[1];
      return color?.[0];
    case "performance":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
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

// Create a stable chart options generator outside component
const createChartOptions = (
  data,
  tabkey,
  color,
  theshold,
  unit,
  isDownTime,
  timebyperiod,
  isFlip
) => {
  if (!data || data.length === 0) return null;

  const categoryKey = Object.keys(data[0]).find(
    (key) => typeof data[0][key] === "string"
  );
  const metricsKeys = Object.keys(data[0]).filter(
    (key) => key !== categoryKey && typeof data[0][key] === "number"
  );

  if (!categoryKey || metricsKeys.length === 0) return null;

  const xAxisData = data.map((item) => item[categoryKey]);

  const series = metricsKeys.map((metricKey, seriesIndex) => ({
    name: metricKey,
    type: "bar",
    barGap: "10%",
    barCategoryGap: "10%",
    itemStyle: {
      color: color[seriesIndex], // Set color at series level
    },
    data: data.map((item, dataIndex) => {
      const value = Number(item[metricKey]).toFixed(2);

      return {
        value,
        cursor: "pointer",
        label: {
          show: true,
          position: "top",
          formatter: isDownTime ? "{c} Sec" : unit === "count" ? "{c}" : "{c}%",
          fontSize: 11,
          distance: 5,
        },
        metadata: {
          seriesName: metricKey,
          categoryName: item[categoryKey],
          originalValue: item[metricKey],
        },
      };
    }),
  }));

  return {
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: {
          show: true,
        },
      },
    },
    grid: {
      left: "3%",
      right: "3%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        interval: 0,
        rotate: 0,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: "value",
    },
    series,
    dataZoom: [
      {
        show: timebyperiod ? true : isFlip,
        type: "slider",
        bottom: "bottom",
        height: "6%",
        start: 0,
        end: timebyperiod
          ? (isFlip ? 31 : 25 / data.length) * 100
          : (5 / data.length) * 100,
      },
    ],
    tooltip: {
      trigger: "item", // Change to 'item' for individual bar hover
      axisPointer: { type: "shadow" },
      confine: true,
      formatter: function (params) {
        // Detailed formatting for individual bar
        return `
          <b>${params.name}</b><br/>
          <b>${params.seriesName}:</b> ${params.value}${
          unit === "count" ? "" : "%"
        }
        `;
      },
      position: function (point, params, dom, rect, size) {
        const [x, y] = point;
        const obj = { top: y };

        if (x > size.viewSize[0] / 2) {
          obj["left"] = x - dom.offsetWidth;
        } else {
          obj["left"] = x;
        }

        return obj;
      },
    },
    legend:
      metricsKeys.length > 2
        ? {
            data: metricsKeys,
            bottom: "bottom",
          }
        : undefined,
    xAxisData,
    metricsKeys,
  };
};

const BarChartSingleClick = memo(
  ({
    data,
    title,
    color,
    close,
    theshold,
    unit,
    description,
    type,
    onBarClick,
    timebyperiod,
  }: BarChartProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem("activeTabIndex");
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [barName, setBarName] = useState(null);
    const activeTabIndex = sessionStorage.getItem("activeTabIndex");
    // const { setDowntimeOeeData } = useFilterContext();
    const isDownTime = activeTabIndex?.includes("downtime") ? true : false;

    // Store data reference for comparison
    const dataRef = useRef(data);
    // Store option in ref to prevent recomputation
    const optionRef = useRef(null);

    // Only recalculate options if data actually changes or if isFlip state changes
    if (
      !optionRef.current ||
      JSON.stringify(dataRef.current) !== JSON.stringify(data) ||
      optionRef.current.isFlip !== isFlip
    ) {
      dataRef.current = data;
      optionRef.current = createChartOptions(
        data,
        tabkey,
        color,
        theshold,
        unit,
        isDownTime,
        timebyperiod,
        isFlip
      );
      if (optionRef.current) {
        optionRef.current.isFlip = isFlip; // Store current isFlip state
      }
    }

    // Handle resize events efficiently
    useEffect(() => {
      const handleResize = () => {
        if (echartsRef.current) {
          const chart = echartsRef.current.getEchartsInstance();
          if (chart) {
            setTimeout(() => chart.resize(), 0);
          }
        }
      };

      if (isModalOpen || isFlip) {
        handleResize();
      }

      const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(handleResize);
      });

      if (chartContainerRef.current) {
        resizeObserver.observe(chartContainerRef.current);
      }

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartContainerRef.current) {
          resizeObserver.unobserve(chartContainerRef.current);
        }
      };
    }, [isModalOpen, isFlip]);

    // Updated click handler to support single value clicks
    const clickHandlerRef = useRef((params) => {
      // Enhanced click handling with metadata
      const xValue = params.name;
      const seriesName = params.seriesName;
      const value = params.value;

      // Use metadata if available
      const metadata = params.data?.metadata || {};

      console.log(
        `Clicked Bar - ${seriesName}: ${value}${unit === "count" ? "" : "%"}`,
        metadata
      );

      if (onBarClick) {
        onBarClick(
          metadata.categoryName || xValue,
          parseFloat(value),
          seriesName
        );
      }
    });

    // Update the events object to use the stable click handler
    const events = {
      click: (params) => {
        if (params.componentType === "series") {
          clickHandlerRef.current(params);
        }
      },
      mouseover: (params) => {
        if (params.componentType === "series") {
          // Optional: Add hover effect
          const chart = echartsRef.current?.getEchartsInstance();
          if (chart) {
            chart.dispatchAction({
              type: "highlight",
              seriesIndex: params.seriesIndex,
              dataIndex: params.dataIndex,
            });
          }
        }
      },
      mouseout: (params) => {
        if (params.componentType === "series") {
          // Optional: Remove hover effect
          const chart = echartsRef.current?.getEchartsInstance();
          if (chart) {
            chart.dispatchAction({
              type: "downplay",
              seriesIndex: params.seriesIndex,
              dataIndex: params.dataIndex,
            });
          }
        }
      },
    };

    // Modify the chart options to ensure clickable bars
    const modifyChartOptionsForClicks = (options) => {
      if (options && options.series) {
        options.series = options.series.map((series) => ({
          ...series,
          data: series.data.map((dataItem) => ({
            ...dataItem,
            itemStyle: {
              ...dataItem.itemStyle,
              cursor: "pointer",
            },
          })),
        }));
      }
      return options;
    };

    // Modify the option ref to ensure clickable bars
    if (optionRef.current) {
      optionRef.current = modifyChartOptionsForClicks(optionRef.current);
    }

    const showDetail = () => {
      setIsFlip(true);
    };

    const handleClose = () => {
      setIsFlip(false);
    };

    // If we don't have valid options or data, show no data found
    if (!optionRef.current || data.length === 0) {
      return (
        <Card ref={chartContainerRef} title={title}>
          <NoDataScreen />
        </Card>
      );
    }

    return (
      <Card
        ref={chartContainerRef}
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
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <AiOutlineFullscreen
                onClick={showDetail}
                style={{ fontSize: "20px" }}
              />
              {close && (
                <Button
                  type="text"
                  style={{ padding: 0, display: "flex", alignItems: "center" }}
                  icon={<AiOutlineClose style={{ fontSize: "20px" }} />}
                  onClick={handleClose}
                />
              )}
            </div>
          </div>
        }
      >
        <ReactECharts
          ref={echartsRef}
          option={optionRef.current}
          style={{ height: "calc(100vh - 305px)" }}
          onEvents={events}
          notMerge={true}
          lazyUpdate={true}
          shouldSetOption={(prevProps, currentProps) => {
            return (
              JSON.stringify(prevProps.option) !==
              JSON.stringify(currentProps.option)
            );
          }}
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
            option={optionRef.current}
            style={{ height: "calc(100vh - 100px)", width: "100%" }}
            ref={echartsRef}
            notMerge={true}
            lazyUpdate={true}
            onEvents={events}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Button
                  type="text"
                  icon={<AiOutlineInfoCircle style={{ fontSize: "20px" }} />}
                  onClick={() => setOpen((prev) => !prev)}
                />
                <Button
                  type="text"
                  icon={<AiOutlineClose style={{ fontSize: "20px" }} />}
                  onClick={() => setIsFlip(false)}
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
              option={optionRef.current}
              ref={echartsRef}
              style={{
                height: "calc(100vh - 100px)",
                width: open ? "70%" : "100%",
                transition: "width 0.3s ease-in-out",
              }}
              notMerge={true}
              lazyUpdate={true}
              onEvents={events}
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
                    <strong>Range:</strong> {optionRef.current.xAxisData[0]} to{" "}
                    {
                      optionRef.current.xAxisData[
                        optionRef.current.xAxisData.length - 1
                      ]
                    }
                  </p>
                </div>

                <Title level={5}>Performance Thresholds</Title>
                <div style={{ marginBottom: "20px" }}>
                  {optionRef.current.metricsKeys.length > 1 ? (
                    <>
                      {optionRef.current.metricsKeys.map((metricKey, index) => (
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
                        (acc, item) =>
                          acc +
                          (Number(item[optionRef.current.metricsKeys[0]]) || 0),
                        0
                      ) / data.length
                    ).toFixed(2)}
                    %
                  </p>
                  <p>
                    <strong>Highest Value:</strong>{" "}
                    {Math.max(
                      ...data.map(
                        (item) =>
                          Number(item[optionRef.current.metricsKeys[0]]) || 0
                      )
                    ).toFixed(2)}
                    %
                  </p>
                  <p>
                    <strong>Lowest Value:</strong>{" "}
                    {Math.min(
                      ...data.map(
                        (item) =>
                          Number(item[optionRef.current.metricsKeys[0]]) || 0
                      )
                    ).toFixed(2)}
                    %
                  </p>
                  <div style={{ marginTop: "15px" }}>
                    <p>
                      <strong>Graph Usage:</strong>
                    </p>
                    <ul style={{ paddingLeft: "20px" }}>
                      <li>
                        Click on legend items to show/hide specific metrics
                      </li>
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
  }
);

// Add display name
BarChartSingleClick.displayName = "BarChartPopup";

export default BarChartSingleClick;
