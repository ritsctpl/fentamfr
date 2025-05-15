import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';
import { getColor } from './LineChart';
const { Title } = Typography;

interface HistogramProps {
  data: Record<string, any>[];
  title: string;
}


const Histogram: React.FC<HistogramProps> = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { color } = useFilterContext();
  const activeTabIndex = sessionStorage.getItem('activeTabIndex');
  const isDownTime = activeTabIndex?.includes('downtime') ? true : false;

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

  // Dynamically extract keys and values from data
  const keys = Object.keys(data[0] || {});
  const xAxisKey = keys[0];  // First key for x-axis
  const yAxisKey = keys[1];  // Second key for y-axis

  const options = {

    xAxis: {
      type: 'category',
      data: data.map(item => item[xAxisKey]),
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    // color: colors,
    series: [{
      type: 'bar',
      data: data.map(item => {
        const value = Number(item[yAxisKey]);
        let itemColor;
        itemColor = getColor(value, tabkey,color  )
        return {
          value,
          itemStyle: {
            color: itemColor
          }
        };
      }),
      colorBy: 'data',
      barWidth: '100%',
    }],
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: {
          show: true,
        },
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}: ${params[0].value}`;
      },
    },
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{ background: color.lightcolor }}
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
        width='80%'
      >
        <ReactECharts
          option={options}
          style={{ height: '600px', width: '100%' }}
          ref={echartsRef}
        />
      </Modal>
    </Card>
  );
};

export default Histogram;
