import React, { useState, useEffect, useRef, useContext } from 'react';
// import styles from '../styles/RoutingMaintenance.module.css';
import styles from '../styles/RoutingStep.module.css';
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
import DynamicTableBuilder from './DynamicTableBuilder';
import { createRouting, deleteRouting, updateRouting } from '@services/routingServices';
import { createDataCollection, deleteDataCollection, updateDataCollection } from '@services/dataCollectionServices';
import DCAttachment from './Attachment';
import { WorkInstructionContext } from '../hooks/WorkInstructionContext';
import { defaultWorkInstructionRequest, WorkInstructionRequest } from '../types/WorkInstructionTypes';
import { createWorkInstruction, deleteWorkInstruction, UpdateWorkInstruction } from '@services/workInstructionService';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import mammoth from 'mammoth';

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

interface WorkInstructionBodyContentProps {
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

const instructionOptions = [
    { value: 'text', label: 'Text' },
    { value: 'url', label: 'Url' },
    { value: 'file', label: 'File' },
];

const getFileTypeFromBase64 = (base64String: string): string => {
    // Common file signatures
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

const WorkInstructionBodyContent: React.FC<WorkInstructionBodyContentProps> = ({ call, setCall, resetValueCall,
    setResetValueCall, selectedRowData, onClose, resetValue, oCustomDataList, customDataForCreate,
    itemData, customDataOnRowSelect, itemRowData, rowClickCall,
    setCustomDataOnRowSelect, addClick, schema, updatedRowData
}) => {

    const { activeTab, setActiveTab, isStepModalVisible, setIsStepModalVisible, fullScreen, setFullScreen, isNextPage, setIsNextPage, payloadData,
        setPayloadData, username, setShowAlert, isAdding } = useContext<any>(WorkInstructionContext);

    console.log(payloadData);



    const [mainFormData, setMainFormData] = useState<Record<string, any>>(selectedRowData || {});
    // const [activeTab, setActiveTab] = useState<number>(0);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []); 
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedInstructionType, setSelectedInstructionType] = useState<string | undefined>('');

    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);

    // State for copy modal input values
    const [copyItem, setCopyItem] = useState<string>('');
    const [copyRevision, setCopyRevision] = useState<string>('');
    const [copyDescription, setCopyDescription] = useState<string>('');
    const [form] = Form.useForm();

    // const [formValues, setFormValues] = useState<{ user: string; mail: string }>({ user: '', mail: '' });
    const [formValues, setFormValues] = useState([]);
    const tableRef = useRef<{ getData: () => any[] }>(null);
    const [alt, setAlt] = useState<any[]>([]);
    const [formData, setFormData] = useState<WorkInstructionRequest>(defaultWorkInstructionRequest);

    // Add new state for preview modal
    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<any>(null);

    // Add new state for DOCX content
    const [docxContent, setDocxContent] = useState<string | null>(null);

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
        if (selectedRowData) {
            form.setFieldsValue(selectedRowData);
            form.setFieldsValue({ instructionType: selectedRowData?.instructionType });
            setSelectedInstructionType(selectedRowData?.instructionType);

            // Add this part to handle the file upload
            if (selectedRowData.file) {
                form.setFieldsValue({ fileName: selectedRowData.fileName });
                
                const fileList = [{
                    uid: '-1',
                    name: selectedRowData.fileName,
                    status: 'done',
                    url: `data:${selectedRowData.fileType};base64,${selectedRowData.file}`, 
                }];
                // Set the fileList in the form
                form.setFieldsValue({ fileList });
            }
        }
    }, [form, selectedRowData]);



    //console.log("customData: ", customData);

    const handleFormChange = (data: Record<string, any>) => {
        if (activeTab === 0) {
            setMainFormData(prevState => ({ ...prevState, ...data }));
        }
    };

    const handleOpenChange = () => {
        debugger
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);

    }

    const onFinishFailed = (values: Record<string, any>) => {
        console.log(values);
    };

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

        const oCreateDC = async () => { // Rename the inner function to avoid recursion
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;
            try {
                if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    setTimeout(async function () {
                        console.log("Work instruction request: ", updatedRowData);
                        const updateResponse = await UpdateWorkInstruction(site, userId, updatedRowData);
                        console.log("Work instruction response: ", updateResponse);
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

    const handleTableDataChange = (data: CustomData[]) => {
        // debugger;
        console.log("custom data change: ", data);
        if (activeTab === 2) {
            // setCustomData(data as CustomData[]);
        }
        setPayloadData(prevPayloadData => ({
            ...prevPayloadData,
            customDataList: data,
            userId: username
        }));
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
            const userId = cookies.rl_user_id;

            try {
                const payload = {
                    site: site,
                    userId: userId,
                    ...selectedRowData
                }

                console.log("Work instruction delete request: ", payload);
                const DeleteWI = await deleteWorkInstruction(site, userId, payload);
                console.log("Work instruction delete response: ", DeleteWI);
                
                if (!DeleteWI.errorCode) {
                    message.success(DeleteWI.message_details.msg);
                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted routing: ", DeleteWI);
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
        form.setFieldsValue({
            workInstruction: selectedRowData?.workInstruction + "_COPY" || '',
            revision: "",
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
                updatedRowData.workInstruction = values.workInstruction;
                updatedRowData.revision = values.revision;
                updatedRowData.description = values.description;

                console.log("WorkInstruction request:", updatedRowData);

                const copyDC = async () => { // Rename the inner function to avoid recursion

                    try {
                        console.log("WorkInstruction copy request: ", updatedRowData);
                        const copyResponse = await createWorkInstruction(site, userId, updatedRowData);
                        console.log("WorkInstruction copy response: ", copyResponse);
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

                copyDC();
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

        if (field === 'instructionType') {
            setSelectedInstructionType(value);

            setPayloadData((prev) => ({
                ...prev,
                url: '',
                text: '', 
                file: '',
                [field]: value,
            }));
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

    console.log(payloadData, 'payloadData');
    

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
                            status: selectedRowData?.status || "Releasable",
                            required: selectedRowData?.required || false,
                            currentVersion: selectedRowData?.currentVersion || false,
                            alwaysShowInNewWindow: selectedRowData?.alwaysShowInNewWindow || false,
                            logViewing: selectedRowData?.logViewing || false,
                            changeAlert: selectedRowData?.changeAlert || false,
                            erpWi: selectedRowData?.erpWi || false,
                            instructionType: selectedRowData?.instructionType || '',
                            url: selectedRowData?.url || "",
                            text: selectedRowData?.text || "",
                            file: selectedRowData?.file || "", // Assuming this is the base64 value
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
                            initialValue="Releasable"
                        >
                            <Select onChange={(value) => handleSelectChange('status', value)}>
                                <Select.Option value="Releasable">Releasable</Select.Option>
                                <Select.Option value="Hold">Hold</Select.Option>
                                <Select.Option value="Obsolete">Obsolete</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name='required'
                            label={t("required")}
                            valuePropName="checked"
                            initialValue={false}
                        >
                            <Switch onChange={(checked) => handleSwitchChange('required', checked)} />
                        </Form.Item>

                        <Form.Item
                            name='currentVersion'
                            label={t("currentVersion")}
                            valuePropName="checked"
                            initialValue={false}
                        >
                            <Switch onChange={(checked) => handleSwitchChange('currentVersion', checked)} />
                        </Form.Item>

                        <Form.Item
                            name='alwaysShowInNewWindow'
                            label={t("alwaysShowInNewWindow")}
                            valuePropName="checked"
                            initialValue={false}
                        >
                            <Switch onChange={(checked) => handleSwitchChange('alwaysShowInNewWindow', checked)} />
                        </Form.Item>

                        <Form.Item
                            name='logViewing'
                            label={t("logViewing")}
                            valuePropName="checked"
                            initialValue={false}
                        >
                            <Switch onChange={(checked) => handleSwitchChange('logViewing', checked)} />
                        </Form.Item>

                        <Form.Item
                            name='changeAlert'
                            label={t("changeAlert")}
                            valuePropName="checked"
                            initialValue={false}
                        >
                            <Switch onChange={(checked) => handleSwitchChange('changeAlert', checked)} />
                        </Form.Item>

                        <Form.Item
                            name='erpWi'
                            label={t("erpWi")}
                            valuePropName="checked"
                            initialValue={false}
                        >
                            <Switch onChange={(checked) => handleSwitchChange('erpWi', checked)} />
                        </Form.Item>

                        <Form.Item
                            name='instructionType'
                            label={t("instructionType")}
                            initialValue={selectedInstructionType}
                            rules={[{ required: true, message: `Please select Instruction Type` }]}
                        >
                            <Select onChange={(value) => handleSelectChange('instructionType', value)}>
                                {instructionOptions.map(option => (
                                    <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {selectedInstructionType === 'url' && (
                            <Form.Item
                                name='url'
                                label={t('url')}
                                rules={[{ required: true, message: `Please input URL` }]}
                            >
                                <Input onChange={(e) => handleInputChange('url', e.target.value)} />
                            </Form.Item>
                        )}

                        {selectedInstructionType === 'text' && (
                            <Form.Item
                                name='text'
                                label={t('text')}
                                rules={[{ required: true, message: `Please input text` }]}
                            >
                                <Input onChange={(e) => handleInputChange('text', e.target.value)} />
                            </Form.Item>
                        )}

                        {selectedInstructionType === 'file' && (
                            <>
                                <Form.Item
                                    name='file'
                                    label={t('file')}
                                    rules={[{ required: true, message: `Please upload a file` }]}
                                >
                                    <Upload
                                        accept="*/*"
                                        maxCount={1}
                                        beforeUpload={(file) => {
                                            handleFileUpload(file);
                                            return false; // Prevent default upload behavior
                                        }}
                                        fileList={form.getFieldValue('file') ? [{
                                            uid: '-1',
                                            name: form.getFieldValue('fileName') || 'document',
                                            status: 'done',
                                        }] : []}
                                        onRemove={() => {
                                            form.setFieldsValue({ 
                                                file: undefined,
                                                fileName: undefined 
                                            });
                                            setPayloadData(prev => ({
                                                ...prev,
                                                file: undefined,
                                                fileName: undefined,
                                                fileType: undefined
                                            }));
                                        }}
                                    >
                                        <Button>{t('uploadFile')}</Button>
                                    </Upload>
                                </Form.Item>

                                {(form.getFieldValue('file') || payloadData?.file) && (
                                    <Form.Item label={t('preview')}>
                                        <Button 
                                            type="primary"
                                            onClick={() => handlePreviewClick(
                                                form.getFieldValue('file') || payloadData?.file,
                                                form.getFieldValue('fileName') || payloadData?.fileName || 'document'
                                            )}
                                        >
                                            {t('showPreview')}
                                        </Button>
                                    </Form.Item>
                                )}
                            </>
                        )}

                        {selectedInstructionType === 'file' && (
                            <Form.Item
                                name='fileName'
                                label={t('fileName')}
                                rules={[{ required: true, message: `Please input file name` }]}
                            >
                                <Input onChange={(e) => handleInputChange('fileName', e.target.value)} />
                            </Form.Item>
                        )}
                    </Form>
                )

            case 1:
                return (
                    <DCAttachment attachmentColumns={attachmentColumns} data={[]}
                    />
                );
            case 2:
                return (
                    <DynamicTable
                        initialData={payloadData?.customDataList}
                    />
                );
            default:
                return null;
        }
    };

    // Update handlePreviewClick function
    const handlePreviewClick = async (fileData: string, fileName: string) => {
        if (!fileData) {
            message.error('No file data available');
            return;
        }

        try {
            const fileType = getFileTypeFromBase64(fileData);
            
            if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const htmlContent = await convertDocxToHtml(fileData);
                setDocxContent(htmlContent);
                setPreviewFile({
                    uri: '',  // Not needed for DOCX preview
                    fileName: fileName
                });
            } else {
                setDocxContent(null);
                setPreviewFile({
                    uri: `data:${fileType};base64,${fileData}`,
                    fileName: fileName
                });
            }
            setIsPreviewModalVisible(true);
        } catch (error) {
            console.error('Error preparing preview:', error);
            message.error('Failed to preview file');
        }
    };

    // Add more comprehensive DOCX styles
    const docxStyles = `
        .docx-content {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .docx-content h1 { font-size: 24px; margin: 24px 0; color: #2c3e50; }
        .docx-content h2 { font-size: 20px; margin: 20px 0; color: #34495e; }
        .docx-content h3 { font-size: 18px; margin: 16px 0; color: #445566; }
        .docx-content p { margin: 12px 0; }
        .docx-content ul, .docx-content ol { margin: 12px 0; padding-left: 30px; }
        .docx-content li { margin: 6px 0; }
        .docx-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        .docx-content td, .docx-content th {
            border: 1px solid #ddd;
            padding: 12px;
        }
        .docx-content th {
            background-color: #f5f6fa;
            font-weight: bold;
        }
        .docx-content img {
            max-width: 100%;
            height: auto;
            margin: 15px 0;
        }
        .docx-content a {
            color: #3498db;
            text-decoration: none;
        }
        .docx-content a:hover {
            text-decoration: underline;
        }
        .docx-content blockquote {
            border-left: 4px solid #e0e0e0;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #f9f9f9;
        }
    `;

    // Add style tag to the document head
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = docxStyles;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (

        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData.workInstruction : ""}
                                </p>
                                {selectedRowData && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('revision')}
                                            <span className={styles.fadedText}>
                                                : {selectedRowData.revision
                                                    ? (selectedRowData.revision)
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
                            <Tab label={t("attachmentList")} />
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
                        workInstruction: selectedRowData?.workInstruction || '',
                        version: '',
                        description: ''
                    }}
                >
                    <Form.Item
                        name="workInstruction"
                        label={t("workInstruction")}
                        rules={[{ required: true, message: 'Please enter the Data Collection' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'workInstruction')} />
                    </Form.Item>

                    <Form.Item
                        name="revision"
                        label={t("revision")}
                        rules={[{ required: true, message: 'Please enter the revision' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'revision')} />
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
                title={t("preview")}
                open={isPreviewModalVisible}
                onCancel={() => {
                    setIsPreviewModalVisible(false);
                    setDocxContent(null);
                }}
                width={800}
                footer={null}
                centered
            >
                <div style={{ height: '70vh', overflow: 'auto' }}>
                    {docxContent ? (
                        <div 
                            className="docx-content"
                            style={{ 
                                height: '100%', 
                                overflow: 'auto', 
                                backgroundColor: 'white',
                                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                            }}
                            dangerouslySetInnerHTML={{ __html: docxContent }}
                        />
                    ) : (
                        <DocViewer
                            documents={[previewFile]}
                            pluginRenderers={DocViewerRenderers}
                            style={{ height: '100%', overflow: 'auto' }}
                            config={{
                                header: {
                                    disableHeader: false,
                                    disableFileName: false,
                                }
                            }}
                        />
                    )}
                </div>
            </Modal>
        </div>



    );
};

export default WorkInstructionBodyContent;