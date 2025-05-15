import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons'
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';
const { Title } = Typography;


interface DataPoint {
    [key: string]: number | string;
}

interface BarChartProps {
  data: DataPoint[];
  title: string;
  color:any;
  theshold:any;
}

const getSeriesColor = (tabkey: string, color,theshold) => {
  switch (tabkey) {
    case "availability":
      return color;
    case "quality":
      return color;
    case "downtime":
      return color;
    case "performance":
      return color;
    case "oee":
      return color;
  }
};

const getColor = (value: number, type: string, key:number,color,theshold) => {
    switch (type) {
        case 'availability':
            if (value < theshold[0]) return color[0];
            if (value < theshold[1]) return color[1];
            return color[2];
        case 'quality':
            if (value < theshold[0]) return color[0];
            if (value < theshold[1]) return color[1];
            return color[2];
        case 'downtime':
            if (value > theshold[0]) return color[0];
            if (value > theshold[1]) return color[1];
            return color[2];
        case 'performance':
            if (value < theshold[0]) return color[0];
            if (value < theshold[1]) return color[1];
            return color[2];
        case 'oee':
            if (value < theshold[0]) return color[0];
            if (value < theshold[1]) return color[1];
            return color[2];
        default:
            if (value < 50) return "#dc3545";
            if (value < 84) return "#ffc107";
            return "#28a745";
    }
};

const BarChart: React.FC<BarChartProps> = ({ data, title ,color,theshold }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem('activeTabIndex')
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    // const { color, colors } = useFilterContext()
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (isModalOpen && echartsRef.current) {
            echartsRef.current.getEchartsInstance().resize();
        }
        if (isFlip && echartsRef.current) {
            echartsRef.current.getEchartsInstance().resize();
        }
    }, [isModalOpen, isFlip]);

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


    if (!data || data.length === 0) {
        return  <Card style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data available</Card>;
    }

    const categoryKey = Object.keys(data[0]).find(key => typeof data[0][key] === 'string');
    const metricsKeys = Object.keys(data[0]).filter(key => key !== categoryKey && typeof data[0][key] === 'number');
    console.log('categoryKey,metricsKeys', categoryKey, metricsKeys)
    if (!categoryKey || metricsKeys.length === 0) {
        return <div>Error: No valid category or value key found.</div>;
    }

    const xAxisData = data.map(item => item[categoryKey]);

    const series = metricsKeys.map(metricKey => ({
        name: metricKey,
        type: 'bar',
        data: data.map(item => {
            const value = Number(item[metricKey]);
            let itemColor;
            itemColor = getColor(value, tabkey, metricsKeys.length,color,theshold)
            if (metricsKeys.length == 1) {
                return {
                    value,
                    itemStyle: {
                        color: itemColor
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }
            } else {
                return {
                    value,
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }
            }
        }),
        colorBy: metricsKeys.length > 2 ? 'series' : 'data'
    }));

    const option = {
        toolbox: {
            show: true,
            right: '10%',
            feature: {
                saveAsImage: {
                    show: true,
                }
            }
        },
        color: getSeriesColor(tabkey,color,theshold),
        xAxis: {
            type: 'category',
            data: xAxisData,
        },
        yAxis: {
            type: 'value',
        },
        series,
        dataZoom: [
            {
              show: isFlip,
              type: 'slider',
              bottom: 'bottom',
              height: '6%',
              start: 0,
              end: (5 / data.length) * 100
            },
          ],
        
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                return params
                    .map(({ marker, seriesName, value }) => `${marker} ${seriesName}: ${value}`)
                    .join('<br />');
            },
        },
        legend: {
            data: metricsKeys,
            bottom: 'bottom',
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
            style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <FullscreenOutlined onClick={showDetail} />
                        {/* {!isModalOpen && (
                            <Tooltip placement='topRight' title='FullScreen'>
                                <FullscreenOutlined onClick={showModal} />
                            </Tooltip>
                        )} */}
                    </div>
                </div>
            }
        >
            <ReactECharts ref={echartsRef} option={option} style={{ height: '300px' }} />
            <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='100%'>
                <ReactECharts option={option} style={{ height: 'calc(100vh - 100px)', width: '100%' }} ref={echartsRef} />
            </Modal>



            <Modal closable={false} open={isFlip} centered onCancel={() => setIsFlip(false)} footer={null} width='100%'
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Button
                                type="text"
                                icon={
                                    <AiOutlineInfoCircle
                                        style={{ fontSize: '20px' }}
                                    />
                                }
                                onClick={() => setOpen(prev => !prev)}
                            />
                            <Button type="text" icon={<CloseOutlined onClick={() => setIsFlip(false)} />} />
                        </div>
                    </div>
                }>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    overflow: 'hidden'
                }}>
                    <ReactECharts option={option} ref={echartsRef} style={{
                        height: 'calc(100vh - 100px)',
                        width: open ? '70%' : '100%',
                        transition: 'width 0.3s ease-in-out'
                    }} />
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
                                <p>This chart visualizes {title.toLowerCase()} metrics across different time periods, helping identify trends and patterns in operational performance.</p>
                                <p>Use this data to track performance variations and make informed decisions for process optimization.</p>
                                <p><strong>Date Range:</strong> {xAxisData[0]} to {xAxisData[xAxisData.length - 1]}</p>
                            </div>

                            <Title level={5}>Performance Thresholds</Title>
                            <div style={{ marginBottom: '20px' }}>
                                {tabkey === 'availability' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#28a745', marginRight: '10px' }}></div>
                                            <span>Good: ≥ 85%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#ffc107', marginRight: '10px' }}></div>
                                            <span>Warning: 50-84%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', marginRight: '10px' }}></div>
                                            <span>Critical: &gt; 50%</span>
                                        </div>
                                    </>
                                )}
                                {tabkey === 'quality' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#4CAF50', marginRight: '10px' }}></div>
                                            <span>Good: ≥ 95%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEB3B', marginRight: '10px' }}></div>
                                            <span>Warning: 80-94%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#F44336', marginRight: '10px' }}></div>
                                            <span>Critical: &gt; 80%</span>
                                        </div>
                                    </>
                                )}
                                {tabkey === 'downtime' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#2ECC71', marginRight: '10px' }}></div>
                                            <span>Good: ≤ 10%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#F39C12', marginRight: '10px' }}></div>
                                            <span>Warning: 11-30%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#E74C3C', marginRight: '10px' }}></div>
                                            <span>Critical: &gt; 30%</span>
                                        </div>
                                    </>
                                )}
                                {tabkey === 'performance' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#2E8B57', marginRight: '10px' }}></div>
                                            <span>Good: ≥ 90%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFAE42', marginRight: '10px' }}></div>
                                            <span>Warning: 70-89%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#B22222', marginRight: '10px' }}></div>
                                            <span>Critical: &gt; 70%</span>
                                        </div>
                                    </>
                                )}
                                {tabkey === 'oee' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#008000', marginRight: '10px' }}></div>
                                            <span>Good: ≥ 85%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFD700', marginRight: '10px' }}></div>
                                            <span>Warning: 60-84%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: '#8B0000', marginRight: '10px' }}></div>
                                            <span>Critical: &gt; 60%</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Title level={5}>Statistics</Title>
                            <div>
                                <p><strong>Average:</strong> {
                                    (data.reduce((acc, item) => acc + (Number(item[metricsKeys[0]]) || 0), 0) / data.length).toFixed(2)
                                }%</p>
                                <p><strong>Highest Value:</strong> {
                                    Math.max(...data.map(item => Number(item[metricsKeys[0]]) || 0)).toFixed(2)
                                }%</p>
                                <p><strong>Lowest Value:</strong> {
                                    Math.min(...data.map(item => Number(item[metricsKeys[0]]) || 0)).toFixed(2)
                                }%</p>
                                <div style={{ marginTop: '15px' }}>
                                    <p><strong>Graph Usage:</strong></p>
                                    <ul style={{ paddingLeft: '20px' }}>
                                        <li>Click on legend items to show/hide specific metrics</li>
                                        <li>Hover over bars to see detailed values</li>
                                        <li>Use the save icon to download the chart</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default BarChart;
