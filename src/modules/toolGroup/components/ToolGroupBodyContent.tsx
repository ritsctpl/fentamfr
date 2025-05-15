import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '@modules/toolGroup/styles/ToolGroupMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import DynamicTable from './DynamicTable'; // Import DynamicTable component
import { Form, Input, message, Button, Modal, Tooltip, Select, Switch, Upload } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import DCAttachment from './Attachment';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import mammoth from 'mammoth';
import { defaultToolGroupRequest, ToolGroupRequest } from '../types/ToolGroupTypes';
import { ToolGroupContext } from '../hooks/ToolGroupContext';
import { CreateToolGroup, DeleteToolGroup, UpdateToolGroup } from '@services/toolGroup';
import Calibration from './Calibration';

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

interface ToolGroupBodyContentProps {
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

const getFileTypeFromBase64 = (base64String: string): string => {
    const signatures = {
        '/9j/': 'image/jpeg',
        'iVBORw0': 'image/png',
        'JVBERi0': 'application/pdf',
        'R0lGODlh': 'image/gif',
        'UEsDBBQA': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'PK': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    for (const [signature, mimeType] of Object.entries(signatures)) {
        if (base64String.startsWith(signature)) {
            return mimeType;
        }
    }

    return 'application/octet-stream';
};

const convertDocxToHtml = async (base64String: string): Promise<string> => {
    try {
        // Convert base64 to ArrayBuffer
        const binaryString = window.atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;

        // Convert DOCX to HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error('Error converting DOCX:', error);
        return '<p>Error converting document</p>';
    }
};

const ToolGroupBodyContent: React.FC<ToolGroupBodyContentProps> = ({ call, setCall, resetValueCall,
    setResetValueCall, selectedRowData, onClose, resetValue, oCustomDataList, customDataForCreate,
    itemData, customDataOnRowSelect, itemRowData, rowClickCall,
    setCustomDataOnRowSelect, addClick, schema, updatedRowData
}) => {

    const { activeTab, setActiveTab, isStepModalVisible, setIsStepModalVisible, fullScreen, setFullScreen, isNextPage, setIsNextPage, payloadData,
        setPayloadData, username, setShowAlert, isAdding } = useContext<any>(ToolGroupContext);

    console.log(payloadData);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [formValues, setFormValues] = useState([]);

    useEffect(() => {
        if (customDataOnRowSelect) {
            if (customDataOnRowSelect) {
                setCustomData(customDataOnRowSelect);
            }
            setActiveTab(0);
        }
    }, [customDataOnRowSelect]);

    useEffect(() => {
        if (selectedRowData) {
            form.setFieldsValue(selectedRowData);
        }
    }, [form, selectedRowData]);

    useEffect(() => {
        if (selectedRowData) {
            setPayloadData(prevData => ({
                ...prevData,
            }));
        }
    }, [selectedRowData]);

    const handleOpenChange = () => {
        debugger
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);

    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleClose = () => {
        onClose();
    };

    const handleSave = (oEvent) => {
        let saveFlag = true;
        setPayloadData(prevPayloadData => ({
            ...prevPayloadData,
            userId: username
        }));

        const updatedRowData: any = {
            ...payloadData,
            userId: username,
        };

        // updatedRowData.attachmentList.map(item => {
        //     // Check if all specified keys have values
        //     const otherKeys = [
        //         'itemGroup', 'item', 'itemVersion', 'routing', 
        //         'routingVersion', 'operation', 'operationVersion', 
        //         'workCenter', 'resource', 'resourceType', 'customOrder',
        //         'shopOrder', 'pcu', 'bom', 'bomVersion', 'component', 'componentVersion'
        //     ];

        //     const hasEmptyValue = otherKeys.every(key => 
        //         item[key] !== "" && item[key] !== null && item[key] !== undefined
        //     );
        //     debugger

        //     if (!hasEmptyValue) {
        //         saveFlag = false;
        //         message.error("Please attach at least one of the attachments");
        //         return;
        //     }
        // })

        console.log(updatedRowData, 'updated row data');

        const oCreateTG = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;
            try {
                if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    setTimeout(async function () {
                        console.log("tool group request: ", updatedRowData);
                        const updateResponse = await UpdateToolGroup(site, updatedRowData);
                        console.log("tool group response: ", updateResponse);
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
            oCreateTG();


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
        const deleteTG = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;

            try {
                const payload = {
                    site: site,
                    userId: userId,
                    ...selectedRowData
                }

                console.log("Tool group delete request: ", payload);
                const DeleteTG = await DeleteToolGroup(site, userId, payload);
                console.log("Tool group delete response: ", DeleteTG);

                if (!DeleteTG.errorCode) {
                    message.success(DeleteTG.message_details.msg);
                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted tool group: ", DeleteTG);
                }
            } catch (error) {
                console.error('Error deleting routing :', error);
            }
        };

        deleteTG();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.setFieldsValue({
            toolGroup: selectedRowData?.toolGroup + "_COPY" || '',
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

        console.log(`Field Change: ${fieldName}`, formattedValue);
        form.setFieldsValue({ [fieldName]: formattedValue });
    };

    const handleConfirmCopy = () => {
        const cookies = parseCookies();
        const userId = cookies.rl_user_id;
        const site = cookies.site;

        form
            .validateFields()
            .then((values) => {

                const updatedRowData: any = {
                    ...payloadData,
                    userId: username
                };
                updatedRowData.toolGroup = values.toolGroup;
                updatedRowData.description = values.description;

                console.log("Tool Group request:", updatedRowData);

                const copyTG = async () => { // Rename the inner function to avoid recursion

                    try {
                        console.log("Tool Group copy request: ", updatedRowData);
                        const copyResponse = await CreateToolGroup(site, userId, updatedRowData);
                        console.log("Tool Group copy response: ", copyResponse);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            onClose();
                            setIsCopyModalVisible(false);
                        }



                    } catch (error) {
                        console.error('Error copying dc:', error);
                    }
                };

                copyTG();
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };

    const handleFormValuesChange = (values) => {
        setFormValues(values);
        console.log("received form values ,", values);

    };


    const { t } = useTranslation();

    const attachmentColumns = [
        { title: 'sequence', dataIndex: 'sequence', key: 'sequence', type: 'input' },
        { title: 'attachment', dataIndex: 'attachment', key: 'attachment', type: 'input' },
        { title: 'details', dataIndex: 'details', key: 'details', type: 'button' },
    ];

    const handleSelectChange = (field: string, value: string) => {
        console.log(value, 'value');

        if (field === 'status') {
            setPayloadData((prev) => ({
                ...prev,
                [field]: value
            }))
        };
    }

    const handleFileUpload = async (file: File) => {
        try {
            // Convert file to base64
            const base64String = await convertFileToBase64(file);

            // Update form values
            form.setFieldsValue({
                file: base64String,
                fileName: file.name
            });

            // Update payload data
            setPayloadData(prev => ({
                ...prev,
                file: base64String,
                fileName: file.name,
                fileType: file.type
            }));

            message.success('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            message.error('Failed to upload file');
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
                const base64WithoutPrefix = base64String.split(',')[1];
                resolve(base64WithoutPrefix);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleInputChange = (fieldName: string, value: string) => {
        form.setFieldsValue({ [fieldName]: value });
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSwitchChange = (fieldName: string, checked: boolean) => {
        form.setFieldsValue({ [fieldName]: checked });
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: checked
        }));
    };

    const handleCalibrationChange = (changedValues) => {
        setPayloadData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
        setShowAlert(true)
    };

    const calibrationOptions = [
        'calibrationType',
        'calibrationPeriod',
        'calibrationCount',
        'maximumCalibrationCount',
        'startCalibrationDate',
        'expirationDate',
    ];


    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <Form
                        style={{ marginTop: "30px", maxHeight: '70vh', overflowY: 'auto' }}
                        layout="horizontal"
                        form={form}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 14 }}
                        initialValues={{
                            description: selectedRowData?.description || "",
                            status: selectedRowData?.status || "Enabled",
                            trackingControl: selectedRowData?.trackingControl || "None",
                            location: selectedRowData?.location || "",
                            toolQty: selectedRowData?.toolQty || 0,
                            timeBased: selectedRowData?.timeBased || false,
                            erpGroup: selectedRowData?.erpGroup || false,
                        }}
                    >

                        <Form.Item
                            label={t("description")}
                            name="description"
                            required={false}
                            initialValue=""
                        >
                            <Input
                                onChange={(e) =>
                                    handleInputChange('description', e.target.value)
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={t("status")}
                            name="status"
                            initialValue="Enabled"
                        >
                            <Select onChange={(value) => handleSelectChange('status', value)}>
                                <Select.Option value="Enabled">Enabled</Select.Option>
                                <Select.Option value="Disabled">Disabled</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={t("trackingControl")}
                            name="trackingControl"
                            initialValue="None"
                        >
                            <Select onChange={(value) => handleSelectChange('status', value)}>
                                <Select.Option value="None">None</Select.Option>
                                <Select.Option value="Lot">Lot</Select.Option>
                                <Select.Option value="Serialized">Serialized</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={t("location")}
                            name="location"
                            required={false}
                            initialValue=""
                        >
                            <Input
                                onChange={(e) =>
                                    handleInputChange('location', e.target.value)
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={t("toolQty")}
                            name="toolQty"
                            required={false}
                            initialValue=""
                        >
                            <Input
                                type="number"
                                onChange={(e) =>
                                    handleInputChange('toolQty', e.target.value)
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name='timeBased'
                            label={t("timeBased")}
                            valuePropName="checked"
                            initialValue={false}                        >
                            <Switch 
                                onChange={(checked) => handleSwitchChange('timeBased', checked)} 
                            />
                        </Form.Item>

                        <Form.Item
                            name='erpGroup'
                            label={t("erpGroup")}
                            valuePropName="checked"
                            initialValue={false}
                        >
                            <Switch 
                                onChange={(checked) => handleSwitchChange('erpGroup', checked)} 
                            />
                        </Form.Item>
                    </Form>
                )

            case 1:
                return (
                    <DCAttachment attachmentColumns={attachmentColumns} data={[]}
                    />
                );

            case 2:
                return (
                    <Calibration data={payloadData} fields={calibrationOptions} onValuesChange={handleCalibrationChange} style={{marginTop: '30px'}}/>
                );
            case 3:
                return (
                    <DynamicTable
                        initialData={payloadData?.customDataList}
                    />
                );
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
                                    {selectedRowData ? selectedRowData.toolGroup : ""}
                                </p>
                                {selectedRowData && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('status')}
                                            <span className={styles.fadedText}>
                                                : {selectedRowData.status
                                                    ? (selectedRowData.status)
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
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="DC Tabs">
                            <Tab label={t("main")} />
                            <Tab label={t("attachmentList")} />
                            <Tab label={t("calibration")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer}>
                <div className={styles.floatingButtonContainer}>
                    <Button type='primary'
                        // className={`${styles.floatingButton} ${styles.saveButton}`}
                        onClick={handleSave}
                    >
                        {selectedRowData ? t("save") : t("create")}
                    </Button>
                    <Button
                        className={`${styles.floatingButton} ${styles.cancelButton}`}
                        onClick={handleCancel}
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
                        toolGroup: selectedRowData?.toolGroup || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        name="toolGroup"
                        label={t("toolGroup")}
                        rules={[{ required: true, message: 'Please enter the Tool Group' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'toolGroup')} />
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

export default ToolGroupBodyContent;