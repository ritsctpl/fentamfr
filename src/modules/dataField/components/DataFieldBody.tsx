import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/DataFieldMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Button, Input, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab,  Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DataFieldMaintenanceForm from './DataFieldMaintenanceForm';
import dayjs from 'dayjs';
import { createDataField, deleteDataField, updateDataField } from '@services/dataFieldService';
import { useTranslation } from 'react-i18next';
import { DataFieldContext } from '../hooks/DataFieldContext';
import ListTable from './ListTable';


interface CustomData {
    customData: string;
    value: string;
}

interface SelectedRowData {
    dataField?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
    createdDateTime: string;
    modifiedDateTime: string;
}

interface DataFieldMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: SelectedRowData | null; // Allow null
    onClose: () => void;
    setCall: (number) => void;
    setIsAdding: () => void;
    setFullScreen: (boolean) => void;
    resetValue: boolean;
    itemRowData: any[];
    call: number;
    resetValueCall: number;
    username: string;
    addClick: boolean;
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    top50Data: any[];
    rowData: any
}

const DataFieldMaintenanceBody: React.FC<DataFieldMaintenanceBodyProps> = ({ call, setCall, resetValueCall,
     isAdding, selectedRowData, onClose, resetValue,  itemRowData,
    setFullScreen, username, addClick, addClickCount, setAddClick, fullScreen }) => {
    const { payloadData, setPayloadData, setShowAlert, isList } = useContext(DataFieldContext);
    const [mainFormData, setMainFormData] = useState<Record<string, any>>(selectedRowData || {});
    const [activeTab, setActiveTab] = useState<number>(0);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []); // Ensure it's an array
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [newData, setNewData] = useState<any[]>([]);
    const [formValues, setFormValues] = useState<any[]>([]);

   

    useEffect(() => {
        setActiveTab(0);
    }, [addClickCount]); 
    
    useEffect(() => {
        setActiveTab(0);
    }, [selectedRowData]);

   

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        // console.log("table data on tab change: ", customData);
        setCustomData(customData);
        setActiveTab(newValue);
        setAddClick(false);
        // debugger;
    };

    useEffect(() => {

        setFormValues(itemRowData);
    }, [itemRowData]);

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

        if (updatedRowData.dataField == undefined || updatedRowData.dataField == null || updatedRowData.dataField == "") {
            message.error("Data Field cannot be empty");
            flagToSave = false;
            return;
        }

        if (updatedRowData.listDetails && Array.isArray(updatedRowData.listDetails)) {
            for (let i = 0; i < updatedRowData.listDetails.length; i++) {
                const item = updatedRowData.listDetails[i];
                if (item.fieldValue == undefined || item.fieldValue == null || item.fieldValue == "") {
                    message.error(`Field Value cannot be empty`);
                    flagToSave = false;
                    return;
                }
                if (item.labelValue == undefined || item.labelValue == null || item.labelValue == "") {
                    message.error(`Label Value cannot be empty `);
                    flagToSave = false;
                    return;
                }
            }
        }

        const oCreateDataField = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;
            console.log("Request: ", updatedRowData);
            try {
                if (oEvent.currentTarget.innerText == "Create" || oEvent.currentTarget.innerText == "बनाएं" || oEvent.currentTarget.innerText == "ರಚಿಸಿ" || oEvent.currentTarget.innerText == "உருவாக்க") {
                    const createResponse = await createDataField(updatedRowData);
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

                else if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    const updateResponse = await updateDataField(updatedRowData);
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
                console.error('Error creating data field:', error);
            }
        };

        if (flagToSave)
            oCreateDataField();


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
        const deleteDataFields = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;

            try {
                const dataField: string = selectedRowData.dataField;
                const userId = username;
                const oDeleteDataField = await deleteDataField(site, dataField, userId); // Assuming retrieveItem is an API call or a data fetch function
                if (!oDeleteDataField.errorCode) {
                    message.success(oDeleteDataField.message_details.msg);
                    console.log("Deleted data field: ", oDeleteDataField);
                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted data field: ", oDeleteDataField);
                }
            } catch (error) {
                console.error('Error deleting data fields:', error);
            }
        };

        deleteDataFields();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            dataField: selectedRowData?.dataField + "_COPY" || '',
            description: ''
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        if (fieldName === 'dataField') {
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
                console.log('Data Field copied:', values);

                const updatedRowData: any = {
                    ...selectedRowData,
                    ...mainFormData,
                    userId: username
                };
                updatedRowData.dataField = values.dataField;
                updatedRowData.description = values.description;
                // Perform the save operation with updatedRowData
                console.log("Copy request:", updatedRowData);

                const copyDataFields = async () => { // Rename the inner function to avoid recursion

                    try {

                        const copyResponse = await createDataField(updatedRowData);
                        console.log("Copy data field response: ", copyResponse);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            onClose();
                        }



                    } catch (error) {
                        console.error('Error copying data fields:', error);
                    }
                };

                copyDataFields();
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
                return  (<div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px', }}> <DataFieldMaintenanceForm rowData={selectedRowData}
                resetValueCall={resetValueCall} formData={mainFormData} onValuesChange={handleFormValuesChange}
                setNewData={setNewData} resetValue={resetValue} setFormValues={setFormValues} onChange={handleFormChange}
                onSelectChange={handleSelectChange} formValues={formValues} itemRowData={itemRowData} addClick={addClick}
                addClickCount={addClickCount} setAddClick={setAddClick} payloadData={undefined} setPayloadData={function (): void {
                    throw new Error('Function not implemented.');
                } } setShowAlert={function (boolean: any): void {
                    throw new Error('Function not implemented.');
                } } username={''}  />
                </div>)



            case 1:
                return (
                    <ListTable/>
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
                                    {selectedRowData ? selectedRowData.dataField : t('createDataField')}
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
                            {  isList &&     
                            <Tab label={t("list")} />
                            }
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
                <p>{t("deleteMessage")}: <strong>{selectedRowData?.dataField}</strong>?</p>
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
                        item: selectedRowData?.dataField || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        name="dataField"
                        label={t("dataField")}
                        rules={[{ required: true, message: 'Please enter the data field' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'dataField')} />
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

export default DataFieldMaintenanceBody;