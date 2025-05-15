// pages/index.tsx
import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, Table, Popconfirm, Modal, Row, Col, Select, message, Drawer, Switch, Checkbox, notification } from 'antd';
import styles from '../styles/Tab.module.css';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import dayjs  from 'dayjs';
import { ShiftContext } from '../hooks/shiftContext';
import { Break, CalendarRule, ColumnsType, Data, ShiftInterval } from '../types/shiftTypes';
import { parseCookies } from 'nookies';
import { addShift, updateShift } from '@services/shiftService';
import { Option } from 'antd/es/mentions';
import { CustomDatePicker ,CustomTimePicker} from './CustomDatePicker';
import { useTranslation } from 'react-i18next';
import CalendarTable from './CalenderComponent';
import CustomDataTable from './customData';
import { DynamicBrowse } from '@components/BrowseComponent';
import CalendarTab from './CalenderTab';
import { DeleteOutline, DeleteOutlined } from '@mui/icons-material';


const ShiftForm = ({ onCancel }) => {
  const { isEditing, erpShift, setFormData ,formData,call,setCall,setValueChange} = useContext(ShiftContext);
   const [currentFormData, setCurrentFormData] = useState<Data>(formData);
  const [mainForm] = Form.useForm();
  const [shiftForm] = Form.useForm();
  const [calenderForm] = Form.useForm();
  const [shiftIntervals, setShiftIntervals] = useState<ShiftInterval[]>(currentFormData.shiftIntervals);
  const [calendarRule, setCalendarRule] = useState<CalendarRule[]>(currentFormData.calendarRules);
  const [editcalendarRule, seteditCalendarRule] = useState<CalendarRule| null>(null);
  const [editingShift, setEditingShift] = useState<ShiftInterval | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [breakIdCounter, setBreakIdCounter] = useState<number>(1);
  const [isCalendarRuleModalVisible, setIsCalendarRuleModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const {t} =useTranslation()


  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValueChange(true);
    setActiveTab(newValue);
  };

  const showBreaks = (breakList: Break[]) => {
    setBreaks(breakList);
    setDrawerVisible(true);
  };



const handleDeleteCalendarRule = (key: string) => {
  setValueChange(true);
  setCalendarRule(calendarRule.filter(item => item.day !== key));
};


const handleCalendarRuleCancel = () => {
  setValueChange(true);
  setIsCalendarRuleModalVisible(false);
};
const handleInsertShift = () => {
    setValueChange(true);
  setEditingShift(null);
  setBreaks([]);
  setBreakIdCounter(1);
  shiftForm.resetFields();
  setIsModalVisible(true);
};
 

  const handleEditShift = (record: ShiftInterval) => {
    setValueChange(true);
    setEditingShift(record);
    setIsModalVisible(true);
    shiftForm.setFieldsValue({
      validFrom: dayjs(record.validFrom),
      validEnd: dayjs(record.validEnd),
      startTime: dayjs(record.startTime, 'HH:mm:ss'),
      endTime: dayjs(record.endTime, 'HH:mm:ss'),
      clockInStart: dayjs(record.clockInStart, 'HH:mm:ss'),
      clockInEnd: dayjs(record.clockInEnd, 'HH:mm:ss'),
      clockOutStart: dayjs(record.clockOutStart, 'HH:mm:ss'),
      clockOutEnd: dayjs(record.clockOutEnd, 'HH:mm:ss'),
      labourAssign: record.labourAssign,
    });
    setBreaks(record.breakList);
    setBreakIdCounter(Math.max(...record.breakList.map(b => b.breakId)) + 1);
  };

  const handleCancel = () => {
    if (activeTab === '1') {
      mainForm.resetFields();
    } else if (activeTab === '2') {
      shiftForm.resetFields();
      setIsModalVisible(false);
    }
  };
  const handleValuesChange = (changedValues) => {
    setValueChange(true);
    // Check if 'shiftId' exists in changedValues
    if (changedValues.hasOwnProperty('shiftId')) {
      // Process shiftId to remove spaces, convert to uppercase, and filter characters
      const processedShiftName = changedValues.shiftId
        .replace(/\s+/g, '') // Remove all spaces
        .toUpperCase()      // Convert to uppercase
        .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores
  console.log(processedShiftName)
      changedValues.shiftId = processedShiftName;
    }
  
    // Log the processed shiftId for debugging
    console.log(changedValues.shiftId);
  
    // Update form data state with processed values
    setCurrentFormData((prevData) => ({
      ...prevData,
      ...changedValues,
    }));
  };
  
  const handleOk = () => {
    setValueChange(true);
   
    if (activeTab === '1') {
        mainForm.validateFields().then(values => {
        console.log('Main Tab Values:', values);
      }).catch(errorInfo => {
        console.error('Failed to save Main Tab:', errorInfo);
      });
    } 
    else if (activeTab === '2') {

      // Filter out breaks with empty start and end times
      const hasInvalidBreaks = breaks.some(value => value.breakTimeStart === "" || value.breakTimeEnd === "");
  
      if (hasInvalidBreaks) {
          // Show an error notification if any break is invalid
          notification.error({
              message: 'Invalid Break Time',
              description: 'One or more breaks have empty start or end times. Please correct them before saving.',
              placement: 'topRight',
          });
          return; // Stop further processing if breaks are invalid
      } 
  
      // Retrieve form values directly
      const values = shiftForm.getFieldsValue(); // Assuming shiftForm is a reference to your form
  
      // Ensure that form values are not undefined or invalid
      if (!values.validFrom || !values.validEnd || !values.startTime || !values.endTime) {
          notification.error({
              message: 'Incomplete Form Data',
              description: 'Please make sure all required fields are filled out before saving.',
              placement: 'topRight',
          });
          return; // Stop further processing if form data is incomplete
      }
  
      const newShift: ShiftInterval = {
          key: editingShift ? editingShift.key : `${Date.now()}`,
          validFrom: values.validFrom.format('YYYY-MM-DDTHH:mm'),
          validEnd: values.validEnd.format('YYYY-MM-DDTHH:mm'),
          startTime: values.startTime.format('HH:mm:ss'),
          endTime: values.endTime.format('HH:mm:ss'),
          clockInStart: values.clockInStart,
          clockInEnd: values.clockInEnd,
          clockOutStart: values.clockOutStart,
          clockOutEnd: values.clockOutEnd,
          labourAssign: values.labourAssign,
          breakList: breaks.filter(value => value.breakTimeStart && value.breakTimeEnd), // Filter valid breaks
      };
  
      // Update the shift intervals
      if (editingShift) {
          setShiftIntervals(shiftIntervals.map(item => item.validFrom === editingShift.validFrom ? newShift : item));
      } else {
          setShiftIntervals([...shiftIntervals, newShift]);
      }
  
      // Reset form and state
      shiftForm.resetFields();
      setBreaks([]);
      setIsModalVisible(false);
      console.log("Shift saved successfully");
  }
  
 
    
    
  };
  const handleSave = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    const payload = {
      site,
        userId,
        ...currentFormData,
        shiftIntervals:shiftIntervals,
        customDataList: formData.customDataList,
        localDateTime: new Date().toISOString(),
    };

    try {
      console.log(payload,'called')
       const res= await updateShift(site, userId, payload);
       console.log(res,'called');
       
       message.destroy();
        if (res.errorCode) {
          message.error(res.message);
          return;
        }
      
        message.success(res.message_details.msg);
      setCall(call + 1);
    } catch (error) {
      console.error('Error updating shift:', error);
      message.error('Error updating shift.');
    }
    handleCancel();
    setValueChange(false);
  };
  const handleAdd = async () => {
    try {
      // Validate main form
      await mainForm.validateFields();
  
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;
      
      
  
      const payload = {
        site,
        userId,
        ...currentFormData,
        shiftIntervals: shiftIntervals,
        customDataList: currentFormData.customDataList,
        localDateTime: new Date().toISOString(),
      };
      console.log(payload,"adddss")
      // Perform the API call
      const res = await addShift(payload);
      console.log(res, "adddss");
      message.destroy();
      if (res.errorCode) {
        message.error(res.message);
        return;
      }
      message.success(res.message_details.msg);
      setCall(call + 1);
      handleCancel();
    } catch (error) {
      // Handle validation errors
      console.log('Validation failed:', error);
      message.error('Error create shift ');

    }
    setValueChange(false);
  };
  
  const handleAddBreak = () => {
    setBreaks([...breaks, {
      uniqueId: Date.now(),
      breakId: breaks.length+1,
      breakType: '',
      breakTimeStart: '',
      breakTimeEnd: '',
      meanTime: 0,
      reason: '',
    }]);
    setBreakIdCounter(breakIdCounter + 1);
  };
  const handleRowSelect = (key: string, checked: boolean) => {
    setSelectedRowKeys((prevSelectedKeys) =>
      checked
        ? [...prevSelectedKeys, key]
        : prevSelectedKeys.filter((item) => item !== key)
    );
  };

  const handleRemoveSelected = () => {
    setShiftIntervals((prevIntervals) =>
      prevIntervals.filter((item) => !selectedRowKeys.includes(item.validFrom))
    );
    setSelectedRowKeys([]); // Clear selected keys
  };

  const handleDeleteBreak = (uniqueId: number) => {
    setBreaks(breaks.filter(b => b.uniqueId !== uniqueId));
  };
  const calculateMeanTime = (uniqueId: string, startTime: string, endTime: string) => {
    if (!startTime || !endTime) return;

    const start = dayjs(startTime, 'HH:mm:ss');
    let end = dayjs(endTime, 'HH:mm:ss');

    // If end time is before start time, assume it's the next day
    if (end.isBefore(start)) {
      end = end.add(1, 'day');
    }

    const diffMinutes = end.diff(start, 'minute');
    
    // Update the record with the calculated mean time
    handleBreakChange(diffMinutes.toString(), uniqueId, 'meanTime');
  };
  const handleBreakChange = (value: any, uniqueId: any, field: string) => {
    setBreaks(prevBreaks => {
      const updatedBreaks = prevBreaks.map(b => {
        if (b.uniqueId === uniqueId) {
          const updatedRecord = { ...b, [field]: value };

          // Calculate meanTime when either start or end time changes
          if (field === 'breakTimeStart' || field === 'breakTimeEnd') {
            calculateMeanTime(uniqueId, updatedRecord.breakTimeStart, updatedRecord.breakTimeEnd);
          }

          return updatedRecord;
        }
        return b;
      });
      return updatedBreaks;
    });
    
  };
  
  const calendarRuleColumns: ColumnsType<CalendarRule> = [
    { title: t('day'), dataIndex: 'day', key: 'day', ellipsis:true },
    { title: t('productionDay'), dataIndex: 'prodDay', key: 'prodDay', ellipsis:true  },
    { title: t('dayClass'),dataIndex: 'dayClass', key: 'dayClass', ellipsis:true },
    {
      title: t('action'),
      key: 'action',
      ellipsis:true,
      render: (text: any, record: CalendarRule) => (
        <>
          {/* <Button type="link" onClick={() => handleEditCalendarRule(record)}>
          {t('edit')}
          </Button> */}
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteCalendarRule(record.day)}>
            <Button type="link" danger>
              {t('delete')}
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedRowKeys(shiftIntervals.map(record => record.validFrom));
    } else {
      setSelectedRowKeys([]);
    }
  };
  const isHeaderCheckboxChecked = () => {
    return shiftIntervals?.length > 0 && selectedRowKeys?.length === shiftIntervals?.length;
  };
  const shiftColumns = [
    {
      title: (
        <Checkbox
          onChange={handleSelectAll}
          checked={isHeaderCheckboxChecked()}
        />
      ),
      key: 'select', 
      ellipsis:true,
      width: 50,
      render: (text, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.validFrom)}
          onChange={(e) => handleRowSelect(record.validFrom, e.target.checked)}
        />
      ),
    },
    {
      title: t('validityShiftInfo'),
      key: 'validityShiftInfo',
      ellipsis:true,
      render: (text: any, record: ShiftInterval) => (
        <div>
          <div><strong>Valid From:</strong></div>
          <div className={styles.tableValuecontent}>{dayjs(record.validFrom).format('YYYY-MM-DD HH:mm')}</div>
          <div><strong>Valid To:</strong></div>
          <div className={styles.tableValuecontent}>{dayjs(record.validEnd).format('YYYY-MM-DD HH:mm')}</div>
          <div><strong>Start Time:</strong></div>
          <div className={styles.tableValuecontent}>{dayjs(record.startTime, 'HH:mm:ss').format('HH:mm:ss')}</div>
          <div><strong>End Time:</strong></div>
          <div className={styles.tableValuecontent}>{dayjs(record.endTime, 'HH:mm:ss').format('HH:mm:ss')}</div>
        </div>
      ),
    },
    {
      title: t('clockInOutInfo'),
      key: 'clockInOutInfo',
      ellipsis:true,
      render: (text: any, record: ShiftInterval) => (
        <div>
          <div><strong>Clock In Start:</strong></div>
          <div className={styles.tableValuecontent}>{dayjs(record.clockInStart, 'HH:mm:ss').format('HH:mm:ss')}</div>
          <div><strong>Clock In End:</strong></div>
          <div className={styles.tableValuecontent}>{record.clockInEnd ? dayjs(record.clockInEnd, 'HH:mm:ss').format('HH:mm:ss') : 'Not set'}</div>
          <div><strong>Clock Out Start:</strong></div>
          <div className={styles.tableValuecontent}>{dayjs(record.clockOutStart, 'HH:mm:ss').format('HH:mm:ss')}</div>
          <div><strong>Clock Out End:</strong></div>
          <div className={styles.tableValuecontent}>{dayjs(record.clockOutEnd, 'HH:mm:ss').format('HH:mm:ss')}</div>
        </div>
      ),
    },
    {
      title: t('labourInfo'),
      key: 'labourInfo',
      ellipsis:true,
      render: (text: any, record: ShiftInterval) => (
        <div>
          <div><strong>Labour Assign:</strong></div>
          <div>{record.labourAssign}</div>
          <Button type="primary"  onClick={() => showBreaks(record.breakList)}>
            View Breaks
          </Button>
        </div>
      ),
    },
    {
      title: t('action'),
      key: 'action',
      ellipsis:true,
      width: 100,
      render: (text: any, record: ShiftInterval) => (
        <>
          <Button type="primary" onClick={() => handleEditShift(record)}>
          {t('details')}
          </Button>
         
        </>
      ),
    },
  ];

  const breakColumns = [
    {
      title: 'Break ID',
      dataIndex: 'breakId',
      key: 'breakId',
      ellipsis:true,
      width: 100,
    },
    {
      title: 'Break Type',
      dataIndex: 'breakType',
      ellipsis:true,
      key: 'breakType',
      render: (_: any, record: Break) => (
        <Select
          value={record.breakType || 'lunch'}
          onChange={(value) => handleBreakChange(value, record.uniqueId, 'breakType')}
          style={{ width: 120 }} // Adjust the width as needed
        >
          <Option value="lunch">Lunch</Option>
          <Option value="coffee">Coffee</Option>
          <Option value="tea">Tea</Option>
          <Option value="short">Short</Option>
          <Option value="other">Other</Option>
        </Select>
      ),
    },
    {
      title: 'Break Time Start',
      dataIndex: 'breakTimeStart',
      ellipsis:true,
      key: 'breakTimeStart',
      render: (_: any, record: any) => (
        <CustomTimePicker
          format="HH:mm:ss"
          value={record.breakTimeStart ? dayjs(record.breakTimeStart, 'HH:mm:ss') : null}
          onChange={(time) => {
            handleBreakChange(time?.format('HH:mm:ss') || '', record.uniqueId, 'breakTimeStart');
            calculateMeanTime(record.uniqueId, time?.format('HH:mm:ss') || '', record.breakTimeEnd);
          }}
        />
      ),
    },
    {
      title: 'Break Time End',
      dataIndex: 'breakTimeEnd',
      ellipsis:true,
      key: 'breakTimeEnd',
      render: (_: any, record: any) => (
        <CustomTimePicker
          format="HH:mm:ss"
          value={record.breakTimeEnd ? dayjs(record.breakTimeEnd, 'HH:mm:ss') : null}
          onChange={(time) => {
            handleBreakChange(time?.format('HH:mm:ss') || '', record.uniqueId, 'breakTimeEnd');
            calculateMeanTime(record.uniqueId, record.breakTimeStart, time?.format('HH:mm:ss') || '');
          }}
        />
      ),
    },
    {
      title: 'Mins Time',
      dataIndex: 'meanTime',
      ellipsis:true,
      key: 'meanTime',
      render: (_: any, record: Break) => (
        <Input
        type="number"
        value={record.meanTime || 0}
        readOnly
        />
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      ellipsis:true,
      key: 'reason',
      render: (_: any, record: Break) => (
        <Input
          value={record.reason}
          onChange={(e) => handleBreakChange(e.target.value, record.uniqueId, 'reason')}
        />
      ),
    },
    ...(drawerVisible ? [] : [ {
      title: t('action'),
      key: 'action',
      ellipsis:true,
      render: (_: any, record: Break) => (
        <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteBreak(record.uniqueId)}>
          <Button type="link" danger>
          <DeleteOutlined />  
          </Button>
        </Popconfirm>
      ),
    }]),
  ];
  const removeAllShiftIntervals = () => {
    setShiftIntervals([]); // Set to an empty array
  };
  const onSelectResource = (value) => {
    // Check if the value array is empty

    if(value.length ===0) {
      setCurrentFormData(prev => ({
        ...prev,
        resourceId: ""
      }));
    }
    if (value.length > 0) {
    let resourceId = value[0].resource;
      setCurrentFormData(prev => ({
      ...prev,
      resourceId: resourceId
    }));
    }
    
  
    // Update the form data
  
  };
  
  const onSelectWc =(value)=>{
    if(value.length ===0) {
      setCurrentFormData(prev => ({
        ...prev,
        workCenterId: ""
      }));
    }
    if (value.length > 0) {
    let wc = value[0].workCenter;
      setCurrentFormData(prev => ({
      ...prev,
      workCenterId: wc
    }));
    }
    
  }
  const uiResource: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Resource',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'resource',
    tabledataApi: 'resource-service'
  };
  const uiWc: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Work Center',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'api/rits/',
    tabledataApi: 'workcenter-service'
  };
  useEffect(() => {
    console.log('Form Datas Prop Changed:', formData);
    setCurrentFormData(formData);
    setShiftIntervals(formData.shiftIntervals)
    setCalendarRule(formData.calendarRules)
  }, [formData]);
  useEffect(() => {
    mainForm.setFieldsValue(formData);
  }, [formData, mainForm ]);
  const handleShiftNameChange = (e) => {
    const value = e.target.value;
    const processedValue = value
      .replace(/\s+/g, '') 
      .toUpperCase()      
      .replace(/[^A-Z0-9_]/g, ''); 

    mainForm.setFieldsValue({ shiftId: processedValue });

    // Call handleValuesChange to update form data state
    handleValuesChange({ shiftId: processedValue });
  };
  const validateDates = (_, value) => {
    message.destroy();
    const validFrom = shiftForm.getFieldValue('validFrom');
    if (validFrom && value && value.isBefore(validFrom)) {
      message.error('Valid End date must be after Valid From date!');
      shiftForm.setFieldsValue({ validEnd: undefined });
    }
  };
  console.log(formData,"currentFormData");
  
  return (
    <div style={{ padding: "0px 20px" }}>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label={t("main")} value="1" />
            <Tab label={t("shiftInterval")} value="2" />
            <Tab label={t("calendarRules")} value="3" />
            <Tab label={t("calendarOverride")} value="4" />
            <Tab label={t("customData")} value="5" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Form
            form={mainForm}
            layout="horizontal"
            initialValues={currentFormData}
            onValuesChange={handleValuesChange}
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            style={{ width: 600 }}
          >
            <Form.Item
              name="shiftId"
              label={t("shiftName")}
              rules={[{ required: true, message: "" }]}
            >
              <Input
                placeholder="Enter Shift Name"
                disabled={isEditing && erpShift}
                onChange={handleShiftNameChange} // Add onChange handler
              />
            </Form.Item>

            <Form.Item name="description" label={t("description")}>
              <Input placeholder="Enter Description" />
            </Form.Item>

            <Form.Item name="shiftType" label={t("shiftType")}>
              <Select>
                <Option value="Resource">Resource</Option>
                <Option value="WorkCenter">Work Center</Option>
                <Option value="General">General</Option>
              </Select>
            </Form.Item>

            {/* Conditionally render workCenterId or resourceId based on shiftType */}
            {currentFormData.shiftType === "WorkCenter" ? (
              <Form.Item name="workCenterId" label={t("workCenter")} required>
                <DynamicBrowse
                  uiConfig={uiWc}
                  onSelectionChange={onSelectWc}
                  initial={currentFormData.workCenterId}
                />
              </Form.Item>
            ) : currentFormData.shiftType === "Resource" ? (
              <Form.Item name="resourceId" label={t("resource")} required>
                <DynamicBrowse
                  uiConfig={uiResource}
                  onSelectionChange={onSelectResource}
                  initial={currentFormData.resourceId}
                />
              </Form.Item>
            ) : null}

            <Form.Item name="erpShift" label={t("erpShift")}>
              <Switch
                defaultChecked={currentFormData.erpShift} // Set defaultChecked based on your data
              />
            </Form.Item>
          </Form>
        </TabPanel>

        <TabPanel value="2">
          <div className={styles.insertButtonContainer}>
            <Button
              onClick={handleInsertShift}
              style={{ marginBottom: "16px" }}
            >
              {t("insert")}
            </Button>
            <Button
              onClick={removeAllShiftIntervals}
              style={{ marginBottom: "16px", marginLeft: "16px" }}
            >
              {t("removeAll")}
            </Button>
            <Button
              onClick={handleRemoveSelected}
              style={{ marginBottom: "16px", marginLeft: "16px" }}
            >
              {t("removeSelected")}
            </Button>
          </div>
          <Table
            bordered
            columns={shiftColumns}
            dataSource={shiftIntervals}
            // pagination={{ pageSize: 2 }}
            pagination={false}
            scroll={{ y: "calc(100vh - 420px)" }}
            rowKey="key"
          />
        </TabPanel>
        <TabPanel value="3">
          {/* <div className={styles.insertButtonContainer}>
            <Button type="primary" onClick={handleAddCalendarRule} style={{ marginBottom: '16px' }}>
              Insert
            </Button>
            <Button onClick={()=>{}} style={{ marginBottom: '16px', marginLeft: '16px' }}>
              Remove All
            </Button>
          </div>
        <Table columns={calendarRuleColumns} dataSource={calendarRule} pagination={false} /> */}
          <CalendarTable
            currentFormData={currentFormData}
            setCurrentFormData={setCurrentFormData}
          />
        </TabPanel>
        <TabPanel value="4">
          <CalendarTab
            currentFormData={currentFormData}
            setCurrentFormData={setCurrentFormData}
          />
        </TabPanel>
        <TabPanel value="5">
          <CustomDataTable currentFormData={currentFormData} />
        </TabPanel>
      </TabContext>
      <div className={styles.submitButton} style={{ marginTop: "20px" }}>
        {isEditing && erpShift ? (
          <Button type="primary" onClick={handleSave}>
            {t("save")}
          </Button>
        ) : (
          <Button type="primary" onClick={handleAdd}>
            {t("create")}
          </Button>
        )}
        <Button style={{ marginLeft: 8 }} onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>

      <Modal
        title={editingShift ? "Edit Shift Interval" : "Add Shift Interval"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingShift(null);
          setBreaks([]);
          setBreakIdCounter(1);
        }}
        onOk={handleOk}
        width="70%"
        footer={[
          <Button key="back" onClick={handleCancel}>
            {t("cancel")}
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {t("ok")}
          </Button>,
        ]}
      >
        <Form form={shiftForm} layout="horizontal">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="validFrom"
                label="Valid From"
                rules={[
                  { required: true, message: "Please select the start date!" },
                ]}
              >
                <CustomDatePicker showTime format="YYYY-MM-DDTHH:mm" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="validEnd"
                label="Valid End"
                rules={[
                  { required: true, message: "Please select the end date!" },
                  { validator: validateDates },
                ]}
              >
                <CustomDatePicker showTime format="YYYY-MM-DDTHH:mm" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[
                  { required: true, message: "Please select the start time!" },
                ]}
              >
                <CustomTimePicker format="HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="endTime"
                label="End Time"
                rules={[
                  { required: true, message: "Please select the end time!" },
                ]}
              >
                <CustomTimePicker format="HH:mm:ss" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="clockInStart" label="Clock In Start">
                <CustomTimePicker format="HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="clockInEnd" label="Clock In End">
                <CustomTimePicker format="HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="clockOutStart" label="Clock Out Start">
                <CustomTimePicker format="HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="clockOutEnd" label="Clock Out End">
                <CustomTimePicker format="HH:mm:ss" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="labourAssign" label="Labour Assign">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={handleAddBreak}>
              {t("addBreak")}
            </Button>
            {breaks.length !== 0 ? (
              <Table
                columns={breakColumns}
                dataSource={breaks}
                rowKey="uniqueId"
                pagination={false}
                scroll={{ y: "calc(100vh - 525px)" }}
                style={{ marginTop: 16 }}
              />
            ) : null}
          </div>
        </Form>
      </Modal>

      <Modal
        title={calendarRule ? "Edit Calendar Rule" : "Add Calendar Rule"}
        visible={isCalendarRuleModalVisible}
        onCancel={handleCalendarRuleCancel}
        onOk={handleOk}
        width="60%"
        footer={[
          <Button key="back" onClick={handleCalendarRuleCancel}>
            {t("cancel")}
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {t("ok")}
          </Button>,
        ]}
      >
        <Form
          form={calenderForm}
          layout="vertical"
          initialValues={calendarRule}
        >
          <Form.Item
            name="day"
            label="Day"
            rules={[{ required: true, message: "Please input the day!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="prodDay"
            label="Production Day"
            rules={[
              { required: true, message: "Please input the production day!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dayClass"
            label="Day Class"
            rules={[{ required: true, message: "Please input the day class!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title="Breaks"
        placement="right"
        closable
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={900}
      >
        <Table
          columns={breakColumns}
          dataSource={breaks}
          rowKey="uniqueId"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 16 }}
        />
      </Drawer>
    </div>
  );
};

export default ShiftForm;
