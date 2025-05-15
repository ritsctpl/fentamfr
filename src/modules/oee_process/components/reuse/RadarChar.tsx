import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons'
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
const { Title } = Typography;
import { getColor } from './LineChart';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';

interface DataPoint {
    [key: string]: number | string;
}

interface RadarChartProps {
    data: DataPoint[];
    title: string;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, title }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const { color } = useFilterContext()
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
    const valueKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    const categoriesArray = data.map(item => {
        const categoryKey = Object.keys(item).find(key => typeof item[key] === 'string');
        return categoryKey ? item[categoryKey] : '';
    });

   

    const keys = Object.keys(data[0]);

    const hasCategoryKey = keys.some(key => typeof data[0][key] === 'string');

    let indicators = [];
    let series = [];

    if (hasCategoryKey) {
        const categoryKey = keys.find(key => typeof data[0][key] === 'string') || keys[0];
        const metricKey = keys.find(key => typeof data[0][key] === 'number') || '';

        indicators = data.map(item => ({
            name: item[categoryKey],
            max: 100
        }));

        series = [{
            type: 'radar',
            data: [{
                value: data.map(item => item[metricKey]),
                name: metricKey,
                areaStyle: {
                    opacity: 0.3
                },
                label: {
                    show: true,
                    formatter: '{c}%',
                    position: 'inside'
                }
            }],

        }];
    } else {
        indicators = keys.map(key => {
            const value = data[0][key];
            const maxValue = typeof value === 'number'
                ? key.toLowerCase().includes('efficiency')
                    ? 100
                    : Math.ceil(value * 1.5)
                : 100;

            return {
                name: key,
                max: maxValue
            };
        });

        series = [{
            type: 'radar',
            data: [{
                value: keys.map(key => {
                    const value = data[0][key];
                    return typeof value === 'number' ? value : 0;
                }),
                name: title,
                areaStyle: {
                    opacity: 0.3
                },
                label: {
                    show: true,
                    formatter: '{c}%',
                    position: 'inside'
                }
            }],
        }];
    }

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
        tooltip: {
            trigger: 'item'
        },
        radar: {
            indicator: indicators,
            shape: 'circle',
            splitNumber: 5,
            axisName: {
                color: '#999'
            },
            splitLine: {
                lineStyle: {
                    color: [
                        'rgba(238, 197, 102, 0.1)',
                        'rgba(238, 197, 102, 0.2)',
                        'rgba(238, 197, 102, 0.4)',
                        'rgba(238, 197, 102, 0.6)',
                        'rgba(238, 197, 102, 0.8)',
                        'rgba(238, 197, 102, 1)'
                    ].reverse()
                }
            },
            splitArea: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(238, 197, 102, 0.5)'
                }
            }
        },
        series
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const showDetail = () => {
        setIsFlip(!isFlip);
    };

    return (
        <Card
            ref={chartContainerRef}
            style={{ background: color.lightcolor, boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
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
                    {/* <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>



                    {!isModalOpen && (
                        <Tooltip placement='topRight' title='FullScreen'>
                            <FullscreenOutlined onClick={showModal} />
                        </Tooltip>
                    )} */}
                </div>
            }
        >
            <ReactECharts ref={echartsRef} option={option} style={{ height: '300px' }} />
            {/* <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='80%'>
                <ReactECharts option={option} style={{ height: '600px', width: '100%' }} ref={echartsRef} />
                </Modal> */}
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
                                <p>This radar chart visualizes {title.toLowerCase()} metrics across different dimensions, allowing for easy comparison of multiple variables simultaneously.</p>
                                <p>Each axis represents a different metric, with values scaling from the center (0%) to the outer edge (100%).</p>
                                <p><strong>Date Range:</strong> {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p>
                            </div>

                            <Title level={5}>Performance Thresholds</Title>
                            <div style={{ marginBottom: '20px' }}>
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: 'rgba(238, 197, 102, 1)', 
                                            marginRight: '10px' 
                                        }}></div>
                                        <span>Excellent: ≥ 85%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: 'rgba(238, 197, 102, 0.6)', 
                                            marginRight: '10px' 
                                        }}></div>
                                        <span>Good: 70-84%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: 'rgba(238, 197, 102, 0.2)', 
                                            marginRight: '10px' 
                                        }}></div>
                                        <span>Needs Improvement: ≤ 69%</span>
                                    </div>
                                </>
                            </div>

                            <Title level={5}>Statistics</Title>
                            <div>
                                <p><strong>Average:</strong> {
                                    (data.reduce((acc, item) => acc + (Number(item[valueKeys[0]]) || 0), 0) / data.length).toFixed(2)
                                }%</p>
                                <p><strong>Metrics Shown:</strong> {indicators.map(ind => ind.name).join(', ')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default RadarChart;
