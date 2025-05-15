import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FileSearchOutlined, FullscreenOutlined, InboxOutlined } from '@ant-design/icons'
import { AiOutlineInfoCircle } from "react-icons/ai";
import { CloseOutlined } from '@mui/icons-material';
const { Title } = Typography;

interface DataPoint {
  downtimestart: string;
  downtimeend: string;
  downtimeduration: number;
  resourceid: string;
}

interface LineChartProps {
  data: DataPoint[] | null;
}

const TimeLineChart: React.FC<LineChartProps> = ({ data }) => {

  const echartsRef = useRef<ReactECharts>(null);
  const getChartOptions = () => {
    return options;
  };

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

  const formatTime = (dateStr: string | number) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateStr: string | number) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTimeRange = () => {
    if (data.length === 0) return { min: new Date(), max: new Date() };

    const allTimes = data.flatMap(item => [
      new Date(item.downtimestart).getTime(),
      new Date(item.downtimeend).getTime()
    ]);

    const minTime = new Date(Math.min(...allTimes));
    const maxTime = new Date(Math.max(...allTimes));

    // Remove the extra time padding
    return { min: minTime, max: maxTime };
  };

  const timeRange = getTimeRange();

  const getUniqueTimeLabels = () => {
    if (!data || data.length === 0) return [];
    
    // Get all unique timestamps using an array instead of Set
    const times = [
      ...data.map(item => formatTime(item.downtimestart)),
      ...data.map(item => formatTime(item.downtimeend))
    ];
    
    // Remove duplicates using filter
    const uniqueTimes = times.filter((value, index, self) => 
      self.indexOf(value) === index
    );
    
    return uniqueTimes.sort();
  };

  const options = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const item = params.data;
        return `${item.name}<br/>
                Start: ${formatDate(item.value[0])} ${formatTime(item.value[0])}<br/>
                End: ${formatDate(item.value[1])} ${formatTime(item.value[1])}<br/>
                Duration: ${item.duration}s`;
      }
    },
    xAxis: {
      type: 'category',
      data: Array.from(new Set(data.flatMap(item => [
        formatTime(item.downtimestart) + '\n' + formatDate(item.downtimestart),
        formatTime(item.downtimeend) + '\n' + formatDate(item.downtimeend)
      ]))).sort(),
      axisLabel: {
        formatter: (value) => value,
        interval: 0,
        align: 'center',
        rotate: 0,
        margin: 15,
        lineHeight: 20,
        rich: {
          time: {
            fontWeight: 'bold',
            lineHeight: 20
          },
          date: {
            fontSize: 11,
            lineHeight: 20
          }
        }
      },
      axisTick: {
        alignWithLabel: true
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: Array.from(new Set(data.map(item => item.resourceid))).sort(),
      axisLabel: {
        formatter: (value) => value
      }
    },
    series: [{
      type: 'custom',
      renderItem: function (params, api) {
        const timeLabels = Array.from(new Set(data.flatMap(item => [
          formatTime(item.downtimestart) + '\n' + formatDate(item.downtimestart),
          formatTime(item.downtimeend) + '\n' + formatDate(item.downtimeend)
        ]))).sort();

        const startTime = formatTime(api.value(0)) + '\n' + formatDate(api.value(0));
        const endTime = formatTime(api.value(1)) + '\n' + formatDate(api.value(1));
        
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
          type: 'group',
          children: [{
            type: 'line',
            shape: {
              x1: start[0],
              y1: start[1],
              x2: end[0],
              y2: end[1]
            },
            style: {
              stroke: '#ff4d4f',
              lineWidth: 2
            }
          }, {
            type: 'circle',
            shape: {
              cx: start[0],
              cy: start[1],
              r: 4
            },
            style: {
              fill: '#ff4d4f'
            }
          }, {
            type: 'circle',
            shape: {
              cx: end[0],
              cy: end[1],
              r: 4
            },
            style: {
              fill: '#ff4d4f'
            }
          }, {
            type: 'text',
            style: {
              text: `${duration}s`,
              textAlign: 'center',
              textVerticalAlign: 'bottom',
              fontSize: 12,
              fill: '#ff4d4f'
            },
            position: [middleX, middleY - 10]
          }]
        };
      },
      data: data.map(item => ({
        name: item.resourceid,
        value: [
          new Date(item.downtimestart).getTime(),
          new Date(item.downtimeend).getTime(),
          item.resourceid,
          item.downtimeduration
        ],
        duration: item.downtimeduration
      }))
    }],
    grid: {
      left: '2%',
      right: '5%',
      top: '10%',
      bottom: '25%',
      containLabel: true
    }
  };
 
  return (
    <ReactECharts
      ref={echartsRef}
      style={{ height: '100%', width: '100%' }}
      option={options}
      notMerge={true}
    />
  );
};

export default TimeLineChart;
