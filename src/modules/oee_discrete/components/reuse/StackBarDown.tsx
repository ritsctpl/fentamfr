import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography, Button, Modal } from "antd";
import {
  AiOutlineInfoCircle,
  AiOutlineFullscreen,
  AiOutlineClose,
} from "react-icons/ai";
import NoDataFound from "./NoDataFound";
const { Title } = Typography;

interface DataPoint {
  [key: string]: any;
}

interface StackedBarChartProps {
  data: DataPoint[];
  title: string;
  color: any;
  description?: any;
  theshold?: any;
  type?: any;
  showXAxisLabel?: boolean;
  onBarClick?: (xValue: string, yValue: number) => void;
}

const getSeriesColor = (tabkey: string, color) => {
  const colorMeanings = {
    availability: {
      colors: color,
      meanings: ["Running Time", "Idle Time", "Down Time"],
    },
    quality: {
      colors: color,
      meanings: ["Good Quality", "Marginal Quality", "Poor Quality"],
    },
    downtime: {
      colors: color,
      meanings: ["Planned", "Unplanned", "Breakdown"],
    },
    performance: {
      colors: color,
      meanings: ["High Performance", "Medium Performance", "Low Performance"],
    },
    oee: {
      colors: color,
      meanings: ["Optimal OEE", "Average OEE", "Low OEE"],
    },
  };
  return colorMeanings[tabkey]?.colors || [];
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  title,
  color,
  description,
  theshold,
  type,
  showXAxisLabel = false,
  onBarClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const [barName, setBarName] = useState(null);

  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef(null); // To store chart instance
  const tabkey = sessionStorage.getItem("activeTabIndex");
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const isDownTime = activeTabIndex?.includes("downtime") ? true : false;

  // Get unique resource IDs
  const uniqueResourceIds = useMemo(() => {
    if (data?.length > 0) {
      return Array.from(new Set(data?.map((item) => item.resourceId)));
    }
    return [];
  }, [data]);

  // Group data by resourceId
  const groupedData = useMemo(() => {
    const grouped = {};
    uniqueResourceIds?.forEach((resourceId) => {
      grouped[resourceId] = data.filter(
        (item) => item.resourceId === resourceId
      );
    });
    return grouped;
  }, [data, uniqueResourceIds]);

  // Create series data
  const series = useMemo(() => {
    // Create three separate series for production time, downtime, and break time
    return [
      {
        name: "Production Time",
        type: "bar",
        stack: "total",
        emphasis: {
          disabled: true,
        },
        itemStyle: {
          color: "#91cc75",
          emphasis: {
            disabled: true,
          },
        },
        data: uniqueResourceIds.map((resourceId) => {
          const resourceData = data.find(
            (item) => item.resourceId === resourceId
          );
          return {
            value: resourceData?.productionTime || 0,
            resourceData,
            label: {
              show: true,
              position: showXAxisLabel ? "top" : "insideBottom",
              distance: showXAxisLabel ? 10 : 15,
              formatter: function (params) {
                if (params.value === 0) return "";
                const totalSeconds = params.value;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);

                // Show resource name only for the first (bottom) bar
                const totalValue = params.data.resourceData.productionTime +
                  params.data.resourceData.downtime +
                  params.data.resourceData.breakTime;
                const isFirstBar = params.data.resourceData.productionTime === params.value;

                if (showXAxisLabel) {
                  return `${hours}h ${minutes}m`;
                } else {
                  return isFirstBar ? `{name|${params.name}}\n${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
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
                }
                : undefined,
              fontSize: 12,
              color: "#000",
              rotate: showXAxisLabel ? 0 : 90,
              align: "left",
              verticalAlign: "middle",
            },
          };
        }),
      },
      {
        name: "Downtime",
        type: "bar",
        stack: "total",
        emphasis: {
          disabled: true,
        },
        itemStyle: {
          color: "#ee6666",
          emphasis: {
            disabled: true,
          },
        },
        data: uniqueResourceIds.map((resourceId) => {
          const resourceData = data.find(
            (item) => item.resourceId === resourceId
          );
          return {
            value: resourceData?.downtime || 0,
            resourceData,
            label: {
              show: true,
              position: showXAxisLabel ? "top" : "insideBottom",
              distance: showXAxisLabel ? 10 : 15,
              formatter: function (params) {
                if (params.value === 0) return "";
                const totalSeconds = params.value;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);

                if (showXAxisLabel) {
                  return `${hours}h ${minutes}m`;
                } else {
                  return `${hours}h ${minutes}m`;
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
                }
                : undefined,
              fontSize: 12,
              color: "#000",
              rotate: showXAxisLabel ? 0 : 90,
              align: "left",
              verticalAlign: "middle",
            },
          };
        }),
      },
      {
        name: "Break Time",
        type: "bar",
        stack: "total",
        emphasis: {
          disabled: true,
        },
        itemStyle: {
          color: "#fac858",
          emphasis: {
            disabled: true,
          },
        },
        data: uniqueResourceIds.map((resourceId) => {
          const resourceData = data.find(
            (item) => item.resourceId === resourceId
          );
          return {
            value: resourceData?.breakTime || 0,
            resourceData,
            label: {
              show: true,
              position: showXAxisLabel ? "top" : "insideBottom",
              distance: showXAxisLabel ? 10 : 15,
              formatter: function (params) {
                if (params.value === 0) return "";
                const totalSeconds = params.value;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);

                if (showXAxisLabel) {
                  return `${hours}h ${minutes}m`;
                } else {
                  return `${hours}h ${minutes}m`;
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
                }
                : undefined,
              fontSize: 12,
              color: "#000",
              rotate: showXAxisLabel ? 0 : 90,
              align: "left",
              verticalAlign: "middle",
            },
          };
        }),
      },
    ];
  }, [data, uniqueResourceIds, showXAxisLabel]);

  // Update the option object with the new series data
  const option = useMemo(
    () => ({
      toolbox: {
        show: true,
        right: "10%",
        feature: {
          saveAsImage: { show: true },
        },
      },
      color: ["#91cc75", "#ee6666", "#fac858"], // Green, Red, Yellow
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          const resourceId = params[0].axisValue;
          let result = `<b>${resourceId}</b><br/>`;

          // Find the resource data
          const resourceData = data.find(
            (item) => item.resourceId === resourceId
          );

          if (resourceData) {
            // Production Time
            if (resourceData.productionTime) {
              const prodHours = Math.floor(resourceData.productionTime / 3600);
              const prodMinutes = Math.floor(
                (resourceData.productionTime % 3600) / 60
              );
              const prodSeconds = Math.floor(resourceData.productionTime % 60);
              const formattedProdTime = `${prodHours}h ${prodMinutes}m ${prodSeconds}s`;
              result += `<span style="display:inline-block; width:10px; height:10px; background-color:#91cc75; margin-right:5px;"></span>Production Time: ${formattedProdTime}<br/>`;
            }

            // Downtime
            if (resourceData.downtime) {
              const downHours = Math.floor(resourceData.downtime / 3600);
              const downMinutes = Math.floor(
                (resourceData.downtime % 3600) / 60
              );
              const downSeconds = Math.floor(resourceData.downtime % 60);
              const formattedDownTime = `${downHours}h ${downMinutes}m ${downSeconds}s`;
              result += `<span style="display:inline-block; width:10px; height:10px; background-color:#ee6666; margin-right:5px;"></span>Downtime: ${formattedDownTime}<br/>`;
            }

            // Break Time
            if (resourceData.breakTime) {
              const breakHours = Math.floor(resourceData.breakTime / 3600);
              const breakMinutes = Math.floor(
                (resourceData.breakTime % 3600) / 60
              );
              const breakSeconds = Math.floor(resourceData.breakTime % 60);
              const formattedBreakTime = `${breakHours}h ${breakMinutes}m ${breakSeconds}s`;
              result += `<span style="display:inline-block; width:10px; height:10px; background-color:#fac858; margin-right:5px;"></span>Break Time: ${formattedBreakTime}<br/>`;
            }

            // Total Time
            const totalTime =
              (resourceData.productionTime || 0) +
              (resourceData.downtime || 0) +
              (resourceData.breakTime || 0);
            const totalHours = Math.floor(totalTime / 3600);
            const totalMinutes = Math.floor((totalTime % 3600) / 60);
            const totalSeconds = Math.floor(totalTime % 60);
            const formattedTotalTime = `${totalHours}h ${totalMinutes}m ${totalSeconds}s`;
            result += `<br/><b>Total Time: ${formattedTotalTime}</b>`;
          }

          return result;
        },
      },
      legend: {
        show: true,
        data: ["Production Time", "Downtime", "Break Time"],
      },
      xAxis: {
        type: "category",
        data: uniqueResourceIds,
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
        axisLabel: {
          formatter: (value) => {
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            const seconds = value % 60;
            return `${hours}h ${minutes}m ${seconds}s`;
          },
        },
      },
      series,
      dataZoom: [
        {
          show: true,
          type: "slider",
          bottom: "bottom",
          height: "6%",
          start: 0,
          end: (15 / data.length) * 100,
        },
      ],
      grid: {
        left: "3%",
        right: "4%",
        bottom: "12%",
        top: "8%", // Increased to make room for legend
        containLabel: true,
      },
      stackLabel: {
        show: true,
      },
    }),
    [uniqueResourceIds, series, isFlip, data, showXAxisLabel]
  );

  // Initialize chart and register click event only once
  useEffect(() => {
    const instance = echartsRef.current?.getEchartsInstance();
    if (instance) {
      chartInstanceRef.current = instance;

      // Clear previous event listeners to prevent duplicates
      instance.off("click");

      // Register click event only once
      instance.on("click", (params) => {
        if (params && onBarClick) {
          // Convert params.value to number to fix type error
          const value =
            typeof params.value === "number"
              ? params.value
              : Number(params.value);
          onBarClick(params.name, value);
        }
      });
    }
    return () => {
      // Clean up event listeners when component unmounts
      if (chartInstanceRef.current) {
        chartInstanceRef.current.off("click");
      }
    };
  }, [onBarClick]);

  // Only update chart data without recreating
  useEffect(() => {
    const instance = chartInstanceRef.current;
    if (instance) {
      instance.setOption(option, {
        notMerge: false, // Important: merge the options instead of replacing
        lazyUpdate: true, // Use lazy update for better performance
        silent: true, // Don't trigger events during the update
      });
    }
  }, [option]);

  // Handle resize only when modal state changes
  useEffect(() => {
    const handleResize = () => {
      if (echartsRef.current) {
        const chart = echartsRef.current.getEchartsInstance();
        if (chart) {
          setTimeout(() => chart.resize(), 0);
        }
      }
    };

    handleResize();

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
  }, [isFlip, data]);

  // Set up resize observer

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{
        maxHeight: "calc(100vh - 180px)",
        overflowY: "auto",
      }}
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
          </div>
        </div>
      }
    >
      {data.length === 0 ? (
        <NoDataFound />
      ) : (
        <>
          <ReactECharts
            option={option}
            style={{
              height: "calc(100vh - 305px)",
              minHeight: "400px",
            }}
            ref={echartsRef}
            notMerge={false} // Don't replace the chart completely
            lazyUpdate={true} // Update in a more efficient way
            opts={{
              renderer: "canvas",
              devicePixelRatio: window.devicePixelRatio,
              width: "auto",
              height: "auto",
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
                  float: "left",
                }}
                notMerge={false}
                lazyUpdate={true}
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
                    float: "right",
                  }}
                >
                  <Title level={5}>Graph Details</Title>
                  <div style={{ marginBottom: "20px" }}>
                    <p>
                      <strong>Description:</strong>
                    </p>
                    <p>{description}</p>
                  </div>

                  <Title level={5}>Performance Thresholds</Title>
                  <div style={{ marginBottom: "20px" }}>
                    {tabkey && (
                      <>
                        {series
                          .filter((s) => !s.name.includes("Remaining"))
                          .map((serie, index) => (
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
                                  backgroundColor: getSeriesColor(
                                    tabkey,
                                    color
                                  )?.[index],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>{serie.name}</span>
                            </div>
                          ))}
                        {tabkey === "oee" && (
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
                                  backgroundColor: "#dcd9d9",
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Remaining</span>
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginLeft: "30px",
                                marginBottom: "12px",
                              }}
                            >
                              Note: The "Remaining" portion represents the gap
                              between the current value of 100%. For example, if
                              OEE is 65%, the remaining portion is 35%.
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <Title level={5}>Graph Analysis</Title>
                  <div style={{ marginBottom: "20px" }}>
                    <p>
                      <strong>Total Categories:</strong> {series?.length}
                    </p>
                  </div>
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
              )}
            </div>
          </Modal>
        </>
      )}
    </Card>
  );
};

export default StackedBarChart;
