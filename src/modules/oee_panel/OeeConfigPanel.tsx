'use client';

import { Button, Layout, Menu } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import React, { useState } from 'react';
import { CalendarOutlined, AppstoreOutlined, BarChartOutlined, SettingOutlined,BgColorsOutlined } from '@ant-design/icons';
import Settings from './Settings';
import { MyConfigProvider } from './hooks/configData';
import FilterPanel from './FilterPanel';
import CommonAppBar from '@components/CommonAppBar';
import QueryBuilder from './QueryBuilder';
import ColorsSetting from './ColorsSetting';


const layoutStyle: React.CSSProperties = {
    height: '100vh',
};


const contentStyle: React.CSSProperties = {
    color: '#000',
};

const siderStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '30px',
    color: '#000',
    backgroundColor: '#fff',
};

const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    padding: '10px 0',
    // backgroundColor: '#4096ff',
};

const buttonStyle: React.CSSProperties = {
    width: '35%',
    height: '80px',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d9d9d9',
    borderRadius: '8px',
};

const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f0f0ff',
    borderColor: '#124561',
};

const iconStyle: React.CSSProperties = {
    fontSize: '24px',
    marginBottom: '8px',
};

const labelStyle: React.CSSProperties = {
    color: '#666',
    fontSize: '12px',
};

function OeeConfigPanel() {
    const [activeButton, setActiveButton] = useState<string>('settings');

    const renderContent = () => {
        switch (activeButton) {
            case 'calendar':
                return <div>Calendar Content</div>;
            case 'query':
                return <QueryBuilder />;
            case 'colors':
                return <ColorsSetting/>;
            case 'filters':
                return <FilterPanel />;
            case 'activities':
                return <div>Activities Content</div>;
            case 'settings':
                return <Settings/>;
            default:
                return null;
        }
    };

    return (
        <MyConfigProvider>
            <Layout style={layoutStyle}>
                <CommonAppBar
                    onSearchChange={()=>{}}
                    allActivities={null}
                    username={''}
                    site={''}
                    appTitle={'Management Dashboard'}
                    onSiteChange={null}
                />
                <Layout>
                    <Sider width="18%" style={{ ...siderStyle, padding: '20px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button
                                disabled={true}
                                style={activeButton === 'calendar' ? activeButtonStyle : buttonStyle}
                                onClick={() => setActiveButton('calendar')}
                            >
                                <CalendarOutlined style={{ ...iconStyle, color: activeButton === 'calendar' ? '#124561' : undefined }} />
                                <span style={labelStyle}>Calendar</span>
                            </Button>
                            <Button
                                style={activeButton === 'query' ? activeButtonStyle : buttonStyle}
                                onClick={() => setActiveButton('query')}
                            >
                                <AppstoreOutlined style={{ ...iconStyle, color: activeButton === 'query' ? '#124561' : undefined }} />
                                <span style={labelStyle}>Query Builder</span>
                            </Button>
                            <Button
                                style={activeButton === 'colors' ? activeButtonStyle : buttonStyle}
                                onClick={() => setActiveButton('colors')}
                            >
                                {/* <SettingOutlined style={{ ...iconStyle, color: activeButton === 'goals' ? '#124561' : undefined }} /> */}
                                <BgColorsOutlined style={{ ...iconStyle, color: activeButton === 'colors' ? '#124561' : undefined }}/>
                                <span style={labelStyle}>Colors</span>
                            </Button>
                            <Button
                                style={activeButton === 'filters' ? activeButtonStyle : buttonStyle}
                                onClick={() => setActiveButton('filters')}
                            >
                                <BarChartOutlined style={{ ...iconStyle, color: activeButton === 'filters' ? '#124561' : undefined }} />
                                <span style={labelStyle}>Filters</span>
                            </Button>
                            <Button
                                disabled={true}
                                style={activeButton === 'activities' ? activeButtonStyle : buttonStyle}
                                onClick={() => setActiveButton('activities')}
                            >
                                <BarChartOutlined style={{ ...iconStyle, color: activeButton === 'activities' ? '#124561' : undefined }} />
                                <span style={labelStyle}>Activities</span>
                            </Button>
                            <Button
                                style={activeButton === 'settings' ? activeButtonStyle : buttonStyle}
                                onClick={() => setActiveButton('settings')}
                            >
                                <SettingOutlined style={{ ...iconStyle, color: activeButton === 'settings' ? '#124561' : undefined }} />
                                <span style={labelStyle}>Settings</span>
                            </Button>
                        </div>
                    </Sider>
                    <Content style={contentStyle}>
                        {renderContent()}
                    </Content>
                </Layout>
                <Footer style={footerStyle}>Footer</Footer>
            </Layout>
        </MyConfigProvider>
    );
}

export default OeeConfigPanel;
