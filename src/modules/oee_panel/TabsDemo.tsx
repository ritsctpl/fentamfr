import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Button, Card, Col, Modal, Row, Segmented } from 'antd';
import { SunOutlined, MoonOutlined, FullscreenOutlined } from '@ant-design/icons';
import LineCharts from './Charts/LineCharts';
import Barcharts from './Charts/Barcharts';
import PieCharts from './Charts/PieCharts';
import StackCharts from './Charts/StackCharts';
import ParetoCharts from './Charts/ParetoCharts';
import GaugeCharts from './Charts/GaugeCharts';
import AreaCharts from './Charts/AreaCharts';
import HeatMapCharts from './Charts/HeatMapCharts';
import TableChart from './Charts/TableChart';
import { getSampleData } from "@services/oeeServices";
import { useConfigContext } from '@modules/oee_panel/hooks/configData';
import { fetchQueryBuilder } from '@services/queryBuilderService';
import TestGauge from './Charts/TestGauge';
import { FaFilePdf } from "react-icons/fa6";
import { ImSun } from "react-icons/im";
import { PiMoonStarsFill } from "react-icons/pi";
import { AiOutlineFullscreen } from "react-icons/ai";
import { parseCookies } from 'nookies';
import TimeLineChart from './Charts/TimeLineChart';
import TileOee from './Charts/TileOee';
const site = parseCookies()?.site;

function TabsDemo({ themeTogle, setThemeTogle }: any) {
    const { value, getCategories, selectedValues, setSelectedValues } = useConfigContext();
    const categories = useMemo(() => getCategories(), [getCategories]);
    const [chartData, setChartData] = useState<{ [key: string]: any }>({});
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [selectedChart, setSelectedChart] = useState<any>(null);
    const segmentStyle: React.CSSProperties = {
        backgroundColor: '#196087',
        padding: '4px',
        borderRadius: '5px',
        fontWeight: 600,
        color: '#d8d8d8',
    }
    const perValue = useMemo(() => activeCategory.toLowerCase() === 'downtime' ? 'sec' : '%', [activeCategory]);
    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

    const fetchChartData = useCallback(async (dataItem: any) => {
        if (dataItem.query != "" && dataItem.query != null) {
            try {
                const data = await fetchQueryBuilder({
                    templateName: dataItem.query,
                    site: site,
                    filters: { ...selectedValues, site: site }
                });
                setChartData(prev => ({
                    ...prev,
                    [dataItem.dataName]: data
                }));
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        } else {
            try {
                const data = await getSampleData(dataItem.endPoint, selectedValues);
                setChartData(prev => ({
                    ...prev,
                    [dataItem.dataName]: data
                }));
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        }
    }, [selectedValues]);

    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];
        value[0]?.dashBoardDataList.forEach(item => {
            item.data.forEach(dataItem => {
                if (dataItem.enabled && dataItem.seconds) {
                    fetchChartData(dataItem);
                    const interval = setInterval(() => {
                        fetchChartData(dataItem);
                    }, Number(dataItem.seconds) * 1000);

                    intervals.push(interval);
                }
            });
        });

        return () => {
            intervals.forEach(interval => clearInterval(interval));
        };
    }, [value, fetchChartData]);

    const renderChart = useCallback((dataItem: any) => {
        const data = chartData[dataItem.dataName] || [];
        switch (dataItem.type) {
            case 'line':
                return <LineCharts data={data} colorSchema={dataItem?.colorScheme} per={perValue} />;
            case 'timeline':
                return <TimeLineChart data={data} />;
            case 'bar':
                return <Barcharts data={data} colorSchema={dataItem?.colorScheme} per={perValue} />;
            case 'pie':
                return <PieCharts data={data} per={perValue} />;
            case 'stack':
                return <StackCharts data={data} colorSchema={dataItem?.colorScheme} per={perValue} />;
            case 'pareto':
                return <ParetoCharts data={data} colorSchema={dataItem?.colorScheme} per={perValue} />;
            case 'gauge':
                return <TestGauge data={data} colorSchema={dataItem?.colorScheme} />;
            case 'speedGauge':
                return <GaugeCharts data={data} />;
            case 'area':
                return <AreaCharts data={data} colorSchema={dataItem?.colorScheme} per={perValue} />;
            case 'heatmap':
                return <HeatMapCharts data={data} />;
            case 'table':
                return <TableChart data={data} />;
            case 'tile':
                return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{data.map((item: any) => <TileOee data={item} />)}</div>;
            default:
                return null;
        }
    }, [chartData, perValue]);

    const renderContent = useCallback(() => (
        <Row gutter={[16, 16]} style={{ width: '100%', padding: 10, height: 'inherit', display: 'flex', flexWrap: 'wrap' }}>
            {value[0]?.dashBoardDataList
                .filter(item => item.category === activeCategory)
                .map(item => item.data.map(dataItem => (
                    dataItem.enabled && (
                        dataItem.type === 'tile' ?
                            renderChart(dataItem)
                            :
                            <Col key={dataItem.dataName} span={dataItem.column}>
                                <Card
                                    style={{
                                        height: '380px',
                                        boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px'
                                    }}
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{dataItem.dataName}</span>
                                            <AiOutlineFullscreen onClick={() => {
                                                setSelectedChart(dataItem);
                                                setIsModalOpen(true);
                                            }} />
                                        </div>
                                    }
                                >
                                    <div style={{ height: '300px' }}>
                                        {renderChart(dataItem)}
                                    </div>
                                </Card>
                            </Col>
                    )
                )))
            }
        </Row>
    ), [activeCategory, value, renderChart]);

    return (
        <div style={{ width: '100%', height: '100%', padding: 5 }}>
            <Card
                style={{ marginBottom: '5px', height: '8%' }}
                bodyStyle={{
                    padding: '0 16px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    <Segmented
                        options={categories}
                        value={activeCategory}
                        size='middle'
                        onChange={(value) => setActiveCategory(value.toString())}
                    />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button onClick={() => setThemeTogle(!themeTogle)} shape='circle' style={{
                        boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
                        backgroundColor: '#046169',
                        color: 'white'
                    }}><FaFilePdf /></Button>
                    <Button onClick={() => setThemeTogle(!themeTogle)} shape='circle' style={{
                        boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
                        backgroundColor: '#046169',
                        color: 'white'
                    }}>{themeTogle ? <ImSun /> : <PiMoonStarsFill />}</Button>
                </div>
            </Card>
            <div style={{ width: '100%', height: '90%', padding: 25, overflow: 'auto', backgroundColor: '#046169' + 10, borderRadius: 10 }}>
                {renderContent()}
                <Modal
                    title={selectedChart?.name}
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedChart(null);
                    }}
                    width="100%"
                    footer={null}
                    centered
                >
                    <div style={{ height: 'calc(100vh - 100px)' }}>
                        {selectedChart && renderChart(selectedChart)}
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default React.memo(TabsDemo);