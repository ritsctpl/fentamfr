import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Space, Modal, Form, Input, InputNumber, message, Tabs, Drawer, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { parseCookies } from 'nookies';
import { addPhaseIngredient, deletePhaseIngredient, getPhaseIngredients, updatePhaseIngredient } from '@services/recipeServices';
import { OperationContext } from '../hooks/recipeContext';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined } from '@ant-design/icons';
import { DynamicBrowse } from '@components/BrowseComponent';
import QcParameterTable from './QcParameter';
import AIngredientsTable from './AlternateIngredients';

interface Ingredient {
  ingredientId: string;
  ingredientName: string;
  ingredientVersion: string;
  operationId: string;
  operationVersion: string;
  ingreDescription: string;
  quantity: number;
  sequence: number;
  associatedOp: string;
  uom: string;
  qcParameters: any;
  alternateIngredients: any;
}

interface PhasesIngredientsProps {
  phasesId: string;
  sequence: any;
}
function validateIngredientName(name: string) {
  return /^[A-Z0-9_]+$/.test(name);
}

const { TabPane } = Tabs;

const PhasesIngredients: React.FC<PhasesIngredientsProps> = ({ phasesId, sequence }) => {
  const { t } = useTranslation();
  const { formData } = useContext(OperationContext);
  const [activeIngredients, setActiveIngredients] = useState<Ingredient[]>([]);
  const [inactiveIngredients, setInactiveIngredients] = useState<Ingredient[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('');
  const [activeTabb, setActiveTabb] = useState("1");
  const [operation, setOperation] = useState<any>(null);
  const [qcParameter, setQcParameter] = useState<any>([]);
  const [item, setItem] = useState<string>('');
  const [alternateIngredients, setAlternateIngredients] = useState<any>([]);
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
  const uiitem: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Ingredient',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'api/rits/',
    tabledataApi: "item-service"
  };
  const handleOperationChange = (newValues: any[]) => {
    console.log(newValues, 'newValues');
    if(newValues.length ===0) {
      setOperation("");
    }
    if (newValues.length > 0) {
      
      const newValue = newValues[0].operation;
      const version = newValues[0].revision;
      form.setFieldsValue({operationVersion:version});
      
      setOperation(newValue);
     
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
  const columns: ColumnsType<Ingredient> = [
    // { 
    //   title: t('name'), 
    //   dataIndex: 'ingredientId', 
    //   key: 'ingredientId',
    //   width: '30%',
    //   render: text => text || '--'
    // },
    { 
      title: t('name'), 
      dataIndex: 'ingreDescription', 
      key: 'ingreDescription',
      width: '30%',
      render: text => text || '--'
    },
    { 
      title: t('qty'), 
      dataIndex: 'quantity', 
      key: 'quantity',
      width: '20%',
      render: text => text || '--'
    },
    // { 
    //   title: t('sequence'), 
    //   dataIndex: 'sequence', 
    //   key: 'sequence',
    //   render: text => text || '--'
    // },
    // { title: t('associatedOp'), dataIndex: 'associatedOp', key: 'associatedOp' },
    {
      title: t('actions'),
      width: '15%',
      render: (_, record) => (
        <Button
          shape="circle"
          icon={<DeleteOutlined style={{fontSize: '13px'}} />}
          size="small"
          onClick={(event) => {
            event.stopPropagation(); // Prevent row click
            handleRemove(record.ingredientId , 'active',record.operationId,record.operationVersion); // Call remove function
          }}
        />
      ),
    },
  ];

  const handleInsert = (type: string) => {
    setActiveTab(type);
    setEditMode(false);
    setEditingIngredient(null);
    form.resetFields();
    setOperation("");
    if(type==="active"){
    const sequence = activeIngredients.length > 0 
      ? Math.max(...activeIngredients.map(ing => ing.sequence || 0)) + 10 
      : 10;
    form.setFieldsValue({ sequence: sequence });
    }
    else{
      const sequence = inactiveIngredients.length > 0 
      ? Math.max(...inactiveIngredients.map(ing => ing.sequence || 0)) + 10 
      : 10;
    form.setFieldsValue({ sequence: sequence });
    }
  
    // Generate a new ingredientId and set it in the form
    // You can add logic here to differentiate between active and inactive if needed

    setDrawerVisible(true);
  };
  

  const cookies = parseCookies();
  const site = cookies.site;
  const userId = cookies.rl_user_id;

  const handleModalOkStep = async () => {
    const params = {
      recipeId: formData.recipeId,
      recipeName: formData.recipeName,
      phaseId: phasesId,
      phaseSequence: sequence,
      version: formData.version,
      user: userId,
    };
    try {
      const response = await getPhaseIngredients(site, params);
      console.log(response,'responsegetPhaseIngredients');
      setActiveIngredients(response?.phasesIngredients?.active || []);
      setInactiveIngredients(response?.phasesIngredients?.inactive || []);
    } catch (error) {
      message.error('Failed to fetch ingredients. Please try again.');
    }
  };

  useEffect(() => {
    handleModalOkStep();

  }, [formData.phases]);

  const handleEdit = (record: Ingredient) => {
    setEditMode(true);
    setEditingIngredient(record);
    form.setFieldsValue({ ...record });
    setDrawerVisible(true);
  };

  const handleRemove = (ingredientId: string, type: string,operationId:string,version:string) => {
    Modal.confirm({
      title: 'Confirm Removal',
      content: 'Are you sure you want to remove this ingredient?',
      onOk: async () => {
        const updatedIngredients = activeIngredients.filter(item => item.ingredientId !== ingredientId);
        setActiveIngredients(updatedIngredients);
  
        const params = {
          site: site,
          recipeId: formData.recipeId,
          recipeName: formData.recipeName,
          user: userId,
          phaseId: phasesId,
          phaseSequence: sequence,
          version: formData.version,
          ingredientType: type,
          ingredientId,
          operationId: operationId,
          opVersion: version,
          IngreSequence: sequence,
        };
  
        try {
          const response = await deletePhaseIngredient(params); // Call your API to delete
          if (response.errorCode || response.message_details.msg_type === 'E') {
            message.error(response.message || response.message_details.msg);
            return;
          } else {
            message.success(response.message_details.msg);
            handleModalOkStep();
          }
        } catch (error) {
          message.error('Failed to delete ingredient. Please try again.');
        }
      },
      onCancel() {
        // Optionally handle cancellation
        console.log('Removal canceled');
      },
    });
  };
  

  const addPhaseIngredients = async (updatedData, ingredientType: string) => {
    let newDataa = {
      ...updatedData[0],
      alternateIngredients: alternateIngredients,
      qcParameters: qcParameter || []
    }
    let newData = [newDataa]
    const param = {
      recipeId: formData.recipeId,
      recipeName: formData.recipeName,
      user: userId,
      phaseId: phasesId,
      phaseSequence: sequence,
      version: formData.version,
      ingredientId: updatedData[0].ingredientId,
      ingredientName: updatedData[0].ingredientName,
      ingreSequence: updatedData[0].sequence,
      operationId: operation,
      opVersion: formData.version,
      parentIngredient: newData[0],
      ingredientType: ingredientType,
      
    };
    
    try {
      const res = await addPhaseIngredient(site, param);
      if (res.errorCode || res.message_details.msg_type === 'E') {
        message.error(res.message || res.message_details.msg);
        return;
      }
      message.success(res.message_details.msg);
    } catch (error) {
      message.error('Failed to update phase. Please try again.');
    }
  };

  const updatePhaseIngredients = async (updatedData, ingredientType: string) => {
    console.log(ingredientType, 'updatedData');
    let newDataa = {
      ...updatedData[0],
      alternateIngredients: alternateIngredients,
      qcParameters: qcParameter || []
    }
    let newData = [newDataa]
    const param = {
      
      recipeId: formData.recipeId,
      recipeName: formData.recipeName,
      user: userId,
      phaseId: phasesId,
      phaseSequence: sequence,
      version: formData.version,
      ingredientId: updatedData[0].ingredientId,
      ingreSequence: updatedData[0].sequence,
      operationId: operation,
      opVersion: formData.version,
      parentIngredient: newData[0],
      ingredientType: ingredientType,
    };
    console.log(newData, 'paramIngredientdsd');
    try {
      const res = await updatePhaseIngredient(site, param);
      if (res.errorCode || res.message_details.msg_type === 'E') {
        message.error(res.message || res.message_details.msg);
        return;
      }
      message.success(res.message_details.msg);
    } catch (error) {
      message.error('Failed to update phase. Please try again.');
    }
  };



  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        const newIngredient: Ingredient = {
          ...values,
          operationId:operation,
        };
        if (editMode && editingIngredient) {
          let updatedIngredients;
          if(activeTab==="active"){
          updatedIngredients = activeIngredients.map(ingredient =>
            ingredient.ingredientId === editingIngredient.ingredientId
              ? { ...editingIngredient, ...values }
              : ingredient
          );}
          else{
            updatedIngredients = inactiveIngredients.map(ingredient =>
              ingredient.ingredientId === editingIngredient.ingredientId
                ? { ...editingIngredient, ...values }
                : ingredient
            );
          }
          
          updatePhaseIngredients(updatedIngredients, activeTab);
          if(activeTab==="active"){
            setActiveIngredients(updatedIngredients);
          }
          else{
            setInactiveIngredients(updatedIngredients);
          }
        } else {
          let updatedIngredients;
          if(activeTab==="active"){
            updatedIngredients = [...activeIngredients, newIngredient];
          }
          else{
            updatedIngredients = [...inactiveIngredients, newIngredient];
          }
          
          addPhaseIngredients([newIngredient], activeTab);
          if(activeTab==="active"){
            setActiveIngredients(updatedIngredients);
          }
          else{
            setInactiveIngredients(updatedIngredients);
          } 
        }

        form.resetFields();
        setDrawerVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // const handleModalOkInactive = () => {
  //   console.log('handleModalOkInactive');
  //   form.validateFields()
  //     .then(values => {
  //       const newIngredient: Ingredient = {
  //         ...values,
  //         operationId:operation,
  //       };
  //       if (editMode && editingIngredient) {
  //         const updatedIngredients = activeIngredients.map(ingredient =>
  //           ingredient.ingredientId === editingIngredient.ingredientId
  //             ? { ...editingIngredient, ...values }
  //             : ingredient
  //         );
  //         setActiveIngredients(updatedIngredients);
  //         updatePhaseIngredients(updatedIngredients, activeTab==="1" ? "active" : "inactive");
  //       } else {
  //         const updatedIngredients = [...activeIngredients, newIngredient];
  //         setActiveIngredients(updatedIngredients);
  //         addPhaseIngredients([newIngredient], activeTab==="1" ? "active" : "inactive");
  //       }

  //       form.resetFields();
  //       setDrawerVisible(false);
  //     })
  //     .catch(info => {
  //       console.log('Validate Failed:', info);
  //     });
  // };

  const handleDrawerCancel = () => {
    setDrawerVisible(false);
    form.resetFields();
  };
  console.log(activeTab, 'activeTab');

  const handleRowClick = (record: Ingredient ,type: string) => {
    setItem(record?.ingredientId);
    setOperation(record?.operationId);
    if (record?.qcParameters === null || !record?.qcParameters) {
      setQcParameter([]);
  } else {
      setQcParameter(record?.qcParameters);
  }
  if (record?.alternateIngredients === null || !record?.alternateIngredients) {
    setAlternateIngredients([]);
} else {
    setAlternateIngredients(record?.alternateIngredients);
}
    setEditMode(true);
    setEditingIngredient(record);
    setActiveTab(type);
    form.setFieldsValue({ ...record });
    setDrawerVisible(true);
  };

  const handleTabChange = (key: string) => {
    setActiveTabb(key);
  };

console.log(qcParameter, 'qcParametercc');
  const handleItemChange = (newValues: any[]) => {
    if(newValues.length ===0) {
      setItem("");
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].item;

       const description = newValues[0].description;
       const version = newValues[0].revision;
          form.setFieldsValue({ingreDescription:description,ingredientVersion:version,ingredientId:newValue});

      setItem(newValue);
    }
  };
  return (
    <div style={{padding:0}}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        <Button onClick={() => {
          handleInsert("active");
          setAlternateIngredients([]);
          setQcParameter([]);
          setItem("");
        }}>{t('insert')} {t('active')}</Button>
        <Button onClick={() => {
          handleInsert("inactive");
          setAlternateIngredients([]);
          setQcParameter([]);
          setItem("");
        }}>{t('insert')} {t('inactive')}</Button>
      </Space>

      <h3>{t('active')} {t('ingredients')}</h3>
      <Table
        rowKey="ingredientId"
        columns={columns}
        dataSource={activeIngredients}
        pagination={false}
        scroll={{ y: 'calc(100vh - 300px)' }}
        style={{ marginTop: 16 }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record ,'active'),
        })}
      />

      <h3>{t('inactive')} {t('ingredients')}</h3>
      <Table
        rowKey="ingredientId"
        columns={[
          // { title: t('name'), dataIndex: 'ingredientId', key: 'ingredientId', width: '30%', render: text => text || '--' },
          { title: t('name'), dataIndex: 'ingreDescription', key: 'ingreDescription', width: '30%', render: text => text || '--' },
          { title: t('qty'), dataIndex: 'quantity', key: 'quantity', width: '20%', render: text => text || '--' },
          // { title: t('uom'), dataIndex: 'uom', key: 'uom', render: text => text || '--' },
          {
            title: t('actions'),
            width: '15%',
            render: (_, record) => (
              <Button
                shape="circle"
                icon={<DeleteOutlined style={{fontSize: '13px'}} />}
                size="small"
                onClick={(event) => {
                  event.stopPropagation(); // Prevent row click
                  handleRemove(record.ingredientId ,'inactive',record.operationId,record.operationVersion); // Call remove function
                }}
              />
            ),
          },
          // Add more columns as needed
        ]}
        pagination={false}
                    scroll={{ y: 'calc(100vh - 300px)' }}
        dataSource={inactiveIngredients} // Assuming inactiveIngredients is the data source
        size='small'
        style={{ marginTop: 16 }} // Add some margin for spacing
        onRow={(record) => ({
          onClick: () => handleRowClick(record ,'inactive'),
          style: { fontSize: '13.5px' }
        })}
      />

      <Drawer
        visible={drawerVisible}
        onClose={handleDrawerCancel}
        footer={null}
        width={700}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{editMode ? "Edit Ingredient" : "Add New Ingredient"}</span>
            <Button type="primary" onClick={handleModalOk}>
              {editMode && editingIngredient ? t('save') : t('create')}
            </Button>
          </div>
        }
      >
        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane tab="Main" key="1">
            <Form form={form} layout="horizontal" labelCol={{ span: 7 }} wrapperCol={{ span: 14 }}>
              <Form.Item name="ingredientId" hidden={true} label={t('ingredientId')}>
                <Input disabled />
              </Form.Item>
              <Form.Item 
                name="ingredientId" 
                label={t('name')} 
                rules={[{ required: true, message: 'Please input the ingredient name!' }]}
              >
                {/* <Input 
                  onChange={(e) => {
                    const cleanValue = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9_]/g, '');
                    form.setFieldsValue({ ingredientId: cleanValue });
                  }}
                /> */}
                <DynamicBrowse 
                  uiConfig={uiitem} 
                  initial={item} 
                  onSelectionChange={handleItemChange} 
                  />
              </Form.Item>
              <Form.Item name="ingredientVersion" label="Ingredient Version">
                <Input disabled={true}/>
              </Form.Item>
              <Form.Item 
                name="ingreDescription" 
                label={t('description')} 
              >
                <Input />
              </Form.Item>
              <Form.Item name="operationId" label={t('operation')} >
              <DynamicBrowse 
                  uiConfig={uiOperation} 
                  initial={operation} 
                  onSelectionChange={handleOperationChange} 
                  setOnChangeValue={onChangeComponent}
                />
              </Form.Item>
              <Form.Item name="operationVersion" label="Operation Version">
                <Input disabled={true}/>
              </Form.Item>
              <Form.Item name="quantity" label={t('qty')} rules={[{ required: true, message: 'Please input the quantity!' }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="uom" label={t('uom')}>
                <Input />
              </Form.Item>
              <Form.Item name="sequence" label={t('sequence')} rules={[{ required: true, message: 'Please input the sequence!' }]}><Input readOnly disabled={true} /></Form.Item>
              <Form.Item name="storageLocation" label={t('storageLocation')}>
                <Input />
              </Form.Item>
              <Form.Item name="tolerance" label={t('tolerance')}>
                <Input />
              </Form.Item>
              <Form.Item name="materialType" label={t('materialType')}>
                <Input />
              </Form.Item>
              <Form.Item name="supplierId" label={t('supplierId')}>
                <Input />
              </Form.Item>
              <Form.Item name="sourceLocation" label={t('sourceLocation')}>
                <Input />
              </Form.Item>
              <Form.Item name="handlingInstructions" label={t('handlingInstructions')}>
                <Input />
              </Form.Item>
              <Form.Item name="storageInstructions" label={t('storageInstructions')}>
                <Input />
              </Form.Item>
              <Form.Item name="unitCost" label={t('unitCost')}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="currency" label={t('currency')}>
                <Input />
              </Form.Item>
              <Form.Item name="totalCost" label={t('totalCost')}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="wasteQuantity" label={t('wasteQuantity')}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="wasteUoM" label={t('wasteUoM')}>
                <Input />
              </Form.Item>
              {/* <Form.Item name="byProductDescription" label={t('byProductDescription')}>
                <Input />
              </Form.Item>
              <Form.Item name="byProductQuantity" label={t('byProductQuantity')}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="byProductUOM" label={t('byProductUOM')}>
                <Input />
              </Form.Item>
              <Form.Item name="byProductHandling" label={t('byProductHandling')}>
                <Input />
              </Form.Item> */}
              <Form.Item name="hazardous" label={t('hazardous')}>
                <Switch />
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="QC Parameter" key="2">
            <QcParameterTable selectedIngredient={null} qcParameter={qcParameter} setQcParameter={setQcParameter} />
          </TabPane>
          <TabPane tab="Alternate Ingredients" key="3">
          <AIngredientsTable selectedIngredient={null} qcParameter={alternateIngredients} setQcParameter={setAlternateIngredients} />
          </TabPane>
        </Tabs>
      </Drawer>
    </div>
  );
};

export default PhasesIngredients;
