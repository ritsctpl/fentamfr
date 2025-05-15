'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/auditLog/styles/auditLog.module.css';
import { Box, Tabs, Tab } from '@mui/material';
import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import CommonTable from '@modules/auditLog/components/CommonTable';
import { useTranslation } from 'react-i18next';
import { AuditLogContext } from '@modules/auditLog/hooks/AuditLogUseContext';
import { Form, Modal, Input, Row, Col, Button, Select, Table, message, DatePicker } from 'antd';
import { GrChapterAdd } from 'react-icons/gr';
import { fetchUserTop50 } from '@services/userService';
import { categoryData } from '@modules/auditLog/types/auditLogTypes';
import { get24HoursData, searchAuditLog } from '@services/auditLogService';
import { log } from 'util';
import { fetchTop50Sites } from '@services/logBuyOffReportService';
import dayjs from 'dayjs';

interface FormValues {
  user: string;
  category: string;
  changeType: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  site: string;
  fieldname: string;
}

const { Option } = Select;

const AuditLogMain: React.FC = () => {
  const [formData, setFormData] = useState<object>();
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const { t } = useTranslation()
  const [form] = Form.useForm<FormValues>();

  const [userVisible, setUserVisible] = useState(false);
  const [userData, setUserData] = useState<any[]>([]);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [filteredCategory, setFilteredCategory] = useState<any[]>(categoryData);
  const [oPlant, setOPlant] = useState('');
  const [siteVisible, setSiteVisible] = useState(false);
  const [siteColumns, setSiteColumns] = useState<any[]>([]);
  const [siteData, setSiteData] = useState<any[]>([]);

  useEffect(() => {
    fetch24HrData();
  }, []);

  const onValuesChange = (changedValues: any) => {
    setFormData((prevData) => ({
      ...prevData,
      ...changedValues,
    }));
  };

  const handleFormChange = (changedValues: any, allValues: FormValues) => {
    onValuesChange(allValues);
  };

  const handleClear = () => {
    form.resetFields();
    setCustomDate("24hours");
  };

  const fetch24HrData = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    let response;

    const payload = {
      site: site,
      userId: userId || '',
      category: '',
      change_type: 'All',
      dateRange: '24hours',
      start_date: "",
      end_date: "",
    }

    try {
      response = await get24HoursData(payload);
      if (!response?.errorCode) {
        setFilteredData(response || []);
      }
      else {
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleSave = async () => {
    message.destroy();
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    setLoading(true);
    const values = await form.validateFields();

    try {
      let startDate, endDate;
      startDate = form.getFieldValue('startDate') || "";
      endDate = form.getFieldValue('endDate') || "";
      // debugger

      // add a ccondtion
      if (values?.dateRange === "custom") {
        if (!startDate) {
          message.error('Start date cannot be empty');
          setLoading(false);
          return;
        }
        
        if (!endDate) {
          message.error('End Date cannot be empty');
          setLoading(false);
          return;
        }

        
  
        startDate = dayjs(startDate);
        endDate = dayjs(endDate);
  
        if (startDate.isAfter(endDate)) {
          message.error('Start date cannot be greater than end date');
          setLoading(false);
          return;
        }
  
        startDate = startDate.format('YYYY-MM-DDTHH:mm:ss');
        endDate = endDate.format('YYYY-MM-DDTHH:mm:ss');
      }

      if (values?.dateRange == "custom") {
        if (startDate != "" && endDate != "") {
          startDate = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss');
          endDate = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss');
        }
        else {
          startDate = "";
          endDate = "";
        }
      }

      if(values?.dateRange == "24hours"){
        startDate = "";
        endDate = "";
      }

      const payload = {
        site: oPlant || site,
        userId: values?.user || userId || '',
        category: values?.category ? values?.category : '',
        change_type: values?.changeType ? values?.changeType : 'All',
        dateRange: values?.dateRange ? values?.dateRange : '24hours',
        start_date: startDate ? startDate : "",
        end_date: endDate ? endDate : "",
      }
      const searchDataResponse = await searchAuditLog(site, userId, payload);

      if (searchDataResponse?.message) {
        message.error(searchDataResponse?.message);
        setFilteredData([]);
      }
      else {
        setFilteredData(searchDataResponse || []);
      }

    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value;

    const patterns: { [key: string]: RegExp } = {
      user: /^[A-Za-z0-9_]*$/,
    };

    if (key === 'user') {
      newValue = newValue.replace(/[^A-Za-z0-9_]/g, '');
    }
    if (key === 'site') {
      newValue = newValue.replace(/[^A-Za-z0-9*_]/g, '').toUpperCase();
      setOPlant(newValue);
      // Directly set the uppercase value in the form
      form.setFieldsValue({ [key]: newValue });
      onValuesChange({ [key]: newValue });
      return; // Return early to avoid the patterns check below


    }

    if (key === 'category') {
      newValue = newValue.replace(/[^A-Za-z0-9*_]/g, '').toUpperCase();

      // Directly set the uppercase value in the form
      form.setFieldsValue({ [key]: newValue });
      onValuesChange({ [key]: newValue });
      return; // Return early to avoid the patterns check below
    }

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
      onValuesChange({ [key]: newValue });
    }
  };

  const handleUserClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('user');

    try {
      let response;
      response = await fetchUserTop50();

      if (response && !response.errorCode) {
        let filteredData = response;

        if (typedValue) {
          filteredData = response.filter((item) => {
            return (
              item.user.toLowerCase().includes(typedValue.toLowerCase()) ||
              item.lastName.toLowerCase().includes(typedValue.toLowerCase())
            );
          });
        }

        const formattedData = filteredData.map((item: any, index: number) => ({
          id: index,
          ...item,
        }));
        setUserData(formattedData);
      } else {
        setUserData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setUserVisible(true);
  };

  const handleUserOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        user: selectedRow.user,
      });
      onValuesChange({
        user: selectedRow.user.toUpperCase(),
      });
    }

    setUserVisible(false);
  };

  const handleCategoryClick = () => {
    setCategoryVisible(true);
  };

  const handleCategoryOk = (selectedRow: any) => {
    if (selectedRow) {
      form.setFieldsValue({
        category: selectedRow.Category,
      });
      onValuesChange({
        category: selectedRow.Category,
      });
    }
    setCategoryVisible(false);
  };

  const categoryColumns = [
    {
      title: t("category"),
      dataIndex: "Category",
      key: "Category",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("currentSetting"),
      dataIndex: "CurrentSetting",
      key: "CurrentSetting",
    },
  ];

  const userColumn = [
    {
      title: t("user"),
      dataIndex: "user",
      key: "user",
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
    },
  ]

  const handleRowSelect = (record: any) => {
    console.log(record, 'record');
  };

  const handleDateRange = (value) => {
    console.log(value);
    setCustomDate(value)
  }

  const handleBrowseChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value.replace(/[^A-Za-z0-9_]/g, '').toUpperCase();
    form.setFieldsValue({ [fieldName]: value });

    const filtered = categoryData.filter((item) =>
      item.Category.toLowerCase().includes(value.toLowerCase()) ||
      item.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategory(filtered);
  }

  const handleClick = async (value: string, fieldName: string) => {
    if (fieldName == "site") {
      try {
        let oList;
        oList = await fetchTop50Sites();
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        const oTableColumns = [
          { title: t('site'), dataIndex: 'site', key: 'site' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
        ]
        setSiteColumns(oTableColumns);
        setSiteData(oList || []);
        setSiteVisible(true);
      } catch (error) {
        console.error("Error fetching site list:", error);
      }
    }
  }

  const handleSiteOk = (record: any) => {
    console.log(record, 'record');
    form.setFieldsValue({
      site: record?.site,
    });
    setOPlant(record?.site);
    onValuesChange({
      site: record?.site,
    });
    setSiteVisible(false);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Form
              form={form}
              layout="horizontal"
              onValuesChange={handleFormChange}
              style={{ padding: '20px', }}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Row gutter={24} justify="start" align="middle"
                style={{ marginLeft: '0px' }}
              >

                <Col span={7}>
                  <Form.Item
                    name="site"
                    label={<strong>{t('site')}</strong>}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Input
                      suffix={<GrChapterAdd onClick={() => handleClick('', "site")} />}
                      value={oPlant}
                      onChange={(e) => handleInputChange(e, "site")}
                    />
                  </Form.Item>
                </Col>

                <Col span={7} >
                  <Form.Item
                    label={<strong>{t('user')}</strong>}
                    name="user"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Input
                      placeholder="Enter user"
                      size="middle"
                      suffix={
                        <GrChapterAdd
                          onClick={() =>
                            handleUserClick()
                          }
                        />
                      }
                      onChange={(e) => handleInputChange(e, 'user')}
                    />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    label={<strong>{t('category')}</strong>}
                    name="category"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Input
                      placeholder="Enter category"
                      size="middle"
                      onChange={(e) => handleBrowseChange(e, 'category')}
                      suffix={
                        <GrChapterAdd
                          onClick={handleCategoryClick}
                        />
                      }
                    />
                  </Form.Item>
                </Col>

              </Row>

              <Row gutter={24} justify="start" align="middle"
                style={{ marginLeft: '0px' }}
              >


                <Col span={7}>
                  <Form.Item
                    label={<strong>{t('changeType')}</strong>}
                    name="changeType"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Select
                      placeholder="Select change type"
                      size="middle"
                      defaultValue="All"
                    >
                      <Option value="All">All</Option>
                      <Option value="Create">Create</Option>
                      <Option value="Update">Update</Option>
                      <Option value="Delete">Delete</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={7} >
                  <Form.Item
                    label={<strong>{t('dateRange')}</strong>}
                    name="dateRange"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Select
                      placeholder="Select date range"
                      size="middle"
                      defaultValue="24hours"
                      style={{ width: "100%" }}
                      onChange={handleDateRange}
                    >
                      <Option value="24hours">24 hours</Option>
                      <Option value="today">Today</Option>
                      <Option value="yesterday">Yesterday</Option>
                      <Option value="thisWeek">This week</Option>
                      <Option value="lastWeek">Last week</Option>
                      <Option value="thisMonth">This month</Option>
                      <Option value="lastMonth">Last month</Option>
                      <Option value="thisYear">This year</Option>
                      <Option value="lastYear">Last year</Option>
                      <Option value="custom">Custom</Option>
                    </Select>
                  </Form.Item>
                </Col>

                {/* </Row>
              <Row justify="center" style={{ marginTop: '32px' }}> */}
                <Col span={7}>
                  <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button
                      type="primary"
                      onClick={handleSave}
                      style={{ marginRight: '16px' }}
                      size="middle"
                    >
                      {t('search')}
                    </Button>
                    <Button
                      onClick={handleClear}
                      size="middle"
                    >
                      {t('clear')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <CommonTable data={filteredData} onRowSelect={handleRowSelect} loading={loading} />
          </>
        );
      default:
        return null;
    }
  };

  const handleDateRangeChange = (fieldname: any, value: any) => {
    if (fieldname === "dateRange") {

      if (value != "custom") {
        form.setFieldValue("startDate", "");
        form.setFieldValue("endDate", "");
      }
    }
    else if (fieldname === "startDate" || fieldname === "endDate") {
      // Store the raw dayjs object in the form
      form.setFieldValue(fieldname, value);
    } else {
      form.setFieldValue(fieldname, value);
    }
  };

  const renderTabContentForCustom = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Form
              form={form}
              layout="horizontal"
              onValuesChange={handleFormChange}
              style={{ padding: '20px', }}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Row gutter={24} justify="start" align="middle"

              >

                <Col span={7}>
                  <Form.Item
                    name="site"
                    label={<strong>{t('site')}</strong>}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Input
                      suffix={<GrChapterAdd onClick={() => handleClick('', "site")} />}
                      value={oPlant}
                      onChange={(e) => handleInputChange(e, "site")}
                    />
                  </Form.Item>
                </Col>

                <Col span={7} >
                  <Form.Item
                    label={<strong>{t('user')}</strong>}
                    name="user"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Input
                      placeholder="Enter user"
                      size="middle"
                      suffix={
                        <GrChapterAdd
                          onClick={() =>
                            handleUserClick()
                          }
                        />
                      }
                      onChange={(e) => handleInputChange(e, 'user')}
                    />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    label={<strong>{t('category')}</strong>}
                    name="category"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Input
                      placeholder="Enter category"
                      size="middle"
                      onChange={(e) => handleBrowseChange(e, 'category')}
                      suffix={
                        <GrChapterAdd
                          onClick={handleCategoryClick}
                        />
                      }
                    />
                  </Form.Item>
                </Col>

              </Row>

              <Row gutter={24} justify="start" align="middle"

              >


                <Col span={7}>
                  <Form.Item
                    label={<strong>{t('changeType')}</strong>}
                    name="changeType"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Select
                      placeholder="Select change type"
                      size="middle"
                      defaultValue="All"
                    >
                      <Option value="All">All</Option>
                      <Option value="Create">Create</Option>
                      <Option value="Update">Update</Option>
                      <Option value="Delete">Delete</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={7} >
                  <Form.Item
                    label={<strong>{t('dateRange')}</strong>}
                    name="dateRange"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    <Select
                      placeholder="Select date range"
                      size="middle"
                      defaultValue="24hours"
                      style={{ width: "100%" }}
                      onChange={handleDateRange}
                    >
                      <Option value="24hours">24 hours</Option>
                      <Option value="today">Today</Option>
                      <Option value="yesterday">Yesterday</Option>
                      <Option value="thisWeek">This week</Option>
                      <Option value="lastWeek">Last week</Option>
                      <Option value="thisMonth">This month</Option>
                      <Option value="lastMonth">Last month</Option>
                      <Option value="thisYear">This year</Option>
                      <Option value="lastYear">Last year</Option>
                      <Option value="custom">Custom</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={7}>
                  <Form.Item
                    label={<strong>{t('startDate')}</strong>}
                    name="startDate"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    {/* <Input type="date" size="middle" /> */}
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


              </Row>
              <Row gutter={24} justify="start" align="middle"

              >
                <Col span={7}>
                  <Form.Item
                    label={<strong>{t('endDate')}</strong>}
                    name="endDate"
                    style={{ marginBottom: '24px' }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    {/* <Input type="date" size="middle" /> */}
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

                <Col span={14}>
                  <Form.Item wrapperCol={{ offset: 4 }}>
                    <Button
                      type="primary"
                      onClick={handleSave}
                      style={{ marginRight: '16px' }}
                      size="middle"
                    >
                      {t('search')}
                    </Button>
                    <Button
                      onClick={handleClear}
                      size="middle"
                    >
                      {t('clear')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <CommonTable data={filteredData} onRowSelect={handleRowSelect} loading={loading} customDate={customDate} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AuditLogContext.Provider value={{ formData, setFormData }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("auditLogReport")} onSiteChange={function (): void {
              setCall(call + 1); form.resetFields();
              setLoading(false)
            }}
          />
        </div>
        <div className={styles.dataFieldBody}>

          {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="Activity Group Tabs">
              <Tab label={t("main")} />
            </Tabs>
          </Box>
          <Box sx={{ padding: 2 }}> */}
          {customDate == 'custom' ? renderTabContentForCustom() : renderTabContent()}
          {/* </Box> */}
        </div>
      </div>
      <Modal
        title={t("selectUser")}
        open={userVisible}
        onCancel={() => setUserVisible(false)}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
            onDoubleClick: () => handleUserOk(record),
          })}
          columns={userColumn}
          dataSource={userData}
          rowKey="user"
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
          bordered={true}
          size="small"
        />
      </Modal>
      <Modal
        title={t("selectCategory")}
        open={categoryVisible}
        onCancel={() => setCategoryVisible(false)}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
            onDoubleClick: () => handleCategoryOk(record),
          })}
          columns={categoryColumns}
          dataSource={filteredCategory}
          rowKey="Category"
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
          bordered={true}
          size="small"
        />
      </Modal>
      <Modal
        title={t("selectSite")}
        open={siteVisible}
        onCancel={() => setSiteVisible(false)}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
            onDoubleClick: () => handleSiteOk(record),
          })}
          columns={siteColumns}
          dataSource={siteData}
          rowKey="site"
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
          bordered={true}
          size="small"
        />
      </Modal>
    </AuditLogContext.Provider>
  );
};

export default AuditLogMain;

