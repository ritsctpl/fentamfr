import React, { useState, useEffect, useContext } from 'react';
import styles from '@modules/toolNumber/styles/toolNumber.module.css';
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
import { ToolNumberContext } from '../hooks/ToolNumberUseContext';
import ToolNumberDynamicForm from './ToolNumberDynamicForm';
import ToolNumberCustomData from './ToolNumberCustomData';
import Calibration from './Calibration';
import MeasurementPoints from './MeasurementPoints';
import { CreateToolNumber, DeleteToolNumber, UpdateToolNumber } from '@services/toolNumberService';
import { defaultToolNumberRequest } from '../types/ToolNumberTypes';

interface ToolNumberBodyProps {
    isAdding: boolean;
    selected: any;
    drag: boolean;
    fullScreen: boolean;
    call: number;
    onClose: () => void;
    setCall: (val: number) => void;
    setIsAdding: (val: boolean) => void;
    setFullScreen: (val: boolean) => void;
}

const ToolNumberBody: React.FC<ToolNumberBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose, setFullScreen }) => {

    const { formData, setFormData, activeTab, setActiveTab, setFormChange } = useContext<any>(ToolNumberContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    const [forms] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [oper, setOper] = useState<boolean>(false);

    useEffect(() => {
        if (formData) {
            forms.setFieldsValue(formData)
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
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                onClose();
            },
            onCancel() { },
        });
    };

    const handleSave = async () => {

        const errors = [];

        if (!formData?.toolNumber) {
            errors.push('Tool Number');
        }

        if (!formData?.toolGroup) {
            errors.push('Tool Group');
        }

        if (!formData?.qtyAvailable) {
            errors.push('Quantity Available');
        }

        if (errors.length > 0) {
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
                    currentSite: site,
                }
                const response = await UpdateToolNumber(site, userId, payload);
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setFormData(response.response)
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
                    currentSite: site,
                }
                const response = await CreateToolNumber(site, userId, payload);
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setIsAdding(false);
                    setCall(call + 1);
                    setFormChange(false)
                    setActiveTab(0)
                    setFormData(defaultToolNumberRequest)
                }
            }
        } catch (error) {
            message.error('An error occurred while saving the Tool Number.');
        }
    }


    const handleCancel = () => {
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                onClose();
                setOper(true)
            },
            onCancel() { },
        });
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };


    const handleConfirmDelete = () => {
        const deleteNcCodes = async () => {
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;
            const currentSite = site;

            try {
                const payload = formData;
                const deleteToolNumber = await DeleteToolNumber(site, userId, payload);

                setCall(call + 1);
                onClose();
                if (!deleteToolNumber.errorCode) {
                    message.success(deleteToolNumber.message_details.msg);
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
        deleteNcCodes();
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.resetFields();
        form.setFieldsValue({
            toolNumber: formData?.toolNumber ? `${formData?.toolNumber}_COPY` : '',
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
                toolNumber: values?.toolNumber,
                description: values?.description,
                currentSite: site,
            };
            const response = await CreateToolNumber(site, userId, updatedRowData);
            setCall(call + 1);
            onClose();

            handleCloseCopyModal();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const fieldsOptions = [
        'toolNumber',
        'description',
        'status',
        'toolGroup',
        'qtyAvailable',
        'erpEquipmentNumber',
        'erpPlanMaintenanceOrder',
        'toolQty',
        'duration',
        'location',
    ];

    const handleFormChange = (changedValues) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
        setFormChange(true)
    };

    const calibrationOptions = [
        'calibrationType',
        'calibrationPeriod',
        'calibrationCount',
        'maximumCalibrationCount',
        'startCalibrationDate',
        'expirationDate',
    ];

    const handleCalibrationChange = (changedValues) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
        setFormChange(true)
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <ToolNumberDynamicForm data={formData} fields={fieldsOptions} onValuesChange={handleFormChange} />
                );
            case 1:
                return (
                    <Calibration data={formData} fields={calibrationOptions} onValuesChange={handleCalibrationChange} />
                );
            case 2:
                return (
                    <MeasurementPoints />
                );
            case 3:
                return (
                    <ToolNumberCustomData />
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
                                    {selected?.toolNumber ? selected?.toolNumber : t("createToolNumber")}
                                </p>
                                {selected?.toolNumber && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('status')} :
                                            <span className={styles.fadedText}>{selected?.status || ''}</span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('createdOn')} :
                                            <span className={styles.fadedText}>
                                                {dayjs(formData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss') || ''}
                                            </span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('modifiedOn')} :
                                            <span className={styles.fadedText}>
                                                {formData?.modifiedDateTime ? dayjs(formData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}
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

                                {selected?.toolNumber && (
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
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="NC Code Tabs">
                            <Tab label={t("main")} />
                            <Tab label={t("calibration")} />
                            <Tab label={t("measurement points")} />
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
                        {selected?.toolNumber ? t("save") : t("create")}
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
                <p>{t("deleteConfirmation")} <strong>{formData?.toolNumber}</strong>?</p>
            </Modal>
            <Modal
                title={t("copyToolNumber")}
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
                        label={t("toolNumber")}
                        name="toolNumber"
                        rules={[{ required: true, message: 'Please enter the Tool Number' }]}
                    >
                        <Input placeholder="Enter Tool Number" onChange={(e) => handleFieldChange(e, 'toolNumber')} />
                    </Form.Item>
                    <Form.Item
                        label={t("description")}
                        name="description"
                    >
                        <Input placeholder="Enter Description" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ToolNumberBody;
