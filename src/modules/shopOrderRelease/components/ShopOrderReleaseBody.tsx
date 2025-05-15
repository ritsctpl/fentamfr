import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '@modules/shopOrderRelease/styles/ShopOrderRelease.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip } from 'antd';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { CreateActivityGroup, UpdateActivityGroup, createCopyActivityGroup, deleteActivityGroup } from '@services/activityGroupService';
import { ShopOrderReleaseContext } from '@modules/shopOrderRelease/hooks/ShopOrderReleaseUseContext';
import { defaultShopOrderReleaseTypesRequest } from '@modules/shopOrderRelease/types/ShopOrderReleaseTypes';
import DynamicForm from '@modules/shopOrderRelease/components/DynamicForm';
import { ShopOrderReleaseData } from '@services/shopOrderService';

interface ShopOrderReleaseBodyProps {
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

const ShopOrderReleaseBody: React.FC<ShopOrderReleaseBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose,
    setFullScreen }) => {

    const { formData, setFormData } = useContext<any>(ShopOrderReleaseContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [oper, setOper] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const { setFormChange } = useContext(ShopOrderReleaseContext)

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
        setLoading(true);
        const errors = [];
        const availableQty = formData?.availableQtyToRelease;

        if (!formData?.plannedMaterial) {
            errors.push('Planned Material');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (formData?.qtyToRelease < 0) {
            errors.push('Quantity To Release must be a non-negative number');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (formData?.qtyToRelease > availableQty) {
            errors.push(`Quantity To Release must be less than or equal to ${availableQty}`);
        }

        if (formData?.priority < 0) {
            errors.push('Priority must be a non-negative number');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;
            const payload = {
                ...formData,
                site: site,
                userBO: userId,
                user: userId,
            }
            const response = await ShopOrderReleaseData(site, payload);
            console.log(response, 'ressss');

            if (response.message) {
                message.error(response.message)
            }
            else {
                console.log(response, 'called');
                if (response.message_details.msg_type == "S") {
                    console.log(response, 'called');
                    message.success(response.message_details.msg)
                    setCall(call + 1);
                    setFormChange(false)
                } else {
                    console.log(response, 'called');
                    message.error(response.message_details.msg)
                    setCall(call + 1);
                    setFormChange(false)
                }
                setLoading(false);
            }
        } catch (error) {
            message.error('An error occurred while saving the Shop Order.');
            setLoading(false);
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

    const handleSelectionChange = (changedValues: any) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
        setFormChange(true)
    };

    console.log(formData, 'formsss');


    const fieldsSelectionOptions = [
        'status',
        'orderType',
        'shopOrder',
        'plannedMaterial',
        'materialVersion',
        'bomType',
        'plannedBom',
        'bomVersion',
        'plannedRouting',
        'routingVersion',
        'lcc',
        'plannedWorkCenter',
        'buildQty',
        'availableQtyToRelease',
        'qtyToRelease',
        'addToNewProcessLot',
        'plannedStart',
        'scheduledStart',
        'customerOrder',
        'priority',
        'orderedQty',
        'plannedCompletion',
        'scheduledEnd',
        'customer',
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
                                    {selected?.shopOrder ? selected?.shopOrder : t("releaseShopOrder")}
                                </p>
                                {selected?.shopOrder && (
                                    <>
                                        {/* <p className={styles.dateText}>
                                            {t('description')} :
                                            <span className={styles.fadedText}>{formData?.activityGroupDescription || ''}</span>
                                        </p> */}
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

export default ShopOrderReleaseBody;