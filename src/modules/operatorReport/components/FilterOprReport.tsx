import React, { useState, useEffect } from 'react';
import { Form, DatePicker, Select, Button, Row, Col, Card, Space, message, Input } from 'antd';
import type { SelectProps } from 'antd';
import { parseCookies } from 'nookies';
import styles from '../styles/FIlterStyle.module.css';
import CustomTable from './CustomTable';
import { commonApi } from '@services/dashboard';

interface FilterOprReportProps {
    setCategory: (categories: string[]) => void;
    setOverAllData: (data: any) => void;
    setFormData: (data: any) => void;
    category: string[];
    formData: any;
}

const categoryOptions = [
    { label: "Day", value: "DAY" },
    { label: "Month", value: "MONTH" },
    { label: "Year", value: "YEAR" },
    { label: "OEE", value: "OEE" },
    { label: "Availability", value: "Availability" },
    { label: "Performance", value: "Performance" },
    { label: "Quality", value: "Quality" }
];

const formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 24 }
};

const FilterOprReport: React.FC<FilterOprReportProps> = ({ setCategory, setOverAllData, formData, setFormData, category }) => {
    const [form] = Form.useForm();
    const cookies = parseCookies();
    const [loading, setLoading] = useState(false);

    // States for options
    const [shiftOptions, setShiftOptions] = useState([]);
    const [batchOptions, setBatchOptions] = useState([]);
    const [operationOptions, setOperationOptions] = useState([]);
    const [workcenterOptions, setWorkcenterOptions] = useState([]);
    const [resourceOptions, setResourceOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [shopOrderOptions, setShopOrderOptions] = useState([]);

    useEffect(() => {
       console.log(form.getFieldsValue());
    }, [form]);
    // Fetch all options on component mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);

                // Fetch shifts
                const shiftsResponse = await commonApi('/shift-service/retrieveAll', { site: cookies.site });
                setShiftOptions(shiftsResponse?.shiftResponseList?.map(shift => ({
                    value: shift.handle,
                    label: shift.shiftId
                })) || []);

                // Fetch batch numbers
                const batchResponse = await commonApi('/batchnoheader-service/retrieveBatchNoList', { site: cookies.site });
                setBatchOptions(batchResponse?.batchNos?.map(batch => ({
                    value: batch.batchNo,
                    label: batch.batchNo
                })) || []);

                // Fetch operations
                const operationsResponse = await commonApi('/operation-service/retrieveTop50', { site: cookies.site });
                setOperationOptions(operationsResponse?.operationList?.map(op => ({
                    value: op.operation,
                    label: op.operation
                })) || []);

                // Fetch workcenters
                const workcentersResponse = await commonApi('/workcenter-service/retrieveAll', { site: cookies.site });
                setWorkcenterOptions(workcentersResponse?.workCenterList?.map(wc => ({
                    value: wc.workCenter,
                    label: wc.workCenter
                })) || []);

                // Fetch resources
                const resourcesResponse = await commonApi('/resource-service/retrieveResourceList', { site: cookies.site });
                setResourceOptions(resourcesResponse?.map(resource => ({
                    value: resource.resource,
                    label: resource.resource
                })) || []);

                // Fetch items
                const itemsResponse = await commonApi('/item-service/retrieveTop50', { site: cookies.site });
                setItemOptions(itemsResponse?.itemList?.map(item => ({
                    value: item.item,
                    label: item.item
                })) || []);

                // Fetch sites
                const sitesResponse = await commonApi('/site-service/retrieveTop50', {});
                setSiteOptions(sitesResponse?.retrieveTop50List?.map(site => ({
                    value: site.site,
                    label: site.site
                })) || []);

                // Fetch shop orders
                const ordersResponse = await commonApi('/processorder-service/retrieveTop50OrderNos', { site: cookies.site });
                setShopOrderOptions(ordersResponse?.processOrderResponseList?.map(order => ({
                    value: order.orderNumber,
                    label: order.orderNumber
                })) || []);

            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [cookies.site]);

    const sharedProps: SelectProps = {
        mode: 'tags',
        style: { width: '100%' },
        allowClear: true,
        maxTagCount: 'responsive',
        loading: loading
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const payload = {
                site: values.site || cookies.site || null,
                category: values.category || ['OEE'],
                startTime: values.timeInterval?.[0]?.format('YYYY-MM-DDTHH:mm:ss') || null,
                endTime: values.timeInterval?.[1]?.format('YYYY-MM-DDTHH:mm:ss') || null,
                shiftId: values.shiftId || null,
                batchNumber: values.batchNumber || null,
                operation: values.operation || null,
                workCenter: values.workCenter || null,
                resource: values.resource || null,
                item: values.item || null,
                shoporderId: values.shoporderId || null
            };

            // Set initial form values
            form.setFieldsValue({
                site: values.site || cookies.site,
                category: values.category || ['OEE']
            });

            // Remove timeInterval from payload
            delete values.timeInterval;

            // Set the form data for parent component
            setFormData(payload);

            // Set category for UI display
            setCategory(values.category || ['OEE']);

        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    // Set initial form values when component mounts
    useEffect(() => {
        form.setFieldsValue({
            site: cookies.site,
            category: ['OEE']
        });
    }, []);

    const Handlecheck = ({ children }) => {
        if (!category.includes('DAY') && !category.includes('MONTH') && !category.includes('YEAR')) {
            return children;
        }
        return null;
    }

    const handleReset = () => {
        form.resetFields();
        setCategory(['OEE']);
        setFormData({
            site: cookies.site || null,
            category: ['OEE'],
        });

        // Reset form with preserved site value
        form.setFieldsValue({
            site: cookies.site,
            category: ['OEE']
        });
    };

    return (
        <div className={styles.dashboardContainer}>
            <Form {...formLayout} form={form} onFinish={handleSubmit}>
                <Row gutter={[8, 8]}>

                    <Col span={4} >
                        <Form.Item name="timeInterval" label="Time Interval">
                            <DatePicker.RangePicker
                                showTime
                            />
                        </Form.Item>
                    </Col>

                    <Handlecheck>
                        <Col span={4}>
                            <Form.Item name="shiftId" label="Shift">
                                <Select
                                    {...sharedProps}
                                    placeholder="Select Shift"
                                    options={shiftOptions}
                                    
                                />
                            </Form.Item>
                        </Col>
                    </Handlecheck>
                    <Handlecheck>
                        <Col span={4}>
                            <Form.Item name="batchNumber" label="Batch No">
                                <Select
                                    {...sharedProps}
                                    placeholder="Select Batch Number"
                                    options={batchOptions}
                                    // dropdownAlign={{
                                    //     offset: batchOptions.length > 0 ?  [0, 0] : [0, -1000]
                                    // }}
                                />
                            </Form.Item>
                        </Col>
                    </Handlecheck>
                    <Handlecheck>
                        <Col span={4}>
                            <Form.Item name="operation" label="Operation">
                                <Select
                                    {...sharedProps}
                                    placeholder="Select Operation"
                                    options={operationOptions}
                                    // dropdownAlign={{
                                    //     offset: operationOptions.length > 0 ?  [0, 0] : [0, -1000]
                                    // }}
                                />
                            </Form.Item>
                        </Col>
                    </Handlecheck>
                    {/* <Handlecheck> */}
                        <Col span={4}>
                            <Form.Item name="workCenter" label="Workcenter">
                                <Select
                                    {...sharedProps}
                                    placeholder="Select Workcenter"
                                    options={workcenterOptions}
                                   
                                />
                            </Form.Item>
                        </Col>
                    {/* </Handlecheck> */}
                    <Handlecheck>
                        <Col span={4}>
                            <Form.Item name="resource" label="Resource">
                                <Select
                                    {...sharedProps}
                                    placeholder="Select Resource"
                                    options={resourceOptions}
                                    
                                />
                            </Form.Item>
                        </Col>
                    </Handlecheck>
                    <Handlecheck>
                        <Col span={4}>
                            <Form.Item name="item" label="Item">
                                <Select
                                    {...sharedProps}
                                    placeholder="Select Item"
                                    options={itemOptions}
                                
                                />
                            </Form.Item>
                        </Col>
                    </Handlecheck>
                    <Col span={4}>
                        <Form.Item name="site" label="Site">
                            <Select
                                placeholder="Select Site"
                                options={siteOptions}
                                defaultValue={cookies.site}
                            
                            />
                        </Form.Item>
                    </Col>
                    <Handlecheck>
                        <Col span={4}>
                            <Form.Item name="shoporderId" label="Shop Order">
                                <Select
                                    {...sharedProps}
                                    placeholder="Select Shop Order"
                                    options={shopOrderOptions}
                                    // dropdownAlign={{
                                    //     offset: shopOrderOptions.length > 0 ?  [0, 0] : [0, -1000]
                                    // }}
                                />
                            </Form.Item>
                        </Col>
                    </Handlecheck>

                    <Col span={4}>
                        <Form.Item name="category" label="Category">
                            <Select
                                {...sharedProps}
                                placeholder="Select Category"
                                options={categoryOptions}
                                defaultValue={["OEE"]}
                                onChange={(values) => {
                                    // Check if the new selection includes any time-based category
                                    const hasTimeBasedCategory = values.some(val => ['DAY', 'MONTH', 'YEAR'].includes(val));
                                    const hasMetricCategory = values.some(val => ['OEE', 'Availability', 'Performance', 'Quality'].includes(val));

                                    let newValues;
                                    
                                    if (hasTimeBasedCategory && hasMetricCategory) {
                                        // If both types exist, keep only the most recently added one
                                        const lastValue = values[values.length - 1];
                                        if (['DAY', 'MONTH', 'YEAR'].includes(lastValue)) {
                                            // Keep only time-based categor
                                            newValues = values.filter(val => ['DAY', 'MONTH', 'YEAR'].includes(val));
                                            message.info('Time-based categories cannot be combined with metric categories. Removed metric categories.');
                                        } else {
                                            // Keep only metric categories
                                            newValues = values.filter(val => ['OEE', 'Availability', 'Performance', 'Quality'].includes(val));
                                            message.info('Metric categories cannot be combined with time-based categories. Removed time-based categories.');
                                        }
                                        // Update form field value
                                        form.setFieldsValue({ category: newValues });
                                    } else {
                                        newValues = values;
                                    }
                                    setCategory(newValues);
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row justify="end" style={{ width: '100%', marginBottom: '10px' }}>
                    <Col>
                        <Space size="middle">
                            <Button size='small' type="primary" htmlType="submit" loading={loading}>
                                Submit
                            </Button>
                            <Button size='small' onClick={handleReset}>
                                Reset
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </div >
    );
};

export default FilterOprReport;