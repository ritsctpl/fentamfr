import React from 'react';
import { DatePicker, Form, Input } from 'antd';
import dayjs from 'dayjs';

interface BuilderFormProps {
    isEditable?: boolean;
    props: {
        title: string;
        type?: string;
        metaData?: any[] | any;
        data: any[] | any;
        style?: any;
        onChange?: () => void;
    }
}

const BuilderForm: React.FC<BuilderFormProps> = ({ isEditable = true, props }) => {
    const { title, data, onChange, type, metaData } = props;
    const { heading, form, input } = props?.style || { heading: { titleAlign: 'left' }, form: { column: 1} };

    // Create a form instance to manage form state
    const [formInstance] = Form.useForm();

    // Helper function to safely parse date values
    const parseDateValue = (value: any) => {
        if (!value) return null;
        const date = dayjs(value);
        return date.isValid() ? date : null;
    };

    // Combine metaData and data to create form fields
    const formFields = metaData?.map(meta => {
        const dataField = data.find(d => d.dataIndex === meta.dataIndex);
        return {
            ...meta,
            value: dataField?.value || '',
        };
    }) || data;

    // Set initial values when form fields change
    React.useEffect(() => {
        const initialValues = {};
        formFields.forEach(field => {
            // Handle date fields differently
            if (field.type === 'date') {
                initialValues[field.dataIndex] = parseDateValue(field.value);
            } else {
                initialValues[field.dataIndex] = field.value;
            }
        });
        formInstance.setFieldsValue(initialValues);
    }, [formFields]);

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
                onChange={onChange}
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
                            initialValue={field.type === 'date' ? parseDateValue(field.value) : field.value}
                            rules={[{ 
                                required: field.required, 
                                message: `Please input ${field.title || field.dataIndex}!` 
                            }]}
                            style={{ margin: 0 }}
                        >
                            {(!field.type || field.type === 'input') && (
                                <Input 
                                    disabled={!isEditable} 
                                    style={input}
                                />
                            )}
                            {field.type === 'date' && (
                                <DatePicker 
                                    disabled={!isEditable} 
                                    style={{ width: '100%' }}
                                />
                            )}
                            {field.type === 'text' && (
                                <Input 
                                    disabled={!isEditable} 
                                    style={{ border: 'none' }}
                                />
                            )}
                        </Form.Item>
                    ))}
                </div>
            </Form>
        </div>
    );
};

export default BuilderForm; 