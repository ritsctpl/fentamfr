import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/WorkFlowMaintenance.module.css';
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
import { useMyContext } from '../hooks/workFlowContext';
import ApiConfigurationForm from './WorkFlowForm';
import { parseCookies } from 'nookies';
import LevelConfigurationTable from './levelConfigurationTable';
import AdvancedConfigurationForm from './AdvancedConfigurationForm';
const { Option } = Select

interface CustomData {
    customData: string;
    value: string;
}





interface ApiConfigurationMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null
    onClose: () => void;
    setFullScreen: (boolean) => void;
    itemRowData: any;
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    call: number;
    setCall: (number) => void;
}





const WorkFlowMaintenanceBody: React.FC<ApiConfigurationMaintenanceBodyProps> = ({
    isAdding, selectedRowData, onClose, call, setCall, setFullScreen, setAddClick, fullScreen, }) => {


    const { payloadData, setPayloadData, showAlert, setShowAlert } = useMyContext();
    // const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    // const [encodedXslt, setEncodedXslt] = useState<any>();
    // const [encodedJsonAta, setEncodedJsonAta] = useState<any>();
    const [form] = Form.useForm();
    const {activeTab,setActiveTab} = useMyContext();
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
        // debugger

        if (payloadData?.workFlow == "" || payloadData?.workFlow == null || payloadData?.workFlow == undefined) {
            flagToEncode = false;
            message.error("Work flow cannot be empty");
            return;
        }

        if (payloadData?.version == "" || payloadData?.version == null || payloadData?.version == undefined) {
            flagToEncode = false;
            message.error("Version cannot be empty");
            return;
        }

        payloadData?.levelConfigurationList?.map((item, index) => {
            if (item?.userRole == "" || item?.userRole == null || item?.userRole == undefined) {
                flagToSave = false;
                message.error("User Role cannot be empty");
                return;
            }
        }); 
        
        const hasEmptyUser = payloadData?.levelConfigurationList?.some((item) => {
            if (item?.user == "" || item?.user == null || item?.user == undefined) {
                flagToSave = false;
                message.error("User cannot be empty");
                return true;
            }
            return false;
        });
        
        const hasEmptyAction = payloadData?.levelConfigurationList?.some((item) => {
            if (item?.action == "" || item?.action == null || item?.action == undefined) {
                flagToSave = false;
                message.error("Action cannot be empty");
                return true;
            }
            return false;
        });

        const hasEmptyFinalApproval = payloadData?.levelConfigurationList?.some((item) => {
            if (item?.finalApproval == "" || item?.finalApproval == null || item?.finalApproval == undefined) {
                flagToSave = false;
                message.error("Final Approval has to be tue for atleast one level");
                return true;
            }
            return false;
        });

      



        const oCreateConfig = async () => { // Rename the inner function to avoid recursion

            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const user = cookies?.rl_user_id
                let updatedRequest;
                updatedRequest = {
                    site: site,
                   ...payloadData,
                    userId: user
                }
                

                if (buttonLabel == "Create" || buttonLabel == "बनाएं"
                    || buttonLabel == "ರಚಿಸಿ" || buttonLabel == "உருவாக்க") {
                    try {
                        // const createResponse = await createApiConfiguration(updatedRequest);
                        // if (createResponse) {
                        //     if (createResponse?.errorCode) {
                        //         message.error(createResponse?.message);
                        //     }
                        //     else {
                        //         setCall(call + 1);
                        //         setShowAlert(false);
                        //         // message.success(createResponse?.message_details?.msg);
                        //         message.success("Created Successfully");
                        //         onClose();
                        //     }
                        // }
                    }
                    catch (error) {
                        console.error('Error creating spec:', error);
                    }
                }

                else if (buttonLabel == "Save" || buttonLabel == "सहेजें" ||
                    buttonLabel == "ಉಳಿಸಿ" || buttonLabel == "சேமிக்க") {

                    if (flagToSave) {
                        try {
                            // const updateResponse = await updateApiConfiguration(updatedRequest);
                            // if (updateResponse) {
                            //     if (updateResponse?.errorCode) {
                            //         message.error(updateResponse?.message);
                            //     }
                            //     else {
                            //         setShowAlert(false);
                            //         // message.success(updateResponse?.message_details?.msg);
                            //         message.success("Updated Successfully");
                            //         setCall(call + 1);
                            //     }
                            // }
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
                const id = payloadData?.id;
                try {
                    const response = await deleteApiConfiguration(id); // Assuming retrieveItem is an API call or a data fetch function
                    if (!response.errorCode) {
                        // message.success(response?.message_details?.msg);
                        message.success("Deleted Successfully");
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
            workFlow: selectedRowData?.workFlow + "_COPY" || '',
            version: '',
            type: 'MFR'
        });
        // setPayloadData((prev) => ({
        //     ...prev,
        //     apiName: selectedRowData?.apiName + "_COPY" || '',
        //     storedProcedure: '',
        //     httpMethod: 'POST'
        // }))
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
                message.destroy();
                let flagToSave = true, flagToEncode = true;

                if (payloadData?.workFlow == "" || payloadData?.workFlow == null || payloadData?.workFlow == undefined) {
                    flagToEncode = false;
                    message.error("Work flow cannot be empty");
                    return;
                }

                if (payloadData?.version == "" || payloadData?.version == null || payloadData?.version == undefined) {
                    flagToEncode = false;
                    message.error("Version cannot be empty");
                    return;
                }

                const oCopyConfiguration = async () => { // Rename the inner function to avoid recursion
                    let updatedRequest;
                    const cookies = parseCookies();
                    const site = cookies?.site;
                    const user = cookies?.rl_user_id
                    try {
                        updatedRequest = {
                            // site: site,
                            apiName: payloadData?.apiName,
                            storedProcedure: payloadData?.storedProcedure,
                            httpMethod: payloadData?.httpMethod,
                            inputParameters: payloadData?.inputParameters,
                            outputStructure: payloadData?.outputStructure,
                            // userId: user
                        }

                        try {
                            const copyResponse = await createApiConfiguration(updatedRequest);
                            if (copyResponse?.errorCode) {
                                message.error(copyResponse?.message);
                            }
                            else {
                                setCall(call + 1);
                                // message.success(copyResponse?.message_details?.msg);
                                message.success("Created Successfully");
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

                    style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px', marginLeft: '0%' }}
                > <ApiConfigurationForm /> </div>)

            // case 1:
            //     return (<div

            //         style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px', }}
            //     > <LevelConfigurationTable /> </div>)

            // case 2:
            //     return (<div

            //         style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px',  marginLeft: '0%'  }}
            //     > <AdvancedConfigurationForm /> </div>)

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

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split} style={{marginTop: "-1.5%"}}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData?.workFlow : t('createApprovalWorkflowConfiguration')}
                                </p>
                                {(
                                    <>

                                        <p className={styles.dateText}>
                                            {''}
                                            {/* <span className={styles.fadedText}>
                                                {selectedRowData?.createdDateTime
                                                    ? dayjs(selectedRowData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span> */}
                                        </p>
                                        <h4 className={styles.dateText} style={{ marginTop: "30px" }}>
                                            {t('approvalWorkFLowDetails')}
                                            {/* <span className={styles.fadedText}>
                                                {payloadData?.lastModifiedDateTime
                                                    ? dayjs(payloadData?.lastModifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span> */}
                                        </h4>

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
                    {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: "-2%" }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Item Maintenance Tabs">
                            <Tab label={t("approvalWorkFLowDetails")} />
                           
                        </Tabs>
                    </Box> */}
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer} style={{ marginTop: '-10%' }}>
                <div className={styles.floatingButtonContainer}
                    style={{ position: 'fixed', bottom: '10px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
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
                <p>{t("deleteApiConfigMessage")}: <strong>{selectedRowData?.workFlow}</strong>?</p>
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
                        activityId: selectedRowData?.workFlow || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        label={t("workflow")}
                        name="workFlow"
                        required
                    >
                        <Input placeholder="" value={payloadData?.workFlow + "_COPY"} onChange={(e) => handleFieldChange(e, 'workFlow')} />
                    </Form.Item>

                    <Form.Item
                        name="version"
                        label={t("version")}
                        required
                    >
                        <Input placeholder="" value={payloadData?.version} onChange={(e) => handleFieldChange(e, 'version')} />
                    </Form.Item>

                    <Form.Item
                        label={t('type')}
                        
                    >
                        <Select
                            value={payloadData?.type}
                            onChange={(value) => handleSelectChange("type", value)}
                        >
                            <Option value="MFR">MFR</Option>
                            <Option value="BMR">BMR</Option>
                            <Option value="BPR">BPR</Option>
                            <Option value="eBMR">eBMR</Option>
                        </Select>
                    </Form.Item>

                </Form>
            </Modal>



        </div>



    );
};

export default WorkFlowMaintenanceBody;