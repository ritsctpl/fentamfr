// components/IngredientTable.tsx

import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Form, Input, Select, Row, Col, Space, message, Modal } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { OperationContext } from '../hooks/recipeContext';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import AIngredientsTable from './AlternateIngredients';
import QcParameterTable from './QcParameter';
import { parseCookies } from 'nookies';
import { addIngredients, deleteIngredient, retrieveRouting, updateIngredient } from '@services/recipeServices';
import { DeleteOutlined } from '@ant-design/icons';
import { DynamicBrowse } from '@components/BrowseComponent';

const { Option } = Select;

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

const IngredientTable: React.FC<IngredientTableProps> = ({ tabName }) => {
    const { setIsHeaderShow, setIsTableShow, isFullScreen, setIsFullScreen, formData, setFormData } = useContext(OperationContext);
    const [data, setData] = useState(formData?.ingredients?.[tabName] || []);
    const [formVisible, setFormVisible] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('1');
    const [ingredientIdd, setIngredientIdd] = useState<string>('1');
    const [sequence, setSequence] = useState<string>('1');
    const [qcParameter, setQcParameter] = useState([]);
    const [alternateIngredients, setAlternateIngredients] = useState([]);
    const [item, setItem] = useState<string>('');
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useEffect(() => {
        setData(formData?.ingredients?.[tabName] || []);
    }, [formData]);

    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    const newSequence = (data.length + 1) * 10; 
    const handleFinish = async () => {
        const values = form.getFieldsValue();
        console.log(values, "valuesl");

        // Generate sequence in increments of 10 // Auto-generate ingredientId

        if (selectedIngredient) {
            const newIngredient = {
                // ingredientId: selectedIngredient ? selectedIngredient.ingredientId : `ING${data.length + 1}`,
                ...values,
                byProduct: {
                    byProductId: `BY${data.length + 1}`,
                    description: values.byProductDescription,
                    expectedQuantity: values.byProductQuantity,
                    uom: values.byProductUOM,
                    handlingProcedure: values.byProductHandling,
                },
                hazardous: values.hazardous === "true",
                ingredientId: selectedIngredient.ingredientId, // Keep the existing ingredientId for updates
                sequence: selectedIngredient.sequence, // Keep the existing sequence for updates
            };
            const updatedData = data.map((item) =>
                item.ingredientId === selectedIngredient.ingredientId ? newIngredient : item
            );
            
            const params = {
                site,
                recipeId: formData.recipeId,
                recipeName: formData.recipeName,
                user: userId,
                version: formData.version,
                ingredientId: item,
                ingreSequence:sequence,
                ingredientType: "active",
                parentIngredient: { ...newIngredient, ingredientId: item,qcParameters: qcParameter, alternateIngredients: alternateIngredients },
            };
            console.log(params,"params");
            
            try {
                const res = await updateIngredient(params);
                if (res.errorCode || res.message_details.msg_type === 'E') {
                    message.error(res.message || res.message_details.msg);
                    return;
                }
                message.success(res.message_details.msg);
                const recipeData = await retrieveRouting(site, formData.recipeName, formData.recipeId, userId, formData.version); // Call the fetchShiftAll API with the site and shiftName as parameters

                setFormData(recipeData);
            } catch (e) {
                console.log('Failed to add operation.');
            }
        } else {
            const newIngredient = { // Use the generated ingredientId for new ingredients
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
                qcParameters: qcParameter, // Use the generated sequence for new ingredients
            };
            
            const params = {
                site,
                recipeId: formData.recipeId,
                recipeName: formData.recipeName,
                user: userId,
                version: formData.version,
                ingredientId: item,
                ingredientType: "active",
                parentIngredient: newIngredient,
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

            const recipeData = await retrieveRouting(site, formData.recipeName, formData.recipeId, userId, formData.version); // Call the fetchShiftAll API with the site and shiftName as parameters

                setFormData(recipeData);
            } catch (e) {
                console.log('Failed to add operation.');
            }
        }

        form.resetFields();
        setFormVisible(false);
        setSelectedIngredient(null);
        setIsHeaderShow(false);
        // setIsFullScreen(false);
        setIsTableShow(false);
    };

    const handleRowClick = (record: any) => {
        form.setFieldsValue({ ingredientId: record.ingredientId })
        setItem(record.ingredientId);
        setSelectedIngredient(record);
        if (record.qcParameters === null || !record.qcParameters) {
            setQcParameter([]);
        } else {
            setQcParameter(record.qcParameters);
        }

        if (record.alternateIngredients === null || !record.alternateIngredients) {
            setAlternateIngredients([]);
        } else {
            setAlternateIngredients(record.alternateIngredients);
        }
        form.setFieldsValue({
            ingredientId: record.ingredientId,
            sequence: record.sequence,
            ingreDescription: record.ingreDescription,
            ingredientVersion: record.ingredientVersion,
            quantity: record.quantity,
            uom: record.uom,
            materialDescription: record.materialDescription,
            storageLocation: record.storageLocation,
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
        setIsTableShow(true);
        setIngredientIdd(record.ingredientId);
        setSequence(record.sequence)
    };

    const handleCloseForm = () => {
        setFormVisible(false);
        setSelectedIngredient(null);
        // setIsFullScreen(false);
        setIsHeaderShow(false);
        setIsTableShow(false);
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
                    // recipeName: formData.recipeName,
                    version: formData.version,
                    user: userId,
                    ingredientId,
                    ingreSequence:sequence
                };

                try {
                    const res = await deleteIngredient(site ,params);

                    if (res.errorCode) {
                        throw new Error(res.message || 'Failed to delete ingredient.');
                    }
                    else{
                        message.success(res.message_details.msg);
                        setFormVisible(false);
        setSelectedIngredient(null);
        // setIsFullScreen(false);
        setIsHeaderShow(false);
        setIsTableShow(false);
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
                    shape="circle"
                    size="small"
                    icon={<DeleteOutlined style={{ fontSize: '13px' }} />}
                    onClick={(event) => {
                        event.stopPropagation(); // Prevent row click
                        handleRemove(record.ingredientId, record.sequence); // Call remove function
                    }}
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
        <Row style={{paddingTop:'0pc'}}>
            <Col span={formVisible ? 12 : 24} style={{ transition: 'width 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{t('active')}</h3>
                    <Space style={{ marginBottom: 16, display: 'flex', marginRight: "20px" }}>
                        <Button onClick={() => {setSelectedIngredient(null); setItem(""); setIsTableShow(true); setAlternateIngredients([]); setQcParameter([]); setFormVisible(true); setIsFullScreen(true); form.resetFields(); form.setFieldsValue({sequence:newSequence}); setIsHeaderShow(true); }}>
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
                        <Button onClick={handleCloseForm} type="link"><CloseIcon sx={{ color: '#1874CE' }} /></Button>
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
                                    {/* <Input onChange={(e) => {
                                            // Convert to uppercase while typing
                                            const cleanValue = e.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9_]/g, ''); // Remove anything that isn't uppercase letter, number, or underscore
                                            form.setFieldsValue({ ingredientId: cleanValue }); // Set the cleaned value back to the form
                                        }}
                                    /> */}
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
                                <Form.Item name="sequence" label="Sequence" rules={[{ required: true }]}>
                                    <Input type="number" disabled />
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
                                {/* <Form.Item name="storageLocation" label="Storage Location" rules={[{ required: true }]}>
                                    <Select>
                                        <Option value="Location 1">Location 1</Option>
                                        <Option value="Location 2">Location 2</Option>
                                        <Option value="Location 3">Location 3</Option>
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
                                    <Input type="number" />
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
                            <AIngredientsTable selectedIngredient={selectedIngredient} qcParameter={alternateIngredients} setQcParameter={setAlternateIngredients} />
                        </TabPanel>
                        <TabPanel value="3">
                            <QcParameterTable selectedIngredient={selectedIngredient} qcParameter={qcParameter} setQcParameter={setQcParameter} />
                        </TabPanel>
                        
                    </TabContext>

                </Col>
            )}
        </Row>
    );
};

export default IngredientTable;
