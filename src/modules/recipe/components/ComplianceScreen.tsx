import React, { useContext, useEffect, useState } from 'react';
import { Form, Select, Checkbox, Table, Button, Input, Space } from 'antd';
import { OperationContext } from '../hooks/recipeContext';

const { Option } = Select;

const ComplianceScreen: React.FC = () => {
  const [regulatoryAgencies, setRegulatoryAgencies] = useState<string[]>([]);
  const [auditRequired, setAuditRequired] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<{ key: string; riskFactor: string; mitigationSteps: string[] }[]>([]);
  const { setFormData,formData } = useContext(OperationContext);
  
  const columns = [
    {
      title: 'Step ID',
      dataIndex: 'key',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Risk Factor',
      dataIndex: 'riskFactor',
      render: (text: string, record: any) => (
        <Input.TextArea
          value={text}
          onChange={(e) => handleRiskFactorChange(record.key, e.target.value)}
        />
      ),
    },
    {
      title: 'Mitigation Steps',
      dataIndex: 'mitigationSteps',
      render: (text: string[], record: any) => (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          value={text}
          onChange={(value) => handleMitigationChange(record.key, value)}
        >
          <Option value="step1">Mitigation Step 1</Option>
          <Option value="step2">Mitigation Step 2</Option>
          <Option value="step3">Mitigation Step 3</Option>
        </Select>
      ),
    },
  ];

  useEffect(() => {
    console.log("check");
    
    setRegulatoryAgencies(formData.compliance?.regulatoryAgencies || []);
    setAuditRequired(formData.compliance?.auditRequired || false);

   
  }, [ dataSource]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      compliance: { 
          regulatoryAgencies: regulatoryAgencies,
          auditRequired: auditRequired,
          ...dataSource[0],
      },
  }));
  }, [regulatoryAgencies,auditRequired,dataSource]);

  const handleRiskFactorChange = (key: string, value: string) => {
    const newData = dataSource.map((item) => (item.key === key ? { ...item, riskFactor: value } : item));
    setDataSource(newData);
    setFormData((prevFormData) => ({
        ...prevFormData,
        compliance: { 
            regulatoryAgencies: regulatoryAgencies,
            auditRequired: auditRequired,
            ...newData[0],
        },
    }));
  };

  const handleMitigationChange = (key: string, value: string[]) => {
    const newData = dataSource.map((item) => (item.key === key ? { ...item, mitigationSteps: value } : item));
    setDataSource(newData);
    setFormData((prevFormData) => ({
        ...prevFormData,
        compliance: { 
          regulatoryAgencies
: regulatoryAgencies,
            auditRequired: auditRequired,
            ...newData[0],
        },
    }));
  };

  const addStep = () => {
    const newStep = {
      key: (dataSource.length + 1).toString(),
      riskFactor: '',
      mitigationSteps: [],
    };
    setDataSource([...dataSource, newStep]);
    
  };
console.log(regulatoryAgencies,formData,"regulatoryAgencies");

  return (
    <Form layout="vertical">
      <Form.Item label="Regulatory Agencies">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select regulatory agencies"
          value={regulatoryAgencies}
          onChange={setRegulatoryAgencies}
        >
          <Option value="agency1">Agency 1</Option>
          <Option value="agency2">Agency 2</Option>
          <Option value="agency3">Agency 3</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Checkbox checked={auditRequired} onChange={(e) => setAuditRequired(e.target.checked)}>
          Audit Required
        </Checkbox>
      </Form.Item>
      {/* <Space style={{ marginBottom: 16, display: 'flex', marginRight: "20px" }}>
      <Button type="dashed" onClick={addStep} style={{ marginTop: 16 }}>
        Add Step
      </Button>
      </Space>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ y: 'calc(100vh - 630px)' }}
        rowKey="key"
      /> */}

    </Form>
  );
};

export default ComplianceScreen;
