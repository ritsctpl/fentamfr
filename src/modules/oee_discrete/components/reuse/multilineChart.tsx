import React, { useEffect, useRef, useState, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFullscreen,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import NoDataFound from "./NoDataFound";
const { Title } = Typography;

interface DataPoint {
  date: string;
  [key: string]: any; // Allow any additional numeric fields
}

interface ResourceData {
  resource?: string; // Optional original field
  resourceId?: string; // Optional new field
  points: DataPoint[];
}

interface MultilineChartProps {
  data: ResourceData[];
  title: string;
  colors?: string[];
  description?: string;
  unit?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  legendTitle?: string;
  valueField?: string; // Field to use for values (e.g. 'percentage', 'defects')
  resourceField?: string; // Field to use for resource name (e.g. 'resource', 'resourceId')
}

// Move option creation outside component for stability
const createChartOptions = (
  data,
  colors,
  unit,
  xAxisLabel,
  yAxisLabel,
  legendTitle,
  valueField,
  resourceField,
  selectedSeries,
  isFlip,
  getLatestValue
) => {
  if (!data || data.length === 0) return null;

  // Extract all unique time points across all resources
  const allTimePoints = new Set<string>();
  data.forEach((resource) => {
    resource.points.forEach((point) => {
      allTimePoints.add(point.date);
    });
  });

  // Sort time points chronologically
  const xAxisData = Array.from(allTimePoints).sort();

  // Prepare series data for each resource
  const series = data.map((resource, index) => {
    const resourceData = xAxisData.map((time) => {
      const point = resource.points.find((p) => p.date === time);
      return point ? point[valueField] : null;
    });

    return {
      name:
        resource[resourceField] ||
        resource.resourceId ||
        resource.resource ||
        `Resource ${index + 1}`,
      type: "line",
      smooth: false,
      data: resourceData,
      connectNulls: true,
      symbolSize: 6,
      lineStyle: {
        width:
          selectedSeries ===
          (resource[resourceField] ||
            resource.resourceId ||
            resource.resource ||
            `Resource ${index + 1}`)
            ? 4
            : 1,
      },
      itemStyle: {
        color: colors[index % colors.length],
      },
      label: {
        show: false,
        position: "top",
        formatter: `{c} ${unit}`,
      },
      emphasis: {
        focus: "series",
        lineStyle: {
          width: 4,
        },
      },
    };
  });

  return {
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: {
          show: true,
          title: "Save as Image",
          pixelRatio: 2,
        },
      },
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      name: xAxisLabel,
      nameLocation: "middle",
      nameGap: 42,
      axisLabel: {
        rotate: 0,
        interval: 0,
        formatter: function (value, index) {
          // If the value doesn't contain a space, it's a date-only string
          if (!value.includes(" ")) {
            return value; // Return the full date
          }

          if (index === 0) {
            return value; // Show full date for first value
          }
          // Extract only time part for other values
          return value.split(" ")[1];
        },
        textStyle: {
          fontSize: 11,
        },
      },
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "#ddd",
        },
      },
      nameTextStyle: {
        fontWeight: "bold",
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      name: yAxisLabel || `${legendTitle}`,
      nameLocation: "middle",
      nameGap: 50,
      axisLabel: {
        formatter: `{value} ${unit}`,
        textStyle: {
          fontSize: 11,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "#ddd",
        },
      },
      nameTextStyle: {
        fontWeight: "bold",
        fontSize: 12,
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
        end: Math.max(20, (6 / xAxisData.length) * 100),
        textStyle: {
          fontSize: 10,
        },
      },
      {
        type: "slider",
        show: data.length > 8,
        yAxisIndex: 0,
        filterMode: "filter",
        width: 12,
        height: "70%",
        right: 0,
        start: 0,
        end: 100,
        textStyle: {
          fontSize: 10,
        },
        showDataShadow: false,
      },
    ],
    grid: {
      left: "3%",
      right: "20%", // Increased right margin to accommodate legend
      bottom: "15%",
      top: "8%",
      containLabel: true,
    },
    tooltip: {
      trigger: "item",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
      formatter: (params) => {
        // Handle single point hover
        if (!params || (!Array.isArray(params) && !params.value)) return "";

        const time = params.name;
        const color = params.color;
        const resourceName = params.seriesName;
        const value = params.value;

        let htmlString = `<div style="margin-bottom:5px;font-weight:bold;">${time}</div>`;
        const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
        htmlString += `<div style="margin: 3px 0;">${marker}${resourceName}: ${
          value !== null && value !== undefined
            ? Number(value).toFixed(2) + " " + unit
            : "N/A"
        }</div>`;

        return htmlString;
      },
      confine: true,
      enterable: true,
      extraCssText: "max-width: 300px; white-space: normal; z-index: 100;",
    },
    legend: {
      data: data.map(
        (resource) =>
          resource[resourceField] ||
          resource.resourceId ||
          resource.resource ||
          `Resource ${data.indexOf(resource) + 1}`
      ),
      type: "scroll",
      orient: "vertical",
      right: 30,
      top: "middle",
      width: "20%",
      textStyle: {
        fontSize: 11,
        width: 180,
        overflow: "break",
        lineHeight: 14,
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      itemGap: 8,
      formatter: function (name) {
        const resource = data.find(
          (r) =>
            r[resourceField] === name ||
            r.resourceId === name ||
            r.resource === name
        );
        const latestValue = resource ? getLatestValue(resource) : "N/A";
        return `${name}: ${latestValue}`;
      },
      itemWidth: 14,
      itemHeight: 8,
      pageButtonPosition: "end",
      pageButtonGap: 5,
      pageButtonItemGap: 5,
      pageIconSize: 12,
      pageIconColor: "#666",
      pageIconInactiveColor: "#aaa",
      pageTextStyle: {
        fontSize: 10,
        color: "#666",
      },
      title: {
        text: legendTitle,
        padding: [0, 0, 10, 0],
        textStyle: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#333",
        },
      },
      selected: data.reduce((acc, resource) => {
        acc[
          resource[resourceField] ||
            resource.resourceId ||
            resource.resource ||
            `Resource ${data.indexOf(resource) + 1}`
        ] = true;
        return acc;
      }, {}),
      height: Math.min(350, Math.max(120, data.length * 25)),
      borderRadius: 4,
      padding: [10, 10, 10, 10],
      shadowBlur: 0,
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
    animation: true,
    animationDuration: 500,
    animationEasing: "cubicOut",
    xAxisData,
  };
};

const MultilineChart = memo(
  ({
    data,
    title,
    colors = [
      "#5470c6",
      "#91cc75",
      "#fac858",
      "#ee6666",
      "#73c0de",
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ],
    description,
    unit = "%",
    xAxisLabel = "Time (Occurred At)",
    yAxisLabel,
    legendTitle = "Resources",
    valueField = "percentage",
    resourceField = "resource",
  }: MultilineChartProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    // Store data reference for comparison
    const dataRef = useRef(data);
    // Store option in ref to prevent recomputation
    const optionRef = useRef(null);

    // Get the latest value for each resource to show in legend
    const getLatestValue = (resource: ResourceData) => {
      if (!resource.points || resource.points.length === 0) return "N/A";

      const sortedPoints = [...resource.points].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return sortedPoints.length > 0
        ? `${sortedPoints[0][valueField]?.toFixed(2)} ${unit}`
        : "N/A";
    };

    // Only recalculate options if data actually changes or if isFlip/selectedSeries state changes
    if (
      !optionRef.current ||
      JSON.stringify(dataRef.current) !== JSON.stringify(data) ||
      optionRef.current.isFlip !== isFlip ||
      optionRef.current.selectedSeries !== selectedSeries
    ) {
      dataRef.current = data;
      optionRef.current = createChartOptions(
        data,
        colors,
        unit,
        xAxisLabel,
        yAxisLabel,
        legendTitle,
        valueField,
        resourceField,
        selectedSeries,
        isFlip,
        getLatestValue
      );
      if (optionRef.current) {
        optionRef.current.isFlip = isFlip;
        optionRef.current.selectedSeries = selectedSeries;
      }
    }

    // Ensure chart resizes properly when modal state changes or container resizes
    useEffect(() => {
      if ((isModalOpen || isFlip) && echartsRef.current) {
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

    // Reset selected series when data changes
    useEffect(() => {
      setSelectedSeries(null);
    }, [data]);

    if (!data || data.length === 0) {
      return (
        <Card ref={chartContainerRef} title={title}>
          <NoDataFound />
        </Card>
      );
    }

    // Determine the optimal legend display approach based on number of resources
    const hasLargeDataset = data.length > 8;
    const calculatedLegendHeight = Math.min(
      350,
      Math.max(120, data.length * 25)
    );

    const handleChartEvents = {
      click: (params) => {
        if (params.seriesName) {
          // Toggle selected series off if clicking the same one
          setSelectedSeries((prevSelected) =>
            prevSelected === params.seriesName ? null : params.seriesName
          );
        }
      },
      legendselectchanged: (params) => {
        // When toggling legend items, we may need to reset the selected series
        const legendSelected = params.selected;
        if (selectedSeries && !legendSelected[selectedSeries]) {
          setSelectedSeries(null);
        }
      },
    };

    const detailOptions = {
      ...optionRef.current,
      grid: {
        ...optionRef.current.grid,
        right: "3%",
      },
      legend: {
        ...optionRef.current.legend,
        orient: "horizontal",
        right: "auto",
        top: "bottom",
        width: "90%",
        height: data.length > 15 ? 80 : 40,
        type: "scroll",
        pageButtonPosition: "end",
        textStyle: {
          ...optionRef.current.legend.textStyle,
          width: 100,
        },
      },
    };

    // Function to reset the selected series
    const resetSelectedSeries = () => {
      setSelectedSeries(null);
    };

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
            <span
              style={{
                margin: 0,
                fontFamily: "roboto",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              {title}
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {selectedSeries && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    cursor: "pointer",
                    padding: "2px 6px",
                    background: "#f0f0f0",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={resetSelectedSeries}
                >
                  Selected:{" "}
                  {selectedSeries.length > 15
                    ? selectedSeries.substring(0, 13) + "..."
                    : selectedSeries}
                  <AiOutlineClose
                    style={{ marginLeft: "4px", fontSize: "12px" }}
                  />
                </span>
              )}
              <AiOutlineFullscreen
                onClick={() => setIsFlip(true)}
                style={{ fontSize: "18px", cursor: "pointer" }}
              />
            </div>
          </div>
        }
        bodyStyle={{ padding: "12px" }}
      >
        <ReactECharts
          ref={echartsRef}
          option={optionRef.current}
          style={{ height: "calc(100vh - 305px)" }}
          notMerge={true}
          lazyUpdate={true}
          onEvents={handleChartEvents}
          shouldSetOption={(prevProps, currentProps) => {
            return (
              JSON.stringify(prevProps.option) !==
              JSON.stringify(currentProps.option)
            );
          }}
        />

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
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontWeight: 500 }}>{title}</span>
                {selectedSeries && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      cursor: "pointer",
                      padding: "2px 6px",
                      background: "#f0f0f0",
                      borderRadius: "4px",
                      marginLeft: "12px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={resetSelectedSeries}
                  >
                    Selected:{" "}
                    {selectedSeries.length > 20
                      ? selectedSeries.substring(0, 18) + "..."
                      : selectedSeries}
                    <AiOutlineClose
                      style={{ marginLeft: "4px", fontSize: "12px" }}
                    />
                  </span>
                )}
              </div>
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
              option={open ? detailOptions : optionRef.current}
              ref={echartsRef}
              style={{
                height: "calc(100vh - 100px)",
                width: open ? "70%" : "100%",
                transition: "width 0.3s ease-in-out",
              }}
              notMerge={true}
              lazyUpdate={true}
              onEvents={handleChartEvents}
            />
            {open && (
              <div
                style={{
                  width: "30%",
                  padding: "20px",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateX(0)" : "translateX(100%)",
                  transition: "all 0.3s ease-in-out",
                  overflow: "auto",
                  maxHeight: "calc(100vh - 100px)",
                  borderLeft: "1px solid #f0f0f0",
                }}
              >
                <Title level={5}>Graph Details</Title>
                <div style={{ marginBottom: "20px" }}>
                  <p>
                    <strong>Description:</strong>
                  </p>
                  <p>
                    {description ||
                      "Tracks quality metrics for different resources over time."}
                  </p>
                  <p>
                    <strong>Time Range:</strong>{" "}
                    {optionRef.current.xAxisData[0]} to{" "}
                    {
                      optionRef.current.xAxisData[
                        optionRef.current.xAxisData.length - 1
                      ]
                    }
                  </p>
                  {selectedSeries && (
                    <p>
                      <strong>Selected Resource:</strong> {selectedSeries}
                      <Button
                        type="link"
                        size="small"
                        onClick={resetSelectedSeries}
                        style={{ padding: "0 4px", marginLeft: "5px" }}
                      >
                        Clear
                      </Button>
                    </p>
                  )}
                </div>

                <Title level={5}>Legend</Title>
                <div
                  style={{
                    marginBottom: "20px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {data.map((resource, index) => {
                    const latestValue = getLatestValue(resource);
                    const isSelected =
                      selectedSeries ===
                      (resource[resourceField] ||
                        resource.resourceId ||
                        resource.resource ||
                        `Resource ${index + 1}`);

                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                          padding: "4px",
                          backgroundColor: isSelected
                            ? "rgba(0,0,0,0.05)"
                            : "transparent",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setSelectedSeries((prevSelected) =>
                            prevSelected ===
                            (resource[resourceField] ||
                              resource.resourceId ||
                              resource.resource ||
                              `Resource ${index + 1}`)
                              ? null
                              : resource[resourceField] ||
                                resource.resourceId ||
                                resource.resource ||
                                `Resource ${index + 1}`
                          )
                        }
                      >
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            backgroundColor: colors[index % colors.length],
                            marginRight: "10px",
                            borderRadius: "2px",
                          }}
                        ></div>
                        <div style={{ flex: 1 }}>
                          <div
                            title={
                              resource[resourceField] ||
                              resource.resourceId ||
                              resource.resource ||
                              `Resource ${index + 1}`
                            }
                            style={{ fontSize: "12px" }}
                          >
                            {resource[resourceField] ||
                              resource.resourceId ||
                              resource.resource ||
                              `Resource ${index + 1}`}
                          </div>
                          <div style={{ fontSize: "11px", color: "#666" }}>
                            {latestValue}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Title level={5}>Statistics</Title>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {(selectedSeries
                    ? data.filter(
                        (r) =>
                          r[resourceField] === selectedSeries ||
                          r.resourceId === selectedSeries ||
                          r.resource === selectedSeries
                      )
                    : data
                  ).map((resource, index) => {
                    // Extract all percentage values
                    const percentageValues = resource.points
                      .map((point) => point[valueField])
                      .filter((value) => value !== null && value !== undefined);

                    // Calculate statistics
                    const avg =
                      percentageValues.length > 0
                        ? percentageValues.reduce((sum, val) => sum + val, 0) /
                          percentageValues.length
                        : 0;

                    const max =
                      percentageValues.length > 0
                        ? Math.max(...percentageValues)
                        : 0;

                    const min =
                      percentageValues.length > 0
                        ? Math.min(...percentageValues)
                        : 0;

                    // Determine display values
                    const displayAvg =
                      percentageValues.length > 0 ? avg.toFixed(2) : "N/A";
                    const displayMax =
                      percentageValues.length > 0 ? max.toFixed(2) : "N/A";
                    const displayMin =
                      percentageValues.length > 0 ? min.toFixed(2) : "N/A";

                    // Get the color for this resource
                    const resourceIndex = data.findIndex(
                      (d) =>
                        d[resourceField] ===
                        (resource[resourceField] ||
                          resource.resourceId ||
                          resource.resource ||
                          `Resource ${index + 1}`)
                    );
                    const color = colors[resourceIndex % colors.length];

                    return (
                      <div key={index} style={{ marginBottom: "15px" }}>
                        <p
                          style={{
                            fontWeight: "bold",
                            color: color,
                            marginBottom: "4px",
                          }}
                          title={
                            resource[resourceField] ||
                            resource.resourceId ||
                            resource.resource ||
                            `Resource ${index + 1}`
                          }
                        >
                          {resource[resourceField] ||
                            resource.resourceId ||
                            resource.resource ||
                            `Resource ${index + 1}`}
                          :
                        </p>
                        <div style={{ marginLeft: "15px" }}>
                          <p style={{ margin: "2px 0" }}>
                            Average: {displayAvg} {unit}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            Highest: {displayMax} {unit}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            Lowest: {displayMin} {unit}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ marginTop: "15px" }}>
                    <p>
                      <strong>Graph Usage:</strong>
                    </p>
                    <ul style={{ paddingLeft: "20px" }}>
                      <li>
                        Click on a line in the chart to focus on that resource
                        only
                      </li>
                      <li>
                        Click on legend items to show/hide specific resources
                      </li>
                      <li>Hover over the chart to see detailed values</li>
                      <li>
                        Use the zoom slider at the bottom to focus on specific
                        time periods
                      </li>
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
MultilineChart.displayName = "MultilineChart";

export default MultilineChart;
