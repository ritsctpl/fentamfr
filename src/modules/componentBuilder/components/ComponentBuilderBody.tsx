import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/ComponentBuilder.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { Form, Input, message, Button, Modal, Tooltip, Select, Switch } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, } from '@mui/material';
import dayjs from 'dayjs';
import { createApiConfiguration, deleteApiConfiguration, updateApiConfiguration, } from '@services/apiConfigurationService';
import { useTranslation } from 'react-i18next';
import { useMyContext } from '../hooks/componentBuilderContext';
import ApiConfigurationForm from './ComponentBuilderForm';
import { parseCookies } from 'nookies';
import { createComponent, deleteComponent, updateComponent } from '@services/componentBuilderService';
const { Option } = Select





interface ComponentBuilderBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null
    onClose: () => void;
    setFullScreen: (boolean) => void;
    // itemRowData: any;
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    call: number;
    setCall: (number) => void;
}





const ComponentBuilderBody: React.FC<ComponentBuilderBodyProps> = ({
    isAdding, selectedRowData, onClose, call, setCall, setFullScreen, setAddClick, fullScreen, }) => {


    const { payloadData, setPayloadData, showAlert, setShowAlert, isRequired, setIsRequired } = useMyContext();
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();




    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        // console.log("table data on tab change: ", customData);
        setActiveTab(newValue);
        setAddClick(false);
        // debugger;
    };

    const handleOpenChange = () => {
        debugger
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);
    }


    const handleClose = () => {
        onClose();
        setAddClick(false);
        setFullScreen(false);
        // setIsAdding(false);
        // setResetValue(true);
    };


    const handleSave = async (oEvent) => {
        message.destroy();
        let flagToSave = true;
        let buttonLabel = oEvent.currentTarget.innerText;


        if (payloadData?.componentLabel == "" || payloadData?.componentLabel == null || payloadData?.componentLabel == undefined) {
            message.error("Component Label cannot be empty");
            return;
        }

        if (isRequired && (payloadData?.defaultValue == "" || payloadData?.defaultValue == null || payloadData?.defaultValue == undefined)) {
            message.error("Default Value cannot be empty");
            return;
        }


        const oCreateComponent = async () => { // Rename the inner function to avoid recursion

            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const user = cookies?.rl_user_id
                let updatedRequest;
                updatedRequest = {
                    site: site,
                    // componentLabel: payloadData?.componentLabel,
                    // dataType: payloadData?.dataType,
                    // unit: payloadData?.unit,
                    // defaultValue: payloadData?.defaultValue,
                    // required: payloadData?.required,
                    // validation: payloadData?.validation,
                    // dropdownOptions: payloadData?.dropdownOptions,
                    ...payloadData,
                    userId: user,
                }

                if (buttonLabel == "Create" || buttonLabel == "बनाएं"
                    || buttonLabel == "ರಚಿಸಿ" || buttonLabel == "உருவாக்க") {
                    try {
                        const createResponse = await createComponent(updatedRequest);
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
                        console.error('Error creating component:', error);
                    }
                }

                else if (buttonLabel == "Save" || buttonLabel == "सहेजें" ||
                    buttonLabel == "ಉಳಿಸಿ" || buttonLabel == "சேமிக்க") {

                    if (flagToSave) {
                        try {
                            const updateResponse = await updateComponent(updatedRequest);
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
                            console.error('Error updating component:', error);
                        }
                    }
                }

            } catch (error) {
                console.error('Error creating component:', error);
            }
        };

        if (flagToSave == true) {
            try {
                await oCreateComponent();
            }
            catch (e) {
                console.error("Error in creating component", e);
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
                debugger
                const componenetLabel = selectedRowData?.componentLabel;
                const user = cookies?.rl_user_id
                const request = {
                    site: site,
                    componentLabel: componenetLabel,
                    userId: user
                }
                try {
                    const response = await deleteComponent(request); // Assuming retrieveItem is an API call or a data fetch function
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
            componentLabel: selectedRowData?.componentLabel + "_COPY" || '',
            defaultValue: '',
            required: false,
            validation: ''
        });

    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (value: any, fieldName: string) => {
        form.setFieldsValue({ [fieldName]: value });
    };


    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then(async (values) => {
                // Add your copy logic here with the form values
                // console.log('Activity copied:', values);

                let flagToSave = true;

                if (payloadData?.componentLabel == "" || payloadData?.componentLabel == null || payloadData?.componentLabel == undefined) {
                    message.error("Component Label cannot be empty");
                    return;
                }



                const oCopyComponent = async () => { // Rename the inner function to avoid recursion
                    let updatedRequest;
                    const cookies = parseCookies();
                    const site = cookies?.site;
                    const user = cookies?.rl_user_id
                    try {
                        updatedRequest = {
                            site: site,
                            componentLabel: form.getFieldValue('componentLabel'),
                            dataType: payloadData?.dataType,
                            unit: payloadData?.unit,
                            defaultValue: form.getFieldValue('defaultValue'),
                            required: form.getFieldValue('required'),
                            validation: form.getFieldValue('validation'),
                            userId: user
                        }

                        try {
                            const copyResponse = await createComponent(updatedRequest);
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
                            console.error("Error in copying the componenet", e);
                        }

                    } catch (error) {
                        console.error('Error copying component:', error);
                    }
                };


                if (flagToSave == true) {
                    try {
                        await oCopyComponent();
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

                    style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px', marginTop: '2%' }}
                > <ApiConfigurationForm setFullScreen={setFullScreen} /> </div>)

            default:
                return null;
        }
    };



    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split} >
                            <div style={{ marginTop: '-1.5%' }} >
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData?.componentLabel : t('createComponent')}
                                </p>
                                {selectedRowData && (
                                    <div style={{ marginTop: '-1%' }}>

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
                                                {payloadData?.modifiedDateTime
                                                    ? dayjs(payloadData?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span>
                                        </p>

                                    </div>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                {(payloadData?.dataType != 'Table' && payloadData?.dataType != 'Reference Table') &&
                                    <Tooltip title={fullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                                        <Button
                                            onClick={handleOpenChange}
                                            className={styles.actionButton}
                                        >
                                            {fullScreen ? <CloseFullscreenIcon sx={{ color: '#1874CE' }} /> : <OpenInFullIcon sx={{ color: '#1874CE' }} />}
                                        </Button>
                                    </Tooltip>
                                }

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

                    {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Item Maintenance Tabs">
                            <Tab label={t("main")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box> */}

                    <div style={{ borderTop: '1px solid #e0e0e0', marginTop: '0%' }}></div>
                    {/* <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px', marginTop: '2%' }}> */}
                    <ApiConfigurationForm setFullScreen={setFullScreen} />
                    {/* </div> */}
                </div>
            </div>
            <footer className={styles.footer} style={{ marginTop: '-10%' }}>
                <div className={styles.floatingButtonContainer}
                    style={{ position: 'fixed', bottom: '8px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
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
                <p>{t("deleteApiConfigMessage")}: <strong>{selectedRowData?.componentLabel}</strong>?</p>
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
                    layout="horizontal"
                    initialValues={{
                        componentLabel: selectedRowData?.componentLabel_COPY || '',
                        defaultValue: '',
                        required: false,
                        validation: ''
                    }}
                >
                    <Form.Item
                        label={t("componentLabel")}
                        name="componentLabel"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ marginBottom: '8px' }}
                        required
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e.target.value, 'componentLabel')} />
                    </Form.Item>

                    {/* <Form.Item
                        label={t('unit')}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ marginBottom: '8px' }}
                    >
                        <Input
                            value={payloadData?.unit}
                            onChange={(e) => handleFieldChange(e, 'unit')}
                        />
                    </Form.Item> */}
                    <Form.Item
                        label={t('defaultValue')}
                        labelCol={{ span: 8 }}
                        name="defaultValue"
                        wrapperCol={{ span: 12 }}
                        required={isRequired}
                        style={{ marginBottom: '8px' }}
                    >
                        <Input
                            onChange={(e) => handleFieldChange(e.target.value, 'defaultValue')}
                        />
                    </Form.Item>
                    <Form.Item
                        label={t('required')}
                        name="required"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ marginBottom: '8px' }}
                    >
                        <Switch
                            onChange={(checked) => handleFieldChange(checked, 'required')}
                        />
                    </Form.Item>
                    <Form.Item
                        label={t('validation')}
                        labelCol={{ span: 8 }}
                        name="validation"
                        wrapperCol={{ span: 12 }}
                        style={{ marginBottom: '8px' }}
                    >
                        <Input.TextArea
                            onChange={(e) => handleFieldChange(e.target.value, 'validation')}
                        />
                    </Form.Item>

                </Form>
            </Modal>



        </div>



    );
};

export default ComponentBuilderBody;