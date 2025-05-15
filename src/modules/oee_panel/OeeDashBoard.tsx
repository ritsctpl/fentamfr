"use client"
import React from 'react'
import Layout, { Content, Footer, Header } from 'antd/es/layout/layout'
import SideBarDemo from './SideBarDemo'
import "./styles/styles.css";
import { MyConfigProvider } from './hooks/configData'
import TabsDemo from './TabsDemo'
import CommonAppBar from '@components/CommonAppBar'
import { ConfigProvider, theme } from 'antd'
import fentalogo from '../../images/fenta_logo.png';

const layoutStyle: React.CSSProperties = {
    height: '100vh',
    marginBottom:10
}

const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding:0,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    minHeight:20
}

function OeeDashBoard() {
    const [call, setCall] = React.useState(0)
    const [themeTogle,setThemeTogle] = React.useState(false)
    return (
        <ConfigProvider theme={{
            algorithm:themeTogle? theme.darkAlgorithm:theme.defaultAlgorithm,
            token: {
                fontFamily: 'Poppins',
            },
            components: {
                Segmented: {
                    itemColor: themeTogle?'#d8d8d8':'#000000',
                    itemSelectedBg: '#046169',
                    itemSelectedColor: '#d8d8d8',
                    itemHoverBg: '#196087'+50,
                    itemHoverColor: themeTogle?'#d8d8d8':'#000000',
                },
                Card: {
                    headerBg: themeTogle?'#196087':'#046169',
                    padding: 5,
                    colorTextHeading: themeTogle?'d8d8d8':'white',
                    headerHeight: 30,
                },
            },
        }}>
        <MyConfigProvider>
            <Layout style={layoutStyle}>
                <CommonAppBar
                    onSearchChange={()=>{}}
                    // color="#006568"
                    // logoHeader={'HIMALAYA'}
                    allActivities={null}
                    username={''}
                    site={''}
                    appTitle={'OEE Metrics and Analysis'}
                    onSiteChange={function (): void { setCall(call + 1) }}
                />
                <Layout style={{marginBottom:10}}>
                    <SideBarDemo />
                    <TabsDemo themeTogle={themeTogle} setThemeTogle={setThemeTogle}/>
                </Layout>
            <Footer style={footerStyle}>
            <img src={fentalogo.src} alt="Fenta Logo" style={{ width: '95px', height: '55px' }} />
            <div style={{ color: 'gray' }}>&copy; {new Date().getFullYear()} Fenta Powered by Rits | All Rights Reserved</div>
            </Footer>
            </Layout>
        </MyConfigProvider>
        </ConfigProvider>
    )
}

export default OeeDashBoard