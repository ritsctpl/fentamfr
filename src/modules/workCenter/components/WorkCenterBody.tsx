import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/WorkCenterMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import DynamicTable from './DynamicTable'; // Import DynamicTable component
import { Form, Input, Button, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WorkCenterMainForm from './WorkCenterMainForm';
import dayjs from 'dayjs';
import { createWorkCenter, deleteWorkCenter, updateWorkCenter } from '@services/workCenterService';
import { useTranslation } from 'react-i18next';
import { WorkCenterContext } from '../hooks/workCenterContext';
import ActivityHooks from './ActivityHooks';
import AssociateIdTable from './AssociateIdTable';

interface CustomData {
    customData: string;
    value: string;
}

interface CustomDataList {
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

interface DataRow {
    activityId?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
}

interface ActivityMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null

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
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    payloadData: object;
    setPayloadData: () => void;
}





const WorkCenterMaintenanceBody: React.FC<ActivityMaintenanceBodyProps> = ({ call, setCall,
    isAdding, selectedRowData, onClose, customDataForCreate,
    customDataOnRowSelect, itemRowData,
    setFullScreen, username, setCustomDataOnRowSelect, addClickCount, setAddClick, fullScreen }) => {

    const { payloadData, setPayloadData, setShowAlert } = useContext<any>(WorkCenterContext);


    const [mainFormData, setMainFormData] = useState<Record<string, any>>(selectedRowData || {});
    const [activeTab, setActiveTab] = useState<number>(0);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []); // Ensure it's an array
    const [buttonText, setButtonText] = useState(selectedRowData ? "Save" : "Create");
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);

    // State for copy modal input values
    const [form] = Form.useForm();

    // const [formValues, setFormValues] = useState<{ user: string; mail: string }>({ user: '', mail: '' });
    const [formValues, setFormValues] = useState<DataRow[]>([]);
    const [isVisible, setIsVisible] = useState(false);


    const tableRef = useRef<{ getData: () => any[] }>(null);


    useEffect(() => {
        if (customDataOnRowSelect) {
            // Handle customDataList
            if (customDataOnRowSelect) {

                setCustomData(customDataOnRowSelect);
            }

            // setActiveTab(0);
        }
    }, [customDataOnRowSelect]);

    useEffect(() => {
        setActiveTab(0);

    }, [addClickCount])

    const handleTabChange1 = (event: React.SyntheticEvent, newValue: number) => {
        console.log("form values ion tab change: ", formValues)
        setActiveTab(newValue);
        setAddClick(false);
        debugger
        // setFormValues(formValues)
        // if(addClick == true)
        // setFormValues(null);
        // console.log("Tab change values: ", newValue);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        console.log("table data on tab change: ", customData);
        setCustomData(customData);
        setCustomDataOnRowSelect(customData)
        setActiveTab(newValue);
        setAddClick(false);
        // debugger;
    };


    const handleTableDataChange = (data: CustomData[]) => {
        debugger;
        if (activeTab === 3) {
            setCustomData(data as CustomData[]);
            setCustomDataOnRowSelect(data as CustomData[]); itemRowData
        }
        setPayloadData((prevData) => ({
            ...prevData,
            customDataList: data as CustomData[],
        }));
    };

    useEffect(() => {

        setFormValues(itemRowData);
        setActiveTab(0);
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


    const handleClose = () => {
        setIsVisible(true);
        // onClose();
    };
    //    console.log("source:", alt);

    const handleSave = (oEvent) => {
        const cookies = parseCookies();
        const site = cookies.site;
        let flagToSave = true;

        console.log("Form values: ", formValues);
        const updatedRowData = {
            ...payloadData,
            userId: username,
            site: site
        };

        // Perform the save operation with updatedRowData
        console.log("Request:", updatedRowData);

        if (payloadData.workCenter == undefined || payloadData.workCenter == null || payloadData.workCenter == "") {
            message.error("Work Center cannot be empty");
            flagToSave = false;
            return;
        }


        payloadData.associationList.forEach((hook) => {
            if (!hook.associateId) {
                //   console.log(`Hook with key ${hook.key} has an empty or undefined activity.`);
                message.error("Associate ID cannot be empty");
                flagToSave = false;
                return;
                // Handle the case where activity is "" or undefined or null
            }
        });

        if (Array.isArray(payloadData.activityHookList)) {
            payloadData.activityHookList.forEach((hook) => {
                if (!hook.activity) {
                    //   console.log(`Hook with key ${hook.key} has an empty or undefined activity.`);
                    message.error("Activity cannot be empty");
                    flagToSave = false;
                    return;
                    // Handle the case where activity is "" or undefined or null
                }
            });
        } 



        const oCreateActivity = async () => { // Rename the inner function to avoid recursion


            try {
                if (oEvent.currentTarget.innerText == "Create" || oEvent.currentTarget.innerText == "बनाएं"
                    || oEvent.currentTarget.innerText == "ರಚಿಸಿ" || oEvent.currentTarget.innerText == "உருவாக்க") {
                    const createResponse = await createWorkCenter(updatedRowData);
                    console.log("Created response: ", createResponse);
                    if (createResponse) {
                        if (createResponse.errorCode) {
                            message.error(createResponse.message);
                        }
                        else {
                            message.success(createResponse.message_details.msg);
                            setShowAlert(false);
                            setCall(call + 1);
                            onClose();
                        }
                    }
                }

                else if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    const updateResponse = await updateWorkCenter(updatedRowData);
                    console.log("Updated reason Code response: ", updateResponse);
                    if (updateResponse) {
                        if (updateResponse.errorCode) {
                            message.error(updateResponse.message);
                        }
                        else {
                            message.success(updateResponse.message_details.msg);
                            setShowAlert(false);
                            setCall(call + 1);
                            setPayloadData(updateResponse.response);
                            // onClose();
                        }
                    }
                }
            } catch (error) {
                console.error('Error creating Activity:', error);
            }
        };

        if (flagToSave == true)
            oCreateActivity();


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
        const oDeleteActivity = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;

            try {
                const workCenter: string = selectedRowData.workCenter;
                const userId = username;
                debugger
                const response = await deleteWorkCenter(site, workCenter, userId); // Assuming retrieveItem is an API call or a data fetch function
                if (!response.errorCode) {
                    message.success(response.message_details.msg);
                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted activity: ", response);
                }
            } catch (error) {
                console.error('Error deleteign activity:', error);
            }
        };

        oDeleteActivity();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        // debugger
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            workCenter: selectedRowData.workCenter + "_COPY" || '',
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

        console.log(`Field Change: ${fieldName}`, formattedValue); // Debugging line
        // Set field value
        form.setFieldsValue({ [fieldName]: formattedValue });
    };



    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then((values) => {
                // Add your copy logic here with the form values
                // console.log('Activity copied:', values);
                const cookies = parseCookies();
                const site = cookies.site;
                const updatedRowData = {
                    ...payloadData,
                    site: site,
                    userId: username
                };
                updatedRowData.workCenter = values.workCenter;
                updatedRowData.description = values.description;
                // Perform the save operation with updatedRowData
                delete updatedRowData.createdDateTime;
                delete updatedRowData.modifiedDateTime;
                console.log("Copy request:", updatedRowData);

                if (updatedRowData.workCenter == null || updatedRowData.workCenter == "" || updatedRowData.workCenter == undefined) {
                    message.error("Work Center cannot be empty");
                    return;
                }

                const oCopyActivity = async () => { // Rename the inner function to avoid recursion

                    try {

                        const copyResponse = await createWorkCenter(updatedRowData);
                        console.log("Copy Work center response: ", copyResponse);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            onClose();
                        }



                    } catch (error) {
                        console.error('Error copying work Center:', error);
                    }
                };

                oCopyActivity();
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

    const customDataTable = {
        columns: [
            {
                title: t('customData'), // Using i18n translation
                dataIndex: 'customData',
                key: 'customData',
                type: 'text',
                required: false,
                readOnly: true
            },
            {
                title: t('value'), // Using i18n translation
                dataIndex: 'value',
                key: 'value',
                type: 'input'
            }
        ]
    };


    const handleYes = () => {
        onClose();  // Call onClose on "Yes"
        setIsVisible(false);  // Close the modal
    };

    const handleNo = () => {
        setIsVisible(false);  // Close the modal on "No"
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (<div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 225px)', marginLeft: '25px' }}>  <WorkCenterMainForm
                    onChange={handleFormChange} rowSelectedData={selectedRowData}
                />
                </div>)

            case 1:
                return (
                    < AssociateIdTable />

                );

            case 2:
                return (
                    <ActivityHooks
                    />
                );

            case 3:
                return (
                    <div style={{ marginTop: "3%" }}>
                        <DynamicTable
                            initialData={payloadData.customDataList}
                        // columns={customDataTable.columns}
                        // dataSource={payloadData.customDataList}
                        // paginationSettings={{
                        //     pageSize: 2,
                        //     showSizeChanger: false,
                        //     pageSizeOptions: ['2', '5', '10', '20', '50'],
                        // }}
                        // selectionMode="None"
                        // onDataChange={handleTableDataChange}
                        // buttonVisibility={false}
                        // customDataOnRowSelect={customDataOnRowSelect}
                        // customDataForCreate={customDataForCreate}

                        />
                    </div>
                )
            default:
                return null;
        }
    };

    // console.log("Payload data from boy content: ", payloadData);
    return (
        <div className={styles.pageContainer}>
            {/* <div className={styles.contentWrapper}> */}
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData.workCenter : t('createWorkCenter')}
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
                            <Tab label={t("association")} />
                            <Tab label={t("activityHooks")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            {/* </div> */}
            {/* <footer className={styles.footer}> */}
                <div className={styles.floatingButtonContainer}
                   style={{ position: 'fixed', bottom: '30px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
                >
                    <Button type='primary'
                        // className={`${styles.floatingButton} `}
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
                        {t('cancel')}
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
                <p>{t("deleteWCMessage")}: <strong>{selectedRowData?.workCenter}</strong>?</p>
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
                        workCenter: selectedRowData?.workCenter || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        label={t("workCenter")}
                        name="workCenter"
                        rules={[{ required: true, message: 'Please enter the Work Center' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'workCenter')} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t("description")}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={t("confirmation")}
                open={isVisible}
                onOk={handleYes}
                style={{ marginTop: "8%" }}
                onCancel={handleNo} // Close the dialog on clicking outside or the "X" button
                okText={t("yes")}
                cancelText={t("no")}
            >
                <p>{t('closeMsg')}</p>
            </Modal>
        </div>



    );
};

export default WorkCenterMaintenanceBody;