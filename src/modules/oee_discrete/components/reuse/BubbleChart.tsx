import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';
import { getColor } from './LineChart';
const { Title } = Typography;

interface BubbleChartProps {
  data: Record<string, any>[];
  title: string;
}

const BubbleChart: React.FC<BubbleChartProps> = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const echartsRef = useRef<ReactECharts>(null);
  const tabkey = sessionStorage.getItem('activeTabIndex')
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { color } = useFilterContext();

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
  }, [data]);

  const keys = Object.keys(data[0] || {});
  const xAxisKey = keys[0];
  const yAxisKey = keys[1];
  const xValues = data.map(item => item[xAxisKey]);
  const yValues = data.map(item => item[yAxisKey]);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const bubbleData = data.map(item => ({
    value: [
      item[xAxisKey],
      item[yAxisKey],
      (item[xAxisKey] / xMax + item[yAxisKey] / yMax) / 2
    ],

  }));

  const options = {
    xAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
    },
    // color: colors,
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
    },
  
    series: [{
      type: 'scatter',
      colorBy: 'data',
      symbolSize: function (data: any) {
        return data[2] * 60;
      },
      data: bubbleData,
      itemStyle: {
        color: (params) => {
          const currentValue = bubbleData[params.dataIndex].value[1];
          return getColor(currentValue, tabkey,color);
        }
      },
    }],
    tooltip: {
      trigger: 'item',
      formatter: function (param: any) {
        const x = param.data.value[0].toLocaleString('en-US', {
          maximumFractionDigits: 0,
          useGrouping: true
        });
        const y = param.data.value[1].toLocaleString('en-US', {
          maximumFractionDigits: 0,
          useGrouping: true
        });
        return `${xAxisKey}: ${x}<br/>${yAxisKey}: ${y}`;
      }
    },
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: {
          show: true,
        },
      }
    },
    animationEasing: 'elasticOut'
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{ background: color?.lightcolor || '#fafafa' }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>

          {!isModalOpen && (
            <Tooltip placement='topRight' title='FullScreen'>
              <FullscreenOutlined onClick={() => setIsModalOpen(true)} />
            </Tooltip>
          )}
        </div>
      }
    >
      <ReactECharts ref={echartsRef} option={options} style={{ height: 'calc(100vh - 305px)' }} />
      <Modal
        title={title}
        visible={isModalOpen}
        centered
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width='100%'
      >
        <ReactECharts
          option={options}
          style={{ height: 'calc(100vh - 100px)', width: '100%' }}
          ref={echartsRef}
        />
      </Modal>
    </Card>
  );
};

export default BubbleChart;
