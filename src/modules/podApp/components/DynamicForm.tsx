import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select, Row, Col, Table, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { DynamicBrowse } from '@components/BrowseComponent';
import { PodContext } from '@modules/podApp/hooks/userContext';
import BatchInput from '@modules/podApp/components/BatchInputBrowse';
import PcuInput from './PcuInputBrowse';

interface FormValues {
  [key: string]: any;
  workCenter?: string;
  resource?: string;
  operation?: string;
  status?: string;
  defaultResource?: string;
  hireDate?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  employeeNumber?: string;
  employeePersonalNumber?: string;
}

interface DynamicFormProps {
  data: FormValues;
  fields: string[];
  onValuesChange: (changedValues: FormValues) => void;
  qty: string;
}

const typesOptions = [
  { value: 'Production', label: 'Production' },
  { value: 'Value', label: 'Value' },
];

const { Option } = Select;

const uiResource: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Resoure',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'resource',
  tabledataApi: "resourcetype-service"
};
const uiRecipeBatchProcess: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Phase',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'getPhasesBySite',
  tabledataApi: "recipe-service"
};
const uiWorkCenter: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Work Center',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'workCenter',
  tabledataApi: "workcenter-service"
};

const DynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange, qty }) => {
  const { setOperationIdd, filterFormData, setFilterFormData, selectedRowData, setSelectedRowData, selectedRowDataCurrent, phaseIdd, setPhaseId,
    batchNoTabOut, setBatchNoTabOut, activityId, setActivityId } = useContext(PodContext);

  // console.log(selectedRowDataCurrent,"selectedRowDataCurrent");

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [operation, setOperation] = useState(filterFormData?.defaultOperation)
  const [phaseByDefault, setPhaseByDefault] = useState(filterFormData?.defaultPhaseId)
  const [workCenter, setWorkCenter] = useState(filterFormData?.defaultWorkCenter)
  const [resource, setResource] = useState(filterFormData?.defaultResource);
  const [phaseId, setRecipeBatchProcess] = useState(filterFormData?.defaultResource);
  const [qtty, setQty] = useState(filterFormData?.qtty || 0);
  const [resourceIdd, setResourceIdd] = useState(filterFormData?.defaultResource);
  const [selectedRowDataCurrents, setSelectedRowDataCurrents] = useState(selectedRowDataCurrent);

  const { call1, setCall1 } = useContext(PodContext);
  const [component, setComponent] = useState<string | undefined>(data?.component);

// useEffect(() => { 
//   document.cookie = `Resource=${filterFormData?.defaultResource}; path=/; samesite=lax`;
// },  [filterFormData]);
  // Handle initial phase and form data setup
  useEffect(() => {
    // Set other form data
    sessionStorage.removeItem('resourceType');
    setOperation(filterFormData?.defaultOperation);
    setResource(filterFormData?.defaultResource);
    setWorkCenter(filterFormData?.defaultWorkCenter);
    setSelectedRowDataCurrents(selectedRowDataCurrent);
    setQty(filterFormData?.qtty);
    setPhaseByDefault(filterFormData?.defaultPhaseId)
// Get resource type from session storage
if (filterFormData?.resourceType) {
  sessionStorage.setItem('resourceType', filterFormData.resourceType);
} else {
  sessionStorage.removeItem('resourceType');
}
    
    // updatePhase();

  }, [data, form]);


  const updatePhase = () => {
    const webUrl = window.location.href;
    const urlObject = new URL(webUrl);
    const searchParams = urlObject.searchParams;
    const phase = searchParams.get("phase");
    // const activityId = searchParams.get("activityId");
    // console.log(activityId,"activityId");
    // setActivityId(activityId);
    // Only update phase-related state if we haven't done it before
    if (phase && !phaseByDefault) {
      setRecipeBatchProcess(phase);
      setPhaseId(phase);
      setPhaseByDefault(phase);
      sessionStorage.setItem('PhaseIdd', phase);
    }
    else {
      setPhaseByDefault("")
    }
  }


  useEffect(() => {
    const webUrl = window.location.href;
    const urlObject = new URL(webUrl);

    // Extract the search parameters
    const searchParams = urlObject.searchParams;

    // Get the 'phase' parameter
    const phase = searchParams.get("phase");
    setFilterFormData(prevState => ({
      ...prevState,
      defaultPhaseId: phaseByDefault
    }));

  }, [])



  const uiOperation: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Operation',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'getOperationByFilter',
    tabledataApi: filterFormData?.podCategory?.toLowerCase() === "process" || filterFormData?.podCategory?.toLowerCase() === "processorder" ? "recipe-service" : "operation-service"
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedQuantity = sessionStorage.getItem('quantity');
      if (storedQuantity) {
        setQty(Number(storedQuantity));
      }
      sessionStorage.setItem('quantity', qtty?.toString());
      updatePhase();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value.trimStart();

    const patterns: { [key: string]: RegExp } = {
      userId: /^[a-z0-9_]*$/,
      firstName: /^[A-Z0-9_]*$/,
      lastName: /^[A-Z0-9_]*$/,
      employeeNumber: /^\d*$/,
      employeePersonalNumber: /^\d*$/,
      emailAddress: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');

    switch (key) {
      case 'userId':
        if (patterns.userId.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case 'firstName':
      case 'lastName':
        newValue = newValue.toUpperCase();
        if (patterns.firstName.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case 'employeeNumber':
      case 'employeePersonalNumber':
        if (patterns.employeeNumber.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case 'emailAddress':
        if (patterns.emailAddress.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      default:
        form.setFieldsValue({ [key]: newValue });
        onValuesChange({ [key]: newValue });
        break;
    }
  };

  const handleInputBlur = (key: string, currentValue?) => {
    console.log(`${key} value on blur:`, currentValue);

    if(currentValue && filterFormData){
    if (key?.toLowerCase() == 'operation') {
      if (filterFormData?.settings?.onTabOutOfOperation?.reloadWorkList) {
        setCall1(call1 + 1);
      }
    }
    else if (key?.toLowerCase() == 'resource') {
      if (filterFormData?.settings?.onTabOutOfResource?.reloadWorkList) {
        setCall1(call1 + 1);
      }
    }
    else if (key?.toLowerCase().replaceAll(" ", "") == 'workcenter') {
      if (filterFormData?.settings?.onTabOutOfWorkCenter?.reloadWorkList) {
        setCall1(call1 + 1);
      }
    }
  }
  const batchValue = selectedRowData[0]?.batchNo;
  if(key.toLowerCase().replaceAll(" ", "") == 'batchno' && batchValue){
    
     
        setBatchNoTabOut(batchNoTabOut + 1);  
      
    
  }
  

  };

  const handleOperationChange = (newValues: any[]) => {
   
    if (newValues.length === 0) {
      setOperationIdd("");
      setOperation("");
      setFilterFormData(prev => ({
        ...prev,
        defaultOperation: ""
      }));
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('OperationId');
        setOperationIdd("");
      }
      onValuesChange({ operation: "" });
    }
    if (newValues.length > 0) {
      const newValue = filterFormData.podCategory.toLowerCase()==="process"?newValues[0].operationId:newValues[0].operation;
      localStorage.setItem('revsion', newValues[0].revision);
      setOperation(newValue);
      onValuesChange({ operation: newValue.toUpperCase() });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('OperationId', newValue);
        setOperationIdd(newValue);
      }
      setFilterFormData(prev => ({
        ...prev,
        defaultOperation: newValue
      }));
      // setSelectedRowData([])
    }
  };

  const handleWorkCenterChange = (newValues: any[]) => {
    if (newValues.length === 0) {
      setWorkCenter("");
      setFilterFormData(prev => ({
        ...prev,
        defaultWorkCenter: ""
      }));
      onValuesChange({ workCenter: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].workCenter;
      setWorkCenter(newValue);
      onValuesChange({ workCenter: newValue.toUpperCase() });
      setFilterFormData(prev => ({
        ...prev,
        defaultWorkCenter: newValue
      }));
    }
  };

  const handleResourceChange = (newValues: any[]) => {
    if (newValues.length === 0) {
      setResource("");
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ResourceId');
        // document.cookie = `Resource=; path=/; samesite=lax`;
        setResourceIdd("");
      }
      setFilterFormData(prev => ({
        ...prev,
        defaultResource: ""
      }));
      onValuesChange({ resource: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].resource;
      setResource(newValue);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ResourceId', newValue);
        // document.cookie = `Resource=${newValue}; path=/; samesite=lax`;
        setResourceIdd(newValue);
      }
      setFilterFormData(prev => ({
        ...prev,
        defaultResource: newValue
      }));

      onValuesChange({ resource: newValue.toUpperCase() });
    }
  };
  const handleRecipeBatchProcessChange = (newValues: any[]) => {
    if (newValues.length === 0) {
      setPhaseId("");
      setRecipeBatchProcess("");
      setPhaseByDefault("");
      setFilterFormData(prev => ({
        ...prev,
        defaultPhaseId: "",
        defaultPhaseSequence: ""
      }));
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('PhaseIdd');

      }
      onValuesChange({ phaseId: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].phaseId;
      const newValueSequence = newValues[0].sequence;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('PhaseIdd', newValue);
        setPhaseId(newValue);
      }
      console.log(newValue, "newValue");

      setRecipeBatchProcess(newValue);

      setFilterFormData(prev => ({
        ...prev,
        defaultPhaseId: newValue,
        defaultPhaseSequence: newValueSequence
      }));
      setPhaseByDefault(newValue);
      onValuesChange({ phaseId: newValue.toUpperCase() });
    }
  };
  const onChangeComponent = (newValues) => {
    setComponent(newValues);
    form.setFieldsValue({
      component: newValues.toUpperCase(),
    });

    onValuesChange({
      component: newValues.toUpperCase(),
    });
  }

  const pcuBOOptions = selectedRowData.map((row) => ({
    label: row.pcuBO,
    value: row.pcuBO,
  }));

  const handleQtyChange = (newValue: number) => {
    setQty(newValue);
    form.setFieldsValue({ qty: newValue });
    onValuesChange({ qty: newValue });
    setFilterFormData(prev => ({ ...prev, qtty: newValue }));
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quantity', newValue.toString());
    }
  };



  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={(values) => console.log('Form Values:', values)}
      onValuesChange={(changedValues) => onValuesChange(changedValues as FormValues)}
      style={{ width: '100%', marginRight: "10px", marginLeft: "2px" }}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Row gutter={[4, 0]} justify="start" align="middle" wrap={false}>
        {fields?.map((key) => {
          const value = data[key];
          if (value === undefined) {
            return null;
          }

          // {console.log(fields,"fields")}
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());

          if (key === 'type') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  style={{ margin: '0px', marginRight: '8px' }}
                >
                  <Select defaultValue={value}>
                    {typesOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            );
          }



          if (key === 'operation' && filterFormData.type !== 'WorkCenter') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  style={{ margin: '0px', marginRight: '8px' }}
                  required
                >
                  <DynamicBrowse
                    uiConfig={uiOperation}
                    initial={operation}
                    onSelectionChange={handleOperationChange}
                    isDisable={!filterFormData.operationCanBeChanged}
                    setOnChangeValue={onChangeComponent}
                    onBlur={() => handleInputBlur(key, operation)}
                  // style={{ width: '80%' }}
                  />
                </Form.Item>
              </Col>
            );
          }
          if (key === 'workCenter' && filterFormData.type === 'WorkCenter') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  style={{ margin: '0px', marginRight: '8px' }}
                  required
                >
                  <DynamicBrowse
                    uiConfig={uiWorkCenter}
                    initial={workCenter}
                    onSelectionChange={handleWorkCenterChange}
                    isDisable={!filterFormData.operationCanBeChanged}
                    setOnChangeValue={onChangeComponent}
                    onBlur={() => handleInputBlur(key, workCenter)}
                  // style={{ width: '80%' }}
                  />
                </Form.Item>
              </Col>
            );
          }
          if (key === 'qty') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content', }}>
                <Form.Item
                  name={key}
                  label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  style={{ margin: '0px', marginRight: '8px' }}
                // required
                >
                  <Input
                    defaultValue={qtty}
                    type='number'
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      handleQtyChange(newValue);
                    }}
                    disabled={!filterFormData.showQuantity}
                    style={{ width: '40%' }}
                  // onBlur={() => handleInputBlur(key)}
                  />
                </Form.Item>
              </Col>
            );
          }

          if (key === 'pcu') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  // label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  label={t('pcu')}
                  style={{ margin: '0px', marginRight: '8px' }}
                  required
                >
                  <PcuInput
                    onBlur={() => handleInputBlur(key)}
                  />
                </Form.Item>
              </Col>
            );
          }

          if (key === 'batchNo') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  // label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  label={<span style={{ fontWeight: '500' }}>{filterFormData?.podCategory?.toLowerCase() === 'discrete' ? t('pcu') : t('batchNo')}</span>}
                  style={{ margin: '0px', marginRight: '8px' }}
                  required
                >
                  <BatchInput
                    onBlur={() => handleInputBlur(key, value)}

                  />
                </Form.Item>
              </Col>
            );
          }

          if (key === 'phase'
            && filterFormData.podCategory.toLowerCase() === "process"
            && filterFormData.type === 'Operation') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  // label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  label={<span style={{ fontWeight: '500' }}>{t(`phase`)}</span>}
                  style={{ margin: '0px', marginRight: '8px' }}
                >
                  <DynamicBrowse
                    uiConfig={uiRecipeBatchProcess}
                    initial={phaseByDefault}
                    onSelectionChange={handleRecipeBatchProcessChange}
                    // isDisable={!filterFormData.resourceCanBeChanged}
                    setOnChangeValue={onChangeComponent}
                    onBlur={() => handleInputBlur(key)}
                  // style={{ width: '80%' }}
                  // selectedRowDataCurrent={selectedRowDataCurrents}
                  />
                </Form.Item>
              </Col>
            );
          }
          if (key === 'resource') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  style={{ margin: '0px', marginRight: '8px' }}
                  required
                >
                  <DynamicBrowse
                    uiConfig={uiResource}
                    initial={resource}
                    onSelectionChange={handleResourceChange}
                    isDisable={!filterFormData.resourceCanBeChanged}
                    setOnChangeValue={onChangeComponent}
                  // style={{ width: '80%' }}
                  />
                </Form.Item>
              </Col>
            );
          }

          if (typeof value === 'boolean') {
            return (
              <Col key={key} style={{ minWidth: 'fit-content' }}>
                <Form.Item
                  name={key}
                  label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                  valuePropName="checked"
                >
                  <Switch checked={value} onChange={(checked) => onValuesChange({ [key]: checked })} />
                </Form.Item>
              </Col>
            );
          }

          return (
            <Col key={key} style={{ minWidth: 'fit-content' }}>
              <Form.Item
                name={key}
                label={<span style={{ fontWeight: '500' }}>{t(`${key}`)}</span>}
                style={{ margin: '0px', marginRight: '8px' }}
              >
                <Input defaultValue={value} onChange={(e) => handleInputChange(e, key)} onBlur={() => handleInputBlur(key)} />
              </Form.Item>
            </Col>
          );
        })}
      </Row>
    </Form>
  );
};

export default DynamicForm;