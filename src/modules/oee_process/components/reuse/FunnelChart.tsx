import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import { getColor } from './LineChart';
const { Title } = Typography;

interface FunnelChartProps {
  data: Array<{ stage: string; incidents: number }>;
  title: string;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data, title }) => {
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


  const maxIncidents = Math.max(...data.map(item => item.incidents));
  const processedData = data.map(item => ({
    value: item.incidents,
    name: item.stage,
    percentage: ((item.incidents / maxIncidents) * 100).toFixed(1)
  }));

  const options = {

    // color: colors,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>Incidents: ${params.value}<br/>Conversion: ${params.data.percentage}%`;
      }
    },
    legend: {
      data: data.map(item => item.stage),
      orient: 'horizontal',
      top: 'bottom',
      bottom: 'middle'
    },
    series: [
      {
        name: 'Funnel',
        type: 'funnel',
        left: '25%',
        right: '25%',
        top: 60,
        bottom: 60,
        width: '50%',
        min: 0,
        max: maxIncidents,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => {
            return `(${params.data.percentage}%)`;
          },
          fontSize: 12,
          fontWeight: 'bold'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        data: processedData.map((item, index) => ({
          ...item,
        })),
        itemStyle: {
          color: (params) => {
            const currentValue = processedData[params.dataIndex].value;
            return getColor(currentValue, tabkey,color);
          }
        }
      }
    ],
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: {
          show: true,
          title: 'Save Image'
        },
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
      bordered={false}
      className="funnel-chart-card"
    >
      <ReactECharts
        ref={echartsRef}
        option={options}
        style={{
          height: '300px',
          width: '100%'
        }}
      />
      <Modal
        title={title}
        open={isModalOpen}
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

export default FunnelChart;
