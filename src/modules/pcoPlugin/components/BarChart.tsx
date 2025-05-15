import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FileSearchOutlined, FullscreenOutlined } from '@ant-design/icons'
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';
import NoDataFound from './NoDataFound';
const { Title } = Typography;


interface DataPoint {
    [key: string]: number | string;
}

interface BarChartProps {
    data: DataPoint[];
    title: string;
    color: any;
    theshold: any;
    unit?: string;
    description?: any
}

const getSeriesColor = (tabkey: string, color, theshold) => {
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

const getColor = (value: number, type: string, key: number, color, theshold) => {
    switch (type) {
        case 'availability':
            if (value < theshold?.[0]) return color?.[2]; // Red for < 60%
            if (value < theshold?.[1]) return color?.[1]; // Yellow for 60-84%
            return color?.[0]; // Green for >= 85%
        case 'quality':
            if (value < theshold?.[0]) return color?.[2];


            if (value < theshold?.[1]) return color?.[1];
            return color?.[0];
        case 'downtime':

            if (value > theshold?.[0]) return color?.[2];

            if (value > theshold?.[1]) return color?.[1];
            return color?.[0];



        case 'performance':
            if (value < theshold?.[0]) return color?.[2]; // Red for < 60%
            if (value < theshold?.[1]) return color?.[1]; // Yellow for 60-84%
            return color?.[0]; // Green for >= 85%



        case 'oee':
            if (value < theshold?.[0]) return color?.[2];
            if (value < theshold?.[1]) return color?.[1];
            return color?.[0];
        default:






            if (value < 50) return "#dc3545";
            if (value < 84) return "#ffc107";
            return "#28a745";
    }
};

const BarChart: React.FC<BarChartProps> = ({ data, title, color, theshold, unit, description }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem('activeTabIndex')
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    // const { color, colors } = useFilterContext()

    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const activeTabIndex = sessionStorage.getItem('activeTabIndex');
    const isDownTime = activeTabIndex?.includes('downtime') ? true : false;

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




    const categoryKey = data && data[0] ? Object.keys(data[0]).find(key => typeof data[0][key] === 'string') : undefined;
    const metricsKeys = data && data[0] ? Object.keys(data[0]).filter(key => key !== categoryKey && typeof data[0][key] === 'number') : [];

    const xAxisData = Array.isArray(data) ? data.map(item => item[categoryKey]) : [];

    if (!data.length) {
        return (
            <Card
                ref={chartContainerRef}

                title={title}
            >
                <NoDataFound />
            </Card>
        );
    }

    const series = Object.keys(data[0] || {})
        .filter(key => key !== 'date')
        .map((key, index) => ({
            name: key,
            type: 'bar',
            data: data.map(item => ({
                value: item[key] ?? 0,
                itemStyle: {
                    color: color?.linecolor[index % color?.linecolor.length]
                }
            })),
            label: {
                show: true,
                position: 'top',
                formatter: (params) => {
                    const value = params.value ?? 0;
                    return isDownTime ? `${value} sec` : unit === 'count' ? `${value}` : `${value}`;
                }
            }
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
        color: color?.linecolor,
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
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params) => {
                return params
                    .map(({ marker, seriesName, value }) => {
                        const displayValue = typeof value === 'object' ? (value.value ?? 0) : (value ?? 0);
                        return `${marker} ${seriesName}: ${displayValue}${isDownTime ? ' sec' : ''}`;
                    })
                    .join('<br />');
            }
        },
        legend: {
            data: Object.keys(data[0] || {}).filter(key => key !== 'date'),
            bottom: 'bottom',
            left: 'center',
        },
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
            // style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}

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
                                <p>{description}</p>
                                <p><strong>Range:</strong> {xAxisData[0]} to {xAxisData[xAxisData.length - 1]}</p>
                            </div>

                            {/* <Title level={5}>Performance Thresholds</Title>
                            <div style={{ marginBottom: '20px' }}>
                                {metricsKeys.length > 1 ? (
                                    <>
                                        {metricsKeys.map((metricKey, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    backgroundColor: color?.[index],
                                                    marginRight: '10px'
                                                }}></div>
                                                <span>{metricKey}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {tabkey === 'availability' && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[0], marginRight: '10px' }}></div>
                                                        <span>Good: ≥ {theshold?.[1]}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[1], marginRight: '10px' }}></div>
                                                        <span>Warning: {theshold?.[0]}-{theshold?.[1] - 1}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[2], marginRight: '10px' }}></div>
                                                        <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                                                    </div>
                                                </>
                                            </div>
                                        )}
                                        {tabkey === 'quality' && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[0], marginRight: '10px' }}></div>
                                                        <span>Good: ≥ {theshold?.[1]}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[1], marginRight: '10px' }}></div>
                                                        <span>Warning: {theshold?.[0]}-{theshold?.[1] - 1}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[2], marginRight: '10px' }}></div>
                                                        <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                                                    </div>
                                                </>
                                            </div>
                                        )}
                                        {tabkey === 'downtime' && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[0], marginRight: '10px' }}></div>
                                                        <span>Good: ≤ {theshold?.[1]}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[1], marginRight: '10px' }}></div>
                                                        <span>Warning: {theshold?.[0]}-{theshold?.[1] - 1}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[2], marginRight: '10px' }}></div>
                                                        <span>Critical: &gt; {theshold?.[0]}%</span>
                                                    </div>
                                                </>
                                            </div>
                                        )}
                                        {tabkey === 'performance' && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[0], marginRight: '10px' }}></div>
                                                        <span>Good: ≥ {theshold?.[1]}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[1], marginRight: '10px' }}></div>
                                                        <span>Warning: {theshold?.[0]}-{theshold?.[1] - 1}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[2], marginRight: '10px' }}></div>
                                                        <span>Critical: &gt; {theshold?.[0]}%</span>
                                                    </div>
                                                </>
                                            </div>
                                        )}
                                        {tabkey === 'oee' && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[0], marginRight: '10px' }}></div>
                                                        <span>Good: ≥ {theshold?.[1]}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[1], marginRight: '10px' }}></div>
                                                        <span>Warning: {theshold?.[0]}-{theshold?.[1] - 1}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', backgroundColor: color?.[2], marginRight: '10px' }}></div>
                                                        <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                                                    </div>
                                                </>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div> */}

                            <Title level={5}>Statistics</Title>
                            <div>
                                <p><strong>Average:</strong> {
                                    (data.reduce((acc, item) => acc + (Number(item[metricsKeys[0]]) || 0), 0) / (data.length || 1)).toFixed(2)
                                }</p>
                                <p><strong>Highest Value:</strong> {
                                    Math.max(...data.map(item => Number(item[metricsKeys[0]]) || 0), 0).toFixed(2)
                                }</p>
                                <p><strong>Lowest Value:</strong> {
                                    Math.min(...data.map(item => Number(item[metricsKeys[0]]) || 0), 0).toFixed(2)
                                }</p>
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
