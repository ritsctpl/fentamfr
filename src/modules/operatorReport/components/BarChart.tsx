import React, { useRef, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "antd";
import { InboxOutlined } from "@ant-design/icons";

interface BarChartProps {
  data: any[];
  colorSchema?: any;
  loading?: boolean;
  type?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, colorSchema, loading, type }) => {
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
    const xAxisKey = allKeys.find((key) => key.toLowerCase().includes("date")) || allKeys[0];
    const yAxisKeys = allKeys.filter((key) => key !== xAxisKey && key !== "lable");
    const lable = allKeys.find((key) => key.toLowerCase().includes("lable"))
    console.log(allKeys, xAxisKey, yAxisKeys, lable)
    return {
      xAxis: {
        data: data.map((item) => item[xAxisKey]),
      },
      yAxis: {
        type: "value",
      },
      series: yAxisKeys.map((key) => ({
        name: key,
        legendHoverLink: true,
        data: data.map((item) =>{ 
         const value = Number(item[key]).toFixed(2)
         return{
          value,
          label: {
            show: true,
            fontSize:8,
            position:  Number(value) > 10 ? "inside" : 'top',
            rotate:  Number(value) > 10 ? 90 : 0,
            formatter: function(params) {
              const dataIndex = params.dataIndex;
              const currentLabel = data[dataIndex]?.lable || '';
              return `${Number(params.value) >Number('10')? currentLabel : ''}\n\n${params.value}${type === 'percentage' ? '%' : type === 'quantity' ? ' qty' : ''}`;
            }
          }
         }
        }),
        type: "bar",
        itemStyle: colorSchema?.itemColor[0]?.color ? {
          color: (params) => getColor(params.data),
        } : undefined,
      })),
      dataZoom: [
        {
          show: true,
          type: 'slider',
          bottom: 'bottom',
          height: '6%',
          start: 0,
          end: (4 / data.length) * 100
        },
        
      ],
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        left: "center",
        data: yAxisKeys.map(key => ({
          name: key,
          itemStyle: {
            color: colorSchema?.itemColor[0]?.color ? getColor(data[0][key]) : undefined
          }
        })),
        show: true,
      },
      tooltip: {
        trigger: 'axis',
        formatter: lable ? function (params) {
          const dataIndex = params[0].dataIndex;
          const lable = data[dataIndex]?.lable;
          let tooltipContent = `<div style="font-weight: bold">${params[0].name}</div>`;
          tooltipContent += `<div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; margin: 3px 0">
            <div style="display: flex; align-items: center">
              <div style="display: inline-block; width: 10px; height: 10px; background: #666; margin-right: 5px; border-radius: 50%"></div>
              <div>Resource</div>
            </div>
            <div style="font-weight: bold">${lable}</div>
          </div>`;
          params.forEach(param => {
            const color = param.color || '#666';
            tooltipContent += `
              <div style="display: flex; justify-content: space-between; align-items: center; margin: 3px 0">
                <div style="display: flex; align-items: center; margin-right: 5px">
                  <div style="display: inline-block; width: 10px; height: 10px; background: ${color}; margin-right: 5px; border-radius: 50%"></div>
                  <div style="margin-right: 5px">${param.seriesName}</div>
                </div>
                <span style="font-weight: bold">${param.value}%</span>
              </div>`;
          });

          return tooltipContent;
        } : undefined,
        axisPointer: {
          type: 'shadow'
        }
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

export default BarChart;
