import React, { useState } from 'react';
import { Form, Row, Col, Button, Table, Card, Input, Select } from 'antd';
import styles from '@modules/assembly/styles/Assembly.module.css';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { retrieveDataField } from '@services/dcPluginService';

interface DataField {
    key: number;
    name: string;
    input: JSX.Element;
}

interface AssemblyFormProps {
    form: any;
    initialValues: any;
    dataFieldData: DataField[];
    onSubmit: (values: any) => void;
    setErrorMessages: (values: any) => void;
   
    onClose: () => void;
    dataType: any;
    errorMessages: any;
    selectedParam: any;
    setSelectedParam: (values: any) => void; 
    
    clickedParameterName: any;
    setClickedParameterName: (values: any) => void;
    formUpdateKey: any;
    setFormUpdateKey: (values: any) => void;
    fieldList: any;
    setFieldList: (values: any) => void;
    

    isErrorMsg: any;
    setIsErrorMsg: (values: any) => void;
    paramList: any;
    setParamList: (values: any) => void;
    listModalVisible: any;
    setListModalVisible: (values: any) => void;
    
}



   
    // const [errorMessages, setErrorMessages] = useState<any>({});

const DCForm: React.FC<AssemblyFormProps> = ({ form, initialValues, dataFieldData, onSubmit, onClose, dataType,setSelectedParam, selectedParam, errorMessages, setErrorMessages
    ,  clickedParameterName, setClickedParameterName, formUpdateKey, setFormUpdateKey, fieldList, setFieldList, isErrorMsg, setIsErrorMsg, paramList, setParamList,
     listModalVisible, setListModalVisible
 }) => {
    const { t } = useTranslation();

    const dataFieldColumns = [
        {
            title: t('dataField'),
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <span>
                    {text}
                    {dataType.dataFieldList[record.key].required && <span style={{ color: 'red' }}> *</span>} 
                </span>
            ),
        },
        { title: t('dataAttribute'), dataIndex: 'input', key: 'input' },
    ];

    const handleSubmit = (values: any) => {
        const dataFieldValues: Array<{ dataField: string; value: any }> = [];

        dataFieldData.forEach((field) => {
            dataFieldValues.push({
                dataField: field.name,
                value: values[field.name]
            });
            delete values[field.name];
        });

        const formattedValues = {
            ...values,
            dataFields: dataFieldValues
        };

        onSubmit(formattedValues);
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

    const renderFormFields = () => {
        // Assuming dcList is populated with the new data structure
        console.log("parameterList: ", paramList);
        return paramList?.map((param, index) => (
            <React.Fragment key={param.sequence}>
                <Form.Item style={{ marginBottom: '4px' }}> {/* Decreased space between input fields */}
                    <Row gutter={2}> {/* Added gutter for spacing between columns */}

                        {/* REQUIRED FIELDS */}
                        {Array.from({ length: parseInt(param.requiredDataEntries) }).map((_, i) => ( // Create required inputs based on requiredDataEntries
                            <Col span={24} key={`required-${index}-${i}`} > {/* Changed to span={24} for full width */}
                                <Row style={{ marginTop: '1px', marginBottom: '-15px' }}>
                                    <Col span={8} style={{marginTop: '5px'}}> {/* Label column */}
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
                                    <Col span={8} style={{marginTop: '5px'}}> {/* Label column */}
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

    return (
        <Form form={form} > {/* Set initial values for the form */}
        {renderFormFields()}
    </Form>
    );
};

export default DCForm;
