import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Space, Drawer, Form, Input, InputNumber, DatePicker, message, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Moment } from 'moment';
import moment from 'moment';
import { OperationContext } from '../hooks/recipeContext';
import { useTranslation } from 'react-i18next';
import { DynamicBrowse } from '@components/BrowseComponent';

interface QcParameterTableProps {
  selectedIngredient: { qcParameters: [] }; // The ingredient object containing QC parameters
  setQcParameter: any;
  qcParameter: any;
}

interface QCParameter {
  parameter: string;
  value: string;
  tolerance: string;
}

interface Ingredient {
  ingredientId: string;
  name: string;
  quantity: number;
  uom: string;
  tolerance: string;
  materialDescription: string;
  storageLocation: string;
  materialType: string;
  batchNumber: string;
  expiryDate: string;
  manufactureDate: string;
  qcParameters: QCParameter[];
  unitCost: string;
  totalCost: string;
}

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

const IngredientsTableInactive: React.FC<QcParameterTableProps> = ({ selectedIngredient, setQcParameter, qcParameter }) => {
  const { t } = useTranslation();
  const { setFormData, formData } = useContext(OperationContext);
  const [ingredients, setIngredients] = useState<Ingredient[]>(qcParameter || []); // Use qcParameter initially
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [item, setItem] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    setIngredients(qcParameter); // Sync ingredients with qcParameter whenever it changes
  }, [qcParameter]);

  const columns: ColumnsType<Ingredient> = [
    { title: "Name", dataIndex: "ingredientId", key: "ingredientId" },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'UOM', dataIndex: 'uom', key: 'uom' },
    { title: 'Unit Cost', dataIndex: 'unitCost', key: 'unitCost' },
    { title: 'Total Cost', dataIndex: 'totalCost', key: 'totalCost' },
  ];

  const handleInsert = () => {
    setItem("");
    setEditMode(false);
    setEditingIngredient(null);
    form.resetFields();

    setIsModalVisible(true);
    const sequenceNumber = (ingredients?.length || 0) * 10 + 10;
    form.setFieldsValue({
      sequence: sequenceNumber
    });
  };

  const handleEdit = (record: Ingredient) => {
    form.setFieldsValue({ ingredientId: record.ingredientId })
    setItem(record.ingredientId);
    setEditMode(true);
    setEditingIngredient(record);
    form.setFieldsValue({
      ...record,
      expiryDate: moment(record.expiryDate),
      manufactureDate: moment(record.manufactureDate),
    });
    setIsModalVisible(true);
  };

  const handleRemoveAll = () => {
    setIngredients([]);
    setQcParameter([]); // Clear qcParameter as well
  };

  const handleRemoveSelected = () => {
    const newIngredients = ingredients.filter(item => !selectedRowKeys.includes(item.ingredientId));
    setIngredients(newIngredients);
    setQcParameter(newIngredients); // Update qcParameter
    setSelectedRowKeys([]);
  };

  const handleModalOk = () => {
    const values = form.getFieldsValue();
    
    const formattedValues = {
      ...values,
      expiryDate: values.expiryDate ? values.expiryDate.format("YYYY-MM-DD") : null,
      manufactureDate: values.manufactureDate ? values.manufactureDate.format("YYYY-MM-DD") : null,
      totalCost: values.quantity && values.unitCost ? 
        (values.quantity * parseFloat(values.unitCost)).toFixed(2) : "0.00",
    };

    if (editMode && editingIngredient) {
      const updatedIngredients = ingredients.map((ingredient) =>
        ingredient.ingredientId === editingIngredient.ingredientId
          ? { ...editingIngredient, ...formattedValues }
          : ingredient
      );
      setIngredients(updatedIngredients);
      setQcParameter(updatedIngredients); // Update qcParameter
      // message.success("Ingredient updated successfully");
    } else {
      const newIngredient: Ingredient = {
        ...formattedValues,
        ingredientId: `ID${Date.now()}`, // Unique ID
        qcParameters: [],
      };
      const newIngredients = [...ingredients, newIngredient];
      setIngredients(newIngredients);
      setQcParameter(newIngredients); // Update qcParameter
      // message.success("Ingredient added successfully");
    }

    // setFormData((prevFormData) => ({
    //   ...prevFormData,
    //   ingredients: {
    //     ...prevFormData.ingredients,
    //     active: [...ingredients, formattedValues],
    //   },
    // }));

    form.resetFields();
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const handleItemChange = (newValues: any[]) => {
    if(newValues.length ===0) {
      setItem("");
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].item;
      const description = newValues[0].description; 
      const version = newValues[0].revision;
      form.setFieldsValue({ingreDescription:description,version:version,ingredientId:newValue});
      setItem(newValue);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        <Button onClick={handleInsert}>{t('insert')}</Button>
        <Popconfirm title="Are you sure you want to remove all ingredients?" onConfirm={handleRemoveAll}>
          <Button>{t('removeAll')}</Button>
        </Popconfirm>
        <Button type="default" onClick={handleRemoveSelected} disabled={selectedRowKeys.length === 0}>
          {t('removeSelected')}
        </Button>
      </Space>

      <Table
        rowKey="ingredientId"
        bordered={true}
        size='small'
        rowSelection={rowSelection}
        columns={columns}
        dataSource={ingredients}
        onRow={(record) => ({
          onClick: () => handleEdit(record),
          style: { fontSize: '13.5px' }
        })}
        pagination={false}
        scroll={{ y: 'calc(100vh - 470px)' }}
      />

      <Drawer
        title={editMode ? "Edit Ingredient" : "Add New Ingredient"}
        visible={isModalVisible}
        width={900}
        onClose={handleModalCancel}
        extra={
          <Space>
            <Button type="primary" onClick={handleModalOk}>{editMode && editingIngredient ? t('save') : t('create')}</Button>
          </Space>
        }
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
        <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ingredientId"
                label="Ingredient Name"
                rules={[
                  {
                    required: true,
                    message: "Please input the ingredient name!",
                  },
                ]}
              >
                <DynamicBrowse 
                  uiConfig={uiitem} 
                  initial={item} 
                  onSelectionChange={handleItemChange} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="Version"
                rules={[
                  {
                    required: true,
                    message: "Please input the version!",
                  },
                ]}
              >
                <Input disabled={true}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sequence"
                label="Sequence"
                rules={[
                  { required: true, message: "Please input the sequence!" },
                ]}
              >
                <InputNumber min={1} disabled={true} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[
                  { required: true, message: "Please input the quantity!" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="uom" label="UOM">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tolerance" label="Tolerance">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="materialDescription" label="Material Description">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="storageLocation" label="Storage Location">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="materialType" label="Material Type">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="batchNumber" label="Batch Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
          <Col span={12}>
              <Form.Item
                name="manufactureDate"
                label="Manufacture Date"
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Expiry Date"
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }}/>
              </Form.Item>
            </Col>
            
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitCost"
                label="Unit Cost"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
        
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default IngredientsTableInactive;
