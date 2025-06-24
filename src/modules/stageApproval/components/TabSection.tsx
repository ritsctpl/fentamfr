import { useState } from "react";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import { DocumentList } from "./DocumentList";

interface TabSectionProps {
    documents: {
        name: string;
        type: string;
    }[];
}

export const TabSection = ({ documents }: TabSectionProps) => {
    const [activeTab, setActiveTab] = useState('Attachments');

    return (
        <div style={{
            width: '100%',
            height: '50%',
            padding: '14px',
            boxSizing: 'border-box',
            borderBottom: '1px solid #e6e6e6',
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                display: 'flex',
                padding: '3px',
                backgroundColor: '#f5f5f5',
                position: 'relative',
            }}>
                <div
                    style={{
                        position: 'absolute',
                        width: '50%',
                        height: 'calc(100% - 6px)',
                        border: '1px solid rgba(42, 90, 180, 0.38)',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        transition: 'transform 0.3s ease',
                        transform: `translateX(${activeTab === 'Summary' ? '100%' : '0'})`,
                    }}
                />
                {['Attachments', 'Summary'].map((tab) => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            width: '50%',
                            padding: '12px 24px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            fontWeight: activeTab === tab ? '500' : '400',
                            color: activeTab === tab ? '#000' : '#666',
                            position: 'relative',
                            zIndex: 1,
                            transition: 'color 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {tab === 'Attachments' ? (
                            <AttachFileIcon
                                style={{
                                    fontSize: '20px',
                                    transform: 'rotate(45deg)',
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                        ) : (
                            <FilterFramesIcon
                                style={{
                                    fontSize: '20px'
                                }}
                            />
                        )}
                        {tab}
                    </div>
                ))}
            </div>

            {activeTab === 'Attachments' && (
                <DocumentList title="Document Attachments" documents={documents} />
            )}

            {activeTab === 'Summary' && (
                <DocumentList title="Document Summary" documents={documents} />
            )}
        </div>
    );
} 