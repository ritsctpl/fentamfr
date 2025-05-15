// components/IngredientInactive.tsx

import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Form, Input, Select, Row, Col, Space, message, Modal } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { OperationContext } from '../hooks/recipeContext';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import AIngredientsTable from './AlternateIngredients';
import { useTranslation } from 'react-i18next';
import QcParameterInactive from './QcParameterInactive';
import { parseCookies } from 'nookies';
import { addIngredients, updateIngredient, deleteIngredient, retrieveRouting } from '@services/recipeServices';
import { v4 as uuidv4 } from 'uuid';
import { DeleteOutlined } from '@ant-design/icons';
import IngredientsTableInactive from './AlternateIngredientsInactive';
import { DynamicBrowse } from '@components/BrowseComponent';

const { Option } = Select;

const cookies = parseCookies();
const site = cookies.site;
const userId = cookies.rl_user_id;

interface IngredientTableProps {
    tabName: string;
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

const IngredientInactive: React.FC<IngredientTableProps> = ({ tabName }) => {
    const { setIsHeaderShow, setIsTableShowInActive, isFullScreen, setIsFullScreen, formData, setFormData,setIsTableShow } = useContext(OperationContext);
    const [data, setData] = useState(formData?.ingredients?.[tabName] || []);
    const [formVisible, setFormVisible] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('1');
    const [ingredientIdd, setIngredientIdd] = useState<string>(null);
    const [qcParameter, setQcParameter] = useState([]);
    const [sequence, setSequence] = useState<string>('1');
    const [alternateIngredients, setAlternateIngredients] = useState([]);
    const [item, setItem] = useState<string>('');
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useEffect(() => {
        setData(formData?.ingredients?.[tabName] || []);
    }, [formData]);

    const newSequence = (data.length + 1) * 10; 
    const handleFinish = async () => {
        const values = form.getFieldsValue();
        const newIngredient = {
            ingredientId: selectedIngredient ? selectedIngredient.ingredientId : `ING${uuidv4().split('-').join('').slice(0, 8)}`,
            ...values,
            byProduct: {
                byProductId: `BY${data.length + 1}`,
                description: values.byProductDescription,
                expectedQuantity: values.byProductQuantity,
                uom: values.byProductUOM,
                handlingProcedure: values.byProductHandling,
            },
            hazardous: values.hazardous === "true",
            alternateIngredients: alternateIngredients,
            qcParameters: qcParameter
        };

        if (selectedIngredient) {
            const updatedData = data.map((item) =>
                item.ingredientId === selectedIngredient.ingredientId ? newIngredient : item
            );
            

            const params = { 
                site, 
                recipeId: formData.recipeId, 
                recipeName: formData.recipeName,
                user: userId, 
                version: formData.version, 
                ingreSequence:sequence,
                ingredientId: item, 
                ingredientType: "inactive", 
                parentIngredient:  { ...newIngredient, ingredientId: item, qcParameters: qcParameter ,alternateIngredients:alternateIngredients},
            };

            try {
                const res = await updateIngredient(params);
                if (res.errorCode || res.message_details.msg_type === 'E') {
                    message.error(res.message || res.message_details.msg);
                    return;
                  }
                message.success(res.message_details.msg);
                setData(updatedData);
            setFormData((prevFormData) => ({
                ...prevFormData,
                ingredients: {
                    ...prevFormData.ingredients,
                    [tabName]: updatedData,
                },
            }));
                const recipeData = await retrieveRouting(site, formData.recipeName, formData.recipeId ,userId,formData.version); // Call the fetchShiftAll API with the site and shiftName as parameters
    
            setFormData(recipeData);
            } catch (e) {
                message.error('Failed to update ingredient.');
            }
        } else {
           

            const params = { 
                site, 
                recipeId: formData.recipeId, 
                recipeName: formData.recipeName,
                user: userId, 
                version: formData.version, 
                ingredientId: item, 
                ingredientType: "inactive", 
                parentIngredient: { ...newIngredient, ingredientId: item, qcParameters: qcParameter ,alternateIngredients:alternateIngredients},
            };

            try {
                const res = await addIngredients(params);
                if (res.errorCode || res.message_details.msg_type === 'E') {
                    message.error(res.message || res.message_details.msg);
                    return;
                  }
                message.success(res.message_details.msg);
                setData([...data, newIngredient]);
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    ingredients: {
                        ...prevFormData.ingredients,
                        [tabName]: [...data, newIngredient],
                    },
                }));
                const recipeData = await retrieveRouting(site, formData.recipeName, formData.recipeId ,userId,formData.version); // Call the fetchShiftAll API with the site and shiftName as parameters
    
            setFormData(recipeData);
            } catch (e) {
                message.error('Failed to add ingredient.');
            }
        }

        form.resetFields();
        setFormVisible(false);
        setSelectedIngredient(null);
        setIsHeaderShow(false);
        setIsTableShowInActive(false);
        // setIsFullScreen(false);
    };

    const handleRowClick = (record: any) => {
        form.setFieldsValue({ ingredientId: record.ingredientId })
        setItem(record.ingredientId);
        setSelectedIngredient(record);
        if (record.qcParameters === null || !record.qcParameters ) {
            setQcParameter([]);
        } else {
            setQcParameter(record.qcParameters);
        }
        if (record.alternateIngredients === null || !record.alternateIngredients ) {
            setAlternateIngredients([]);
        } else {
            setAlternateIngredients(record.alternateIngredients);
        }
        form.setFieldsValue({
            ingredientId: record.ingredientId,
            ingreDescription: record.ingreDescription,
            quantity: record.quantity,
            uom: record.uom,
            materialDescription: record.materialDescription,
            ingredientVersion: record.ingredientVersion,
            storageLocation: record.storageLocation,
            sequence: record.sequence,
            tolerance: record.tolerance,
            materialType: record.materialType,
            supplierId: record.supplierId,
            sourceLocation: record.sourceLocation,
            handlingInstructions: record.handlingInstructions,
            storageInstructions: record.storageInstructions,
            unitCost: record.unitCost,
            currency: record.currency,
            totalCost: record.totalCost,
            wasteQuantity: record.wasteQuantity,
            wasteUoM: record.wasteUoM,
            byProductDescription: record.byProduct?.description,
            byProductQuantity: record.byProduct?.expectedQuantity,
            byProductUOM: record.byProduct?.uom,
            byProductHandling: record.byProduct?.handlingProcedure,
            hazardous: record.hazardous ? "true" : "false",
        });
        setFormVisible(true);
        setIsFullScreen(true);
        setIsHeaderShow(true);
        setIsTableShowInActive(true);
        setIngredientIdd(record.ingredientId);
        setSequence(record.sequence)
    };

    const handleCloseForm = () => {
        setFormVisible(false);
        setSelectedIngredient(null);
        // setIsFullScreen(false);
        setIsHeaderShow(false);
        setIsTableShowInActive(false);
        form.resetFields();
    };

  
    const handleRemove = (ingredientId: string,sequence:string) => {
        Modal.confirm({
            title: 'Confirm Removal',
            content: 'Are you sure you want to remove this ingredient?',
            onOk: async () => {
                const params = {
                    site,
                    recipeId: formData.recipeId,
                    recipeName: formData.recipeName,
                    version: formData.version,
                    user: userId,
                    ingredientId,
                    ingreSequence:sequence
                };
    
                try {
                    const res = await deleteIngredient(site,params);
                    
                    if (res.errorCode) {
                        throw new Error(res.message || 'Failed to delete ingredient.');
                    }
                    
                    else{
                        message.success(res.message_details.msg);
                        setFormVisible(false);
                        setSelectedIngredient(null);
                        // setIsFullScreen(false);
                        setIsHeaderShow(false);
                        setIsTableShowInActive(false);
                        form.resetFields();
                    }
                    
                    // Fetch the updated recipe data
                    const recipeData = await retrieveRouting(site, formData.recipeName, formData.recipeId, userId, formData.version);
                    setFormData(recipeData);
                    
                    // Update the ingredient list
                    const updatedData = data.filter(item => item.ingredientId !== ingredientId);
                    setData(updatedData);
                    
                } catch (e) {
                    message.error('Failed to delete ingredient. Please try again.');
                }
            },
            onCancel() {
                console.log('Removal canceled');
            },
        });
    };
    const columns = [
        // { title: t('name'), dataIndex: 'ingredientId', key: 'ingredientId', render: text => text || '--' },
        { title: t('name'), dataIndex: 'ingreDescription', key: 'ingreDescription', render: text => text || '--' },
        { title: t('sequence'), dataIndex: 'sequence', key: 'sequence', render: text => text || '--' },
        { title: t('qty'), dataIndex: 'quantity', key: 'quantity', render: text => text || '--' },
        {
            title: 'Action',
            key: 'action',
            width: '80px',
            render: (text: any, record: any) => (
                <Button
                onClick={(event) => {
                    event.stopPropagation(); // Prevent row click
                    handleRemove(record.ingredientId,record.sequence); // Call remove function
                  }}
                    shape="circle"
                    size="small"
                    icon={<DeleteOutlined style={{fontSize: '13px'}} />}
                />
            ),
        },
    ];
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
        <Row>
            <Col span={formVisible ? 12 : 24} style={{ transition: 'width 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{t('inactive')}</h3>
                    <Space style={{ marginBottom: 16, display: 'flex', marginRight: "20px" }}>
                        <Button  onClick={() => { setSelectedIngredient(null); setItem(""); setIsTableShowInActive(true); setAlternateIngredients([]); setQcParameter([]); setFormVisible(true); setIsFullScreen(true); form.resetFields(); form.setFieldsValue({sequence:newSequence}); setIsHeaderShow(true); }}>
                            {t('insert')}
                        </Button>
                    </Space>
                </div>
                <Table
                    dataSource={data}
                    columns={columns}
                    size='small'
                    rowKey="ingredientId"
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { fontSize: '13.5px' }
                    })}
                    // pagination={{ pageSize: 2 }}
                    style={{ width: '100%' }}
                    bordered={true}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 300px)' }}
                />
            </Col>
            {formVisible && (
                <Col span={12} style={{ padding: '0px 16px', borderLeft: '1px solid #d9d9d9', overflow: 'auto', height: '80vh', transition: 'width 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <h2>{selectedIngredient ? "Edit Ingredient" : "Add Ingredient"}</h2>
                        <Button onClick={handleCloseForm} type="link"><CloseIcon sx={{ color: '#1874CE' }}/></Button>
                    </div>
                    <TabContext value={activeTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={(event, newValue) => setActiveTab(newValue)} aria-label="lab API tabs example">
                                <Tab label={t('main')} value="1" />
                                <Tab label={t('alternateIngredients')} value="2" />
                                <Tab label={t('qcParameters')} value="3" />
                                
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                        <Form form={form} layout="horizontal" onFinish={handleFinish} style={{ width: '100%' }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                                <Form.Item name="ingredientId" label="Name" rules={[{ required: true }]}>
                                <DynamicBrowse 
                                    uiConfig={uiitem} 
                                    initial={item} 
                                    onSelectionChange={handleItemChange} 
                                    />
                                </Form.Item>
                                <Form.Item name="ingredientVersion" label="Version">
                                    <Input disabled={true}/>
                                </Form.Item>
                                <Form.Item name="ingreDescription" label="Description">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                                    <Input type="number" />
                                </Form.Item>
                                <Form.Item name="uom" label="UOM">
                                    <Select>
                                        <Option value="kg">kg</Option>
                                        <Option value="g">g</Option>
                                        <Option value="l">l</Option>
                                    </Select>
                                </Form.Item>
                                
                                <Form.Item name="sequence" label="Sequence" rules={[{ required: true }]}>
                                    <Input type="number" disabled />
                                </Form.Item>
                                {/* <Form.Item name="storageLocation" label="Storage Location" rules={[{ required: true }]}>
                                <Select>
                                        <Option value="Loction 1">Loction 1</Option>
                                        <Option value="Loction 2">Loction 2</Option>
                                        <Option value="Loction 3">Loction 3</Option>
                                    </Select>
                                </Form.Item> */}
                                <Form.Item name="tolerance" label="Tolerance">
                                    <Input type="number" />
                                </Form.Item>
                                <Form.Item name="materialType" label="Material Type">
                                <Select>
                                        <Option value="Batch Controlled">Batch Controlled</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="supplierId" label="Supplier ID">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="sourceLocation" label="Source Location">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="handlingInstructions" label="Handling Instructions">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="storageInstructions" label="Storage Instructions">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="unitCost" label="Unit Cost">
                                    <Input type="number"/>
                                </Form.Item>
                                <Form.Item name="currency" label="Currency">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="totalCost" label="Total Cost">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="wasteQuantity" label="Waste Quantity">
                                <Select>
                                        <Option value="kg">kg</Option>
                                        <Option value="g">g</Option>
                                        <Option value="l">l</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="wasteUoM" label="Waste UOM">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="byProductDescription" label="By-Product Description">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="hazardous" label="Hazardous">
                                    <Select>
                                        <Option value="true">Yes</Option>
                                        <Option value="false">No</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
                                    <Button type="primary" onClick={handleFinish}>
                                        {selectedIngredient ? t('save') : t('create')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPanel>
                        <TabPanel value="2">
                            <IngredientsTableInactive selectedIngredient={selectedIngredient} qcParameter={alternateIngredients} setQcParameter={setAlternateIngredients}/>
                        </TabPanel>
                        <TabPanel value="3">
                            <QcParameterInactive selectedIngredient={selectedIngredient} qcParameter={qcParameter} setQcParameter={setQcParameter}  />
                        </TabPanel>
                        
                    </TabContext>
                    
                </Col>
            )}
        </Row>
    );
};

export default IngredientInactive;
