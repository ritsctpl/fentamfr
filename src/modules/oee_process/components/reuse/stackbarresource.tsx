import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography, Tooltip, Modal, Button } from "antd";
import { FullscreenOutlined } from "@ant-design/icons";
import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { CloseOutlined } from "@mui/icons-material";
const { Title } = Typography;

interface DataPoint {
  [key: string]: any;
}

interface StackedBarChartProps {
  data: DataPoint[];
  title: string;
  color: any;
}
const getSeriesColor = (tabkey: string, color: string[]) => {
  const colorMeanings = {
    availability: {
      colors: [color[0], color[1], color[2]],
      meanings: ["Running Time", "Idle Time", "Down Time"],
    },
    quality: {
      colors: [color[0], color[1], color[2]],
      meanings: ["Good Quality", "Marginal Quality", "Poor Quality"],
    },
    downtime: {
      colors: [color[0], color[1], color[2]],
      meanings: ["Planned", "Unplanned", "Breakdown"],
    },
    performance: {
      colors: [color[0], color[1], color[2]],
      meanings: ["High Performance", "Medium Performance", "Low Performance"],
    },
    oee: {
      colors: [color[0], color[1], color[2]],
      meanings: ["Optimal OEE", "Average OEE", "Low OEE"],
    },
  };

  // Return the colors array if tabkey exists, otherwise return the original color array
  return colorMeanings[tabkey?.toLowerCase()]?.colors || color;
};

const StackedBarChartResource: React.FC<StackedBarChartProps> = ({
  data,
  title,
  color,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem("activeTabIndex");
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // const { color, colors } = useFilterContext()
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

  if (!data || data.length === 0) {
    return (
      <Card
        style={{
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        No data available
      </Card>
    );
  }

  const keys = Object.keys(data[0]);

  const possibleCategoryKeys = [
    "product",
    "shift",
    "line",
    "workcenterId",
    "itemBo",
    "resourceId",
  ];

  const reasonsKey = keys.find(
    (key) => typeof data[0][key] === "object" && key.toLowerCase() === "reasons"
  );

  const categoryKey =
    keys.find((key) => possibleCategoryKeys.includes(key.toLowerCase())) ||
    keys[0];

  const valueKeys = keys.filter(
    (key) =>
      typeof data[0][key] === "number" ||
      key.toLowerCase().includes("percentage") ||
      key.toLowerCase().includes("value")
  );

  const groupingKey = keys.find(
    (key) =>
      key !== categoryKey &&
      !valueKeys.includes(key) &&
      typeof data[0][key] === "string"
  );

  let seriesKeys: string[] = [];
  if (reasonsKey) {
    const allReasons = new Set<string>();
    data.forEach((item) => {
      Object.keys(item[reasonsKey]).forEach((reason) => allReasons.add(reason));
    });
    seriesKeys = Array.from(allReasons);
  } else {
    seriesKeys = groupingKey
      ? Array.from(new Set(data.map((item) => item[groupingKey])))
      : valueKeys;
  }

  const categoriesArray = Array.from(
    new Set(data.map((item) => item[categoryKey]))
  );

  const seriesMap: Record<string, any> = {};
  seriesKeys.forEach((key) => {
    seriesMap[key] = {
      name: key,
      type: "bar",
      stack: tabkey === "oee" ? "oeeStack" : "total",
      emphasis: { focus: "series" },
      data: Array(categoriesArray.length).fill(0),
      colorBy: "series",
      label: {
        show: true,
        position: "inside",
        formatter: "{c}%",
        fontSize: 12,
        color: "#fff",
      },
    };

    if (tabkey === "oee") {
      seriesMap[`${key}_remaining`] = {
        name: `${key} Remaining`,
        type: "bar",
        stack: "oeeStack",
        emphasis: { focus: "series" },
        data: Array(categoriesArray.length).fill(0),
        itemStyle: {
          color: "#E0E0E0",
        },
        label: {
          show: false,
        },
      };
    }
  });

  data.forEach((item) => {
    const categoryIndex = categoriesArray.indexOf(item[categoryKey]);
    if (categoryIndex !== -1) {
      if (reasonsKey) {
        Object.entries(item[reasonsKey]).forEach(([reason, value]) => {
          if (seriesMap[reason]) {
            seriesMap[reason].data[categoryIndex] = value;
            if (tabkey === "oee") {
              seriesMap[`${reason}_remaining`].data[categoryIndex] =
                100 - Number(value);
            }
          }
        });
      } else if (groupingKey) {
        const group = item[groupingKey];
        const value = valueKeys.reduce((acc, key) => acc || item[key], 0);
        if (seriesMap[group]) {
          seriesMap[group].data[categoryIndex] = value;
        }
      } else {
        valueKeys.forEach((valueKey) => {
          if (seriesMap[valueKey]) {
            const value = item[valueKey];
            seriesMap[valueKey].data[categoryIndex] = value;
            if (tabkey === "oee") {
              seriesMap[`${valueKey}_remaining`].data[categoryIndex] =
                100 - value;
            }
          }
        });
      }
    }
  });

  // Create series in alternating order (value, remaining, value, remaining)
  const series = Object.entries(seriesMap).reduce(
    (acc: any[], [key, value]) => {
      if (tabkey === "oee") {
        // If it's not a "remaining" series
        if (!key.includes("_remaining")) {
          // Push the main value series
          acc.push(value);
          // Push its corresponding remaining series immediately after
          acc.push(seriesMap[`${key}_remaining`]);
        }
      } else {
        acc.push(value);
      }
      return acc;
    },
    []
  );

  // Add this function to calculate max value
  const calculateMaxValue = () => {
    let maxTotal = 0;
    data.forEach((item) => {
      const total = ["oee", "performance", "quality", "availability"].reduce(
        (sum, key) => sum + (item[key] || 0),
        0
      );
      maxTotal = Math.max(maxTotal, total);
    });
    // Cap at 400% maximum
    return Math.min(400, Math.ceil((maxTotal * 1.1) / 100) * 100);
  };

  const option = {
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: { show: true },
      },
    },
    color: color,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: function (params) {
        let result = `${params[0].name}<br/>`;
        params.forEach((param) => {
          if (!param.seriesName.includes("_remaining")) {
            const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
            result += `${marker}${param.seriesName}: ${param.value}%<br/>`;
          }
        });
        return result;
      },
    },
    legend: {
      data: series
        .filter((s) => !s.name.includes("_remaining"))
        .map((s) => s.name),
      bottom: "0",
      itemWidth: 15,
      itemHeight: 10,
      textStyle: {
        fontSize: 10,
      },
      padding: [5, 0, 5, 0],
      type: "scroll",
      show: true,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.resource),
      axisLabel: {
        interval: 0,
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      max: calculateMaxValue(),
      axisLabel: {
        formatter: "{value}%",
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "OEE",
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "none",
          scale: false,
        },
        data: data.map((item) => item.oee),
        label: {
          show: true,
          position: "inside",
          formatter: (params) => {
            return params.value > 5 ? `${params.value}%` : "";
          },
          color: "#fff",
          fontSize: 11,
          distance: 5,
        },
        tooltip: {
          formatter: "{b}: {c}%",
        },
        itemStyle: {
          color: color[0],
        },
      },
      {
        name: "Performance",
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "none",
          scale: false,
        },
        data: data.map((item) => item.performance),
        label: {
          show: true,
          position: "inside",
          formatter: (params) => {
            return params.value > 5 ? `${params.value}%` : "";
          },
          color: "#fff",
          fontSize: 11,
          distance: 5,
        },
        tooltip: {
          formatter: "{b}: {c}%",
        },
        itemStyle: {
          color: color[1],
        },
      },
      {
        name: "Quality",
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "none",
          scale: false,
        },
        data: data.map((item) => item.quality),
        label: {
          show: true,
          position: "inside",
          formatter: (params) => {
            return params.value > 5 ? `${params.value}%` : "";
          },
          color: "#fff",
          fontSize: 11,
          distance: 5,
        },
        tooltip: {
          formatter: "{b}: {c}%",
        },
        itemStyle: {
          color: color[2],
        },
      },
      {
        name: "Availability",
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "none",
          scale: false,
        },
        data: data.map((item) => item.availability),
        label: {
          show: true,
          position: "inside",
          formatter: (params) => {
            return params.value > 5 ? `${params.value}%` : "";
          },
          color: "#fff",
          fontSize: 11,
          distance: 5,
        },
        tooltip: {
          formatter: "{b}: {c}%",
        },
        itemStyle: {
          color: color[3],
        },
      },
    ],
    dataZoom: [
      {
        show: isFlip,
        type: "slider",
        bottom: "bottom",
        height: "6%",
        start: 0,
        end: (5 / data.length) * 100,
      },
    ],
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  return (
    <div ref={chartContainerRef} style={{ height: "100%" }}>
      <ReactECharts
        option={option}
        style={{ height: "calc(100vh - 100px)", width: "100%" }}
        ref={echartsRef}
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
                icon={<CloseOutlined onClick={() => setIsFlip(false)} />}
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
                <p>
                  This stacked bar chart visualizes {title.toLowerCase()}{" "}
                  metrics across different categories, allowing for easy
                  comparison and trend analysis.
                </p>
                <p>
                  Each bar segment represents a distinct component of the{" "}
                  {title.toLowerCase()} measurement, stacked to show the total
                  contribution.
                </p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: "20px" }}>
                {tabkey &&
                  getSeriesColor(tabkey, color)?.map((color, index) => (
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
                          backgroundColor: color,
                          marginRight: "10px",
                        }}
                      ></div>
                      <span>
                        {getSeriesColor(tabkey, color).meanings?.[index] ||
                          `Category ${index + 1}`}
                      </span>
                    </div>
                  ))}
              </div>

              <Title level={5}>Graph Analysis</Title>
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Time Period:</strong> {categoriesArray[0]} to{" "}
                  {categoriesArray[categoriesArray.length - 1]}
                </p>
                <p>
                  <strong>Total Categories:</strong> {categoriesArray.length}
                </p>
                <p>
                  <strong>Average Value:</strong>{" "}
                  {(
                    data.reduce(
                      (acc, item) => acc + (Number(item[valueKeys[0]]) || 0),
                      0
                    ) / data.length
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StackedBarChartResource;
