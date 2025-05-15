import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/RoutingStep.module.css';
import { useTranslation } from 'react-i18next';
import { Box, Tabs, Tab } from '@mui/material';
import dayjs from 'dayjs';
import { Button, Tooltip, Form, message, Modal, Input } from 'antd';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ByMainForm from './ByMainForm';
import { useBuyOff } from '../hooks/BuyOffContext';

import { parseCookies } from 'nookies';
import ByoffUserGroups from './ByoffUserGroups';
import BuyOffAttachment from './BuyOffAttachment';
import { createBuyOff, updateBuyOff, deleteBuyOff } from '@services/buyOffService';
import ByoffCustomData from './ByoffCustomData';

interface BuyOffBodyContentProps {
    schema: any;
    onSuccess: () => Promise<void>;
}

export default function BuyOffBodyContent({ schema, onSuccess }: BuyOffBodyContentProps) {
    const {
        selectedRowData,
        isAdding,
        setIsAdding,
        fullScreen,
        setFullScreen,
        resetForm,
        hasChanges,
        setHasChanges
    } = useBuyOff();

    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);

    // Store initial data for comparison
    const [initialData, setInitialData] = useState<any>(null);

    // Initialize the initial data when selectedRowData changes
    useEffect(() => {
        if (selectedRowData && !initialData) {
            setInitialData(JSON.parse(JSON.stringify(selectedRowData)));
        }
    }, [selectedRowData]);

    // Track actual changes by comparing with initial data
    useEffect(() => {
        if (initialData && selectedRowData) {
            try {
                const initialJson = JSON.stringify(initialData);
                const currentJson = JSON.stringify(selectedRowData);
                const hasDataChanged = initialJson !== currentJson;
            } catch (error) {
                console.error('Error comparing data:', error);
            }
        }
    }, [selectedRowData, initialData]);

    // Create form instance at component level
    const [copyForm] = Form.useForm();

    const handleOpenChange = () => {
        setFullScreen(!fullScreen);
    };

    const handleOpenCopyModal = () => {
        // Reset form values before showing modal
        copyForm.setFieldsValue({
            buyOff: `${selectedRowData?.buyOff}_COPY`,
            version: '',
            description: selectedRowData?.description || ''
        });

        Modal.confirm({
            title: 'Confirm Copy',
            width: 500,
            icon: null,
            content: (
                <Form
                    form={copyForm}
                    layout="vertical"
                >
                    <Form.Item
                        label="Work Instruction"
                        name="buyOff"
                        rules={[{ required: true, message: 'Work Instruction is required' }]}
                    >
                        <Input 
                            onChange={(e) => {
                                const newValue = e.target.value
                                    .toUpperCase()
                                    .replace(/\s+/g, '')
                                    .replace(/[^A-Z0-9_]/g, '');
                                copyForm.setFieldsValue({ buyOff: newValue });
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Revision"
                        name="version"
                        rules={[{ required: true, message: 'Revision is required' }]}
                    >
                        <Input 
                            onChange={(e) => {
                                const newValue = e.target.value
                                    .toUpperCase()
                                    .replace(/\s+/g, '')
                                    .replace(/[^A-Z0-9_]/g, '');
                                copyForm.setFieldsValue({ version: newValue });
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            ),
            async onOk() {
                try {
                    const values = await copyForm.validateFields();
                    const { site } = parseCookies();
                    
                    const copyData = {
                        ...selectedRowData,
                        site,
                        buyOff: values.buyOff,
                        version: values.version,
                        description: values.description,
                    };

                    const response = await createBuyOff(copyData);
                    
                    if (response?.errorCode) {
                        message.error(response?.message);
                    } else {
                        message.success(response?.message_details?.msg);
                        setHasChanges(false);
                        setInitialData(null);
                        
                        if (formRef.current) {
                            formRef.current.resetFields();
                        }
                        resetForm();
                        setActiveTab(0);
                        await onSuccess();
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        message.error(error.message);
                    } else {
                        message.error('Failed to copy BuyOff');
                    }
                    return Promise.reject();
                }
            },
            okText: 'Copy',
            cancelText: 'Cancel',
            maskClosable: false
        });
    };

    const handleOpenModal = () => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this BuyOff?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const { site } = parseCookies();
                    const response = await deleteBuyOff({site, ...selectedRowData});

                    if (response?.errorCode) {
                        message.error(response?.message);
                    } else {
                        message.success(response?.message_details?.msg);
                        setHasChanges(false);
                        setInitialData(null);
                        
                        if (formRef.current) {
                            formRef.current.resetFields();
                        }
                        resetForm();
                        setActiveTab(0);
                        await onSuccess();
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        message.error(error.message);
                    } else {
                        message.error('Failed to delete BuyOff');
                    }
                }
            }
        });
    };

    const handleClose = () => {
        if (hasChanges) {
            Modal.confirm({
                title: 'Confirm',
                content: 'You have unsaved changes. Are you sure you want to close?',
                onOk: () => {
                    setHasChanges(false);
                    setInitialData(null);
                    
                    if (formRef.current) {
                        formRef.current.resetFields();
                    }
                    resetForm();
                    setActiveTab(0);
                },
                onCancel: () => {}
            });
        } else {
            setHasChanges(false);
            setInitialData(null);
            
            if (formRef.current) {
                formRef.current.resetFields();
            }
            resetForm();
            setActiveTab(0);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSave = async () => {
        try {
            // Validate required fields first
            const formValues = await formRef.current?.validateFields();
            
            // Check required fields manually
            const requiredFields = ['buyOff', 'version', 'status'];
            const missingFields = requiredFields.filter(field => !selectedRowData?.[field]);
            
            if (missingFields.length > 0) {
                message.error('Please fill in all required fields before saving');
                return;
            }

            if (selectedRowData) {
                setLoading(true);
                const { site } = parseCookies();
                const { rl_user_id } = parseCookies();

                const dataToSave = {
                    ...selectedRowData,
                    site,
                    userId:rl_user_id
                };
                console.log({dataToSave},"dataToSave")

                let response;
                if (selectedRowData?.createdDateTime) {
                    response = await updateBuyOff(dataToSave);
                } else {
                    response = await createBuyOff(dataToSave);
                }

                if (response?.errorCode) {
                    message.error(response?.message);
                } else {
                    setHasChanges(false);
                    setInitialData(null);
                    message.success(response?.message_details?.msg);
                    if (formRef.current) {
                        formRef.current.resetFields();
                    }
                    resetForm();
                    setActiveTab(0);
                    await onSuccess();
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                message.error('Please fill in all required fields before saving');
            } else {
                message.error('Failed to save BuyOff');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        handleClose();
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ByMainForm ref={formRef} schema={schema} />;
            case 1:
                return <ByoffUserGroups />;
            case 2:
                return <BuyOffAttachment />;
            case 3:
                return <ByoffCustomData />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={styles.split}>
                        <div style={{padding: '10px'}}>
                            <p className={styles.headingtext}>
                                {selectedRowData ? selectedRowData.buyOff : "Create BuyOff"}
                            </p>
                            <>
                                <p className={styles.dateText}>
                                    {t('versions')}
                                    <span className={styles.fadedText}>
                                        {selectedRowData?.version
                                            ? (selectedRowData?.version)
                                            : 'N/A'}
                                    </span>
                                </p>
                                <p className={styles.dateText}>
                                    {t('createdDate')}
                                    <span className={styles.fadedText}>
                                        {selectedRowData?.createdDateTime
                                            ? dayjs(selectedRowData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                                            : 'N/A'}
                                    </span>
                                </p>
                                <p className={styles.dateText}>
                                    {t('modifiedTime')}
                                    <span className={styles.fadedText}>
                                        {selectedRowData?.modifiedDateTime
                                            ? dayjs(selectedRowData?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
                                            : 'N/A'}
                                    </span>
                                </p>
                            </>
                        </div>

                        <div className={styles.actionButtons}>
                            <Tooltip title={fullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                                <Button
                                    onClick={handleOpenChange}
                                    className={styles.actionButton}
                                >
                                    {fullScreen ? <CloseFullscreenIcon sx={{ color: '#1874CE' }} /> : <OpenInFullIcon sx={{ color: '#1874CE' }} />}
                                </Button>
                            </Tooltip>

                            {selectedRowData && (
                                <>
                                    <Tooltip title="Copy">
                                        <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                            <FileCopyIcon sx={{ color: '#1874CE' }} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <Button onClick={handleOpenModal} className={styles.actionButton}>
                                            <DeleteIcon sx={{ color: '#1874CE' }} />
                                        </Button>
                                    </Tooltip>
                                </>
                            )}

                            <Tooltip title="Close">
                                <Button onClick={handleClose} className={styles.actionButton}>
                                    <CloseIcon sx={{ color: '#1874CE' }} />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="DC Tabs">
                            <Tab label={t("main")} />
                            <Tab label={t("userGroupList")} />
                            <Tab label={t("attachmentList")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>

                     <div className={styles.formActions}>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={loading}
                            style={{ marginRight: 8 }}
                        >
                            Save
                        </Button>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div> 
                </div>
            </div>
        </div>
    );
}