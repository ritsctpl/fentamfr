import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/DataTypeMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Button, Input, message, Modal, Tooltip, Select } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DataFieldMaintenanceForm from './DataTypeMaintenanceForm';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DataTypeContext } from '../hooks/DataTypeContext';
import ListTable from './ListTable';
import { createDataType, deleteDataType, retrieveAllDataField, retrieveAllDataType, retrieveTop50DataType, updateDataType } from '@services/dataTypeService';
import { createDataField } from '@services/dataFieldService';
import { v4 as uuidv4 } from 'uuid';

interface CustomData {
    customData: string;
    value: string;
}

interface SelectedRowData {
    dataType?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
    createdDateTime: string;
    modifiedDateTime: string;
}

interface DataTypeMaintenanceBodyProps {
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

const DataTypeMaintenanceBody: React.FC<DataTypeMaintenanceBodyProps> = ({ call, setCall, resetValueCall,
    isAdding, selectedRowData, onClose, resetValue, itemRowData,
    setFullScreen, username, addClick, addClickCount, setAddClick, fullScreen }) => {
    const { payloadData, setPayloadData, setShowAlert, isList, category } = useContext(DataTypeContext);
    const [mainFormData, setMainFormData] = useState<Record<string, any>>(selectedRowData || {});
    const [activeTab, setActiveTab] = useState<number>(0);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []); // Ensure it's an array
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [newData, setNewData] = useState<any[]>([]);
    const [formValues, setFormValues] = useState<any[]>([]);

    let flagToSave, buttonText, shouldSave = false;


    useEffect(() => {
        setActiveTab(0);
    }, [addClickCount]);

    useEffect(() => {
        setActiveTab(0);
    }, [selectedRowData]);



    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        console.log("table data on tab change: ", customData);
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



    const handleResponse = (response) => {
        if (response) {
            if (response.errorCode) {
                message.error(response.message);
            } else {
                message.success(response.message_details.msg);
                setCall(call + 1);
                setShowAlert(false);
                response.response.dataFieldList = response.response.dataFieldList.map((item) => ({
                    ...item,
                    key: uuidv4(),
                    id: uuidv4(),
                }));
                setPayloadData(response.response);


            }
        }
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
                const dataType: string = selectedRowData.dataType;
                const userId = username;
                // debugger
                const oDeleteDataField = await deleteDataType(site, dataType, payloadData?.category, userId); // Assuming retrieveItem is an API call or a data fetch function
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

    const oCreateDataType = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        let updatedRowData = { ...payloadData, site, userId: username };
        delete updatedRowData.handle;

        try {
            const oRetrieveAllResponse = await retrieveAllDataField(site, "");
            console.log("oRetrieveAllResponse: ", oRetrieveAllResponse);
            // debugger
            shouldSave = true;
            if (updatedRowData.dataFieldList && Array.isArray(updatedRowData.dataFieldList)) {
                updatedRowData.dataFieldList = await Promise.all(updatedRowData.dataFieldList.map(async (key) => {
                    // debugger
                    const existingField = oRetrieveAllResponse.find(item => item.dataField == key.dataField);

                    if (!existingField) {
                        // If the field doesn't exist, show confirmation dialog
                        return new Promise((resolve) => {
                            Modal.confirm({
                                title: t('confirm'),
                                content: `${t('confirmCreateDataField')}: ${key.dataField}?`,
                                okText: t('ok'),
                                cancelText: t('cancel'),
                                onOk: async () => {
                                    // Create new data field if confirmed
                                    shouldSave = true;
                                    const request = {
                                        site: site,
                                        dataField: key.dataField,
                                        type: key.type || "Text",
                                        userId: username
                                    };
                                    try {
                                        const newField = await createDataField(request);
                                        console.log(`Created new data field: ${key.dataField}`);
                                        resolve({
                                            sequence: key.sequence,
                                            dataField: key.dataField,
                                            description: key.dataField,
                                            dataType: key.type || "Text",
                                            required: key.required
                                        });
                                    } catch (error) {
                                        console.error(`Error creating data field ${key.dataField}:`, error);
                                        resolve(null);
                                    }
                                },
                                onCancel() {
                                    resolve(null);
                                    shouldSave = false;
                                    return;
                                },
                            });
                        });



                    }
                    else {
                        return {
                            sequence: key.sequence,
                            dataField: key.dataField,
                            description: key.description || "",
                            dataType: key.type,
                            required: key.required
                        };
                    }
                }));

                // Filter out any null values (failed creations or canceled)
                updatedRowData.dataFieldList = updatedRowData.dataFieldList.filter(field => field !== null);

                updatedRowData.dataFieldList = updatedRowData.dataFieldList.map(field => {
                    const matchingField = oRetrieveAllResponse.find(item => item.dataField === field.dataField);

                    return {
                        ...field,
                        dataType: field?.dataType || matchingField?.type,
                        description: field.description || matchingField?.description || field.dataField // Use dataField as fallback description
                    };
                });
            }
            updatedRowData.dataFieldList.map(field => ({
                ...field,
                key: uuidv4(),
                id: uuidv4(),
            }));
            // debugger
            // const oFormDataType = form.getFieldsValue().dataType;
            // const oFormDescription = form.getFieldsValue().description;
            // updatedRowData.dataType = oFormDataType;
            // updatedRowData.description = oFormDescription;

            // Proceed with create or update based on the button text
            if (shouldSave) {
                if (buttonText == "Create" || buttonText == "बनाएं" || buttonText == "ರಚಿಸಿ" || buttonText == "உருவாக்க") {
                    console.log("Create Request: ", updatedRowData);
                    const createResponse = await createDataType(updatedRowData);
                    console.log("Create response: ", createResponse);
                    handleResponse(createResponse);
                    onClose();


                } else if (buttonText == "Save" || buttonText == "सहेजें" || buttonText == "ಉಳಿಸಿ" || buttonText == "சேமிக்க") {
                    console.log("Update Request: ", updatedRowData);
                    const updateResponse = await updateDataType(updatedRowData);
                    console.log("Updaet response: ", updateResponse);
                    handleResponse(updateResponse);


                }
            }
        } catch (error) {
            console.error('Error in oCreateDataType:', error);
            message.error(t('errorOccurred'));
        }

    };

    const handleSave = (oEvent) => {
        flagToSave = true;
        buttonText = oEvent.currentTarget.innerText;
        const cookies = parseCookies();
        let updatedRowData: any = {
            site: cookies.site,
            ...payloadData,
            userId: username
        };

        // Validation checks
        if (updatedRowData.dataType == undefined || updatedRowData.dataType == null || updatedRowData.dataType == "") {
            message.error("Data Type cannot be empty");
            return;
        }

        if (updatedRowData.dataFieldList && Array.isArray(updatedRowData.dataFieldList)) {
            for (let i = 0; i < updatedRowData.dataFieldList.length; i++) {
                const item = updatedRowData.dataFieldList[i];
                if (item.dataField == undefined || item.dataField == null || item.dataField == "") {
                    message.error(`Data Field cannot be empty`);
                    return;
                }
            }
        }

        oCreateDataType();


    };



    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then(async (values) => { // Make the function async to handle await
                // let updatedCopyRowData: any = {
                //     ...selectedRowData,
                //     ...mainFormData,
                //     userId: username
                // };
                const cookies = parseCookies();
                const site = cookies.site;

                let updatedCopyRowData: any = {
                    site: site,
                    ...payloadData,
                    userId: username
                };
                // debugger
                updatedCopyRowData.dataType = values.dataType;
                updatedCopyRowData.description = values.description;
                updatedCopyRowData.category = values.category ? values.category : "Assembly";

                // payloadData.dataType = values.dataType;
                // payloadData.description = values.description;

                // updatedCopyRowData = payloadData;



                const oRetrieveAllResponse = await retrieveAllDataField(site, "");
                console.log("oRetrieveAllResponse: ", oRetrieveAllResponse);

                if (updatedCopyRowData.dataFieldList && Array.isArray(updatedCopyRowData.dataFieldList)) {
                    for (let i = 0; i < updatedCopyRowData.dataFieldList.length; i++) {
                        const item = updatedCopyRowData.dataFieldList[i];
                        if (item.dataField == undefined || item.dataField == null || item.dataField == "") {
                            message.error(`Data Field cannot be empty`);
                            return;
                        }
                    }
                }
                // Check if the data field exists
                if (updatedCopyRowData.dataFieldList && Array.isArray(updatedCopyRowData.dataFieldList)) {
                    updatedCopyRowData.dataFieldList = await Promise.all(updatedCopyRowData.dataFieldList.map(async (key) => {
                        const existingField = oRetrieveAllResponse.find(item => item.dataField == key.dataField);
                        shouldSave = true;
                        if (!existingField) {
                            // If the field doesn't exist, show confirmation dialog
                            return new Promise(async (resolve) => {


                                const request = {
                                    site: site,
                                    dataField: key.dataField,
                                    type: key.type || "Text",
                                    userId: username
                                };
                                try {
                                    const newField = await createDataField(request);
                                    console.log(`Created new data field: ${key.dataField}`);
                                    resolve({
                                        sequence: key.sequence,
                                        dataField: key.dataField,
                                        description: key.dataField,
                                        dataType: key.type || "Text",
                                        required: key.required
                                    });
                                    copyDataFields();
                                } catch (error) {
                                    console.error(`Error creating data field ${key.dataField}:`, error);
                                    resolve(null);
                                }

                            });



                        }
                        else {
                            return {
                                sequence: key.sequence,
                                dataField: key.dataField,
                                description: key.description || "",
                                dataType: key.type,
                                required: key.required
                            };
                        }
                    }));

                    // Filter out any null values (failed creations or canceled)
                    updatedCopyRowData.dataFieldList = updatedCopyRowData.dataFieldList.filter(field => field !== null);

                    updatedCopyRowData.dataFieldList = updatedCopyRowData.dataFieldList.map(field => {
                        const matchingField = oRetrieveAllResponse.find(item => item.dataField === field.dataField);

                        return {
                            ...field,
                            dataType: field?.dataType || matchingField?.type,
                            description: field.description || matchingField?.description || field.dataField // Use dataField as fallback description
                        };
                    });

                    updatedCopyRowData.dataFieldList.map(field => ({
                        ...field,
                        key: uuidv4(),
                        id: uuidv4(),
                    }));
                }

                updatedCopyRowData.dataFieldList.map(field => ({
                    ...field,
                    key: uuidv4(),
                    id: uuidv4(),
                }));

                payloadData.dataFieldList.map(field => ({
                    ...field,
                    key: uuidv4(),
                    id: uuidv4(),
                }));



                // Perform the save operation with updatedCopyRowData
                console.log("Copy request:", updatedCopyRowData);

                const copyDataFields = async () => {
                    try {
                        const copyResponse = await createDataType(updatedCopyRowData);
                        console.log("Copy data type response: ", copyResponse);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        } else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            setShowAlert(false);
                            onClose();
                        }
                    } catch (error) {
                        console.error('Error copying data type:', error);
                    }
                };

                await copyDataFields();
                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                // console.log('Validation Failed:', errorInfo);
            });
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            dataType: selectedRowData?.dataType + "_COPY" || '',
            description: ''
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        if (fieldName == 'dataType') {
            formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }

        // console.log(`Field Change: ${fieldName}`, formattedValue); // Debugging line
        // Set field value
        form.setFieldsValue({ [fieldName]: formattedValue });
    };

    const handleDropDownChange = (value: string, fieldName: string) => {
        console.log("Value: ", value);
        console.log("Field Name: ", fieldName);
        form.setFieldsValue({ [fieldName]: value });
    };





    const handleFormValuesChange = (values) => {
        setFormValues(values);
        // console.log("received form values ,", values);
        setPayloadData((prevData) => ({
            ...prevData,
            ...values,
        }));

    };


    const { t } = useTranslation();

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <DataFieldMaintenanceForm rowData={selectedRowData}
                    resetValueCall={resetValueCall} formData={mainFormData} onValuesChange={handleFormValuesChange}
                    setNewData={setNewData} resetValue={resetValue} setFormValues={setFormValues} onChange={handleFormChange}
                    onSelectChange={handleSelectChange} formValues={formValues} itemRowData={itemRowData} addClick={addClick}
                    addClickCount={addClickCount} setAddClick={setAddClick} payloadData={undefined} setPayloadData={function (): void {
                        throw new Error('Function not implemented.');
                    }} setShowAlert={function (boolean: any): void {
                        throw new Error('Function not implemented.');
                    }} username={''} />;



            case 1:
                return (
                    <ListTable />
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
                                    {selectedRowData ? selectedRowData.dataType : t('createDataType')}
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
                            <Tab label={t("dataField")} />
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
                <p>{t("deleteMessage")}: <strong>{selectedRowData?.dataType}</strong>?</p>
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
                        item: selectedRowData?.dataType || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        name="dataType"
                        label={t("dataType")}
                        rules={[{ required: true, message: 'Please enter the data type' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'dataType')} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t("description")}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label={t("category")}
                    >
                        <Select defaultValue="Assembly" onChange={(e) => handleDropDownChange(e, 'category')}>
                            <Select.Option key="Assembly" value="Assembly">Assembly</Select.Option>
                            <Select.Option key="NC" value="NC">NC</Select.Option>
                            <Select.Option key="Packing_Container" value="Packing Container">Packing Container</Select.Option>
                            <Select.Option key="Packing_PCU" value="Packing PCU">Packing PCU</Select.Option>
                            <Select.Option key="RMA_PCU" value="RMA PCU">RMA PCU</Select.Option>
                            <Select.Option key="RMA_Shop_Order" value="RMA Shop Order">RMA Shop Order</Select.Option>
                            <Select.Option key="PCU" value="PCU">PCU</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>



    );
};

export default DataTypeMaintenanceBody;
