import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/ComponentBuilder.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { Form, Input, message, Button, Modal, Tooltip, Select, Switch, Typography, Row, Col, List } from 'antd';
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
import { createComponent, deleteComponent, retrieveAllComponents, retrieveComponent, retrieveTop50Components, updateComponent } from '@services/componentBuilderService';
import camelCase from 'lodash/camelCase';
import { PlusOneOutlined } from '@mui/icons-material';
import AddIcon from "@mui/icons-material/Add";
import { defaultFormData } from '../types/componentBuilderTypes';
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
    setSelectedRowData: (any) => void;
}





const ComponentBuilderBody: React.FC<ComponentBuilderBodyProps> = ({
    isAdding, selectedRowData, onClose, call, setCall, setFullScreen, setAddClick, fullScreen, setSelectedRowData }) => {


    const { payloadData, setPayloadData, showAlert, setShowAlert, isRequired, setIsRequired,
        transformedRowData, triggerSave, setTriggerSave, columnNames, setColumnNames, rowData, setRowData,
        setTransformedRowData
    } = useMyContext();
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [componentList, setComponentList] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<any>();
    const [searchTerm, setSearchTerm] = useState<any>();
    const [form] = Form.useForm();


    useEffect(() => {
        const fetchTop50Data = async () => {
            // debugger;


            setTimeout(async () => {
                try {
                    // debugger;
                    let top50ListData;
                    const cookies = parseCookies();
                    const site = cookies?.site;
                    try {
                        top50ListData = await retrieveTop50Components({ site });
                        top50ListData = top50ListData.map((item: any) => ({
                            componentLabel: item.componentLabel,
                            dataType: item.dataType,
                            defaultValue: item.defaultValue,
                            required: item.required,
                        }));
                        if (!top50ListData?.errorCode) {
                            setComponentList(top50ListData);
                        }
                        else {
                            setComponentList([]);
                        }
                    }
                    catch (e) {
                        console.error("Error in retrieving top 50 components", e);
                    }
                } catch (error) {
                    console.error("Error fetching top 50 components:", error);
                }
            }, 1000);

        };

        fetchTop50Data();
    }, [call]);



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




    const handleTransformRowData = () => {
    const transformed = Array.from({ length: Number(payloadData?.tableConfig?.rows) || 0 }).map((_, rowIdx) => {
        const rowObj: { [key: string]: string } = {};

        columnNames.forEach((column, colIdx) => {
            const key = `row${rowIdx + 1}-col${colIdx}`;
            rowObj[column.dataIndex] = payloadData?.tableConfig?.rowData?.[key] || '';
        });

        return rowObj;
    });

    // Update the local state
    setTransformedRowData(transformed);

    // Update the payload data
    setPayloadData((prev) => ({
        ...prev,
        tableConfig: {
            ...prev.tableConfig,
            rowData: transformed
        }
    }));
};



    const handleSave = async (oEvent) => {
        message.destroy();
        // handleTransformRowData();
        // setTriggerSave(triggerSave + 1);
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

        // if (payloadData?.dataType == "Table") {
        //     if ((payloadData?.tableConfig?.columns == "" || payloadData?.tableConfig?.columns == null || payloadData?.tableConfig?.columns == undefined)) {
        //         message.error("No. of columns cannot be empty");
        //         return;
        //     }
        // }

        // New validation for table column names
        if (payloadData?.dataType == 'Table') {
            const columnNames = payloadData?.tableConfig?.columnNames || [];
            const numberOfColumns = parseInt(payloadData?.tableConfig?.columns || '0', 10);

            // Check if column names are provided for all columns
            // if (columnNames.length != numberOfColumns) {
            //     message.error(`Please provide names for all ${numberOfColumns} columns`);
            //     return;
            // }

            // Check if any column name is empty
            // const hasEmptyColumnName = columnNames.some(name => !name || name.trim() == '');
            const hasEmptyColumnName = columnNames.some(item => !item?.title || item?.title?.trim() == '');

            // if (hasEmptyColumnName) {
            //     message.error("Column names cannot be empty");
            //     return;
            // }
        }

        // Validation for Reference Table column names
        if (payloadData?.dataType == 'Reference Table') {
            const columnNames = payloadData?.tableConfig?.columnNames || [];
            const numberOfColumns = parseInt(payloadData?.tableConfig?.columns || '0', 10);
            const numberOfRows = parseInt(payloadData?.tableConfig?.rows || '0', 10);

            // if (numberOfColumns == 0) {
            //     message.error("No. of columns cannot be empty");
            //     return;
            // }

            // if (numberOfRows == 0) {
            //     message.error("No. of rows cannot be empty");
            //     return;
            // }


            // Check if column names are provided for all columns
            // if (columnNames.length != numberOfColumns) {
            //     message.error(`Please provide names for all ${numberOfColumns} columns`);
            //     return;
            // }

            // Check if any column name is empty
            const hasEmptyColumnName = columnNames.some(item => !item?.title || item?.title?.trim() == '');
            // if (hasEmptyColumnName) {
            //     message.error("Column names cannot be empty");
            //     return;
            // }
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
                    dataIndex: camelCase(payloadData?.componentLabel),
                    rowData: transformedRowData,
                    userId: user,
                }

                // if (payloadData?.dataType != "Table" && payloadData?.dataType != "Reference Table") {
                //     delete updatedRequest?.rowData;
                // }

                if (payloadData?.dataType != "Integer" && payloadData?.dataType != "Decimal") {
                    delete updatedRequest?.maxValue;
                    delete updatedRequest?.minValue;
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

    const handleRowSelect = (row: any) => {

        const fetchConfig = async () => {
            try {
                let response;
                const cookies = parseCookies();
                const site = cookies?.site;
                const request = {
                    site: site,
                    componentLabel: row.componentLabel
                }
                try {
                    response = await retrieveComponent(request);
                    if (!response?.errorCode) {
                        const dummyData1 = {
                            "site": "1004",
                            "componentLabel": "asass",
                            "dataType": "Reference Table",
                            "unit": "kg",
                            "defaultValue": null,
                            "required": false,
                            "validation": "",
                            "dropdownOptions": [],
                            "apiUrl": "",
                            "tableConfig": {
                                "rows": "2",
                                "rowData": {
                                    "row1-col0": "55"
                                },
                                "columns": "2",
                                "columnNames": [
                                    {
                                        "title": "vsdvsdv",
                                        "type": "Input",
                                        "dataIndex": "vsdvsdv",
                                    },
                                    {
                                        "title": "sdvsv",
                                        "type": "Input",
                                        "dataIndex": "sdvsv"
                                    }
                                ]
                            },
                            "dataIndex": "asass",
                            "rowData": [],
                            "userId": "rits_admin"
                        }
                        const dummyData = {
                            "site": "1004",
                            "componentLabel": "hjj",
                            "dataType": "Reference Table",
                            "unit": "kg",
                            "defaultValue": null,
                            "required": false,
                            "validation": "",
                            "dropdownOptions": [],
                            "apiUrl": "",
                            "tableConfig": {
                                "columns": "2",
                                "columnNames": [
                                    {
                                        "title": "555",
                                        "type": "Input",
                                        "dataIndex": "555"
                                    },
                                    {
                                        "title": "66",
                                        "type": "Input",
                                        "dataIndex": "66"
                                    }
                                ],
                                "rows": 1,
                                "rowData": {
                                    "row1-col0": "22",
                                    "row1-col1": ""
                                }
                            },
                            
                            
                            "userId": "rits_admin"
                        }
                        setPayloadData(response);
                        setSelectedRowData(response);
                    }

                }
                catch (e) {
                    console.error("Error in retrieveing the component", e);
                }
            } catch (error) {
                console.error("Error fetching component:", error);
            }
        };

        if (showAlert == true && isAdding == true) {
            Modal.confirm({
                title: t('confirm'),
                content: t('rowSelectionMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    // Proceed with the API call if confirmed
                    try {
                        await fetchConfig();
                    }
                    catch (e) {
                        console.error("Error in retrieveing the component: ", e);
                    }
                    setShowAlert(false)
                },
                onCancel() {
                },
            });
        } else {
            // If no data to confirm, proceed with the API call
            fetchConfig();
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
                > <ApiConfigurationForm setFullScreen={setFullScreen}  /> </div>)

            default:
                return null;
        }
    };



    const handleSearch = async () => {

        const cookies = parseCookies();
        const site = cookies?.site;
        const request = {
            site: site,
            componentLabel: searchTerm
        }
        try {
            let response = await retrieveAllComponents(request);


            // Update the filtered data state
            setComponentList(response);

        }
        catch (e) {
            console.log("Error in retrieving all configuration", e);
        }
    }

    const handleOnAdd = () => {
        setPayloadData(defaultFormData);
        setSelectedRowData(null);
    }


    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div >
                        <div className={styles.split} >
                            <div >
                                <p className={styles.headingtext} style={{ marginLeft: '10px' }}>
                                    {selectedRowData ? selectedRowData?.componentLabel : t('createComponent')}
                                </p>

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



                    <div style={{ borderTop: '1px solid #e0e0e0', marginTop: '0%' }}></div>



                    <Row className={styles["section-builder-container"]}>
                        {/* Left side: List of dummy components */}
                        <Col span={4} className={styles["left-section"]}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    paddingBottom: "10px",
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontWeight: 500,
                                    marginBottom: "16px"
                                }}>
                                    <span>Components ({componentList?.length || 0})</span>
                                    <Tooltip title="Add">
                                        <AddIcon style={{ cursor: 'pointer' }} onClick={handleOnAdd} />
                                    </Tooltip>
                                </div>
                                <Input.Search
                                    placeholder="Search components..."
                                    style={{ marginBottom: "16px" }}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    value={searchTerm}
                                    onSearch={handleSearch}
                                />
                                <div style={{ flex: 1, overflowY: "auto" }}>
                                    {isLoading ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: "100%",
                                            }}
                                        >
                                            Loading components...
                                        </div>
                                    ) : (
                                        <List
                                            dataSource={componentList}
                                            renderItem={(component: any, index) => (
                                                <List.Item
                                                    key={index}
                                                    style={{
                                                        padding: "8px",
                                                        backgroundColor: "#fff",
                                                        marginBottom: "8px",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        transition: "all 0.3s ease",
                                                        border: "1px solid transparent",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f0f7ff";
                                                        e.currentTarget.style.borderColor = "#1890ff";
                                                        e.currentTarget.style.boxShadow =
                                                            "0 2px 8px rgba(24,144,255,0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#fff";
                                                        e.currentTarget.style.borderColor = "transparent";
                                                        e.currentTarget.style.boxShadow =
                                                            "0 2px 4px rgba(0,0,0,0.05)";
                                                    }}
                                                    onClick={() => handleRowSelect(component)}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <div
                                                            style={{ display: "flex", flexDirection: "column" }}
                                                        >
                                                            <span style={{ fontWeight: 400 }}>
                                                                {component.componentLabel}
                                                            </span>
                                                            {/* <span
                                                                style={{
                                                                    fontSize: "0.8em",
                                                                    color: "#666",
                                                                    marginTop: "4px",
                                                                }}
                                                            >
                                                                {component.componentLabel}
                                                            </span> */}
                                                        </div>
                                                        {/* <PlusOneOutlined style={{ color: "#1890ff" }} /> */}
                                                        <Typography style={{
                                                            fontSize: "12px",
                                                            color: "#666",
                                                            margin: 0,
                                                        }}> {component.dataType} </Typography>
                                                    </div>
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Right side: Existing content */}
                        <Col span={20} style={{ padding: '10px' }}>
                            {/* Existing content */}
                            {/* <div style={{ borderTop: '1px solid #e0e0e0', marginTop: '0%' }}></div> */}
                            <ApiConfigurationForm setFullScreen={setFullScreen}  />
                        </Col>
                    </Row>


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