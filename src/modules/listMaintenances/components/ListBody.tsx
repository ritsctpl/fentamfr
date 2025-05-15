import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '@modules/listMaintenances/styles/list.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ListContext } from '../hooks/ListContext';
import OpcTagTable from './ListTab';
import ListDynamicForm from './ListDynamicForm';
import { defaultListRequest } from '../types/ListTypes';
import { createList, deleteList, updateList } from '@services/listServices';

interface ListBodyProps {
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

const ListBody: React.FC<ListBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose,
    resetValue, setFullScreen }) => {

    const { formData, setFormData, setFormChange, activeTab, setActiveTab } = useContext<any>(ListContext)
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
        if (!formData?.list) {
            errors.push('List');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        // if (formData.certificationList && formData.certificationList.length > 0) {
        //     const invalidCertifications = formData.certificationList.some(cert => !cert.certificationBO || !cert.certificationDescription);
        //     if (invalidCertifications) {
        //         errors.push('Certification (certificationBO and certificationDescription required)');
        //         message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
        //         return;
        //     }
        // }

        // if (formData.opcTagList && formData.opcTagList.length > 0) {
        //     const hasInvalidOpcTags = formData.opcTagList.every(tag =>
        //         !tag.tagName && !tag.tagUrl && !tag.identity
        //     );
        //     if (hasInvalidOpcTags) {
        //         errors.push('OPG Tag (all fields are empty)');
        //         message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
        //         return;
        //     }
        // }

        // if (formData.activityHookList && formData.activityHookList.length > 0) {
        //     const invalidActivityHooks = formData.activityHookList.some(hook => !hook.activity || !hook.hookPoint);
        //     if (invalidActivityHooks) {
        //         errors.push('Activity Hooks (activity and hookPoint required)');
        //         message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
        //         return;
        //     }
        // }

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
                const response = await updateList(site, userId, payload);
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
                const response = await createList(site, userId, payload);
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setIsAdding(false);
                    setCall(call + 1);
                    setFormChange(false)
                    setFormData(defaultListRequest)
                    setActiveTab(0)
                }
            }
        } catch (error) {
            message.error('An error occurred while saving the User Group.');
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
        const deleteListData = async () => {
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;

            try {
                const payload = formData;
                const response = await deleteList(site, userId, payload);
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

        deleteListData();
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.setFieldsValue({
            list: formData?.list ? `${formData.list}_COPY` : '',
            description: '', // Set description to empty
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        const formattedValue = value;
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
                list: values?.list,
                description: values?.description,
            };
            const response = await createList(site, userId, updatedRowData);
            setCall(call + 1);
            onClose();
            setActiveTab(0)
            handleCloseCopyModal();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const fieldsFormData = [
        'category',
        'list',
        'description',
        'maximumNumberOfRow',
        'type',
        'allowOperatorToChangeColumnSequence',
        'allowOperatorToSortRows',
        'allowMultipleSelection',
        'showAllActiveSfcsToOperator',
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
                    <ListDynamicForm 
                        data={formData}
                        fields={fieldsFormData}
                        onValuesChange={handleValuesChange} 
                    />
                );
            case 1:
                return (
                    <OpcTagTable/>
                );
            default:
                return null;
        }
    };

    console.log(formData,'formsData');
    

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selected?.list ? selected?.list : t("createList")}
                                </p>
                                {selected?.list && (
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
                                                {dayjs(selected.updatedDateTime).format('DD-MM-YYYY HH:mm:ss')}
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

                                {selected?.list && (
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
                        <Tabs value={activeTab}  onChange={handleTabChange} aria-label="Activity Group Tabs">
                            <Tab label={t("main")} /> 
                            <Tab label={t("list")} />
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
                        {selected?.list ? t("save") : t("create")}
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
                <p>{t("deleteConfirmation")} <strong>{formData?.list}</strong>?</p>
            </Modal>
            <Modal
                title={t("copyList")}
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
                        label={t("list")}
                        name="list"
                        rules={[{ required: true, message: 'Please enter the List' }]}
                    >
                        <Input placeholder="Enter List" onChange={(e) => handleFieldChange(e, 'list')} />
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

export default ListBody;