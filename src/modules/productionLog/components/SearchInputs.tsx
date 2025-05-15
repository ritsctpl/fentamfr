import React, { useEffect, useState } from 'react';
import { Input, Button, Row, Col, Form, Modal, Tooltip, Table, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';

import { parseCookies } from 'nookies';
import { GrChapterAdd } from 'react-icons/gr';
import { useTranslation } from 'react-i18next';
import {
  fetchAllUsers, fetchTop50OrderNos, fetchTop50Sites, fetchTop50Users, retrieveBatchNoList, retrieveItemList, retrieveItemTop50List, retrieveLogs,
  retrieveOperationList, retrieveOrderNumberList,
  retrievePcuList, retrievePhaseList, retrieveShopOrderAllList, retrieveShopOrderTop50List
} from '@services/equResourceService';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from '@modules/buyOff/components/userInstructions';

interface SearchInputsProps {
  setData: (data: any[]) => void;
  podCategory: string;
  type: string;
  plant: string;
  dateRange: string;
  setDateRange: (dateRange: string) => void;
  dataList: any;
}

const SearchInputs: React.FC<SearchInputsProps> = ({ setData, podCategory, type, plant, dateRange, setDateRange, dataList }) => {
  const [form] = Form.useForm();
  const [shopOrder, setShopOrder] = useState('');
  const [item, setItem] = useState('');
  const [pcu, setPcu] = useState('');
  const [itemVersion, setItemVersion] = useState('');
  const { t } = useTranslation();
  const [field, setField] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [phase, setPhase] = useState('');
  const [operation, setOperation] = useState('');
  const [user, setUser] = useState('');
  const [oPlant, setOPlant] = useState('');


  const dateRangeOptions = [
    { value: '24hours', label: '24hours' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom' }
  ];

  const manualContent = [
    {
      title: 'Production Log User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the Production Log Screen for loggin and tracking production logs.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'Production Log' }
              ]
            }
          }
        },
        {
          title: '2. System Access',
          content: {
            type: 'table',
            data: {
              headers: ['Item', 'Description'],
              rows: [
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/productionLogReport_app' },
                { Item: 'Login Requirement', Description: 'Username & Password' },
                { Item: 'Access Roles', Description: 'Technician, Supervisor, Admin' }
              ]
            }
          }
        },
        {
          title: '3. Navigation Path',
          content: {
            type: 'text',
            data: 'Main Menu → Production Log → Production Log Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by Site, User, Phase, Operation, Batch No, Process Order, Product Code, and Date Range' },
                { Section: 'Production Log Table', Description: 'Lists past production log records (columns like Event Type, Batch No, Process Order, Product Code, Item, Item Version, Phase, Operation, Operation Version, Resource, Work Center, Created Datetime, Quantity, User, Shift, Shift Start, Shift End, Shift Available Time, Total Break (min), Planned Cycle Time, Actual Cycle Time, Reason Code, Event Data, Status)' },
                { Section: 'Action Buttons', Description: 'Search, Clear' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Filter The Production Log',
              content: {
                type: 'steps',
                data: [
                  'Click "Search" button to filter the production log',
                  'Table will show the filtered production log records',
                  {
                    text: 'Fill in the required fields:',
                    subSteps: [
                      'Site (Browse)',
                      'User (Browse)',
                      'Phase (Browse)',
                      'Operation (Browse)',
                      'Batch No (Browse)',
                      'Process Order (Browse)',
                      'Product Code (Browse)',
                      'Date Range (Dropdown)'
                    ]
                  },
                  'Click "Clear" button to clear the filters and show all production log records'
                ]
              }
            }
          ]
        },
        {
          title: '6. Field Definitions',
          content: {
            type: 'table',
            data: {
              headers: ['Field Name', 'Description', 'Required'],
              rows: [
                { 'Field Name': 'Site', Description: 'Site of the production log', Required: 'NO' },
                { 'Field Name': 'User', Description: 'User of the production log', Required: 'NO' },
                { 'Field Name': 'Phase', Description: 'Phase of the production log', Required: 'NO' },
                { 'Field Name': 'Operation', Description: 'Operation of the production log', Required: 'NO' },
                { 'Field Name': 'Batch No', Description: 'Batch No of the production log', Required: 'NO' },
                { 'Field Name': 'Process Order', Description: 'Process Order of the production log', Required: 'NO' },
                { 'Field Name': 'Product Code', Description: 'Product Code of the production log', Required: 'NO' },
                { 'Field Name': 'Date Range', Description: 'Date Range of the production log', Required: 'Yes' }
              ]
            }
          }
        },
        {
          title: '7. FAQs / Troubleshooting',
          content: {
            type: 'table',
            data: {
              headers: ['Issue', 'Solution'],
              rows: [
                { Issue: 'Cannot Filter record', Solution: 'Check mandatory fields' },
                { Issue: 'Production Log not showing', Solution: 'Check the date range is correct' },
                { Issue: 'Production Log not showing', Solution: 'Check the log is available in the system' },
              ]
            }
          }
        }
      ]
    }
  ];




  useEffect(() => {
    setData([]);
    setShopOrder("");
    setItem("");
    setPcu("");
    setPhase("");
    setOperation("");
    form.resetFields();
    // setOPlant(plant)
    if (plant) {
      fetch24HrData();
    }
  }, [plant]);

  // useEffect(() => {
  const fetch24HrData = async () => {
    const cookies = parseCookies();
    const user_Id = cookies.rl_user_id;

    let response;
    const site = plant;
    let sample;
    if (type?.toLowerCase() == 'process') {
 // d
      sample = {
        type: "process",
        batchNo: pcu || null,
        orderNumber: shopOrder || null,
        phaseId: phase || null,
        operation: operation || null,
        operationVersion: null,
        material: item || null,
        materialVersion: itemVersion || null,
        site: plant,
        userId: null,
        dateRange: "24hours",
        startTime: "",
        endTime: ""
      }
    }
    else {
     
      sample = {
        pcu: pcu || null,
        shopOrderBO: shopOrder || null,
        type: "discrete",
        material:  null,
        materialVersion:  null,
        item: item || null,
        itemVersion: itemVersion || null,
        site: plant,
        userId: null,
        dateRange: "24hours",
        startTime: "",
        endTime: ""
      }
    }
    try {
      response = await retrieveLogs(site, sample);
      // debugger
      if (!response?.errorCode) {
        if (type?.toLowerCase() == 'process') {
          setData(response || []);
          dataList.current = response || [];
        }
        else {
          setData(response || []);
          dataList.current = response || [];
        }
      }
      console.log(response, "response");
    } catch (error) {
      console.error('Error fetching data:', error);

    }
  }

  // }, [])


  const handleDateRangeChange = (fieldname: string, value: any) => {
    if (fieldname === "dateRange") {
      setDateRange(value);
      if (value != "custom") {
        form.setFieldValue("startDate", "");
        form.setFieldValue("endDate", "");
      }
    } else if (fieldname === "startDate" || fieldname === "endDate") {
      // Store the raw dayjs object in the form
      form.setFieldValue(fieldname, value);
    } else {
      form.setFieldValue(fieldname, value);
    }
  };


  const handleSearch = async () => {
    message.destroy();
   
    let response;
    const site = plant;
    const cookies = parseCookies();
    const user_Id = cookies?.rl_user_id;
    let sample, startDate, endDate;
    startDate = form?.getFieldsValue()?.startDate;
    endDate = form?.getFieldsValue()?.endDate;

    if (dateRange?.toLowerCase()?.replaceAll(" ", "") == 'custom') {
      if(!startDate){
        message.error("Start Date cannot be empty")
        return;
      }

       if(!endDate){
        message.error("End Date cannot be empty")
        return;
      }
      const startDateCheck = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss');
      const endDateCheck = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss');
      if(startDateCheck > endDateCheck){
        message.error("Start Date cannot be greater than End Date")
        return;
      }

      if (startDate) {
        startDate = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss');
      }
      else {
        startDate = "";
      }
      if (endDate) {
        endDate = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss');
      }
      else {
        endDate = "";
      }
    }
    else {
      startDate = "";
      endDate = "";
    }

    if (type?.toLowerCase() == 'process') {
      // debugger
      const startDateValue = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss');
      const endDateValue = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss');

      sample = {
        type: "process",
        batchNo: pcu || null,
        orderNumber: shopOrder || null,
        phaseId: phase || null,
        operation: operation || null,
        operationVersion: null,
        material: item || null,
        materialVersion: itemVersion || null,
        site: oPlant || plant,
        userId: user  || null,
        dateRange: dateRange,
        startTime: dateRange?.toLowerCase()?.replaceAll(" ", "") == 'custom'? startDateValue : "",
        endTime: dateRange?.toLowerCase()?.replaceAll(" ", "") == 'custom' ? endDateValue : ""
      }
    }
    else {
      const startDateValue = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss');
      const endDateValue = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss');

      sample = {
        pcu: pcu || null,
        shopOrderBO: shopOrder || null,
        type: "discrete",
        material:  null,
        materialVersion:  null,
        item: item || null,
        itemVersion: itemVersion || null,
        site: oPlant || plant,
        userId: user  || null,
        dateRange: dateRange,
        startTime: dateRange?.toLowerCase()?.replaceAll(" ", "") == 'custom'? startDateValue : "",
        endTime: dateRange?.toLowerCase()?.replaceAll(" ", "") == 'custom' ? endDateValue : ""
      }
    }
    try {
      response = await retrieveLogs(site, sample);
      // debugger
      if (!response?.errorCode) {
        if (type?.toLowerCase() == 'process') {
          setData(response || []);
          dataList.current = response || [];
        }
        else {
          setData(response || []);
          dataList.current = response || [];
        }
      }
      else{
        setData([]);
        dataList.current = [];
      }
      console.log(response, "response");
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const handleClick = async (value, fieldName) => {
    // debugger
    if (fieldName == "batchNo") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('batchNo'), dataIndex: 'batchNo', key: 'batchNo' },
          { title: t('material'), dataIndex: 'material', key: 'material' },
          { title: t('materialVersion'), dataIndex: 'materialVersion', key: 'materialVersion' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);

        oList = await retrieveBatchNoList({ site: oPlant || plant });
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("batchNo");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "pcu") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('pcu'), dataIndex: 'pcu', key: 'pcu' },
          { title: t('item'), dataIndex: 'item', key: 'item' },
          { title: t('itemVersion'), dataIndex: 'itemVersion', key: 'itemVersion' },
          { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder' },
        ]
        setTableColumns(oTableColumns);
        oList = await retrievePcuList({ site: oPlant || plant });
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("pcu");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "orderNumber") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('orderNumber'), dataIndex: 'orderNumber', key: 'orderNumber' },
          { title: t('orderType'), dataIndex: 'orderType', key: 'orderType' },
          { title: t('material'), dataIndex: 'material', key: 'material' },
          { title: t('description'), dataIndex: 'materialDescription', key: 'materialDescription' },
          { title: t('availableQtyToRelease'), dataIndex: 'availableQtyToRelease', key: 'availableQtyToRelease' }
        ]
        setTableColumns(oTableColumns);
        if (!form.getFieldsValue().orderNumber) {
          oList = await fetchTop50OrderNos({ "site": oPlant || plant });
        }
        else {
          oList = await retrieveOrderNumberList({ "site": oPlant || plant, orderNumber: form?.getFieldsValue()?.orderNumber });
        }
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("orderNumber");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "shopOrder") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder' },
          { title: t('plannedMaterial'), dataIndex: 'plannedMaterial', key: 'plannedMaterial' },
          { title: t('orderType'), dataIndex: 'orderType', key: 'orderType' },
          { title: t('status'), dataIndex: 'status', key: 'status' }
        ]
        setTableColumns(oTableColumns);
        if (form.getFieldsValue().shopOrder) {
          oList = await retrieveShopOrderAllList({ site: oPlant || plant, orderNumber: form.getFieldsValue().shopOrder });
        }
        else {
          oList = await retrieveShopOrderTop50List({ site: oPlant || plant });
        }
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("shopOrder");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "item") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('item'), dataIndex: 'item', key: 'item' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
          { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        if (form.getFieldsValue().item) {
          oList = await retrieveItemList({ site: oPlant || plant, item: form.getFieldsValue().item });
        }
        else {
          oList = await retrieveItemTop50List({ site: oPlant || plant });
        }
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("item");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "phase") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('phase'), dataIndex: 'phase', key: 'phase' },
        ]
        setTableColumns(oTableColumns);
        oList = await retrievePhaseList(oPlant || plant);
        oList = oList.map((item, index) => ({
          phase: item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("phase");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "operation") {
      try {
        let oList;
        oList = await retrieveOperationList(oPlant || plant, phase);
        oList = oList.map((item, index) => ({
          operation: item,
          key: index
        }));
        const oTableColumns = [
          { title: t('operation'), dataIndex: 'operation', key: 'operation' },
        ]
        setTableColumns(oTableColumns);
        setTableData(oList || []);
        setVisible(true);
        setField("operation");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "site") {
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
        setTableColumns(oTableColumns);
        setTableData(oList || []);
        setVisible(true);
        setField("site");
      } catch (error) {
        console.error("Error fetching site list:", error);
      }
    }

    else if (fieldName == "user") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('user'), dataIndex: 'user', key: 'user' },
          // { title: t('firstName'), dataIndex: 'firstName', key: 'firstName' },
          { title: t('lastName'), dataIndex: 'lastName', key: 'lastName' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        if (form?.getFieldsValue()?.user) {
          oList = await fetchAllUsers({ user: form?.getFieldsValue()?.user });
        }
        else {
          oList = await fetchTop50Users({ site: oPlant || plant });
        }
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("user");
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    }


  }


  const handleInputChange = (fieldName: any, value: any) => {
    // Transform the   value consistently
    debugger
    let transformedValue
   

     if(fieldName == 'pcu' || fieldName == 'item' )
        transformedValue = value.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9_-]/g, '');

     else if(fieldName == 'shopOrder' )
      transformedValue = value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_:,-]/g, '');

     else if (fieldName != "user")
        transformedValue = value.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9_]/g, '');

     else
        transformedValue = value.replace(/[^A-Z0-9_]/gi, '');




    if (fieldName == "batchNo") {
      setPcu(transformedValue);
      form.setFieldValue("batchNo", transformedValue);
    }
    else if (fieldName == "pcu") {
      setPcu(transformedValue);
      form.setFieldValue("pcu", transformedValue);
    }
    else if (fieldName == "orderNumber") {
      setShopOrder(transformedValue);
      form.setFieldValue("orderNumber", transformedValue);
    }
    else if (fieldName == "shopOrder") {
      setShopOrder(transformedValue);
      form.setFieldValue("shopOrder", transformedValue);
    }
    else if (fieldName == "item") {
      setItem(transformedValue);
      form.setFieldValue("item", transformedValue);
    }
    else if (fieldName == "phase") {
      setPhase(transformedValue);
      form.setFieldValue("phase", transformedValue);
    }
    else if (fieldName == "operation") {
      setOperation(transformedValue);
      form.setFieldValue("operation", transformedValue);
    }
    else if (fieldName == "site") {
      setOPlant(transformedValue);
      form.setFieldValue("site", transformedValue);
    }
    else if (fieldName == "user") {
      setUser(transformedValue);
      form.setFieldValue("user", transformedValue);
    }
  };

  const handleModalOk = (field: any, record: any) => {

    setVisible(false);
  };

  const handleModalCancel = () => {
    setVisible(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // debugger
    setSearchText(e.target.value);
  };


  const handleRowSelection = (field: any, record: any) => {
    // debugger
    // setSelectedRow(record);
    if (field == "batchNo") {
      setPcu(record?.batchNo);
      form.setFieldValue("batchNo", record?.batchNo);
      form.submit();
    }

    else if (field == "pcu") {
      setPcu(record?.pcu);
      form.setFieldValue("pcu", record?.pcu);
    }
    else if (field == "phase") {
      setPhase(record?.phase);
      form.setFieldValue("phase", record?.phase);
    }
    else if (field == "operation") {
      setOperation(record?.operation);
      form.setFieldValue("operation", record?.operation);
    }
    else if (field == "shopOrder") {
      setShopOrder(record?.shopOrder);
      form.setFieldValue("shopOrder", record?.shopOrder);
    }
    else if (field == "orderNumber") {
      setShopOrder(record?.orderNumber);
      form.setFieldValue("orderNumber", record?.orderNumber);
    }

    else if (field == "item") {
      setItem(record?.item);
      form.setFieldValue("item", record?.item);
      setItemVersion(record?.revision);
    }

    else if (field == "site") {
      setOPlant(record?.site);
      form.setFieldValue("site", record?.site);
    }

    else if (field == "user") {
      setUser(record?.user);
      form.setFieldValue("user", record?.user);
    }


    handleModalOk(field, record);
  };

  const renderProcessFields = () => {
    const labelCol = { span: 8 };  // Controls label width
    const wrapperCol = { span: 16 };  // Controls input field width

    return (
      <div style={{ marginTop: '2%' }}>
        {/* First row */}
        <Row gutter={24} justify="center" align="middle">

          <Col span={6}>
            <Form.Item
              name="site"
              label={<strong>{t('site')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
              // required
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "site")} />}
                value={oPlant}
                onChange={(e) => handleInputChange("site", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="user"
              label={<strong>{t('user')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "user")} />}
                value={user}
                onChange={(e) => handleInputChange("user", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="phase"
              label={<strong>{t('phase')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "phase")} />}
                value={phase}
                onChange={(e) => handleInputChange("phase", e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Second row */}
        <Row gutter={24} justify="center" align="middle">
          <Col span={6}>
            <Form.Item
              name="operation"
              label={<strong>{t('operation')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "operation")} />}
                value={operation}
                onChange={(e) => handleInputChange("operation", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="batchNo"
              label={<strong>{t('batchNo')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "batchNo")} />}
                value={pcu}
                onChange={(e) => handleInputChange("batchNo", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="orderNumber"
              label={<strong>{t('processOrder')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "orderNumber")} />}
                value={shopOrder}
                onChange={(e) => handleInputChange("orderNumber", e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Third row */}
        <Row gutter={24} justify="center" align="middle">
          <Col span={6}>
            <Form.Item
              name="item"
              label={<strong>{t('material')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "item")} />}
                value={item}
                onChange={(e) => handleInputChange("item", e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="dateRange"
              label={<strong>Date Range</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Select
                defaultValue={"24hours"}
                value={dateRange}
                onChange={(value) => handleDateRangeChange("dateRange", value)}
                options={dateRangeOptions}
                placeholder="Select date range"

              />
            </Form.Item>
          </Col>

          {dateRange == "custom" &&
            <Col span={6}>
              <Form.Item
                name="startDate"
                label={<strong>Start Date</strong>}
                labelCol={labelCol}
                wrapperCol={wrapperCol}
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
          }

          {dateRange != "custom" &&
            <Col span={6}>
              <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                  {t('search')}
                </Button>
                <Button style={{ marginRight: 8 }} onClick={() => {
                  setData([]);
                  dataList.current = [];
                  setShopOrder("");
                  setItem("");
                  setPcu("");
                  setUser("");
                  setOPlant("");
                  setDateRange("24hours");
                  setOperation("");
                  setPhase("");
                  setItemVersion("");
                  form.resetFields();
                }}>
                  {t('clear')}
                </Button>
                <div style={{ display: 'inline-block' }}>
                  <InstructionModal title="ProcessOrderMaintenance">
                    <UserInstructions manualContent={manualContent} />
                  </InstructionModal>
                </div>
              </Form.Item>
            </Col>
          }
        </Row>

        {/* Fourth row */}
        <Row gutter={24} justify="center" align="middle">
          {dateRange == "custom" &&
            <Col span={6}>
              <Form.Item
                name="endDate"
                label={<strong>End Date</strong>}
                labelCol={labelCol}
                wrapperCol={wrapperCol}
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
          }

          {dateRange == "custom" &&
            <Col span={12}>
              <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                  {t('search')}
                </Button>
                <Button style={{ marginRight: 8 }} onClick={() => {
                  setData([]);
                  dataList.current = [];
                  setShopOrder("");
                  setItem("");
                  setPcu("");
                  setUser("");
                  setOPlant("");
                  setDateRange("24hours");
                  setOperation("");
                  setPhase("");
                  setItemVersion("");
                  form.resetFields();
                }}>
                  {t('clear')}
                </Button>
                <div style={{ display: 'inline-block' }}>
                  <InstructionModal title="ProcessOrderMaintenance">
                    <UserInstructions manualContent={manualContent} />
                  </InstructionModal>
                </div>
              </Form.Item>
            </Col>
          }
        </Row>


      </div>
    );
  };

  const renderDiscreteFields = () => {
    const labelCol = { span: 8 };  // Controls label width
    const wrapperCol = { span: 16 };  // Controls input field width

    return (
      <div style={{ marginTop: '2%' }}>

        {/* First row */}
        <Row gutter={24} style={{ marginTop: '10px', alignItems: 'center', justifyContent: 'center' }}>
          <Col span={6}>
            <Form.Item
              name="site"
              label={<strong>{t('site')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
              // required
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "site")} />}
                value={oPlant}
                onChange={(e) => handleInputChange("site", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="user"
              label={<strong>{t('user')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "user")} />}
                value={user}
                onChange={(e) => handleInputChange("user", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="pcu"
              label={<strong>{t('pcu')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "pcu")} />}
                value={pcu}
                onChange={(e) => handleInputChange("pcu", e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Second row */}
        <Row gutter={24} style={{
          alignItems: 'center', justifyContent: 'center',
          //  paddingLeft: '5px'
        }}>
          <Col span={6}>
            <Form.Item
              name="shopOrder"
              label={<strong>{t('shopOrder')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "shopOrder")} />}
                value={shopOrder}
                onChange={(e) => handleInputChange("shopOrder", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="item"
              label={ type?.toLowerCase() === "process" ?  <strong>{t('material')}</strong> : <strong>{t('item')}</strong> }
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "item")} />}
                value={item}
                onChange={(e) => handleInputChange("item", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="dateRange"
              label={<strong>Date Range</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Select
                defaultValue={"24hours"}
                value={dateRange}
                onChange={(value) => handleDateRangeChange("dateRange", value)}
                options={dateRangeOptions}
                placeholder="Select date range"

              />
            </Form.Item>
          </Col>
        </Row>


        {/* Third row */}
        <Row gutter={24} style={{
          alignItems: 'center', justifyContent: 'center',
          //  paddingLeft: '5px'
        }}>

          {dateRange == "custom" &&
            <Col span={6}>
              <Form.Item
                name="startDate"
                label={<strong>Start Date</strong>}
                labelCol={labelCol}
                wrapperCol={wrapperCol}
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
          }


          {dateRange == "custom" &&
            <Col span={6}>
              <Form.Item
                name="endDate"
                label={<strong>End Date</strong>}
                labelCol={labelCol}
                wrapperCol={wrapperCol}
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
          }

          {dateRange == "custom" &&
            <Col span={6}>
              <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                  {t('search')}
                </Button>
                <Button style={{ marginRight: 8 }} onClick={() => {
                  setData([]);
                  dataList.current = [];
                  setShopOrder("");
                  setItem("");
                  setPcu("");
                  setUser("");
                  setOPlant("");
                  setDateRange("24hours");
                  form.resetFields();
                }}>
                  {t('clear')}
                </Button>
                <div style={{ display: 'inline-block' }}>
                  <InstructionModal title="ProcessOrderMaintenance">
                    <UserInstructions manualContent={manualContent} />
                  </InstructionModal>
                </div>
              </Form.Item>
            </Col>
          }

        </Row>

        {/* Fourth row */}
        <Row gutter={24} style={{
          alignItems: 'center', justifyContent: 'center',
          //  paddingLeft: '5px'
        }}>



          {dateRange != "custom" &&
            <Col span={12}>
              <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                  {t('search')}
                </Button>
                <Button style={{ marginRight: 8 }} onClick={() => {
                  setData([]);
                  dataList.current = [];
                  setShopOrder("");
                  setItem("");
                  setItemVersion("");
                  setPcu("");
                  setUser("");
                  setOPlant("");
                  setPhase("");
                  setOperation("");
                  setDateRange("24hours");
                  form.resetFields();
                }}>
                  {t('clear')}
                </Button>
                <div style={{ display: 'inline-block' }}>
                  <InstructionModal title="ProcessOrderMaintenance">
                    <UserInstructions manualContent={manualContent} />
                  </InstructionModal>
                </div>
              </Form.Item>
            </Col>
          }

        </Row>

      </div>
    );
  };

  return (
    <>
      <Form layout="horizontal" style={{ marginRight: '110px' }} form={form}>
        {type?.toLowerCase() === "process" ? renderProcessFields() : renderDiscreteFields()}
      </Form>

      <Modal
        title={
          <>
            {t('select')} {t(field)}
            <Tooltip title="Search">
            </Tooltip>
            {searchVisible && (
              <Input
                style={{ marginTop: 16 }}
                value={searchText}
                onChange={handleSearchChange}
              />
            )}
          </>
        }
        open={visible}
        onOk={() => form.submit()}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      >
        <Table
          columns={tableColumns}
          dataSource={tableData}
          onRow={(record) => ({
            onDoubleClick: () => handleRowSelection(field, record),
          })}
          pagination={false}
          scroll={{ y: 300 }}
          size="small"
          bordered
        />
      </Modal>
    </>
  );
};

export default SearchInputs;