import React, { useEffect, useState } from 'react';
import { Tabs, Modal, Menu } from 'antd';
import AssemblyMain from '@modules/assembly/components/Assembly';
import WIMain from '@modules/wiPlugin/components/WiPlugin';
import DCMain from '@modules/dcPlugin/components/DcPlugin';
import MyTable from './PhaseList';
import ScrapUnscrapPlugin from '@modules/scrapUnscrapPlugin/components/ScrapUnscrapPlugin';
import ChangeEquipmentStatus from '@modules/changeEquipmentStatus/components/ChangeEquipmentStatus';
import { overflow } from 'html2canvas/dist/types/css/property-descriptors/overflow';
import { useTranslation } from 'react-i18next';
import { 
    MenuFoldOutlined, 
    MenuUnfoldOutlined, 
    ToolOutlined,
    BuildOutlined,
    FileTextOutlined,
    SettingOutlined,
    DatabaseOutlined,
    SwapOutlined
} from '@ant-design/icons';

interface PhaseListProps {
    filterFormData: any;
    selectedRowData: any;
    call2: number;
    setCall2: (value: number) => void;
    oSubPod: any;
    phaseByDefault: string;
}



const MyTabs: React.FC<PhaseListProps> = ({ filterFormData, selectedRowData, call2, setCall2, oSubPod, phaseByDefault }) => {

    
    const [activities, setActivities] = useState<any>([]);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const { t } = useTranslation();

    const [collapsed, setCollapsed] = useState(false);


   
    useEffect(() => {
        const configList = oSubPod?.tabConfiguration?.configurationList;
        setActivities(configList);
        
        // Find first UI type activity
        const firstUIActivity = configList?.find(activity => activity.type === 'UI');
        if (firstUIActivity && !selectedActivity) {
            setSelectedActivity(firstUIActivity.activitySequence);
        }
    }, [oSubPod]);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const showPluginInModal = (pluginComponent, activity) => {
        // debugger
        Modal.confirm({
            title: activity.description,
            width: 1000,
            icon: null,
            content: (
                <div>
                    {pluginComponent}
                </div>
            ),
            okButtonProps: { style: { display: 'none' } },
            cancelText: t("returnToPod"),
            onCancel() { },
        });
    };

    const renderPlugin = (activity) => {
        // console.log(activity,"activity");
        
        const { type, pluginLocation, url } = activity;
        if (type == 'UI') {
            if (pluginLocation == "999") {
                return null;
            }
            else {
                if (url == "/rits/assemblyPlugin_app/index.html") {
                    return (
                        <div
                            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 150px)', }}
                        >  <AssemblyMain filterFormData={filterFormData} selectedRowData={selectedRowData} call2={null}/>
                        </div>
                    )
                }

                else if (url == "/rits/dccollect_app/index.html") {

                    return (
                        <div
                            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 380px)', }}
                        >
                            <DCMain filterFormData={filterFormData} selectedRowData={selectedRowData} call2={0} setCall2={function (value: number): void { }} />
                        </div>
                    )
                }

                else if (url == "/rits/workInstructionPlugin_app/index.html") {
                    return (
                        <div
                            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 350px)', }}
                        >  <WIMain filterFormData={filterFormData} selectedRowData={selectedRowData} call2={0} setCall2={function (value: number): void { }} />
                        </div>
                    )
                }

                else if (url == '/rits/scrap_app/index.html') {
                    return (
                        <div
                            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 280px)',  }}
                        >  <ScrapUnscrapPlugin filterFormData={filterFormData} selectedRowData={selectedRowData} call2={0} selectedContainer={null} phaseByDefault={phaseByDefault}/>
                        </div>
                    )
                }

                else if (url === '/rits/changeEquipmentStatus_app/index.html') {
                    return (
                        <div
                            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 225px)', marginTop: "2%" }}
                        >
                            <ChangeEquipmentStatus filterFormData={filterFormData} 
                            onRemoveContainer={() => { }}
                            buttonLabel={""}
                            />
                        </div>
                    )
                }
            }
        }
        return null;
    };

    const getActivityIcon = (url: string) => {
        switch (url) {
            case '/rits/assemblyPlugin_app/index.html':
                return <BuildOutlined />;
            case '/rits/dccollect_app/index.html':
                return <DatabaseOutlined />;
            case '/rits/workInstructionPlugin_app/index.html':
                return <FileTextOutlined />;
            case '/rits/scrap_app/index.html':
                return <SwapOutlined />;
            case '/rits/changeEquipmentStatus_app/index.html':
                return <SettingOutlined />;
            default:
                return <ToolOutlined />;
        }
    };

    return (
        <div style={{ 
            display: 'flex',
            gap: '10px',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Buttons Column */}
            <div style={{ 
               display: 'flex', 
               flexDirection: 'column',
               background: '#fff',
               transition: 'all 0.2s'
            }}>
                {/* {activities?.filter(activity => activity?.type === 'UI').map(activity => (
                    <button 
                        key={activity?.activitySequence}
                        onClick={() => setSelectedActivity(activity?.activitySequence)} 
                        style={{ 
                            padding: '8px 16px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            width: '100%',
                            textAlign: 'left',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: selectedActivity === activity.activitySequence ? '#006568' : '#fff',
                            color: selectedActivity === activity.activitySequence ? '#fff' : '#000',
                            borderColor: selectedActivity === activity.activitySequence ? '#006568' : '#ddd'
                        }}
                    >
                        {activity?.description}
                    </button>
                ))} */}

    <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                background: '#fff',
                transition: 'all 0.2s'
            }}>
                <button
                    onClick={toggleCollapsed}
                    style={{
                        marginBottom: '8px',
                        padding: '8px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        justifyContent: 'start',
                        alignItems: 'start'
                    }}
                >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>

                <Menu
                    mode="inline"
                    selectedKeys={[selectedActivity]}
                    inlineCollapsed={collapsed}
                    style={{
                        width: collapsed ? '50px' : '170px',
                        flexShrink: 0,
                        transition: 'width 0.2s',
                        border: 'none'
                    }}
                >
                    {activities?.filter(activity => activity?.type === 'UI').map(activity => (
                        <Menu.Item
                            key={activity?.activitySequence}
                            onClick={() => setSelectedActivity(activity?.activitySequence)}
                            icon={collapsed ? getActivityIcon(activity?.url) : null} 
                            title={activity?.description} // Tooltip on hover
                            style={{
                                margin: '4px',
                                borderRadius: '4px',
                                height: 'auto', // Allow menu item to grow
                                lineHeight: '20px', // Adjust line height
                                padding: collapsed ? '12px' : '12px 24px', // Adjust padding
                            }}
                        >
                            <span style={{ 
                            //    whiteSpace: 'pre-wrap',
                            //    wordWrap: 'break-word',
                               overflow: 'hidden',
                               textOverflow: 'ellipsis'
                            }}>
                                {activity?.description}
                            </span>
                        </Menu.Item>
                    ))}
                </Menu>
            </div>

            </div>

            {/* Content Column */}
            <div style={{ 
                flex: 1,
                minWidth: 0,
                overflow: 'auto'
            }}>
                {activities?.filter(activity => 
                    activity?.type === 'UI' && 
                    activity?.activitySequence === selectedActivity
                ).map(activity => (
                    <div key={activity?.activitySequence} style={{ width: '100%' }}>
                        {renderPlugin(activity)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTabs;