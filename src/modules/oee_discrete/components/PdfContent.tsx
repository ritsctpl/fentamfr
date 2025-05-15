// components/PdfContent.js
import React, { use, useEffect, useState } from 'react';
import img1 from '../../../images/Exide.png';
import img2 from '../../../images/FENTA-LOGO-F.png';
import { Row, Col, Progress } from 'antd';
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { useSettingsData } from "@modules/oee_discrete/hooks/settingsData";
import LineChart from "./reuse/LineChart";
import BarChart from "./reuse/BarChart";
import StackedBarChart from "./reuse/StackBar";
import RadarChart from "./reuse/RadarChar";
import TimeByPeriod from "./reuse/TimeByPeriod";
import BarChartQty from "./reuse/BarChartQty";
import TimeLineChart from "./reuse/TimeLineChart";
import AreaChart from "./reuse/AreaChart";
import HeatMap from "./reuse/HeatMap";
import StackedBarChartDynamic from "./reuse/StackBar";
import BarChartPopup from "./reuse/BarChartPopup";
import ParetoChart from "./reuse/ParetoChart";
import PiChart from "./reuse/PiChart";
import SpeedLoss from "./reuse/speedloss";
import DownTimeCard from './reuse/DownTimeCard';
import { parseCookies } from 'nookies';
import { fetchSiteAll } from '@services/siteServices';
import ritsLogo from '@images/rits-logo.png'
import himalaya from '@images/image.png'

const PdfContent = ({ componentIds }) => {

    const [logo, setLogo] = useState<any>(null)
    const [footerLogo, setFooterLogo] = useState<any>(null);

    const convertImageToBase64 = async (imgUrl) => {
        try {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadImages = async () => {
            try {
                // Load header logo
                const cookies = parseCookies();
                const site = cookies.site;
                const response = await fetchSiteAll(site);
                let logoSrc;

                if (response.theme.logo === 'rits-logo.png') {
                    logoSrc = ritsLogo.src;
                } else if (response.theme.logo === 'image.png') {
                    logoSrc = himalaya.src;
                } else {
                    logoSrc = response.theme.logo;
                }

                const base64Logo = await convertImageToBase64(logoSrc);
                setLogo(base64Logo);

                // Load footer logo
                const footerBase64 = await convertImageToBase64(img2.src);
                setFooterLogo(footerBase64);
            } catch (error) {
                console.error('Error loading images:', error);
            }
        };
        loadImages();
    }, []);


    // useEffect(() => {
    //     const loadLogo = async () => {
    //         try {
    //             const cookies = parseCookies();
    //             const site = cookies.site;
    //             const response = await fetchSiteAll(site);
    //             let logoSrc;

    //             if (response.theme.logo === 'rits-logo.png') {
    //                 logoSrc = ritsLogo.src;
    //             } else if (response.theme.logo === 'image.png') {
    //                 logoSrc = himalaya.src;
    //             } else {
    //                 logoSrc = response.theme.logo;
    //             }

    //             const base64Logo = await convertImageToBase64(logoSrc);
    //             setLogo(base64Logo);
    //         } catch (error) {
    //             console.error('Error loading logo:', error);
    //         }
    //     };
    //     loadLogo();
    // }, []);

    const { overallOeeData, performanceOeeData, availabilityOeeData, downtimeOeeData, qualityOeeData, color } = useFilterContext();
    const { filterColors } = useSettingsData();

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        color: '#124561',
        width: '100%',
        height: '56px',
        backgroundColor: '#fff',
        borderBottom: `1px solid red`,
    };

    const footerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        height: '40px',
        width: '100%',
        marginBottom: '10px',
        marginTop: '10px',
        boxSizing: 'border-box',
    };

    const pageStyle: React.CSSProperties = {
        minHeight: '295mm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: '20px',
        padding: '20px',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
    };

    const chartContainerStyle: React.CSSProperties = {
        marginBottom: '40px', // Increased margin for better separation
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '800px', // Minimum height for charts
    };

    const singleChartStyle: React.CSSProperties = {
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        marginBottom: '30px',
        minHeight: '350px', // Minimum height for single charts
        height: '100%',
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        // gap: '24px',
        marginBottom: '30px',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        alignItems: 'stretch',
        maxWidth: '100%'
    };

    const layoutStyle: React.CSSProperties = {
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: 'none'
    };

    const overallOee = overallOeeData?.getOverall?.percentage || 0;
    const overallPerformance = performanceOeeData?.getOverall?.percentage || 0;
    const overallAvailability = availabilityOeeData?.getOverall?.percentage || 0;
    const overallQuality = qualityOeeData?.getOverall?.percentage || 0;

    const getColorByPercentage = (value: number) => {
        if (value >= 85) return "#52c41a"; // Green for good
        if (value >= 60) return "#faad14"; // Yellow for warning
        return "#f5222d"; // Red for poor
    };

    return (
        <div style={layoutStyle} id="pdf-content">

            {componentIds.length > 0 && (
                <div style={headerStyle}>
                    {logo && (
                        <img
                            src={logo}
                            alt="Company Logo"
                            style={{
                                width: '10%',
                                height: '40px',
                                objectFit: 'contain'
                            }}
                            crossOrigin="anonymous"
                        />
                    )}
                    <h1 style={{
                        marginBottom: '0px',
                        flex: 0.9,
                        textAlign: 'center',
                        color: '#124561'
                    }}>OEE REPORT</h1>
                </div>
            )}

            {componentIds.includes('oee') && (
                <div id="oee" style={pageStyle}>
                    <div style={chartContainerStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1 style={{ margin: '0', textAlign: 'start', color: '#124561' }}>OEE</h1>
                            <Row gutter={[16, 16]} style={rowStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        background: "#fff",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                        marginRight: "12px",
                                        minWidth: "340px",
                                    }}
                                >
                                    <div style={{ fontWeight: "500", fontSize: "13px", color: "#666" }}>
                                        Overall OEE
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Progress
                                            percent={Number(overallOee.toFixed(1))}
                                            size="small"
                                            strokeColor={{
                                                "0%": getColorByPercentage(overallOee),
                                                "100%": getColorByPercentage(overallOee),
                                            }}
                                            format={(percent) => `${percent}%`}
                                        />
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <Row gutter={[12, 12]} style={rowStyle}>
                            <Col span={24} style={singleChartStyle}>
                                <LineChart
                                    title={"OEE Over Time"}
                                    data={overallOeeData?.oeeOverTime || []}
                                    color={filterColors.oeeOverTime}
                                    description={"A line chart tracking OEE over time"}
                                />
                            </Col>

                            <Col span={24} style={singleChartStyle}>
                                <LineChart
                                    title={"OEE Component Trend Over Time"}
                                    data={overallOeeData?.oeeByComponent || []}
                                    color={filterColors.oeeByComponent}
                                    description={"The OEE Component Trend Over Time chart"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <BarChart
                                    title={"OEE by Machine"}
                                    data={overallOeeData?.oeeByMachine || []}
                                    color={filterColors.oeeByMachine.itemcolor}
                                    theshold={filterColors.oeeByMachine.threshold}
                                    description={"A bar chart displaying OEE by Machine"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChart
                                    data={overallOeeData?.oeeByShift || []}
                                    title="OEE by Shift"
                                    color={filterColors.oeeByShift.itemcolor}
                                    description={"The OEE by Shift chart"}
                                />
                            </Col>

                            <Col span={24} style={singleChartStyle}>
                                <BarChart
                                    title={"OEE Breakdown"}
                                    data={overallOeeData?.oeeBreakdown || []}
                                    color={filterColors?.oeeBreakdown?.itemcolor}
                                    theshold={filterColors?.oeeBreakdown?.threshold}
                                    description={"The OEE Breakdown chart"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <RadarChart
                                    data={overallOeeData?.oeeByProductionLine || []}
                                    title="OEE by Production Line"
                                    description={"The OEE by Production Line radar chart"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChart
                                    title="OEE by Product"
                                    data={overallOeeData?.oeeByProduct || []}
                                    color={filterColors?.oeeByProduct?.itemcolor}
                                    description={"The OEE by Product chart"}
                                />
                            </Col>

                            {/* <Col span={24} style={singleChartStyle}>
                                <TimeByPeriod
                                    historicalData={overallOeeData?.oeeTimePeriodData?.oeeData || []}
                                    type="oee"
                                />
                            </Col> */}
                        </Row>
                    </div>
                </div>
            )}

            {componentIds.includes('performance') && (
                <div id="performance" style={pageStyle}>
                    <div style={chartContainerStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1 style={{ margin: '0', textAlign: 'start', color: '#124561' }}>PERFORMANCE</h1>
                            <Row gutter={[16, 16]} style={rowStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        background: "#fff",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                        marginRight: "12px",
                                        minWidth: "340px",
                                    }}
                                >
                                    <div style={{ fontWeight: "500", fontSize: "13px", color: "#666" }}>
                                        Overall Performance
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Progress
                                            percent={Number(overallPerformance.toFixed(1))}
                                            size="small"
                                            strokeColor={{
                                                "0%": getColorByPercentage(overallPerformance),
                                                "100%": getColorByPercentage(overallPerformance),
                                            }}
                                            format={(percent) => `${percent}%`}
                                        />
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <Row gutter={[12, 12]} style={rowStyle}>
                            <Col span={24} style={singleChartStyle}>
                                <LineChart
                                    data={performanceOeeData?.performanceOverTime || []}
                                    title={"Performance Over Time"}
                                    color={filterColors.performanceOverTime}
                                    description={"Tracks performance trends over time"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <BarChart
                                    data={performanceOeeData?.performanceByShift || []}
                                    title="Performance by Shift"
                                    color={filterColors.performanceByShift.itemcolor}
                                    theshold={filterColors.performanceByShift.threshold}
                                    description={"Compares performance metrics across different shifts"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <PiChart
                                    data={performanceOeeData?.performanceByMachine || []}
                                    title="Performance By Machine"
                                    color={filterColors.performanceByMachine.itemcolor}
                                    description={"Shows the distribution of performance across different machines"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChart
                                    data={performanceOeeData?.performanceByProductionLine || []}
                                    title="Performance by Production Line"
                                    color={filterColors.performanceByProductionLine.itemcolor}
                                    description={"Breaks down performance metrics by production line"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChart
                                    title={"Performance Efficiency by Product"}
                                    data={performanceOeeData?.performanceByProduct || []}
                                    color={filterColors.performanceByProductionLine?.itemcolor}
                                    description={"Analyzes performance efficiency for different products"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <ParetoChart
                                    data={performanceOeeData?.performanceDowntimeAnalysis || []}
                                    title="Performance Downtime Analysis"
                                    color={filterColors.performanceLossReasons}
                                    description={"Shows the relationship between performance and downtime events"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <ParetoChart
                                    data={performanceOeeData?.performanceLossReason || []}
                                    title="Performance Loss Reasons"
                                    color={filterColors.performanceLossReasons}
                                    description={"Analyzes the reasons for performance losses"}
                                />
                            </Col>

                            {performanceOeeData?.getSpeedLossByWorkcenter && performanceOeeData.getSpeedLossByWorkcenter.length > 0 && (
                                <Col span={24} style={singleChartStyle}>
                                    <h3>Speed Loss by Workcenter</h3>
                                    <Row gutter={[16, 16]}>
                                        {performanceOeeData.getSpeedLossByWorkcenter.map((item: { speedLoss: any; workcenterId: any; }, index: React.Key) => (
                                            <Col xs={24} sm={12} md={8} key={index}>
                                                <SpeedLoss
                                                    data={[{ value: Number(item.speedLoss) || 0 }]}
                                                    title={item?.workcenterId || 'Unknown Workcenter'}
                                                    color={color}
                                                    type={"downtimeByWorkcenter"}
                                                    description={`Speed metrics for ${item?.workcenterId || 'Unknown Workcenter'}`}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Col>
                            )}

                            {performanceOeeData?.getSpeedLossByResource && performanceOeeData.getSpeedLossByResource.length > 0 && (
                                <Col span={24} style={singleChartStyle}>
                                    <h3>Speed Loss by Resource</h3>
                                    <Row gutter={[16, 16]}>
                                        {performanceOeeData.getSpeedLossByResource.map((item: { speedLoss: any; resourceId: any; }, index: React.Key) => (
                                            <Col xs={24} sm={12} md={8} key={index}>
                                                <SpeedLoss
                                                    data={[{ value: Number(item.speedLoss) || 0 }]}
                                                    title={item?.resourceId || 'Unknown Resource'}
                                                    color={color}
                                                    type={"downtimeByMachine"}
                                                    description={`Speed metrics for ${item?.resourceId || 'Unknown Resource'}`}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Col>
                            )}

                            {/* <Col span={24} style={singleChartStyle}>
                                <TimeByPeriod
                                    historicalData={performanceOeeData?.performanceTimePeriodData?.performancedata || []}
                                    type="performance"
                                />
                            </Col> */}
                        </Row>
                    </div>
                </div>
            )}

            {componentIds.includes('availability') && (
                <div id="availability" style={pageStyle}>
                    <div style={chartContainerStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1 style={{ margin: '0', textAlign: 'start', color: '#124561' }}>AVAILABILITY</h1>
                            <Row gutter={[16, 16]} style={rowStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        background: "#fff",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                        marginRight: "12px",
                                        minWidth: "340px",
                                    }}
                                >
                                    <div style={{ fontWeight: "500", fontSize: "13px", color: "#666" }}>
                                        Overall Availability
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Progress
                                            percent={Number(overallAvailability.toFixed(1))}
                                            size="small"
                                            strokeColor={{
                                                "0%": getColorByPercentage(overallAvailability),
                                                "100%": getColorByPercentage(overallAvailability),
                                            }}
                                            format={(percent) => `${percent}%`}
                                        />
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <Row gutter={[12, 12]} style={rowStyle}>
                            <Col span={24} style={singleChartStyle}>
                                <LineChart
                                    color={filterColors.availabilityOverTime}
                                    data={availabilityOeeData?.availabilityOverTime || []}
                                    title={"Availability Over Time"}
                                    description={
                                        "Tracks equipment availability trends over time. This chart helps identify long-term patterns, seasonal variations, and the impact of improvement initiatives on equipment availability."
                                    }
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <BarChart
                                    color={filterColors.availabilityByShift.itemcolor}
                                    data={availabilityOeeData?.availabilityByShift || []}
                                    title={"Availability by Shift"}
                                    theshold={filterColors.availabilityByShift.threshold}
                                    description={
                                        "Compares equipment availability across different shifts. This visualization helps identify patterns in equipment utilization and potential scheduling improvements between shifts."
                                    }
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <BarChart
                                    data={availabilityOeeData?.availabilityByMachine || []}
                                    title={"Availability by Machine"}
                                    color={filterColors.availabilityByMachine.itemcolor}
                                    theshold={filterColors.availabilityByMachine.threshold}
                                    description={
                                        "Shows availability metrics for different machines. This helps identify which equipment might be experiencing more downtime or requiring additional maintenance attention."
                                    }
                                />
                            </Col>

                            <Col span={24} style={singleChartStyle}>
                                <ParetoChart
                                    data={availabilityOeeData?.availabilityByDowntime || []}
                                    title={"Availability Downtime Pareto"}
                                    color={filterColors.availabilityByMachine}
                                    description={
                                        "A Pareto analysis of downtime causes affecting availability. This helps prioritize improvement efforts by identifying the vital few issues causing the majority of availability losses."
                                    }
                                />
                            </Col>

                            {/* <Col span={24} style={singleChartStyle}>
                                <TimeByPeriod
                                    historicalData={availabilityOeeData?.availabilityTimePeriodData?.availabilitydata || []}
                                    type="availability"
                                />
                            </Col> */}

                        </Row>
                    </div>
                </div>
            )}

            {componentIds.includes('quality') && (
                <div id="quality" style={pageStyle}>
                    <div style={chartContainerStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1 style={{ margin: '0', textAlign: 'start', color: '#124561' }}>QUALITY</h1>
                            <Row gutter={[16, 16]} style={rowStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        background: "#fff",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                        marginRight: "12px",
                                        minWidth: "340px",
                                    }}
                                >
                                    <div style={{ fontWeight: "500", fontSize: "13px", color: "#666" }}>
                                        Overall Quality
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Progress
                                            percent={Number(overallQuality.toFixed(1))}
                                            size="small"
                                            strokeColor={{
                                                "0%": getColorByPercentage(overallQuality),
                                                "100%": getColorByPercentage(overallQuality),
                                            }}
                                            format={(percent) => `${percent}%`}
                                        />
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <Row gutter={[12, 12]} style={rowStyle}>
                            <Col span={24} style={singleChartStyle}>
                                <LineChart
                                    data={qualityOeeData?.qualityOverTime || []}
                                    title={"Quality Over Time"}
                                    color={filterColors.qualityOverTime}
                                    description={"Tracks quality trends over time"}
                                />
                            </Col>
                            <Col span={24} style={singleChartStyle}>
                                <LineChart
                                    data={qualityOeeData?.defectTrendOverTime || []}
                                    title={"Defect Trend Over Time"}
                                    type="count"
                                    color={filterColors.defectTrendOverTime}
                                    description={"Shows how defect rates change over time"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <BarChart
                                    data={qualityOeeData?.qualityByShift || []}
                                    title={"Quality by Shift"}
                                    color={filterColors.qualityByShift.itemcolor}
                                    theshold={filterColors.qualityByShift.threshold}
                                    description={"Compares quality metrics across different shifts"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <PiChart
                                    data={qualityOeeData?.qualityByMachine || []}
                                    title={"Quality by Machine"}
                                    color={filterColors.qualityByMachine.itemcolor}
                                    description={"Shows the distribution of quality metrics across different machines"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChart
                                    data={qualityOeeData?.qualityLossByProductionLine || []}
                                    title={"Quality Loss by Production Line"}
                                    color={filterColors.qualityLossByProductionLine.itemcolor}
                                    description={"Shows quality losses across different production lines"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <BarChartQty
                                    data={qualityOeeData?.goodQualityVsBadQuality || []}
                                    title={"Good Quantity Vs Bad Quantity Against Resource"}
                                    color={filterColors.goodQualityVsBadQuality?.itemcolor}
                                    theshold={filterColors.goodQualityVsBadQuality?.threshold}
                                    unit="count"
                                    description={"Compares the quantity of good versus defective products by resource"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChart
                                    data={qualityOeeData?.qualityByProduct || []}
                                    title={"Quality by Product"}
                                    color={filterColors.qualityByProduct.itemcolor || []}
                                    description={"Breaks down quality metrics by product type"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <PiChart
                                    data={qualityOeeData?.defectDistributionByProduct || []}
                                    title={"Defect Distribution by Product"}
                                    color={filterColors.defectDistributionByProduct.itemcolor}
                                    description={"Visualizes how defects are distributed across different products"}
                                />
                            </Col>

                            <Col span={24} style={singleChartStyle}>
                                <ParetoChart
                                    data={qualityOeeData?.defectsByReason || []}
                                    title={"Defects by Reason"}
                                    color={filterColors.defectsByReason}
                                    description={"A Pareto analysis of defect causes"}
                                />
                            </Col>
                            <Col span={24} style={singleChartStyle}>
                                <LineChart
                                    data={qualityOeeData?.scrapReworkTrend || []}
                                    title={"Scrap and Rework Trend"}
                                    color={filterColors.scrapReworkTrend}
                                    description={"Tracks trends in scrap and rework rates over time"}
                                />
                            </Col>

                            {/* <Col span={24} style={singleChartStyle}>
                                <TimeByPeriod
                                    historicalData={qualityOeeData?.qualityTimePeriodData?.qualitydata || []}
                                    type="quality"
                                />
                            </Col> */}

                        </Row>
                    </div>
                </div>
            )}

            {componentIds.includes('downtime') && (
                <div id="downtime" style={pageStyle}>
                    <div style={chartContainerStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1 style={{ margin: '0', textAlign: 'start', color: '#124561' }}>DOWNTIME</h1>
                            <Row gutter={[16, 16]} style={rowStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        background: "#fff",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                        marginRight: "12px",
                                        minWidth: "340px",
                                    }}
                                >
                                    <div style={{ fontWeight: "500", fontSize: "13px", color: "#666" }}>
                                        Overall Downtime
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <DownTimeCard />
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <Row gutter={[12, 12]} style={rowStyle}>
                            <Col span={24} style={singleChartStyle}>
                                <TimeLineChart
                                    title={"Downtime Over Time"}
                                    data={downtimeOeeData?.downtimeOverTime || []}
                                />
                            </Col>

                            <Col span={24} style={singleChartStyle}>
                                <AreaChart
                                    color={filterColors.oeeOverTime}
                                    data={downtimeOeeData?.cumulativeDowntime || []}
                                    title={"Cumulative Downtime"}
                                    description={"Displays the accumulation of downtime over a period"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <PiChart
                                    data={downtimeOeeData?.downtimeByReason || []}
                                    title={"Downtime by Reason"}
                                    color={filterColors.downtimeByReason.itemcolor}
                                    description={"Breaks down downtime events by their root causes"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <BarChart
                                    data={downtimeOeeData?.downtimeByMachine || []}
                                    title={"Downtime By Machine"}
                                    color={filterColors.downtimeByMachine.itemcolor}
                                    theshold={filterColors.downtimeByMachine.threshold}
                                    description={"Compares downtime across different machines or equipment"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChartDynamic
                                    data={downtimeOeeData?.downtimeByShift || []}
                                    title={"Downtime by Reason and Shift"}
                                    color={filterColors.downtimeByReasonAndShift.itemcolor}
                                    description={"Shows how different types of downtime events distribute across shifts"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <HeatMap
                                    data={downtimeOeeData?.downtimeAnalysis || []}
                                    xKey={"reason"}
                                    yKey={"machine"}
                                    valueKey={"occurrences"}
                                    title={"Downtime Analysis"}
                                    description={"A heat map showing the relationship between machines and downtime reasons"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <BarChartPopup
                                    data={downtimeOeeData?.downtimeByWorkCenter || []}
                                    title={'Downtime By Workcenter'}
                                    color={filterColors.downtimeByMachine.itemcolor}
                                    theshold={filterColors.downtimeByMachine.threshold}
                                    type={"workcenter"}
                                    description={"Compares downtime across different work centers"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <PiChart
                                    data={downtimeOeeData?.downtimeByMachineWC || []}
                                    title={'Downtime By Machine'}
                                    color={filterColors.downtimeByMachine.itemcolor}
                                    description={"Shows machine-specific downtime"}
                                />
                            </Col>

                            <Col span={12} style={singleChartStyle}>
                                <StackedBarChart
                                    data={downtimeOeeData?.downtimeByReasonMachine || []}
                                    title={'Downtime By Resource And Interval'}
                                    color={filterColors?.qualityByMachine?.itemcolor}
                                    theshold={filterColors.downtimeByMachine.threshold}
                                    description={"Displays downtime reasons for the selected machine"}
                                />
                            </Col>
                            <Col span={12} style={singleChartStyle}>
                                <ParetoChart
                                    data={downtimeOeeData?.detailedAnalysisReason || []}
                                    title="Downtime By Reason Code"
                                    threshold={filterColors.performanceLossReasons}
                                    color={filterColors.performanceLossReasons}
                                    description={"Shows the relationship between performance and downtime events"}
                                />
                            </Col>

                        </Row>
                    </div>
                </div>
            )}

            {componentIds.length > 0 && (
                <div style={footerStyle}>
                    <img
                        src={footerLogo || img2.src}
                        alt="RITS Logo"
                        style={{
                            width: '10%',
                            height: '60px',
                            objectFit: 'contain'
                        }}
                        crossOrigin="anonymous"
                    />
                    {/* <h6 style={{ color: 'gray', marginBottom: '0px' }}>
                        All Rights Reserved by Fenta Powered by Rits
                    </h6> */}
                </div>
            )}
        </div>
    )
}

export default PdfContent;
