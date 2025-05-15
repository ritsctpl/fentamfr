import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/NcGroupMaintenance.module.css';
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
import { NcGroupContext } from '../hooks/ncGroupContext';
import {  createNCGroup,  deleteNcGroup,  updateNCGroup } from '@services/ncGroupServices';

import NcCode from './NcCode';
import NcGroupForm from './NcGroupForm';
import OperationList from './operationList';


interface NcGroupMaintenanceBodyProps {
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


const NcGroupMaintenanceBody: React.FC<NcGroupMaintenanceBodyProps> = ({ call, setCall,
    isAdding, selectedRowData, onClose, itemRowData, setFullScreen, username, setAddClick, fullScreen, rowSelectedData }) => {
    const { payloadData, setPayloadData, setShowAlert, activeTab, setActiveTab } = useContext<any>(NcGroupContext);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [formValues, setFormValues] = useState<any[]>([]);

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
        const cookies = parseCookies();
        const site = cookies.site;
        let flagToSave = true;
        debugger
        // console.log("Form values: ", formValues);
        const updatedRowData = {
            ...payloadData,
            userId: username,
            site: site
        };
        // Perform the save operation with updatedRowData
        console.log("Request:", updatedRowData);
        if (payloadData.ncGroup == undefined || payloadData.ncGroup == null || payloadData.ncGroup == "") {
            message.error("NC Group cannot be empty");
            flagToSave = false;
            return;
        }

        if (payloadData.operationList.length > 0) {
            if (payloadData.operationList.some(operation => operation.operation == "" || operation.operation == null || operation.operation == undefined)) {
                message.error("Operation cannot be empty");
                flagToSave = false;
                return;
            }
        }

        const oCreateNcGroup = async () => { // Rename the inner function to avoid recursion
            try {
                if (oEvent.currentTarget.innerText == "Create" || oEvent.currentTarget.innerText == "बनाएं"
                    || oEvent.currentTarget.innerText == "ರಚಿಸಿ" || oEvent.currentTarget.innerText == "உருவாக்க") {
                    const createResponse = await createNCGroup(updatedRowData);
                    console.log("Created response: ", createResponse);
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
                    const updateResponse = await updateNCGroup(updatedRowData);
                    console.log("Updated response: ", updateResponse);
                    if (updateResponse) {
                        if (updateResponse.errorCode) {
                            message.error(updateResponse.message);
                        }
                        else {
                            message.success(updateResponse.message_details.msg);
                            setCall(call + 1);
                            setShowAlert(false);
                            // onClose();
                        }
                    }

                }


            } catch (error) {
                console.error('Error creating :', error);
            }
        };

        if (flagToSave == true)
            oCreateNcGroup();


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
        const oDeleteNCGroup = async () => {
            const cookies = parseCookies();
            const site = cookies.site;

            try {
                const ncGroup: string = selectedRowData.ncGroup;
                const userId = username;
                debugger
                const response = await deleteNcGroup(site, ncGroup, userId);
                if (!response.errorCode) {
                    message.success(response.message_details.msg);
                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted nc group: ", response);
                }
            } catch (error) {
                console.error('Error deleting nc group:', error);
            }
        };

        oDeleteNCGroup();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        // debugger
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            ncGroup: selectedRowData.ncGroup + "_COPY" || '',
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
                updatedRowData.ncGroup = values.ncGroup;
                updatedRowData.description = values.description;
                // Perform the save operation with updatedRowData
                delete updatedRowData.createdDateTime;
                delete updatedRowData.modifiedDateTime;
                console.log("Copy request:", updatedRowData);

                if (updatedRowData.ncGroup == null || updatedRowData.ncGroup == "" || updatedRowData.ncGroup == undefined) {
                    message.error("NC Group cannot be empty");
                    return;
                }

                const oCopyNcGroup = async () => { // Rename the inner function to avoid recursion

                    try {

                        const copyResponse = await createNCGroup(updatedRowData);
                        console.log("Copy NC Group response: ", copyResponse);
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
                        console.error('Error copying nc group:', error);
                    }
                };

                oCopyNcGroup();
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
                return <NcGroupForm rowSelectedData={rowSelectedData} onChange={function (values: Record<string, any>): void {
                    throw new Error('Function not implemented.');
                }} />;



            case 1:
                return (
                    <NcCode setActiveTab={setActiveTab} />
                );

            case 2:
                return (
                    <OperationList />
                );


            default:
                return null;
        }
    };

    // console.log("Payload data from boy content: ", payloadData);
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData.ncGroup : t('createNCGroup')}
                                </p>
                                {selectedRowData && (
                                    <>

                                        <p className={styles.dateText}>
                                            {t('createdDate')}
                                            <span className={styles.fadedText}>
                                                {selectedRowData.createdDateTime
                                                    ? dayjs(selectedRowData.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('modifiedTime')}
                                            <span className={styles.fadedText}>
                                                {selectedRowData.modifiedDateTime
                                                    ? dayjs(selectedRowData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
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
                            <Tab label={t("ncCodeDPMOCategory")} />
                            <Tab label={t("operationList")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer}>
                <div className={styles.floatingButtonContainer}
                    style={{ position: 'fixed', bottom: '30px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
                >
                    <Button type='primary'
                        // className={`${styles.floatingButton}`}
                        onClick={handleSave}
                        style={{  width: 'auto', // Increased width
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
                        style={{   width: 'auto', // Increased width
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
                <p>{t("ncGroupDeleteMessage")}: <strong>{selectedRowData?.ncGroup}</strong>?</p>
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
                        ncGroup: selectedRowData?.ncGroup || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        label={t("ncGroup")}
                        name="ncGroup"
                        rules={[{ required: true, message: 'Please enter the NC group' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'ncGroup')} />
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

export default NcGroupMaintenanceBody;