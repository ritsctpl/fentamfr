import React, { useState, useEffect, useRef, useContext } from 'react';
// import styles from '../styles/RoutingMaintenance.module.css';
import styles from '../styles/RoutingStep.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import DynamicTable from './DynamicTable'; // Import DynamicTable component
import { Form, Input, message, Button, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import DCMainForm from "./DCMainForm";
import { DataCollectionData, defaultDataCollectionRequest } from '../types/DataCollectionTypes';
import { DataCollectionContext } from '../hooks/DataCollectionContext';
import DynamicTableBuilder from './DynamicTableBuilder';
import { createDataCollection, deleteDataCollection, updateDataCollection } from '@services/dataCollectionServices';
import DCAttachment from './Attachment';




interface CustomData {
    customData: string;
    value: string;
}





interface UpdatedRowData {
    userId: any,
    routing: any,
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

interface DCMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null
    onClose: () => void;
    setCall: (number) => void;
    setIsAdding: (boolean) => void;
    setFullScreen: (boolean) => void;
    setResetValueCall: () => void;
    setCustomDataOnRowSelect: (any) => void;
    resetValue: boolean;
    oCustomDataList: CustomDataList[];
    customDataForCreate: CustomDataList[];
    itemData: ItemData[];
    itemRowData: ItemData[];
    call: number;
    rowClickCall: number;
    resetValueCall: number;
    availableDocuments: [];
    assignedDocuments: [];
    customDataOnRowSelect: any[];
    availableDocumentForCreate: [];
    username: string;
    addClick: boolean;
    payloadData: object;
    setPayloadData: (any) => void;
    fullScreen: boolean;
    schema: any;
    updatedRowData: UpdatedRowData;
}





const DCMaintenanceBody: React.FC<DCMaintenanceBodyProps> = ({ call, setCall,
    selectedRowData, onClose,
    customDataOnRowSelect,
    setCustomDataOnRowSelect, schema,
}) => {

    const { activeTab, setActiveTab, isStepModalVisible, setIsStepModalVisible, fullScreen, setFullScreen, isNextPage, setIsNextPage, payloadData,
        setPayloadData, username, setShowAlert, isAdding } = useContext<any>(DataCollectionContext);


    const [mainFormData, setMainFormData] = useState<Record<string, any>>(selectedRowData || {});
    // const [activeTab, setActiveTab] = useState<number>(0);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []); // Ensure it's an array
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);

    // State for copy modal input values
    const [form] = Form.useForm();

    // const [formValues, setFormValues] = useState<{ user: string; mail: string }>({ user: '', mail: '' });
    const [formValues, setFormValues] = useState([]);




    useEffect(() => {
        if (customDataOnRowSelect) {
            // Handle customDataList
            if (customDataOnRowSelect) {

                setCustomData(customDataOnRowSelect);
            }

            setActiveTab(0);
        }
    }, [customDataOnRowSelect]);








    const handleOpenChange = () => {
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);

    }




    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        // console.log("Tab change values: ", newValue);
    };

    const handleClose = () => {
        onClose();
    };
    //    console.log("source:", alt);




    const handleSave = (oEvent) => {
        let saveFlag = true;
        setPayloadData(prevPayloadData => ({
            ...prevPayloadData,
            userId: username
        }));

        // console.log("Form values: ", formValues);
        const updatedRowData: any = {
            ...payloadData,
            userId: username,
        };

        // Perform the save operation with updatedRowData
        console.log("Update Request:", updatedRowData);
        updatedRowData.parameterList.map(item => {
            if (item.parameterName == "" || item.parameterName == undefined || item.parameterName == null) {
                saveFlag = false;
                message.error("Parameter Name cannot be empty");
                return;
            }
        });
        updatedRowData.parameterList.map(item => {
            if (item.type == "Numeric") {
                if (item.minValue == "" || item.minValue == undefined || item.minValue == null) {
                    saveFlag = false;
                    message.error("Min Value cannot be empty");
                    return;
                }
                if (item.maxValue == "" || item.maxValue == undefined || item.maxValue == null) {
                    saveFlag = false;
                    message.error("Max Value cannot be empty");
                    return;
                }
            }

        });

        const parameterNames = new Set(); // To track unique parameter names
        updatedRowData.parameterList.map(item => {
            // Check for empty parameter names
            if (parameterNames.has(item.parameterName)) {
                saveFlag = false;
                message.error("Parameter cannot be duplicated");
                return;
            } else {
                parameterNames.add(item.parameterName); // Add unique parameter names to the set
            }
        });





        const oCreateDC = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;


            try {
                if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    setTimeout(async function () {
                        const updateResponse = await updateDataCollection(updatedRowData);
                        console.log("Updated response: ", updateResponse);
                        if (updateResponse) {
                            if (updateResponse.errorCode) {
                            }
                            else {
                                if (updateResponse.message_details) {
                                    if (updateResponse.message_details.msg)
                                        message.success(updateResponse?.message_details.msg);
                                }
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


                    }, 1000);

                }


            } catch (error) {
                console.error('Error creating routing:', error);
            }
        };

        if (saveFlag)
            oCreateDC();


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
        const deleteRoute = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;

            try {
                const dataCollection = selectedRowData.dataCollection as string;
                const version = selectedRowData.version as string;
                const userId = username;

                const oDeleteRouting = await deleteDataCollection(site, dataCollection, version, userId); // Assuming retrieveItem is an API call or a data fetch function
                if (!oDeleteRouting.errorCode) {
                    message.success(oDeleteRouting.message_details.msg);
                    console.log("Deleted routing: ", oDeleteRouting);

                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted routing: ", oDeleteRouting);
                }
            } catch (error) {
                console.error('Error deleting routing :', error);
            }
        };

        deleteRoute();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            dataCollection: selectedRowData?.dataCollection + "_COPY" || '',
            version: "",
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
                // console.log('DC copied request:', values);

                const updatedRowData: any = {
                    ...payloadData, // Ensure this is correctly formatted
                    userId: username
                };
                updatedRowData.dataCollection = values.dataCollection;
                updatedRowData.version = values.version;
                updatedRowData.description = values.description;
                // Perform the save operation with updatedRowData
                console.log("Copy request:", updatedRowData);

                const copyDC = async () => { // Rename the inner function to avoid recursion

                    try {

                        const copyResponse = await createDataCollection(updatedRowData);
                        console.log("Copy response: ", copyResponse);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            onClose();
                        }



                    } catch (error) {
                        console.error('Error copying dc:', error);
                    }
                };

                copyDC();
                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };




    const { t } = useTranslation();




    const columns = [
        { title: 'sequence', dataIndex: 'sequence', key: 'sequence', type: 'input' },
        { title: 'parameterName', dataIndex: 'parameterName', key: 'parameterName', type: 'input' },
        { title: 'description', dataIndex: 'description', key: 'description', type: 'input' },
        { title: 'status', dataIndex: 'status', key: 'status', type: 'select' },
        { title: 'details', dataIndex: 'details', key: 'details', type: 'button' },
    ];

    const attachmentColumns = [
        { title: 'sequence', dataIndex: 'sequence', key: 'sequence', type: 'input' },
        { title: 'attachment', dataIndex: 'attachment', key: 'attachment', type: 'input' },
        { title: 'details', dataIndex: 'details', key: 'details', type: 'button' },
    ];

    const data = [];


    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px' }}> {/* Added div with scrollbar */}
                        <DCMainForm
                            schema={schema} />
                    </div>
                )

            case 1:
                return (
                    <DynamicTableBuilder columns={columns} data={data} />
                )

            case 2:
                return (
                    <DCAttachment attachmentColumns={attachmentColumns} data={[]}
                    />
                );
            case 3:
                return (
                    <DynamicTable
                        initialData={payloadData.customDataList}
                    />
                );
            default:
                return null;
        }
    };
    // console.log("payload data from body content: ", payloadData);

    return (

        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData.dataCollection : ""}
                                </p>
                                {selectedRowData && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('versions')}
                                            <span className={styles.fadedText}>
                                                {selectedRowData.version
                                                    ? (selectedRowData.version)
                                                    : ''}
                                            </span>
                                        </p>
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
                                                {selectedRowData.updatedDateTime
                                                    ? dayjs(selectedRowData.updatedDateTime).format('DD-MM-YYYY HH:mm:ss')
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
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="DC Tabs">
                            <Tab label={t("main")} />
                            <Tab label={t("parameterList")} />
                            <Tab label={t("attachmentList")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            {/* <footer className={styles.footer}> */}
            <div
                // className={styles.floatingButtonContainer}
                style={{ position: 'fixed', bottom: '15px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
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
                <p>{t("deleteMessage")}: <strong>{selectedRowData?.dataCollection}</strong>?</p>
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
                        dataCollection: selectedRowData?.dataCollection || '',
                        version: '',
                        description: ''
                    }}
                >
                    <Form.Item
                        name="dataCollection"
                        label={t("dataCollection")}
                        rules={[{ required: true, message: 'Please enter the Data Collection' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'dataCollection')} />
                    </Form.Item>

                    <Form.Item
                        name="version"
                        label={t("version")}
                        rules={[{ required: true, message: 'Please enter the version' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'version')} />
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

export default DCMaintenanceBody;