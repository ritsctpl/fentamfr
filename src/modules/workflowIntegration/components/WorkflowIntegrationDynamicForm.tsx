import React, { useContext, useEffect, useState, useRef } from 'react';
import { Collapse, Form, Input, Modal, Select, Table } from 'antd';
import styles from '@modules/workflowIntegration/styles/WorkflowIntegration.module.css';
import { useTranslation } from 'react-i18next';
import { WorkflowIntegrationUseContext } from '../hooks/WorkflowIntegrationUseContext';
import { PlusOutlined, MinusOutlined, DownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { GrChapterAdd } from 'react-icons/gr';
import { getPostProcessJolt, getPostProcessXSLT, getPreProcessJolt, getProcessTransformation } from '@services/workflowIntegrationService';
import { Modal as AntModal } from 'antd';
import { parseCookies } from 'nookies';

const { Option } = Select;

interface FormValues {
    [key: string]: any;
    identifier?: string;
    type?: string;
    messageId?: string;
    processBy?: string;
    transformationType?: string;
    preprocessJolt?: string;
    processSplitXslt?: boolean;
    preprocessXslt?: string;
    preprocessApi?: string;
    apiToProcess?: string;
    expectedSplits?: any;
    postProcessJolt?: string;
    postProcessApi?: string;
    passHandler?: string;
    failHandler?: string;
}

interface WorkflowIntegrationDynamicFormProps {
    data: any;
    fields: string[];
    onValuesChange: (changedValues: FormValues) => void;
}

const WorkflowIntegrationDynamicForm: React.FC<WorkflowIntegrationDynamicFormProps> = ({ data, fields, onValuesChange }) => {


    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { formData, setFormData, rowClick, setRowClick, setFormChange } = useContext<any>(WorkflowIntegrationUseContext);
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedProcessBy, setSelectedProcessBy] = useState<string>('');
    const [selectedTransformationType, setSelectedTransformationType] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [splitFormData, setSplitFormData] = useState<any[]>([]);
    const [splitForm] = Form.useForm();
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [activeKey, setActiveKey] = useState<string[] | string>(['1']);

    const [preProcessXSLTData, setPreProcessXSLTData] = useState<any[]>([]);
    const [preProcessXSLTVisible, setPreProcessXSLTVisible] = useState<boolean>(false);

    const [preProcessJoltData, setPreProcessJoltData] = useState<any[]>([]);
    const [preProcessJoltVisible, setPreProcessJoltVisible] = useState<boolean>(false);

    const [postProcessJoltData, setPostProcessJoltData] = useState<any[]>([]);
    const [postProcessJoltVisible, setPostProcessJoltVisible] = useState<boolean>(false);

    const [processTransformationData, setProcessTransformationData] = useState<any[]>([]);
    const [processTransformationVisible, setProcessTransformationVisible] = useState<boolean>(false);

    // Add this state to track if we're in edit mode
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (data || formData) {
            const processBy = data?.processSplitXslt ? 'XSLT' : 'JSON';
            form.setFieldsValue({
                ...data,
                processBy,
            });

            if (data.expectedSplits && Array.isArray(data.expectedSplits)) {
                const formattedSplits = data.expectedSplits.map((split: any, index: number) => ({
                    sequence: (index + 1).toString(),
                    splitIdentifier: split.splitIdentifier,
                    processJoltXslt: split.processJoltXslt
                }));
                setSplitFormData(formattedSplits);
                setActiveKey(['1']);
            }

            splitForm.setFieldsValue({
                ...data.expectedSplits,
            });
            setSelectedType(data?.type);
            setSelectedProcessBy(processBy);
            setSelectedTransformationType(data?.transformationType);
        }
    }, [data, formData]);

    useEffect(() => {
        const processBy = data?.processSplitXslt ? 'XSLT' : 'JSON';
        onValuesChange({
            ...data,
            processBy,
        });
        setRowClick(false);
    }, [rowClick]);

    const typeOptions = [
        { value: 'simple', label: 'Simple' },
        { value: 'split', label: 'Split' },
        { value: 'merge', label: 'Merge' },
    ];

    const processByOptions = [
        { value: 'XSLT', label: 'XSLT' },
        { value: 'JSON', label: 'JSON' },
    ];

    const jsonTransformationTypeOptions = [
        { value: 'JOLT', label: 'JOLT' },
        { value: 'JSONATA', label: 'JSONATA' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        const patterns: { [key: string]: RegExp } = {
            // resource: /^[A-Z0-9_]*$/,
            // workCenter: /^[A-Z0-9_]*$/,
            // operation: /^[A-Z0-9_]*$/,
            // material: /^[A-Z0-9_]*$/,
            // operationVersion: /^[A-Z0-9_]*$/,
            // materialVersion: /^[A-Z0-9_]*$/,
            // cycleTime: /.*/,
            // manufacturedTime: /.*/,
        };

        if (patterns[key]?.test(newValue)) {
            form.setFieldsValue({ [key]: newValue });
            onValuesChange({ [key]: newValue });
        }
        setFormChange(true);
    };

    const handleSubmit = (values: any) => {
        setFormData(values);
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        setFormChange(true);

        if (value === 'simple' || value === 'merge') {
            form.setFieldsValue({ expectedSplits: [] });
            form.setFieldsValue({ processBy: 'JSON' });
            form.setFieldsValue({ transformationType: 'JSONATA' });
            form.setFieldsValue({ preprocessXslt: '' });
            form.setFieldsValue({ processSplitXslt: false });
            onValuesChange({ expectedSplits: [], processBy: 'JSON', transformationType: 'JSONATA', preprocessXslt: '', processSplitXslt: false });
        } else if (value === 'split') {
            form.setFieldsValue({ expectedSplits: [] });
            form.setFieldsValue({ processBy: 'JSON' });
            form.setFieldsValue({ transformationType: 'JSONATA' });
            form.setFieldsValue({ preprocessXslt: '' });
            form.setFieldsValue({ processSplitXslt: true });
            onValuesChange({ expectedSplits: [], processBy: 'JSON', transformationType: 'JSONATA', preprocessXslt: '', processSplitXslt: false });
        };
    }

    const handleProcessByChange = (value: string) => {
        setSelectedProcessBy(value);
        setFormChange(true);
        const updatedValues: FormValues = {
            processBy: value,
            processSplitXslt: value === 'XSLT'
        };

        if (value === 'XSLT') {
            // Clear JSON-specific fields and expectedSplits when XSLT is selected
            form.setFieldsValue({
                ...updatedValues,
                transformationType: '',
                preprocessJolt: '',
                postProcessJolt: '',
                expectedSplits: [], // Clear expectedSplits
            });
            onValuesChange({
                ...updatedValues,
                transformationType: '',
                preprocessJolt: '',
                postProcessJolt: '',
                expectedSplits: [], // Clear expectedSplits
            });
            setSplitFormData([]); // Clear the table data
        } else if (value === 'JSON') {
            // Clear XSLT-specific fields when JSON is selected
            form.setFieldsValue({
                ...updatedValues,
                preprocessXslt: '',
                transformationType: 'JSONATA',
            });
            onValuesChange({
                ...updatedValues,
                preprocessXslt: '',
                transformationType: 'JSONATA',
            });
        }
    };

    const handleJsonTransformationTypeChange = (value: string) => {
        setSelectedTransformationType(value);
        const updatedValues: FormValues = {
            transformationType: value,
            preprocessJolt: '',
            postProcessJolt: ''
        };

        form.setFieldsValue(updatedValues);
        onValuesChange(updatedValues);
        setFormChange(true);
    };

    const handleAddSplit = () => {
        // Calculate the next sequence number based on existing splitFormData
        const nextSequence = (splitFormData.length + 1).toString();

        // Pre-fill the sequence field in the form
        splitForm.setFieldsValue({
            sequence: nextSequence
        });

        setIsEditMode(false);
        setIsModalVisible(true);
    };

    const handleModalSubmit = () => {
        splitForm.validateFields().then(values => {
            const sequence = (splitFormData.length + 1).toString();
            const newSplitData = {
                splitIdentifier: values.splitIdentifier,
                sequence: sequence,
                processJoltXslt: values.processJoltXslt
            };

            const newData = [...splitFormData, newSplitData];
            setSplitFormData(newData);
            setIsModalVisible(false);
            splitForm.resetFields();

            form.setFieldsValue({ expectedSplits: newData });
            onValuesChange({ expectedSplits: newData });
        });
        setFormChange(true);
    };

    const handleDeleteSplit = (record: any, e: React.MouseEvent) => {
        // Stop event propagation to prevent row selection
        e.stopPropagation();

        AntModal.confirm({
            title: t('confirmDelete'),
            content: t('areYouSureDeleteThisSplit'),
            okText: t('yes'),
            cancelText: t('no'),
            onOk: () => {
                const newData = splitFormData.filter(item => item.sequence !== record.sequence);
                const reorderedData = newData.map((item, index) => ({
                    ...item,
                    sequence: (index + 1).toString()
                }));

                setSplitFormData(reorderedData);
                form.setFieldsValue({ expectedSplits: reorderedData });
                onValuesChange({ expectedSplits: reorderedData });
                setFormChange(true);
            }
        });
    };

    // preProcessXSLT

    const handlePreProcessXSLTClick = async () => {
        const preprocessXslt = form.getFieldValue('preprocessXslt');

        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const payload = {
                site: site,
                type: selectedProcessBy
            }
            let response;
            response = await getPostProcessXSLT(payload);

            if (response && !response.errorCode) {
                let formattedData = response.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));

                // Filter data if preprocessXslt has a value
                if (preprocessXslt) {
                    formattedData = formattedData.filter(item =>
                        item.specName.toUpperCase().includes(preprocessXslt.toUpperCase())
                    );
                }

                setPreProcessXSLTData(formattedData);
            } else {
                setPreProcessXSLTData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setPreProcessXSLTVisible(true);
    };

    const handlePreProcessXSLTOk = (selectedRow: any | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                preprocessXslt: selectedRow.specName,
            });
            onValuesChange({
                preprocessXslt: selectedRow.specName.toUpperCase(),
            });
        }

        setPreProcessXSLTVisible(false);
        setFormChange(true);
    };

    const preProcessXSLTColumn = [
        {
            title: t("specName"),
            dataIndex: "specName",
            key: "specName",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]

    // preProcessJolt

    const handlePreProcessJoltClick = async () => {
        const preProcessJolt = form.getFieldValue('preprocessJolt');

        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const payload = {
                site: site,
                type: selectedTransformationType
            }
            let response;
            response = await getPreProcessJolt(payload);
            if (response && !response.errorCode) {
                let formattedData = response.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));

                // If preProcessJolt has a value, filter the data to show records that contain the input text
                if (preProcessJolt) {
                    formattedData = formattedData.filter(item =>
                        item.specName.toUpperCase().includes(preProcessJolt.toUpperCase())
                    );
                }

                setPreProcessJoltData(formattedData);
            } else {
                setPreProcessJoltData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setPreProcessJoltVisible(true);
    };

    const handlePreProcessJoltOk = (selectedRow: any | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                preprocessJolt: selectedRow.specName,
            });
            onValuesChange({
                preprocessJolt: selectedRow.specName.toUpperCase(),
            });
        }

        setPreProcessJoltVisible(false);
        setFormChange(true);
    };

    const preProcessJoltColumn = [
        {
            title: t("specName"),
            dataIndex: "specName",
            key: "specName",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]


    // postProcessJolt

    const handlePostProcessJoltClick = async () => {
        const postProcessJolt = form.getFieldValue('postProcessJolt');

        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const payload = {
                site: site,
                type: selectedTransformationType
            }
            let response;
            response = await getPostProcessJolt(payload);

            if (response && !response.errorCode) {
                let formattedData = response.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));

                // Filter data if postProcessJolt has a value
                if (postProcessJolt) {
                    formattedData = formattedData.filter(item =>
                        item.specName.toUpperCase().includes(postProcessJolt.toUpperCase())
                    );
                }

                setPostProcessJoltData(formattedData);
            } else {
                setPostProcessJoltData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setPostProcessJoltVisible(true);
    };

    const handlePostProcessJoltOk = (selectedRow: any | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                postProcessJolt: selectedRow.specName,
            });
            onValuesChange({
                postProcessJolt: selectedRow.specName.toUpperCase(),
            });
        }

        setPostProcessJoltVisible(false);
        setFormChange(true);
    };

    const postProcessJoltColumn = [
        {
            title: t("specName"),
            dataIndex: "specName",
            key: "specName",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]

    // ProcessTransformation

    const handleProcessTransformationClick = async () => {
        setIsModalVisible(true);
        const processJoltXslt = splitForm.getFieldValue('processJoltXslt');

        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const payload = {
                site: site,
                type: selectedTransformationType ? selectedTransformationType : selectedProcessBy
            }
            let response;
            response = await getProcessTransformation(payload);

            if (response && !response.errorCode) {
                let formattedData = response.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));

                // Filter data if processJoltXslt has a value
                if (processJoltXslt) {
                    formattedData = formattedData.filter(item =>
                        item.specName.toUpperCase().includes(processJoltXslt.toUpperCase())
                    );
                }

                setProcessTransformationData(formattedData);
            } else {
                setProcessTransformationData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setProcessTransformationVisible(true);
    };

    const handleProcessTransformationOk = (selectedRow: any | undefined) => {
        if (selectedRow) {
            splitForm.setFieldsValue({
                processJoltXslt: selectedRow.specName,
            });
            onValuesChange({
                processJoltXslt: selectedRow.specName.toUpperCase(),
            });
        }
        setIsModalVisible(true);
        setProcessTransformationVisible(false);
        setFormChange(true);
    };

    const processTransformationColumn = [
        {
            title: t("specName"),
            dataIndex: "specName",
            key: "specName",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]

    // Add a new button to the Collapse header
    const CollapseHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>{t('splitConfigurations')}</span>
            <Button
                type="text"
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveKey(activeKey.length ? [] : ['1']);
                }}
            >
                <DownOutlined rotate={activeKey.length ? 180 : 0} />
            </Button>
        </div>
    );

    return (
        <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            onValuesChange={(changedValues) => {
                onValuesChange({ ...changedValues });
            }}
            style={{ width: '100%' }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
        >
            {fields?.map((key) => {
                const value = data[key];
                if (value === undefined) {
                    return null;
                }

                if (key === 'preprocessXslt' && (selectedType !== 'split' || selectedProcessBy !== 'XSLT')) {
                    return null;
                }

                if (key === 'expectedSplits' && selectedType !== 'split') {
                    return null;
                }

                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                switch (key) {
                    case 'messageId':
                    case 'preprocessApi':
                    case 'postProcessApi':
                    case 'passHandler':
                    case 'failHandler':
                        return (
                            <Form.Item key={key} name={key} label={t(key)}>
                                <Input
                                    autoComplete='off'
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'identifier':
                        return (
                            <Form.Item key={key} name={key} label={t(key)} rules={[{ required: true, message: `Please input ${formattedKey}` }]}>
                                <Input
                                    autoComplete='off'
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'apiToProcess':
                        return (
                            <Form.Item key={key} name={key} label={t(key)} rules={[{ required: true, message: `Please select ${formattedKey}` }]}>
                                <Input
                                    autoComplete='off'
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        )

                    case 'expectedSplits':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(key)}
                                rules={[{ required: true, message: `Please Enter ${formattedKey}` }]}
                                hidden={selectedType !== 'split' || selectedProcessBy === 'XSLT'} // Hide when processBy is XSLT
                            >
                                <Collapse
                                    style={{
                                        background: '#ffff',
                                    }}
                                    size="small"
                                    expandIcon={() => null}
                                    activeKey={activeKey}
                                    collapsible="disabled"
                                    onChange={(keys) => setActiveKey(keys)}
                                    items={[
                                        {
                                            key: '1',
                                            label: <CollapseHeader />,
                                            children: (
                                                <div style={{ padding: '8px' }}>
                                                    <Button
                                                        style={{ width: '100%', marginBottom: '10px', border: '1px solid #007BFF', color: '#007BFF' }}
                                                        icon={<PlusOutlined style={{ border: '1px solid #007BFF', color: '#007BFF', borderRadius: '50%' }} />}
                                                        onClick={handleAddSplit}
                                                    />
                                                    <div className={styles.tableContainer} >
                                                        <Table
                                                            size="small"
                                                            pagination={false}
                                                            columns={[
                                                                {
                                                                    title: t('sequence'),
                                                                    dataIndex: 'sequence',
                                                                    key: 'sequence',
                                                                },
                                                                {
                                                                    title: t('splitIdentifier'),
                                                                    dataIndex: 'splitIdentifier',
                                                                    key: 'splitIdentifier',
                                                                },
                                                                {
                                                                    title: t('processTransformation'),
                                                                    dataIndex: 'processJoltXslt',
                                                                    key: 'processJoltXslt',
                                                                },
                                                                {
                                                                    title: t('action'),
                                                                    key: 'action',
                                                                    render: (_, record) => (
                                                                        <MinusOutlined
                                                                            onClick={(e) => handleDeleteSplit(record, e)}
                                                                            style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                                                        />
                                                                    ),
                                                                },
                                                            ]}
                                                            dataSource={splitFormData.length > 0 ? splitFormData : (data?.expectedSplits || [])}
                                                            rowKey="sequence"
                                                            scroll={{ x: 'max-content' }}  // Enables horizontal scroll if needed
                                                            onRow={(record: any) => ({
                                                                onClick: () => {
                                                                    setIsEditMode(true);
                                                                    setIsModalVisible(true);
                                                                    splitForm.setFieldsValue({
                                                                        sequence: record.sequence,
                                                                        splitIdentifier: record.splitIdentifier,
                                                                        processJoltXslt: record.processJoltXslt
                                                                    });
                                                                }
                                                            })}
                                                        />
                                                    </div>

                                                    <Modal
                                                        title={isEditMode ? "Edit Split Configuration" : "Add Split Configuration"}
                                                        open={isModalVisible}
                                                        onOk={() => {
                                                            splitForm.validateFields().then(values => {
                                                                if (isEditMode) {
                                                                    // Update existing record
                                                                    const newData = splitFormData.map(item =>
                                                                        item.sequence === values.sequence ? {
                                                                            sequence: values.sequence,
                                                                            splitIdentifier: values.splitIdentifier,
                                                                            processJoltXslt: values.processJoltXslt
                                                                        } : item
                                                                    );
                                                                    setSplitFormData(newData);
                                                                    form.setFieldsValue({ expectedSplits: newData });
                                                                    onValuesChange({ expectedSplits: newData });
                                                                } else {
                                                                    // Add new record (existing logic)
                                                                    const sequence = (splitFormData.length + 1).toString();
                                                                    const newSplitData = {
                                                                        splitIdentifier: values.splitIdentifier,
                                                                        sequence: sequence,
                                                                        processJoltXslt: values.processJoltXslt
                                                                    };
                                                                    const newData = [...splitFormData, newSplitData];
                                                                    setSplitFormData(newData);
                                                                    form.setFieldsValue({ expectedSplits: newData });
                                                                    onValuesChange({ expectedSplits: newData });
                                                                }
                                                                setIsModalVisible(false);
                                                                splitForm.resetFields();
                                                                setIsEditMode(false);
                                                                setFormChange(true);
                                                            });
                                                        }}
                                                        onCancel={() => {
                                                            setIsModalVisible(false);
                                                            splitForm.resetFields();
                                                            setIsEditMode(false);
                                                        }}
                                                        width={800}
                                                    >
                                                        <Form
                                                            form={splitForm}
                                                            layout="vertical"
                                                        >
                                                            <Form.Item
                                                                name="sequence"
                                                                label={t('sequence')}
                                                            >
                                                                <Input
                                                                    disabled
                                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                name="splitIdentifier"
                                                                label={t('splitIdentifier')}
                                                                rules={[{ required: true, message: `Please input split identifier` }]}
                                                            >
                                                                <Input />
                                                            </Form.Item>
                                                            <Form.Item
                                                                key={'processJoltXslt'}
                                                                name={'processJoltXslt'}
                                                                label={t(`${'processTransformation'}`)}
                                                            >
                                                                <Input
                                                                    suffix={
                                                                        <GrChapterAdd
                                                                            onClick={() =>
                                                                                handleProcessTransformationClick()
                                                                            }
                                                                        />
                                                                    }
                                                                    onChange={(e) => handleInputChange(e, 'processJoltXslt')}
                                                                />
                                                            </Form.Item>
                                                        </Form>
                                                    </Modal>

                                                    <Modal
                                                        title={t("processJoltXslt")}
                                                        open={processTransformationVisible}
                                                        onCancel={() => setProcessTransformationVisible(false)}
                                                        width={700}
                                                        footer={null}
                                                    >
                                                        <Table
                                                            style={{ overflow: 'auto' }}
                                                            onRow={(record) => ({
                                                                onDoubleClick: () => handleProcessTransformationOk(record),
                                                            })}
                                                            columns={processTransformationColumn}
                                                            dataSource={processTransformationData}
                                                            rowKey="id"
                                                            pagination={{ pageSize: 6 }}
                                                        />
                                                    </Modal>
                                                </div>
                                            ),
                                        },
                                    ]}
                                />
                            </Form.Item>
                        );

                    case 'type':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please select ${formattedKey}` }]}
                            >
                                <Select
                                    defaultValue={value || ''}
                                    onChange={handleTypeChange}
                                >
                                    {typeOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'processBy':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select
                                    defaultValue={selectedType === 'simple' || selectedType === 'merge' ? 'JSON' : undefined}
                                    onChange={handleProcessByChange}
                                    disabled={selectedType === 'simple' || selectedType === 'merge'}
                                    value={selectedType === 'simple' || selectedType === 'merge' ? 'JSON' : undefined}
                                >
                                    {processByOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'transformationType':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                hidden={selectedProcessBy === 'XSLT'}
                            >
                                <Select
                                    defaultValue={value || ''}
                                    onChange={handleJsonTransformationTypeChange}
                                >
                                    {jsonTransformationTypeOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'preprocessXslt':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                hidden={selectedProcessBy !== 'XSLT'}
                            >
                                <Input
                                    disabled={selectedProcessBy !== 'XSLT'}
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() => handlePreProcessXSLTClick()}
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'preprocessJolt':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                hidden={selectedProcessBy !== 'JSON'}
                            >
                                <Input
                                    disabled={selectedProcessBy !== 'JSON'}
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() => handlePreProcessJoltClick()}
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'postProcessJolt':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                hidden={selectedProcessBy !== 'JSON'}
                            >
                                <Input
                                    disabled={selectedProcessBy !== 'JSON'}
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() => handlePostProcessJoltClick()}
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );
                }
            })}

            <Modal
                title={t("selectPreProcessXSLT")}
                open={preProcessXSLTVisible}
                onCancel={() => setPreProcessXSLTVisible(false)}
                width={700}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handlePreProcessXSLTOk(record),
                    })}
                    columns={preProcessXSLTColumn}
                    dataSource={preProcessXSLTData}
                    rowKey="id"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>

            <Modal
                title={t("selectPreProcessJolt")}
                open={preProcessJoltVisible}
                onCancel={() => setPreProcessJoltVisible(false)}
                width={700}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handlePreProcessJoltOk(record),
                    })}
                    columns={preProcessJoltColumn}
                    dataSource={preProcessJoltData}
                    rowKey="id"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>

            <Modal
                title={t("selectPostProcessJolt")}
                open={postProcessJoltVisible}
                onCancel={() => setPostProcessJoltVisible(false)}
                width={700}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handlePostProcessJoltOk(record),
                    })}
                    columns={postProcessJoltColumn}
                    dataSource={postProcessJoltData}
                    rowKey="id"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>



        </Form >

    );
};

export default WorkflowIntegrationDynamicForm;