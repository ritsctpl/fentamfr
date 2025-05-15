import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '@modules/processOrderRelease/styles/ProcessOrderRelease.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip } from 'antd';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import DynamicForm from '@modules/processOrderRelease/components/DynamicForm';
import { ProcessOrderReleaseData } from '@services/processOrderService';
import { ProcessOrderReleaseContext } from '@modules/processOrderRelease/hooks/ProcessOrderReleaseUseContext';

interface ProcessOrderReleaseBodyProps {
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
    SelectRow: (val: any) => void;
}

const ProcessOrderReleaseBody: React.FC<ProcessOrderReleaseBodyProps> = ({ SelectRow, selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose,
    setFullScreen }) => {

    const { formData, setFormData ,setFormChange, formChange } = useContext<any>(ProcessOrderReleaseContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState<number>(0);
    const [oper, setOper] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);


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
                    form.resetFields()
                    setFormData({...formData, qtyToRelease: 0})
                },
                onCancel() { },
            });
        }
        else {
            onClose();
            setFormChange(false)
            form.resetFields()
            setFormData({...formData, qtyToRelease: 0})
        }
    };
    
    const handleSave = async () => {
        
        const errors = [];
        
        if (formData?.qtyToRelease < 0) {
            errors.push('Quantity To Release must be a non-negative number');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        try {
            
            setLoading(true);
            
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;
            const orderPayload = {
                site: site,
                user: userId,
                processOrder: formData?.orderNumber,
                qtyToRelease: formData?.qtyToRelease || 0,
                plannedMaterial: formData?.material,
                materialVersion: formData?.materialVersion,
            }
            
            const payload = {
                orders: [orderPayload]
            };
            
            const response = await ProcessOrderReleaseData(site, payload);
            
            if (response[0].status === 'FAILED') {
                message.error(response[0].message)
            }
            else {
                message.success(response[0].message)
                setCall(call + 1);
                setFormChange(false)
                SelectRow(formData)
                form.resetFields()
                setFormData({...formData, qtyToRelease: 0})
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error('An error occurred while Releasing the Process Order.');
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
                    setOper(true);
                    setFormChange(false);
                    form.resetFields()
                    setFormData({...formData, qtyToRelease: 0})
                },
                onCancel() { },
            });
        }
        else {
            onClose();
            setOper(true);
            setFormChange(false);
            form.resetFields()
            setFormData({...formData, qtyToRelease: 0})
        }
    };

    const handleSelectionChange = (changedValues: any) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
        setFormChange(true)
    };

    const fieldsSelectionOptions = [
        'status',
        'orderType',
        'orderNumber',
        'material',
        'materialVersion',
        'recipe',
        'recipeVersion',
        'mrpController',
        'productionScheduler',
        'reservationNumber',
        'productionStartDate',
        'productionFinishDate',
        'actualStartDate',
        'actualFinishDate',
        'targetQuantity',
        'priority',
        'availableQtyToRelease',
        'qtyToRelease',
        'inUse',
        'uom',
        'measuredUom',
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <DynamicForm
                        data={formData}
                        fields={fieldsSelectionOptions}
                        onValuesChange={handleSelectionChange}
                    />
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
                                    {selected?.orderNumber ? selected?.orderNumber : t("releaseProcessOrder")}
                                </p>
                                {selected?.orderNumber && (
                                    <>
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
                    <button
                        className={`${styles.floatingButton} ${styles.saveButton}`}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            selected?.activityGroupName ? t("release") : t("release")
                        )}
                    </button>
                    <button
                        className={`${styles.floatingButton} ${styles.cancelButton}`}
                        onClick={handleCancel}
                    >
                        {t("cancel")}
                    </button>
                </div>
            </footer>
            {/* <div style={{height:'50px'}}>k</div> */}
        </div>
    );
};

export default ProcessOrderReleaseBody;