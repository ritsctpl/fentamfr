import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FileSearchOutlined, FullscreenOutlined } from '@ant-design/icons'
import { AiOutlineInfoCircle } from "react-icons/ai";
import { CloseOutlined } from '@mui/icons-material';
import NoDataFound from './NoDataFound';
const { Title } = Typography;

interface DataPoint {
  date: string;
  [key: string]: number | string;
}

interface LineChartProps {
  data: DataPoint[];
  title: String
  color: any
  description?:any
}
export const getColor = (value: number, type: string,color) => {
  switch (type) {
    case 'availability':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'quality':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'downtime':
      if (value > color?.threshold[0]) return color?.itemcolor[0];
      if (value > color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'performance':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'oee':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    default:
      if (value < 50) return color?.itemcolor[0];
      if (value < 84) return color?.itemcolor[1];
      return color?.itemcolor[2];
  }
};

const AreaChart: React.FC<LineChartProps> = ({ data, title ,color,description}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const [previousSeriesKeys, setPreviousSeriesKeys] = useState<string[]>([]);
  const hasData = data && data.length > 0;

  // Helper function to get the current xAxisData for display in the UI
  const getXAxisData = () => {
    return data?.length ? data.map(item => item.date) : [];
  };

  const getChartOptions = () => {
    if (!data || data.length === 0) {
      return {
        title: {
          text: 'No Data Available',
          textStyle: {
            color: '#666',
            fontSize: 14
          },
          left: 'center',
          top: 'center'
        }
      };
    }

    const xAxisData = data?.length ? data.map(item => item.date) : [];
    const seriesKeys = data && data.length > 0 ? Object.keys(data[0] || {}).filter(key => key !== 'date') : [];
    const activeTabIndex = sessionStorage.getItem('activeTabIndex') || '';
    const isDownTime = activeTabIndex?.includes('downtime') ? true : false;
    
    // Calculate maximum value for yAxis dynamically
    const maxValue = data && data.length > 0 
      ? Math.max(...data.flatMap(item => 
          seriesKeys.map(key => Number(item[key]) || 0)
        )) * 1.2 // Add 20% margin
      : 100;
      
    const series = seriesKeys.map((key, index) => ({
      name: key,
      type: 'line',
      smooth: true,
      data: data?.map(item => item[key] !== undefined ? item[key] : null) || [],
      Stack: 'value',
      clip: true,
      itemStyle: {
        color: color?.linecolor ? color.linecolor[index % (color.linecolor.length || 1)] : '#1890ff'
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params) => {
          if (params.value === null) return '';
          const value = params.value ?? 0;
          return isDownTime ? `${value} sec` : `${value}`;
        },
        fontSize: 12
      },
      lineStyle: {
        color: color?.linecolor ? color.linecolor[index % (color.linecolor.length || 1)] : '#1890ff'
      },
      areaStyle: {
        opacity: 0.4,
      }
    }));
  
    return {
      animation: false, // Disable animation for better performance
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval: 0,
          formatter: (value: string, index: number) => {
            if (!value) return '';
            const parts = value.split(' ');
            const datePart = parts[0] || '';
            const timePart = parts[1] || '';
            
            if (index === 0) return datePart;
            
            const prevDate = (index > 0 && xAxisData[index - 1]) ? xAxisData[index - 1].split(' ')[0] : '';
            
            return datePart === prevDate ? timePart : datePart;
          }
        },
        splitNumber: data?.length || 0,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxValue,
        axisLabel: {
          formatter: (value: number) => isDownTime ? `${value.toFixed(0)} sec` : `${value.toFixed(0)}`
        }
      },
      series,
      dataZoom: [
        {
          show: isFlip && hasData,
          type: 'slider',
          bottom: 'bottom',
          height: '6%',
          start: 0,
          end: 100
        },
      ],
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
        show: hasData,
        trigger: 'axis',
        position: function (point: number[], params: any, dom: any, rect: any, size: any) {
          // Handle tooltip positioning to prevent overflow
          const [x, y] = point;
          const chartWidth = size.viewSize[0];
          const tooltipWidth = dom.offsetWidth;
          const tooltipHeight = dom.offsetHeight;
          
          let posX = x;
          let posY = y;

          // Adjust X position if tooltip would overflow right edge
          if (x + tooltipWidth > chartWidth) {
            posX = chartWidth - tooltipWidth;
          }

          // Adjust Y position if tooltip would overflow bottom
          if (y + tooltipHeight > size.viewSize[1]) {
            posY = y - tooltipHeight;
          }

          return [Math.max(0, posX), Math.max(0, posY)];
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          const header = params[0]?.name || '';
          const body = params
            .filter(p => p?.value !== null)
            .map(({ marker, seriesName, value }) => 
              `${marker || ''} ${seriesName || ''}: ${isDownTime ? `${value || 0} sec` : `${value || 0}`}`)
            .join('<br />');
          return `${header}<br />${body}`;
        },
      },
      legend: {
        data: seriesKeys,
        top: 'bottom',
        left: 'center',
        type: 'scroll',
        pageButtonItemGap: 5,
        pageButtonGap: 5,
        pageButtonPosition: 'end',
        pageIconColor: '#2f4554',
        pageIconInactiveColor: '#aaa',
        pageIconSize: 15,
        pageTextStyle: {
          color: '#333'
        }
      },
      grid: {
        top: '10%',
        right: '5%',
        bottom: '15%',
        left: '5%',
        containLabel: true
      }
    };
  };

  useEffect(() => {
    if (echartsRef.current) {
      const chart = echartsRef.current.getEchartsInstance();
      
      // Set a minimum size for the chart container
      if (chartContainerRef.current) {
        chartContainerRef.current.style.minHeight = '300px';
      }

      // Initial render with delay to ensure container is sized
      setTimeout(() => {
        chart.setOption(getChartOptions(), true);
        chart.resize();
      }, 100);

      // Add window resize listener
      const handleResize = () => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart && !chart.isDisposed()) {
          chart.dispose();
        }
      };
    }
  }, [data, isModalOpen, isFlip]);

  useEffect(() => {
    if (data && data.length > 0) {
      const currentSeriesKeys = Object.keys(data[0] || {}).filter(key => key !== 'date');
      
      if (JSON.stringify(currentSeriesKeys) !== JSON.stringify(previousSeriesKeys)) {
        setPreviousSeriesKeys(currentSeriesKeys);
        
        if (echartsRef.current) {
          const chart = echartsRef.current.getEchartsInstance();
          chart.clear();
          chart.setOption(getChartOptions());
          chart.resize();
        }
      }
    }
  }, [data]);

  const getColorValue = (value: number, type: string) => {
    if (value === undefined || value === null) return color?.itemcolor ? color.itemcolor[0] : '#1890ff';
    
    switch (type) {
      case 'availability':
        if (value < (color?.threshold?.[0] || 50)) return color?.itemcolor?.[2] || '#ff4d4f'; // Red for critical
        if (value < (color?.threshold?.[1] || 85)) return color?.itemcolor?.[1] || '#faad14'; // Yellow for warning
        return color?.itemcolor?.[0] || '#52c41a'; // Green for good
      case 'quality':
        if (value < (color?.threshold?.[0] || 50)) return color?.itemcolor?.[2] || '#ff4d4f'; // Red for critical
        if (value < (color?.threshold?.[1] || 85)) return color?.itemcolor?.[1] || '#faad14'; // Yellow for warning
        return color?.itemcolor?.[0] || '#52c41a'; // Green for good
      case 'downtime':
        if (value > (color?.threshold?.[1] || 85)) return color?.itemcolor?.[2] || '#ff4d4f'; // Red for high downtime
        if (value > (color?.threshold?.[0] || 50)) return color?.itemcolor?.[1] || '#faad14'; // Yellow for medium downtime
        return color?.itemcolor?.[0] || '#52c41a'; // Green for low downtime
      case 'performance':
        if (value < (color?.threshold?.[0] || 50)) return color?.itemcolor?.[2] || '#ff4d4f'; // Red for critical
        if (value < (color?.threshold?.[1] || 85)) return color?.itemcolor?.[1] || '#faad14'; // Yellow for warning
        return color?.itemcolor?.[0] || '#52c41a'; // Green for good
      case 'oee':
        if (value < (color?.threshold?.[0] || 50)) return color?.itemcolor?.[2] || '#ff4d4f'; // Red for critical
        if (value < (color?.threshold?.[1] || 85)) return color?.itemcolor?.[1] || '#faad14'; // Yellow for warning
        return color?.itemcolor?.[0] || '#52c41a'; // Green for good
      default:
        if (value < (color?.threshold?.[0] || 50)) return color?.itemcolor?.[2] || '#ff4d4f'; // Red for critical
        if (value < (color?.threshold?.[1] || 85)) return color?.itemcolor?.[1] || '#faad14'; // Yellow for warning
        return color?.itemcolor?.[0] || '#52c41a'; // Green for good
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(true);
  }

  return (
    <Card
      ref={chartContainerRef}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {hasData && <FullscreenOutlined onClick={showDetail} />}
          </div>
        </div>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '400px' }}
      bodyStyle={{ flex: 1, overflow: 'hidden', position: 'relative' }}
    >
      {!hasData ? (
        <div style={{ margin: '0px' }}>
          <NoDataFound/>
        </div>
      ) : (
        <ReactECharts 
          ref={echartsRef} 
          option={getChartOptions()} 
          style={{ height: '100%', minHeight: '300px', width: '100%' }} 
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={true}
        />
      )}
      <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='100%'>
        <ReactECharts opts={{ locale: 'FR' }} option={getChartOptions()} style={{ height: 'calc(100vh - 100px)', width: '100%' }} ref={echartsRef} notMerge={true} />
      </Modal>

      <Modal closable={false} open={isFlip} centered onCancel={() => setIsFlip(false)} footer={null} width='100%'
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button type="text" icon={<AiOutlineInfoCircle style={{fontSize:'20px'}} onClick={() => setOpen(prev => !prev)} />} />
              <Button type="text" icon={<CloseOutlined onClick={() => setIsFlip(false)} />} />
            </div>
          </div>
        }>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}>
          <ReactECharts
            opts={{ locale: 'FR' }}
            option={getChartOptions()}
            style={{
              height: 'calc(100vh - 100px)',
              width: open ? '70%' : '100%',
              transition: 'width 0.3s ease-in-out'
            }}
            ref={echartsRef}
            notMerge={true}
          />
          {open && (
            <div style={{
              width: '30%',
              padding: '20px',
              opacity: open ? 1 : 0,
              transform: open ? 'translateX(0)' : 'translateX(100%)',
              transition: 'all 0.3s ease-in-out',
              overflow: 'hidden'
            }}>
              <Title level={5}>Graph Details</Title>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Description:</strong></p>
                <p>{description}</p>
                <p><strong>Date Range:</strong> {getXAxisData()[0]} to {getXAxisData()[getXAxisData().length - 1]}</p>
              </div>

              {/* <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: '20px' }}>
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color?.itemcolor[0], marginRight: '10px' }}></div>
                    <span>Good: ≥ {color?.threshold[1]}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color?.itemcolor[1], marginRight: '10px' }}></div>
                    <span>Warning: {color?.threshold[0]}-{color?.threshold[1]-1}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color?.itemcolor[2], marginRight: '10px' }}></div>
                    <span>Critical: ≤ {color?.threshold[0]-1}%</span>
                  </div>
                </>
              </div> */}

              <Title level={5}>Statistics</Title>
              <div>
                <p><strong>Average:</strong> {
                  (data && data.length > 0) ? 
                  ((data.reduce((acc, item) => {
                    const seriesKeys = Object.keys(data[0] || {}).filter(key => key !== 'date');
                    return acc + (Number(item[seriesKeys[0] || ''] || 0));
                  }, 0) / (data.length || 1))).toFixed(2) : '0.00'
                }</p>
                <p><strong>Highest Value:</strong> {
                  (data && data.length > 0) ? 
                  (Math.max(...data.map(item => {
                    const seriesKeys = Object.keys(data[0] || {}).filter(key => key !== 'date');
                    return Number(item[seriesKeys[0] || ''] || 0);
                  }), 0)).toFixed(2) : '0.00'
                }</p>
                <p><strong>Lowest Value:</strong> {
                  (data && data.length > 0) ? 
                  (Math.min(...data.map(item => {
                    const seriesKeys = Object.keys(data[0] || {}).filter(key => key !== 'date');
                    return Number(item[seriesKeys[0] || ''] || 0);
                  }), 0)).toFixed(2) : '0.00'
                }</p>
                <p><strong>Data Points:</strong> {data?.length || 0}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default AreaChart;