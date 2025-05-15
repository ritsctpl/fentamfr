// pages/index.tsx
import React, { useContext, useEffect, useState } from 'react';
import { Form, Button, message } from 'antd';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { parseCookies } from 'nookies';
import { getSiteRetrieveTop50 } from '@services/userService';
import { UserContext } from '@modules/processOrderMaintenance/hooks/userContext';
import DynamicForm from '@modules/processOrderMaintenance/components/DynamicForm';
import CustomDataTable from '@modules/processOrderMaintenance/components/customData';
import styles from '@modules/processOrderMaintenance/styles/Tab.module.css';
import { useTranslation } from 'react-i18next';
import SerialBatchNumber from '@modules/processOrderMaintenance/components/SerialBatchNumber';
import ProductionQuantitiesForm from '@modules/processOrderMaintenance/components/ProductionQuantities';
import { addProcess, updateProcess } from '@services/processOrderService';

const Home = ({ onCancel }) => {
  const { isEditing, erpShift, setFormData, formData, call, setCall, setFormChange, activeTab, setActiveTab } = useContext(UserContext);
  const [mainForm] = Form.useForm();
  const [certificationForm] = Form.useForm();
  const [sites, setSites] = useState([]);
  const { t } = useTranslation();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (mainForm && formData) {
      mainForm.setFieldsValue(formData);
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
  }, [formData, mainForm]);

  const handleCancel = () => {
    if (activeTab === 1) {
      mainForm.resetFields();
    } else if (activeTab === 2) {
      certificationForm.resetFields();
    }
  };

  const handleSave = async () => {
    console.log('call')
    try {
      await mainForm.validateFields();
      if (!formData.orderNumber) {
        message.error('Order Number fields cannot be empty.');
        return
      }
      if (!formData.material) {
        message.error('Material fields cannot be empty.');
        return
      }
      if (!formData.recipe) {
        message.error('Recipe fields cannot be empty.');
        return
      }
      if (!formData.targetQuantity) {
        message.error('Target Quantity fields cannot be empty.');
        return
      }

      if (formData.batchNumber && formData.batchNumber.length > 0) {
        const batchInvalid = formData.batchNumber.every(tag =>
          !tag.batchNumber && !tag.batchNumberQuantity
        );
        if (batchInvalid) {
          message.error('Batch Number and Batch Number Quantity fields cannot be empty.');
          return;
        }
      }

      // const hasEmptyBatchFields = formData.batchNumber.some(
      //   batch => !batch.batchNumber || !batch.batchNumberQuantity
      // );

      // if (hasEmptyBatchFields) {
      //   message.error('Batch Number and Batch Number Quantity fields cannot be empty.');
      //   return;
      // }

      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      const payload = {
        ...formData,
        site: site,
        localDateTime: new Date().toISOString(),
      };

      const res = await updateProcess(site, userId, payload);
      if (res.errorCode) {
        message.error(res.message);
        return;
      } else {
        message.success(res.message_details.msg);
        setFormData(res.processOrderResponse)
        setCall(call + 1);
        setActiveTab(1)
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAdd = async () => {

    try {
      await mainForm.validateFields();
      if (!formData.orderNumber) {
        message.error('Process Order fields cannot be empty.');
        return
      }
      if (!formData.material) {
        message.error('Material fields cannot be empty.');
        return
      }
      if (!formData.recipe) {
        message.error('Recipe fields cannot be empty.');
        return
      }

      if (!formData.targetQuantity) {
        message.error('Target Quantity fields cannot be empty.');
        return
      }

      if (formData.batchNumber && formData.batchNumber.length > 0) {
        const batchInvalid = formData.batchNumber.every(tag =>
          !tag.batchNumber && !tag.batchNumberQuantity
        );
        if (batchInvalid) {
          message.error('Batch Number and Batch Number Quantity fields cannot be empty.');
          return;
        }
      }

      // if (!formData.batchNumber || !Array.isArray(formData.batchNumber) || formData.batchNumber.length === 0) {
      //   message.error('Batch Number fields cannot be empty.');
      //   return;
      // }

      // const hasEmptyBatchFields = formData.batchNumber.some(
      //   batch => !batch.batchNumber || !batch.batchNumberQuantity
      // );

      // if (hasEmptyBatchFields) {
      //   message.error('Batch Number and Batch Number Quantity fields cannot be empty.');
      //   return;
      // }

      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      const payload = {
        ...formData,
        site: site,
        userId: userId,
        localDateTime: new Date().toISOString(),
      };
      const res = await addProcess(site, userId, payload);

      if (res.errorCode) {
        message.error(res.message);
        return;
      }
      setCall(call + 1);
      handleCancel();
      setActiveTab(1)
      setFormChange(false)
      message.success(res.message_details.msg);
    } catch (error) {
      message.error(error.message || 'An error occurred while adding the user. Please check your input.');
    }
  };

  const fieldsToInclude = [
    "orderNumber",
    "status",
    "orderType",
    "material",
    "materialVersion",
    "recipe",
    "recipeVersion",
    "targetQuantity",
    "unit",
    "startDate",
    "finishDate",
    "schedFinTime",
    "schedStartTime",
    "priority",
    // "inUse",
    "availableQtyToRelease",
  ];

  const handleValuesChange = (changedValues: any) => {
    setFormData(prevData => ({
      ...prevData,
      ...changedValues
    }));
    setFormChange(true)
  };

  return (
    <div style={{ padding: '0px 20px' }}>
      <TabContext value={activeTab.toString()}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label={t('main')} value="1" />
            {/* <Tab label={t('productionQuantities')} value="2" /> */}
            <Tab label={t('serialBatchNumber')} value="2" />
            {/* <Tab label={t('customData')} value="4" /> */}
          </TabList>
        </Box>
        <TabPanel value="1">
          <DynamicForm
            data={formData}
            fields={fieldsToInclude}
            onValuesChange={handleValuesChange}
          />
        </TabPanel>
        {/* <TabPanel value="2">
          <ProductionQuantitiesForm />
        </TabPanel> */}
        <TabPanel value="2">
          <SerialBatchNumber />
        </TabPanel>
        {/* <TabPanel value="4">
          <CustomDataTable />
        </TabPanel> */}
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
