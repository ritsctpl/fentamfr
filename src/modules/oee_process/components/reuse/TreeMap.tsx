import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import { getColor } from './LineChart';
const { Title } = Typography;

interface TreeMapProps {
  data: Record<string, { duration: number; occurrences: number }>;
  title: string;
}

const TreeMap: React.FC<TreeMapProps> = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
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

  const transformedData = {
    name: 'root',
    children: Object.entries(data).map(([category, values]) => ({
      name: category,
      value: values.duration,
      duration: values.duration,
      occurrences: values.occurrences,
      itemStyle: {
        color: getColor(values.duration, tabkey,{
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[50,85,20],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        })
      },
    }))
  };

  const options = {
    tooltip: {
      formatter: (params: any) => {
        return `${params.name}<br/>` +
          `Duration: ${params.data.duration} minutes<br/>` +
          `Occurrences: ${params.data.occurrences}`;
      }
    },
    series: [{
      type: 'treemap',
      data: transformedData.children,
      breadcrumb: { show: true },
      label: {
        show: true,
        formatter: (params: any) => {
          return `${params.name}\n${params.value} min`;
        },
        position: 'inside',
        fontSize: 14,
      },
      levels: [{
        itemStyle: {
          borderWidth: 1,
          gapWidth: 1,
        }
      }],
      visualMin: 0,
      animationDurationUpdate: 1000
    }],
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: {
          show: true,
        }
      }
    }
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{ background: color?.lightcolor || '#fafafa', boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
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
      <ReactECharts ref={echartsRef} option={options} style={{ height: '300px' }} />
      <Modal
        title={title}
        open={isModalOpen}
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

export default TreeMap;

