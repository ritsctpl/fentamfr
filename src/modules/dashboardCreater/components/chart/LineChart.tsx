import React, { useRef, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import { InboxOutlined } from '@ant-design/icons';
import {Card} from 'antd'
interface LineChartProps {
  data: any[];
  colorSchema?: any;   
  loading?:boolean
}

const LineChart: React.FC<LineChartProps> = ({ data, colorSchema ,loading}) => {
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
        data: data.map((item) => item[xAxisKey]),
        axisLabel: {
          interval: 0,
          formatter: (value: string, index: number) => {
            // Remove milliseconds and timezone offset by splitting on . or +
            const cleanedValue = value.split(/[.+]/)[0];
            const dateSeparator = cleanedValue.includes('T') ? 'T' : ' ';
            const [datePart, timePart] = cleanedValue.split(dateSeparator);
            if (index === 0) return datePart;
            const prevDate = (index > 0 && data[index - 1][xAxisKey]) 
              ? data[index - 1][xAxisKey].split(/[.+]/)[0].split(dateSeparator)[0] 
              : '';
            return datePart === prevDate ? timePart : datePart;
          }
        },
        splitNumber: data?.length || 0,
      },
      yAxis: {
        type: "value",
      },
      series: yAxisKeys.map((key, index) => ({
        name: key,
        data: data.map(item => Number((Number(item[key]) || 0).toFixed(2))),
        type: "line",
        smooth: true,
        color: colorSchema?.lineColor[index],
        itemStyle: colorSchema?.itemColor?.length>0
          ? {
              color: (params: any) => getColor(params.data),
            }
          : undefined,
          label: {
            show: true,
            position: "top",
            formatter: `{c}%`,
          },
      })),
      legend: {
        data: yAxisKeys,
        show: true,
      },
      darkMode:false,
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
      },
    };
  };

  return <ReactEcharts 
    ref={echartsRef} 
    style={{height:'100%',width:'100%'}} 
    option={getChartOptions()} 
    notMerge={true}
  />;
};

export default LineChart;
