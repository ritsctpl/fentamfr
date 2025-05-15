// pages/index.tsx
import React, { useContext, useEffect, useState } from 'react';
import { Form, Button, message } from 'antd';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { parseCookies } from 'nookies';
import { getSiteRetrieveTop50 } from '@services/userService';
import { SiteContext } from '../hooks/siteContext';
import DynamicForm from './DynamicForm';
import styles from '../styles/Tab.module.css';
import { useTranslation } from 'react-i18next';
import ActivityHookTable from './activityTab';
import { addSite, updateSite } from '@services/siteServices';

const Home = ({ onCancel }) => {
  const { isEditing, erpShift, setFormData, formData, call, setCall, setIsFullScreen } = useContext(SiteContext);
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
    if (activeTab === '4') {
      setIsFullScreen(true)
    }
    else {
      setIsFullScreen(false)
    }
    const fetchSites = async () => {
      try {
        const response = await getSiteRetrieveTop50(); 
        if (response.errorCode) {
          throw new Error(response.message || 'Failed to fetch sites.');
        }
        setSites(response.retrieveTop50List);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, [formData, mainForm, activeTab]);



  const handleCancel = () => {
    if (activeTab === '1') {
      mainForm.resetFields();
    } else if (activeTab === '2') {
      certificationForm.resetFields();
    }
  };



  const handleSave = async () => {

    // Display error messages if validation fails
    if (!formData.site) {
      throw new Error('Site fields cannot be empty.');
    }
    const hasEmptyActivityHook = formData.activityHookLists.some(data => data.activity.trim() === "");
    if (hasEmptyActivityHook) {
      message.error('ActivityHook fields cannot be empty.');
      return;
    }
    try {
      // Validate main form fields
      await mainForm.validateFields();

      // Retrieve cookies
      const cookies = parseCookies();
      const userId = cookies.rl_user_id;

      // Prepare payload for API call
      // const payload = {
      //   ...formData,
      //   timeZone: [{ timeZone: formData.timeZone }],
      //   localDateTime: new Date().toISOString(),
      // };
      message.destroy();
      // Perform the API call
      const res = await updateSite(userId, formData);
      if (res.errorCode) {
        message.error(res.message);
        return;
      }

      message.success(res.message_details.msg);
      setCall(call + 1);
      handleCancel();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAdd = async () => {
    setIsPopupVisible(false);

    try {
      // Validate the main form fields
      await mainForm.validateFields();
      if (!formData.site) {
        message.error('Site fields cannot be empty.');
        return
      }
      const hasEmptyActivityHook = formData.activityHookLists.some(data => data.activity.trim() === "");
      if (hasEmptyActivityHook) {
        message.error('ActivityHook fields cannot be empty.');
        return;
      }
      // Extract cookies for API call
      const cookies = parseCookies();
      const userId = cookies.rl_user_id
      const payload = {
        ...formData,
        site: formData.site,
        // timeZone: [{ timeZone: formData.timeZone }],
        // createdDateTime: new Date().toISOString(),
        userId: userId
      };
      message.destroy();
      console.log(payload, 'payloadsss');
      
      const res = await addSite(userId, payload);
      console.log(res);
      
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

  const fieldsToInclude = ['site',
    'description', 'type', 'timeZone', 'local'
  ];

  const handleValuesChange = (changedValues: any) => {
    setFormData(prevData => ({
      ...prevData,
      ...changedValues
    }));
  };
  
  const fieldsThemeInclude = ['logo', 'background', 'color', 'lineColor'];

  const handleThemeChange = (changedValues: any) => {
    setFormData(prevData => ({
      ...prevData,
      theme: {
        ...(prevData.theme || {}),
        ...changedValues
      }
    }));
  };

  return (
    <div style={{ padding: '0px 20px' }}>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label={t('main')} value="1" />
            <Tab label={t('activityHook')} value="2" />
            <Tab label={t('theme')} value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <DynamicForm
            data={formData}
            fields={fieldsToInclude}
            onValuesChange={handleValuesChange}
          />
        </TabPanel>
        <TabPanel value="2"><ActivityHookTable /></TabPanel>
        <TabPanel value="3"><DynamicForm data={formData?.theme} fields={fieldsThemeInclude} onValuesChange={handleThemeChange} /></TabPanel>
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
