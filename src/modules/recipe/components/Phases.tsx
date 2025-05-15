// components/IngredientTable.tsx

import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Form, Input, Row, Col, Space, message, Modal, Switch } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the delete icon
import { OperationContext } from '../hooks/recipeContext';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PhasesIngredients from './PhasesIngredients';
import { addPhase, deletePhase, retrieveAllPhase, retrieveRouting, updatePhase } from '@services/recipeServices';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import StepManagementTable from './StepPhases';
import { DeleteOutlined } from '@ant-design/icons';
// Function to generate a unique phaseId
const generatePhaseId = (data: any[]) => {
    const currentIds = data.map(item => item.phaseId);
    let newId;
    let counter = 1;

    do {
        newId = `PHASE${String(counter).padStart(3, '0')}`; // Format: PHASE001
        counter++;
    } while (currentIds.includes(newId));

    return newId;
};

// Add or update the validation function
function validatePhaseName(name: string) {
    return /^[A-Z0-9_]+$/.test(name);
}

// Modify the generateSequence function
const generateSequence = (data: any[]) => {
    if (data.length === 0) return '10';
    
    const sequences = data.map(item => parseInt(item.sequence || '0', 10)).sort((a, b) => a - b);
    const lastSequence = sequences[sequences.length - 1];
    
    return String(lastSequence + 10);
};

const PhasesTab: React.FC = () => {
    const { setIsHeaderShow, setIsTableShowInActive, isFullScreen, setIsFullScreen, formData, setFormData } = useContext(OperationContext);
    const [data, setData] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('1');
    const [phasesId, setPhasesId] = useState<string>('1');
    const [sequence, setSequence] = useState<string>('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    const [entryPhase, setEntryPhase] = useState<boolean>(false);
    const [exitPhase, setExitPhase] = useState<boolean>(false);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const handleModalOkStep = async () => {
        const params = {
            recipeId: formData?.recipeId,
            recipeName: formData?.recipeName,
            version: formData?.version,
            user: userId
        };
        try {
            const response = await retrieveAllPhase(site, params);
            console.log(response);

            setData(response || []);
        } catch (error) {
            message.error('Failed to retrieve phases. Please try again.');
        }
    };

    useEffect(() => {
        handleModalOkStep();
    }, [formData, phasesId]);

    const updatePhaseFn = async (site, updatedData) => {
        const param = {
            recipeId: formData.recipeId,
            recipeName: formData.recipeName,
            user: userId,
            version: formData?.version,
            phaseId: updatedData[0].phaseId,
            phases: updatedData
        };

        try {
            const res = await updatePhase(site, param);
            handleModalOkStep();
            if (res.errorCode || res.message_details.msg_type === 'E') {
                message.error(res.message || res.message_details.msg);
                return;
            }

            // Notify the user of success
            message.success(res.message_details.msg);
            const recipeData = await retrieveRouting(site, formData.recipeName, formData.recipeId, userId, formData.version); // Call the fetchShiftAll API with the site and shiftName as parameters

            setFormData(recipeData);
        } catch (error) {
            message.error('Failed to update phase. Please try again.');
        }
    };

    const addPhaseFn = async (site, updatedData) => {
        const param = {
            recipeId: formData.recipeId,
            recipeName: formData.recipeName,
            user: userId,
            version: formData?.version,
            phaseId: updatedData.phaseId,
            phase: updatedData
        };
        console.log(param, updatePhase, "addphases");

        try {
            const res = await addPhase(site, param);
            handleModalOkStep();
            if (res.errorCode || res.message_details.msg_type === 'E') {
                message.error(res.message || res.message_details.msg);
                return;
            }

            // Notify the user of success
            message.success(res.message_details.msg);
            const recipeData = await retrieveRouting(site, formData?.recipeName, formData?.recipeId, userId, formData?.version); // Call the fetchShiftAll API with the site and shiftName as parameters

            setFormData(recipeData);
        } catch (error) {
            message.error('Failed to add phase. Please try again.');
        }
    };

    const handleFinish = (values: any) => {
        const newIngredient = {
            phaseId: selectedIngredient ? selectedIngredient.phaseId : generatePhaseId(data),
            sequence: selectedIngredient ? values.sequence : generateSequence(data),
            entryPhase: values.entryPhase,
            exitPhase: values.exitPhase,
            phaseDescription: values.phaseDescription,
            nextPhase: values.nextPhase,
            ...values,
        };

        if (selectedIngredient) {
            const updatedData = data.map((item) =>
                item.phaseId === selectedIngredient.phaseId ? newIngredient : item
            );

            setData(updatedData);
            updatePhaseFn(site, updatedData);
        } else {
            setData([...data, newIngredient]);
            addPhaseFn(site, { ...newIngredient, steps: [] });
        }

        form.resetFields();
        setFormVisible(false);
        setSelectedIngredient(null);
        setIsHeaderShow(false);
        setIsTableShowInActive(false);
        // setIsFullScreen(false);
        setSelectedRowKeys([]);
    };

    const handleRowClick = (record: any) => {
        setSelectedIngredient(record);
        form.setFieldsValue({
            phaseId: record.phaseId,
            phaseName: record.phaseName,
            sequence: record.sequence,
            expectedCycleTime: record.expectedCycleTime,
            conditional: record.conditional,
            parallel: record.parallel,
            anyOrder: record.anyOrder,
            entryPhase: record.entryPhase,
            exitPhase: record.exitPhase,
            nextPhase: record.nextPhase,
            phaseDescription: record.phaseDescription,
        });
        setPhasesId(record.phaseId);
        setSequence(record.sequence);
        setFormVisible(true);
        // setIsFullScreen(true);
        setIsHeaderShow(true);
        setIsTableShowInActive(true);
        setActiveTab('1');
    };

    const handleCloseForm = () => {
        setFormVisible(false);
        setSelectedIngredient(null);
        // setIsFullScreen(false);
        setIsHeaderShow(false);
        setIsTableShowInActive(false);
        form.resetFields();
    };

    const handleRemoveAll = () => {
        setData([]);
        setSelectedRowKeys([]);
    };

    const handleDelete = async (phaseId: string,sequenceId:string) => {
        const params = {
            recipeId: formData.recipeId,
            recipeName: formData.recipeName,
            phaseId: phaseId,
            version: formData.version,
            user: userId,
            phaseSequence:sequenceId

        };

        // Show confirmation modal
        Modal.confirm({
            title: 'Are you sure you want to delete this phase?',
            content: 'This action cannot be undone.',
            onOk: async () => {
                try {
                    const res = await deletePhase(site, params);
                    if (res.errorCode) {
                        throw new Error(res.message || 'Failed to remove phase.');
                    }
                    // Update the data state to remove the deleted phase
                    setData(prevData => prevData.filter(item => item.phaseId !== phaseId));
                    message.success(res.message_details.msg);
                    const recipeData = await retrieveRouting(site, formData.recipeName, formData.recipeId, userId, formData.version); // Call the fetchShiftAll API with the site and shiftName as parameters

                    setFormData(recipeData);
                } catch (error) {
                    message.error('Failed to remove phase. Please try again.');
                }
            },
        });
    };

    const columns = [
        // { title: t('phaseName'), dataIndex: 'phaseId', key: 'phaseId', render: text => text || '--' },
        { title: t('phaseName'), dataIndex: 'phaseDescription', key: 'phaseDescription', render: text => text || '--' },
        { title: t('sequence'), dataIndex: 'sequence', key: 'sequence', width: 100, render: text => text || '--' },
        { title: t('expectedCycleTime'), dataIndex: 'expectedCycleTime', key: 'expectedCycleTime', render: text => text || '--' },
        
        {
            title: t('action'),
            key: 'action',
            width: 80,
            render: (text: any, record: any) => (
                <Button
                    shape="circle"
                    onClick={(event) => {
                        event.stopPropagation(); // Prevent row click
                        handleDelete(record.phaseId,record.sequence);
                    }}
                    icon={<DeleteOutlined style={{ fontSize: '13px' }} />}
                    size="small"
                />
            ),
        }
    ];

    const rowSelection = {
        // Remove the row selection logic
        // selectedRowKeys,
        // onChange: (selectedKeys: string[]) => {
        //     setSelectedRowKeys(selectedKeys);
        // },
    };

    const handleInsertClick = () => {
        form.resetFields();
        setSelectedIngredient(null);
        setFormVisible(true);
        setIsHeaderShow(true);
        setIsTableShowInActive(true);
        
        const newSequence = generateSequence(data);
        
        setSequence(newSequence);
        setPhasesId(null);
        form.setFieldsValue({ 
            sequence: newSequence,
            phaseId:"",
            phaseDescription:"",
            entryPhase: false,
            exitPhase: false,
            nextPhase: null
        });
    };
    console.log(selectedIngredient, "selectedIngredient");

    // Add this new function to handle switch changes
    const handleSwitchChange = (field: string, value: boolean) => {
        if (value) {
            // When turning on one switch, turn off the others
            form.setFieldsValue({
                conditional: field === 'conditional' ? value : false,
                parallel: field === 'parallel' ? value : false,
                anyOrder: field === 'anyOrder' ? value : false,
            });
        } else {
            // When turning off, just update the current switch
            form.setFieldsValue({
                [field]: value
            });
        }
    };

    return (
        <Row>
            <Col span={formVisible ? 12 : 24} style={{ transition: 'width 0.3s' }}>
                <div style={{ position: 'relative', height: 'calc(100vh - 200px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 5 }}>
                    <Space style={{ marginBottom: 10, display: 'flex', marginRight: "20px" }}>
                        <Button onClick={handleInsertClick}>
                            {t('insert')}
                        </Button>
                        {/* <Button onClick={handleRemoveAll} style={{ marginLeft: '8px' }}>
                            Remove All
                        </Button> */}
                    </Space>
                    </div>
                    <Table
                        dataSource={data}
                        columns={columns}
                        size='small'
                        rowKey="phaseId"
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                            style: { fontSize: '13.5px', backgroundColor: '#f9f9f9' }
                        })}
                        bordered={true}
                        pagination={false}
                        scroll={{ y: 'calc(100vh - 300px)' }}
                        style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}
                        rowClassName={(record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
                        loading={{
                            spinning: !data,
                            tip: 'Loading data...'
                        }}
                    />
                </div>
            </Col>
            {formVisible && (
                <Col span={12} style={{ padding: '0px 16px', borderLeft: '1px solid #d9d9d9', overflow: 'auto', height: '80vh', transition: 'width 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <h3>{selectedIngredient ? `${selectedIngredient.phaseId}` : t('add')}</h3>
                        <Button onClick={handleCloseForm} type="link"><CloseIcon sx={{ color: '#1874CE' }} /></Button>
                    </div>
                    <TabContext value={activeTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab label={t('main')} value="1" />
                                <Tab label={t('operation')} value="2" />
                                <Tab label={t('ingredients')} value="3" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <Form form={form} layout="horizontal" labelCol={{ span: 9 }} wrapperCol={{ span: 14 }} onFinish={handleFinish}>
                                <Form.Item name="phaseId" hidden={true} label={t(`phaseId`)} rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="phaseId"
                                    label={t(`phasesName`)}
                                    initialValue={selectedIngredient?.phaseId}
                                    rules={[
                                        { required: true },
                                    ]}
                                >
                                    <Input
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9_]/g, '')
                                                .replace(/[ ]{2,}/g, ' ');
                                            form.setFieldsValue({ phaseId: value });
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item name="sequence" label={t(`sequence`)}  rules={[{ required: true }]}>
                                    <Input readOnly disabled={true} />
                                </Form.Item>
                                <Form.Item name="phaseDescription" label={t(`Phase Description`)}  rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="entryPhase" label={t('entryPhase')}>
                                    <Switch onChange={(checked) => form.setFieldsValue({ entryPhase: checked })} />
                                </Form.Item>
                                <Form.Item name="exitPhase" label={t('exitPhase')}>
                                    <Switch onChange={(checked) => form.setFieldsValue({ exitPhase: checked })} />
                                </Form.Item>
                                <Form.Item name="nextPhase" label={t(`nextPhase`)}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="expectedCycleTime" label={t(`expectedCycleTime`)}>
                                    <Input />
                                </Form.Item>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <Form.Item name="conditional" label={t('conditional')} style={{ marginBottom: 0 }}>
                                        <Switch onChange={(checked) => handleSwitchChange('conditional', checked)} disabled={selectedIngredient}/>
                                    </Form.Item>
                                    <Form.Item name="parallel" label={t(`parallel`)} style={{ marginBottom: 0 }}>
                                        <Switch onChange={(checked) => handleSwitchChange('parallel', checked)} disabled={selectedIngredient}/>
                                    </Form.Item>
                                    <Form.Item name="anyOrder" label={t('anyOrder')} style={{ marginBottom: 0 }}>
                                        <Switch onChange={(checked) => handleSwitchChange('anyOrder', checked)} disabled={selectedIngredient}/>
                                    </Form.Item>
                                </div>
                                
                               
                                

                                <Form.Item style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
                                    <Button type="primary" htmlType="submit" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                                        {selectedIngredient ? t('save') : t('create')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPanel>
                        <TabPanel value="2" sx={{ opacity: selectedIngredient === null ? 0.5 : 1, pointerEvents: selectedIngredient === null ? 'none' : 'auto' }}>
                            <StepManagementTable
                                phasesId={phasesId}
                                sequence={sequence}
                                formDatas={selectedIngredient}
                                phaseName={selectedIngredient?.phaseName}
                            />
                        </TabPanel>
                        <TabPanel value="3" sx={{ opacity: selectedIngredient === null ? 0.5 : 1, pointerEvents: selectedIngredient === null ? 'none' : 'auto' }}>
                            <PhasesIngredients phasesId={phasesId} sequence={sequence} />
                        </TabPanel>
                        
                    </TabContext>
                </Col>
            )}
        </Row>
    );
};

export default PhasesTab;
