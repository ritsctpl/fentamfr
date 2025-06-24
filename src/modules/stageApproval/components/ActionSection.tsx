import React, { useState, useContext } from 'react';
import { Button, Input, Modal, Select, Form, message } from "antd";
import { 
    UploadOutlined, 
    CheckOutlined, 
    PauseCircleOutlined, 
    CloseOutlined,
    LockOutlined
} from '@ant-design/icons';
import { getKeycloakInstance } from '@/keycloak';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface ActionModalProps {
    type: 'approve' | 'hold' | 'reject';
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    remarks: string;
    message: string;
}

const ActionModal: React.FC<ActionModalProps> = ({ 
    type, 
    visible, 
    onCancel, 
    onSubmit,
    remarks,
    message: initialMessage 
}) => {
    const [form] = Form.useForm();
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    const handleVerifyEsign = async () => {
        try {
            setVerifying(true);
            const keyCloak = await getKeycloakInstance();
            
            // Get the current user credentials from the form
            const userId = form.getFieldValue('userId');
            const password = form.getFieldValue('password');

            if (!userId || !password) {
                message.error('Please enter both user ID and password');
                return;
            }

            const baseUrl = keyCloak.authServerUrl;
            const realm = keyCloak.realm;
            const clientId = keyCloak.clientId;

            try {
                // Verify credentials using Keycloak token endpoint
                await axios.post(
                    `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
                    {
                        'client_id': clientId,
                        'grant_type': 'password',
                        'username': userId,
                        'password': password,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                setVerified(true);
                message.success('E-sign verified successfully');
            } catch (error) {
                console.error('Verification error:', error);
                message.error('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('E-sign verification error:', error);
            message.error('E-sign verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'approve':
                return 'Approve Document';
            case 'hold':
                return 'Hold Document';
            case 'reject':
                return 'Reject Document';
            default:
                return '';
        }
    };

    const getButtonStyle = () => {
        switch (type) {
            case 'approve':
                return { background: '#52c41a', borderColor: '#52c41a' };
            case 'hold':
                return { background: '#faad14', borderColor: '#faad14' };
            case 'reject':
                return { background: '#ff4d4f', borderColor: '#ff4d4f' };
            default:
                return {};
        }
    };

    return (
        <Modal
            title={getTitle()}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    priority: 'medium',
                    remarks: remarks,
                    message: initialMessage
                }}
                onFinish={(values) => {
                    if (!verified) {
                        message.warning('Please verify your e-sign first');
                        return;
                    }
                    onSubmit({ ...values, verified });
                }}
            >
                <Form.Item
                    name="priority"
                    label="Priority"
                    rules={[{ required: true, message: 'Please select priority' }]}
                >
                    <Select>
                        <Option value="high">High</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="low">Low</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="remarks"
                    label="Remarks"
                    rules={[{ required: true, message: 'Please enter remarks' }]}
                >
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="message"
                    label="Message"
                    rules={[{ required: true, message: 'Please enter message' }]}
                >
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="userId"
                    label="User ID"
                    rules={[{ required: true, message: 'Please enter your user ID' }]}
                >
                    <Input placeholder="Enter your user ID" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password placeholder="Enter your password" />
                </Form.Item>

                <div style={{ 
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <Button
                        size='large'
                        icon={<LockOutlined />}
                        onClick={handleVerifyEsign}
                        loading={verifying}
                        disabled={verified}
                        style={{ width: '50%' }}
                    >
                        {verified ? 'E-sign Verified' : 'Verify E-sign'}
                    </Button>
                    <Button
                        type="primary"
                        size='large'
                        htmlType="submit"
                        disabled={!verified}
                        style={{ 
                            width: '50%',
                        }}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

const ActionSection: React.FC = () => {
    const [compare, setCompare] = useState(false);
    const [actionModal, setActionModal] = useState<{
        type: 'approve' | 'hold' | 'reject';
        visible: boolean;
    }>({ type: 'approve', visible: false });
    const [remarks, setRemarks] = useState('');
    const [messageText, setMessageText] = useState('');

    const handleAction = async (values: any) => {
        try {
            // Here you would handle the action with the verified e-sign
            // You can access the Keycloak token if needed
            const keyCloak = await getKeycloakInstance();
            const token = keyCloak.token;

            // Make your API call here with the token
            // const response = await axios.post('/your-api-endpoint', {
            //     action: actionModal.type,
            //     ...values
            // }, {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // });

            message.success(`Document ${actionModal.type}ed successfully`);
            setActionModal({ type: 'approve', visible: false });
        } catch (error) {
            console.error('Action error:', error);
            message.error('Failed to process the action');
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '29%',
            justifyContent: 'space-between',
            padding: '16px',
            boxSizing: 'border-box', 
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{
                display: 'flex',
                gap: '16px',
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px'
                    }}>
                        Remarks
                    </div>
                    <TextArea
                        placeholder="Enter the remarks"
                        style={{ width: '100%', minHeight: '120px' }}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px'
                    }}>
                        Message
                    </div>
                    <TextArea
                        placeholder="Enter the messages"
                        style={{ width: '100%', minHeight: '120px' }}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                    />
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{
                    display: 'flex',
                    gap: '8px'
                }}>
                    <Button 
                        size='large'
                        icon={<UploadOutlined />}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        Upload Attachment
                    </Button>
                    <Button 
                        size='large'
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onClick={() => setCompare(true)}
                    >
                        Compare
                    </Button>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '8px'
                }}>
                    <Button 
                        size='large'
                        icon={<CheckOutlined />}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onClick={() => setActionModal({ type: 'approve', visible: true })}
                    >
                        Approve
                    </Button>
                    <Button 
                        size='large'
                        icon={<PauseCircleOutlined />}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onClick={() => setActionModal({ type: 'hold', visible: true })}
                    >
                        Hold
                    </Button>
                    <Button 
                        danger
                        size='large'
                        icon={<CloseOutlined />}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onClick={() => setActionModal({ type: 'reject', visible: true })}
                    >
                        Reject
                    </Button>
                </div>
            </div>

            <ActionModal
                type={actionModal.type}
                visible={actionModal.visible}
                onCancel={() => setActionModal({ ...actionModal, visible: false })}
                onSubmit={handleAction}
                remarks={remarks}
                message={messageText}
            />

            {compare && (
                <Modal
                    open={compare}
                    onCancel={() => setCompare(false)}
                    footer={null}
                    width={'90%'}
                >
                    <h2>Compare</h2>
                </Modal>
            )}
        </div>
    );
}

export default ActionSection; 