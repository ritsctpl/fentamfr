import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { AiOutlineClose, AiOutlineFileSearch, AiOutlineFullscreen, AiOutlineInfoCircle } from 'react-icons/ai';
import { FileSearchOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';
import { CloseOutlined } from '@mui/icons-material';
import NoDataFound from './NoDataFound';

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

const Heatmap = ({ data, xKey, yKey, valueKey, title, description }) => {

    console.log(data, "heapData")

    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem('activeTabIndex')
    const echartsRef = useRef(null);
    const chartContainerRef = useRef(null);
    const { color } = useFilterContext()
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [categoriesArray, setCategoriesArray] = useState([]);
    const [valueKeys] = useState([valueKey]);
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

    useEffect(() => {
        if (data && data.length > 0) {
            const categories = getUniqueValues(Array.isArray(data) ? data.map(item => item[xKey]) : []);
            setCategoriesArray(categories);
        }
    }, [data, xKey]);

    const getUniqueValues = (arr) => {
        return arr.filter((value, index, self) => self.indexOf(value) === index);
    };

    const xValues = getUniqueValues(Array.isArray(data) ? data.map(item => item[xKey]) : []);
    const yValues = getUniqueValues(Array.isArray(data) ? data.map(item => item[yKey]) : []);


    const processData = () => {
        const xValues = Array.from(new Set(Array.isArray(data) ? data.map(item => item[xKey]) : []));
        const yValues = Array.from(new Set(Array.isArray(data) ? data.map(item => item[yKey]) : []));

        if (!Array.isArray(data)) {
            return [];
        }

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
            right: '2%',
            top: '2%',
            feature: {
                saveAsImage: {
                    show: true,
                    title: 'Save',
                    pixelRatio: 2
                },
            }
        },
        grid: {
            left: '2%',
            right: '5%',
            top: '10%',
            bottom: '10%',
            containLabel: true
        },
        tooltip: {
            position: 'top',
            formatter: (params) => {
                const { data } = params;
                return `${xKey}: ${data?.originalX}<br/>` +
                    `${yKey}: ${data?.originalY}<br/>` +
                    `${valueKey}: ${data?.originalValue}`;
            },
            textStyle: {
                fontSize: 12
            }
        },
        xAxis: {
            type: 'category',
            data: Array.isArray(xValues) ? xValues : [],
            nameGap: 35,
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 10,
                overflow: 'truncate'
            }
        },
        yAxis: {
            type: 'category',
            data: Array.isArray(yValues) ? yValues : [],
            nameGap: 50,
            axisLabel: {
                fontSize: 10,
                overflow: 'truncate'
            }
        },
        visualMap: {
            min: 1,
            max: Math.max(...Array.isArray(data) ? data.map(item => item[valueKey]) : []) || 100,
            calculable: true,
            orient: 'horizontal',
            color: getColor(tabkey),
            left: 'center',
            bottom: '2%',
            itemWidth: 15,
            itemHeight: 100,
            textStyle: {
                fontSize: 10
            }
        },
        series: [{
            name: valueKey,
            type: 'heatmap',
            data: Array.isArray(seriesData) ? seriesData : [],
            colorBy: 'data',
            label: {
                show: true,
                fontSize: 10,
                formatter: (params) => {
                    return params.data.originalValue;
                }
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
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
            style={{
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px'
            }}
            ref={chartContainerRef}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <AiOutlineFullscreen onClick={showDetail} />
                    </div>
                </div>
            }
            bodyStyle={{ padding: '12px', height: 'calc(100% - 57px)' }}
        >
            {data.length === 0 ? (
                <NoDataFound />
            ) : (
                <ReactECharts
                    ref={echartsRef}
                    option={option}
                    style={{
                        height: '100%',
                        minHeight: '300px',
                        width: '100%'
                    }}
                    opts={{
                        renderer: 'canvas',
                        devicePixelRatio: window.devicePixelRatio
                    }}
                />
            )}

            <Modal
                title={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    
                    }}>
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>{title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Button
                                type="text"
                                icon={<AiOutlineInfoCircle style={{ fontSize: '20px' }} />}
                                onClick={() => setOpen(prev => !prev)}
                            />
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={() => setIsFlip(false)}
                            />
                        </div>
                    </div>
                }
                visible={isFlip}
                centered
                closable={false}
                footer={null}
                width="90vw"
                bodyStyle={{
                    padding: 0,
                    height: 'calc(90vh - 108px)',
                    overflow: 'hidden'
                }}
            // style={{ top: '5vh' }}
            >
                <div style={{
                    display: 'flex',
                    height: '100%',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        width: open ? '70%' : '100%',
                        height: '100%',
                        transition: 'width 0.3s ease'
                    }}>
                        <ReactECharts
                            option={option}
                            ref={echartsRef}
                            style={{
                                height: '100%',
                                width: '100%'
                            }}
                            opts={{
                                renderer: 'canvas',
                                devicePixelRatio: window.devicePixelRatio
                            }}
                        />
                    </div>
                    {open && (
                        <div style={{
                            width: '30%',
                            height: '100%',
                            padding: '24px',
                            borderLeft: '1px solid #f0f0f0',
                            overflow: 'auto',
                            backgroundColor: '#fff'
                        }}>
                            <Title level={5}>Graph Details</Title>
                            <div style={{ marginBottom: '24px' }}>
                                <p><strong>Description:</strong></p>
                                <p style={{ color: '#666' }}>{getThresholdDescriptions()}</p>
                                <p style={{ color: '#666' }}><strong>Analysis Period:</strong> {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p>
                            </div>

                            <Title level={5}>Performance Thresholds</Title>
                            <div style={{ marginBottom: '24px' }}>
                                {getColor(tabkey).map((color, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: color,
                                            marginRight: '10px',
                                            borderRadius: '4px'
                                        }}></div>
                                        <span style={{ color: '#666' }}>
                                            {index === 0 && 'Good: ≥ 85%'}
                                            {index === 1 && 'Warning: 50-84%'}
                                            {index === 2 && 'Critical: ≤ 50%'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Title level={5}>Statistics</Title>
                            <div style={{ color: '#666' }}>
                                <p><strong>Average {valueKey}:</strong> {calculateAverage()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default Heatmap;

