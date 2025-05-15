// components/PdfContent.js
import Availability from '@modules/oee_process/components/availabilityComponents/Availability';
import DownTime from '@modules/oee_process/components/DownTime';
import LiveOee from '@modules/oee_process/components/liveOee/LiveOee';
import OeeScreen from '@modules/oee_process/components/oee/OeeMainScreen';
import QualityScreen from '@modules/oee_process/components/qualityDashBoard/QualityMainScreen';
import Performance from '@modules/oee_process/components/Performance';
import React, { useEffect, useState } from 'react';
import img1 from '../../../images/Exide.png';
import img2 from '../../../images/FENTA-LOGO-F.png';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';


const PdfContent = ({ componentIds }) => {

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        color: '#0c4da2',
        width: '100%',
        height: '56px',
        backgroundColor: '#fff',
        borderBottom: `1px solid red`,
    };

    const contentStyle: React.CSSProperties = {
        textAlign: 'center',
        minHeight: 'calc(100% - 128px)',
        lineHeight: '120px',
        color: '#fff',
        backgroundColor: '#0958d9',
        padding: '20px',
        boxSizing: 'border-box',
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

    const layoutStyle: React.CSSProperties = {
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
    };

    const pageStyle: React.CSSProperties = {
        minHeight: '295mm', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    };

    return (
        <div style={layoutStyle}>
            {componentIds.includes('live oee') && (
                <div id="live oee" style={pageStyle}>
                    <div>
                        <div style={headerStyle}>
                            <img src={img1.src} alt="RITS Logo" style={{ width: '10%', height: '100%' }} />
                            <h1 style={{ marginBottom: '0px' }}>OEE Metrics and Analysis</h1>
                        </div>
                        <h1>Live OEE</h1>
                        <LiveOee />
                    </div>
                    <div>
                        <div style={footerStyle}>
                            <img src={img2.src} alt="RITS Logo" style={{ width: '10%', height: '60px' }} />
                            <h6 style={{ color: 'gray', marginBottom: '0px' }}>All Rights Reserved by Fenta Powered by Rits</h6>
                        </div>
                        <p>Page - 1</p>
                    </div>
                </div>
            )}
            {componentIds.includes('oee') && (
                <div id="oee" style={pageStyle}>
                    <div>
                        <div style={headerStyle}>
                            <img src={img1.src} alt="RITS Logo" style={{ width: '10%', height: '100%' }} />
                            <h1 style={{ marginBottom: '0px' }}>OEE REPORT</h1>
                        </div>
                        <h1>OEE</h1>
                        <OeeScreen />
                    </div>
                    <div>
                        <div style={footerStyle}>
                            <img src={img2.src} alt="RITS Logo" style={{ width: '10%', height: '60px' }} />
                            <h6 style={{ color: 'gray', marginBottom: '0px' }}>All Rights Reserved by Fenta Powered by Rits</h6>
                        </div>
                        <p>Page - 2</p>
                    </div>
                </div>
            )}
            {componentIds.includes('downtime') && (
            <div id="downtime" style={pageStyle}>
                <div>
                    <div style={headerStyle}>
                        <img src={img1.src} alt="RITS Logo" style={{ width: '10%', height: '100%' }} />
                        <h1 style={{ marginBottom: '0px' }}>OEE REPORT</h1>
                    </div>
                    <h1>Down Time</h1>
                    <DownTime />
                </div>
                <div>
                    <div style={footerStyle}>
                        <img src={img2.src} alt="RITS Logo" style={{ width: '10%', height: '60px' }} />
                        <h6 style={{ color: 'gray', marginBottom: '0px' }}>All Rights Reserved by Fenta Powered by Rits</h6>
                    </div>
                    <p>Page - 3</p>
                </div>
            </div>
            )}
            {componentIds.includes('performance') && (
            <div id="performance" style={pageStyle}>
                <div>
                    <div style={headerStyle}>
                        <img src={img1.src} alt="RITS Logo" style={{ width: '10%', height: '100%' }} />
                        <h1 style={{ marginBottom: '0px' }}>OEE REPORT</h1>
                    </div>
                    <h1>Performance</h1>
                    <Performance />
                </div>
                <div>
                    <div style={footerStyle}>
                        <img src={img2.src} alt="RITS Logo" style={{ width: '10%', height: '60px' }} />
                        <h6 style={{ color: 'gray', marginBottom: '0px' }}>All Rights Reserved by Fenta Powered by Rits</h6>
                    </div>
                    <p>Page - 4</p>
                </div>
            </div>
            )}
            {componentIds.includes('availability') && (
            <div id="availability" style={pageStyle}>
                <div>
                    <div style={headerStyle}>
                        <img src={img1.src} alt="RITS Logo" style={{ width: '10%', height: '100%' }} />
                        <h1 style={{ marginBottom: '0px' }}>OEE REPORT</h1>
                    </div>
                    <h1>Availability</h1>
                    <Availability />
                </div>
                <div>
                    <div style={footerStyle}>
                        <img src={img2.src} alt="RITS Logo" style={{ width: '10%', height: '60px' }} />
                        <h6 style={{ color: 'gray', marginBottom: '0px' }}>All Rights Reserved by Fenta Powered by Rits</h6>
                    </div>
                    <p>Page - 5</p>
                </div>
            </div>
            )}
            {componentIds.includes('quality') && (
            <div id="quality" style={pageStyle}>
                <div>
                    <div style={headerStyle}>
                        <img src={img1.src} alt="RITS Logo" style={{ width: '10%', height: '100%' }} />
                        <h1 style={{ marginBottom: '0px' }}>OEE REPORT</h1>
                    </div>
                    <h1>Quality</h1>
                    <QualityScreen />
                </div>
                <div>
                    <div style={footerStyle}>
                        <img src={img2.src} alt="RITS Logo" style={{ width: '10%', height: '60px' }} />
                        <h6 style={{ color: 'gray', marginBottom: '0px' }}>All Rights Reserved by Fenta Powered by Rits</h6>
                    </div>
                    <p>Page - 6</p>
                </div>
            </div>
            )}
        </div>
    );
};

export default PdfContent;
