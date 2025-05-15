import React from 'react';
import { Form, Input, Radio, Checkbox, DatePicker, Space, Button, message, Row, Col } from 'antd';
import { FormField, FormSubmitConfig, FormStyles, ButtonConfig, LayoutConfig } from '../../types';
import { defaultLayoutConfig } from '../../constants';
import { groupFields } from '../../utils/formUtils';
import TextInput from '../inputs/TextInput';
import Browse from '../inputs/Browse';
import RangeTime from '../inputs/RangeTime';
import SelectFeild from '../inputs/SelectFeild';

interface FieldLayout {
    span?: number;
    offset?: number;
    order?: number;
}

interface EnhancedFormField extends FormField {
    layout?: FieldLayout;
    group?: string;
}

interface DynamicFormProps {
    fields: FormField[];
    layout?: 'horizontal' | 'vertical' | 'inline';
    style?: FormStyles;
    layoutConfig?: LayoutConfig;
    onSubmit?: (values: any) => void;
    onCancel?: () => void;
    loading?: boolean;
    formSubmit?: FormSubmitConfig;
    onDataUpdate?: (data: any) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
    fields,
    layout = 'vertical',
    style,
    layoutConfig = {
        type: 'default',
        columns: 1,
        gutter: [16, 16],
        wrap: true,
        justify: 'start',
        align: 'top',
        fieldSpacing: 16,
        grouping: {
            enabled: false,
            spacing: 24
        }
    },
    onSubmit,
    onCancel,
    loading,
    formSubmit,
    onDataUpdate
}) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log('Form values:', values);
            onSubmit?.(values);
            message.success('Form submitted successfully');
        } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Please check your inputs');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel?.();
    };

    const renderField = (field: FormField) => {
        const { type, label, name, required, placeholder, disabled, options, rules, defaultValue, props, url, arrayParameter, fieldName, fieldValue, payload,customOptions, multiple } = field;
        const fieldStyle = style?.fieldStyle;
        const getFieldComponent = () => {
            switch (type) {
                case 'text':
                case 'input':
                    return <TextInput 
                        config={{
                            placeholder,
                            disabled,
                            ...props
                        }}
                    />;
                case 'select':
                    return <SelectFeild 
                    config={{
                        placeholder,
                        disabled,
                        url,
                        arrayParameter,
                        fieldValue,
                        payload,
                        customOptions,
                        multiple
                    }}
                />;
                case 'browse':
                    return <Browse 
                        config={{
                            placeholder,
                            disabled,
                            url,
                            arrayParameter,
                            fieldValue,
                            payload
                        }}
                    />;
                case 'rangePicker':
                    return (
                       <>
                            <Form.Item
                                name={field.startTimeFieldName}
                                rules={[
                                    {
                                        required: required,
                                        message: `${label} start time is required`
                                    }
                                ]}
                                noStyle
                            />
                            <Form.Item
                                name={field.endTimeFieldName}
                                rules={[
                                    {
                                        required: required,
                                        message: `${label} end time is required`
                                    }
                                ]}
                                noStyle
                            />
                            <RangeTime 
                                config={{
                                    placeholder: Array.isArray(placeholder) && placeholder.length === 2 
                                        ? [placeholder[0], placeholder[1]] 
                                        : ['Start time', 'End time'] as [string, string],
                                    disabled,
                                    startTimeFieldName: field.startTimeFieldName,
                                    endTimeFieldName: field.endTimeFieldName,
                                    ...props
                                }}
                            />
                        </>
                    );
                case 'textarea':
                    return <Input.TextArea placeholder={placeholder} disabled={disabled} {...props} />;
                case 'radio':
                    return (
                        <Radio.Group disabled={disabled} {...props}>
                            {options?.map(option => (
                                <Radio key={option.value} value={option.value}>
                                    {option.label}
                                </Radio>
                            ))}
                        </Radio.Group>
                    );
                case 'checkbox':
                    return (
                        <Checkbox.Group disabled={disabled} {...props}>
                            {options?.map(option => (
                                <Checkbox key={option.value} value={option.value}>
                                    {option.label}
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    );
                case 'date':
                    return <DatePicker disabled={disabled} {...props} />;
                default:
                    return <TextInput 
                        config={{
                            placeholder,
                            disabled,
                            ...props
                        }}
                    />;
            }
        };

        // Calculate column span based on layout type and columns
        let colSpan = 24; // Default full width
        if (layoutConfig.type === 'grid') {
            // For grid layout, calculate the span based on the number of columns
            colSpan = Math.floor(24 / (layoutConfig.columns || 1));
        }

        return (
            <Col 
                span={colSpan}
                style={{
                    ...fieldStyle,
                    marginBottom: layoutConfig.type === 'grid' ? layoutConfig.fieldSpacing : undefined
                }}
            >
                <Form.Item
                    label={label}
                    name={fieldName}
                    rules={rules}
                    required={required}
                    initialValue={defaultValue}
                    style={{
                        marginBottom: layoutConfig.type === 'grid' ? 0 : undefined
                    }}
                >
                    {getFieldComponent()}
                </Form.Item>
            </Col>
        );
    };

    const groupFields = (fields: EnhancedFormField[]) => {
        if (!layoutConfig.grouping?.enabled) {
            return { ungrouped: fields };
        }

        return fields.reduce((groups, field) => {
            const groupKey = field.group || 'ungrouped';
            return {
                ...groups,
                [groupKey]: [...(groups[groupKey] || []), field]
            };
        }, {} as Record<string, EnhancedFormField[]>);
    };

    const renderFields = () => {
        const groupedFields = groupFields(fields);

        if (layoutConfig.type === 'grid') {
            return Object.entries(groupedFields).map(([groupName, groupFields]) => (
                <div
                    key={groupName}
                    style={{
                        marginBottom: layoutConfig.grouping?.spacing,
                        ...style?.groupStyle?.container
                    }}
                >
                    {groupName !== 'ungrouped' && (
                        <h3 style={{
                            marginBottom: 16,
                            ...style?.groupStyle?.title
                        }}>
                            {groupName}
                        </h3>
                    )}
                    <Row
                        gutter={layoutConfig.gutter}
                        justify={layoutConfig.justify}
                        align={layoutConfig.align}
                        wrap={layoutConfig.wrap}
                        style={{
                            ...style?.groupStyle?.content,
                            display: 'flex',
                            flexWrap: 'wrap',
                            margin: `0 -${(layoutConfig.gutter[0] || 0) / 2}px`
                        }}
                    >
                        {groupFields.map((field, index) => (
                            <React.Fragment key={field.fieldName || index}>
                                {renderField(field)}
                            </React.Fragment>
                        ))}
                    </Row>
                </div>
            ));
        }

        return Object.entries(groupedFields).map(([groupName, groupFields]) => (
            <div
                key={groupName}
                style={{
                    marginBottom: layoutConfig.grouping?.spacing,
                    ...style?.groupStyle?.container
                }}
            >
                {groupName !== 'ungrouped' && (
                    <h3 style={{
                        marginBottom: 16,
                        ...style?.groupStyle?.title
                    }}>
                        {groupName}
                    </h3>
                )}
                <Space
                    direction={layout === 'inline' ? 'horizontal' : 'vertical'}
                    style={{
                        width: '100%',
                        display: 'flex',
                        ...style?.groupStyle?.content
                    }}
                    size={layoutConfig.fieldSpacing}
                    wrap={layoutConfig.wrap}
                >
                    {groupFields.map((field, index) => (
                        <React.Fragment key={field.fieldName || index}>
                            {renderField(field)}
                        </React.Fragment>
                    ))}
                </Space>
            </div>
        ));
    };

    const renderButtons = () => {
        const submitConfig = style?.buttons?.submit;
        const cancelConfig = style?.buttons?.cancel;
        const buttonSpacing = style?.buttons?.buttonSpacing || 8;
        const buttonAlign = style?.buttons?.buttonAlign || 'flex-end';

        return (
            <div style={{
                display: 'flex',
                justifyContent: buttonAlign,
                gap: buttonSpacing,
                marginTop: 16,
                ...style?.buttonContainerStyle
            }}>
                {!submitConfig?.hidden && (
                    <Button
                        type={submitConfig?.type || 'primary'}
                        size={submitConfig?.size || 'middle'}
                        htmlType="submit"
                        style={submitConfig?.style}
                        loading={loading}
                    >
                        {submitConfig?.text || 'Submit'}
                    </Button>
                )}
                {!cancelConfig?.hidden && (
                    <Button
                        onClick={onCancel}
                        type={cancelConfig?.type || 'default'}
                        size={cancelConfig?.size || 'middle'}
                        style={cancelConfig?.style}
                        disabled={loading}
                    >
                        {cancelConfig?.text || 'Cancel'}
                    </Button>
                )}
            </div>
        );
    };

    return (
        <Form
            form={form}
            layout={layout}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...style?.containerStyle
            }}
            onFinish={handleSubmit}
        >
            <div style={{
                flex: 1,
                overflow: 'auto',
                ...style?.contentStyle
            }}>
                {renderFields()}
            </div>
            {renderButtons()}
        </Form>
    );
};

export default DynamicForm; 