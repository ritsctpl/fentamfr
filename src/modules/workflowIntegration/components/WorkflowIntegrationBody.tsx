import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '@modules/workflowIntegration/styles/WorkflowIntegration.module.css';
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
import { WorkflowIntegrationUseContext } from '@modules/workflowIntegration/hooks/WorkflowIntegrationUseContext';
import { defaultWorkflowIntegrationRequest } from '../types/workflowIntegrationTypes';
import WorkflowIntegrationDynamicForm from '@modules/workflowIntegration/components/WorkflowIntegrationDynamicForm';
import { createCopyWorkflowIntegration, CreateWorkflowIntegration, deleteWorkflowIntegration, UpdateWorkflowIntegration } from '@services/workflowIntegrationService';


interface WorkflowIntegrationBodyProps {
    isAdding: boolean;
    selected: any;
    fullScreen: boolean;
    resetValue: boolean;
    call: number;
    onClose: () => void;
    setCall: (val: number) => void;
    setIsAdding: (val: boolean) => void;
    setFullScreen: (val: boolean) => void;
}

const WorkflowIntegrationBody: React.FC<WorkflowIntegrationBodyProps> = ({ selected,
    fullScreen, setIsAdding, call, setCall, isAdding, onClose, setFullScreen }) => {

    const { formData, setFormData, setFormChange } = useContext<any>(WorkflowIntegrationUseContext)
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();

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
        onClose();
    };

    const handleSave = async () => {
        const errors = [];

        if (!formData?.identifier) {
            errors.push('Identifier');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!formData?.type) {
            errors.push('Type');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!formData?.apiToProcess) {
            errors.push('Api To Process');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (formData?.type === 'split' && !formData?.processSplitXslt && !formData?.expectedSplits?.length) {
            errors.push('Expected Splits');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (selected?.type) {
            handleUpdate();
        } else {
            handleCreate();
        }
    }

    const handleCreate = async () => {

        const cookies = parseCookies();
        const site = cookies.site;
        try {
            const { processBy, processJoltXslt, ...formDataWithoutProcessBy } = formData;
            const response = await CreateWorkflowIntegration({ ...formDataWithoutProcessBy, site: site });
            if (response.message_details) {
                message.success(response.message_details.msg)
                setIsAdding(false);
                setCall(call + 1);
                setFormChange(false)
            }
            else {
                message.error('Error Creating Workflow Integration')
            }
        }
        catch (error) {
            message.error(error.response.data.error);
        }
    }

    const handleUpdate = async () => {
        try {
            const { processBy, processJoltXslt, ...formDataWithoutProcessBy } = formData;
            const response = await UpdateWorkflowIntegration({ ...formDataWithoutProcessBy });
            if (response.message_details) {
                message.success(response.message_details.msg)
                setCall(call + 1);
                setFormChange(false)
            } else {
                message.error('Error Updating Workflow Integration')
            }
        } catch (error) {
            message.error(error.response.data.error);
        }
    }

    const handleCancel = () => {
        onClose();
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.setFieldsValue({
            identifier: selected?.identifier + "_COPY" || '',
            messageId: selected?.messageId || '',
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleConfirmCopy = async () => {
        const { id, processJoltXslt, processBy, ...rest } = formData;
        const cookies = parseCookies();
        const site = cookies.site;  
        const copyFormData = {
            ...rest,
            identifier: form.getFieldValue('identifier'),
            messageId: form.getFieldValue('messageId'),
            site: site
        }

        try {
            const copyResponse = await createCopyWorkflowIntegration(copyFormData);
            if (copyResponse.message_details) {
                message.success(copyResponse.message_details.msg);
                setCall(call + 1);
                onClose();
                setIsCopyModalVisible(false);
            }
            else {
                message.error('Error Copying Workflow Integration');
            }
        } catch (error) {
            console.error('Error copying workflowIntegration:', error);
        }
    };

    const handleDeleteWorkFlow = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const newValue = {
            site: site,
            id: selected?.id
        }

        try {
            const response = await deleteWorkflowIntegration(newValue);
            if (response.message_details) {
                message.success(response.message_details.msg)
                setIsAdding(false);
                setCall(call + 1);
                setFormChange(false)
                setFormData(defaultWorkflowIntegrationRequest)
            }
            else {
                message.error('Error Deleting Workflow Integration')
            }
        } catch (error) {
            message.error('Error deleting WorkFlow.');
        }
        setIsModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;
        form.setFieldsValue({ [fieldName]: formattedValue });
    };

    const fieldsFormData = [
        'identifier',
        'type',
        'messageId',
        'processSplitXslt',
        'processBy',
        'transformationType',
        'preprocessJolt',
        'preprocessXslt',
        'preprocessApi',
        'apiToProcess',
        'expectedSplits',
        'postProcessJolt',
        'postProcessApi',
        'passHandler',
        'failHandler',
    ];

    const handleValuesChange = (changedValues: any) => {
        // setFormChange(true)
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <WorkflowIntegrationDynamicForm
                        data={formData}
                        fields={fieldsFormData}
                        onValuesChange={handleValuesChange} />
                );
                <h1>Form</h1>

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
                                    {selected?.type ? selected?.identifier : t("createWorkflowIntegration")}
                                </p>
                                {selected?.type && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('type')} :
                                            <span className={styles.fadedText}>{formData?.type || ''}</span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('messageId')} :
                                            <span className={styles.fadedText}>{formData?.messageId || ''}</span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('createdOn')} :
                                            <span className={styles.fadedText}>
                                                {formData?.createdDateTime ? dayjs(formData.createdDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}
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

                                {selected?.type && (
                                    // <Tooltip title={t("delete")}>
                                    //     <Button onClick={handleOpenModal} className={styles.actionButton}>
                                    //         <DeleteIcon />
                                    //     </Button>
                                    // </Tooltip>

                                    <>
                                        <Tooltip title="Copy">
                                            <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                                <CopyIcon sx={{ color: '#1874CE' }} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <Button onClick={handleOpenModal} className={styles.actionButton}>
                                                <DeleteIcon sx={{ color: '#1874CE' }} />
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
                    <footer style={{ display: !isAdding ? 'none' : 'block' }} className={styles.footer}>
                        <div className={styles.floatingButtonContainer}>
                            <button
                                className={`${styles.floatingButton} ${styles.saveButton}`}
                                onClick={handleSave}
                            >
                                {selected?.type ? t("update") : t("create")}
                            </button>
                            <button
                                className={`${styles.floatingButton} ${styles.cancelButton}`}
                                onClick={handleCancel}
                            >
                                {t("cancel")}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
            <Modal
                title={t("confirmDelete")}
                open={isModalVisible}
                onOk={handleDeleteWorkFlow}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("areYouSure")}
                    <strong> Workflow Integration</strong></p>
            </Modal>

            <Modal
                title={t("confirmCopy")}
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
                    initialValues={{
                        identifier: selected?.identifier || '',
                        messageId: '',
                    }}
                >
                    <Form.Item
                        name="identifier"
                        label={t("identifier")}
                        rules={[{ required: true, message: 'Please enter the identifier' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'identifier')} />
                    </Form.Item>

                    <Form.Item
                        name="messageId"
                        label={t("messageId")}
                        // rules={[{ required: true, message: 'Please enter the messageId' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'messageId')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WorkflowIntegrationBody;