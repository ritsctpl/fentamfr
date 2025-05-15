import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '@modules/resourceMaintenances/styles/resource.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ResourceContext } from '@modules/resourceMaintenances/hooks/ResourceContext';
import ActivityHook from '@modules/resourceMaintenances/components/ActivityHook';
import ResourceCustom from '@modules/resourceMaintenances/components/ResourceCustom';
import OpcTagTable from '@modules/resourceMaintenances/components/OpcTagTable';
import CertificationTab from '@modules/resourceMaintenances/components/CertificationTab';
import ResourceType from '@modules/resourceMaintenances/components/ResourceType';
import ResourceDynamicForm from '@modules/resourceMaintenances/components/ResourceDynamicForm';
import { createResource, deleteResource, updateResource } from '@services/ResourceService';
import { defaultResourceRequest } from '@modules/resourceMaintenances/types/ResourceTypes';

interface ResourceBodyProps {
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

const ResourceBody: React.FC<ResourceBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose,
    resetValue, setFullScreen }) => {

    const { formData, setFormData, setFormChange, activeTab, setActiveTab, formChange } = useContext<any>(ResourceContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    // const [activeTab, setActiveTab] = useState<number>(0);
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
        if (!formData?.resource) {
            errors.push('Resource');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (formData.certificationList && formData.certificationList.length > 0) {
            const invalidCertifications = formData.certificationList.some(cert => !cert.certificationBO || !cert.certificationDescription);
            if (invalidCertifications) {
                errors.push('Certification (certificationBO and certificationDescription required)');
                message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
                return;
            }
        }

        if (formData.opcTagList && formData.opcTagList.length > 0) {
            const hasInvalidOpcTags = formData.opcTagList.every(tag =>
                !tag.tagName && !tag.tagUrl && !tag.identity
            );
            if (hasInvalidOpcTags) {
                errors.push('OPG Tag (all fields are empty)');
                message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
                return;
            }
        }

        // if (formData.activityHookList && formData.activityHookList.length > 0) {
        //     const invalidActivityHooks = formData.activityHookList.some(hook => !hook.activity || !hook.hookPoint);
        //     if (invalidActivityHooks) {
        //         errors.push('Activity Hooks (activity and hookPoint required)');
        //         message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
        //         return;
        //     }
        // }

        if (formData.activityHookList && formData.activityHookList.length > 0) {
            const invalidActivityHooks = formData.activityHookList.some(hook => !hook.activity);
            if (invalidActivityHooks) {
                errors.push('Activity Hooks (activity is required)');
                message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
                return;
            }
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
                const response = await updateResource(site, userId, payload);
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
                const response = await createResource(site, userId, payload);
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setIsAdding(false);
                    setCall(call + 1);
                    setFormChange(false)
                    setFormData(defaultResourceRequest)
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
                const response = await deleteResource(site, userId, payload);
                setCall(call + 1);
                onClose();
                if (!response.errorCode) {
                    message.success(response.message_details.msg);
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
        setIsCopyModalVisible(true);;
        form.setFieldsValue({
            resource: formData?.resource ? `${formData?.resource}_COPY` : '',
            description: formData?.description || '',
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
                resource: values?.resource,
                description: values?.description,
            };
            const response = await createResource(site, userId, updatedRowData);
            if (!response.errorCode) {
                message.success(response.message_details.msg);
                setCall(call + 1);
                onClose();
                handleCloseCopyModal();
                setActiveTab(0)
            }
            else {
                message.error(response.message)
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const fieldsFormData = [
        'resource',
        'description',
        'status',
        'defaultOperation',
        'processResource',
        'erpEquipmentNumber',
        'erpPlantMaintenanceOrder',
        'validFrom',
        'validTo',
    ];

    const handleValuesChange = (changedValues: any) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues
        }));
        setFormChange(true)
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <ResourceDynamicForm data={formData}
                    fields={fieldsFormData}
                    onValuesChange={handleValuesChange} />
                );
            case 1:
                return (
                    <ResourceType drag={drag}/>
                );
            case 2:
                return (
                    <CertificationTab/>
                );
            case 3:
                return (
                    <OpcTagTable/>
                );
            case 4:
                return (
                    <ActivityHook />
                );
            case 5:
                return (
                    <ResourceCustom/>
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
                                    {selected?.resource ? selected?.resource : t("createResource")}
                                </p>
                                {selected?.resource && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('description')}:&nbsp;
                                            <span className={styles.fadedText}>{selected.description}</span>
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

                                {selected?.resource && (
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
                            <Tab label={t("resourceType")} />
                            <Tab label={t("certification")} />
                            <Tab label={t("opcTag")} />
                            <Tab label={t("activityHook")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer}>
                <div className={styles.floatingButtonContainer}>
                    <button
                        className={`${styles.floatingButton} ${styles.saveButton}`}
                        onClick={handleSave}
                    >
                        {selected?.resource ? t("save") : t("create")}
                    </button>
                    <button
                        className={`${styles.floatingButton} ${styles.cancelButton}`}
                        onClick={handleCancel}
                    >
                        {t("cancel")}
                    </button>
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
                <p>{t("areYouSure")} <strong>{formData?.resource}</strong>?</p>
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
                        label={t("resource")}
                        name="resource"
                        rules={[{ required: true, message: 'Please enter the Resource' }]}
                    >
                        <Input placeholder="Enter Resource" onChange={(e) => handleFieldChange(e, 'resource')} />
                    </Form.Item>
                    <Form.Item
                        label={t("description")}
                        name="description"
                    >
                        <Input placeholder="Enter description" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResourceBody;