'use client';

import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@context/AuthContext';
import { decryptToken } from '@utils/encryption';
import { Layout, theme, Modal, Input, Form, Tooltip } from 'antd'
import jwtDecode from 'jwt-decode';
import { Content, Footer, Header } from 'antd/es/layout/layout'
import { parseCookies } from 'nookies';
import React, { useState, useEffect } from 'react'
import { Canvas, Node, Edge, Port, MarkerArrow, Label, Icon } from 'reaflow';
import { retrieveAllOperation } from '@services/routingServices';
import { GrChapterAdd } from 'react-icons/gr';
import { useSearchParams } from 'next/navigation';
import DynamicTable from './DynamicTable';
import { fetchTop50WorkCenter } from '@services/workCenterService';

const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#4096ff',
};

const layoutStyle = {
    overflow: 'hidden',
    width: '100%',
    height: '100vh',
};
interface DecodedToken {
    preferred_username: string;
}


function LiveDashboardMain() {
    const [call, setCall] = useState<number>(0);
    const [username, setUsername] = useState<string | null>(null);
    const { isAuthenticated, token } = useAuth();
    const [selectedNodeDescription, setSelectedNodeDescription] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
    const [selectedRouting, setSelectedRouting] = useState<any>(null);
    const [flowData, setFlowData] = useState<any[]>([]);
    const searchParams = useSearchParams()
    console.log(searchParams.get('routing'))
    useEffect(() => {
        const fetchListData = async () => {
            if (isAuthenticated && token) {
                try {
                    const decryptedToken = decryptToken(token);
                    const decoded: DecodedToken = jwtDecode(decryptedToken);
                    setUsername(decoded.preferred_username);
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
            const cookies = parseCookies();
            const site = cookies.site;
        }
        fetchListData();
    }, [isAuthenticated, token, username])

    const handleNodeClick = (event: any, node: any) => {
        const nodeData = flowData.find(item => item.stepID.toString() === node.id);
        if (nodeData) {
            setSelectedNodeDescription(nodeData.stepDescription);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedNodeDescription('');
    };

    const handleOperationClick = async () => {
        const response = await fetchTop50WorkCenter('RITS')
        console.log(response, 'response');
        setIsOperationModalOpen(true);
    };

    const handleOperationModalClose = () => {
        setIsOperationModalOpen(false);
    };

    const getNodeTooltipContent = (nodeData: any) => {
        if (!nodeData) return '';

        let content = `Description: ${nodeData.stepDescription}\n`;
        if (nodeData.workCenter) {
            content += `Work Center: ${nodeData.workCenter}\n`;
        }
        if (nodeData.powderUsageKg !== undefined) {
            content += `Powder Usage: ${nodeData.powderUsageKg}kg\n`;
        }
        if (nodeData.status) {
            content += `Status: ${nodeData.status}`;
        }
        return content;
    };

    return (
        <Layout style={layoutStyle}>
            <CommonAppBar
                onSearchChange={() => { }}
                allActivities={[]}
                username={username}
                site={null}
                appTitle={'LIVE DASHBOARD'}
                onSiteChange={() => setCall(call + 1)} />
            <Content style={{ height: 'calc(100vh - 128px)', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '10px', width: '400px' }}>
                    <h5>Routing:</h5>
                    <Input
                        value={selectedRouting?.routing}
                        onChange={(e) => {
                            if (e.target.value === '') {
                                setSelectedRouting(null);
                            } else {
                                setSelectedRouting(e.target.value);
                            }
                        }}
                        suffix={<GrChapterAdd onClick={handleOperationClick} />}
                    />
                </div>
                <style>
                    {`
        body #root > div {
          background-color: white;
          background-image: -webkit-repeating-radial-gradient(top center,rgba(0,0,0,.2),rgba(0,0,0,.2) 1px,transparent 0,transparent 100%);
        }
        .edge {
          stroke: #b1b1b7;
          stroke-dasharray: 5;
          animation: dashdraw .5s linear infinite;
          stroke-width: 1;
        }
        @keyframes dashdraw {
          0% { stroke-dashoffset: 10; }
        }
      `}
                </style>
                <Canvas direction={"RIGHT"}
                    fit={true}
                    panType="drag"
                    // pannable={false}
                    nodes={
                        flowData.map((item) => ({
                            id: item.stepID.toString(),
                            text: item.stepDescription,
                            icon: {
                                url: item.status === "Active" ? "https://cdn-icons-png.flaticon.com/512/5709/5709755.png" : "https://cdn-icons-png.flaticon.com/512/14776/14776883.png",
                                height: 25,
                                width: 25,
                            }
                        }))
                    } edges={
                        flowData.flatMap((item) =>
                            item.nextStepId
                                .filter(nextId => nextId !== 0)
                                .map((nextId) => ({
                                    id: `${item.stepID}-${nextId}`,
                                    from: item.stepID.toString(),
                                    to: nextId.toString(),
                                    text: `${item.stepID}-${nextId}`,
                                }))
                        )
                    } onLayoutChange={layout => console.log('Layout', layout)}
                    node={<Node icon={<Icon />} onClick={handleNodeClick} style={{
                        stroke: '#1a192b',
                        fill: 'white',
                        strokeWidth: 1
                    }} label={<Label style={{
                        fill: 'black'
                    }} />} port={<Port style={{
                        fill: 'blue',
                        stroke: 'white',
                        strokeWidth: 2
                    }} rx={10} ry={10} />} />} arrow={<MarkerArrow style={{
                        fill: '#b1b1b7'
                    }} />} edge={<Edge className="edge" label={<Label style={{ fill: 'black' }} />} />} />
                <Modal
                    title="Step Description"
                    open={isModalOpen}
                    onCancel={handleModalClose}
                    footer={null}
                >
                    <DynamicTable
                        selectedRouting={selectedRouting}
                        columns={[
                            {
                                title: 'Pcu',
                                dataIndex: 'pcu',
                                key: 'pcu',
                            },
                            {
                                title: 'Description',
                                dataIndex: 'description',
                                key: 'description',
                            }
                        ]}
                        dataSource={[
                            {
                                key: '1ee',
                                pcu: '1ee',
                                description: 'A',
                            },
                            {
                                key: '2ee',
                                pcu: '2ee',
                                description: 'A',
                            },
                        ]}
                        readonly
                        selectedRowKey={selectedRouting?.key || ''}
                        onRowClick={(record) => {
                            setSelectedRouting(record);
                            setIsOperationModalOpen(false);
                        }}
                    />
                </Modal>
                <Modal
                    title="Operation"
                    open={isOperationModalOpen}
                    onCancel={handleOperationModalClose}
                    footer={null}
                >
                    <DynamicTable
                        selectedRouting={selectedRouting}
                        columns={[
                            {
                                title: 'Routing',
                                dataIndex: 'routing',
                                key: 'routing',
                            },
                            {
                                title: 'Routing Version',
                                dataIndex: 'version',
                                key: 'version',
                            }
                        ]}
                        dataSource={[
                            {
                                key: '1',
                                routing: 'Routing 1',
                                version: 'A',
                                data: [{
                                    "stepID": 10,
                                    "stepType": "Operation",
                                    "stepDescription": "ACCESS PANEL WI...",
                                    "status": "Active",
                                    "previousStepId": 0,
                                    "nextStepId": [20, 50]
                                },
                                {
                                    "stepID": 20,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Air Pump Assy",
                                    "previousStepId": 10,
                                    "nextStepId": [30, 40]
                                },
                                {
                                    "stepID": 30,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "operation1",
                                    "previousStepId": 20,
                                    "nextStepId": [60]
                                },
                                {
                                    "stepID": 40,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "OP2",
                                    "previousStepId": 20,
                                    "nextStepId": [60]
                                },
                                {
                                    "stepID": 50,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Dispense Pump Assy",
                                    "previousStepId": 10,
                                    "nextStepId": [70]
                                },
                                {
                                    "stepID": 60,
                                    "stepType": "Operation",
                                    "status": "inActive",
                                    "stepDescription": "PCBA",
                                    "previousStepId": [30, 40],
                                    "nextStepId": [70]
                                },
                                {
                                    "stepID": 70,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "battery",
                                    "previousStepId": [50, 60],
                                    "nextStepId": [0]
                                }]
                            },
                            {
                                key: '2',
                                routing: 'Routing 2',
                                version: 'A',
                                data: [{
                                    "stepID": 10,
                                    "stepType": "Operation",
                                    "stepDescription": "ACCESS PANEL WI...",
                                    "status": "Active",
                                    "previousStepId": 0,
                                    "nextStepId": [20, 50]
                                },
                                {
                                    "stepID": 20,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Air Pump Assy",
                                    "previousStepId": 10,
                                    "nextStepId": [30, 40]
                                },
                                {
                                    "stepID": 30,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "operation1",
                                    "previousStepId": 20,
                                    "nextStepId": [60]
                                },
                                {
                                    "stepID": 40,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "OP2",
                                    "previousStepId": 20,
                                    "nextStepId": [60]
                                },
                                {
                                    "stepID": 50,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Dispense Pump Assy",
                                    "previousStepId": 10,
                                    "nextStepId": [70]
                                },
                                {
                                    "stepID": 60,
                                    "stepType": "Operation",
                                    "status": "inActive",
                                    "stepDescription": "PCBA",
                                    "previousStepId": [30, 40],
                                    "nextStepId": [70]
                                },
                                {
                                    "stepID": 70,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "battery",
                                    "previousStepId": [50, 60],
                                    "nextStepId": [0]
                                }]  
                            },
                            {
                                key: '3',
                                routing: 'Tablet',
                                version: 'A',
                                data: [{
                                    "stepID": 10,
                                    "stepType": "Operation",
                                    "stepDescription": "Machine_1",
                                    "status": "Active",
                                    "previousStepId": 0,
                                    "nextStepId": [20]
                                },
                                {
                                    "stepID": 20,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Machine_2",
                                    "previousStepId": 10,
                                    "nextStepId": [30, 40]
                                },
                                {
                                    "stepID": 30,
                                    "stepType": "Operation",
                                    "status": "inActive",
                                    "stepDescription": "Machine_3",
                                    "previousStepId": 20,
                                    "nextStepId": [0]
                                },
                                {
                                    "stepID": 40,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Machine_4",
                                    "previousStepId": 20,
                                    "nextStepId": [60]
                                },
                                {
                                    "stepID": 60,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Machine_6",
                                    "previousStepId": [30, 40],
                                    "nextStepId": [70]
                                },
                                {
                                    "stepID": 70,
                                    "stepType": "Operation",
                                    "status": "Active",
                                    "stepDescription": "Packing",
                                    "previousStepId": [60],
                                    "nextStepId": [0]
                                }]
                            },
                        ]}
                        selectedRowKey={selectedRouting?.key}
                        onRowClick={(record) => {
                            setSelectedRouting(record);
                            setFlowData(record.data);
                            setIsOperationModalOpen(false);
                        }}
                    />

                </Modal>
            </Content>
            {/* <Footer style={footerStyle}>
                <div>LiveDashboardMain</div>
            </Footer> */}
        </Layout>
    )
}

export default LiveDashboardMain