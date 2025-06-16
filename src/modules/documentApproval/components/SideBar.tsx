import { useState } from 'react';
import { Input, List, Button, Segmented, Tag } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

interface DocumentItem {
    id: string;
    title: string;
    status: 'Completed' | 'Pending' | 'Ongoing';
}

function SideBar({ filter, setFilter }: { filter: boolean, setFilter: (filter: boolean) => void }) {
    const [activeTab, setActiveTab] = useState('MFR');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = ['MFR', 'BMR', 'eBMR', 'BPR'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return { color: 'success', bg: '#f6ffed', text: '#52c41a' };
            case 'Pending':
                return { color: 'warning', bg: '#fff7e6', text: '#fa8c16' };
            case 'Ongoing':
                return { color: 'processing', bg: '#e6f7ff', text: '#1890ff' };
            default:
                return { color: 'default', bg: '#f5f5f5', text: '#666' };
        }
    };

    const STATUS_TAG_WIDTH = '90px';  // Fixed width for all status tags

    const documents: DocumentItem[] = [
        { id: '0001-MFR', title: 'MFR-Doc-001', status: 'Completed' },
        { id: '0002-MFR', title: 'MFR-Doc-002', status: 'Pending' },
        { id: '0003-MFR', title: 'MFR-Doc-003', status: 'Ongoing' },
        { id: '0004-MFR', title: 'MFR-Doc-004', status: 'Completed' },
        { id: '0005-MFR', title: 'MFR-Doc-005', status: 'Pending' },
    ];

    return (
        <div style={{
            width: '450px',
            height: '100%',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{ padding: '12px' }}>
                <Segmented
                    value={activeTab}
                    onChange={(value) => setActiveTab(value.toString())}
                    options={tabs}
                    block
                    size='large'
                    style={{
                        marginBottom: 12,
                    }}
                />
            </div>

            <div style={{
                padding: '0 12px 12px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                gap: '8px',
            }}>
                <Input
                    placeholder="Search"
                    value={searchQuery}
                    size='large'
                    onChange={(e) => setSearchQuery(e.target.value)}
                    suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ flex: 1 }}
                />
                <Button
                    icon={filter ? <FilterAltOffIcon /> : <FilterAltIcon />}
                    size='large'
                    style={{
                        border: '1px solid #d9d9d9',
                        background: 'transparent',
                    }}
                    onClick={() => setFilter(!filter)}
                />
            </div>

            <List
                dataSource={documents}
                renderItem={(doc) => (
                    <List.Item
                        key={doc.id}
                        style={{
                            padding: '12px',
                            backgroundColor: '#fff',
                            marginBottom: '8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid rgba(0, 0, 0, 0.16)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f7ff';
                            e.currentTarget.style.borderColor = '1px solid rgba(0, 0, 0, 0.16)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(24,144,255,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.borderColor = '1px solid rgba(0, 0, 0, 0.16)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            width: '100%'
                        }}>
                            <FileTextOutlined style={{ fontSize: '18px', color: '#666', marginTop: '3px' }} />
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '0px',
                                flex: 1
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    width: '100%'
                                }}>
                                    <div style={{ fontWeight: '500', fontSize: '1em' }}>{doc.title}</div>
                                    <Tag
                                        style={{
                                            margin: 0,
                                            backgroundColor: getStatusColor(doc.status).bg,
                                            color: getStatusColor(doc.status).text,
                                            border: `1px solid ${getStatusColor(doc.status).text}`,
                                            fontSize: '12px',
                                            padding: '0 8px',
                                            width: STATUS_TAG_WIDTH,
                                            textAlign: 'center',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {doc.status}
                                    </Tag>
                                </div>
                                <div style={{ fontWeight: '500', fontSize: '0.8em', color: '#666' }}>
                                    ID: {doc.id}
                                </div>
                            </div>
                        </div>
                    </List.Item>
                )}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px'
                }}
            />
        </div>
    );
}

export default SideBar;