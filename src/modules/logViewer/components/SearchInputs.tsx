import React, { useEffect, useState } from 'react';
import { Input, Button, Row, Col, Form, Modal, Tooltip, Table, message, Select, DatePicker } from 'antd';

import dayjs from 'dayjs';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { getLogList } from '@services/logViewerService';

interface SearchInputsProps {
  setData: (data: any[]) => void;
  type: string;
  plant: string;
  user: string;
  setUser: (user: string) => void;
  level: string;
  setLevel: (level: string) => void;
}

const SearchInputs: React.FC<SearchInputsProps> = ({ setData, type, plant, user, setUser, level, setLevel
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  

  useEffect(() => {
    setData([]);
    setLevel("info");
    form.resetFields();
  }, [plant]);


  const levelOptions = [
    { value: 'info', label: 'Info' },
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
  ];

  const handleSearch = async () => {
    message.destroy();
    const cookies = parseCookies();
    const site = cookies?.site;
    const user = cookies?.rl_user_id;

    let startDate = form.getFieldValue("startDate");
    let endDate = form.getFieldValue("endDate");
    debugger
    // Ensure dates are formatted correctly only if they are selected
    startDate = startDate ? dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss') : null;
    endDate = endDate ? dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss') : null;

    // Check if dates are empty
    // if (!startDate || !endDate) {
    //     message.error("Please select both start and end dates");
    //     return;
    // }

    // Validate start date is not after end date
    if (dayjs(startDate).isAfter(dayjs(endDate))) {
        message.error("Start date cannot be greater than end date");
        return;
    }

    let sample = {
        site,
        userId: user,
        level,
        startDate,
        endDate
    };

    try {
        const response = await getLogList(sample);
        const formattedResponse = response.map((item, index) => ({
            ...item,
            key: index
        }));
        setData(formattedResponse || []);
    } catch (error) {
        console.error('Error fetching log data:', error);
    }
};




  const handleSelectChange = (field: any, value: any) => {
    setLevel(value);
    form.setFieldValue("level", value);
  }

  const handleDateRangeChange = (fieldname: string, value: any) => {
    form.setFieldValue(fieldname, value);
  };

  const renderProcessFields = () => (
    <div style={{ marginTop: '2%' }}>

      {/* first row */}
      <Row gutter={24} justify="center" align="middle">
        <Col span={6}>
          <Form.Item
            name="level"
            label={<strong>{t('level')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Select
              defaultValue={levelOptions[0].value}
              value={level}
              onChange={(value) => handleSelectChange("level", value)}
              options={levelOptions}
              placeholder="Select level"

            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="startDate"
            label={<strong>{t('startDate')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <DatePicker
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(value) => handleDateRangeChange("startDate", value)}
              placeholder="Select date and time"
              allowClear
              style={{ width: '100%' }}
              value={form.getFieldValue('startDate')}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="endDate"
            label={<strong>{t('endDate')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <DatePicker
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(value) => handleDateRangeChange("endDate", value)}
              placeholder="Select date and time"
              allowClear
              style={{ width: '100%' }}
              value={form.getFieldValue('endDate')}
            />
          </Form.Item>
        </Col>


      </Row>

      {/* second row */}
      <Row 
      justify="center" 
      align="middle"
      
      >
        <Col span={4} style={{ display: 'flex', justifyContent: 'center' }}>
          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button
              type="primary"
              onClick={handleSearch}
              style={{ marginRight: 8, backgroundColor: '#006064' }}
            >
              {t('search')}
            </Button>
            <Button
              onClick={() => {
                setData([]);
                setUser("");
                
                form.resetFields();
                form.setFieldsValue({ startDate: undefined, endDate: undefined });
              }}
            >
              {t('clear')}
            </Button>
          </Form.Item>
        </Col>
      </Row>

    </div>
  );



  return (
    <>
      <Form layout="horizontal" style={{ marginRight: '110px' }} form={form}>
        {renderProcessFields()}

      </Form>


    </>
  );
};

export default SearchInputs;