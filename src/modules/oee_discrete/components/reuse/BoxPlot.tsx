import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';
const { Title } = Typography;
import { getColor } from './LineChart';

interface BoxPlotData {
  q1: number;
  median: number;
  q3: number;
  outliers: number[];
}

interface BoxPlotProps {
  data: BoxPlotData[];
  title: string;
}

const BoxPlot: React.FC<BoxPlotProps> = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey=sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { color,  } = useFilterContext();

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

  const boxplotData = data.map(item => {
    const min = Math.min(item.q1, ...(item.outliers || []));
    const max = Math.max(item.q3, ...(item.outliers || []));
    return [min, item.q1, item.median, item.q3, max];
  });

  const outlierData = data.map((item, idx) =>
    (item.outliers || []).map(value => [idx, value])
  ).flat();

  const options = {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        if (params.seriesIndex === 0) {
          return `Box Plot Statistics:<br/>
                 Maximum: ${params.data[4]}<br/>
                 Upper Quartile (Q3): ${params.data[3]}<br/>
                 Median: ${params.data[2]}<br/>
                 Lower Quartile (Q1): ${params.data[1]}<br/>
                 Minimum: ${params.data[0]}`;
        } else {
          return `Outlier: ${params.data[1]}`;
        }
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['Distribution'],
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false
      },
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: 'Value',
      splitArea: {
        show: true
      }
    },
    
    series: [
      {
        name: 'BoxPlot',
        type: 'boxplot',
        data: boxplotData,
        itemStyle: {
          color: getColor(data[0].median, tabkey,color),
          // borderColor: colors[1]
        },
        emphasis: {
          itemStyle: {
            borderWidth: 2,
            shadowBlur: 5,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        }
      },
      {
        name: 'Outliers',
        type: 'scatter',
        data: outlierData,
        itemStyle: {
          // color: colors[2]
        }
      }
    ],
    toolbox: {
      show: false,
      feature: {
        saveAsImage: { show: true },
      }
    }
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

export default BoxPlot;

