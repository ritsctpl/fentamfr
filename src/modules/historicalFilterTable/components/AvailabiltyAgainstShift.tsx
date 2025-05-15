import React, { useEffect, useRef, useState, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFullscreen,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { useFilterContext } from "../hooks/HistoricalReportContext";
import { parseCookies } from "nookies";
import { getApiRegistry } from "@services/oeeServices";
import NoDataFound from "@modules/oee_discrete/components/reuse/NoDataFound";
import { BsBarChart } from "react-icons/bs";
import NoDataScreen from "./NoData";

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
  onBarClick?: (xValue: string, yValue: number) => void;
  timebyperiod?: boolean;
  showXAxisLabel?: boolean;
  date?: any;
  workcenter?: any;
  eventType?: any;
}



// Create a stable chart options generator outside component
const createChartOptions = (
  data,
  unit,
  isDownTime,
  timebyperiod,
  isFlip,
  showXAxisLabel
) => {
  if (!data || data.length === 0) return null;
  if (!data[0] || typeof data[0] !== "object") return null;

  // Get shift names for x-axis
  const xAxisData = data.map(item => item.shift);

  // Define series for stacked bars
  const series = [
    {
      name: 'Available Time',
      type: 'bar',
      stack: 'total',
      data: data.map(item => ({
        value: item.availableTime,
        itemStyle: {
          color: '#28a745' // green for available time
        }
      }))
    },
    {
      name: 'Down Time',
      type: 'bar',
      stack: 'total',
      data: data.map(item => ({
        value: item.downTime,
        itemStyle: {
          color: '#dc3545' // red for down time
        }
      }))
    }
  ];

  return {
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: {
          show: true,
        },
      },
    },
    // tooltip: {
    //   trigger: 'axis',
    //   axisPointer: { type: 'shadow' },
    //   formatter: function (params) {
    //     let tooltip = `<strong>${params[0].name}</strong><br/>`;
    //     params.forEach(param => {
    //       tooltip += `${param.seriesName}: ${param.value}${isDownTime ? ' min' : unit === 'count' ? '' : ''}<br/>`;
    //     });
    //     return tooltip;
    //   }
    // },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        // debugger
        let tooltip = `<strong>${params[0].name}</strong><br/>`;
        params.forEach(param => {
          const totalSeconds = param.value * 60;
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = Math.floor(totalSeconds % 60);
          const formattedTime = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
          tooltip += `${param.seriesName}: ${formattedTime}<br/>`;
        });
        return tooltip;
      }
    },
    legend: {
      data: [
        {
          name: 'Available Time',
          itemStyle: {
            color: '#28a745' // match the graph color
          }
        },
        {
          name: 'Down Time',
          itemStyle: {
            color: '#dc3545' // match the graph color
          }
        }
      ],
      bottom: 'bottom'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        show: showXAxisLabel
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series,
    dataZoom: [
      {
        show: true,
        type: 'slider',
        bottom: '9%',
        height: '3%',
        start: 0,
        end: data.length <= 10 ? 100 : (isFlip ? 80 : 30)
      }
    ],
    grid: {
      bottom: '15%',
      containLabel: true,
      left: '2%',
      right: '2%'
    }
  };
};

const AvailabiltyAgainstShift = memo(
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
    showXAxisLabel = false,
    date,
    workcenter,
    eventType
  }: BarChartProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem("activeTabIndex");
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [barName, setBarName] = useState(null);
    const activeTabIndex = sessionStorage.getItem("activeTabIndex");
    const { selectedBarsRef, setMachineTimeLine, machineTimeLine, selectedResource, selectedResources,
      formattedShiftsData} = useFilterContext();
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
        unit,
        isDownTime,
        timebyperiod,
        isFlip,
        showXAxisLabel
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

    // Create a stable click handler using ref
    const clickHandlerRef = useRef(async (params) => {
      const cookies = parseCookies();
      const site = cookies?.site;
      
      // Always call onBarClick if it exists
      if (onBarClick) {
        onBarClick(params.name, params.value);
      }
      
      // Update selected shift
      setBarName(params.name);
      
      // Call machine timeline data function
      await getMAchineTimelIneData(params);
    });

    // Move machine timeline data function outside
    const getMAchineTimelIneData = async (params) => {
      const cookies = parseCookies();
      const site = cookies?.site;
      const newSelection = new Set(selectedBarsRef.current);
      
      if (newSelection.has(params.name)) {
        // newSelection.delete(params.name);
      } else {
        newSelection.add(params.name);
      }
      selectedBarsRef.current = newSelection;
      
      const allMachineData = [];
      
      for (const shift of Array.from(newSelection)) {
        try {
          const shiftBO = formattedShiftsData?.current?.find(
            (shiftValue) => shiftValue.shift === shift
          );

          const req = {
            resource: selectedResources?.current,
            p_site: site,
            workcenter: workcenter,
            eventSource: eventType,
            date: date,
            shift: shiftBO?.shiftBo
          };
      
          const response = await getApiRegistry(
            req,
            "get_shift_and_downtime_summary"
          );
      
          if (!response?.errorCode && response?.data?.[0]) {
            // Process breaks data
            if (!response.data[0].breaks?.value) {
              response.data[0].breaks = { value: [] };
            } else {
              response.data[0].breaks.value = JSON.parse(response.data[0].breaks.value);
            }
      
            // Process downtimes data
            if (!response.data[0].downtimes?.value) {
              response.data[0].downtimes = { value: [] };
            } else {
              response.data[0].downtimes.value = JSON.parse(response.data[0].downtimes.value);
            }
      
            allMachineData.push(response.data[0]);
          }
        } catch (e) {
          console.error(`Error retrieving machine details for shift ${shift}:`, e);
        }
      }
      
      setMachineTimeLine(allMachineData[0]);
    };

    // Remove the useEffect as it's no longer needed
    useEffect(() => {
      clickHandlerRef.current = async (params) => {
        // console.log("Selected Shift: ", params.name, " Value: ", params.value);

        

        const getMachineTimelIneData = async () => {
          const cookies = parseCookies();
          const site = cookies?.site;
          const newSelection = new Set(selectedBarsRef.current);
          if (newSelection.has(params.name)) {
            // newSelection.delete(params.name);
          } else {
            newSelection.add(params.name);
          }
          selectedBarsRef.current = newSelection;
          
          // Create an array to store all machine timeline data
          const allMachineData = [];
          
          // Process each selected shift
          for (const shift of Array.from(newSelection)) {
            try {
              // debugger
              // get the bo value
              const shiftBO = formattedShiftsData?.current?.find(
                (shiftValue) => shiftValue.shift === shift
              );

              const req = {
                resource: selectedResources?.current,
                p_site: site,
                workcenter: workcenter,
                eventSource: eventType,
                date: date,
                shift: shiftBO?.shiftBo
              };
          
              const response = await getApiRegistry(
                req,
                "get_shift_and_downtime_summary"
              );
          
              if (!response?.errorCode && response?.data?.[0]) {
                // Process breaks data
                if (!response.data[0].breaks?.value) {
                  response.data[0].breaks = { value: [] };
                } else {
                  response.data[0].breaks.value = JSON.parse(response.data[0].breaks.value);
                }
          
                // Process downtimes data
                if (!response.data[0].downtimes?.value) {
                  response.data[0].downtimes = { value: [] };
                } else {
                  response.data[0].downtimes.value = JSON.parse(response.data[0].downtimes.value);
                }
          
                // Add to the collection
                allMachineData.push(response.data[0]);
              }
            } catch (e) {
              console.error(`Error retrieving machine details for shift ${shift}:`, e);
            }
          }
          
          // Set the combined machine timeline data
          setMachineTimeLine(allMachineData[0]);
        }
        if (onBarClick) {
          onBarClick(params.name, params.value);
        }
        setBarName(params.name);
        getMachineTimelIneData();
      };
    }, [onBarClick]);

    const showDetail = () => {
      setIsFlip(true);
    };

    const handleClose = () => {
      setIsFlip(false);
    };

    // If we don't have valid options or data, show no data found
    if (!optionRef.current || data.length === 0) {
      return (
        <Card 
          ref={chartContainerRef}
          className="chart-card"
          bodyStyle={{
            padding: "16px",
            height: "370px",
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BsBarChart style={{ fontSize: "16px", color: "#666" }} />
              <span style={{ fontSize: "15px", fontWeight: "500", color: "#333" }}>
                {title}
              </span>
            </div>
            <button
              onClick={showDetail}
              style={{
                border: "none",
                background: "none",
                padding: "4px",
                cursor: "pointer",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <AiOutlineFullscreen style={{ fontSize: "16px", color: "#666" }} />
            </button>
          </div>
          <div style={{ 
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#fafafa",
            borderRadius: "6px"
          }}>
            <NoDataScreen 
              message="No Chart Data"
              subMessage="There is no data available to display in the chart"
            />
          </div>
        </Card>
      );
    }

    // Use stable events object to prevent re-renders
    const events = {
      click: clickHandlerRef.current,
    };

    return (
      <Card
        ref={chartContainerRef}
        bodyStyle={{ padding: "10px" }}
      >
                <span
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            // padding: "8px 16px",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BsBarChart style={{ fontSize: "14px" }} />
            {title}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <AiOutlineFullscreen onClick={showDetail} />
          </div>
        </span>
        <ReactECharts
          ref={echartsRef}
          option={optionRef.current}
          style={{ height: "calc(100vh - 370px)" }}
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
                  {/* <p>
                    <strong>Range:</strong> {optionRef?.current?.xAxisData?.[0]} to{" "}
                    {
                      optionRef?.current?.xAxisData[
                        optionRef?.current?.xAxisData?.length - 1
                      ]
                    }
                  </p> */}
                </div>

                <Title level={5}>Performance Thresholds</Title>
                {/* <div style={{ marginBottom: "20px" }}>
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
                              <span>Good: ≥ {theshold?.[1]} sec</span>
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
                </div> */}

                <Title level={5}>Statistics</Title>
                {/* <div>
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
                </div> */}
              </div>
            )}
          </div>
        </Modal>
      </Card>
    );
  }
);

// Add display name
AvailabiltyAgainstShift.displayName = "AvailabiltyAgainstShift";

export default AvailabiltyAgainstShift;
