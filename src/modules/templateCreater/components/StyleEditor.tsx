import React, { useState } from 'react';
import { Card, Form, Input, Select, Slider, Row, Col, Divider, Typography, Radio, Collapse, Button, message, Switch, ColorPicker } from 'antd';
import { ColumnWidthOutlined, FontSizeOutlined, BgColorsOutlined, HighlightOutlined, AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface StyleEditorProps {
  onApplyStyles: (styles: any) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ onApplyStyles }) => {
  const [form] = Form.useForm();
  const [templateStyles, setTemplateStyles] = useState({
    fonts: {
      titleFont: 'Arial',
      bodyFont: 'Arial',
      titleSize: 16,
      bodySize: 14,
      titleColor: '#000000',
      bodyColor: '#333333',
    },
    layout: {
      pageWidth: '8.5in',
      pageMargin: '1in',
      columns: 1,
      columnGap: '0.5in',
    },
    colors: {
      primary: '#005A60',
      secondary: '#f8f8f8',
      accent: '#0078D7',
    },
    components: {
      tableBorder: true,
      tableStripes: true,
      inputBorder: true,
      roundedCorners: true,
    }
  });

  const handleStyleChange = (path: string[], value: any) => {
    const newStyles = { ...templateStyles };
    let current = newStyles;
    
    // Navigate to the nested property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Set the value
    current[path[path.length - 1]] = value;
    setTemplateStyles(newStyles);
  };

  const handleApplyStyles = () => {
    message.destroy();
    message.success('Template styles applied');
    if (onApplyStyles) {
      onApplyStyles(templateStyles);
    }
  };

  return (
    <div style={{ padding: '0 16px', height: '100%', overflow: 'auto' }}>
      <Form 
        form={form}
        layout="vertical"
        initialValues={templateStyles}
      >
        <Card title="Template Styling" size="small" style={{ marginBottom: 16 }}>
          <Text type="secondary">Configure the appearance of your template with these style controls.</Text>
        </Card>

        <Collapse defaultActiveKey={['fonts', 'layout']} style={{ marginBottom: 16 }}>
          <Panel header="Font Settings" key="fonts">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Title Font">
                  <Select 
                    value={templateStyles.fonts.titleFont}
                    onChange={(value) => handleStyleChange(['fonts', 'titleFont'], value)}
                  >
                    <Option value="Arial">Arial</Option>
                    <Option value="Helvetica">Helvetica</Option>
                    <Option value="Times New Roman">Times New Roman</Option>
                    <Option value="Calibri">Calibri</Option>
                    <Option value="Georgia">Georgia</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Body Font">
                  <Select 
                    value={templateStyles.fonts.bodyFont}
                    onChange={(value) => handleStyleChange(['fonts', 'bodyFont'], value)}
                  >
                    <Option value="Arial">Arial</Option>
                    <Option value="Helvetica">Helvetica</Option>
                    <Option value="Times New Roman">Times New Roman</Option>
                    <Option value="Calibri">Calibri</Option>
                    <Option value="Georgia">Georgia</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Title Size">
                  <Row>
                    <Col span={18}>
                      <Slider
                        min={12}
                        max={28}
                        value={templateStyles.fonts.titleSize}
                        onChange={(value) => handleStyleChange(['fonts', 'titleSize'], value)}
                      />
                    </Col>
                    <Col span={6}>
                      <div style={{ marginLeft: 10 }}>
                        {templateStyles.fonts.titleSize}px
                      </div>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Body Size">
                  <Row>
                    <Col span={18}>
                      <Slider
                        min={10}
                        max={20}
                        value={templateStyles.fonts.bodySize}
                        onChange={(value) => handleStyleChange(['fonts', 'bodySize'], value)}
                      />
                    </Col>
                    <Col span={6}>
                      <div style={{ marginLeft: 10 }}>
                        {templateStyles.fonts.bodySize}px
                      </div>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Title Color">
                  <Row align="middle">
                    <Col span={6}>
                      <ColorPicker 
                        value={templateStyles.fonts.titleColor}
                        onChange={(color) => handleStyleChange(['fonts', 'titleColor'], color.toHexString())}
                      />
                    </Col>
                    <Col span={18}>
                      <Input 
                        value={templateStyles.fonts.titleColor} 
                        onChange={(e) => handleStyleChange(['fonts', 'titleColor'], e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Body Color">
                  <Row align="middle">
                    <Col span={6}>
                      <ColorPicker 
                        value={templateStyles.fonts.bodyColor}
                        onChange={(color) => handleStyleChange(['fonts', 'bodyColor'], color.toHexString())}
                      />
                    </Col>
                    <Col span={18}>
                      <Input 
                        value={templateStyles.fonts.bodyColor} 
                        onChange={(e) => handleStyleChange(['fonts', 'bodyColor'], e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          <Panel header="Layout Settings" key="layout">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Page Width">
                  <Input 
                    value={templateStyles.layout.pageWidth}
                    onChange={(e) => handleStyleChange(['layout', 'pageWidth'], e.target.value)}
                    suffix="in"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Page Margin">
                  <Input 
                    value={templateStyles.layout.pageMargin}
                    onChange={(e) => handleStyleChange(['layout', 'pageMargin'], e.target.value)}
                    suffix="in"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Column Layout">
              <Radio.Group 
                value={templateStyles.layout.columns}
                onChange={(e) => handleStyleChange(['layout', 'columns'], e.target.value)}
                buttonStyle="solid"
                style={{ width: '100%', display: 'flex' }}
              >
                <Radio.Button value={1} style={{ flex: 1, textAlign: 'center' }}>
                  <ColumnWidthOutlined /> Single
                </Radio.Button>
                <Radio.Button value={2} style={{ flex: 1, textAlign: 'center' }}>
                  <ColumnWidthOutlined /> Two Columns
                </Radio.Button>
                <Radio.Button value={3} style={{ flex: 1, textAlign: 'center' }}>
                  <ColumnWidthOutlined /> Three Columns
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            {templateStyles.layout.columns > 1 && (
              <Form.Item label="Column Gap">
                <Input 
                  value={templateStyles.layout.columnGap}
                  onChange={(e) => handleStyleChange(['layout', 'columnGap'], e.target.value)}
                  suffix="in"
                />
              </Form.Item>
            )}
          </Panel>

          <Panel header="Color Scheme" key="colors">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Primary Color">
                  <Row align="middle">
                    <Col span={6}>
                      <ColorPicker 
                        value={templateStyles.colors.primary}
                        onChange={(color) => handleStyleChange(['colors', 'primary'], color.toHexString())}
                      />
                    </Col>
                    <Col span={18}>
                      <Input 
                        value={templateStyles.colors.primary} 
                        onChange={(e) => handleStyleChange(['colors', 'primary'], e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Secondary Color">
                  <Row align="middle">
                    <Col span={6}>
                      <ColorPicker 
                        value={templateStyles.colors.secondary}
                        onChange={(color) => handleStyleChange(['colors', 'secondary'], color.toHexString())}
                      />
                    </Col>
                    <Col span={18}>
                      <Input 
                        value={templateStyles.colors.secondary} 
                        onChange={(e) => handleStyleChange(['colors', 'secondary'], e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Accent Color">
                  <Row align="middle">
                    <Col span={6}>
                      <ColorPicker 
                        value={templateStyles.colors.accent}
                        onChange={(color) => handleStyleChange(['colors', 'accent'], color.toHexString())}
                      />
                    </Col>
                    <Col span={18}>
                      <Input 
                        value={templateStyles.colors.accent} 
                        onChange={(e) => handleStyleChange(['colors', 'accent'], e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          <Panel header="Component Styling" key="components">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Table Borders" valuePropName="checked">
                  <Switch 
                    checked={templateStyles.components.tableBorder}
                    onChange={(checked) => handleStyleChange(['components', 'tableBorder'], checked)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Table Striping" valuePropName="checked">
                  <Switch 
                    checked={templateStyles.components.tableStripes}
                    onChange={(checked) => handleStyleChange(['components', 'tableStripes'], checked)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Input Borders" valuePropName="checked">
                  <Switch 
                    checked={templateStyles.components.inputBorder}
                    onChange={(checked) => handleStyleChange(['components', 'inputBorder'], checked)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Rounded Corners" valuePropName="checked">
                  <Switch 
                    checked={templateStyles.components.roundedCorners}
                    onChange={(checked) => handleStyleChange(['components', 'roundedCorners'], checked)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={() => form.resetFields()} style={{ marginRight: 8 }}>
            Reset
          </Button>
          <Button type="primary" onClick={handleApplyStyles}>
            Apply Styles
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default StyleEditor; 