import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Tooltip, Button } from "antd";
import { AiOutlineInfoCircle, AiOutlineFullscreen } from "react-icons/ai";
import { CloseOutlined } from "@mui/icons-material";
import NoDataFound from "./NoDataFound";
const { Title } = Typography;
 
interface DataPoint {
  downtimeStart: string;
  downtimeEnd: string;
  downtimeDuration: number;
  resourceId: string;
}
 
interface LineChartProps {
  data: DataPoint[];
  title: string;
}
 
const TimeLineChart: React.FC<LineChartProps> = ({
  data: inputData,
  title,
}) => {
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  useEffect(() => {
    if (isModalOpen && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
  }, [isModalOpen]);
 
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
  }, [inputData]);
 
  const formatTime = (dateStr: string | number) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
 
  const formatDate = (dateStr: string | number) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
 
  const getTimeRange = () => {
    if (inputData.length === 0) return { min: new Date(), max: new Date() };
 
    let minTime = new Date(inputData[0].downtimeStart).getTime();
    let maxTime = new Date(inputData[0].downtimeEnd).getTime();
 
    for (const item of inputData) {
      const startTime = new Date(item.downtimeStart).getTime();
      const endTime = new Date(item.downtimeEnd).getTime();
 
      minTime = Math.min(minTime, startTime);
      maxTime = Math.max(maxTime, endTime);
    }
 
    return {
      min: new Date(minTime),
      max: new Date(maxTime),
    };
  };
 
  const timeRange = getTimeRange();
 
  const getUniqueTimeLabels = () => {
    if (!inputData || inputData.length === 0) return [];
 
    // Get all unique timestamps using an array instead of Set
    const times = [
      ...inputData.map((item) => formatTime(item.downtimeStart)),
      ...inputData.map((item) => formatTime(item.downtimeEnd)),
    ];
 
    // Remove duplicates using filter
    const uniqueTimes = times.filter(
      (value, index, self) => self.indexOf(value) === index
    );
 
    return uniqueTimes.sort();
  };
 
  const options = {
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const item = params.data;
        return `${item.name}<br/>
                Start: ${formatDate(item.value[0])} ${formatTime(
          item.value[0]
        )}<br/>
                End: ${formatDate(item.value[1])} ${formatTime(
          item.value[1]
        )}<br/>
                Duration: ${item.duration}s`;
      },
    },
    xAxis: {
      type: "category",
      data: Array.from(
        new Set(
          inputData.flatMap((item) => [
            formatTime(item.downtimeStart) +
              "\n" +
              formatDate(item.downtimeStart),
            formatTime(item.downtimeEnd) + "\n" + formatDate(item.downtimeEnd),
          ])
        )
      ).sort(),
      axisLabel: {
        formatter: (value) => value,
        interval: 0,
        align: "center",
        rotate: 0,
        margin: 15,
        lineHeight: 20,
        rich: {
          time: {
            fontWeight: "bold",
            lineHeight: 20,
          },
          date: {
            fontSize: 11,
            lineHeight: 20,
          },
        },
      },
      axisTick: {
        alignWithLabel: true,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: Array.from(
        new Set(inputData.map((item) => item.resourceId))
      ).sort(),
      axisLabel: {
        formatter: (value) => value,
      },
    },
    series: [
      {
        type: "custom",
        renderItem: function (params, api) {
          const timeLabels = Array.from(
            new Set(
              inputData.flatMap((item) => [
                formatTime(item.downtimeStart) +
                  "\n" +
                  formatDate(item.downtimeStart),
                formatTime(item.downtimeEnd) +
                  "\n" +
                  formatDate(item.downtimeEnd),
              ])
            )
          ).sort();
 
          const startTime =
            formatTime(api.value(0)) + "\n" + formatDate(api.value(0));
          const endTime =
            formatTime(api.value(1)) + "\n" + formatDate(api.value(1));
 
          const startIndex = timeLabels.indexOf(startTime);
          const endIndex = timeLabels.indexOf(endTime);
 
          const start = api.coord([startIndex, api.value(2)]);
          const end = api.coord([endIndex, api.value(2)]);
          const duration = api.value(3);
 
          if (!start || !end) {
            return;
          }
 
          const middleX = (start[0] + end[0]) / 2;
          const middleY = start[1];
 
          return {
            type: "group",
            children: [
              {
                type: "line",
                shape: {
                  x1: start[0],
                  y1: start[1],
                  x2: end[0],
                  y2: end[1],
                },
                style: {
                  stroke: "#ff4d4f",
                  lineWidth: 2,
                },
              },
              {
                type: "circle",
                shape: {
                  cx: start[0],
                  cy: start[1],
                  r: 4,
                },
                style: {
                  fill: "#ff4d4f",
                },
              },
              {
                type: "circle",
                shape: {
                  cx: end[0],
                  cy: end[1],
                  r: 4,
                },
                style: {
                  fill: "#ff4d4f",
                },
              },
              {
                type: "text",
                style: {
                  text: `${duration}s`,
                  textAlign: "center",
                  textVerticalAlign: "bottom",
                  fontSize: 12,
                  fill: "#ff4d4f",
                },
                position: [middleX, middleY - 10],
              },
            ],
          };
        },
        data: inputData.map((item) => ({
          name: item.resourceId,
          value: [
            new Date(item.downtimeStart).getTime(),
            new Date(item.downtimeEnd).getTime(),
            item.resourceId,
            item.downtimeDuration,
          ],
          duration: item.downtimeDuration,
        })),
      },
    ],
    // dataZoom: [
    //   {
    //     show: false,
    //     type: "inside",
    //     bottom: "bottom",
    //     height: "6%",
    //     start: 0,
    //     end: (10 / inputData.length) * 100,
    //   },
    // ],
    grid: {
      left: "2%",
      right: "5%",
      top: "10%",
      bottom: "25%",
      containLabel: true,
    },
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
          <span>{title}</span>
          <AiOutlineFullscreen onClick={() => setIsModalOpen(true)} />
        </div>
      }
    >
      {inputData.length === 0 ? (
        <NoDataFound />
      ) : (
        <ReactECharts
          ref={echartsRef}
          option={options}
          style={{ height: "calc(100vh - 305px)" }}
        />
      )}
 
      <Modal
        title={title}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="80%"
      >
        <ReactECharts
          ref={echartsRef}
          option={options}
          style={{ height: "calc(100vh - 200px)" }}
        />
      </Modal>
    </Card>
  );
};
 
export default TimeLineChart;