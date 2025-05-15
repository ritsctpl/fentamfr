import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/ReasonCodeMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import DynamicTable from './DynamicTable'; // Import DynamicTable component
import { Form, Button, Input, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab,  Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ReasonCodeMaintenanceForm from './ReasonCodeMaintenanceForm';
import dayjs from 'dayjs';
import { createReasonCode, deleteReasonCode, updateReasonCode } from '@services/reasonCodeService';
import { useTranslation } from 'react-i18next';
import { ReasonCodeContext } from '../hooks/reasonCodeContext';




interface CustomData {
    customData: string;
    value: string;
}



interface SelectedRowData {
    reasonCode?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
    createdDateTime: string;
    modifiedDateTime: string;
}

interface CustomDataList {
    customData: string;
    value: string;
}

interface ItemData {
    reasonCode?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
}

interface DataRow {
    reasonCode?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
}

interface ReasonCodeMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: SelectedRowData | null; // Allow null

    onClose: () => void;
    setCall: (number) => void;
    setIsAdding: () => void;
    setFullScreen: (boolean) => void;
    setResetValueCall: () => void;
    setCustomDataOnRowSelect: ([]) => void;
    resetValue: boolean;
    oCustomDataList: CustomDataList[];
    customDataForCreate: CustomDataList[];
    itemData: ItemData[];
    itemRowData: any[];
    call: number;
    rowClickCall: number;
    resetValueCall: number;
    availableDocuments: [];
    assignedDocuments: [];
    customDataOnRowSelect: any[];
    availableDocumentForCreate: [];
    username: string;
    addClick: boolean;
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    payloadData: object;
    setPayloadData: () => void;
    top50Data: any[];
    rowData: any
}





const ReasonCodeMaintenanceBody: React.FC<ReasonCodeMaintenanceBodyProps> = ({ call, setCall, resetValueCall,
     isAdding, selectedRowData, onClose, resetValue, 
     customDataOnRowSelect, itemRowData,
    setFullScreen, username, setCustomDataOnRowSelect, addClick, addClickCount, setAddClick, fullScreen }) => {

    const { payloadData, setPayloadData, setShowAlert } = useContext(ReasonCodeContext);


    const [mainFormData, setMainFormData] = useState<Record<string, any>>(selectedRowData || {});
    const [activeTab, setActiveTab] = useState<number>(0);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []); // Ensure it's an array
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);

    // State for copy modal input values
    const [form] = Form.useForm();
    const [newData, setNewData] = useState<DataRow[]>([]);
    // const [formValues, setFormValues] = useState<{ user: string; mail: string }>({ user: '', mail: '' });
    const [formValues, setFormValues] = useState<DataRow[]>([]);

    useEffect(() => {
        if (customDataOnRowSelect) {
            // Handle customDataList
            if (customDataOnRowSelect) {

                setCustomData(customDataOnRowSelect);
            }

            setActiveTab(0);
        }
    }, [customDataOnRowSelect]);

    useEffect(() => {
        // setActiveTab(0);

    }, [addClickCount])

   

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        console.log("table data on tab change: ", customData);
        setCustomData(customData);
        setCustomDataOnRowSelect(customData)
        setActiveTab(newValue);
        setAddClick(false);
        // debugger;
    };



    useEffect(() => {

        setFormValues(itemRowData);
    }, [itemRowData]);


    //console.log("customData: ", customData);

    const handleFormChange = (data: Record<string, any>) => {
        if (activeTab === 0) {
            setMainFormData(prevState => ({ ...prevState, ...data }));
        }
    };

    const handleOpenChange = () => {

        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);

    }

   

    const handleSelectChange = (fieldName: string, value: string) => {
        console.log(fieldName, value);
    };



    const handleClose = () => {
        onClose();
    };
    //    console.log("source:", alt);

    const handleSave = (oEvent) => {

        let flagToSave = true;
        // console.log("Form values: ", formValues);
        const cookies = parseCookies();
        const updatedRowData : any = {
            
            site: cookies.site,
           ...payloadData,
            userId: username
        };

        // Perform the save operation with updatedRowData
        console.log("Request:", updatedRowData);

        if (updatedRowData.reasonCode == undefined || updatedRowData.reasonCode == null || updatedRowData.reasonCode == "") {
            message.error("Reason Code cannot be empty");
            flagToSave = false;
            return;
        }

        if (updatedRowData.type == "Resource") {
            if (updatedRowData.resource == undefined || updatedRowData.resource == "" || updatedRowData.resource == null) {
                message.error("Resource cannot be empty");
                flagToSave = false;
                return;
            }
        }

        if (updatedRowData.type == "Work Center") {
            if (updatedRowData.workCenter == undefined || updatedRowData.workCenter == "" || updatedRowData.workCenter == null) {
                message.error("Work Center cannot be empty");
                flagToSave = false;
                return;
            }
        }



        const oCreateReasonCode = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;
            console.log("Request: ", updatedRowData);
            try {
                if (oEvent.currentTarget.innerText == "Create" || oEvent.currentTarget.innerText == "बनाएं" || oEvent.currentTarget.innerText == "ರಚಿಸಿ" || oEvent.currentTarget.innerText == "உருவாக்க") {
                    const createResponse = await createReasonCode(updatedRowData);
                    console.log("Created  response: ", createResponse);
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

                else if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    const updateResponse = await updateReasonCode(updatedRowData);
                    console.log("Updated reason Code response: ", updateResponse);
                    if (updateResponse) {
                        if (updateResponse.errorCode) {
                            message.error(updateResponse.message);
                        }
                        else {
                            message.success(updateResponse.message_details.msg);
                            const formattedCustomData = updateResponse.response.customDataList.map((item, index) => ({
                                ...item,
                                id: index,
                                key: index
                            }));
                            setCustomDataOnRowSelect(formattedCustomData);
                            setCall(call + 1);
                            setShowAlert(false);
                            // onClose();
                        }
                    }

                }


            } catch (error) {
                console.error('Error creating reason code:', error);
            }
        };

        if (flagToSave)
            oCreateReasonCode();


    };


    // const handleCancel = () => {
    //     console.log("Cancel clicked");
    //     onClose();
    // };

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
        const deleteReasonCodes = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;

            try {
                const reasonCode: string = selectedRowData.reasonCode;
                const userId = username;
                const oDeleteReasonCode = await deleteReasonCode(site, reasonCode, userId); // Assuming retrieveItem is an API call or a data fetch function
                if (!oDeleteReasonCode.errorCode) {
                    message.success(oDeleteReasonCode.message_details.msg);
                    console.log("Deleted reason code: ", oDeleteReasonCode);
                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted reason code: ", oDeleteReasonCode);
                }
            } catch (error) {
                console.error('Error fetching data fields:', error);
            }
        };

        deleteReasonCodes();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            reasonCode: selectedRowData?.reasonCode + "_COPY" || '',
            description: ''
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        if (fieldName === 'reasonCode') {
            // Convert value to uppercase and replace invalid characters only for reasonCode
            formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }

        console.log(`Field Change: ${fieldName}`, formattedValue); // Debugging line
        // Set field value
        form.setFieldsValue({ [fieldName]: formattedValue });
    };



    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then((values) => {
                // Add your copy logic here with the form values
                console.log('Reason Code copied:', values);

                const updatedRowData: any = {
                    ...selectedRowData,
                    ...mainFormData,
                    customDataList: customData, // Ensure this is correctly formatted
                    userId: username
                };
                updatedRowData.reasonCode = values.reasonCode;
                updatedRowData.description = values.description;
                // Perform the save operation with updatedRowData
                console.log("Copy request:", updatedRowData);

                const copyReasonCode = async () => { // Rename the inner function to avoid recursion

                    try {

                        const copyResponse = await createReasonCode(updatedRowData);
                        console.log("Copy reason Code response: ", copyResponse);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            onClose();
                        }



                    } catch (error) {
                        console.error('Error fetching data fields:', error);
                    }
                };

                copyReasonCode();
                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };

    const handleFormValuesChange = (values) => {
        setFormValues(values);
        console.log("received form values ,", values);
        setPayloadData((prevData) => ({
            ...prevData,
            ...values,
        }));

    };


    const { t } = useTranslation();

  

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ReasonCodeMaintenanceForm rowData={selectedRowData}
                resetValueCall={resetValueCall} formData={mainFormData} onValuesChange={handleFormValuesChange}
                setNewData={setNewData} resetValue={resetValue} setFormValues={setFormValues} onChange={handleFormChange}
                onSelectChange={handleSelectChange} formValues={formValues} itemRowData={itemRowData} addClick={addClick}
                addClickCount={addClickCount} setAddClick={setAddClick} payloadData={undefined} setPayloadData={function (): void {
                    throw new Error('Function not implemented.');
                } } setShowAlert={function (boolean: any): void {
                    throw new Error('Function not implemented.');
                } } username={''} />;



            case 1:
                return (
                    <DynamicTable initialData={payloadData.customDataList}                        // columns={customDataTable.columns}
                         />
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
                                    {selectedRowData ? selectedRowData.reasonCode : t('createReasonCode')}
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
                                        {fullScreen ? <CloseFullscreenIcon  sx={{ color: '#1874CE' }}/> : <OpenInFullIcon  sx={{ color: '#1874CE' }}/>}
                                    </Button>
                                </Tooltip>

                                {selectedRowData && (
                                    <>
                                        <Tooltip title="Copy">
                                            <Button  onClick={handleOpenCopyModal} className={styles.actionButton}>
                                                <CopyIcon  sx={{ color: '#1874CE' }}/>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <Button onClick={handleOpenModal} className={styles.actionButton}>
                                                <DeleteIcon  sx={{ color: '#1874CE' }} />
                                            </Button>
                                        </Tooltip>
                                    </>
                                )}

                                <Tooltip title="Close">
                                    <Button onClick={handleClose} className={styles.actionButton}>
                                        <CloseIcon  sx={{ color: '#1874CE' }} />
                                    </Button>
                                </Tooltip>
                            </div>


                        </div>
                    </div>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Item Maintenance Tabs">
                            <Tab label={t("main")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            {/* <footer className={styles.footer}> */}
                <div className={styles.floatingButtonContainer}
                style={{ position: 'fixed', bottom: '30px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}    
                >
                    <Button type='primary'
                        // className={`${styles.floatingButton} ${styles.saveButton}`}
                        onClick={handleSave}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {selectedRowData ? t("save") : t("create")}
                    </Button>
                    <Button
                        className={`${styles.floatingButton} ${styles.cancelButton}`}
                        onClick={handleCancel}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {t("cancel")}
                    </Button>
                </div>
            {/* </footer> */}
            <Modal
                title={t("confirmDelete")}
                open={isModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("deleteMessage")}: <strong>{selectedRowData?.reasonCode}</strong>?</p>
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
                        item: selectedRowData?.reasonCode || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        name="reasonCode"
                        label={t("reasonCode")}
                        rules={[{ required: true, message: 'Please enter the reason code' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'reasonCode')} />
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

export default ReasonCodeMaintenanceBody;