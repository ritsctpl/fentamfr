import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/CycleTime.module.css';
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
import { addCycleTime, deleteCycleTime } from '@services/cycleTimeService';
import { CycleTimeUseContext } from '../hooks/CycleTimeUseContext';
import { defaultCycleTimeRequest } from '../types/cycleTimeTypes';
import CycleDynamicForm from './CycleDynamicForm';
import ResourceDetails from './ResourceDetails';


interface CycleTimeBodyProps {
    isAdding: boolean;
    selected: any;
    fullScreen: boolean;
    resetValue: boolean;
    call: number;
    onClose: () => void;
    setCall: (val: number) => void;
    setIsAdding: (val: boolean) => void;
    setFullScreen: (val: boolean) => void;
    setSelected: (val: any) => void;
}

const CycleTimeBody: React.FC<CycleTimeBodyProps> = ({ selected,
    fullScreen, setIsAdding, call, setCall, isAdding, onClose, setFullScreen, setSelected }) => {

    const { formData, setFormData, setFormChange, formChange, activeTab, setActiveTab, isFormDisabled, setIsFormDisabled } = useContext<any>(CycleTimeUseContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    // const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);

    useEffect(() => {
        if (!selected?.handle && activeTab === 1) {
            setActiveTab(0);
        }
    }, [selected?.handle, activeTab]);

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
                }
            });
        }
        else{
            onClose();
            setFormChange(false);
        }
    };

    const handleSave = async () => {
        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;
            
            // Validate required fields based on form state
            const hasResource = formData?.resource || formData?.resourceType;
            const hasOperation = formData?.operation;
            
            // Determine which time field is required
            if ((hasResource || hasOperation) && (!formData?.cycleTime && formData?.cycleTime !== 0)) {
                message.error(t('Please Enter Cycle Time'));
                return;
            }
            
            if (!hasResource && !hasOperation && (!formData?.manufacturedTime && formData?.manufacturedTime !== 0)) {
                message.error(t('Please Enter Production Time'));
                return;
            }

            const timeValue = formData.time || '00:00:00';
            
            const formattedTime = typeof timeValue === 'string' ? 
                timeValue : 
                dayjs(timeValue).isValid() ? 
                    dayjs(timeValue).format('HH:mm:ss') : 
                    '00:00:00'; 

            const payload = {
                ...formData,
                site: site,
                userId: userId,
                time: formattedTime,
                cycleTimeRequestList: formData?.cycleTimeResponseList 
                    ? formData.cycleTimeResponseList.map(item => ({
                        ...item,
                        site: site
                    }))
                    : []
            };

            const response = await addCycleTime(site, userId, payload);
            if (response.message) {
                message.error(response.message)
            }
            else {
                message.success(response.message_details.msg)
                setIsAdding(false);
                setCall(call + 1);
                setFormChange(false)
                setIsFormDisabled(false);
            }
        }
        catch (error) {
            message.error('An error occurred while saving the CycleTime.');
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
                    setFormChange(false);
                    onClose();
                }
            });
        }
        else{
            onClose();
            setFormChange(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };


    const handleDeleteCycleTime = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        const newValue = {
            ...selected,
        }

        try {
            const response = await deleteCycleTime(site, userId, newValue);
            if (response.message) {
                message.error(response.message)
            }
            else {
                message.success(response.message_details.msg)
                setIsAdding(false);
                setCall(call + 1);
                setFormChange(false)
                setFormData(defaultCycleTimeRequest)
            }
        } catch (error) {
            message.error('Error deleting CycleTime.');
        }
        setIsModalVisible(false);
    };

    const fieldsFormData = [
        'resource',
        'resourceType',
        'workCenter',
        'operation',
        'operationVersion',
        'item',
        'itemVersion',
        'targetQuantity',
        'time',
        'cycleTime',
        'manufacturedTime',
    ];

    const handleValuesChange = (changedValues: any) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues
        }));
        setFormChange(true);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <CycleDynamicForm data={formData}
                        fields={fieldsFormData}
                        onValuesChange={handleValuesChange} />
                );

            case 1:
                return (
                    <ResourceDetails selected={selected} setSelected={setSelected} />
                    // <h1>Hello</h1>
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
                                    {selected ? selected?.resourceType || selected?.workCenter || '---' : t("createCycleTime")}
                                </p>
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

                                {selected?.handle && (
                                    <Tooltip title={t("delete")}>
                                        <Button onClick={handleOpenModal} className={styles.actionButton}>
                                            <DeleteIcon />
                                        </Button>
                                    </Tooltip>
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
                            {selected?.handle && (
                                <Tab label={t("resourceDetails")} />
                            )}
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
                        {selected?.handle ? t("update") : t("create")}
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
                onOk={handleDeleteCycleTime}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("areYouSure")}
                    {/* <strong>{formData?.Resource}?</strong> */}
                    <strong>Cycle Time</strong></p>
            </Modal>
        </div>
    );
};

export default CycleTimeBody;