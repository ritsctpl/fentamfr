import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/WorkflowStates.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { Form, Input, message, Button, Modal, Tooltip, Select } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, } from '@mui/material';
import dayjs from 'dayjs';
import { createApiConfiguration, deleteApiConfiguration, updateApiConfiguration, } from '@services/apiConfigurationService';
import { useTranslation } from 'react-i18next';
import { useMyContext } from '../hooks/WorkflowStatesContext';
import WorlFlowStatesForm from './WorkflowStatesForm';
import { parseCookies } from 'nookies';
import { createWorkFlowStatesMaster, deleteWorkFlowStatesMaster, updateWorkFlowStatesMaster } from '@services/workflowStatesMasterService';
const { Option } = Select

interface CustomData {
    customData: string;
    value: string;
}

interface ItemData {
    activityId?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
}



interface ApiConfigurationMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null
    onClose: () => void;
    setFullScreen: (boolean) => void;
    itemRowData: ItemData[];
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    call: number;
    setCall: (number) => void;
}





const ApiConfigurationMaintenanceBody: React.FC<ApiConfigurationMaintenanceBodyProps> = ({
    isAdding, selectedRowData, onClose, call, setCall, setFullScreen, setAddClick, fullScreen, }) => {


    const { payloadData, setPayloadData, showAlert, setShowAlert } = useMyContext();
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    // const [encodedXslt, setEncodedXslt] = useState<any>();
    // const [encodedJsonAta, setEncodedJsonAta] = useState<any>();
    const [form] = Form.useForm();

    let encodedXslt, encodedJsonAta;



    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        // console.log("table data on tab change: ", customData);
        setActiveTab(newValue);
        setAddClick(false);
        // debugger;
    };

    const handleOpenChange = () => {
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);
    }


    const handleClose = () => {
        onClose();
    };


    const handleSave = async (oEvent) => {
        message.destroy();
        let flagToSave = true, flagToEncode = true;
        let buttonLabel = oEvent.currentTarget.innerText;


        if (payloadData?.name == "" || payloadData?.name == null || payloadData?.name == undefined) {
            flagToEncode = false;
            message.error("Name cannot be empty");
            return;
        }

        if (payloadData?.appliesTo?.length == 0 || payloadData?.appliesTo == "" || payloadData?.appliesTo == null || payloadData?.appliesTo == undefined) {
            flagToEncode = false;
            message.error("AppliesTo cannot be empty");
            return;
        }




        const oCreateConfig = async () => { // Rename the inner function to avoid recursion

            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const user = cookies?.rl_user_id
                let updatedRequest;
                updatedRequest = {
                    site: site,
                    name:  payloadData?.name,
                    description:  payloadData?.description,
                    appliesTo: payloadData?.appliesTo,
                    editableFields: payloadData?.editableFields,
                    isEnd: payloadData?.isEnd,
                    isActive: payloadData?.isActive,
                    userId: user
                }

                if (buttonLabel == "Create" || buttonLabel == "बनाएं"
                    || buttonLabel == "ರಚಿಸಿ" || buttonLabel == "உருவாக்க") {
                    try {
                        const createResponse = await createWorkFlowStatesMaster(updatedRequest);
                        if (createResponse) {
                            if (createResponse?.errorCode) {
                                message.error(createResponse?.message);
                            }
                            else {
                                setCall(call + 1);
                                setShowAlert(false);
                                message.success(createResponse?.message_details?.msg);
                                onClose();
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error creating spec:', error);
                    }
                }

                else if (buttonLabel == "Save" || buttonLabel == "सहेजें" ||
                    buttonLabel == "ಉಳಿಸಿ" || buttonLabel == "சேமிக்க") {

                    if (flagToSave) {
                        try {
                            const updateResponse = await updateWorkFlowStatesMaster(updatedRequest);
                            if (updateResponse) {
                                if (updateResponse?.errorCode) {
                                    message.error(updateResponse?.message);
                                }
                                else {
                                    setShowAlert(false);
                                    message.success(updateResponse?.message_details?.msg);
                                    setCall(call + 1);
                                }
                            }
                        }
                        catch (error) {
                            console.error('Error updating configuration:', error);
                        }
                    }
                }

            } catch (error) {
                console.error('Error creating configuration:', error);
            }
        };

        if (flagToEncode == true) {

        }
        if (flagToSave == true) {
            try {
                await oCreateConfig();
            }
            catch (e) {
                console.error("Error in creating configuration", e);
            }

        }

    };




    const handleCancel = () => {
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
        const oDeleteConfig = async () => { // Rename the inner function to avoid recursion
            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const request = {
                    site: site,
                    name: payloadData?.name,
                  }
                try {
                    const response = await deleteWorkFlowStatesMaster(request); // Assuming retrieveItem is an API call or a data fetch function
                    if (!response.errorCode) {
                        message.success(response?.message_details?.msg);
                        setCall(call + 1);
                        onClose();
                        setShowAlert(false);
                    }
                    else {
                        message.error(response?.message);
                    }
                }
                catch (e) {
                    console.error("Error in deleting the configuration", e);
                }
            } catch (error) {
                console.error('Error deleting configuration:', error);
            }
        };

        oDeleteConfig();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        // debugger
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            name: selectedRowData?.name + "_COPY" || '',
            description: '',
        });
        setPayloadData((prev) => ({
            ...prev,
            name: selectedRowData?.name + "_COPY" || '',
            description: '',
        }))
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        formattedValue = value.replace(/ /g, '').replace(/[^a-zA-Z0-9_]/g, '');

        // console.log(`Field Change: ${fieldName}`, formattedValue); // Debugging line
        // Set field value
        form.setFieldsValue({ [fieldName]: formattedValue });
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: formattedValue
        }))
    };


    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then(async (values) => {
                // Add your copy logic here with the form values
                // console.log('Activity copied:', values);

                let flagToSave = true, flagToEncode = true;

                if (payloadData?.name == "" || payloadData?.name == null || payloadData?.name == undefined) {
                    flagToEncode = false;
                    message.error("Name cannot be empty");
                    return;
                }

                if (payloadData?.appliesTo?.length == 0 || payloadData?.appliesTo == "" || payloadData?.appliesTo == null || payloadData?.appliesTo == undefined) {
                    flagToEncode = false;
                    message.error("AppliesTo cannot be empty");
                    return;
                }

                const oCopyConfiguration = async () => { // Rename the inner function to avoid recursion
                    let updatedRequest;
                    const cookies = parseCookies();
                    const site = cookies?.site;
                    const user = cookies?.rl_user_id
                    try {
                        updatedRequest = {
                            site: site,
                            name: form.getFieldsValue()?.name,
                            description: form.getFieldsValue()?.description,
                            appliesTo: payloadData?.appliesTo,
                            editableFields: payloadData?.editableFields,
                            isEnd: payloadData?.isEnd,
                            isActive: payloadData?.isActive,
                            userId: user
                        }

                        try {
                            const copyResponse = await createWorkFlowStatesMaster(updatedRequest);
                            if (copyResponse?.errorCode) {
                                message.error(copyResponse?.message);
                            }
                            else {
                                setCall(call + 1);
                                message.success(copyResponse?.message_details?.msg);
                                setShowAlert(false);
                                onClose();
                            }
                        }
                        catch (e) {
                            console.error("Error in copying the configuration", e);
                        }

                    } catch (error) {
                        console.error('Error copying configuration:', error);
                    }
                };

                if (flagToEncode == true) {

                }
                if (flagToSave == true) {
                    try {
                        await oCopyConfiguration();
                    }
                    catch (e) {
                        console.error("Error in copying the configuration", e);
                    }

                }

                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };


    const { t } = useTranslation();


    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (<div

                    style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px', marginLeft: '10%' }}
                > <WorlFlowStatesForm /> </div>)

            default:
                return null;
        }
    };

    const handleSelectChange = (fieldName: string, value: string) => {
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: value
        }));
        setShowAlert(true);
    }

    // console.log("Payload data from boy content: ", payloadData);
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData?.name : t('createState')}
                                </p>
                                {selectedRowData && (
                                    <>

                                        <p className={styles.dateText}>
                                            {t('createdDate')}
                                            <span className={styles.fadedText}>
                                                {selectedRowData?.createdDateTime
                                                    ? dayjs(selectedRowData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('modifiedTime')}
                                            <span className={styles.fadedText}>
                                                {payloadData?.lastModifiedDateTime
                                                    ? dayjs(payloadData?.lastModifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
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
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer} style={{ marginTop: '-10%' }}>
                <div className={styles.floatingButtonContainer}
                    style={{ position: 'fixed', bottom: '30px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
                >
                    <Button type='primary'
                        onClick={handleSave}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {selectedRowData ? t("save") : t("create")}
                    </Button>
                    <Button
                        className={` ${styles.cancelButton}`}
                        onClick={handleCancel}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                <p>{t("Do you want to delete this state")}
                    : <strong>{selectedRowData?.name}</strong>?
                </p>
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
                        activityId: selectedRowData?.name || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        label={t("name")}
                        name="name"
                        required
                    >
                        <Input placeholder="" value={payloadData?.name} onChange={(e) => handleFieldChange(e, 'name')} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t("description")}
                    >
                        <Input placeholder="" value={payloadData?.description} onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>

                    {/* <Form.Item
                        label={t('httpMethod')}
                        required
                    >
                        <Select
                            value={payloadData?.httpMethod}
                            onChange={(value) => handleSelectChange("httpMethod", value)}
                        >
                            <Option value="POST">POST</Option>
                            <Option value="GET">GET</Option>
                            <Option value="PUT">PUT</Option>
                            <Option value="DELETE">DELETE</Option>
                        </Select>
                    </Form.Item> */}

                </Form>
            </Modal>



        </div>



    );
};

export default ApiConfigurationMaintenanceBody;