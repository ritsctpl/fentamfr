"use client"
import React, { useState } from 'react';
import { Tabs } from 'antd';
import './mainStyle.css';
import GroupBuilder from '@modules/groupBuilder/components/GroupBuilder';
import SectionBuilderMain from '@modules/sectionBuilder/SectionBuilderMain';
import ApiConfigMaintenance from '@modules/componentBuilder/components/ComponentBuilderMain';
import { MyProvider } from '@modules/componentBuilder/hooks/componentBuilderContext';
import TemplateBuilderMain from '@modules/templateCreater/TemplateBuilderMain';
import CommonAppBar from '@components/CommonAppBar';
import ComponentBuilderMaintenance from '@modules/componentBuilder/components/ComponentBuilderMain';
import ComponentBuilder from '@modules/newComponentBuilder/components/ComponentBuilder';

export default function MainBuilder() {
    const [call, setCall] = useState(0);
    const username = 'admin';
    return (
        <div style={{ height: '100vh', width: '100%', boxSizing: 'border-box' }}>
            <CommonAppBar
                onSearchChange={() => { }}
                allActivities={[]}
                username={username}
                site={null}
                appTitle={"Builder Screen"} onSiteChange={function (newSite: string): void {
                    setCall(call + 1);
                }} />
            <div style={{ height: 'calc(100vh - 44px)', width: '100%', padding:5, boxSizing: 'border-box' }}>
                <Tabs
                    defaultActiveKey="1"
                    style={{ height: '100%' }}
                    tabBarStyle={{ boxSizing: 'border-box', height: '50px' }}
                    items={[
                        {
                            key: '1',
                            label: 'Template Builder',
                            style: {
                                width: '100%',
                                height: '100%'
                            },
                            children: (
                                <div style={{ height: '100%', width: '100%' }}>
                                    <TemplateBuilderMain />
                                </div>
                            )
                        },
                        // {
                        //     key: '2',
                        //     label: 'Component Builder',
                        //     style: {
                        //         width: '100%',
                        //         height: '100%'
                        //     },
                        //     children: (
                        //         <div style={{ height: '100%', width: '100%' }}>
                        //             <MyProvider >
                        //                 <ComponentBuilderMaintenance />
                        //             </MyProvider>
                        //         </div>
                        //     )
                        // },
                        {
                            key: '3',
                            label: 'Section Builder',
                            style: {
                                width: '100%',
                                height: '100%'
                            },
                            children: (
                                <div style={{ height: '100%', width: '100%' }}>
                                    <SectionBuilderMain />
                                </div>
                            )
                        },
                        {
                            key: '4',
                            label: 'Group Builder',
                            style: {
                                width: '100%',
                                height: '100%'
                            },
                            children: (
                                <div style={{ height: '100%', width: '100%' }}>
                                    <GroupBuilder />
                                </div>
                            )
                        },
                         {
                            key: '5',
                            label: 'Component Builder',
                            style: {
                                width: '100%',
                                height: '100%'
                            },
                            children: (
                                <div style={{ height: '100%', width: '100%' }}>
                                    <ComponentBuilder />
                                </div>
                            )
                        }
                    ]}

                />
            </div>
        </div>
    );
}
