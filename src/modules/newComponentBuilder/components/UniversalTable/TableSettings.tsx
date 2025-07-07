import { Form, Input, InputNumber, Modal, Select, Switch, Tabs } from 'antd';
import { useEffect } from 'react'
import { TemplateData } from './types';

export const TableSettingsModal = ({ 
    visible, 
    onClose, 
    settings, 
    onSave 
}: { 
    visible: boolean; 
    onClose: () => void; 
    settings: TemplateData; 
    onSave: (settings: TemplateData) => void;
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(settings);
    }, [settings]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            onSave(values);
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Table Settings"
            open={visible}
            onOk={handleSave}
            onCancel={onClose}
            width={800}
        >
            <Tabs>
                <Tabs.TabPane tab="Layout" key="layout">
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name={['column_layout', 'column_count']}
                            label="Columns per Row"
                        >
                            <InputNumber min={1} max={12} />
                        </Form.Item>
                        <Form.Item
                            name={['column_layout', 'column_width_mode']}
                            label="Column Width Mode"
                        >
                            <Select>
                                <Select.Option value="auto">Auto</Select.Option>
                                <Select.Option value="fixed">Fixed</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name={['column_layout', 'sticky_headers']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Sticky Headers" unCheckedChildren="Normal Headers" />
                        </Form.Item>
                        <Form.Item
                            name={['column_layout', 'resizable_columns']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Resizable Columns" unCheckedChildren="Fixed Width" />
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Style" key="style">
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name={['style', 'table_border']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Show Borders" unCheckedChildren="Hide Borders" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'striped_rows']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Striped Rows" unCheckedChildren="Plain Rows" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'alternate_row_color']}
                            label="Alternate Row Color"
                        >
                            <Input type="color" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'header_color']}
                            label="Header Background"
                        >
                            <Input type="color" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'header_font_color']}
                            label="Header Text Color"
                        >
                            <Input type="color" />
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Pagination" key="pagination">
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name={['pagination', 'enabled']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Enable Pagination" unCheckedChildren="Disable Pagination" />
                        </Form.Item>
                        <Form.Item
                            name={['pagination', 'rows_per_page']}
                            label="Rows per Page"
                        >
                            <Select>
                                <Select.Option value={10}>10</Select.Option>
                                <Select.Option value={20}>20</Select.Option>
                                <Select.Option value={50}>50</Select.Option>
                                <Select.Option value={100}>100</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Row Controls" key="rows">
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name={['row_controls', 'mode']}
                            label="Row Mode"
                        >
                            <Select>
                                <Select.Option value="fixed">Fixed</Select.Option>
                                <Select.Option value="growing">Growing</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name={['row_controls', 'min_rows']}
                            label="Minimum Rows"
                        >
                            <InputNumber min={0} />
                        </Form.Item>
                        <Form.Item
                            name={['row_controls', 'max_rows']}
                            label="Maximum Rows"
                        >
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item
                            name={['row_controls', 'allow_add_remove']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Allow Add/Remove" unCheckedChildren="Fixed Rows" />
                        </Form.Item>
                        <Form.Item
                            name={['row_controls', 'initial_rows']}
                            label="Initial Rows"
                        >
                            <InputNumber min={1} />
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};