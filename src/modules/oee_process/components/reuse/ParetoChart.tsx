import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Typography, Tooltip, Modal, Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import { getColor } from './LineChart';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';

const { Title } = Typography;

interface DataPoint {
    [key: string]: any;
}

interface ParetoChartProps {
    data: DataPoint[];
    title: string;
    color:any;
}

const ParetoChart: React.FC<ParetoChartProps> = ({ data, title,color }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem('activeTabIndex')
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    // const { color, colors } = useFilterContext()
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);

    // Early data validation
    const isDataValid = data && data.length > 0 && data[0];
    
    // Move all data processing here, before any hooks
    const categoryKey = isDataValid ? Object.keys(data[0]).find(key => typeof data[0][key] === 'string') : null;
    const lossPercentageKey = isDataValid ? Object.keys(data[0]).find(key => typeof data[0][key] === 'number') : null;
    const cumulativePercentageKey = isDataValid ? Object.keys(data[0]).find(key =>
        typeof data[0][key] === 'number' && key !== lossPercentageKey
    ) : null;

    const categoriesArray = isDataValid ? data.map(item => item[categoryKey] || '') : [];
    const valueKeys = isDataValid ? Object.keys(data[0]).filter(key => typeof data[0][key] === 'number') : [];

    // Add these threshold values near the top of your component
    const thresholds = {
        good: 85,
        warning: 50,
        critical: 0
    };

    // Hooks moved before any conditional returns
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

        // Store ref value in a variable
        const currentRef = chartContainerRef.current;

        if (currentRef) {
            resizeObserver.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                resizeObserver.unobserve(currentRef);
            }
        };
    }, [data]);

    // Now we can safely do our conditional returns
    if (!isDataValid) {
        return  <Card style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data available</Card>;
    }

    if (!categoryKey || !lossPercentageKey || !cumulativePercentageKey) {
        return <div>Error: Required keys not found in the data.</div>;
    }

    const sortedData = [...data].sort((a, b) => b[lossPercentageKey] - a[lossPercentageKey]);

    const maxLossPercentage = Math.max(...sortedData.map(item => item[lossPercentageKey]));
    const yAxisMax = Math.ceil(maxLossPercentage / 10) * 10;

    const option = {
        toolbox: {
            show: true,
            right: '10%',
            feature: {
                saveAsImage: {
                    show: true,
                },
            }
        },
        // color:colors,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
        },
        legend: {
            data: [
                {
                    name: lossPercentageKey,
                    itemStyle: {
                        color: getColor(maxLossPercentage, tabkey,color)
                    }
                },
                'Cumulative Percentage'
            ],
            bottom: 'bottom',
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: sortedData.map(item => item[categoryKey]),
                axisLabel: {
                    rotate: sortedData.length > 5 ? 25 : 0,
                    interval: 0,
                    textStyle: {
                        fontSize: 9
                    }
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                name: lossPercentageKey,
                min: 0,
                max: yAxisMax,
                interval: yAxisMax / 5,
                axisLabel: {
                    formatter: '{value}',
                },
            },
            {
                type: 'value',
                name: 'Percentage',
                min: 0,
                max: 100,
                interval: 20,
                axisLabel: {
                    formatter: '{value}%',
                },
            },
        ],
        series: [
            {
                name: lossPercentageKey,
                type: 'bar',
                data: sortedData.map(item => item[lossPercentageKey]),
                itemStyle: {
                    color: (params) => {
                        const currentValue = sortedData[params.dataIndex][lossPercentageKey];
                        return getColor(currentValue, tabkey,color);
                    }
                },
                colorBy: 'data',
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 12
                },
            },
            {
                name: 'Cumulative Percentage',
                type: 'line',
                yAxisIndex: 1,
                data: sortedData.map(item => item[cumulativePercentageKey]),
                colorBy: 'data',
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}%',
                    fontSize: 12
                },
            },
        ],
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
                                <p>This Pareto chart visualizes the frequency of different types of losses or issues, arranged in descending order.</p>
                                <p>The cumulative line helps identify which issues to prioritize for maximum impact on overall improvement.</p>
                            </div>

                            <Title level={5}>Chart Information</Title>
                            <div style={{ marginBottom: '20px' }}>
                                <p><strong>Total Categories:</strong> {categoriesArray.length}</p>
                                <p><strong>Highest Value:</strong> {Math.max(...data.map(item => item[lossPercentageKey])).toFixed(2)}%</p>
                                <p><strong>Lowest Value:</strong> {Math.min(...data.map(item => item[lossPercentageKey])).toFixed(2)}%</p>
                            </div>

                            <Title level={5}>Performance Thresholds</Title>
                            <div style={{ marginBottom: '20px' }}>
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: getColor(85, tabkey,color), 
                                            marginRight: '10px' 
                                        }}></div>
                                        <span>Good: ≥ 85%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: getColor(60, tabkey,color), 
                                            marginRight: '10px' 
                                        }}></div>
                                        <span>Warning: 50-84%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: getColor(40, tabkey,color), 
                                            marginRight: '10px' 
                                        }}></div>
                                        <span>Critical: ≤ 50%</span>
                                    </div>
                                </>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default ParetoChart;
