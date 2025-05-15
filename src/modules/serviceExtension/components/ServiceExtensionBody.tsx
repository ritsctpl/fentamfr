import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/ServiceExtension.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Button, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ServiceExtensionContext } from '../hooks/serviceExtension';
import { createHook, deleteHook, updateHook } from '@services/serviceExtensionServices';

import HookForm from './ServiceExtensionForm';
import AttachmentList from './AttachmentTable';

interface ServiceExtensionBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null
    onClose: () => void;
    setCall: (number) => void;
    setFullScreen: (boolean) => void;
    itemRowData: any[];
    call: number;
    username: string
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    rowSelectedData: any;
}


const ServiceExtensionBody: React.FC<ServiceExtensionBodyProps> = ({ call, setCall,
    isAdding, selectedRowData, onClose, itemRowData, setFullScreen, username, setAddClick, fullScreen, rowSelectedData }) => {
    const { payloadData, setPayloadData, setShowAlert, activeTab, setActiveTab } = useContext<any>(ServiceExtensionContext);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [formValues, setFormValues] = useState<any[]>([]);
     // Flag to track if the error has been shown

    useEffect(() => {
        setActiveTab(0);
    }, [rowSelectedData])

    useEffect(() => {

        setFormValues(itemRowData);
    }, [itemRowData]);

    const handleOpenChange = () => {
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        // debugger
        setActiveTab(newValue);
        setAddClick(false);
    };


    const handleClose = () => {
        onClose();
    };


    const handleSave = (oEvent) => {
        message.destroy();
        const cookies = parseCookies();
        let associateIdErrorShown = false;
        const site = cookies.site;
        let flagToSave = true;
        // debugger
        const updatedRowData = {
            ...payloadData,
            userId: username,
            site: site
        };
        
        // Perform the save operation with updatedRowData
        if (payloadData.activityHookId == undefined || payloadData.activityHookId == null || payloadData.activityHookId == "") {
            message.error("Execution Point Id cannot be empty");
            flagToSave = false;
            return;
        }
        if (payloadData.targetClass == undefined || payloadData.targetClass == null || payloadData.targetClass == "") {
            message.error("Target class cannot be empty");
            flagToSave = false;
            return;
        }
        if (payloadData.targetMethod == undefined || payloadData.targetMethod == null || payloadData.targetMethod == "") {
            message.error("Target Method cannot be empty");
            flagToSave = false;
            return;
        } 
        // if (payloadData.hookClass == undefined || payloadData.hookClass == null || payloadData.hookClass == "") {
        //     message.error("Hook Class cannot be empty");
        //     flagToSave = false;
        //     return;
        // }
        // if (payloadData.hookMethod == undefined || payloadData.hookMethod == null || payloadData.hookMethod == "") {
        //     message.error("Hook Method cannot be empty");
        //     flagToSave = false;
        //     return;
        // }

        payloadData?.attachmentList.forEach(item => {
            if (!item?.associateId && !associateIdErrorShown) {
                message.error("Associate Id cannot be empty");
                flagToSave = false;
                associateIdErrorShown = true; // Set the flag to true after showing the error
            }
        });

       

        const oCreateHook = async () => { // Rename the inner function to avoid recursion
            try {
                if (oEvent.currentTarget.innerText == "Create" || oEvent.currentTarget.innerText == "बनाएं"
                    || oEvent.currentTarget.innerText == "ರಚಿಸಿ" || oEvent.currentTarget.innerText == "உருவாக்க") {
                    const createResponse = await createHook(updatedRowData);
                    if (createResponse) {
                        if (createResponse.errorCode) {
                            message.error(createResponse.message);
                        }
                        else {
                            message.success(createResponse.message_details.msg);
                            setCall(call + 1);
                            setShowAlert(false);
                            onClose();
                        }
                    }
                }

                else if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें"
                    || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    const updateResponse = await updateHook(updatedRowData);
                    if (updateResponse) {
                        if (updateResponse.errorCode) {
                            message.error(updateResponse.message);
                        }
                        else {
                            message.success(updateResponse.message_details.msg);
                            setCall(call + 1);
                            setShowAlert(false);
                        }
                    }

                }


            } catch (error) {
                console.error('Error creating :', error);
            }
        };

        if (flagToSave == true)
            oCreateHook();


    };




    const handleCancel = () => {
        // console.log("Cancel clicked");
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                // Proceed with the API call if confirmed
                onClose();
            },
            onCancel() {
                //   console.log('Action canceled');
            },
        });


    };





    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleConfirmDelete = () => {
        const oDeleteHook = async () => {
            const cookies = parseCookies();
            const site = cookies.site;

            try {
                const activityHookId: string = selectedRowData.activityHookId;
                const userId = username;
                // debugger
                const response = await deleteHook(site, activityHookId, userId);
                if (!response.errorCode) {
                    message.success(response.message_details.msg);
                    setCall(call + 1);
                    onClose();
                }

            } catch (error) {
                console.error('Error deleting hook:', error);
            }
        };

        oDeleteHook();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        // debugger
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            activityHookId: selectedRowData?.activityHookId + "_COPY" || '',
            description: ''
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        if (fieldName != 'description') {
            formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }

        // console.log(`Field Change: ${fieldName}`, formattedValue); // Debugging line
        // Set field value
        form.setFieldsValue({ [fieldName]: formattedValue });
    };



    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then((values) => {
                const cookies = parseCookies();
                const site = cookies.site;
                const updatedRowData: any = {
                    ...payloadData,
                    site: site,
                    userId: username
                };
                updatedRowData.activityHookId = values.activityHookId;
                updatedRowData.description = values.description;
                // Perform the save operation with updatedRowData
                delete updatedRowData.createdDateTime;
                delete updatedRowData.modifiedDateTime;

                if (updatedRowData.activityHookId == null || updatedRowData.activityHookId == "" || updatedRowData.activityHookId == undefined) {
                    message.error("Execution Point Id cannot be empty");
                    return;
                }

                const oCopyHook = async () => { // Rename the inner function to avoid recursion

                    try {

                        const copyResponse = await createHook(updatedRowData);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            setShowAlert(false);
                            onClose();
                        }



                    } catch (error) {
                        console.error('Error copying hook:', error);
                    }
                };

                oCopyHook();
                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                // console.log('Validation Failed:', errorInfo);
            });
    };

    const { t } = useTranslation();

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <div style={{ overflowY: 'auto', marginTop: '10px', maxHeight: 'calc(100vh - 225px', }}><HookForm onFinish={handleSave} /></div>)

            case 1:
                return (
                    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px', }}>< AttachmentList /></div>)

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
                                    {selectedRowData ? selectedRowData?.activityHookId : t('createServiceExtension')}
                                </p>
                                {selectedRowData && (
                                    <>

                                        <p className={styles.dateText}>
                                            {t('createdDate')}
                                            <span className={styles.fadedText}>
                                                {selectedRowData.createdDateTime
                                                    ? dayjs(selectedRowData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('modifiedTime')}
                                            <span className={styles.fadedText}>
                                                {selectedRowData.modifiedDateTime
                                                    ? dayjs(selectedRowData?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span>
                                        </p>

                                    </>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                <Tooltip title={fullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                                    <Button
                                        onClick={handleOpenChange}
                                        className={styles.actionButton}
                                    >
                                        {fullScreen ? <CloseFullscreenIcon sx={{ color: '#1874CE' }} /> : <OpenInFullIcon sx={{ color: '#1874CE' }} />}
                                    </Button>
                                </Tooltip>

                                {selectedRowData && (
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

                                <Tooltip title="Close">
                                    <Button onClick={handleClose} className={styles.actionButton}>
                                        <CloseIcon sx={{ color: '#1874CE' }} />
                                    </Button>
                                </Tooltip>
                            </div>


                        </div>
                    </div>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Item Maintenance Tabs">
                            <Tab label={t("main")} />
                            {/* <Tab label={t("attachment")} /> */}
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer}>
                <div className={styles.floatingButtonContainer}
                    style={{ position: 'fixed', bottom: '15px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
                >
                    <Button type='primary'
                        // className={`${styles.floatingButton}`}
                        onClick={handleSave}
                        style={{
                            width: 'auto', // Increased width
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '12px'
                        }}
                    >
                        {selectedRowData ? t("save") : t("create")}
                    </Button>
                    <Button
                        className={` ${styles.cancelButton}`}
                        onClick={handleCancel}
                        style={{
                            width: 'auto', // Increased width
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '12px'
                        }}
                    >
                        {t("cancel")}
                    </Button>
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
                <p>{t("extensionDeleteMessage")}: <strong>{selectedRowData?.activityHookId}</strong>?</p>
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
                        activityHookId: selectedRowData?.activityHookId || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        label={t("executionPointId")}
                        name="activityHookId"
                        rules={[{ required: true, message: 'Please enter the Execution Point Id' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'activityHookId')} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t("description")}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>



    );
};

export default ServiceExtensionBody;