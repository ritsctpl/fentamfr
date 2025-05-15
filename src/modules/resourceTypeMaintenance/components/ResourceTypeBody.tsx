import React, { useState, useEffect, useContext } from 'react';
import styles from '@modules/resourceMaintenances/styles/resource.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip, Button as Btn } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ResourceTypeContext } from '@modules/resourceTypeMaintenance/hooks/ResourceTypeContext';
import { createResourceType, deleteResourceType, updateResourceType } from '@services/resourceTypeServices';
import { defaultExtendedResourceTypeRequest } from '@modules/resourceTypeMaintenance/types/ResourceTypes';
import ResourceType from './ResourceType';

interface ResourceTypeBodyProps {
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

const ResourceTypeBody: React.FC<ResourceTypeBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose,
    resetValue, setFullScreen }) => {

    const { formData, setFormData, setFormChange, activeTab, setActiveTab, formChange } = useContext<any>(ResourceTypeContext)
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
        if (!formData?.resourceType) {
            errors.push('Resource Type');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        try {
            if (selected?.createdDateTime) {
                const cookies = parseCookies();
                const site = cookies.site;
                const userId = cookies.rl_user_id;
                const payload = {
                    ...formData,
                    site: site,
                    userId: userId,
                }
                console.log(payload, 'response');
                const response = await updateResourceType(site, userId, payload);
                console.log(response, 'response');
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setCall(call + 1);
                    setFormChange(false);
                    setActiveTab(0)
                }
            } else {
                const cookies = parseCookies();
                const site = cookies.site;
                const userId = cookies.rl_user_id;
                const payload = {
                    ...formData,
                    site: site,
                    userId: userId,
                }
                const response = await createResourceType(site, userId, payload);
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setIsAdding(false);
                    setCall(call + 1);
                    setFormChange(false)
                    setFormData(defaultExtendedResourceTypeRequest)
                    setActiveTab(0)
                }
            }
        } catch (error) {
            message.error('An error occurred while saving the User Group.');
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
        const deleteResourceData = async () => {
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;

            try {
                const payload = formData;
                const response = await deleteResourceType(site, userId, payload);
                if (!response.errorCode) {
                    message.success(response.message);
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

        deleteResourceData();
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.resetFields();
        form.setFieldsValue({
            resourceType: formData?.resourceType ? `${formData?.resourceType}_COPY` : '',
            resourceTypeDescription: formData?.resourceTypeDescription || '',
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
                resourceType: values?.resourceType,
                resourceTypeDescription: values?.resourceTypeDescription,
            };
            const response = await createResourceType(site, userId, updatedRowData);
            if (!response.errorCode) {
                message.success(response.message_details.msg);
                setCall(call + 1);
                onClose();
                handleCloseCopyModal();
                setActiveTab(0)
            }
            else {
                // setCall(call + 1);
                // setIsAdding(false)
                message.error(response.message)
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleResourceTypeChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        form.setFieldsValue({ resourceType: value });
        setFormData((prevData) => ({
            ...prevData,
            resourceType: value
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
                            label={t('resourceType')}
                            name="resourceType"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the Resource Type!',
                                },
                            ]}
                        >
                            <Input
                                style={{ width: '40%' }}
                                placeholder="Resource Type"
                                onChange={handleResourceTypeChange}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t("resourceTypeDescription")}
                            name="resourceTypeDescription"
                        >
                            <Input style={{ width: '40%' }} placeholder="Enter resourceTypeDescription" />
                        </Form.Item>
                    </Form>
                );
            case 1:
                return (
                    <ResourceType drag={drag} />
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
                                    {selected?.resourceType ? selected?.resourceType : t("createResourceType")}
                                </p>
                                {selected?.resourceType && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('resourceTypeDescription')}:&nbsp;
                                            <span className={styles.fadedText}>{selected.resourceTypeDescription}</span>
                                        </p>
                                        <p className={styles.dateText}>
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
                                        </p>
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

                                {selected?.resourceType && (
                                    <>
                                        <Tooltip title={t("copy")}>
                                            <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                                <CopyIcon />
                                            </Button>
                                        </Tooltip>
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
                            <Tab label={t("resourceMemberList")} />
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
                        {selected?.resourceType ? t("save") : t("create")}
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
                <p>{t("areYouSure")} <strong>{formData?.resourceType}</strong>?</p>
            </Modal>
            <Modal
                title={t("copyResource")}
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
                        label={t("resourceType")}
                        name="resourceType"
                        rules={[{ required: true, message: 'Please enter the Resource Type' }]}
                    >
                        <Input placeholder="Enter Resource Type" onChange={(e) => handleFieldChange(e, 'resourceType')} />
                    </Form.Item>
                    <Form.Item
                        label={t("resourceTypeDescription")}
                        name="resourceTypeDescription"
                    >
                        <Input placeholder="Enter resourceTypeDescription" onChange={(e) => handleFieldChange(e, 'resourceTypeDescription')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResourceTypeBody;