import React, { useState, useEffect, useContext } from 'react';
import styles from '@modules/ncCodeMaintenance/styles/ncCode.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NcCodeContext } from '@modules/ncCodeMaintenance/hooks/NcCodeUseContext';
import dayjs from 'dayjs';
import { defaultNcCodeRequest } from '@modules/ncCodeMaintenance/types/NcCodeTypes';
import { createNcCode, deleteNcCode, UpdateNcCode } from '@services/ncCodeService';
import NcCodeCustomData from '@modules/ncCodeMaintenance/components/NcCodeCustomData';
import NcCodeActivityHooks from '@modules/ncCodeMaintenance/components/NcCodeActivityHooks';
import OperationGroups from '@modules/ncCodeMaintenance/components/OperationGroups';
import Secondaries from '@modules/ncCodeMaintenance/components/Secondaries';
import DispositionRoutings from '@modules/ncCodeMaintenance/components/DispositionRoutings';
import NcGroups from '@modules/ncCodeMaintenance/components/NcGroups';
import NcDynamicForm from './NcDynamicForm';

interface NcCodeBodyProps {
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

const NcCodeBody: React.FC<NcCodeBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose, setFullScreen }) => {

    const { formData, setFormData, activeTab, setActiveTab, setFormChange, formChange } = useContext<any>(NcCodeContext)
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
        if(formChange){
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    onClose();
                    setFormChange(false);
                },
                onCancel() { },
            });
        }
        else{
            onClose();
            setFormChange(false);
        }
    };

    const handleSave = async () => {

        const errors = [];

        if (!formData?.ncCode) {
            errors.push('NC Code');
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
                const response = await UpdateNcCode(site, userId, payload);
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
                const response = await createNcCode(site, userId, payload);
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setIsAdding(false);
                    setCall(call + 1);
                    setFormChange(false)
                    setActiveTab(0)
                    setFormData(defaultNcCodeRequest)
                }
            }
        } catch (error) {
            message.error('An error occurred while saving the User Group.');
        }
    }


    const handleCancel = () => {
        if(formChange){
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    onClose();
                    setFormChange(false);
                    setOper(true)
                },
                onCancel() { },
            });
        }
        else{
            onClose();
            setOper(true);
            setFormChange(false);
        }
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
                const oDeleteNcCode = await deleteNcCode(site, userId, payload, currentSite);

                setCall(call + 1);
                onClose();
                if (!oDeleteNcCode.errorCode) {
                    message.success(oDeleteNcCode.message_details.msg);
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
            ncCode: formData?.ncCode ? `${formData?.ncCode}_COPY` : '',
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
                ncCode: values?.ncCode,
                description: values?.description,
                currentSite: site,
            };
            const response = await createNcCode(site, userId, updatedRowData);
            setCall(call + 1);
            onClose();

            handleCloseCopyModal();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleChange = (changedValues) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
        setFormChange(true)
    };

    const fieldsOptions = [
        'ncCode',
        'description',
        'status',
        'assignNCtoComponent',
        'ncCategory',
        'dpmoCategory',
        'ncDatatype',
        'collectRequiredNCDataonNC',
        'messageType',
        'ncPriority',
        'maximumNCLimit',
        'ncSeverity',
        'secondaryCodeSpecialInstruction',
        'canBePrimaryCode',
        'closureRequired',
        'autoClosePrimaryNC',
        'autoCloseIncident',
        'secondaryRequiredForClosure',
        'erpQNCode',
        'erpCatalog',
        'erpCodeGroup',
        'erpCode',
        'oeeQualityKPIRelevant'
    ];

    const handleFormChange = (changedValues) => {
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
                   <NcDynamicForm data={formData} fields={fieldsOptions} onValuesChange={handleFormChange}/>
                );
            case 1:
                return (
                    <OperationGroups />
                );
            case 2:
                return (
                    <DispositionRoutings/>
                );
            case 3:
                return (
                    <NcGroups/>
                );
            case 4:
                return (
                    <Secondaries />
                );
            case 5:
                return (
                    <NcCodeActivityHooks />
                );
            case 6:
                return (
                    <NcCodeCustomData />
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
                                    {selected?.ncCode ? selected?.ncCode : t("createNcCode")}
                                </p>
                                {selected?.ncCode && (
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

                                {selected?.ncCode && (
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
                            <Tab label={t("operationGroups")} />
                            <Tab label={t("dispositionRoutings")} />
                            <Tab label={t("ncGroups")} />
                            <Tab label={t("secondaries")} />
                            <Tab label={t("activityHooks")} />
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
                        {selected?.ncCode ? t("save") : t("create")}
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
                <p>{t("deleteConfirmation")} <strong>{formData?.ncCode}</strong>?</p>
            </Modal>
            <Modal
                title={t("copyNcCode")}
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
                        label={t("ncCode")}
                        name="ncCode"
                        rules={[{ required: true, message: 'Please enter the NC Code' }]}
                    >
                        <Input placeholder="Enter NC Code" onChange={(e) => handleFieldChange(e, 'ncCode')} />
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

export default NcCodeBody;
