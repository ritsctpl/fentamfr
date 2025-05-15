import React, { useRef, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "antd";
import { InboxOutlined } from "@ant-design/icons";
interface AreaChartProps {
  data: any[];
  colorSchema: any;
  per:any
}

const AreaCharts: React.FC<AreaChartProps> = ({ data, colorSchema,per }) => {
  const echartsRef = useRef<ReactEcharts>(null);

  useEffect(() => {
    if (echartsRef.current) {
      const chart = echartsRef.current.getEchartsInstance();
      chart.clear();
      chart.setOption(getChartOptions());
      chart.resize();
      const timer = setTimeout(() => {
        chart.resize();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data || data.length === 0 || !Array.isArray(data)) {
    return (
      <Card 
        bordered={false}
        style={{ 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <InboxOutlined style={{ 
            fontSize: '42px',
            color: '#bfbfbf'
          }} />
          <div style={{
            color: '#8c8c8c',
            fontSize: '16px',
            fontWeight: 500
          }}>
            No data available
          </div>
        </div>
      </Card>
    );
  }


  function getColor(data: any) {
    if (!colorSchema?.itemColor?.length) return undefined;
    const sortedColors = [...colorSchema.itemColor].sort((a, b) => b.range - a.range);
    const matchingColor = sortedColors.find(item => data >= item.range);
    return matchingColor?.color || sortedColors[sortedColors.length - 1]?.color;
  }

  const getChartOptions = () => {
    const allKeys = Object.keys(data[0] || {});
    const xAxisKey =
      allKeys.find((key) => key.toLowerCase().includes("date")) || allKeys[0];
    const yAxisKeys = allKeys.filter((key) => key !== xAxisKey);

    return {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((item) => item[xAxisKey]),
      },
      yAxis: {
        type: "value",
      },
      series: yAxisKeys.map((key, index) => ({
        name: key,
        data: data.map((item) => Number((Number(item[key]) || 0).toFixed(2))),
        type: "line",
        smooth: true,
        areaStyle: {
          opacity: 0.3,
          color: colorSchema?.lineColor[index]
        },
        color: colorSchema?.lineColor[index],
        itemStyle: colorSchema
          ? {
            color: (params: any) => getColor(params.data),
          }
          : undefined,
          label: {
            show: true,
            position: "top",
            formatter: `{c}${per}`,
          },
      })),
      legend: {
        data: yAxisKeys,
        show: true,
      },
      dataZoom: [
        {
          show: true,
          type: 'slider',
          bottom: 'bottom',
          height: '6%',
          start: 0,
          end: (5 / data.length) * 100
        },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
    };
  };

  return <ReactEcharts
    ref={echartsRef}
    style={{ height: '100%', width: '100%' }}
    option={getChartOptions()}
    notMerge={true}
  />;
};

export default AreaCharts;
