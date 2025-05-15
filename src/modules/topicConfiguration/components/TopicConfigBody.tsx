import React, { useState, useEffect, useContext } from 'react';
import styles from '@modules/topicConfiguration/styles/topicConfig.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip, Button as Btn, Switch } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import dayjs from 'dayjs';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TopicConfigurationContext } from '@modules/topicConfiguration/hooks/TopicConfigContext';
import { defaultTopicConfigurationRequest } from '@modules/topicConfiguration/types/TopicConfigTypes';
import { CreateTopicConfiguration, DeleteTopicConfiguration, UpdateTopicConfiguration } from '@services/topicConfigService';

interface TopicConfigurationBodyProps {
    isAdding: boolean;
    selected: any;
    drag: boolean;
    fullScreen: boolean;
    resetValue: boolean;
    call: number;
    onClose: () => void;
    setCall: (val: number) => void;
    setIsAdding: (val: boolean) => void;
    setFullScreen: (val: boolean) => void;
}

const TopicConfigurationBody: React.FC<TopicConfigurationBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose,
    resetValue, setFullScreen }) => {

    const { formData, setFormData, setFormChange, activeTab, setActiveTab, formChange } = useContext<any>(TopicConfigurationContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);

    useEffect(() => {
        if (formData) {
            form.setFieldsValue(formData)
        }
    }, [formData]);

    const handleOpenChange = () => {
        setFullScreen(true);
    }

    const handleCloseChange = () => {
        setFullScreen(false);
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleClose = () => {
        if (formChange) {
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    onClose();
                    setFormChange(false)
                },
                onCancel() { },
            });
        }
        else {
            onClose();
            setFormChange(false)
        }
    };

    const handleSave = async () => {
        const errors = [];
        if (!formData?.topicName) {
            errors.push('Topic Name');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        try {
            if (selected?.topicName) {
                const response = await UpdateTopicConfiguration(selected?.id, formData);
                // if (response.message) {
                //     message.error(response.message)
                // }
                // else {
                    // message.success(response.message_details.msg)
                    message.success('Topic configuration updated successfully');
                    setCall(call + 1);
                    setFormChange(false);
                    setActiveTab(0)
                // }
            } else {
                const response = await CreateTopicConfiguration(formData);
                // if (response.message) {
                //     message.error(response.message)
                // }
                // else {
                    // message.success(response.message_details.msg)
                    message.success('topic configuration created successfully');
                    setIsAdding(false);
                    setCall(call + 1);
                    setFormChange(false)
                    setFormData(defaultTopicConfigurationRequest)
                    setActiveTab(0)
                // }
            }
        } catch (error) {
            message.error('topic configuration creation failed');
        }
    }

    const handleCancel = () => {
        if (formChange) {
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    onClose();
                    setFormChange(false)
                },
                onCancel() { },
            });
        }
        else {
            onClose();
            setFormChange(false)
        }
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleConfirmDelete = () => {
        const deleteTopicData = async () => {
            try {
                const response = await DeleteTopicConfiguration(selected?.id);
                if (!response.errorCode) {
                    // message.success(response.message);
                    message.success('Topic configuration deleted successfully');
                    setCall(call + 1);
                    onClose();
                    setIsModalVisible(false);
                    setIsAdding(false)
                }
                else {
                    setCall(call + 1);
                    setIsAdding(false)
                }
            } catch (error) {
                console.error('Error fetching data fields:', error);
            }
        };

        deleteTopicData();
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.resetFields();
        form.setFieldsValue({
            topicName: formData?.topicName ? `${formData?.topicName}_COPY` : '',
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        const formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        form.setFieldsValue({ [fieldName]: formattedValue });
    };

    const handleConfirmCopy = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        try {
            const values = await form.validateFields();
            const updatedRowData = {
                ...formData,
                topicName: values?.topicName,
            };
            const response = await CreateTopicConfiguration(updatedRowData);
            message.success('Topic configuration copied successfully');
            setCall(call + 1);
            onClose();
            handleCloseCopyModal();
            setActiveTab(0)
            // if (!response.errorCode) {
                // message.success(response.message_details.msg);
                // setCall(call + 1);
                // onClose();
                // handleCloseCopyModal();
                // setActiveTab(0)
            // }
            // else {
            //     message.error(response.message)
            // }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleTopicNameChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        form.setFieldsValue({ topicName: value });
        setFormData((prevData) => ({
            ...prevData,
            topicName: value
        }));
    };

    const handleChange = (changedValues) => {
        setFormChange(true);
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <Form
                        layout="horizontal"
                        style={{ width: '100%' }}
                        form={form}
                        onValuesChange={handleChange}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 24 }}
                    >
                        <Form.Item
                            label={t('topicName')}
                            name="topicName"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the Topic Name!',
                                },
                            ]}
                        >
                            <Input
                                style={{ width: '60%' }}
                                placeholder="Topic Name"
                                onChange={handleTopicNameChange}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t('apiUrl')}
                            name="apiUrl"
                        >
                            <Input.TextArea 
                                style={{ width: '60%' }} 
                                placeholder="Enter API URL"
                                rows={4}
                                autoSize={{ minRows: 4, maxRows: 6 }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t('active')}
                            name="active"
                            valuePropName="checked"
                        >
                            <Switch 
                                defaultChecked={formData?.active || false}
                            />
                        </Form.Item>
                    </Form>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selected?.topicName ? selected?.topicName : t("createTopicConfiguration")}
                                </p>
                                {selected?.topicName && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('status')}:&nbsp;
                                            <span className={styles.fadedText}>{selected.active ? 'Active' : 'Inactive'}</span>
                                        </p>
                                        {/* <p className={styles.dateText}>
                                            {t('createdOn')}:&nbsp;
                                            <span className={styles.fadedText}>
                                                {dayjs(selected.createdDateTime).format('DD-MM-YYYY HH:mm:ss')}
                                            </span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('modifiedOn')}:&nbsp;
                                            <span className={styles.fadedText}>
                                                {dayjs(selected.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')}
                                            </span>
                                        </p> */}
                                    </>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                {
                                    fullScreen ?
                                        <Tooltip title={t("exitFullScreen")}>
                                            <Button onClick={handleCloseChange} className={styles.actionButton}>
                                                <CloseFullscreenIcon />
                                            </Button>
                                        </Tooltip> :
                                        <Tooltip title={t("enterFullScreen")}>
                                            <Button onClick={handleOpenChange} className={styles.actionButton}>
                                                <OpenInFullIcon />
                                            </Button>
                                        </Tooltip>
                                }

                                {selected?.topicName && (
                                    <>
                                        {/* <Tooltip title={t("copy")}>
                                            <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                                <CopyIcon />
                                            </Button>
                                        </Tooltip> */}
                                        <Tooltip title={t("delete")}>
                                            <Button onClick={handleOpenModal} className={styles.actionButton}>
                                                <DeleteIcon />
                                            </Button>
                                        </Tooltip>
                                    </>
                                )}

                                <Tooltip title={t("close")}>
                                    <Button onClick={handleClose} className={styles.actionButton}>
                                        <CloseIcon />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Activity Group Tabs">
                            <Tab label={t("main")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer}>
                <div className={styles.floatingButtonContainer}>
                    <Btn
                        type="primary"
                        onClick={handleSave}
                    >
                        {selected?.topicName ? t("save") : t("create")}
                    </Btn>
                    <Btn
                        onClick={handleCancel}
                    >
                        {t("cancel")}
                    </Btn>
                </div>
            </footer>
            <Modal
                title={t("confirmDelete")}
                open={isModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("areYouSure")} <strong>{formData?.topicName}</strong>?</p>
            </Modal>
            <Modal
                title={t("copyTopic")}
                open={isCopyModalVisible}
                onOk={handleConfirmCopy}
                onCancel={handleCloseCopyModal}
                okText={t("copy")}
                cancelText={t("cancel")}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        label={t("topicName")}
                        name="topicName"
                        rules={[{ required: true, message: 'Please enter the Topic Name' }]}
                    >
                        <Input placeholder="Enter Topic Name" onChange={(e) => handleFieldChange(e, 'topicName')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TopicConfigurationBody;