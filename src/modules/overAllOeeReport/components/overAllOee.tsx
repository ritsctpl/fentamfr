
'use client';

import React, { useEffect, useState } from 'react';
import { ReactFlow, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import CommonAppBar from '@components/CommonAppBar';
import { message } from 'antd';
import { parseCookies } from 'nookies';
import { useAuth } from '@context/AuthContext';
import { decryptToken } from '@utils/encryption';
import jwtDecode from 'jwt-decode';
import { getcellGroups } from '@services/oeeServices';
import NoDataFound from '@modules/oee_discrete/components/reuse/NoDataFound';

// Node Types
const nodeTypes = {
    custom: CustomNode
};

// Interface definitions
interface CellGroupData {
    cellGroupCategory: string;
    oee: number;
    availability: number;
    quality: number;
    performance: number;
    targetQty?: number;
    actualQty?: number;
    cells: {
        cell: string;
        oee: number;
        availability: number;
        quality: number;
        performance: number;
        targetQty?: number;
        actualQty?: number;
        lines: {
            line: string;
            workcenter: string;
            oee: number;
            availability: number;
            quality: number;
            performance: number;
            targetQty?: number;
            actualQty?: number;
        }[];
    }[];
}

interface DecodedToken {
    preferred_username: string;
}

// Modify createFlowElements to handle null data
function createFlowElements(data: CellGroupData | null): { nodes: Node[], edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    if (!data) return { nodes, edges };

    const centerX = 800;
    const verticalSpacing = 210;

    // Overall node
    nodes.push({
        id: 'overall',
        type: 'custom',
        data: { 
            title: data.cellGroupCategory,
            oee: data.oee,
            availability: data.availability,
            performance: data.performance,
            quality: data.quality,
            targetQty: data.targetQty,
            actualQty: data.actualQty
        },
        position: { x: centerX, y: 50 }
    });

    // Cells
    data.cells.forEach((cell: any, index: number) => {
        const cellId = `cell_${index}`;
        const cellX = centerX - 400 + (index * 800); // Increased horizontal spacing
        
        nodes.push({
            id: cellId,
            type: 'custom',
            data: { 
                title: cell.cell,
                oee: cell.oee,
                availability: cell.availability,
                performance: cell.performance,
                quality: cell.quality,
                targetQty: cell.targetQty,
                actualQty: cell.actualQty
            },
            position: { x: cellX, y: verticalSpacing }
        });

        edges.push({ 
            id: `edge_overall_${cellId}`, 
            source: 'overall', 
            target: cellId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#2196F3', strokeWidth: 2 }
        });

        // Lines
        cell.lines.forEach((line: any, lineIndex: number) => {
            const lineId = `line_${index}_${lineIndex}`;
            const lineX = cellX - 200 + (lineIndex * 400); // Adjusted line spacing
            
            nodes.push({
                id: lineId,
                type: 'custom',
                data: { 
                    title: line.line,
                    oee: line.oee,
                    availability: line.availability,
                    performance: line.performance,
                    quality: line.quality,
                    targetQty: line.targetQty,
                    actualQty: line.actualQty
                },
                position: { x: lineX, y: verticalSpacing * 2 }
            });

            edges.push({ 
                id: `edge_${cellId}_${lineId}`, 
                source: cellId, 
                target: lineId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#2196F3', strokeWidth: 2 }
            });
        });
    });

    return { nodes, edges };
}

function OverAllOee() {
    const cookies = parseCookies();
    const [username, setUsername] = useState<string | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [data, setData] = useState<CellGroupData | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await getcellGroups(cookies.site);
                if (mounted && response?.cellGroups) {
                    setData(response.cellGroups);
                }
            } catch (error) {
                if (mounted) {
                    setData(null);
                    messageApi.error('Failed to fetch data');
                    console.error("Error fetching data:", error);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        if (cookies.site) {
            fetchData();
        }

        return () => {
            mounted = false;
        };
    }, [cookies.site, messageApi]);

    useEffect(()=>{
        console.log("data",data);
    },[data])

    const { nodes, edges } = createFlowElements(data);

    return (
        <div style={{ height: '100vh', width: '100%', background: '#fff' }}>
            {contextHolder}
            <CommonAppBar 
                onSearchChange={() => { }}
                allActivities={[]}
                username={username}
                site={null}
                appTitle={"Overall OEE Report"}
                onSiteChange={() => { }}
            /> 
            {isLoading ? (
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'calc(100vh - 64px)'}}>
                    <span>Loading...</span>
                </div>
            ) : data ? (
                <div style={{ height: 'calc(100vh - 64px)' }}>
                    <ReactFlow 
                        nodes={nodes} 
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ 
                            padding: 0.2,
                            minZoom: 0.5,
                            maxZoom: 1
                        }}
                        minZoom={0.5}
                        maxZoom={1}
                        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
                    />
                </div>
            ) : (
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'calc(100vh - 64px)'}}>
                    <NoDataFound/>
                </div>
            )}
        </div>
    );
}

export default OverAllOee;
