import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal, Table, TimePicker, Row, Col, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { addCycleTime, fetchAllMaterial, fetchAllOperation, fetchAllResource, fetchAllWorkCenter, fetchTop50Material, fetchTop50Operation, fetchTop50Resource, fetchTop50WorkCenter } from '@services/cycleTimeService';
import { defaultCycleTimeRequest, MaterialData, OperationData, ResourceData, ResourceTypeData, WorkCenterData } from '../types/cycleTimeTypes';
import { CycleTimeUseContext } from '../hooks/CycleTimeUseContext';
import dayjs from 'dayjs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { fetchAllResourceType, fetchTop50ResourceType } from '@services/workInstructionService';
import { RetriveResourceSelectedRow, RetriveResourceUpdateList } from '@services/ResourceService';

interface FormValues {
    [key: string]: any;
    resource?: string;
    resourceType?: string;
    workCenter?: string;
    operation?: string;
    operationVersion?: string;
    item?: string;
    itemVersion?: string;
    cycleTime?: number;
    manufacturedTime?: number;
}

interface CycleDynamicFormProps {
    data: any;
    fields: string[];
    onValuesChange: (changedValues: FormValues) => void;
}

const CycleForm: React.FC<CycleDynamicFormProps> = ({ data, fields, onValuesChange }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { formData, setFormData, isFormDisabled, setIsFormDisabled, call, setCall, formChange, setFormChange } = useContext<any>(CycleTimeUseContext);

    const [resourceVisible, setResourceVisible] = useState(false);
    const [resourceData, setResourceData] = useState<ResourceData[]>([]);
    const [resourceTypeVisible, setResourceTypeVisible] = useState(false);
    const [resourceTypeData, setResourceTypeData] = useState<ResourceTypeData[]>([]);
    const [workCenterVisible, setWorkCenterVisible] = useState(false);
    const [workCenterData, setWorkCenterData] = useState<WorkCenterData[]>([]);
    const [operationVisible, setOperationVisible] = useState(false);
    const [operationData, setOperationData] = useState<OperationData[]>([]);
    const [ItemVisible, setItemVisible] = useState(false);
    const [itemData, setItemData] = useState<MaterialData[]>([]);
    const [cycleTimeEnabled, setCycleTimeEnabled] = useState(true); 
    const [manufacturedTimeEnabled, setManufacturedTimeEnabled] = useState(false); 
    const [timeValue, setTimeValue] = useState<dayjs.Dayjs>(dayjs().hour(0).minute(0).second(0));
    const [instructionVisible, setInstructionVisible] = useState(false);

    useEffect(() => {
        if (data || formData) {
            const formValues = { ...data };

            const timeString = data?.time || formData?.time;
            if (timeString) {
                let parsedTime;

                if (typeof timeString === 'string') {
                    // Handle HH:mm:ss format
                    const [hours = 0, minutes = 0, seconds = 0] = timeString.split(':').map(Number);
                    parsedTime = dayjs().hour(hours).minute(minutes).second(seconds);
                } else if (dayjs.isDayjs(timeString)) {
                    parsedTime = timeString;
                } else {
                    parsedTime = dayjs(timeString);
                }

                if (parsedTime.isValid()) {
                    formValues.time = parsedTime;
                    setTimeValue(parsedTime);
                } else {
                    const defaultTime = dayjs().hour(0).minute(0).second(0);
                    formValues.time = defaultTime;
                    setTimeValue(defaultTime);
                }
            } else {
                const defaultTime = dayjs().hour(0).minute(0).second(0);
                formValues.time = defaultTime;
                setTimeValue(defaultTime);
            }

            form.setFieldsValue(formValues);
        }
    }, [data, form, formData]);

    useEffect(() => {
        const allFieldsSelected = fields.every(field =>
            field !== 'cycleTime' && field !== 'manufacturedTime' && form.getFieldValue(field)
        );
        const isItemSelected = fields.includes('item') && form.getFieldValue('item');
        const isItemVersionSelected = fields.includes('itemVersion') && form.getFieldValue('itemVersion');
        const isResourceSelected = fields.includes('resource') && form.getFieldValue('resource');
        const isResourceTypeSelected = fields.includes('resourceType') && form.getFieldValue('resourceType');
        const isWorkCenterSelected = fields.includes('workCenter') && form.getFieldValue('workCenter');
        const isOperationSelected = fields.includes('operation') && form.getFieldValue('operation');
        const isOperationVersionSelected = fields.includes('operationVersion') && form.getFieldValue('operationVersion');

        // Enable manufacturedTime if Item and ItemVersion are selected without other fields
        if (isItemSelected && isItemVersionSelected && !isResourceSelected && !isResourceTypeSelected && !isWorkCenterSelected && !isOperationSelected && !isOperationVersionSelected) {
            setManufacturedTimeEnabled(true);
            setCycleTimeEnabled(false);
            form.setFieldsValue({ cycleTime: 0 }); // Reset cycleTime to 0
        }
        else if ((isItemSelected || isWorkCenterSelected) && (!isResourceSelected && !isResourceTypeSelected && !isOperationSelected && !isOperationVersionSelected)) {
            setManufacturedTimeEnabled(true); // Reset cycleTime to 0
            setCycleTimeEnabled(false);
            form.setFieldsValue({ cycleTime: 0 });
        }
        // Enable cycleTime if resource, workCenter, or operation is selected with Item
        else if (isItemSelected && (isResourceSelected || isResourceTypeSelected || isWorkCenterSelected || isOperationSelected || isOperationVersionSelected)) {
            setCycleTimeEnabled(true);
            setManufacturedTimeEnabled(false);
            form.setFieldsValue({ manufacturedTime: 0 }); // Reset manufacturedTime to 0
        }
        // Enable cycleTime if all other fields are selected
        else if (allFieldsSelected) {
            setCycleTimeEnabled(true);
            setManufacturedTimeEnabled(false);
        } else {
            setCycleTimeEnabled(true); // Keep cycleTime enabled by default
            setManufacturedTimeEnabled(false);
        }
    }, [fields, form]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, "");

        const patterns: { [key: string]: RegExp } = {
            resource: /^[A-Z0-9_\-\(\)]*$/,
            resourceType: /^[A-Z0-9_\-\(\)]*$/,
            workCenter: /^[A-Z0-9_\-\(\)]*$/,
            operation: /^[A-Z0-9_\-\(\)]*$/,
            item: /^[A-Z0-9_\-\(\)]*$/,
            operationVersion: /^[A-Z0-9_\-\(\)]*$/,
            itemVersion: /^[A-Z0-9_\-\(\)]*$/,
            cycleTime: /.*/,
            manufacturedTime: /.*/,
        };

        if (patterns[key]?.test(newValue)) {
            // If resource field is being cleared, also clear resourceType
            if (key === 'resource' && newValue === '') {
                form.setFieldsValue({
                    [key]: newValue,
                    resourceType: ''
                });
                onValuesChange({
                    [key]: newValue,
                    resourceType: ''
                });
            } else {
                form.setFieldsValue({ [key]: newValue });
                onValuesChange({ [key]: newValue });
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;
            
            // Validate required fields based on form state
            const hasResource = formData?.resource || formData?.resourceType;
            const hasOperation = formData?.operation;
            
            // Determine which time field is required
            if ((hasResource || hasOperation) && (!formData?.cycleTime && formData?.cycleTime !== 0)) {
                message.error(t('Please Enter Cycle Time'));
                return;
            }
            
            if (!hasResource && !hasOperation && (!formData?.manufacturedTime && formData?.manufacturedTime !== 0)) {
                message.error(t('Please Enter Production Time'));
                return;
            }

            // Ensure time is properly formatted
            const timeValue = formData.time || '00:00:00';
            
            const formattedTime = typeof timeValue === 'string' ? 
                timeValue : // If already formatted string, use as is
                dayjs(timeValue).isValid() ? 
                    dayjs(timeValue).format('HH:mm:ss') : 
                    '00:00:00'; 

            const payload = {
                ...formData,
                site: site,
                userId: userId,
                time: formattedTime,
                cycleTimeRequestList: formData?.cycleTimeResponseList 
                    ? formData.cycleTimeResponseList.map(item => ({
                        ...item,
                        site: site
                    }))
                    : []
            };

            console.log(payload, 'payload');
            const response = await addCycleTime(site, userId, payload);
            if (response.message) {
                message.error(response.message)
            }
            else {
                message.success(response.message_details.msg)
                setFormData(defaultCycleTimeRequest)
                setCall(call + 1);
                setFormChange(false)
                setIsFormDisabled(true);
                form.resetFields();
            }
        }
        catch (error) {
            message.error('An error occurred while saving the CycleTime.');
        }
    };

    const onCancel = () => {
        setIsFormDisabled(true);
        form.resetFields();
    };

    // const handleBrowseInputChange = (fieldName: string, value: string) => {
    //     if (fieldName != 'description') {
    //         const convertedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    //         console.log(convertedValue, 'converted value')
    //         form.setFieldsValue({ [fieldName]: convertedValue });
    //     }
    // };

    const handleOperationClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('operation');

        const newValue = { operation: typedValue };

        try {
            let response = typedValue ? await fetchAllOperation(site, newValue) : await fetchTop50Operation(site);

            if (response && !response.errorCode) {
                const formattedData = response.operationList.map((item: any, index: number) => ({ id: index, ...item }));
                setOperationData(formattedData);
            } else {
                setOperationData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setOperationVisible(true);
    };

    const handleOperationOk = (selectedRow: OperationData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({ operation: selectedRow.operation, operationVersion: selectedRow.revision });
            onValuesChange({ operation: selectedRow.operation.toUpperCase(), operationVersion: selectedRow.revision.toUpperCase() });
        }
        setOperationVisible(false);
    };

    const OperationColumn = [
        { title: t("operation"), dataIndex: "operation", key: "operation" },
        { title: t("revision"), dataIndex: "revision", key: "revision" },
        { title: t("description"), dataIndex: "description", key: "description" },
        { title: t("status"), dataIndex: "status", key: "status" },
    ];

    const handleResourceClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('resource');
        const newValue = { resource: typedValue };

        try {
            let response = typedValue ? await fetchAllResource(site, newValue) : await fetchTop50Resource(site);
            if (response && !response.errorCode) {
                const formattedData = response.map((item: any, index: number) => ({ id: index, ...item }));
                setResourceData(formattedData);
            } else {
                setResourceData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setResourceVisible(true);
    };

    const handleResourceOk = async (selectedRow: ResourceData | undefined) => {
        if (selectedRow) {
            const cookies = parseCookies();
            const site = cookies.site;

            // Update resource field
            form.setFieldsValue({ resource: selectedRow.resource });
            onValuesChange({ resource: selectedRow.resource });

            try {
                const response = await RetriveResourceSelectedRow(site, { resource: selectedRow.resource });
                // Check if response has the expected structure and data
                if (response?.resourceTypeList?.length > 0) {
                    const resourceType = response.resourceTypeList[0].resourceType;
                    form.setFieldsValue({ resourceType: resourceType });
                    onValuesChange({ resourceType: resourceType });
                }
            } catch (error) {
                console.error('Error fetching resource type:', error);
            }
        }
        setResourceVisible(false);
    };

    const ResourceColumn = [
        { title: t("resource"), dataIndex: "resource", key: "resource" },
        { title: t("description"), dataIndex: "description", key: "description" },
        { title: t("status"), dataIndex: "status", key: "status" },
    ];

    const handleResourceTypeClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('resourceType');
        const newValue = { resourceType: typedValue };

        try {
            let response = typedValue ? await fetchAllResourceType(site, newValue) : await fetchTop50ResourceType(site);
            if (response && !response.errorCode) {
                const formattedData = response.map((item: any, index: number) => ({ id: index, ...item }));
                setResourceTypeData(formattedData);
            } else {
                setResourceTypeData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setResourceTypeVisible(true);
    };

    const handleResourceTypeOk = (selectedRow: ResourceTypeData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({ resourceType: selectedRow.resourceType });
            onValuesChange({ resourceType: selectedRow.resourceType.toUpperCase() });
        }
        setResourceTypeVisible(false);
    };

    const ResourceTypeColumn = [
        { title: t("resourceType"), dataIndex: "resourceType", key: "resourceType" },
        { title: t("description"), dataIndex: "resourceTypeDescription", key: "resourceTypeDescription" }
    ];


    const handleWorkCenterClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('workCenter');
        const newValue = { workCenter: typedValue };

        try {
            let response = typedValue ? await fetchAllWorkCenter(site, newValue) : await fetchTop50WorkCenter(site);
            if (response && !response.errorCode) {
                const formattedData = response.workCenterList.map((item: any, index: number) => ({ id: index, ...item }));
                setWorkCenterData(formattedData);
            } else {
                setWorkCenterData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setWorkCenterVisible(true);
    };

    const handleWorkCenterOk = (selectedRow: WorkCenterData | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({ workCenter: selectedRow.workCenter });
            onValuesChange({ workCenter: selectedRow.workCenter.toUpperCase() });
        }
        setWorkCenterVisible(false);
    };

    const WorkCenterColumn = [
        { title: t("workCenter"), dataIndex: "workCenter", key: "workCenter" },
        { title: t("description"), dataIndex: "description", key: "description" },
    ];

    const handleItemClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('item');
        const newValue = { item: typedValue };

        try {
            let response = typedValue ? await fetchAllMaterial(site, newValue) : await fetchTop50Material(site);
            if (response && !response.errorCode) {
                const formattedData = response.itemList.map((item: any, index: number) => ({ id: index, ...item }));
                setItemData(formattedData);
            } else {
                setItemData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }
        setItemVisible(true);
    };

    const handleItemOk = (selectedRow: any) => {
        if (selectedRow) {
            form.setFieldsValue({ item: selectedRow.item, itemVersion: selectedRow.revision });
            onValuesChange({ item: selectedRow.item.toUpperCase(), itemVersion: selectedRow.revision.toUpperCase() });
        }
        setItemVisible(false);
    };

    const ItemColumn = [
        { title: t("item"), dataIndex: "item", key: "item" },
        { title: t("revision"), dataIndex: "revision", key: "revision" },
        { title: t("description"), dataIndex: "description", key: "description" },
        { title: t("status"), dataIndex: "status", key: "status" },
    ];

    const calculateCycleTime = (timeInSeconds: number, targetQty?: number) => {
        const qty = targetQty || form.getFieldValue('targetQuantity');
        if (qty && qty > 0) {
            const time = timeInSeconds / qty;
            if (cycleTimeEnabled) {
                form.setFieldsValue({ cycleTime: time });
                onValuesChange({ cycleTime: time });
            }
            else {
                form.setFieldsValue({ manufacturedTime: time });
                onValuesChange({ manufacturedTime: time });
            }
        }
    };

    const shouldDisableTimeAndQuantity = () => {
        if (isFormDisabled) {
            return false;
        }
        else{
            const hasWorkCenter = data?.workCenter;
            const hasOtherValues = data?.operation || data?.item || data?.resource || data?.resourceType;
            return hasOtherValues;
        }
    };

    const isFieldDisabled = (fieldName: string) => {
        // When form is disabled (isFormDisabled is true)
        if (isFormDisabled) {
            // Production Time is always disabled when isFormDisabled is true
            if (fieldName === 'manufacturedTime') {
                return true;
            }
            
            // All other fields are enabled
            return false;
        }

        // When form is not disabled (isFormDisabled is false)
        const hasResource = data?.resource || data?.resourceType;
        
        // If resource or resourceType exists, disable all fields
        if (hasResource) {
            return true;
        }

        const hasOperation = data?.operation;
        const isTimeOrQuantityField = fieldName === 'time' || fieldName === 'targetQuantity';

        // Case 3: If operation exists without resource/resourceType
        if (hasOperation) {
            return !isTimeOrQuantityField && fieldName !== 'cycleTime';
        }

        // Case 4: If neither operation nor resource/resourceType exists
        return !isTimeOrQuantityField && fieldName !== 'manufacturedTime';
    };

    const shouldEnableCycleTime = () => {
        if (isFormDisabled) {
            const hasResource = form.getFieldValue('resource') || form.getFieldValue('resourceType');
            const hasOperation = form.getFieldValue('operation');
            
            // Enable cycleTime if either resource/resourceType or operation exists
            return hasResource || hasOperation;
        }

        // When not in form disabled mode
        const hasResource = data?.resource || data?.resourceType;
        const hasOperation = data?.operation;
        
        return hasOperation && !hasResource;
    };

    const shouldEnableManufacturedTime = () => {
        if (isFormDisabled) {
            const hasResource = form.getFieldValue('resource') || form.getFieldValue('resourceType');
            const hasOperation = form.getFieldValue('operation');
            
            // Enable manufacturedTime if neither resource/resourceType nor operation exists
            return !hasResource && !hasOperation;
        }

        // When not in form disabled mode
        const hasResource = data?.resource || data?.resourceType;
        const hasOperation = data?.operation;
        
        return !hasOperation && !hasResource;
    };

    const handleCancel = () => {
        setResourceVisible(false);
        setWorkCenterVisible(false);
        setOperationVisible(false);
        setItemVisible(false);
        setResourceTypeVisible(false);
    };

    const onShowInstructions = () => {
        setInstructionVisible(true)
    };

    return (
        <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            onValuesChange={(changedValues) => {
                onValuesChange({ ...changedValues });
            }}
            style={{ width: '100%', marginTop: '20px' }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
        >
            <Row gutter={24}>
                {fields.map((key) => {
                    const value = data[key];
                    if (value === undefined) {
                        return null;
                    }

                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                    return (
                        <Col span={8} key={key}>
                            {(() => {
                                switch (key) {
                                    case 'operation':
                                    case 'resource':
                                    case 'resourceType':
                                    case 'workCenter':
                                    case 'item':
                                    case 'operationVersion':
                                    case 'itemVersion':
                                        return (
                                            <Form.Item name={key} label={t(key)}>
                                                <Input
                                                    disabled={isFieldDisabled(key)}
                                                    autoComplete='off'
                                                    suffix={key !== 'operationVersion' && key !== 'itemVersion' ? <GrChapterAdd onClick={() => {
                                                        switch(key) {
                                                            case 'operation': handleOperationClick(); break;
                                                            case 'resource': handleResourceClick(); break;
                                                            case 'resourceType': handleResourceTypeClick(); break;
                                                            case 'workCenter': handleWorkCenterClick(); break;
                                                            case 'item': handleItemClick(); break;
                                                        }
                                                    }} /> : null}
                                                    onChange={(e) => handleInputChange(e, key)}
                                                />
                                            </Form.Item>
                                        );

                                    case 'targetQuantity':
                                        return (
                                            <Form.Item name={key} label={t(key)}>
                                                <Input
                                                    disabled={isFieldDisabled(key)}
                                                    type='number'
                                                    onChange={(e) => {
                                                        handleInputChange(e, key);
                                                        const time = timeValue;
                                                        if (time) {
                                                            const hours = time.hour();
                                                            const minutes = time.minute();
                                                            const seconds = time.second();
                                                            const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                                                            calculateCycleTime(totalSeconds, Number(e.target.value));
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        );

                                    case 'time':
                                        return (
                                            <Form.Item name={key} label={t(key)}>
                                                <TimePicker
                                                    disabled={isFieldDisabled(key)}
                                                    format="HH:mm:ss"
                                                    value={timeValue}
                                                    onChange={(newTime) => {
                                                        if (newTime) {
                                                            setTimeValue(newTime);
                                                            form.setFieldsValue({ time: newTime });
                                                            onValuesChange({ time: newTime });

                                                            const hours = newTime.hour();
                                                            const minutes = newTime.minute();
                                                            const seconds = newTime.second();
                                                            const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                                                            calculateCycleTime(totalSeconds);
                                                        }
                                                    }}
                                                    allowClear={false}
                                                    showNow={false}
                                                />
                                            </Form.Item>
                                        );

                                    case 'cycleTime':
                                        return (
                                            <Form.Item
                                                name="cycleTime"
                                                label={t("cycleTime(sec)")}
                                                rules={[{ required: shouldEnableCycleTime(), message: 'Please input Cycle Time' }]}
                                            >
                                                <InputNumber
                                                    disabled={!shouldEnableCycleTime()}
                                                    min={0}
                                                    precision={6}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        );

                                    case 'manufacturedTime':
                                        return (
                                            <Form.Item
                                                name={key}
                                                label={t("productionTime")}
                                                rules={[{ required: shouldEnableManufacturedTime(), message: 'Please input Production Time' }]}
                                            >
                                                <InputNumber
                                                    disabled={!shouldEnableManufacturedTime()}
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={6}
                                                />
                                            </Form.Item>
                                        );

                                    default:
                                        return (
                                            <Form.Item
                                                name={key}
                                                label={t(key)}
                                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                                            >
                                                <Input
                                                    disabled={isFieldDisabled(key)}
                                                    autoComplete='off'
                                                    value={value}
                                                    onChange={(e) => handleInputChange(e, key)}
                                                />
                                            </Form.Item>
                                        );
                                }
                            })()}
                        </Col>
                    );
                })}
            </Row>

             <Row>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                        Save
                    </Button>
                    <Button onClick={onCancel} style={{ marginRight: '10px' }}>
                        Cancel
                    </Button>
                    <Button onClick={onShowInstructions}>
                        <QuestionCircleOutlined />
                    </Button>
                </Col>
            </Row>

            <Modal title={t("selectOperation")} open={operationVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleOperationOk(record) })}
                    columns={OperationColumn}
                    dataSource={operationData}
                    rowKey="operation"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal title={t("selectResource")} open={resourceVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleResourceOk(record) })}
                    columns={ResourceColumn}
                    dataSource={resourceData}
                    rowKey="resource"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal title={t("selectResourceType")} open={resourceTypeVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleResourceTypeOk(record) })}
                    columns={ResourceTypeColumn}
                    dataSource={resourceTypeData}
                    rowKey="resourceType"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal title={t("selectItem")} open={ItemVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleItemOk(record) })}
                    columns={ItemColumn}
                    dataSource={itemData}
                    rowKey="item"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal title={t("selectWorkCenter")} open={workCenterVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleWorkCenterOk(record) })}
                    columns={WorkCenterColumn}
                    dataSource={workCenterData}
                    rowKey="workCenter"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal
                title={t("instruction")}
                open={instructionVisible}
                onCancel={() => setInstructionVisible(false)}
                footer={null}
            >
                <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                    <h3>Basic Form Usage:</h3>
                    <p>• Select a resource from the list or enter a new one</p>
                    <p>• Fill in all required fields marked with red asterisks</p>
                    <p>• Use time picker to select operation time</p>
                    <p>• Click Save to store your entries</p>
                    <p>• Click Cancel to reset the form</p>
                    
                    <h3>Form Behavior Rules:</h3>
                    <p>• Cycle Time = Total Time / Target Quantity</p>
                    <p>• Production Time = Total Time / Target Quantity</p>
                    <p>• When Resource or ResourceType is selected, Cycle Time is enabled</p>
                    <p>• When Item and ItemVersion are selected without other fields, Production Time is enabled</p>
                    <p>• When Item or WorkCenter is selected without Resource, ResourceType, or Operation, Production Time is enabled</p>
                    <p>• Input fields automatically convert to uppercase and only accept alphanumeric characters plus underscore</p>
                    
                    <h3>Data Selection:</h3>
                    <p>• Click the Add icon next to fields to browse available values</p>
                    <p>• Double-click a row in the browse modal to select that value</p>
                    <p>• When selecting a Resource, the ResourceType will be automatically filled if available</p>
                    
                    <h3>Time Calculations:</h3>
                    <p>• Changing Target Quantity or Time will automatically recalculate the appropriate time field</p>
                    <p>• Fields are enabled/disabled dynamically based on your selections to guide proper data entry</p>
                </div>
            </Modal>
        </Form>

    );
};

export default CycleForm;
