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
                            name={['columnLayout', 'columnCount']}
                            label="Columns per Row"
                        >
                            <InputNumber min={1} max={12} />
                        </Form.Item>
                        <Form.Item
                            name={['columnLayout', 'columnWidthMode']}
                            label="Column Width Mode"
                        >
                            <Select>
                                <Select.Option value="auto">Auto</Select.Option>
                                <Select.Option value="fixed">Fixed</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name={['columnLayout', 'stickyHeaders']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Sticky Headers" unCheckedChildren="Normal Headers" />
                        </Form.Item>
                        <Form.Item
                            name={['columnLayout', 'resizableColumns']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Resizable Columns" unCheckedChildren="Fixed Width" />
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Style" key="style">
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name={['style', 'tableBorder']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Show Borders" unCheckedChildren="Hide Borders" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'stripedRows']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Striped Rows" unCheckedChildren="Plain Rows" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'alternateRowColor']}
                            label="Alternate Row Color"
                        >
                            <Input type="color" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'headerColor']}
                            label="Header Background"
                        >
                            <Input type="color" />
                        </Form.Item>
                        <Form.Item
                            name={['style', 'headerFontColor']}
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
                            name={['pagination', 'rowsPerPage']}
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
                            name={['rowControls', 'mode']}
                            label="Row Mode"
                        >
                            <Select>
                                <Select.Option value="fixed">Fixed</Select.Option>
                                <Select.Option value="growing">Growing</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name={['rowControls', 'minRows']}
                            label="Minimum Rows"
                        >
                            <InputNumber min={0} />
                        </Form.Item>
                        <Form.Item
                            name={['rowControls', 'maxRows']}
                            label="Maximum Rows"
                        >
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item
                            name={['rowControls', 'allowAddRemove']}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Allow Add/Remove" unCheckedChildren="Fixed Rows" />
                        </Form.Item>
                        <Form.Item
                            name={['rowControls', 'initialRows']}
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