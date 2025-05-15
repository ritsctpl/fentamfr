import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ScatterPlot = ({ data, xKey, yKey, title }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const echartsRef = useRef(null);
    const chartContainerRef = useRef(null);

    useEffect(() => {
        if (isModalOpen && echartsRef.current) {
            echartsRef.current.getEchartsInstance().resize();
        }
    }, [isModalOpen]);

    const xValues = data.map(item => item[xKey]);
    const yValues = data.map(item => item[yKey]);

    const seriesData = data.map(item => [item[xKey], item[yKey]]);

    const option = {
        toolbox:{
            show:true,
            right:'10%',
            feature:{
              saveAsImage:{
                show:true,
              },
            }
          },
        
        tooltip: {
            trigger: 'item',
            formatter: (params) => {
                return `${params.data[0]}: ${params.data[1]}%`;
            },
        },
        xAxis: {
            type: 'category',
            name: xKey,
            nameLocation: 'middle',
            nameGap: 30,
        },
        yAxis: {
            type: 'value',
            name: yKey,
            nameLocation: 'middle',
            nameGap: 30,
        },
        series: [{
            name: title,
            type: 'scatter',
            data: seriesData,
            symbolSize: 10,
            itemStyle: {
                color: '#1f77b4',
            },
        }],
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    return (
        <Card
            ref={chartContainerRef}
            style={{boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)'}}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
                    <Tooltip placement='topRight' title='FullScreen'>
                        <FullscreenOutlined onClick={showModal} />
                    </Tooltip>
                </div>
            }
        >
            <ReactECharts ref={echartsRef} option={option} style={{ height: '300px' }} />
            <Modal title={title} visible={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='80%'>
                <ReactECharts option={option} style={{ height: '600px', width: '100%' }} ref={echartsRef} />
            </Modal>
        </Card>
    );
};

export default ScatterPlot;
