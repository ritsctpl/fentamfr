// pages/index.tsx
import React, { useContext, useEffect, useState } from 'react';
import {  Form, Button, message } from 'antd';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { parseCookies } from 'nookies';
import { addStage, updateStage } from '@services/stageService';
import { StageContext } from '@modules/stageMaintenance/hooks/stageContext';
import DynamicForm from '@modules/stageMaintenance/components/DynamicForm';
import CertificateTab from '@modules/stageMaintenance/components/CertificateTab';
import SubStepTable from '@modules/stageMaintenance/components/SubStep';
import ActivityHookTable from '@modules/stageMaintenance/components/activityTab';
import CustomDataTable from '@modules/stageMaintenance/components/customData';
import styles from '@modules/stageMaintenance/styles/Tab.module.css';
import { useTranslation } from 'react-i18next';



const TabNav = ({ onCancel }) => {
  const { isEditing, erpShift, setFormData, formData, call, setCall } = useContext(StageContext);
  const [mainForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('1');
  const { t } = useTranslation();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Update form values when formData or mainForm changes
  useEffect(() => {
    if (mainForm && formData) {
      mainForm.setFieldsValue(formData);
    }
  }, [formData, mainForm]);


  const handleSave = async () => {
    // Check if any certification field is empty
    const hasEmptyCertification = formData.certificationList.some(data => data.certification.trim() === "");
    const hasEmptySubStep = formData.subStepList.some(data => data.subStep.trim() === "");
    const hasEmptyActivityHook = formData.activityHookList.some(data => data.activity.trim() === "");
    const hasEmptyResource = formData.resourceType === "";
    const hasEmptyResourceD = formData.defaultResource === "";
    const hasEmptyWorkCenter = formData.workCenter === "";

    // Display error messages if validation fails
    if (hasEmptyCertification) {
      message.error('Certification fields cannot be empty.');
      return;
    }
    if (hasEmptyResource) {
      message.error('Resource fields cannot be empty.');
      return;
    }
    if (hasEmptyResourceD) {
      message.error('Resource Default fields cannot be empty.');
      return;
    }
    if (hasEmptyWorkCenter) {
      message.error('Work Center fields cannot be empty.');
      return;
    }
    if (hasEmptySubStep) {
      message.error('SubStep fields cannot be empty.');
      return;
    }
    if (hasEmptyActivityHook) {
      message.error('ActivityHook fields cannot be empty.');
      return;
    }

    try {
      // Validate main form fields
      await mainForm.validateFields();

      // Retrieve cookies
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      // Prepare payload for API call
      const payload = {
        ...formData,
        localDateTime: new Date().toISOString(),
      };

      // Perform the API call
      const res = await updateStage(site, userId, payload);

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
      message.error('An error occurred while saving the data.');
    }
  };

  const handleAdd = async () => {
    try {
      // Validate the main form fields
      await mainForm.validateFields();

      // Extract cookies for API call
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      // Check if essential fields are provided
      if (!formData.operation ) {
        throw new Error('Stage fields cannot be empty.');
      }
      if (!formData.revision ) {
        throw new Error('Revision fields cannot be empty.');
      }
      if (!formData.resourceType ) {
        throw new Error('Resource Type fields cannot be empty.');
      }
      if (!formData.defaultResource ) {
        throw new Error('Default Resource fields cannot be empty.');
      }
      if (!formData.workCenter ) {
        throw new Error('Work Center fields cannot be empty.');
      }
      // Validate certification and subStep fields
      const hasEmptyCertification = formData.certificationList.some(data => data.certification.trim() === "");
      const hasEmptySubStep = formData.subStepList.some(data => data.subStep.trim() === "");
      const hasEmptyActivityHook = formData.activityHookList.some(data => data.activity.trim() === "");
      if (hasEmptyCertification ) {
        throw new Error('Certification fields cannot be empty.');
      }
      if (hasEmptySubStep) {
        message.error('SubStep fields cannot be empty.');
        return;
      }
      if (hasEmptyActivityHook) {
        message.error('ActivityHook fields cannot be empty.');
        return;
      }

      // Prepare the payload for the API call
      const payload = {
        ...formData,
        localDateTime: new Date().toISOString(),
      };

      // Perform the API call to add the stage
      const res = await addStage(site, userId, payload);

      // Check the response for errors
      if (res.errorCode) {
        throw new Error(res.message || 'Failed to add stage.');
      }

      // Notify the user of success
      message.success(res.message_details.msg);
      setCall(call + 1);
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'An error occurred while adding the stage. Please check your input.');
    }
  };

  const fieldsToInclude = [
    'operation', 'revision', 'description', 'status', 'operationType', 'resourceType', 'defaultResource',
    'erpOperation', 'workCenter', 'addAsErpOperation', 'currentVersion', 'maxLoopCount'
  ];

  const handleValuesChange = (changedValues: any) => {
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
      <Tab label={t('certification')} value="2" />
      <Tab label={t('subStep')} value="3" />
      <Tab label={t('activityHook')} value="4" />
      <Tab label={t('customData')} value="5" />
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
          <CertificateTab />
        </TabPanel>
        <TabPanel value="3">
          <SubStepTable />
        </TabPanel>
        <TabPanel value="4">
          <ActivityHookTable />
        </TabPanel>
        <TabPanel value="5">
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

export default TabNav;
