import React, { useContext, useEffect, useState } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Space,
  Form,
  Input,
  message,
  Drawer,
  InputNumber,
  Tabs,
  Select,
  Switch,
  Modal,
} from 'antd';
import DeleteIcon from '@mui/icons-material/Delete'; // Material-UI Delete Icon
import IconButton from '@mui/material/IconButton'; // Material-UI IconButton
import type { ColumnsType } from 'antd/es/table';
import { OperationContext } from '../hooks/recipeContext';
import { addStep, deletePhaseStep, getNextphase, getPhaseIngredients, getPhaseStepById, retrieveAllStep, updateStep } from '@services/recipeServices';
import { parseCookies } from 'nookies';
import ResourceTable from './ResourceStep';
import DataCollectionTable from './DataCollection';
import QualityControlParameters from './QualityControlPara';
import { useTranslation } from 'react-i18next';
import AdjustmentTable from './AdjustmentStep';
import { DeleteOutlined } from '@ant-design/icons';
import { DynamicBrowse } from '@components/BrowseComponent';
import OperationIngredients from './OperationIngredients';

const { Option } = Select;
const { TabPane } = Tabs;

interface Step {
  operationId: string;
  operationName: string;
  sequence: number;
  instruction: string;
  type: string;
  expectedCycleTime: string;
  tools: string[];
  ccp: boolean;
  operationDescription?: string;
  operationVersion?:string;
}

interface PhasesStepsProps {
  phasesId: string;
  formDatas:any;
  phaseName?: string;
  sequence:string;
}

// Add validation function at the top level
function validateStepName(name: string) {
    return /^[A-Z0-9_]+$/.test(name);
}

const StepManagementTable: React.FC<PhasesStepsProps> = ({ phasesId,formDatas,phaseName,sequence }) => {
  

    const { t } = useTranslation();
  const { formData } = useContext(OperationContext);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isStepModalVisible, setIsStepModalVisible] = useState(false);
  const [editStepMode, setEditStepMode] = useState(false);
  const [operationId, setStepId] = useState(null);
  const [formStep, setFormStep] = useState(null);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [form] = Form.useForm();
  const [stepType, setStepType] = useState('');
  const [operation, setOperation] = useState(null);
  const [operationVersion, setOperationVersion] = useState(null);
  const values = formDatas
  if (values?.conditional) {
    form.setFieldsValue({ type: 'conditional' });
} else if (values?.parallel) {
    form.setFieldsValue({ type: 'parallel' });
} else if (values?.anyOrder) {
    form.setFieldsValue({ type: 'anyOrder' });
} else {
    form.setFieldsValue({ type: 'sequential' }); // Reset if none are selected
}

  const stepColumns: ColumnsType<Step> = [
    // { 
    //   title: t('operation'), 
    //   dataIndex: 'operationId', 
    //   key: 'operationId',
    //   width: '40%'
    // },
    { title: t('operation'), dataIndex: 'operationDescription', key: 'operationDescription' },
    { title: t('sequence'), dataIndex: 'sequence', key: 'sequence', width: '20%' },
    { title: t('type'), dataIndex: 'type', key: 'type', width: '20%' },
    {
      title: t('action'),
      key: 'action',
      width: '20%',
      render: (text: any, record: any) => (
        <Button 
        shape="circle"
            onClick={(event) => {
                event.stopPropagation(); // Prevent row click
                handleRemoveStep(record.operationId,record.sequence,record.operationVersion);
            }} 
             icon={<DeleteOutlined style={{fontSize: '13px'}} />}
          size="small"
        />
    ),
    },
  ];

  const cookies = parseCookies();
  const site = cookies.site;
  const userId = cookies.rl_user_id;

  useEffect(() => {
    const fetchSteps = async () => {
      const params = {
        recipeId: formData.recipeId,
        recipeName: formData.recipeName,
        phaseId: phasesId,
        version: formData.version,
        user: userId,
        phaseSequence: sequence
      };
      try {
        const response = await retrieveAllStep(site, params);
        setSteps(response || []);
        console.log(response,"responseget");
      } catch (error) {
        message.error('Failed to retrieve steps. Please try again.');
      }
    };
    fetchSteps();
  }, [phasesId]);
  useEffect(() => {
    const fetchStepss = async () => {
      const params = {
        recipeId: formData.recipeId,
        recipeName: formData.recipeName,
        phaseId: phasesId,
        phaseSequence: sequence,
        version: formData.version,
        user: userId,
      };
     try {
        const response1 = await getNextphase(site, params);
      
        
      } catch (error) {
        message.error('Failed to retrieve steps. Please try again.');
      }
    };
    fetchStepss();
  }, [phasesId]);

  const handleRemoveStep = (id: string,sequenceOp:string,operationVersion:string) => {
    // Show confirmation modal
    Modal.confirm({
      title: 'Confirm Removal',
      content: 'Are you sure you want to remove this Operation?',
      onOk: async () => {
        const params = {
          recipeId: formData.recipeId,
          recipeName: formData.recipeName,
          phaseId: phasesId,
          phaseSequence: sequence,
          version: formData.version,
          user: userId,
          operationId: id,
          opVersion:operationVersion,
          opSequence: sequenceOp,
        };
  
        try {
          const res = await deletePhaseStep(site, params);
          if (res.errorCode) {
            throw new Error(res.message || 'Failed to remove Operation.');
          }
          
          // Update steps state if deletion was successful
          setSteps(steps.filter(step => step.operationId !== id));
          message.success(res.message_details.msg);
        } catch (error) {
          message.error('Failed to remove Operation. Please try again.');
        }
      },
      onCancel() {
        // Optionally handle cancellation
        console.log('Removal canceled');
      },
    });
  };

  const handleAddStep = () => {
    setEditStepMode(false);
    setEditingStep(null);
    setOperation(null)
  
    
    // Automatically generate the next sequence number
    const nextSequence = steps.length > 0 
      ? Math.max(...steps.map(step => step.sequence || 0)) + 10 
      : 10;
    
    // Reset the form fields and set the operationId and sequence
    form.resetFields();
    form.setFieldsValue({ 
      sequence: nextSequence,
      entryOperation: false,
      lastOperationAtPhase: false
    });
    
    setFormStep([])
    setIsStepModalVisible(true);
  };
  

  const handleEditStep = async (record: Step) => {
    const param = { 

        "site": site, 
      
        "recipeId": formData.recipeId, 
        "recipeName": formData.recipeName,
      
        "user": userId, 
      
        "version":formData.version, 
        "opSequence": record.sequence,
        "phaseSequence": sequence,
        "phaseId": phasesId, 
        "phaseName": phaseName,
      
        "operationId": record.operationId 
      
      } 
    try {
        const phaseStep = await getPhaseStepById(site, param);
        console.log(phaseStep,"phaseStep");
        setFormStep(phaseStep)
        form.setFieldsValue(phaseStep);
        
    } catch (e) {
        console.error("Error fetching phase Operation:", e);
        // Optionally show an error message to the user
    }

    setEditStepMode(true);
    setEditingStep(record);
    
    setIsStepModalVisible(true);
    setStepId(record.operationId);
};


  const handleModalOkStep = async () => {
    try {
      if(operation === null){
        message.error('Please select the operation!');
        return;
      }
      const values = await form.validateFields();
      await setFormStep({ ...values, operationId: operation })
      let updatedSteps;
      let filterSteps;
  
      if (editStepMode && editingStep) {
        const newStep = { ...values,operationId:operation,operationVersion:formStep.operationVersion};
        console.log(formStep,"newStep");
        updatedSteps = steps.map(step => (step.operationId === newStep.operationId ? newStep : step));
        filterSteps = updatedSteps.filter(data =>(data.operationId===newStep.operationId))
        const payload = {
          site: site,
          recipeId: formData.recipeId,
          recipeName: formData.recipeName,
          user: userId,
          version: formData.version,
          phaseId: phasesId,
          opSequence: newStep.sequence,
          phaseSequence: sequence,
          operationId: newStep.operationId,
          opVersion:operationVersion,
          operationName:operation,
          operations: [{...formStep,operationId:operation,operationVersion:operationVersion}],
        };

  console.log(payload,"updatedSteps");
  
        const res = await updateStep(payload);
        if (res.errorCode) {
          throw new Error(res.message || 'Failed to update Operation.');
        }
        setSteps(updatedSteps); // Update state with the modified step
        if(res.message_details.msg_type === "E"){
          message.error(res.message_details.msg);
        }
        else{
          message.success(res.message_details.msg);
        }
      } else {
        const newStep = { ...values,operationId:operation,operationVersion:operationVersion,...formStep };
        updatedSteps = [...steps, newStep];
        const updatedStepsApi = [ newStep];
        console.log(updatedStepsApi,"updatedStepsApi");

        const payload = {
          site: site,
          recipeId: formData.recipeId,
          recipeName: formData.recipeName,
          user: userId,
          version: formData.version,
          phaseId: phasesId,
          opSequence: newStep.sequence,
          phaseSequence: sequence,
          operationId: newStep.operationId,
          opVersion:newStep.operationVersion,
          operations: updatedStepsApi,
        };
  
        const res = await addStep(payload);
        if (res.errorCode) {
          throw new Error(res.message || 'Failed to add Operation.');
        }
        setSteps(updatedSteps); // Update state with the new step
        if(res.message_details.msg_type === "E"){
          message.error(res.message_details.msg);
        }
        else{
          message.success(res.message_details.msg);
        }
      }
      
      form.resetFields();
      setIsStepModalVisible(false);
    } catch (error) {
      message.error('Failed to save Operation. Please try again.');
    }
  };
  

  const handleModalCancelStep = () => {
    setIsStepModalVisible(false);
    form.resetFields();
  };
  const handleFormChange = (changedValues) => {
    setFormStep(prev => ({
        ...prev,
        ...changedValues,
      }));
    console.log('Changed values:', changedValues);
    // You can also perform any additional logic here based on the changed values
  };
  const handleOperationChange = (newValues: any[]) => {
    if(newValues.length ===0) {
      setOperation("");
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].operation;
      const description = newValues[0].description;
      const version = newValues[0].revision;
      form.setFieldsValue({operationDescription:description,operationVersion:version});
    
      localStorage.setItem('revsion', newValues[0].revision);
      setOperation(newValue);
      setOperationVersion(version);
     
    }
  };

  const onChangeComponent = (newValues) => {
    // Check if the value array is empty

    if(newValues.length ===0) {
      setOperation("");
    }
    if (newValues.length > 0) {
    let operationId = newValues[0].operation;
     setOperation(operationId);
    }
    
  
  };
  const uiOperation: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Operation',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'api/rits/',
    tabledataApi: "operation-service"
  };
console.log(operation,"operation");
  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        <Button onClick={handleAddStep}>{t('insert')}</Button>
      </Space>

      <Table
        rowKey="operationId"
        columns={stepColumns}
        size='small'
        dataSource={steps}
        bordered={true}
        onRow={(record) => ({
          style: { fontSize: '13.5px' },
          onClick: (event) => {
            const target = event.target as Element;
            if (!target.closest('.delete-button')) {
              handleEditStep(record);
              setOperation(record.operationId)
              setOperationVersion(record.operationVersion)
            }
          },
        })}
        // pagination={{ pageSize: 5 }}
        pagination={false}
        scroll={{ y: 'calc(100vh - 470px)' }}
        loading={{
          spinning: !steps,
          tip: 'Loading data...'
      }}
      />

      <Drawer
        title={editStepMode ? "Edit Operation" : "Add New Operation"}
        open={isStepModalVisible}
        width={'60%'}
        onClose={handleModalCancelStep}
        maskClosable={false}
        keyboard={false}
        extra={
          <Space>
            <Button type="primary" onClick={handleModalOkStep}>{editStepMode && editingStep ? t('save') : t('create')}</Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab={t('main')} key="1">
            <Form form={form} layout="horizontal" style={{ width: '60%' }}
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 14 }}
              onValuesChange={handleFormChange}
              >
              
              <Form.Item name="operationId" label={t('operation')} >
                <DynamicBrowse 
                  uiConfig={uiOperation} 
                  initial={operation} 
                  onSelectionChange={handleOperationChange} 
                  setOnChangeValue={onChangeComponent}
                />
              </Form.Item>
              <Form.Item 
                name="operationVersion" 
                label={t('version')}
              >
                <Input />
              </Form.Item>
              <Form.Item 
                name="operationDescription" 
                label={t('description')}
              >
                <Input />
              </Form.Item>
              <Form.Item name="instruction" label={t('instruction')}
               
              >
                <Input />
              </Form.Item>
              <Form.Item name="sequence" label={t('sequence')}>
                <InputNumber disabled min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="type" label={t('type')} rules={[{ required: true, message: 'Please select the Operation type!' }]}>
                {/* <Select placeholder="Select step type" >
                  <Option value="parallel">Parallel</Option>
                  <Option value="sequential">Sequential</Option>
                  <Option value="conditional">Conditional</Option>
                </Select> */}
                <Input readOnly value={stepType} placeholder="Step Type" disabled={true}/>
              </Form.Item>
              <Form.Item name="expectedCycleTime" label={t('expectedCycleTime')}>
                <Input />
              </Form.Item>
              <Form.Item name="ccp" label={t('ccp')}>
                <Switch />
              </Form.Item>
              <Form.Item name="tools" label={t('tools')}>
                <Select mode="multiple">
                  <Option value="Wrench">Wrench</Option>
                  <Option value="Screwdriver">Screwdriver</Option>
                  <Option value="Drill">Drill</Option>
                </Select>
              </Form.Item>
              <Form.Item name="entryOperation" label={t('entryOperation')}>
                <Switch />
              </Form.Item>
              <Form.Item name="lastOperationAtPhase" label={t('lastOperationAtPhase')}>
                <Switch />
              </Form.Item>
              <Form.Item name="nextOperations" label={t('Next Operation')} >
               <Input />
              </Form.Item>
            </Form>
          </TabPane>
          {/* <TabPane tab={t('ingredients')} key="2">
            <OperationIngredients stepArray={formStep} setStep={setFormStep} operationId={operationId} />
          </TabPane> */}
          <TabPane tab={t('resources')} key="3">
            <ResourceTable stepArray={formStep} setStep={setFormStep} operationId={operationId} />
          </TabPane>
          <TabPane tab={t('dataCollection')} key="4">
            <DataCollectionTable stepArray={formStep} setStep={setFormStep}/>
          </TabPane>
          <TabPane tab={t('qualityControlParameters')} key="5">
            <QualityControlParameters stepArray={formStep} setStep={setFormStep}/>
          </TabPane>
          <TabPane tab={t('adjustments')} key="6">
            <AdjustmentTable stepArray={formStep} setStep={setFormStep}/>
          </TabPane>
        </Tabs>
      </Drawer>
    </div>
  );
};

export default StepManagementTable;

