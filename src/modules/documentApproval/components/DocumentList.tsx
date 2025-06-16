import { Button, Modal } from "antd";
import { EyeOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState } from "react";

interface DocumentItem {
    name: string;
    type: string;
}

interface DocumentListProps {
    title: string;
    documents: DocumentItem[];
}

export const DocumentList = ({ title, documents }: DocumentListProps) => {
    const [viewDocument, setViewDocument] = useState(false);
    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflow: 'auto'
        }}>
            <h2 style={{
                fontSize: '16px',
                color: '#555',
                fontWeight: '600',
            }}>{title}</h2>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {documents.map((file, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: '#fff',
                        border: '1px solid #e6e6e6',
                        borderRadius: '4px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FilePdfOutlined style={{
                                fontSize: '24px',
                                color: '#000'
                            }} />
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#000'
                                }}>{file.name}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{file.type}</div>
                            </div>
                        </div>
                        <Button
                            type="default"
                            style={{
                                color: '#000',
                            }}
                            icon={<EyeOutlined />}
                            onClick={() => {
                                // setViewDocument(!viewDocument);
                                // const blob = new Blob([file.data], { type: file.type });
                                // const url = URL.createObjectURL(blob);
                                // window.open(url, '_blank');
                            }}
                        >
                            View
                        </Button>
                    </div>
                ))}
            </div>
            {/* {viewDocument && 
              <Modal open={viewDocument} onCancel={() => setViewDocument(false)} width={'60%'}>
                <div>
                    <h2>Document</h2>
                </div>
              </Modal>
            } */}
        </div>
    );
} 