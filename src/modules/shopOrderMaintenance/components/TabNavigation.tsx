// pages/index.tsx
import React, { useContext, useEffect, useState } from 'react';
import { Tabs, Form, Button, message } from 'antd';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { parseCookies } from 'nookies';
import { getSiteRetrieveTop50 } from '@services/userService';
import { UserContext } from '../hooks/userContext';
import DynamicForm from './DynamicForm';
import CustomDataTable from './customData';
import styles from '../styles/Tab.module.css';
import { useTranslation } from 'react-i18next';
import { addShop, updateShop } from '@services/shopOrderService';
import SerialPUC from './SerialPCU';
import ProductionQuantitiesForm from './ProductionQuantities';




const Home = ({ onCancel }) => {
  const { isEditing, erpShift, setFormData, formData, call, setCall, setValueChange } = useContext(UserContext);
  const [mainForm] = Form.useForm();
  const [certificationForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('1');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [sites, setSites] = useState([]);
  const { t } = useTranslation();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Update form values when formData or mainForm changes
  useEffect(() => {
    if (mainForm && formData) {
      mainForm.setFieldsValue(formData);
    }
    const fetchSites = async () => {
      try {
        const response = await getSiteRetrieveTop50(); // Replace with your API call
        console.log(response.retrieveTop50List, "valueResponse")
        if (response.errorCode) {
          throw new Error(response.message || 'Failed to fetch sites.');
        }
        setSites(response.retrieveTop50List);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, [formData, mainForm]);



  const handleCancel = () => {
    if (activeTab === '1') {
      mainForm.resetFields();
    } else if (activeTab === '2') {
      certificationForm.resetFields();
    }
  };





  const handleSave = async () => {
    try {
      // Validate main form fields
      await mainForm.validateFields();
      // Check if essential fields are provided
      if (!formData?.shopOrder) {
        message.error('Shop Order fields cannot be empty.');
        return
      }
      if (!formData?.plannedMaterial) {
        message.error('Planned Material fields cannot be empty.');
        return
      }
      if (!formData?.priority) {
        message.error('Priority fields cannot be empty.');
        return
      }
      if (formData?.buildQty == "") {
        message.error('Build Quantity fields cannot be empty.');
        return
      }
      // Retrieve cookies
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      // Prepare payload for API call
      const payload = {
        ...formData,
        site: site,
        localDateTime: new Date().toISOString(),
      };
      console.log(payload, 'payload');


      // Perform the API call
      const res = await updateShop(site, userId, payload);
      if (res.errorCode) {
        message.error(res.message);
        return;
      }
      // Check for API response errors
      if (res.errorCode) {
        message.error(res.message);
        return;
      }

      // Show success message and update state
      message.success(res.message_details.msg);
      setCall(call + 1);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAdd = async () => {

    try {
      // Validate the main form fields
      await mainForm.validateFields();


      // Check if essential fields are provided
      if (!formData?.shopOrder) {
        throw new Error('Shop Order fields cannot be empty.');
      }
      if (!formData?.plannedMaterial) {
        throw new Error('Planned Material fields cannot be empty.');
      }
      if (!formData?.priority) {
        throw new Error('Priority fields cannot be empty.');
      }
      if (!formData?.buildQty) {
        throw new Error('Build Quantity fields cannot be empty.');
      }

      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;


      const payload = {
        ...formData,
        site: site,
        localDateTime: new Date().toISOString(),
      };
      const res = await addShop(site, userId, payload);
      if (res.errorCode) {
        message.error(res.message);
        return;
      }
      // Success message
      message.success(res.message_details.msg);
      setCall(call + 1);
      handleCancel();


    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'An error occurred while adding the user. Please check your input.');
    }
  };



  const fieldsToInclude = ['shopOrder', 'orderType', 'plannedMaterial', 'materialVersion', 'status',
    'bomType',
    'plannedBom', 'bomVersion',
    'plannedRouting', 'routingVersion', 'lcc', 'plannedWorkCenter',
    'orderedQty', 'priority', 'buildQty', 'erpUom', 'plannedStart', 'plannedCompletion', 'scheduledStart',
    'scheduledEnd', 'customerOrder', 'customer'
  ];

  const handleValuesChange = (changedValues: any) => {
    setValueChange(true);
    setFormData(prevData => ({
      ...prevData,
      ...changedValues
    }));
  };
  return (
    <div style={{ padding: '0px 20px' }}>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label={t('main')} value="1" />
            <Tab label={t('productionQuantities')} value="2" />
            <Tab label={t('serialPCU')} value="3" />
            <Tab label={t('customData')} value="4" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <DynamicForm
            data={formData}
            fields={fieldsToInclude}
            onValuesChange={handleValuesChange}
          />
        </TabPanel>
        <TabPanel value="2">
          <ProductionQuantitiesForm />
        </TabPanel>
        <TabPanel value="3">
          <SerialPUC />
        </TabPanel>
        <TabPanel value="4">
          <CustomDataTable />
        </TabPanel>
      </TabContext>

      <div className={styles.submitButton} style={{ marginTop: '20px', marginBottom: '20px' }}>
        {isEditing && erpShift ? (
          <Button
            type="primary"
            onClick={handleSave}
          >
            {t('save')}
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleAdd}
          >
            {t('create')}
          </Button>
        )}
        <Button style={{ marginLeft: 8 }} onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>

    </div>
  );
};

export default Home;
