import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';

const { Title } = Typography;

const getColor = (tabkey: string) => {
    switch (tabkey) {
        case 'availability':
            return ["#28a745", "#ffc107", "#dc3545"]
        case 'quality':
            return ["#F44336", "#FFEB3B", "#4CAF50"]
        case 'downtime':
            return ["#E74C3C", "#F39C12", "#2ECC71"]
        case 'performance':
            return ["#2E8B57", "#FFAE42", "#B22222"]
        case 'oee':
            return ["#8B0000", "#FFD700", "#008000"]
        default:
            return ["#dc3545", "#ffc107", "#28a745"]
    }
}

const Heatmap = ({ data, xKey, yKey, valueKey, title }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem('activeTabIndex')
    const echartsRef = useRef(null);
    const chartContainerRef = useRef(null);
    const { color } = useFilterContext()
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [categoriesArray, setCategoriesArray] = useState([]);
    const [valueKeys] = useState([valueKey]);

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

    useEffect(() => {
        if (data && data.length > 0) {
            const categories = getUniqueValues(data.map(item => item[xKey]));
            setCategoriesArray(categories);
        }
    }, [data, xKey]);

    const getUniqueValues = (arr) => {
        return arr.filter((value, index, self) => self.indexOf(value) === index);
    };

    const xValues = getUniqueValues(data.map(item => item[xKey]));
    const yValues = getUniqueValues(data.map(item => item[yKey]));

    const processData = () => {
        const xValues = Array.from(new Set(data.map(item => item[xKey])));
        const yValues = Array.from(new Set(data.map(item => item[yKey])));

        return data.map(item => {
            const xIndex = xValues.indexOf(item[xKey]);
            const yIndex = yValues.indexOf(item[yKey]);
            return {
                value: [xIndex, yIndex, item[valueKey]],
                originalX: item[xKey],
                originalY: item[yKey],
                originalValue: item[valueKey]
            };
        });
    };

    const seriesData = processData();

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
        tooltip: {
            position: 'top',
            formatter: (params) => {
                const { data } = params;
                return `${xKey}: ${data.originalX}<br/>` +
                    `${yKey}: ${data.originalY}<br/>` +
                    `${valueKey}: ${data.originalValue}`;
            }
        },
        xAxis: {
            type: 'category',
            data: xValues,
            name: xKey
        },
        yAxis: {
            type: 'category',
            data: yValues,
            name: yKey
        },
        visualMap: {
            min: 0,
            max: Math.max(...data.map(item => item[valueKey])) || 100,
            calculable: true,
            orient: 'horizontal',
            color: getColor(tabkey),
            left: 'center',
            bottom: 'bottom',
        },
        series: [{
            name: valueKey,
            type: 'heatmap',
            data: seriesData,
            colorBy: 'data',
            label: {
                show: true,
            },

        }],
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const showDetail = () => {
        setIsFlip(!isFlip);
    };

    const calculateAverage = () => {
        if (!data || data.length === 0) return 0;
        const validValues = data
            .map(item => Number(item[valueKey]))
            .filter(val => !isNaN(val));
        if (validValues.length === 0) return 0;
        return (validValues.reduce((acc, val) => acc + val, 0) / validValues.length).toFixed(2);
    };

    const getThresholdDescriptions = () => {
        switch (tabkey) {
            case 'availability':
                return "Shows machine availability patterns across different time periods and shifts. Higher values (green) indicate better equipment availability.";
            case 'quality':
                return "Displays product quality metrics over time and shifts. Green areas represent high quality production, while red indicates quality issues.";
            case 'downtime':
                return "Visualizes equipment downtime patterns. Green indicates minimal downtime, while red shows significant operational interruptions.";
            case 'performance':
                return "Maps machine performance efficiency. Dark green represents optimal performance, while red indicates below-target performance levels.";
            case 'oee':
                return "Overall Equipment Effectiveness combining availability, performance, and quality. Green shows high efficiency, red indicates improvement areas.";
            default:
                return "Displays operational metrics across time periods and shifts. Green indicates optimal conditions, while red shows areas needing attention.";
        }
    };

    return (
        <Card
            style={{ background: color.lightcolor, boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
            ref={chartContainerRef}
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

                    <Tooltip placement='topRight' title='FullScreen'>
                        <FullscreenOutlined onClick={showModal} />
                    </Tooltip> */}
                </div>
            }
        >
            <ReactECharts ref={echartsRef} option={option} style={{ height: '300px' }} />
            {/* <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='80%'>
                <ReactECharts option={option} style={{ height: '600px', width: '100%' }} ref={echartsRef} />
                </Modal> */}
            <Modal title={title} visible={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='100%'>
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
                                <p>{getThresholdDescriptions()}</p>
                                <p><strong>Graph Details:</strong> Analysis covers {valueKey} metrics from {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p>
                            </div>

                            <Title level={5}>Performance Thresholds</Title>
                            <div style={{ marginBottom: '20px' }}>
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', backgroundColor: getColor(tabkey)[0], marginRight: '10px' }}></div>
                                        <span>Good: ≥ 85%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', backgroundColor: getColor(tabkey)[1], marginRight: '10px' }}></div>
                                        <span>Warning: 50-84%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', backgroundColor: getColor(tabkey)[2], marginRight: '10px' }}></div>
                                        <span>Critical: ≤ 50%</span>
                                    </div>
                                </>
                            </div>

                            <Title level={5}>Statistics</Title>
                            <div>
                                <p><strong>Average:</strong> {calculateAverage()}</p>
                                {/* <div style={{ width: '50%' }}>
                                    Graph Details
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default Heatmap;
