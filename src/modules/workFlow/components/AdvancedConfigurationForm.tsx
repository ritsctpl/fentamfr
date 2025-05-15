import React, { useEffect, useState } from 'react';
import { Row, Col, Select, Button, Switch, Form, Input, Typography, Card, Tabs } from 'antd';
import { useMyContext } from '../hooks/workFlowContext';

const { TabPane } = Tabs;

const AdvancedConfigurationForm: React.FC = () => {
  const [module, setModule] = useState('MFR');
  const [form] = Form.useForm();
  const [finalApproval, setFinalApproval] = useState(false);
  const [sequenceFlow, setSequenceFlow] = useState(false);
  const [parallelApproval, setParallelApproval] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const { payloadData, setPayloadData } = useMyContext();

  useEffect(() => {
    // debugger
      form.setFieldsValue(payloadData);
  }, [payloadData]);

  
  return (
    <div style={{ marginTop: '5px' }}>
      <Form form={form} layout="horizontal">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item 
              label="Enforce Sequence Flow" 
              name="enforceSequenceWorkFlow"
              labelCol={{ span: 16 }}
              wrapperCol={{ span: 12 }}
            >
              <Switch 
                checked={payloadData?.enforceSequenceWorkFlow}
                onChange={(checked) =>{ setSequenceFlow(checked); setPayloadData((prev) => ({ ...prev, enforceSequenceWorkFlow: checked }))}}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              label="Parallel Approval" 
              name="parallelApproval"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 12 }}
            >
              <Switch 
                checked={ payloadData?.parallelApproval}
                onChange={(checked) => { setParallelApproval(checked); setPayloadData((prev) => ({ ...prev, parallelApproval: checked }))}}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              label="Email Notification" 
              name="emailNotification"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 12 }}
            >
              <Switch 
                checked={payloadData?.emailNotification}
                onChange={(checked) =>{ setEmailNotification(checked); setPayloadData((prev) => ({ ...prev, emailNotification: checked }))}}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AdvancedConfigurationForm;