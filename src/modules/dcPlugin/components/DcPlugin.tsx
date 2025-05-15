import React, { useEffect, useState } from 'react';
import { Button, Input, Row, Col, Form, Select, Switch, DatePicker, Modal, Table, Drawer, DrawerProps, Space, message, Tooltip } from 'antd';
import styles from '@modules/assembly/styles/Assembly.module.css';
import { PodConfig } from '@modules/podApp/types/userTypes';

import { parseCookies } from 'nookies';
import DCTable from './DCTable';

import { GrChapterAdd } from 'react-icons/gr';
import { collectData, getDCList, retrieveCollectedDCParamList, retrieveDataField, retrieveOperationVersion, retrievePreSaved, safeDraft, } from '@services/dcPluginService';
import { IoIosArrowDown } from "react-icons/io";
import { useTranslation } from 'react-i18next';
import CollectDataIcon from '@mui/icons-material/DataUsage'; // Replaced with an available icon
import ShowDetailsIcon from '@mui/icons-material/Visibility'; // Use the correct icon name// Import the appropriate icon
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { calc } from 'antd/es/theme/internal';
import ShowCollectedDataTable from './ShowCollectedDataTable';

interface DCPluginProps {
    filterFormData: PodConfig;
    selectedRowData: any;
    call2: number;
    setCall2: (value: number) => void;
}


const DCMain: React.FC<DCPluginProps> = ({ filterFormData, selectedRowData, call2, setCall2 }) => {
    // Combine related state declarations
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [selectedRowDatas, setSelectedRowDatas] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<any[]>([]);
    const [showTable, setShowTable] = useState<boolean>(true);
    const [dcList, setDcList] = useState<any>();
    const [paramList, setParamList] = useState<any>();
    const { t } = useTranslation();

    // Use optional chaining for better readability
    const shopOrder = selectedRowData?.[0]?.shopOrder;
    const pcu = selectedRowData?.[0]?.pcu;
    const [listModalVisible, setListModalVisible] = useState(false);


    const [selectedDC, setSelectedDc] = useState<any>();
    const [selectedParam, setSelectedParam] = useState<any>(null); // Add this line to declare selectedParam state

    const [initialFormValues, setInitialFormValues] = useState({}); // State to hold initial form values
    const [clickedParameterName, setClickedParameterName] = useState<string | null>(null);
    const [formUpdateKey, setFormUpdateKey] = useState(0); // Add this line to track form updates
    const [fieldList, setFieldList] = useState<any>();
    const [errorMessages, setErrorMessages] = useState<any>({});
    const [isErrorMsg, setIsErrorMsg] = useState<boolean>(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportList, setReportList] = useState<any>();
    const [fetchTrigger, setFetchTrigger] = useState(false);
    const [userName, setUserName] = useState<any>();

    const handleCancel = () => {
        setModalVisible(false);
        setFormUpdateKey(prev => prev + 1);
    };

    const fetchDCList = async () => {
        const cookies = parseCookies();
        // console.log("cookies: ", cookies);
        setUserName(cookies?.rl_user_id)
        const site = cookies.site;

        const params = {
            site,
            resource: filterFormData?.defaultResource || '',
            operation: filterFormData?.defaultOperation || '',
            pcu: pcu,
            "attachmentList": [{
                site,
                pcu,
                operation: filterFormData?.defaultOperation,
                operationVersion: (await retrieveOperationVersion(site, filterFormData?.defaultOperation)).revision,
                routing: selectedRowData?.[0]?.router?.split("/")[0],
                routingVersion: selectedRowData?.[0]?.router?.split("/")[1],
                item: selectedRowData?.[0]?.item?.split("/")[0],
                itemVersion: selectedRowData?.[0]?.item?.split("/")[1],
                shopOrder,
                resource: filterFormData?.defaultResource
            }],
        };

        try {
            // debugger
            console.log("DC List request: ", params);
            const response = await getDCList(params);
            console.log("DC List response: ", response);

            if (!response.errorCode) {
                setDcList(response?.dataCollectionList);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if (filterFormData && selectedRowData) {
    //         const initializeFetch = async () => {
    //             await fetchDCList();
    //         };
    //         initializeFetch();
    //     }
    // }, [filterFormData, selectedRowData]); 

    useEffect(() => {
        if (call2 !== 0 || filterFormData || selectedRowData) { // Add condition to prevent infinite loop
            fetchDCList();
        }
    }, [call2, filterFormData, selectedRowData]);





    useEffect(() => {
        if (formUpdateKey)
            renderFormFields();
    }, [formUpdateKey]);

    const handleCollectDataClick = async (record) => {
        // Handle first button click
        // setFormUpdateKey(prev => prev + 1);
        // setFormUpdateKey(prev => prev + 1);
        // setTimeout(async () => {
        setParamList(record?.parameterList);
        setModalVisible(true);
        setSelectedDc(record);
        const cookies = parseCookies();
        const site = cookies.site;
        const req = {
            site,
            pcu,
            resource: filterFormData?.defaultResource || '',
            operation: filterFormData?.defaultOperation || '',
            "dataCollection": record?.dataCollection,
            "version": record?.version,
        }

        console.log("Retrieve presaved request: ", req);
        const retrievePreSavedResponse = await retrievePreSaved(req);
        console.log("Retrieve presaved response: ", retrievePreSavedResponse);
        if (retrievePreSavedResponse?.errorCode) {
            if (retrievePreSavedResponse?.errorCode == 2302) {
                form.resetFields();
                setFormUpdateKey(prev => prev + 1);
            }

        }
        else {
            const setFieldValues = () => {
                setFormUpdateKey(prev => prev + 1);
                const updatedParametricPreSaves = retrievePreSavedResponse?.parametricPreSaves?.reduce((acc, param) => {
                    const baseKey = param.parameterBo.split('_')[0]; // Get the base key name (e.g., PASSED, Cleanliness)
                    const existingCount = Object.keys(acc).filter(key => key.startsWith(baseKey)).length; // Count existing keys with the same base
                    acc[`${baseKey}_${existingCount + 1}`] = param.actualValue; // Set key-value pair with base key and incrementing suffix
                    return acc;
                }, {});
                console.log("Formatted pre saved list: ", updatedParametricPreSaves);
                form.setFieldsValue(updatedParametricPreSaves);
            }
            await setFieldValues();
            console.log(form.getFieldsValue());

        }
        // }, 1000);
        // console.log('Collect data:', record);
    };

    const handleShowReportClick = async (record) => {
        // Handle second button click
        // console.log('Second button clicked for:', record);
        const cookies = parseCookies();
        const site = cookies.site;
        const req = {
            site,
            pcu,
            "dataCollection": record?.dataCollection,
            "version": record?.version,
        }
        console.log("Retrieve Collected DC Param list: ", req);
        const retrieveCollectedDCParamListResponse = await retrieveCollectedDCParamList(req);
        console.log("Retrieve Collected DC Param list: ", retrieveCollectedDCParamListResponse);
        if (!retrieveCollectedDCParamListResponse.errorCode) {
            if (retrieveCollectedDCParamListResponse.length > 0)
                setReportList(retrieveCollectedDCParamListResponse[0]?.parametricMeasuresList);
            else
                setReportList([]);
        }
        else
            setReportList([]);
        setReportModalVisible(true)
    };

    // console.log("DC List: ", dcList);
    const oDCTableColumns = [
        { title: t("dataCollection"), dataIndex: "dataCollection", key: "dataCollection", align: 'center' as 'left' | 'right' | 'center' },
        { title: t("version"), dataIndex: "version", key: "version", align: 'center' as 'left' | 'right' | 'center' },
        { title: t("description"), dataIndex: "description", key: "description", align: 'center' as 'left' | 'right' | 'center' },
        { title: t("collectDataAt"), dataIndex: "collectDataAt", key: "collectDataAt", align: 'center' as 'left' | 'right' | 'center' },
        {
            title: t("details"),
            dataIndex: "details",
            key: "details",
            align: 'center' as 'left' | 'right' | 'center',
            render: (text, record) => (
                <Row justify="center">
                    <Tooltip title={t("collectData")}>
                        {/* <Button
                            disabled={dcList.find(item => item.dataCollection == record.dataCollection)?.dataCollected}
                            onClick={() => handleCollectDataClick(record)}
                            style={{ marginRight: '8px' }}
                        >
                            <PlaylistAddCheckIcon />
                        </Button> */}
                    </Tooltip>

                    <Tooltip title={t("collectData")}>
                        <PlaylistAddCheckIcon
                            onClick={() => {
                                if (!dcList.find(item => item.dataCollection == record.dataCollection)?.dataCollected) {
                                    handleCollectDataClick(record);
                                }
                            }}
                            style={{ marginRight: '8px', cursor: 'pointer', opacity: dcList.find(item => item.dataCollection == record.dataCollection)?.dataCollected ? 0.5 : 1 }} // Adjust opacity for disabled effect
                        />
                    </Tooltip>

                    {/* <Tooltip title={t("showDetails")}>
                        <Button
                            disabled={dcList.find(item => item.dataCollection == record.dataCollection)?.showReport}
                            onClick={() => handleShowReportClick(record)}
                        >
                            <ShowDetailsIcon />
                        </Button>
                    </Tooltip> */}

                    <Tooltip title={t("showDetails")}>
                        <ShowDetailsIcon
                            onClick={() => {
                                if (!dcList.find(item => item.dataCollection == record.dataCollection)?.showReport) {
                                    handleShowReportClick(record);
                                }
                            }}
                            style={{ cursor: 'pointer', opacity: dcList.find(item => item.dataCollection == record.dataCollection)?.showReport ? 0.5 : 1 }} // Adjust opacity for disabled effect
                        />
                    </Tooltip>

                </Row>
            ),
        },
    ];

    const renderFormFields = () => {
        // Assuming dcList is populated with the new data structure
        // console.log("parameterList: ", paramList);
        // fetchDCList();
        return paramList?.map((param, index) => (
            <React.Fragment key={param.sequence}>
                <Form.Item style={{ marginBottom: '4px' }}> {/* Decreased space between input fields */}
                    <Row gutter={2}> {/* Added gutter for spacing between columns */}

                        {/* REQUIRED FIELDS */}
                        {Array.from({ length: parseInt(param.requiredDataEntries) }).map((_, i) => ( // Create required inputs based on requiredDataEntries
                            <Col span={24} key={`required-${index}-${i}`} > {/* Changed to span={24} for full width */}
                                <Row style={{ marginTop: '1px', marginBottom: '-15px' }}>
                                    <Col span={8} style={{ marginTop: '5px' }}> {/* Label column */}
                                        <span>{param.parameterName}  <span style={{ color: 'red' }}>*</span></span> {/* Updated label for required fields */}
                                    </Col>
                                    <Col span={16}> {/* Input column */}
                                        <Form.Item
                                            name={`${param.parameterName}_${i + 1}`} // Set the name for the form field
                                            // style={{ margin: 0 }}
                                            initialValue={param.defaultValue} // Set initial value for the field
                                        // style={{ marginTop: '3px', marginBottom: '3px' }}
                                        >
                                            {param.type === 'Boolean' ? ( // Check for Boolean type
                                                <Select
                                                    // style={{ marginTop: '5px', marginBottom: '5px' }}
                                                    value={form.getFieldValue(`${param.parameterName}_${i + 1}`)}
                                                    // defaultValue={param.fieldValue !== undefined ? param.fieldValue : param.trueValue}
                                                    // value={param.fieldValue !== undefined ? param.fieldValue : param.trueValue}
                                                    onChange={(value) => {
                                                        param.fieldValue = value; // Update the param's fieldValue
                                                        form.setFieldsValue({ [`${param.parameterName}_${i + 1}`]: value }); // Update form value
                                                    }} // Update form on change
                                                >
                                                    <Select.Option value={param.falseValue}>{param.falseValue}</Select.Option>
                                                    <Select.Option value={param.trueValue}>{param.trueValue}</Select.Option>
                                                </Select>
                                            ) :
                                                param.type === 'Data Field List' ? ( // Check for Data Field List type
                                                    <Row>
                                                        <Col span={24} >
                                                            <Input
                                                                value={form.getFieldValue(`${param.parameterName}_${i + 1}`)}
                                                                // name={clickedParameterName}
                                                                onChange={(e) => {
                                                                    param.fieldValue = e.target.value; // Set the input value to the param
                                                                    form.setFieldsValue({ [`${param.parameterName}_${i + 1}`]: e.target.value }); // Update form value with the correct name
                                                                    setFormUpdateKey(prev => prev + 1);
                                                                }}
                                                                suffix={
                                                                    <GrChapterAdd
                                                                        onClick={(e) => {
                                                                            handleOpenDataFieldListModal(param, e);
                                                                            const index = i + 1;
                                                                            const fullParameterName = `${param.parameterName}_${index}`;
                                                                            setClickedParameterName(fullParameterName);
                                                                            setListModalVisible(true);
                                                                            setFormUpdateKey(prev => prev + 1);
                                                                        }}
                                                                        style={{ fontSize: '15px', cursor: 'pointer' }}
                                                                    />
                                                                }
                                                            /> {/* Input for field value */}
                                                        </Col>
                                                    </Row>
                                                ) :
                                                    (
                                                        <>
                                                            <Input
                                                                value={form.getFieldValue(`${param.parameterName}_${i + 1}`)}
                                                                type={param.type === 'Numeric' ? 'text' : 'text'}
                                                                min={param.minValue}
                                                                max={param.maxValue}
                                                                onKeyPress={(e) => {
                                                                    // Prevent input of non-numeric characters, including '-'
                                                                    if (param.type === 'Numeric' && !/[\d.]/.test(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                onChange={(key) => {
                                                                    const value = key.target.value; // Get the input value
                                                                    param.fieldValue = value; // Set the input value to the param
                                                                    form.setFieldsValue({ [`${param.parameterName}_${i + 1}`]: value }); // Update form value with the correct name

                                                                    // Check if the value is within the specified range
                                                                    if (param.type === 'Numeric') {
                                                                        if (+value < +param.minValue || +value > +param.maxValue) {
                                                                            setErrorMessages(prev => ({
                                                                                ...prev,
                                                                                [`${param.parameterName}_${i + 1}`]: `Value must be between ${param.minValue} and ${param.maxValue}.`
                                                                            })); // Set error message for this specific field
                                                                            setIsErrorMsg(true);
                                                                        } else {
                                                                            setErrorMessages(prev => ({
                                                                                ...prev,
                                                                                [`${param.parameterName}_${i + 1}`]: ''
                                                                            })); // Clear error message if valid
                                                                            setIsErrorMsg(false);
                                                                        }
                                                                    }
                                                                }}
                                                                suffix={param.type === 'Numeric' ? (
                                                                    <span style={{ fontSize: '12px', color: 'gray' }}>
                                                                        ({param.minValue} - {param.maxValue}) {/* Display min and max values */}
                                                                    </span>
                                                                ) : null}
                                                            />
                                                            {param.type === 'Numeric' &&
                                                                form.getFieldValue(`${param.parameterName}_${i + 1}`) &&
                                                                (+form.getFieldValue(`${param.parameterName}_${i + 1}`) < param.minValue ||
                                                                    +form.getFieldValue(`${param.parameterName}_${i + 1}`) > param.maxValue) &&
                                                                errorMessages[`${param.parameterName}_${i + 1}`] && (
                                                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                                                        {errorMessages[`${param.parameterName}_${i + 1}`]}
                                                                    </div>
                                                                )}
                                                        </>

                                                    )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        ))}

                        {/* OPTIONAL FIELDS */}
                        {Array.from({ length: parseInt(param.optionalDataEntries) }).map((_, i) => ( // Create optional inputs based on optionalDataEntries
                            <Col span={24} key={`optional-${index}-${i}`} > {/* Changed to span={24} for full width */}
                                <Row style={{ marginTop: '1px', marginBottom: '-15px' }}>
                                    <Col span={8} style={{ marginTop: '5px' }}> {/* Label column */}
                                        <span>{param.parameterName}</span> {/* Updated label for optional fields */}
                                    </Col>
                                    <Col span={16}> {/* Input column */}
                                        <Form.Item
                                            name={`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`} // Set the name for the form field
                                            // style={{ margin: 0 }}
                                            initialValue={param.defaultValue} // Set initial value for the field
                                        // style={{ marginTop: '3px', marginBottom: '3px' }}
                                        >
                                            {param.type === 'Boolean' ? ( // Check for Boolean type
                                                <Select
                                                    // defaultValue={param.trueValue}
                                                    value={form.getFieldValue(`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`)}
                                                    // style={{ marginTop: '5px', marginBottom: '5px' }}
                                                    onChange={(value) => {
                                                        param.fieldValue = value; // Set the selected value to the param
                                                        form.setFieldsValue({ [`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`]: value }); // Update form value with the correct name
                                                    }} // Update form on change
                                                >
                                                    <Select.Option value={param.falseValue}>{param.falseValue}</Select.Option>
                                                    <Select.Option value={param.trueValue}>{param.trueValue}</Select.Option>
                                                </Select>
                                            ) :
                                                param.type === 'Data Field List' ? ( // Check for Data Field List type
                                                    <Row>
                                                        <Col span={24}
                                                        // style={{ marginTop: '2px', marginBottom: 'px' }}
                                                        >
                                                            <Input
                                                                value={form.getFieldValue(`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`)}
                                                                // name={clickedParameterName}
                                                                onChange={(e) => {
                                                                    param.fieldValue = e.target.value; // Set the input value to the param
                                                                    form.setFieldsValue({ [`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`]: e.target.value }); // Update form value with the correct name
                                                                    setFormUpdateKey(prev => prev + 1);
                                                                }}
                                                                suffix={
                                                                    <GrChapterAdd
                                                                        onClick={(e) => {
                                                                            // debugger 
                                                                            handleOpenDataFieldListModal(param, e);
                                                                            const index = i + parseInt(param.requiredDataEntries) + 1;// Assuming 'i' is the index of the current input field
                                                                            const fullParameterName = `${param.parameterName}_${index}`; // Create the full parameter name
                                                                            console.log("Field Name:", fullParameterName);
                                                                            setClickedParameterName(fullParameterName); // Store the full parameter name
                                                                            setListModalVisible(true);
                                                                            setFormUpdateKey(prev => prev + 1);
                                                                        }}
                                                                        // onClick={(e) =>{handleOpenDataFieldListModal(param, e); } } 
                                                                        style={{ fontSize: '15px', cursor: 'pointer' }} // Added cursor style for better UX
                                                                    />
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                ) :
                                                    (
                                                        <>
                                                            <Input
                                                                type={param.type === 'Numeric' ? 'text' : 'text'}
                                                                min={param.minValue}
                                                                max={param.maxValue}
                                                                value={form.getFieldValue(`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`)}
                                                                onKeyPress={(e) => {
                                                                    // Prevent input of non-numeric characters, including '-'
                                                                    if (param.type === 'Numeric' && !/[\d.]/.test(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                onChange={(key) => {
                                                                    const value = key.target.value; // Get the input value
                                                                    param.fieldValue = value; // Set the input value to the param
                                                                    form.setFieldsValue({ [`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`]: value }); // Update form value with the correct name

                                                                    // Check if the value is within the specified range
                                                                    if (param.type === 'Numeric') {
                                                                        if (+value < +param.minValue || +value > +param.maxValue) {
                                                                            setErrorMessages(prev => ({
                                                                                ...prev,
                                                                                [`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`]: `Value must be between ${param.minValue} and ${param.maxValue}.`
                                                                            })); // Set error message for this specific field
                                                                            setIsErrorMsg(true);
                                                                        } else {
                                                                            setErrorMessages(prev => ({
                                                                                ...prev,
                                                                                [`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`]: ''
                                                                            })); // Clear error message if valid
                                                                            setIsErrorMsg(false);
                                                                        }
                                                                    }
                                                                }}
                                                                suffix={param.type === 'Numeric' ? (
                                                                    <span style={{ fontSize: '12px', color: 'gray' }}>
                                                                        ({param.minValue} - {param.maxValue}) {/* Display min and max values */}
                                                                    </span>
                                                                ) : null}
                                                            />
                                                            {param.type === 'Numeric' &&
                                                                form.getFieldValue(`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`) &&
                                                                (+form.getFieldValue(`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`) < param.minValue ||
                                                                    +form.getFieldValue(`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`) > param.maxValue) &&
                                                                errorMessages[`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`] && (
                                                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                                                        {errorMessages[`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`]}
                                                                    </div>
                                                                )}
                                                        </>

                                                    )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        ))}

                    </Row>
                </Form.Item>
                {index < paramList.length - 1 && <div style={{ marginTop: '10px' }} />} {/* Increased space between fields */}
            </React.Fragment>
        ));
    };

    const handleOpenDataFieldListModal = async (param, e) => {
        console.log("e: ", e)
        setListModalVisible(true);
        setSelectedParam(param);
        const cookies = parseCookies();
        const site = cookies.site;
        debugger
        const req = {
            "site": site,
            "dataField": param.dataField
        }
        const retrieveDataFieldResponse = await retrieveDataField(req);
        console.log("Retrieved data field response: ", retrieveDataFieldResponse);
        if (!retrieveDataFieldResponse.errorCode) {
            const formattedListDetails = retrieveDataFieldResponse?.listDetails?.map((item, index) =>
            ({
                ...item,
                key: index,
                id: index,
            }))
            setFieldList(formattedListDetails);
        }

    };

    const handleRowDoubleClick = (fieldValue) => {
        fieldValue = fieldValue.fieldValue;
        if (selectedParam) {
            // Update the selected parameter's fieldValue
            selectedParam.fieldValue = fieldValue;
            console.log("Selected parameter name: ", clickedParameterName);

            // Update the form value for the first required entry
            form.setFieldsValue({ [clickedParameterName]: fieldValue });

            // Force a re-render by updating a state variable
            setSelectedParam({ ...selectedParam }); // This will trigger a re-render

            // Optional entry update (if needed)
            const optionalIndex = parseInt(selectedParam.requiredDataEntries) + 1;
            // form.setFieldsValue({ [`${selectedParam.parameterName}_${optionalIndex}`]: fieldValue });
            setListModalVisible(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields(); // Validate and get form data
            let oRequest = []; // Initialize an empty array for draft requests
            const cookies = parseCookies();
            const site = cookies.site;
            let messageInstance = false;
            let hasError = false; // Local variable to track error state

            // Iterate over paramList to create an object for each parameter
            paramList.forEach(param => {
                // Create required entries
                for (let i = 0; i < parseInt(param.requiredDataEntries); i++) {
                    const actualValue = values[`${param.parameterName}_${i + 1}`] || param.defaultValue;
                    if (!actualValue) { // Check if actualValue is "", undefined, or null
                        if (!messageInstance) { // Check if message has not been shown yet
                            message.error('Fill all the required fields.'); // Show error message
                            messageInstance = true; // Set flag to indicate message has been shown
                            hasError = true; // Set local error flag
                        }
                        return; // Exit the loop if a required field is missing
                    }
                    let obj = {
                        site,
                        pcu,
                        resource: filterFormData?.defaultResource || '',
                        operation: filterFormData?.defaultOperation || '',
                        "dataCollection": selectedDC?.dataCollection,
                        "version": selectedDC?.version,
                        "parameterName": `${param.parameterName}`, // Use parameterName from the form
                        "actualValue": actualValue, // Use fieldValue from the form or defaultValue,
                        "userBO": userName
                    };
                    oRequest.push(obj); // Push the object into the oRequest array
                }

                // Create optional entries
                for (let i = 0; i < parseInt(param.optionalDataEntries); i++) {
                    const actualValue = values[`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`] || param.defaultValue;
                    let obj = {
                        site,
                        pcu,
                        resource: filterFormData?.defaultResource || '',
                        operation: filterFormData?.defaultOperation || '',
                        "dataCollection": selectedDC?.dataCollection,
                        "version": selectedDC?.version,
                        "parameterName": `${param.parameterName}`, // Use parameterName from the form
                        "actualValue": actualValue, // Use fieldValue from the form or defaultValue
                        "userBO": userName
                    };
                    oRequest.push(obj); // Push the object into the oRequest array
                }
            });

            console.log("Collect data request: ", oRequest);
            setTimeout(async () => {
                if (!hasError) { // Check local error flag instead of state
                    const collectDataResponse = await collectData(oRequest);
                    console.log("Collect data response: ", collectDataResponse);

                    if (!collectDataResponse.errorCode) {
                        message.success(collectDataResponse.messageDetails.msg);
                        setCall2(call2 + 1);
                        setModalVisible(false);
                    } else {
                        message.error(collectDataResponse?.message);
                    }
                }
            }, 500);

        } catch (error) {
            console.error('Failed to collect data:', error); // Handle validation errors
        }
    };

    const handleSaveDraft = async () => {
        try {
            const values = await form.validateFields(); // Validate and get form data
            console.log('Form data:', values);
            console.log('Form data values:', form.getFieldsValue()); // Log the form data

            let draftRequest = []; // Initialize an empty array for draft requests
            const cookies = parseCookies();
            const site = cookies.site;

            // Iterate over paramList to create an object for each parameter
            paramList.forEach(param => {
                // Create required entries
                for (let i = 0; i < parseInt(param.requiredDataEntries); i++) {
                    let obj = {
                        site,
                        pcu,
                        resource: filterFormData?.defaultResource || '',
                        operation: filterFormData?.defaultOperation || '',
                        "dataCollection": selectedDC?.dataCollection,
                        "version": selectedDC?.version,
                        "parameterName": `${param.parameterName}`, // Use parameterName from the form
                        "actualValue": values[`${param.parameterName}_${i + 1}`] || param.defaultValue, // Use fieldValue from the form or defaultValue
                        "userBO": "UserBO:" + site + "," + userName
                    };
                    draftRequest.push(obj); // Push the object into the draftRequest array
                }

                // Create optional entries
                for (let i = 0; i < parseInt(param.optionalDataEntries); i++) {
                    let obj = {
                        site,
                        pcu,
                        resource: filterFormData?.defaultResource || '',
                        operation: filterFormData?.defaultOperation || '',
                        "dataCollection": selectedDC?.dataCollection,
                        "version": selectedDC?.version,
                        "parameterName": `${param.parameterName}`, // Use parameterName from the form
                        "actualValue": values[`${param.parameterName}_${i + parseInt(param.requiredDataEntries) + 1}`] || param.defaultValue, // Use fieldValue from the form or defaultValue
                        "userBO": "UserBO:" + site + "," + userName
                    };
                    draftRequest.push(obj); // Push the object into the draftRequest array
                }
            });

            console.log("Save Draft request: ", draftRequest);
            const saveDraftResponse = await safeDraft(draftRequest);
            console.log("Save draft response: ", saveDraftResponse);

            if (!saveDraftResponse.errorCode) {
                message.success(saveDraftResponse.message_details.msg);
                setModalVisible(false);
            }
            else {
                message.success(saveDraftResponse?.message);
            }

            // You can now use the form data as needed
        } catch (error) {
            console.error('Failed to save data as draft:', error); // Handle validation errors
        }

    };

    return (
        <div className={styles.container}>
            <div className={`${styles.firstChild} ${open ? styles.shifted : ''}`}>
                <div className={styles.subTitle}>
                    <p><span className={styles.subTitleText}>{t('batchNo')}: </span> {selectedRowData[0]?.pcu}</p>
                    <p><span className={styles.subTitleText}>{t('operation')}: </span> {filterFormData?.defaultOperation}</p>
                    <p><span className={styles.subTitleText}>{t('resource')}: </span> {filterFormData?.defaultResource}</p>
                    <p><span className={styles.subTitleText}>{t('qty')}: </span> {selectedRowData[0]?.qty}</p>
                    <p><span className={styles.subTitleText}>{t('order')}: </span> {selectedRowData[0]?.shopOrder}</p>
                </div><br />

                <Table
                    dataSource={dcList}
                    columns={oDCTableColumns}
                    size="small"
                    rowKey="key"
                    pagination={false}
                    scroll={{ y: 55 * 5 }}
                    onRow={() => ({
                        style: {fontSize: '13.5px'}
                    })}
                    bordered
                />

                <Modal
                    title={t('parameterList')} // Add a title for the modal
                    open={modalVisible} // Control visibility with modalVisible state
                    onCancel={handleCancel} // Handle modal close

                    footer={ // Moved buttons to footer
                        <div style={{ display: 'flex', justifyContent: 'end', gap: '5px' }}> {/* Added button container */}
                            <Button type="primary" onClick={handleSubmit}>{t('submit')}</Button>
                            <Button onClick={handleSaveDraft}>{t('saveDraft')}</Button>
                            <Button onClick={handleCancel}>{t('close')}</Button>
                        </div>
                    } // No footer buttons
                    style={{ maxHeight: 'calc(100vh - 100px)' }}
                >
                    <div style={{
                        maxHeight: '50vh', overflow: 'auto',
                        marginTop: '-3%',
                        marginBottom: '5%'
                    }}>

                        <div className={styles.subTitle}>
                            <p><span className={styles.subTitleText}>{t('dataCollection')}: </span> {selectedDC?.dataCollection}</p>
                            <p><span className={styles.subTitleText}>{t('version')}: </span> {selectedDC?.version}</p>
                        </div><br />

                        <Form form={form}  > {/* Set initial values for the form */}
                            {renderFormFields()}
                        </Form>
                    </div>
                </Modal>
            </div>

            <Modal
                title={t("dataFieldList")}
                open={listModalVisible}
                onCancel={() => setListModalVisible(false)}
                footer={null}
                width='50%'
            >
                <Table
                    dataSource={fieldList}
                    bordered
                    columns={[
                        { title: t('fieldValue'), dataIndex: 'fieldValue', key: 'fieldValue' },
                        { title: t('labelValue'), dataIndex: 'labelValue', key: 'labelValue' },
                    ]}
                    onRow={(record) => ({
                        onDoubleClick: () => handleRowDoubleClick(record),
                    })}
                    pagination={false}
                    scroll={{ y: 55 * 5 }}
                    size="small"
                />
            </Modal>

            <Modal
                title={t("collectedDCParameterList")}
                open={reportModalVisible}
                onCancel={() => setReportModalVisible(false)}
                width='50%'
                centered
                footer={ // Updated footer to include only one button
                    <Button onClick={() => setReportModalVisible(false)}>{t('returnToDCList')}</Button>
                }
            >
                <ShowCollectedDataTable reportList={reportList} />
            </Modal>
        </div>
    );
};

export default DCMain;
