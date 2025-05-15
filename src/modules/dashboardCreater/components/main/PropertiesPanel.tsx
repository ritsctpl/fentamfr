import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, Collapse, Space, Typography, ColorPicker, Tabs, Button, message, Divider, Checkbox, Switch, Radio, Card, Alert } from 'antd';
import {
    DashboardWidget,
    WidgetStyles,
    HttpMethod,
    ApiConfig,
    FormStyles,
    FormField,
    QueryConfig,
    VisibilityCondition
} from '../../types';
import { Editor } from '@monaco-editor/react';
import { PlusOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import { executeApiCall, executeQueryCall } from '../../utils/apiHandler';
import { fetchAllQueryBuilder } from '@services/queryBuilderService';
import { parseCookies } from 'nookies';
const { Panel } = Collapse;
const { Text } = Typography;
const { TabPane } = Tabs;

interface PropertiesPanelProps {
    widget: DashboardWidget | null;
    onUpdateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
    widgets: DashboardWidget[];
}

const ResponseMappingHelp: React.FC = () => (
    <div style={{ marginBottom: 16, fontSize: 12, color: '#666' }}>
        <div style={{ marginBottom: 8 }}>
            <strong>How to use Response Mapping:</strong>
        </div>
        <div>Example API Response:</div>
        <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
            {`{
  "user": {
    "name": "John",
    "details": {
      "city": "New York"
    }
  }
}`}
        </pre>
        <div style={{ marginTop: 8 }}>Mapping Examples:</div>
        <ul style={{ paddingLeft: 20 }}>
            <li>To get user name:
                <br />Target: <code>userName</code>
                <br />Source: <code>user.name</code>
            </li>
            <li>To get city:
                <br />Target: <code>location</code>
                <br />Source: <code>user.details.city</code>
            </li>
        </ul>
        <div>Then use in text as: <code>{"{userName}"}</code></div>
    </div>
);


const ApiConfigurationPanel: React.FC<{
    apiConfig?: ApiConfig;
    onChange: (config: ApiConfig) => void;
    targetComponentType?: string;
    widget?: DashboardWidget | null;
    widgets: DashboardWidget[];
}> = ({ apiConfig, onChange, targetComponentType, widget, widgets }) => {
    const [showBodyEditor, setShowBodyEditor] = useState(false);
    const [showHeadersEditor, setShowHeadersEditor] = useState(false);
    const [testResponse, setTestResponse] = useState<any>(null);

    // Get available forms in the dashboard
    const availableForms = widgets.filter(w => w.type === 'form');

    const isTableConfig = targetComponentType === 'table' || targetComponentType === 'gauge' || targetComponentType === 'bar' || targetComponentType === 'line';
    const configType = isTableConfig ? 'table' : 'text';

    const updateConfig = (key: keyof ApiConfig, value: any) => {
        onChange({
            ...apiConfig,
            [key]: value
        } as ApiConfig);
    };

    const addResponseMapping = () => {
        const currentMappings = apiConfig?.responseMapping || [];
        if (isTableConfig) {
            // For table, we add array path configuration
            updateConfig('arrayPath', '');
        } else {
            // For other components, we add response mapping
            updateConfig('responseMapping', [
                ...currentMappings,
                { targetProperty: '', sourcePath: '' }
            ]);
        }
    };

    const updateResponseMapping = (index: number, key: 'targetProperty' | 'sourcePath', value: string) => {
        const mappings = [...(apiConfig?.responseMapping || [])];
        mappings[index] = { ...mappings[index], [key]: value };
        updateConfig('responseMapping', mappings);
    };

    const removeResponseMapping = (index: number) => {
        const mappings = apiConfig?.responseMapping?.filter((_, i) => i !== index) || [];
        updateConfig('responseMapping', mappings);
    };

    const handleTestApiCall = async () => {
        if (!apiConfig) return;

        try {
            const data = await executeApiCall(apiConfig);
            setTestResponse(data);
            message.success('Test API call successful');
        } catch (error) {
            message.error('Test API call failed');
            console.error('Test API call error:', error);
        }
    };

    return (
        <Form layout="vertical">
            <Form.Item label="URL">
                <Input
                    value={apiConfig?.url}
                    onChange={e => updateConfig('url', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                />
            </Form.Item>

            <Form.Item label="Method">
                <Select
                    value={apiConfig?.method}
                    onChange={value => updateConfig('method', value)}
                    options={[
                        { label: 'GET', value: 'GET' },
                        { label: 'POST', value: 'POST' },
                        { label: 'PUT', value: 'PUT' },
                        { label: 'DELETE', value: 'DELETE' },
                        { label: 'PATCH', value: 'PATCH' }
                    ]}
                />
            </Form.Item>


            <Form.Item label="Headers">
                <Button
                    type="text"
                    onClick={() => setShowHeadersEditor(!showHeadersEditor)}
                    style={{ marginBottom: 8 }}
                >
                    {showHeadersEditor ? 'Hide Headers Editor' : 'Show Headers Editor'}
                </Button>
                {showHeadersEditor && (
                    <Editor
                        value={apiConfig?.headers ? JSON.stringify(apiConfig.headers, null, 2) : '{}'}
                        onChange={value => {
                            try {
                                updateConfig('headers', JSON.parse(value || '{}'));
                            } catch (e) {
                                // Handle invalid JSON
                            }
                        }}
                        language="json"
                        height={200}
                        options={{
                            minimap: { enabled: false }
                        }}
                    />
                )}
            </Form.Item>

            {apiConfig?.method !== 'GET' && (
                <>
                    <Form.Item label="Request Body Source">
                        <Select
                            value={apiConfig?.bodySource?.type || 'manual'}
                            onChange={value => updateConfig('bodySource', {
                                ...apiConfig?.bodySource,
                                type: value as 'form' | 'manual' | 'both'
                            })}
                            options={[
                                { label: 'Manual Input', value: 'manual' },
                                { label: 'Form Values', value: 'form' },
                                { label: 'Both', value: 'both' }
                            ]}
                        />
                    </Form.Item>

                    {(apiConfig?.bodySource?.type === 'form' || apiConfig?.bodySource?.type === 'both') && (
                        <Form.Item label="Select Form">
                            <Select
                                value={apiConfig?.bodySource?.formId}
                                onChange={value => updateConfig('bodySource', {
                                    ...apiConfig?.bodySource,
                                    formId: value
                                })}
                                options={availableForms.map(form => ({
                                    label: `Form (${form.id})`,
                                    value: form.id
                                }))}
                                placeholder="Select a form"
                            />
                        </Form.Item>
                    )}

                    {apiConfig?.bodySource?.type === 'both' && (
                        <>
                            <Form.Item label="Merge Strategy">
                                <Select
                                    value={apiConfig?.bodySource?.mergeStrategy || 'spread'}
                                    onChange={value => updateConfig('bodySource', {
                                        ...apiConfig?.bodySource,
                                        mergeStrategy: value as 'spread' | 'nested'
                                    })}
                                    options={[
                                        { label: 'Spread Values', value: 'spread' },
                                        { label: 'Nested Object', value: 'nested' }
                                    ]}
                                />
                            </Form.Item>

                            {apiConfig?.bodySource?.mergeStrategy === 'nested' && (
                                <Form.Item label="Form Data Key">
                                    <Input
                                        value={apiConfig?.bodySource?.formDataKey}
                                        onChange={e => updateConfig('bodySource', {
                                            ...apiConfig?.bodySource,
                                            formDataKey: e.target.value
                                        })}
                                        placeholder="e.g., formData"
                                    />
                                </Form.Item>
                            )}
                        </>
                    )}

                    {(apiConfig?.bodySource?.type === 'manual' || apiConfig?.bodySource?.type === 'both') && (
                        <Form.Item label="Manual Body">
                            <Button
                                type="text"
                                onClick={() => setShowBodyEditor(!showBodyEditor)}
                                style={{ marginBottom: 8 }}
                            >
                                {showBodyEditor ? 'Hide Body Editor' : 'Show Body Editor'}
                            </Button>
                            {showBodyEditor && (
                                <Editor
                                    value={apiConfig?.body || ''}
                                    onChange={value => updateConfig('body', value)}
                                    language="json"
                                    height={200}
                                    options={{ minimap: { enabled: false } }}
                                />
                            )}
                        </Form.Item>
                    )}
                </>
            )}

            <Form.Item
                label="Response Configuration"
                help={
                    isTableConfig
                        ? "Configure how to extract the table data from the API response"
                        : "Configure how to map API response values to the component"
                }
            >
                <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">
                        {isTableConfig
                            ? "This will configure data for a table component"
                            : "This will configure data for a text/button component"}
                        {!widget?.props?.flowConnect?.targetComponent && " (based on current component type)"}
                    </Text>
                </div>

                <Button
                    type="dashed"
                    onClick={addResponseMapping}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 8 }}
                >
                    {isTableConfig ? 'Configure Data' : 'Add Response Mapping'}
                </Button>

                {isTableConfig ? (
                    apiConfig?.arrayPath !== undefined && (
                        <div style={{ border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
                            <Form.Item
                                label="Array Response Path"
                                tooltip="Enter the path to the array in the response (e.g., listMaintenanceList, data.items)"
                            >
                                <Input
                                    value={apiConfig.arrayPath}
                                    onChange={e => updateConfig('arrayPath', e.target.value)}
                                    placeholder="e.g., listMaintenanceList"
                                />
                            </Form.Item>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                After configuring the array path, the table columns will be automatically generated from the data structure.
                            </Text>
                        </div>
                    )
                ) : (
                    <>
                        <ResponseMappingHelp />
                        {apiConfig?.responseMapping?.map((mapping, index) => (
                            <div key={index} style={{ marginBottom: 8, border: '1px solid #d9d9d9', padding: 8 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Target Property (use in text as {propertyName})"
                                        value={mapping.targetProperty}
                                        onChange={e => updateResponseMapping(index, 'targetProperty', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Source Path (e.g., user.name)"
                                        value={mapping.sourcePath}
                                        onChange={e => updateResponseMapping(index, 'sourcePath', e.target.value)}
                                    />
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeResponseMapping(index)}
                                    >
                                        Remove Mapping
                                    </Button>
                                </Space>
                            </div>
                        ))}
                    </>
                )}
            </Form.Item>

            <Form.Item>
                <Button type="default" onClick={handleTestApiCall} block>
                    Test API Call
                </Button>
                {testResponse && (
                    <div style={{ marginTop: 16 }}>
                        <Text strong>Response Preview:</Text>
                        <pre style={{
                            background: '#f5f5f5',
                            padding: 8,
                            borderRadius: 4,
                            maxHeight: 200,
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(testResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </Form.Item>
        </Form>
    );
};

const QueryConfigurationPanel: React.FC<{
    queryConfig?: QueryConfig;
    onChange: (config: QueryConfig) => void;
    targetComponentType?: string;
    widget?: DashboardWidget | null;
    widgets: DashboardWidget[];
}> = ({ queryConfig, onChange, targetComponentType, widget, widgets }) => {
    const [queryBuilder, setQueryBuilder] = useState<any[]>([]);
    const [testResponse, setTestResponse] = useState<any>(null);
    const [showBodyEditor, setShowBodyEditor] = useState(false);

    // Get available forms in the dashboard
    const availableForms = widgets.filter(w => w.type === 'form');

    const isTableConfig = targetComponentType === 'table' || targetComponentType === 'gauge' || targetComponentType === 'bar' || targetComponentType === 'line';

    useEffect(() => {
        fetchAllQueryBuilder(parseCookies().site).then(setQueryBuilder);
    }, []);

    const updateConfig = (key: keyof QueryConfig, value: any) => {
        onChange({
            ...queryConfig,
            [key]: value
        } as QueryConfig);
    };

    const handleTestQueryCall = async () => {
        if (!queryConfig) return;

        try {
            const data = await executeQueryCall(queryConfig);
            setTestResponse(data);
            message.success('Test Query call successful');
        } catch (error) {
            message.error('Test Query call failed');
            console.error('Test Query call error:', error);
        }
    };

    const addResponseMapping = () => {
        const currentMappings = queryConfig?.responseMapping || [];
        if (isTableConfig) {
            // For table, we add array path configuration
            updateConfig('arrayPath', '');
        } else {
            // For other components, we add response mapping
            updateConfig('responseMapping', [
                ...currentMappings,
                { targetProperty: '', sourcePath: '' }
            ]);
        }
    };

    return (
        <Form layout="vertical">
            <Form.Item label="Query">
                <Select
                    placeholder="Select a query"
                    value={queryConfig?.query}
                    onChange={value => onChange({ ...queryConfig, query: value })}
                    options={queryBuilder.map((query) => ({ label: query.templateName, value: query.templateName }))}
                />
            </Form.Item>

            <Form.Item label="Request Body Source">
                <Select
                    value={queryConfig?.bodySource?.type || 'manual'}
                    onChange={value => updateConfig('bodySource', {
                        ...queryConfig?.bodySource,
                        type: value as 'form' | 'manual' | 'both'
                    })}
                    options={[
                        { label: 'Manual Input', value: 'manual' },
                        { label: 'Form Values', value: 'form' },
                        { label: 'Both', value: 'both' }
                    ]}
                />
            </Form.Item>

            {(queryConfig?.bodySource?.type === 'form' || queryConfig?.bodySource?.type === 'both') && (
                <Form.Item label="Select Form">
                    <Select
                        value={queryConfig?.bodySource?.formId}
                        onChange={value => updateConfig('bodySource', {
                            ...queryConfig?.bodySource,
                            formId: value
                        })}
                        options={availableForms.map(form => ({
                            label: `Form (${form.id})`,
                            value: form.id
                        }))}
                        placeholder="Select a form"
                    />
                </Form.Item>
            )}

            {queryConfig?.bodySource?.type === 'both' && (
                <>
                    <Form.Item label="Merge Strategy">
                        <Select
                            value={queryConfig?.bodySource?.mergeStrategy || 'spread'}
                            onChange={value => updateConfig('bodySource', {
                                ...queryConfig?.bodySource,
                                mergeStrategy: value as 'spread' | 'nested'
                            })}
                            options={[
                                { label: 'Spread Values', value: 'spread' },
                                { label: 'Nested Object', value: 'nested' }
                            ]}
                        />
                    </Form.Item>

                    {queryConfig?.bodySource?.mergeStrategy === 'nested' && (
                        <Form.Item label="Form Data Key">
                            <Input
                                value={queryConfig?.bodySource?.formDataKey}
                                onChange={e => updateConfig('bodySource', {
                                    ...queryConfig?.bodySource,
                                    formDataKey: e.target.value
                                })}
                                placeholder="e.g., formData"
                            />
                        </Form.Item>
                    )}
                </>
            )}

            {(queryConfig?.bodySource?.type === 'manual' || queryConfig?.bodySource?.type === 'both') && (
                <Form.Item label="Manual Body">
                    <Button
                        type="text"
                        onClick={() => setShowBodyEditor(!showBodyEditor)}
                        style={{ marginBottom: 8 }}
                    >
                        {showBodyEditor ? 'Hide Body Editor' : 'Show Body Editor'}
                    </Button>
                    {showBodyEditor && (
                        <Editor
                            value={queryConfig?.body || ''}
                            onChange={value => updateConfig('body', value)}
                            language="json"
                            height={200}
                            options={{ minimap: { enabled: false } }}
                        />
                    )}
                </Form.Item>
            )}

            <Form.Item
                label="Response Configuration"
                help={
                    isTableConfig
                        ? "Configure how to extract the table data from the Query response"
                        : "Configure how to map Query response values to the component"
                }
            >
                <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">
                        {isTableConfig
                            ? "This will configure data for a table component"
                            : "This will configure data for a text/button component"}
                        {!widget?.props?.flowConnect?.targetComponent && " (based on current component type)"}
                    </Text>
                </div>

                <Button
                    type="dashed"
                    onClick={addResponseMapping}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 8 }}
                >
                    {isTableConfig ? 'Configure Data' : 'Add Response Mapping'}
                </Button>

                {isTableConfig ? (
                    queryConfig?.arrayPath !== undefined && (
                        <div style={{ border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
                            <Form.Item
                                label="Array Response Path"
                                tooltip="Enter the path to the array in the response (e.g., listMaintenanceList, data.items)"
                            >
                                <Input
                                    value={queryConfig.arrayPath}
                                    onChange={e => updateConfig('arrayPath', e.target.value)}
                                    placeholder="e.g., listMaintenanceList"
                                />
                            </Form.Item>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                After configuring the array path, the table columns will be automatically generated from the data structure.
                            </Text>
                        </div>
                    )
                ) : (
                    <>
                        <ResponseMappingHelp />
                        {queryConfig?.responseMapping?.map((mapping, index) => (
                            <div key={index} style={{ marginBottom: 8, border: '1px solid #d9d9d9', padding: 8 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Target Property (use in text as {propertyName})"
                                        value={mapping.targetProperty}
                                        onChange={e => {
                                            const mappings = [...(queryConfig?.responseMapping || [])];
                                            mappings[index] = { ...mapping, targetProperty: e.target.value };
                                            updateConfig('responseMapping', mappings);
                                        }}
                                    />
                                    <Input
                                        placeholder="Source Path (e.g., user.name)"
                                        value={mapping.sourcePath}
                                        onChange={e => {
                                            const mappings = [...(queryConfig?.responseMapping || [])];
                                            mappings[index] = { ...mapping, sourcePath: e.target.value };
                                            updateConfig('responseMapping', mappings);
                                        }}
                                    />
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                            const mappings = queryConfig?.responseMapping?.filter((_, i) => i !== index) || [];
                                            updateConfig('responseMapping', mappings);
                                        }}
                                    >
                                        Remove Mapping
                                    </Button>
                                </Space>
                            </div>
                        ))}
                    </>
                )}
            </Form.Item>

            <Form.Item>
                <Button type="default" onClick={handleTestQueryCall} block>
                    Test Query Call
                </Button>
                {testResponse && (
                    <div style={{ marginTop: 16 }}>
                        <Text strong>Response Preview:</Text>
                        <pre style={{
                            background: '#f5f5f5',
                            padding: 8,
                            borderRadius: 4,
                            maxHeight: 200,
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(testResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </Form.Item>
        </Form>
    );
};

// Add ConditionalVisibilityPanel component
const ConditionalVisibilityPanel: React.FC<{
    conditionalVisibility?: {
        enabled?: boolean;
        conditions?: Array<VisibilityCondition & { operator?: 'AND' | 'OR' }>;
        action?: 'show' | 'hide';
    };
    onChange: (config: any) => void;
    widgets: DashboardWidget[];
}> = ({ conditionalVisibility, onChange, widgets }) => {
    // Initialize with default values if conditionalVisibility is undefined
    const defaultConfig = {
        enabled: false,
        conditions: [],
        action: 'show' as const
    };

    const config = {
        ...defaultConfig,
        ...conditionalVisibility
    };

    const updateConfig = (key: string, value: any) => {
        onChange({
            ...config,
            [key]: value
        });
    };

    const addCondition = () => {
        const newCondition = {
            referenceComponent: {
                componentId: '',
                field: ''
            },
            condition: '==',
            value: '',
            operator: 'AND'
        };
        
        onChange({
            ...config,
            conditions: [...(config.conditions || []), newCondition]
        });
    };

    const updateCondition = (index: number, key: string, value: any) => {
        console.log('Updating condition:', { index, key, value });
        const newConditions = [...(conditionalVisibility?.conditions || [])];
        
        // Handle nested updates
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            newConditions[index] = {
                ...newConditions[index],
                [parent]: {
                    ...newConditions[index][parent],
                    [child]: value
                }
            };
        } else {
            newConditions[index] = {
                ...newConditions[index],
                [key]: value
            };
        }

        console.log('Updated conditions:', newConditions);
        onChange({
            ...conditionalVisibility,
            conditions: newConditions
        });
    };

    const removeCondition = (index: number) => {
        const updatedConditions = (config.conditions || []).filter((_, i) => i !== index);
        onChange({
            ...config,
            conditions: updatedConditions
        });
    };

    const getFormFields = (componentId: string) => {
        const widget = widgets.find(w => w.id === componentId);
        console.log('Getting form fields for widget:', widget);
        if (widget?.type === 'form' && Array.isArray(widget.props?.formFields)) {
            console.log('Form fields found:', widget.props.formFields);
            return widget.props.formFields;
        }
        console.log('No form fields found for widget:', componentId);
        return [];
    };

    return (
        <div style={{ padding: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                    <Switch
                        checked={config.enabled}
                        onChange={(checked) => updateConfig('enabled', checked)}
                    />
                    <span style={{ marginLeft: 8 }}>Enable Conditional Visibility</span>
                </div>

                {config.enabled && (
                    <>
                        <Radio.Group
                            value={config.action}
                            onChange={(e) => updateConfig('action', e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                        >
                            <Radio.Button value="show">Show</Radio.Button>
                            <Radio.Button value="hide">Hide</Radio.Button>
                        </Radio.Group>

                        <Button 
                            type="dashed" 
                            onClick={addCondition} 
                            block
                            icon={<PlusOutlined />}
                        >
                            Add Condition
                        </Button>

                        {(config.conditions || []).map((condition, index) => (
                            <Card
                                key={index}
                                size="small"
                                title={
                                    <Space>
                                        <span>Condition {index + 1}</span>
                                        {index > 0 && (
                                            <Radio.Group
                                                value={condition.operator}
                                                onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                                                size="small"
                                            >
                                                <Radio.Button value="AND">AND</Radio.Button>
                                                <Radio.Button value="OR">OR</Radio.Button>
                                            </Radio.Group>
                                        )}
                                    </Space>
                                }
                                extra={
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeCondition(index)}
                                    />
                                }
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Select Reference Component"
                                        value={condition.referenceComponent?.componentId || undefined}
                                        onChange={(value) => {
                                            console.log('Selected component:', value);
                                            updateCondition(index, 'referenceComponent', {
                                                componentId: value,
                                                field: ''
                                            });
                                        }}
                                        options={widgets
                                            .filter(w => w.type === 'form')
                                            .map(widget => {
                                                console.log('Widget option:', {
                                                    id: widget.id,
                                                    text: widget.props?.text
                                                });
                                                return {
                                                    label: widget.props?.text || widget.id,
                                                    value: widget.id
                                                };
                                            })}
                                    />

                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Select Field"
                                        value={condition.referenceComponent?.field || undefined}
                                        onChange={(value) => {
                                            console.log('Selected field:', value);
                                            updateCondition(index, 'referenceComponent', {
                                                ...condition.referenceComponent,
                                                field: value
                                            });
                                        }}
                                        disabled={!condition.referenceComponent?.componentId}
                                        options={getFormFields(condition.referenceComponent?.componentId || '').map(field => ({
                                            label: field.label || field.fieldName,
                                            value: field.fieldName
                                        }))}
                                    />

                                    <Select
                                        style={{ width: '100%' }}
                                        value={condition.condition}
                                        onChange={(value) => updateCondition(index, 'condition', value)}
                                        options={[
                                            { label: 'Equals (==)', value: '==' },
                                            { label: 'Not Equals (!=)', value: '!=' },
                                            { label: 'Greater Than (>)', value: '>' },
                                            { label: 'Greater Than or Equal (>=)', value: '>=' },
                                            { label: 'Less Than (<)', value: '<' },
                                            { label: 'Less Than or Equal (<=)', value: '<=' },
                                            { label: 'Contains', value: 'contains' },
                                            { label: 'Not Contains', value: 'notContains' },
                                            { label: 'Starts With', value: 'startsWith' },
                                            { label: 'Ends With', value: 'endsWith' }
                                        ]}
                                    />

                                    <Input
                                        placeholder="Value to compare"
                                        value={condition.value}
                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                    />
                                </Space>
                            </Card>
                        ))}

                        <Alert
                            type="info"
                            message="How it works"
                            description={
                                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                                    <li>Add multiple conditions using the 'Add Condition' button</li>
                                    <li>Each condition after the first one can be connected with AND/OR</li>
                                    <li>Select whether to show or hide the component when conditions are met</li>
                                    <li>Each condition can reference a different form field</li>
                                </ul>
                            }
                        />
                    </>
                )}
            </Space>
        </div>
    );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ widget, onUpdateWidget, widgets }) => {
    if (!widget) {
        return (
            <div style={{ padding: '20px', color: '#666' }}>
                Select a component to edit its properties
            </div>
        );
    }

    const handleStyleChange = (property: keyof (WidgetStyles & FormStyles), value: any) => {
        onUpdateWidget(widget.id, {
            props: {
                ...widget.props,
                style: {
                    ...widget.props?.style,
                    [property]: value
                }
            }
        });
    };

    const handlePropChange = (property: string, value: any) => {
        onUpdateWidget(widget.id, {
            props: {
                ...widget.props,
                [property]: value
            }
        });
    };

    const handleCustomCssChange = (css: string) => {
        onUpdateWidget(widget.id, {
            props: {
                ...widget.props,
                customCss: css
            }
        });
    };

    const handleFlowConnectChange = (flowConfig: any) => {
        onUpdateWidget(widget.id, {
            props: {
                ...widget.props,
                flowConnect: flowConfig
            }
        });
    };

    const handleApiConfigChange = (config: ApiConfig) => {
        handleFlowConnectChange({
            ...widget?.props?.flowConnect,
            api: config
        });
    };

    const handleQueryConfigChange = (config: QueryConfig) => {
        handleFlowConnectChange({
            ...widget?.props?.flowConnect,
            query: config
        });
    };

    // Get the effective component type (either target component or current widget type)
    const getEffectiveComponentType = () => {
        if (widget?.props?.flowConnect?.targetComponent) {
            return widgets.find(w => w.id === widget.props.flowConnect?.targetComponent)?.type;
        }
        return widget?.type;
    };

    const handleConditionalVisibilityChange = (config: any) => {
        if (widget) {
            onUpdateWidget(widget.id, {
                props: {
                    ...widget.props,
                    conditionalVisibility: config
                }
            });
        }
    };

    return (
        <div style={{ height: '100%', overflow: 'auto', padding: '16px' }}>
            {widget ? (
            <Tabs defaultActiveKey="style">
                <TabPane tab="Style" key="style">
                    <Collapse defaultActiveKey={['dimensions', 'style', 'layout', 'typography', 'props']}>
                        <Panel header="Dimensions & Spacing" key="dimensions">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Form layout="vertical" size="small">
                                    <Form.Item label="Width">
                                        <Input
                                            value={widget.props?.style?.width}
                                            onChange={e => handleStyleChange('width', e.target.value)}
                                            placeholder="e.g., 200px, 100%, auto"
                                        />
                                    </Form.Item>
                                    <Form.Item label="Height">
                                        <Input
                                            value={widget.props?.style?.height}
                                            onChange={e => handleStyleChange('height', e.target.value)}
                                            placeholder="e.g., 200px, 100%, auto"
                                        />
                                    </Form.Item>
                                    <Form.Item label="Padding">
                                        <Input
                                            value={widget.props?.style?.padding}
                                            onChange={e => handleStyleChange('padding', e.target.value)}
                                            placeholder="e.g., 10px or 10px 20px"
                                        />
                                    </Form.Item>
                                    <Form.Item label="Margin">
                                        <Input
                                            value={widget.props?.style?.margin}
                                            onChange={e => handleStyleChange('margin', e.target.value)}
                                            placeholder="e.g., 10px or 10px 20px"
                                        />
                                    </Form.Item>
                                    <Form.Item label="Overflow">
                                        <Select
                                            value={widget.props?.style?.overflow}
                                            onChange={value => handleStyleChange('overflow', value)}
                                            options={[
                                                { label: 'Visible', value: 'visible' },
                                                { label: 'Hidden', value: 'hidden' },
                                                { label: 'Scroll', value: 'scroll' },
                                                { label: 'Auto', value: 'auto' }
                                            ]}
                                        />
                                    </Form.Item>
                                </Form>
                            </Space>
                        </Panel>

                        <Panel header="Style" key="style">
                            <Form layout="vertical" size="small">
                                <Form.Item label="Background Color">
                                    <ColorPicker
                                        value={widget.props?.style?.backgroundColor}
                                        onChange={color => handleStyleChange('backgroundColor', color.toRgbString())}
                                        showText
                                    />
                                </Form.Item>
                                <Form.Item label="Border Radius">
                                    <Input
                                        value={widget.props?.style?.borderRadius}
                                        onChange={e => handleStyleChange('borderRadius', e.target.value)}
                                        placeholder="e.g., 4px, 50%"
                                    />
                                </Form.Item>
                                <Form.Item label="Border">
                                    <Input
                                        value={widget.props?.style?.border}
                                        onChange={e => handleStyleChange('border', e.target.value)}
                                        placeholder="e.g., 1px solid #ccc"
                                    />
                                </Form.Item>
                                <Form.Item label="Box Shadow">
                                    <Input
                                        value={widget.props?.style?.boxShadow}
                                        onChange={e => handleStyleChange('boxShadow', e.target.value)}
                                        placeholder="e.g., 0 2px 4px rgba(0,0,0,0.1)"
                                    />
                                </Form.Item>
                            </Form>
                        </Panel>

                        {widget.type === 'div' && (
                            <Panel header="Layout" key="layout">
                                <Form layout="vertical" size="small">
                                    <Form.Item label="Display">
                                        <Select
                                            value={widget.props?.style?.display}
                                            onChange={value => handleStyleChange('display', value)}
                                            options={[
                                                { label: 'Flex', value: 'flex' },
                                                { label: 'Block', value: 'block' },
                                                { label: 'Grid', value: 'grid' },
                                                { label: 'Inline', value: 'inline' }
                                            ]}
                                        />
                                    </Form.Item>
                                    {widget.props?.style?.display === 'flex' && (
                                        <>
                                            <Form.Item label="Flex Direction">
                                                <Select
                                                    value={widget.props?.style?.flexDirection}
                                                    onChange={value => handleStyleChange('flexDirection', value)}
                                                    options={[
                                                        { label: 'Row', value: 'row' },
                                                        { label: 'Column', value: 'column' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Align Items">
                                                <Select
                                                    value={widget.props?.style?.alignItems}
                                                    onChange={value => handleStyleChange('alignItems', value)}
                                                    options={[
                                                        { label: 'Start', value: 'flex-start' },
                                                        { label: 'Center', value: 'center' },
                                                        { label: 'End', value: 'flex-end' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Justify Content">
                                                <Select
                                                    value={widget.props?.style?.justifyContent}
                                                    onChange={value => handleStyleChange('justifyContent', value)}
                                                    options={[
                                                        { label: 'Start', value: 'flex-start' },
                                                        { label: 'Center', value: 'center' },
                                                        { label: 'End', value: 'flex-end' },
                                                        { label: 'Space Between', value: 'space-between' },
                                                        { label: 'Space Around', value: 'space-around' },
                                                        { label: 'Space Evenly', value: 'space-evenly' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Gap">
                                                <Input
                                                    value={widget.props?.style?.gap}
                                                    onChange={e => handleStyleChange('gap', e.target.value)}
                                                    placeholder="e.g., 10px"
                                                />
                                            </Form.Item>
                                            <Form.Item label="Flex-wrap">
                                                <Select
                                                    value={widget.props?.style?.flexWrap}
                                                    onChange={value => handleStyleChange('flexWrap', value)}
                                                    options={[
                                                        { label: 'Wrap', value: 'wrap' },
                                                        { label: 'Wrap Reverse', value: 'wrap-reverse' },
                                                        { label: 'No Wrap', value: 'nowrap' }
                                                    ]}
                                                />
                                            </Form.Item>
                                        </>
                                    )}
                                </Form>
                            </Panel>
                        )}

                        <Panel header="Typography" key="typography">
                            <Form layout="vertical" size="small">
                                <Form.Item label="Color">
                                    <ColorPicker
                                        value={widget.props?.style?.color}
                                        onChange={color => handleStyleChange('color', color.toRgbString())}
                                        showText
                                    />
                                </Form.Item>
                                <Form.Item label="Font Size">
                                    <Input
                                        value={widget.props?.style?.fontSize}
                                        onChange={e => handleStyleChange('fontSize', e.target.value)}
                                        placeholder="e.g., 16px, 1rem"
                                    />
                                </Form.Item>
                                <Form.Item label="Font Weight">
                                    <Select
                                        value={widget.props?.style?.fontWeight}
                                        onChange={value => handleStyleChange('fontWeight', value)}
                                        options={[
                                            { label: 'Normal', value: 'normal' },
                                            { label: 'Bold', value: 'bold' },
                                            { label: '100', value: '100' },
                                            { label: '200', value: '200' },
                                            { label: '300', value: '300' },
                                            { label: '400', value: '400' },
                                            { label: '500', value: '500' },
                                            { label: '600', value: '600' },
                                            { label: '700', value: '700' },
                                            { label: '800', value: '800' },
                                            { label: '900', value: '900' }
                                        ]}
                                    />
                                </Form.Item>
                            </Form>
                        </Panel>

                        {widget.type === 'button' && (
                            <Panel header="Button Properties" key="props">
                                <Form layout="vertical" size="small">
                                    <Form.Item label="Text">
                                        <Input
                                            value={widget.props?.text}
                                            onChange={e => handlePropChange('text', e.target.value)}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Type">
                                        <Select
                                            value={widget.props?.buttonType}
                                            onChange={value => handlePropChange('buttonType', value)}
                                            options={[
                                                { label: 'Primary', value: 'primary' },
                                                { label: 'Default', value: 'default' },
                                                { label: 'Dashed', value: 'dashed' },
                                                { label: 'Link', value: 'link' },
                                                { label: 'Text', value: 'text' }
                                            ]}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Size">
                                        <Select
                                            value={widget.props?.size}
                                            onChange={value => handlePropChange('size', value)}
                                            options={[
                                                { label: 'Large', value: 'large' },
                                                { label: 'Middle', value: 'middle' },
                                                { label: 'Small', value: 'small' }
                                            ]}
                                        />
                                    </Form.Item>
                                </Form>
                            </Panel>
                        )}

                        {widget.type === 'text' && (
                            <Panel header="Text Properties" key="props">
                                <Form layout="vertical" size="small">
                                    <Form.Item label="Text Content">
                                        <Input
                                            value={widget.props?.text}
                                            onChange={e => handlePropChange('text', e.target.value)}
                                            placeholder="Enter text content"
                                        />
                                    </Form.Item>
                                    <Form.Item label="Heading Level">
                                        <Select
                                            value={widget.props?.level}
                                            onChange={value => handlePropChange('level', value)}
                                            options={[
                                                { label: 'Normal Text', value: 'normal' },
                                                { label: 'Heading 1', value: 'h1' },
                                                { label: 'Heading 2', value: 'h2' },
                                                { label: 'Heading 3', value: 'h3' },
                                                { label: 'Heading 4', value: 'h4' },
                                                { label: 'Heading 5', value: 'h5' }
                                            ]}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Text Align">
                                        <Select
                                            value={widget.props?.style?.textAlign}
                                            onChange={value => handleStyleChange('textAlign', value)}
                                            options={[
                                                { label: 'Left', value: 'left' },
                                                { label: 'Center', value: 'center' },
                                                { label: 'Right', value: 'right' },
                                                { label: 'Justify', value: 'justify' }
                                            ]}
                                        />
                                    </Form.Item>
                                </Form>
                            </Panel>
                        )}

                        {widget.type === 'table' && (
                            <Panel header="Table Properties" key="props">
                                <Form layout="vertical" size="small">
                                    <Form.Item label="Size">
                                        <Select
                                            value={widget.props?.tableProps?.size}
                                            onChange={value => handlePropChange('tableProps', {
                                                ...widget.props?.tableProps,
                                                size: value
                                            })}
                                            options={[
                                                { label: 'Small', value: 'small' },
                                                { label: 'Middle', value: 'middle' },
                                                { label: 'Large', value: 'large' }
                                            ]}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Bordered">
                                        <Select
                                            value={widget.props?.tableProps?.bordered}
                                            onChange={value => handlePropChange('tableProps', {
                                                ...widget.props?.tableProps,
                                                bordered: value
                                            })}
                                            options={[
                                                { label: 'Yes', value: true },
                                                { label: 'No', value: false }
                                            ]}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Page Size">
                                        <InputNumber
                                            value={widget.props?.tableProps?.pagination?.pageSize}
                                            onChange={value => handlePropChange('tableProps', {
                                                ...widget.props?.tableProps,
                                                pagination: {
                                                    ...widget.props?.tableProps?.pagination,
                                                    pageSize: value
                                                }
                                            })}
                                            min={1}
                                            max={100}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Show Size Changer">
                                        <Select
                                            value={widget.props?.tableProps?.pagination?.showSizeChanger}
                                            onChange={value => handlePropChange('tableProps', {
                                                ...widget.props?.tableProps,
                                                pagination: {
                                                    ...widget.props?.tableProps?.pagination,
                                                    showSizeChanger: value
                                                }
                                            })}
                                            options={[
                                                { label: 'Yes', value: true },
                                                { label: 'No', value: false }
                                            ]}
                                        />
                                    </Form.Item>
                                        
                                    <Form.Item label="Columns Configuration">
                                        <Button
                                            type="dashed"
                                            onClick={() => handlePropChange('tableProps', {
                                                ...widget.props?.tableProps,
                                                columns: [
                                                    ...(widget.props?.tableProps?.columns || []),
                                                    {
                                                        title: 'New Column',
                                                        dataIndex: 'newColumn',
                                                        key: `col-${Date.now()}`,
                                                    }
                                                ]
                                            })}
                                            icon={<PlusOutlined />}
                                            block
                                            style={{ marginBottom: 8 }}
                                        >
                                            Add Column
                                        </Button>
                                        {widget.props?.tableProps?.columns?.map((column: any, index: number) => (
                                            <div key={column.key} style={{ marginBottom: 8, border: '1px solid #d9d9d9', padding: 8 }}>
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <Input
                                                        placeholder="Column Title"
                                                        value={column.title}
                                                        onChange={e => {
                                                            const newColumns = [...(widget.props?.tableProps?.columns || [])];
                                                            newColumns[index] = { ...column, title: e.target.value };
                                                            handlePropChange('tableProps', {
                                                                ...widget.props?.tableProps,
                                                                columns: newColumns
                                                            });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Data Field Path (e.g., user.name)"
                                                        value={column.dataIndex}
                                                        onChange={e => {
                                                            const newColumns = [...(widget.props?.tableProps?.columns || [])];
                                                            newColumns[index] = { ...column, dataIndex: e.target.value };
                                                            handlePropChange('tableProps', {
                                                                ...widget.props?.tableProps,
                                                                columns: newColumns
                                                            });
                                                        }}
                                                    />
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => {
                                                            const newColumns = widget.props?.tableProps?.columns?.filter((_, i) => i !== index);
                                                            handlePropChange('tableProps', {
                                                                ...widget.props?.tableProps,
                                                                columns: newColumns
                                                            });
                                                        }}
                                                    >
                                                        Remove Column
                                                    </Button>
                                                </Space>
                                            </div>
                                        ))}
                                    </Form.Item>
                                </Form>
                            </Panel>
                        )}

                        {widget.type === 'card' && (
                            <Panel header="Card Properties" key="props">
                                <Form layout="vertical" size="small">
                                    <Form.Item label="Card Title">
                                        <Input
                                            value={widget.props?.text}
                                            onChange={e => handlePropChange('text', e.target.value)}
                                            placeholder="Enter card title"
                                        />
                                    </Form.Item>

                                    <Collapse ghost>
                                        <Panel header="Title Style" key="titleStyle">
                                            <Form.Item label="Title Color">
                                                <ColorPicker
                                                    value={widget.props?.style?.titleColor}
                                                    onChange={color => handleStyleChange('titleColor', color.toRgbString())}
                                                    showText
                                                />
                                            </Form.Item>
                                            <Form.Item label="Title Font Size">
                                                <Input
                                                    value={widget.props?.style?.titleFontSize}
                                                    onChange={e => handleStyleChange('titleFontSize', e.target.value)}
                                                    placeholder="e.g., 16px"
                                                />
                                            </Form.Item>
                                            <Form.Item label="Title Font Weight">
                                                <Select
                                                    value={widget.props?.style?.titleFontWeight}
                                                    onChange={value => handleStyleChange('titleFontWeight', value)}
                                                    options={[
                                                        { label: 'Normal', value: 'normal' },
                                                        { label: 'Bold', value: 'bold' },
                                                        { label: '500', value: '500' },
                                                        { label: '600', value: '600' },
                                                        { label: '700', value: '700' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Title Alignment">
                                                <Select
                                                    value={widget.props?.style?.titleAlign}
                                                    onChange={value => handleStyleChange('titleAlign', value)}
                                                    options={[
                                                        { label: 'Left', value: 'left' },
                                                        { label: 'Center', value: 'center' },
                                                        { label: 'Right', value: 'right' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Title Padding">
                                                <Input
                                                    value={widget.props?.style?.titlePadding}
                                                    onChange={e => handleStyleChange('titlePadding', e.target.value)}
                                                    placeholder="e.g., 16px"
                                                />
                                            </Form.Item>
                                        </Panel>

                                        <Panel header="Content Style" key="contentStyle">
                                            <Form.Item label="Content Padding">
                                                <Input
                                                    value={widget.props?.style?.contentPadding}
                                                    onChange={e => handleStyleChange('contentPadding', e.target.value)}
                                                    placeholder="e.g., 16px"
                                                />
                                            </Form.Item>
                                            <Form.Item label="Content Background">
                                                <ColorPicker
                                                    value={widget.props?.style?.contentBackground}
                                                    onChange={color => handleStyleChange('contentBackground', color.toRgbString())}
                                                    showText
                                                />
                                            </Form.Item>
                                            <Form.Item label="Content Layout">
                                                <Select
                                                    value={widget.props?.style?.contentLayout}
                                                    onChange={value => handleStyleChange('contentLayout', value)}
                                                    options={[
                                                        { label: 'Vertical', value: 'vertical' },
                                                        { label: 'Horizontal', value: 'horizontal' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Content Gap">
                                                <Input
                                                    value={widget.props?.style?.contentGap}
                                                    onChange={e => handleStyleChange('contentGap', e.target.value)}
                                                    placeholder="e.g., 8px"
                                                />
                                            </Form.Item>
                                        </Panel>

                                        <Panel header="Border & Shadow" key="borderShadow">
                                            <Form.Item label="Border Style">
                                                <Select
                                                    value={widget.props?.style?.borderStyle}
                                                    onChange={value => handleStyleChange('borderStyle', value)}
                                                    options={[
                                                        { label: 'Solid', value: 'solid' },
                                                        { label: 'Dashed', value: 'dashed' },
                                                        { label: 'Dotted', value: 'dotted' },
                                                        { label: 'None', value: 'none' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Border Width">
                                                <Input
                                                    value={widget.props?.style?.borderWidth}
                                                    onChange={e => handleStyleChange('borderWidth', e.target.value)}
                                                    placeholder="e.g., 1px"
                                                />
                                            </Form.Item>
                                            <Form.Item label="Border Color">
                                                <ColorPicker
                                                    value={widget.props?.style?.borderColor}
                                                    onChange={color => handleStyleChange('borderColor', color.toRgbString())}
                                                    showText
                                                />
                                            </Form.Item>
                                            <Form.Item label="Shadow Type">
                                                <Select
                                                    value={widget.props?.style?.shadowType}
                                                    onChange={value => {
                                                        const shadows = {
                                                            none: 'none',
                                                            light: '0 2px 4px rgba(0,0,0,0.1)',
                                                            medium: '0 4px 8px rgba(0,0,0,0.1)',
                                                            strong: '0 8px 16px rgba(0,0,0,0.1)',
                                                            custom: widget.props?.style?.boxShadow
                                                        };
                                                        handleStyleChange('boxShadow', shadows[value] || value);
                                                        handleStyleChange('shadowType', value);
                                                    }}
                                                    options={[
                                                        { label: 'None', value: 'none' },
                                                        { label: 'Light', value: 'light' },
                                                        { label: 'Medium', value: 'medium' },
                                                        { label: 'Strong', value: 'strong' },
                                                        { label: 'Custom', value: 'custom' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            {widget.props?.style?.shadowType === 'custom' && (
                                                <Form.Item label="Custom Shadow">
                                                    <Input
                                                        value={widget.props?.style?.boxShadow}
                                                        onChange={e => handleStyleChange('boxShadow', e.target.value)}
                                                        placeholder="e.g., 0 2px 8px rgba(0,0,0,0.1)"
                                                    />
                                                </Form.Item>
                                            )}
                                        </Panel>

                                        <Panel header="Hover Effects" key="hoverEffects">
                                            <Form.Item label="Hover Shadow">
                                                <Select
                                                    value={widget.props?.style?.hoverShadow}
                                                    onChange={value => handleStyleChange('hoverShadow', value)}
                                                    options={[
                                                        { label: 'None', value: 'none' },
                                                        { label: 'Light', value: '0 4px 8px rgba(0,0,0,0.1)' },
                                                        { label: 'Medium', value: '0 8px 16px rgba(0,0,0,0.1)' },
                                                        { label: 'Strong', value: '0 12px 24px rgba(0,0,0,0.1)' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Hover Scale">
                                                <Select
                                                    value={widget.props?.style?.hoverScale}
                                                    onChange={value => handleStyleChange('hoverScale', value)}
                                                    options={[
                                                        { label: 'None', value: 'none' },
                                                        { label: 'Small', value: 'scale(1.02)' },
                                                        { label: 'Medium', value: 'scale(1.05)' },
                                                        { label: 'Large', value: 'scale(1.1)' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Hover Border Color">
                                                <ColorPicker
                                                    value={widget.props?.style?.hoverBorderColor}
                                                    onChange={color => handleStyleChange('hoverBorderColor', color.toRgbString())}
                                                    showText
                                                />
                                            </Form.Item>
                                        </Panel>
                                    </Collapse>
                                </Form>
                            </Panel>
                        )}

                        {widget.type === 'form' && (
                            <Panel header="Form Properties" key="props">
                                <Form layout="vertical" size="small">
                                    <Collapse defaultActiveKey={['layout', 'buttons', 'styles']}>
                                        <Panel header="Layout Configuration" key="layout">
                                            <Form.Item label="Form Layout">
                                                <Select
                                                    value={(widget.props?.style as FormStyles)?.formLayout}
                                                    onChange={value => handleStyleChange('formLayout', value)}
                                                    options={[
                                                        { label: 'Vertical', value: 'vertical' },
                                                        { label: 'Horizontal', value: 'horizontal' },
                                                        { label: 'Inline', value: 'inline' }
                                                    ]}
                                                />
                                            </Form.Item>

                                            <Form.Item label="Layout Type">
                                                <Select
                                                    value={(widget.props?.style as FormStyles)?.layoutType}
                                                    onChange={value => handleStyleChange('layoutType', value)}
                                                    options={[
                                                        { label: 'Default', value: 'default' },
                                                        { label: 'Grid', value: 'grid' },
                                                        { label: 'Flex', value: 'flex' }
                                                    ]}
                                                />
                                            </Form.Item>

                                            {(widget.props?.style as FormStyles)?.layoutType !== 'default' && (
                                                <>
                                                    <Form.Item label="Columns">
                                                        <InputNumber
                                                            value={(widget.props?.style as FormStyles)?.columns}
                                                            onChange={value => handleStyleChange('columns', value)}
                                                            min={1}
                                                            max={24}
                                                        />
                                                    </Form.Item>

                                                    <Form.Item label="Gutter">
                                                        <Space>
                                                            <InputNumber
                                                                value={(widget.props?.style as FormStyles)?.gutter?.[0]}
                                                                onChange={value => handleStyleChange('gutter', [value, (widget.props?.style as FormStyles)?.gutter?.[1] || 16])}
                                                                placeholder="Horizontal"
                                                            />
                                                            <InputNumber
                                                                value={(widget.props?.style as FormStyles)?.gutter?.[1]}
                                                                onChange={value => handleStyleChange('gutter', [(widget.props?.style as FormStyles)?.gutter?.[0] || 16, value])}
                                                                placeholder="Vertical"
                                                            />
                                                        </Space>
                                                    </Form.Item>
                                                </>
                                            )}
                                        </Panel>

                                        <Panel header="Button Configuration" key="buttons">
                                            <Collapse ghost>
                                                <Panel header="Submit Button" key="submit">
                                                    <Form.Item label="Text">
                                                        <Input
                                                            value={(widget.props?.style as FormStyles)?.buttons?.submit?.text}
                                                            onChange={e => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                submit: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.submit,
                                                                    text: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Type">
                                                        <Select
                                                            value={(widget.props?.style as FormStyles)?.buttons?.submit?.type}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                submit: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.submit,
                                                                    type: value
                                                                }
                                                            })}
                                                            options={[
                                                                { label: 'Primary', value: 'primary' },
                                                                { label: 'Default', value: 'default' },
                                                                { label: 'Dashed', value: 'dashed' },
                                                                { label: 'Link', value: 'link' },
                                                                { label: 'Text', value: 'text' }
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Size">
                                                        <Select
                                                            value={(widget.props?.style as FormStyles)?.buttons?.submit?.size}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                submit: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.submit,
                                                                    size: value
                                                                }
                                                            })}
                                                            options={[
                                                                { label: 'Large', value: 'large' },
                                                                { label: 'Middle', value: 'middle' },
                                                                { label: 'Small', value: 'small' }
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Hidden">
                                                        <Switch
                                                            checked={(widget.props?.style as FormStyles)?.buttons?.submit?.hidden}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                submit: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.submit,
                                                                    hidden: value
                                                                }
                                                            })}
                                                        />
                                                    </Form.Item>
                                                </Panel>

                                                <Panel header="Cancel Button" key="cancel">
                                                    <Form.Item label="Text">
                                                        <Input
                                                            value={(widget.props?.style as FormStyles)?.buttons?.cancel?.text}
                                                            onChange={e => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                cancel: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.cancel,
                                                                    text: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Type">
                                                        <Select
                                                            value={(widget.props?.style as FormStyles)?.buttons?.cancel?.type}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                cancel: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.cancel,
                                                                    type: value
                                                                }
                                                            })}
                                                            options={[
                                                                { label: 'Primary', value: 'primary' },
                                                                { label: 'Default', value: 'default' },
                                                                { label: 'Dashed', value: 'dashed' },
                                                                { label: 'Link', value: 'link' },
                                                                { label: 'Text', value: 'text' }
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Size">
                                                        <Select
                                                            value={(widget.props?.style as FormStyles)?.buttons?.cancel?.size}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                cancel: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.cancel,
                                                                    size: value
                                                                }
                                                            })}
                                                            options={[
                                                                { label: 'Large', value: 'large' },
                                                                { label: 'Middle', value: 'middle' },
                                                                { label: 'Small', value: 'small' }
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Hidden">
                                                        <Switch
                                                            checked={(widget.props?.style as FormStyles)?.buttons?.cancel?.hidden}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                cancel: {
                                                                    ...(widget.props?.style as FormStyles)?.buttons?.cancel,
                                                                    hidden: value
                                                                }
                                                            })}
                                                        />
                                                    </Form.Item>
                                                </Panel>

                                                <Panel header="Button Layout" key="buttonLayout">
                                                    <Form.Item label="Button Spacing">
                                                        <InputNumber
                                                            value={(widget.props?.style as FormStyles)?.buttons?.buttonSpacing}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                buttonSpacing: value
                                                            })}
                                                            min={0}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Button Alignment">
                                                        <Select
                                                            value={(widget.props?.style as FormStyles)?.buttons?.buttonAlign}
                                                            onChange={value => handleStyleChange('buttons', {
                                                                ...(widget.props?.style as FormStyles)?.buttons,
                                                                buttonAlign: value
                                                            })}
                                                            options={[
                                                                { label: 'Left', value: 'left' },
                                                                { label: 'Center', value: 'center' },
                                                                { label: 'Right', value: 'right' },
                                                                { label: 'Space Between', value: 'space-between' },
                                                                { label: 'Space Around', value: 'space-around' }
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Panel>
                                            </Collapse>
                                        </Panel>

                                        <Panel header="Styles" key="styles">
                                            <Collapse ghost>
                                                <Panel header="Container Style" key="container">
                                                    <Form.Item label="Background Color">
                                                        <ColorPicker
                                                            value={(widget.props?.style as FormStyles)?.containerStyle?.backgroundColor}
                                                            onChange={color => handleStyleChange('containerStyle', {
                                                                ...(widget.props?.style as FormStyles)?.containerStyle,
                                                                backgroundColor: color.toRgbString()
                                                            })}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Padding">
                                                        <Input
                                                            value={(widget.props?.style as FormStyles)?.containerStyle?.padding}
                                                            onChange={e => handleStyleChange('containerStyle', {
                                                                ...(widget.props?.style as FormStyles)?.containerStyle,
                                                                padding: e.target.value
                                                            })}
                                                            placeholder="e.g., 16px or 16px 24px"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Border Radius">
                                                        <Input
                                                            value={(widget.props?.style as FormStyles)?.containerStyle?.borderRadius}
                                                            onChange={e => handleStyleChange('containerStyle', {
                                                                ...(widget.props?.style as FormStyles)?.containerStyle,
                                                                borderRadius: e.target.value
                                                            })}
                                                            placeholder="e.g., 4px"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Border">
                                                        <Input
                                                            value={(widget.props?.style as FormStyles)?.containerStyle?.border}
                                                            onChange={e => handleStyleChange('containerStyle', {
                                                                ...(widget.props?.style as FormStyles)?.containerStyle,
                                                                border: e.target.value
                                                            })}
                                                            placeholder="e.g., 1px solid #d9d9d9"
                                                        />
                                                    </Form.Item>
                                                </Panel>

                                                <Panel header="Field Style" key="field">
                                                    <Form.Item label="Label Color">
                                                        <ColorPicker
                                                            value={(widget.props?.style as FormStyles)?.fieldStyle?.color}
                                                            onChange={color => handleStyleChange('fieldStyle', {
                                                                ...(widget.props?.style as FormStyles)?.fieldStyle,
                                                                color: color.toRgbString()
                                                            })}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Label Font Size">
                                                        <Input
                                                            value={(widget.props?.style as FormStyles)?.fieldStyle?.fontSize}
                                                            onChange={e => handleStyleChange('fieldStyle', {
                                                                ...(widget.props?.style as FormStyles)?.fieldStyle,
                                                                fontSize: e.target.value
                                                            })}
                                                            placeholder="e.g., 14px"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Margin Bottom">
                                                        <Input
                                                            value={(widget.props?.style as FormStyles)?.fieldStyle?.marginBottom}
                                                            onChange={e => handleStyleChange('fieldStyle', {
                                                                ...(widget.props?.style as FormStyles)?.fieldStyle,
                                                                marginBottom: e.target.value
                                                            })}
                                                            placeholder="e.g., 16px"
                                                        />
                                                    </Form.Item>
                                                </Panel>

                                                {(widget.props?.style as FormStyles)?.layoutType !== 'default' && (
                                                    <Panel header="Group Style" key="group">
                                                        <Form.Item label="Group Title Color">
                                                            <ColorPicker
                                                                value={(widget.props?.style as FormStyles)?.groupStyle?.title?.color}
                                                                onChange={color => handleStyleChange('groupStyle', {
                                                                    ...(widget.props?.style as FormStyles)?.groupStyle,
                                                                    title: {
                                                                        ...(widget.props?.style as FormStyles)?.groupStyle?.title,
                                                                        color: color.toRgbString()
                                                                    }
                                                                })}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item label="Group Title Font Size">
                                                            <Input
                                                                value={(widget.props?.style as FormStyles)?.groupStyle?.title?.fontSize}
                                                                onChange={e => handleStyleChange('groupStyle', {
                                                                    ...(widget.props?.style as FormStyles)?.groupStyle,
                                                                    title: {
                                                                        ...(widget.props?.style as FormStyles)?.groupStyle?.title,
                                                                        fontSize: e.target.value
                                                                    }
                                                                })}
                                                                placeholder="e.g., 16px"
                                                            />
                                                        </Form.Item>
                                                        <Form.Item label="Group Background">
                                                            <ColorPicker
                                                                value={(widget.props?.style as FormStyles)?.groupStyle?.container?.backgroundColor}
                                                                onChange={color => handleStyleChange('groupStyle', {
                                                                    ...(widget.props?.style as FormStyles)?.groupStyle,
                                                                    container: {
                                                                        ...(widget.props?.style as FormStyles)?.groupStyle?.container,
                                                                        backgroundColor: color.toRgbString()
                                                                    }
                                                                })}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item label="Group Padding">
                                                            <Input
                                                                value={(widget.props?.style as FormStyles)?.groupStyle?.container?.padding}
                                                                onChange={e => handleStyleChange('groupStyle', {
                                                                    ...(widget.props?.style as FormStyles)?.groupStyle,
                                                                    container: {
                                                                        ...(widget.props?.style as FormStyles)?.groupStyle?.container,
                                                                        padding: e.target.value
                                                                    }
                                                                })}
                                                                placeholder="e.g., 16px"
                                                            />
                                                        </Form.Item>
                                                        <Form.Item label="Group Border">
                                                            <Input
                                                                value={(widget.props?.style as FormStyles)?.groupStyle?.container?.border}
                                                                onChange={e => handleStyleChange('groupStyle', {
                                                                    ...(widget.props?.style as FormStyles)?.groupStyle,
                                                                    container: {
                                                                        ...(widget.props?.style as FormStyles)?.groupStyle?.container,
                                                                        border: e.target.value
                                                                    }
                                                                })}
                                                                placeholder="e.g., 1px solid #d9d9d9"
                                                            />
                                                        </Form.Item>
                                                    </Panel>
                                                )}
                                            </Collapse>
                                        </Panel>
                                    </Collapse>

                                    <Divider orientation="left">Form Fields</Divider>

                                    <Button
                                        type="dashed"
                                        onClick={() => handlePropChange('formFields', [
                                            ...(widget.props?.formFields || []),
                                            {
                                                type: 'text',
                                                label: 'New Field',
                                                name: `field_${Date.now()}`,
                                                required: false
                                            }
                                        ])}
                                        icon={<PlusOutlined />}
                                        block
                                        style={{ marginBottom: 16 }}
                                    >
                                        Add Field
                                    </Button>

                                    {widget.props?.formFields?.map((field: FormField, index: number) => (
                                        <div key={field.name} style={{ marginBottom: 16, border: '1px solid #d9d9d9', padding: 8 }}>
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Form.Item label="Field Type">
                                                    <Select
                                                        value={field.type}
                                                        onChange={value => {
                                                            const newFields = [...(widget.props?.formFields || [])];
                                                            newFields[index] = { ...field, type: value };
                                                            handlePropChange('formFields', newFields);
                                                        }}
                                                        options={[
                                                            { label: 'Text Input', value: 'text' },
                                                                { label: 'Select', value: 'select' },
                                                                { label: 'Browse', value: 'browse' },
                                                                { label: 'Range Picker', value: 'rangePicker' },
                                                            { label: 'Radio Group', value: 'radio' },
                                                            { label: 'Checkbox', value: 'checkbox' },
                                                            { label: 'Date Picker', value: 'date' },
                                                        ]}
                                                    />
                                                </Form.Item>
                                                <Form.Item label="Label">
                                                    <Input
                                                        value={field.label}
                                                        onChange={e => {
                                                            const newFields = [...(widget.props?.formFields || [])];
                                                            newFields[index] = { ...field, label: e.target.value };
                                                            handlePropChange('formFields', newFields);
                                                        }}
                                                    />
                                                </Form.Item>
                                                    {field.type !== 'rangePicker' && (
                                                <Form.Item label="Field Name">

                                                    <Input
                                                                value={field.fieldName}
                                                        onChange={e => {
                                                            const newFields = [...(widget.props?.formFields || [])];
                                                                    newFields[index] = { ...field, fieldName: e.target.value };
                                                            handlePropChange('formFields', newFields);
                                                        }}
                                                    />

                                                </Form.Item>
                                                    )}
                                                    {field.type === 'rangePicker' && (
                                                        <>
                                                            <Form.Item label="Start Time Field Name">
                                                                <Input
                                                                    value={field.startTimeFieldName}
                                                                    onChange={e => {
                                                                        const newFields = [...(widget.props?.formFields || [])];
                                                                        newFields[index] = { ...field, startTimeFieldName: e.target.value };
                                                                        handlePropChange('formFields', newFields);
                                                                    }}
                                                                    placeholder="Field name for start time"
                                                                />
                                                            </Form.Item>
                                                            <Form.Item label="End Time Field Name">
                                                                <Input
                                                                    value={field.endTimeFieldName}
                                                                    onChange={e => {
                                                                        const newFields = [...(widget.props?.formFields || [])];
                                                                        newFields[index] = { ...field, endTimeFieldName: e.target.value };
                                                                        handlePropChange('formFields', newFields);
                                                                    }}
                                                                    placeholder="Field name for end time"
                                                                />
                                                            </Form.Item>
                                                        </>
                                                    )}
                                                <Form.Item label="Placeholder">
                                                    <Input
                                                        value={field.placeholder}
                                                        onChange={e => {
                                                            const newFields = [...(widget.props?.formFields || [])];
                                                            newFields[index] = { ...field, placeholder: e.target.value };
                                                            handlePropChange('formFields', newFields);
                                                        }}
                                                    />
                                                </Form.Item>
                                                    {(field.type === 'browse' || field.type === 'select') && (
                                                    <>
                                                            <Form.Item label="End Point url">
                                                            <Input
                                                                value={field.url}
                                                                onChange={e => {
                                                                    const newFields = [...(widget.props?.formFields || [])];
                                                                    newFields[index] = { ...field, url: e.target.value };
                                                                    handlePropChange('formFields', newFields);
                                                                }}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item label="Array Parameter">
                                                            <Input
                                                                value={field.arrayParameter}
                                                                onChange={e => {
                                                                    const newFields = [...(widget.props?.formFields || [])];
                                                                    newFields[index] = { ...field, arrayParameter: e.target.value };
                                                                    handlePropChange('formFields', newFields);
                                                                }}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item label="Field Value">
                                                            <Input
                                                                value={field.fieldValue}
                                                                onChange={e => {
                                                                    const newFields = [...(widget.props?.formFields || [])];
                                                                    newFields[index] = { ...field, fieldValue: e.target.value };
                                                                    handlePropChange('formFields', newFields);
                                                                }}
                                                            />
                                                        </Form.Item>
                                                        {field.type === 'select' && (
                                                            <Form.Item label="Multiple">
                                                                <Switch
                                                                    checked={field.multiple}
                                                                    onChange={value => {
                                                                        const newFields = [...(widget.props?.formFields || [])];
                                                                        newFields[index] = { ...field, multiple: value };
                                                                        handlePropChange('formFields', newFields);
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        )}
                                                        <Collapse ghost>
                                                            <Panel header="Payload" key="payload">
                                                                <Form.Item label="Payload">
                                                                    <Editor
                                                                        value={field.payload}
                                                                        onChange={value => {
                                                                            const newFields = [...(widget.props?.formFields || [])];
                                                                            newFields[index] = { ...field, payload: value };
                                                                            console.log(newFields[index].payload);
                                                                            handlePropChange('formFields', newFields);
                                                                        }}
                                                                        language="json"
                                                                        height={200}
                                                                        options={{ minimap: { enabled: false } }}
                                                                    />
                                                                </Form.Item>
                                                            </Panel>
                                                            <Panel header="Custom Options" key="customOptions">
                                                                <Form.Item label="Custom Options">
                                                                    <Editor
                                                                        value={field.customOptions}
                                                                        onChange={value => {
                                                                            const newFields = [...(widget.props?.formFields || [])];
                                                                            newFields[index] = { ...field, customOptions: value };
                                                                            console.log(newFields[index].customOptions);
                                                                            handlePropChange('formFields', newFields);
                                                                        }}
                                                                        language="json"
                                                                        height={200}
                                                                        options={{ minimap: { enabled: false } }}
                                                                    />
                                                                </Form.Item>
                                                            </Panel>
                                                        </Collapse>
                                                    </>
                                                )}
                                                <Space>
                                                    <Checkbox
                                                        checked={field.required}
                                                        onChange={e => {
                                                            const newFields = [...(widget.props?.formFields || [])];
                                                            newFields[index] = { ...field, required: e.target.checked };
                                                            handlePropChange('formFields', newFields);
                                                        }}
                                                    >
                                                        Required
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={field.disabled}
                                                        onChange={e => {
                                                            const newFields = [...(widget.props?.formFields || [])];
                                                            newFields[index] = { ...field, disabled: e.target.checked };
                                                            handlePropChange('formFields', newFields);
                                                        }}
                                                    >
                                                        Disabled
                                                    </Checkbox>
                                                </Space>

                                                {field.type === 'radio' && (
                                                    <div>
                                                        <Divider orientation="left">Options</Divider>
                                                        <Button
                                                            type="dashed"
                                                            onClick={() => {
                                                                const newFields = [...(widget.props?.formFields || [])];
                                                                newFields[index] = {
                                                                    ...field,
                                                                    options: [
                                                                        ...(field.options || []),
                                                                        { label: 'New Option', value: `option_${Date.now()}` }
                                                                    ]
                                                                };
                                                                handlePropChange('formFields', newFields);
                                                            }}
                                                            icon={<PlusOutlined />}
                                                            block
                                                            style={{ marginBottom: 8 }}
                                                        >
                                                            Add Option
                                                        </Button>
                                                        {field.options?.map((option, optionIndex) => (
                                                            <Space key={option.value} style={{ marginBottom: 8, width: '100%' }}>
                                                                <Input
                                                                    placeholder="Label"
                                                                    value={option.label}
                                                                    onChange={e => {
                                                                        const newFields = [...(widget.props?.formFields || [])];
                                                                        const newOptions = [...(field.options || [])];
                                                                        newOptions[optionIndex] = {
                                                                            ...option,
                                                                            label: e.target.value
                                                                        };
                                                                        newFields[index] = { ...field, options: newOptions };
                                                                        handlePropChange('formFields', newFields);
                                                                    }}
                                                                />
                                                                <Input
                                                                    placeholder="Value"
                                                                    value={option.value}
                                                                    onChange={e => {
                                                                        const newFields = [...(widget.props?.formFields || [])];
                                                                        const newOptions = [...(field.options || [])];
                                                                        newOptions[optionIndex] = {
                                                                            ...option,
                                                                            value: e.target.value
                                                                        };
                                                                        newFields[index] = { ...field, options: newOptions };
                                                                        handlePropChange('formFields', newFields);
                                                                    }}
                                                                />
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => {
                                                                        const newFields = [...(widget.props?.formFields || [])];
                                                                        const newOptions = field.options?.filter((_, i) => i !== optionIndex);
                                                                        newFields[index] = { ...field, options: newOptions };
                                                                        handlePropChange('formFields', newFields);
                                                                    }}
                                                                />
                                                            </Space>
                                                        ))}
                                                    </div>
                                                )}

                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => {
                                                        const newFields = widget.props?.formFields?.filter((_, i) => i !== index);
                                                        handlePropChange('formFields', newFields);
                                                    }}
                                                >
                                                    Remove Field
                                                </Button>
                                            </Space>
                                        </div>
                                    ))}
                                </Form>
                            </Panel>
                        )}
                    </Collapse>
                </TabPane>

                <TabPane tab="Custom CSS" key="customCss">
                    <Form layout="vertical">
                        <Form.Item label="Custom CSS">
                            <Editor
                                value={widget.props?.customCss}
                                onChange={value => handleCustomCssChange(value)}
                                language="css"
                                height={900}
                                options={{
                                    minimap: { enabled: false }
                                }}
                            />
                        </Form.Item>
                    </Form>
                </TabPane>

                <TabPane tab="Flow Connect" key="flowConnect">
                    <Form layout="vertical">
                        {widget.type === 'form' ? (
                            // Form Submission Configuration
                            <Collapse defaultActiveKey={['formSubmit']}>
                                <Panel header="Form Submission" key="formSubmit">
                                    <Form.Item label="Target Component">
                                        <Select
                                            value={widget.props?.formSubmit?.targetComponent}
                                            placeholder="Select target component"
                                            onChange={value => handlePropChange('formSubmit', {
                                                ...widget.props?.formSubmit,
                                                targetComponent: value
                                            })}
                                            options={widgets
                                                .filter(w => w.id !== widget.id)
                                                .map(w => ({
                                                    label: `${w.type} - ${w.id}`,
                                                    value: w.id
                                                }))}
                                        />
                                    </Form.Item>

                                    {widget.props?.formSubmit?.targetComponent && (
                                        <>
                                            <Form.Item label="Update Type">
                                                <Select
                                                    value={widget.props?.formSubmit?.updateType || 'data'}
                                                    onChange={value => handlePropChange('formSubmit', {
                                                        ...widget.props?.formSubmit,
                                                        updateType: value
                                                    })}
                                                    options={[
                                                        { label: 'Data', value: 'data' },
                                                        { label: 'Text', value: 'text' },
                                                        { label: 'Props', value: 'props' }
                                                    ]}
                                                />
                                            </Form.Item>

                                            <ApiConfigurationPanel
                                                apiConfig={widget.props?.formSubmit?.api}
                                                onChange={config => handlePropChange('formSubmit', {
                                                    ...widget.props?.formSubmit,
                                                    api: config
                                                })}
                                                targetComponentType={widgets.find(w => w.id === widget.props?.formSubmit?.targetComponent)?.type}
                                                widget={widget}
                                                widgets={widgets}
                                            />
                                        </>
                                    )}
                                </Panel>
                            </Collapse>
                        ) : (
                            // Regular Flow Connect Configuration
                            <>
                                <Form.Item label="Flow Type">
                                    <Select
                                        value={widget.props?.flowConnect?.type}
                                        placeholder="Select Flow Type"
                                        onChange={value => handleFlowConnectChange({ ...widget.props?.flowConnect, type: value })}
                                        options={[
                                            { label: 'On Click', value: 'onClick' },
                                            { label: 'On Hover', value: 'onHover' },
                                            { label: 'On Page Load', value: 'onPageLoad' }
                                        ]}
                                    />
                                </Form.Item>

                                <Form.Item label="Connection Points">
                                    <Select
                                        value={widget.props?.flowConnect?.points}
                                        placeholder="Select Connection Points"
                                        mode="multiple"
                                        onChange={value => handleFlowConnectChange({ ...widget.props?.flowConnect, points: value })}
                                        options={[
                                            { label: 'API', value: 'api' },
                                            { label: 'Query', value: 'query' }
                                        ]}
                                    />
                                </Form.Item>

                                {widget.props?.flowConnect?.points?.includes('api') && (
                                    <Collapse defaultActiveKey={['api']}>

                                        <Panel header="API Configuration" key="api">
                                            <Form.Item label="Target Component">
                                                <Select
                                                    value={widget.props?.flowConnect?.targetComponent}
                                                    placeholder="Select target component"
                                                    onChange={value => handleFlowConnectChange({
                                                        ...widget.props?.flowConnect,
                                                        targetComponent: value
                                                    })}
                                                    options={Object.values(widgets)
                                                        .filter(w => w.id !== widget.id)
                                                        .map(w => ({
                                                            label: `${w.type} - ${w.props?.text || w.id}`,
                                                            value: w.id
                                                        }))}
                                                />
                                            </Form.Item>
                                            <ApiConfigurationPanel
                                                apiConfig={widget.props?.flowConnect?.api}
                                                onChange={handleApiConfigChange}
                                                targetComponentType={getEffectiveComponentType()}
                                                widget={widget}
                                                widgets={widgets}
                                            />
                                        </Panel>
                                    </Collapse>
                                )}
                                    {widget.props?.flowConnect?.points?.includes('query') && (
                                        <Collapse defaultActiveKey={['query']}>

                                            <Panel header="Query Configuration" key="query">
                                                <Form.Item label="Target Component">
                                                    <Select
                                                        value={widget.props?.flowConnect?.targetComponent}
                                                        placeholder="Select target component"
                                                        onChange={value => handleFlowConnectChange({
                                                            ...widget.props?.flowConnect,
                                                            targetComponent: value
                                                        })}
                                                        options={Object.values(widgets)
                                                            .filter(w => w.id !== widget.id)
                                                            .map(w => ({
                                                                label: `${w.type} - ${w.props?.text || w.id}`,
                                                                value: w.id
                                                            }))}
                                                    />
                                                </Form.Item>
                                                <QueryConfigurationPanel
                                                    queryConfig={widget.props?.flowConnect?.query}
                                                    onChange={handleQueryConfigChange}
                                                    targetComponentType={getEffectiveComponentType()}
                                                    widget={widget}
                                                    widgets={widgets}
                                                />
                                            </Panel>
                                        </Collapse>
                                    )}
                            </>
                        )}
                    </Form>
                </TabPane>

                    <TabPane tab="Visibility" key="visibility">
                        <ConditionalVisibilityPanel
                            conditionalVisibility={widget.props?.conditionalVisibility}
                            onChange={handleConditionalVisibilityChange}
                            widgets={widgets}
                        />
                    </TabPane>
            </Tabs>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary">Select a widget to edit its properties</Text>
                </div>
            )}
        </div>
    );
}; 