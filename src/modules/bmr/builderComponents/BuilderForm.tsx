import React, { useState, useEffect } from 'react';
import { DatePicker, Form, Input, Button, Space, message } from 'antd';
import { SaveOutlined, UndoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from '../styles/DocumentCreator.module.css';
import { IoReload } from 'react-icons/io5';
import { FaCodePullRequest } from 'react-icons/fa6';

interface BuilderFormProps {
    isEditable?: boolean;
    props: {
        title: string;
        type?: string;
        metaData?: any[] | any;
        data: any[] | any;
        style?: any;
        onChange?: (newData: any) => void;
        componentId: string;
    }
}

const BuilderForm: React.FC<any> = ({ isEditable = true, props }) => {
    const { title, data, onChange, type, metaData, componentId } = props;
    const { heading, form, input } = props?.style || { heading: { titleAlign: 'left' }, form: { column: 1 } };
    const [formInstance] = Form.useForm();
    const [hasChanges, setHasChanges] = useState(false);
    const [originalValues, setOriginalValues] = useState({});

    // Combine metaData and data to create form fields
    const formFields = metaData?.map(meta => {
        const dataField = data.find(d => d.dataIndex === meta.dataIndex);
        return {
            ...meta,
            value: dataField?.value || '',
        };
    }) || data;

    useEffect(() => {
        const initialValues = {};
        formFields.forEach(field => {
            initialValues[field.dataIndex] = field.type === 'date' ?
                (field.value ? dayjs(field.value) : null) :
                field.value;
        });
        formInstance.setFieldsValue(initialValues);
        setOriginalValues(initialValues);
    }, [data]);

    const handleFormChange = () => {
        const currentValues = formInstance.getFieldsValue();
        const hasChanged = JSON.stringify(currentValues) !== JSON.stringify(originalValues);
        setHasChanges(hasChanged);
    };

    const handleSave = async () => {
        try {
            const values = await formInstance.validateFields();

            // Get existing templates from localStorage
            const templatesStr = localStorage.getItem('templates');
            if (!templatesStr) {
                message.error('No templates found');
                return;
            }

            const templates = JSON.parse(templatesStr);

            // Find the current template that contains this component
            const currentTemplate = templates.find((t: any) =>
                t.components?.main?.some((c: any) => c.id === componentId)
            );

            if (!currentTemplate) {
                // message.error('Template not found');
                // return;
            }

            // Find the component in the main array
            const componentIndex = currentTemplate.components.main.findIndex(
                (c: any) => c.id === componentId
            );

            if (componentIndex === -1) {
                message.error('Component not found');
                return;
            }

            // Format the data according to the required structure
            const formattedData = Object.keys(values).map(key => ({
                dataIndex: key,
                value: dayjs.isDayjs(values[key]) ? values[key].format('YYYY-MM-DD') : values[key]
            }));

            // Update the component's data
            currentTemplate.components.main[componentIndex].config.data = formattedData;

            // Save back to localStorage
            localStorage.setItem('templates', JSON.stringify(templates));

            setOriginalValues(values);
            setHasChanges(false);
            message.success('Form data saved successfully');
            onChange?.(formattedData);
        } catch (error) {
            message.error('Please fill all required fields');
            console.error('Save error:', error);
        }
    };

    const handleCancel = () => {
        formInstance.setFieldsValue(originalValues);
        setHasChanges(false);
        message.info('Changes discarded');
    };

    return (
        <div style={{ width: '100%' }}>
            <h3 style={{
                margin: 5,
                marginBottom: 10,
                fontWeight: 600,
                textAlign: heading?.titleAlign || 'left'
            }}>
                {title}
            </h3>
            <Form
                form={formInstance}
                labelCol={{ flex: '180px' }}
                labelAlign="left"
                labelWrap
                wrapperCol={{ flex: 1 }}
                colon={false}
                layout="horizontal"
                onValuesChange={handleFormChange}
                style={{ width: '100%', padding: 10 }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${form?.column || 1}, 1fr)`,
                    gap: '16px',
                    width: '100%'
                }}>
                    {formFields.map((field, index) => (
                        <Form.Item
                            key={field.dataIndex || index}
                            label={`${field.title || field.dataIndex}:`}
                            name={field.dataIndex}
                            rules={[{
                                required: field.required,
                                message: `Please input ${field.title || field.dataIndex}!`
                            }]}
                            style={{ margin: 0 }}
                        >
                            {(!field.type || field.type === 'input') && (
                                <Input disabled={!isEditable} style={input} />
                            )}
                            {field.type === 'date' && (
                                <DatePicker disabled={!isEditable} style={{ width: '100%' }} />
                            )}
                            {field.type === 'text' && (
                                <Input disabled={!isEditable} style={{ border: 'none' }} />
                            )}
                        </Form.Item>
                    ))}
                </div>
            </Form>
            <div className={styles.actionFooter}>
                <Button
                    // type="primary" 
                    icon={<FaCodePullRequest />}
                    // onClick={handleSave}
                    // disabled={!hasChanges}
                >
                    Load Data
                </Button>
                <Button
                    // type="primary" 
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    disabled={!hasChanges}
                >
                    Save
                </Button>
                <Button
                    icon={<UndoOutlined />}
                    onClick={handleCancel}
                    disabled={!hasChanges}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default BuilderForm; 