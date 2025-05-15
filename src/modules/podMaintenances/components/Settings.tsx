import React, { useContext, useState, useEffect } from 'react';
import { Form, Input, Checkbox, Modal, Table, Select } from 'antd';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import { GrChapterAdd } from 'react-icons/gr';
import { v4 as uuidv4 } from 'uuid';
import { fetchAllServicesActivities, fetchAllUIActivities, fetchTop50ServicesActivities, fetchTop50UIActivities } from '@services/podMaintenanceService';
import { useTranslation } from 'react-i18next';

const SettingTab = () => {
    const [form] = Form.useForm();
    const { mainForm, setMainForm, setFormChange } = useContext<any>(PodMaintenanceContext);
    const { t } = useTranslation();

    const [serviceList, setServiceList] = useState([]);
    const [serviceListVisible, setServiceListVisible] = useState(false);

    const [uiList, setUiList] = useState([]);
    const [uiListVisible, setUiListVisible] = useState(false);


    const [checkboxGroup, setCheckboxGroup] = useState({
        onTabOutOfOperation: { reloadWorkList: false, reloadResource: false },
        onTabOutOfWorkCenter: { reloadWorkList: false, reloadResource: false },
        onTabOutOfResource: { reloadWorkList: false },
        updateFieldsToSession: { operation: true, resource: true, batchNumber: true, order: false, recipe: false, item: false },
    });

    const [selectedField, setSelectedField] = useState('');

    useEffect(() => {
        const defaultSettings = {
            pcuorBatchNumberBrowseActivity: '',
            podWorkListActivity: '',
            buttonLocation: 'Left',
            buttonActivityInWork: [],
            buttonActivityInQueue: [],
            serviceButtonActivityInQueue: '',
            serviceButtonActivityInWork: '',
            onTabOutOfOperation: { reloadWorkList: false, reloadResource: false },
            onTabOutOfWorkCenter: { reloadWorkList: false, reloadResource: false },
            onTabOutOfResource: { reloadWorkList: false },
            updateFieldsToSession: {
                operation: true,
                resource: true,
                batchNumber: true,
                order: false,
                recipe: false,
                item: false,
            }
        };

        // If settings don't exist in mainForm, initialize them with defaults
        if (!mainForm?.settings) {
            setMainForm((prevFormData: any) => ({
                ...prevFormData,
                settings: defaultSettings,
            }));
        }

        const settings = mainForm?.settings || defaultSettings;
        form.setFieldsValue({
            pcuorBatchNumberBrowseActivity: settings.pcuorBatchNumberBrowseActivity,
            podWorkListActivity: settings.podWorkListActivity,
            buttonLocation: settings.buttonLocation || 'Left',
            buttonActivityInWork: settings?.buttonActivityInWork || [],
            buttonActivityInQueue: settings?.buttonActivityInQueue || [],
            serviceButtonActivityInQueue: settings.serviceButtonActivityInQueue,
            serviceButtonActivityInWork: settings.serviceButtonActivityInWork,
        });
        // Update checkbox groups
        setCheckboxGroup({
            onTabOutOfOperation: settings.onTabOutOfOperation,
            onTabOutOfWorkCenter: settings.onTabOutOfWorkCenter,
            onTabOutOfResource: settings.onTabOutOfResource,
            updateFieldsToSession: settings.updateFieldsToSession,
        });
    }, [mainForm?.settings]);

    const option1 = [
        { label: t('reloadWorkList'), value: 'reloadWorkList' },
        { label: t('reloadResource'), value: 'reloadResource' }
    ];
    const option3 = [
        { label: t('reloadWorkList'), value: 'reloadWorkList' }
    ];
    const option2 = [
        { label: t('operation'), value: 'operation' },
        { label: t('resource'), value: 'resource' },
        { label: t('batchNumber'), value: 'batchNumber' },
        { label: t('order'), value: 'order' },
        { label: t('recipe'), value: 'recipe' },
        { label: t('item'), value: 'item' }
    ];

    const buttonLocation = [
        { label: t('Left'), value: 'Left' },
        { label: t('Right'), value: 'Right' }
    ];

    // Handle form field changes
    const onFieldChange = (changedValues: any, allValues: any) => {
        const updatedSettings = {
            ...mainForm?.settings,
            ...allValues,
            onTabOutOfOperation: checkboxGroup.onTabOutOfOperation,
            onTabOutOfWorkCenter: checkboxGroup.onTabOutOfWorkCenter,
            onTabOutOfResource: checkboxGroup.onTabOutOfResource,
            updateFieldsToSession: checkboxGroup.updateFieldsToSession,
        };

        setMainForm((prevFormData: any) => ({
            ...prevFormData,
            settings: updatedSettings,
        }));
        setFormChange(true);
    };

    // Handle checkbox group changes
    const onCheckboxGroupChange = (group: string, selectedValues: string[]) => {
        const updatedCheckboxGroup = { ...checkboxGroup };
        const groupSettings = { ...updatedCheckboxGroup[group] };

        Object.keys(groupSettings).forEach(key => {
            groupSettings[key] = false;
        });
        // Set selected values to true
        selectedValues.forEach(value => {
            groupSettings[value] = true;
        });

        updatedCheckboxGroup[group] = groupSettings;
        setCheckboxGroup(updatedCheckboxGroup);

        // Update mainForm settings
        setMainForm((prevFormData: any) => ({
            ...prevFormData,
            settings: {
                ...prevFormData.settings,
                [group]: groupSettings,
            },
        }));
        setFormChange(true);
    };

    const handleInputChange = (e: any, key: string) => {
        const value = e.target.value;
        form.setFieldValue(key, value);
        
        // Update mainForm.settings
        setMainForm((prevFormData: any) => ({
            ...prevFormData,
            settings: {
                ...prevFormData.settings,
                [key]: value,
            },
        }));
        setFormChange(true);
    };

    console.log(mainForm, 'mainFormsss');
    

    const handleServiceListClick = async (key: string) => {
        setSelectedField(key);
        let oItemList;
        const typedValue = form.getFieldValue(key);
        try {
            if (typedValue) {
                oItemList = await fetchAllServicesActivities(typedValue);
                if (oItemList.message) {
                    setServiceList([]);
                }
            }
            else {
                oItemList = await fetchTop50ServicesActivities();
            }

            if (oItemList) {
                const processedData = oItemList?.map((item) => ({
                    ...item,
                    key: uuidv4(),
                }));
                setServiceList(processedData);
            } else {
                setServiceList([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setServiceListVisible(true);
    };

    const handleCancel = () => {
        setUiListVisible(false);
        setServiceListVisible(false);
    };

    const modalColumns = [
        { title: t('activityId'), dataIndex: 'activityId', key: 'activityId' },
        { title: t('description'), dataIndex: 'description', key: 'description' },
    ];
    
        const handleServiceModalOk = async (record) => {
            form.setFieldValue(selectedField, record.activityId);
            onFieldChange(record, form.getFieldsValue());
            setServiceListVisible(false);
        };

    const handleUIModalOk = async (record) => {
        form.setFieldValue(selectedField, record.activityId);
        onFieldChange(record, form.getFieldsValue());
        setUiListVisible(false);
    };

    const handleSelectChange = (e: any, key: string) => {
        const value = e.target.value;
        form.setFieldValue(key, value);
        onFieldChange(value, form.getFieldsValue());
        setMainForm((prevFormData: any) => ({
            ...prevFormData,
            settings: {
                ...prevFormData.settings,
                buttonLocation: value,
            },
        }));
    };

    return (
        <div>
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 14 }}
                onValuesChange={onFieldChange}
            >

                <Form.Item
                    key="pcuorBatchNumberBrowseActivity"
                    name="pcuorBatchNumberBrowseActivity"
                    label={t('PCUOrBatchNumberBrowseActivity')}
                >
                    <Input
                        suffix={
                            <GrChapterAdd
                                onClick={() =>
                                    handleServiceListClick('pcuorBatchNumberBrowseActivity')
                                }
                            />
                        }
                        onChange={(e) => handleInputChange(e, 'pcuorBatchNumberBrowseActivity')}
                    />

                </Form.Item>

                <Form.Item
                    key="podWorkListActivity"
                    name="podWorkListActivity"
                    label={t('PodWorkListActivity')}
                >
                    <Input
                        suffix={
                            <GrChapterAdd
                                onClick={() =>
                                    handleServiceListClick('podWorkListActivity')
                                }
                            />
                        }
                        onChange={(e) => handleInputChange(e, 'podWorkListActivity')}
                    />
                </Form.Item>

                <Form.Item
                    key="buttonLocation"
                    name="buttonLocation"
                    label={t('buttonLocation')}
                >
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Select Button Location"
                        onChange={(values) => handleSelectChange({ target: { value: values }}, 'buttonLocation')}
                        options={buttonLocation}
                   />
                </Form.Item>

                <Form.Item
                    key="buttonActivityInWork"
                    name="buttonActivityInWork"
                    label={t('ButtonActivityInWork')}
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select activities"
                        onChange={(values) => handleInputChange({ target: { value: values }}, 'buttonActivityInWork')}
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)
                                ?.toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                        showSearch
                    >
                        {mainForm?.buttonList?.map((activity: any) => (
                            <Select.Option key={activity.buttonId} value={activity.buttonId}>
                                {activity.buttonId}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>


                <Form.Item
                    key="buttonActivityInQueue"
                    name="buttonActivityInQueue"
                    label={t('buttonActivityInQueue')}
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select Activities"
                        onChange={(values) => handleInputChange({ target: { value: values }}, 'buttonActivityInQueue')}
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)
                                ?.toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                        showSearch
                    >
                        {mainForm?.buttonList?.map((activity: any) => (
                            <Select.Option key={activity.buttonId} value={activity.buttonId}>
                                {activity.buttonId}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* <Form.Item
                    key="buttonActivityInQueue"
                    name="buttonActivityInQueue"
                    label={t('ButtonActivityInQueue')}
                >
                    <Input
                        suffix={
                            <GrChapterAdd
                                onClick={() =>
                                    handleUIListClick('buttonActivityInQueue')
                                }
                            />
                        }
                        onChange={(e) => handleInputChange(e, 'buttonActivityInQueue')}
                    />
                </Form.Item> */}

                {/* <Form.Item
                    key="serviceButtonActivityInQueue"
                    name="serviceButtonActivityInQueue"
                    label="Service Button Activity in Queue"
                >
                    <Input
                        suffix={
                            <GrChapterAdd
                                onClick={() =>
                                    handleServiceListClick('serviceButtonActivityInQueue')
                                }
                            />
                        }
                        onChange={(e) => handleInputChange(e, 'serviceButtonActivityInQueue')}
                    />
                </Form.Item>

                <Form.Item
                    key="serviceButtonActivityInWork"
                    name="serviceButtonActivityInWork"
                    label="Service Button Activity in Work"
                >
                    <Input
                        suffix={
                            <GrChapterAdd
                                onClick={() =>
                                    handleServiceListClick('serviceButtonActivityInWork')
                                }
                            />
                        }
                        onChange={(e) => handleInputChange(e, 'serviceButtonActivityInWork')}
                    />
                </Form.Item> */}

                <Form.Item label={t('OnTabOutOfOperation')}>
                    <Checkbox.Group
                        options={option1}
                        value={Object.keys(checkboxGroup.onTabOutOfOperation).filter(
                            key => checkboxGroup.onTabOutOfOperation[key]
                        )}
                        onChange={selectedValues =>
                            onCheckboxGroupChange('onTabOutOfOperation', selectedValues as string[])
                        }
                    />
                </Form.Item>

                <Form.Item label={t('OnTabOutOfWorkcenter')}>
                    <Checkbox.Group
                        options={option1}
                        value={Object.keys(checkboxGroup.onTabOutOfWorkCenter).filter(
                            key => checkboxGroup.onTabOutOfWorkCenter[key]
                        )}
                        onChange={selectedValues =>
                            onCheckboxGroupChange('onTabOutOfWorkCenter', selectedValues as string[])
                        }
                    />
                </Form.Item>

                <Form.Item label={t('OnTabOutOfResource')}>
                    <Checkbox.Group
                        options={option3}
                        value={Object.keys(checkboxGroup.onTabOutOfResource).filter(
                            key => checkboxGroup.onTabOutOfResource[key]
                        )}
                        onChange={selectedValues =>
                            onCheckboxGroupChange('onTabOutOfResource', selectedValues as string[])
                        }
                    />
                </Form.Item>

                <Form.Item label={t('UpdateFieldsToSession')}>
                    <Checkbox.Group
                        options={option2.map(option => ({
                            label: option.label,
                            value: option.value,
                            disabled: ['operation', 'resource', 'batchNumber'].includes(option.value)
                        }))}
                        value={Object.keys(checkboxGroup.updateFieldsToSession).filter(
                            key => checkboxGroup.updateFieldsToSession[key]
                        )}
                        onChange={selectedValues => {
                            const preservedValues = ['operation', 'resource', 'batchNumber'];
                            const newValues = Array.from(new Set([...preservedValues, ...selectedValues]));
                            onCheckboxGroupChange('updateFieldsToSession', newValues);
                        }}
                    />
                </Form.Item>
            </Form>
            <Modal
                title={t("serviceActivity")}
                open={serviceListVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={serviceList}
                    columns={modalColumns}
                    rowKey="activityId"
                    pagination={false}
                    onRow={(record) => ({
                        onDoubleClick: () => handleServiceModalOk(record),
                    })}
                    scroll={{ y: 'calc(100vh - 380px)' }}
                />
            </Modal>

            {/* Existing modal for the second table */}
            <Modal
                title={t("UIactivity")}
                open={uiListVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    dataSource={uiList}
                    columns={modalColumns}
                    rowKey="activityId"
                    onRow={(record) => ({
                        onDoubleClick: () => handleUIModalOk(record),
                    })}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 380px)' }}
                />
            </Modal>
        </div>
    );
};

export default SettingTab;
