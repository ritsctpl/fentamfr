// components/YieldTracking.tsx

import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Col} from 'antd';
import { OperationContext } from '../hooks/recipeContext';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import YieldProducts from './YieldProducts';
import WasteManagement from './YieldWaste';
import CorrectionsManagement from './YieldCorrections';
import QualityDeviationsManagement from './QualityDeviations';

const YieldTracking: React.FC<{ tabName: string }> = () => {
    const { setIsHeaderShow, setIsFullScreen, formData, setFormData } = useContext(OperationContext);
    
    const [formVisible, setFormVisible] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('1');
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const cookies = parseCookies();
    const userId = cookies.rl_user_id;

    useEffect(() => {
        if (formData?.yieldTracking) {
            form.setFieldsValue(formData?.yieldTracking);
        } else {
            form.resetFields(); // Reset the form if yieldTracking is null
        }
    }, [formData, form]);

    const handleValuesChange = (changedValues: any) => {
        const updatedYieldTracking = {
            ...formData?.yieldTracking,
            ...changedValues,
        };

        setFormData((prevFormData) => ({
            ...prevFormData,
            yieldTracking: updatedYieldTracking,
        }));
    };

    const handleCloseForm = () => {
        setFormVisible(false);
        setIsFullScreen(false);
        setIsHeaderShow(false);
        form.resetFields();
    };

    return (
        <Col span={24} style={{ padding: '0px 16px', overflow: 'auto', height: '80vh', display: 'flex' }}>
            <TabContext value={activeTab}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
                        <TabList 
                            orientation="vertical"
                            onChange={(event, newValue) => {
                                setIsLoading(true);
                                setTimeout(() => {
                                    setActiveTab(newValue);
                                    setIsLoading(false);
                                }, 500);
                            }}
                            aria-label="lab API tabs example"
                            sx={{ minWidth: '200px' }}
                        >
                            <Tab label={t('Main')} value="1" />
                            <Tab label={t('By Products')} value="2" />
                            <Tab label={t('Waste')} value="3" />
                            <Tab label={t('Corrections')} value="4" />
                            <Tab label={t('Quality Deviations')} value="5" />
                        </TabList>
                    </Box>
                    <Box sx={{ flexGrow: 1, pl: 2, width: 'calc(100% - 200px)' }}>
                        <div style={{ position: 'relative', minHeight: '200px' }}>
                            {/* Loading overlay */}
                            <div style={{
                                display: isLoading ? 'flex' : 'none',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(255, 255, 255, 0.8)',
                                zIndex: 1000
                            }}>
                                <div>Loading...</div>
                            </div>

                            <TabPanel value="1" sx={{ p: 0 }}>
                                <Form 
                                    form={form} 
                                    layout="vertical" 
                                    onValuesChange={handleValuesChange} 
                                    style={{ width: '30%' }}
                                >
                                    <Form.Item name="expectedYield" label={t('Expected Yield')} rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="allowedVariance" label={t('Allowed Variance')} rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="actualYield" label={t('Actual Yield')} rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Form>
                            </TabPanel>
                            <TabPanel value="2" sx={{ p: 0, width: '100%' }}>
                                <YieldProducts/>
                            </TabPanel>
                            <TabPanel value="3" sx={{ p: 0, width: '100%' }}>
                                <WasteManagement/>
                            </TabPanel>
                            <TabPanel value="4" sx={{ p: 0, width: '100%' }}>
                                <CorrectionsManagement/>
                            </TabPanel>
                            <TabPanel value="5" sx={{ p: 0, width: '100%' }}>
                                <QualityDeviationsManagement/>
                            </TabPanel>
                        </div>
                    </Box>
                </Box>
            </TabContext>
        </Col>
    );
};

export default YieldTracking;
