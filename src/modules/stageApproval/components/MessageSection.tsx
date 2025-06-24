import React from 'react';
import { Avatar, Button } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';

interface Message {
    user: string;
    message: string;
    avatar?: string;
    time: string;
}

const MessageSection: React.FC = () => {
    const messages: Message[] = [
        {
            user: 'John Smith',
            message: 'Document submitted for review. All attachments included.',
            time: '10:00 AM'
        },
        {
            user: 'Tom Cruse',
            message: 'Initial review completed. Awaiting final approval.',
            time: '10:00 AM'
        }
    ];

    return (
        <div style={{
            width: '100%',
            height: '50%',
            padding: '16px',
            boxSizing: 'border-box',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff'
        }}>
            <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#555',
                marginBottom: '16px'
            }}>
                Message History
            </h2>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                overflow: 'auto'
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #e6e6e6',
                        paddingBottom: '10px'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                        }}>
                            <Avatar
                                icon={<UserOutlined />}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#1890ff' : '#52c41a',
                                    flexShrink: 0
                                }}
                            />
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#000'
                                }}>
                                    {msg.user} <span style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        fontWeight: '400'
                                    }}>
                                        {msg.time}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                        {/* <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <Button icon={<EyeOutlined />} size='small' >
                                Attachments
                            </Button>
                        </div> */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageSection; 