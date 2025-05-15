import React, { useEffect, useState } from 'react';
import { Input, Button, Row, Col, Form, Modal, Tooltip, Table, message, Select, DatePicker } from 'antd';


import { parseCookies } from 'nookies';
import { GrChapterAdd } from 'react-icons/gr';
import { useTranslation } from 'react-i18next';
import {
  retrieveBatchNoList, retrieveItemList, retrieveItemTop50List, retrieveLogs, retrieveOperationList,
  retrieveOrderNumberList, retrievePcuList, retrievePhaseList, retrieveShopOrderAllList, retrieveShopOrderTop50List
} from '@services/equResourceService';
import { fetchtop50LineClearance, retrieveLineClearanceLogs } from '@services/lineClearanceReportService';
import {
  fetchAllUsers, fetchLoggedBuyOffList, fetchTop50Sites, fetchTop50Users, retrieveAllBuyOffList,
  retrieveBuyOffTop50List
} from '@services/logBuyOffReportService';
import dayjs from 'dayjs';

interface SearchInputsProps {
  setData: (data: any[]) => void;
  podCategory: string;
  type: string;
  plant: string;
  buyOff: string;
  buyOffVersion: string;
  setBuyOff: (buyOff: string) => void;
  setBuyOffVersion: (buyOffVersion: string) => void;
  user: string;
  setUser: (user: string) => void;
  dateRange: string;
  setDateRange: (dateRange: string) => void;
}

const { RangePicker } = DatePicker;

const SearchInputs: React.FC<SearchInputsProps> = ({ setData, podCategory, type, plant, buyOff, buyOffVersion, setBuyOff, setBuyOffVersion,
  user, setUser, dateRange, setDateRange
}) => {
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
  const [templateName, setTemplateName] = useState('');


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

  useEffect(() => {
    setData([]);
    setShopOrder("");
    setItem("");
    setPcu("");
    setPhase("");
    setOperation("");
    form.resetFields();
    if (plant) {
      fetch24HrData();
    }
  }, [plant]);


  const fetch24HrData = async () => {
    const cookies = parseCookies();
    const user_Id = cookies.rl_user_id;

    let response;
    const site = plant;
    let sample, startDate, endDate;
    startDate = dayjs(form?.getFieldsValue()?.dateTime?.[0]).format('YYYY-MM-DDTHH:mm:ss');
    endDate = dayjs(form?.getFieldsValue()?.dateTime?.[1]).format('YYYY-MM-DDTHH:mm:ss');
    if (type?.toLowerCase() == 'process') {
      // debugger

      sample = {
        batchNo: pcu || null,
        buyOffBO: buyOff ? "BuyOffBO:" + plant + "," + buyOff + "," + buyOffVersion : null,
        site: oPlant || plant,
        userId: user || user_Id ||null,
        dateRange: "24hours",
        startDate:  "",
        endDate:  ""
      }
    }
    else {
     
      sample = {
        pcu: pcu || null,
        buyOffBO: buyOff ? "BuyOffBO:" + plant + "," + buyOff + "," + buyOffVersion : null,
        site: oPlant || plant,
        userId: user || user_Id || null,
        dateRange: "24hours",
        startDate:  "",
        endDate:  ""
      }
    }
    try {
      response = await fetchLoggedBuyOffList(sample);
      // debugger
      if (!response?.errorCode) {
        if (type?.toLowerCase() == 'process') {
          setData(response || []);
        }
        else {
          setData(response || []);
        }
      }
      console.log(response, "response");
    } catch (error) {
      console.error('Error fetching data:', error);

    }
  }


  const site = parseCookies().site;

  const handleSearch = async () => {
    message.destroy();
    // if (oPlant == "" || oPlant == null || oPlant == undefined) {
    //   message.error("Site cannot be empty");
    //   return;
    // }
    const cookies = parseCookies();
    const user_Id = cookies?.rl_user_id;
    let response, sample;
    let startDate, endDate;

    startDate = form?.getFieldsValue()?.dateTime?.[0];
    endDate = form?.getFieldsValue()?.dateTime?.[1];
   

    if(dateRange == "custom"){
      // debugger
      if(!startDate){
        message.error("Start Date cannot be empty");
        return;
      }
      
      if(!endDate){
        message.error("End Date cannot be empty");
        return;
      }

      if(startDate > endDate){
        message.error("Start Date cannot be greater than End Date");
        return;
      }
    }

    if(startDate && endDate){
      startDate = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss');
      endDate = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss');
    }
    // debugger
    if (type?.toLowerCase() == 'process') {
      sample = {
        batchNo: pcu || null,
        buyOffBO: buyOff ? "BuyOffBO:" + plant + "," + buyOff + "," + buyOffVersion : null,
        site: oPlant || plant,
        userId: user || user_Id || null,
        dateRange: dateRange,
        startDate: dateRange == "custom" ? startDate : "",
        endDate: dateRange == "custom" ? endDate : ""
      }
    }
    else {
      sample = {
        pcu: pcu || null,
        buyOffBO: buyOff ? "BuyOffBO:" + plant + "," + buyOff + "," + buyOffVersion : null,
        site: oPlant || plant,
        userId: user || user_Id || null,
        dateRange: dateRange,
        startDate: dateRange == "custom" ? startDate : "",
        endDate: dateRange == "custom" ? endDate : ""
      }
    }
    
    try {
      response = await fetchLoggedBuyOffList(sample);
      response = response.map((item, index) => ({
        ...item,
        key: index
      }));
      // debugger
      if (type?.toLowerCase() == 'process') {
        setData(response || []);
      }
      else {
        setData(response || []);
      }
      console.log(response, "response");
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDateRangeChange = (fieldname: string, value: any) => {
    if (fieldname === "dateRange") {
      setDateRange(value);
      if (value != "custom") {
        form.setFieldValue("startDate", "");
        form.setFieldValue("endDate", "");
      }
    } else if (fieldname === "startDate" || fieldname === "endDate") {
      form.setFieldValue(fieldname, value);
    } else {
      form.setFieldValue(fieldname, value);
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

    else if (fieldName == "templateName") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('templateName'), dataIndex: 'templateName', key: 'templateName' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
        ]
        setTableColumns(oTableColumns);
        oList = await fetchtop50LineClearance(oPlant || plant);
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("templateName");
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

    else if (fieldName == "buyOff") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('buyOff'), dataIndex: 'buyOff', key: 'buyOff' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
          { title: t('version'), dataIndex: 'version', key: 'version' },
          // { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        if (form.getFieldsValue().buyOff) {
          oList = await retrieveAllBuyOffList({ site: oPlant || plant, buyOff: form.getFieldsValue().buyOff });
        }
        else {
          oList = await retrieveBuyOffTop50List({ site: oPlant || plant });
        }
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("buyOff");
      } catch (error) {
        console.error("Error fetching buy off list:", error);
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

  }


  const handleInputChange = (fieldName: any, value: any) => {
    // debugger
    let transformedValue
    if (fieldName != "user")
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
    }
    else if (fieldName == "shopOrder") {
      setShopOrder(transformedValue);
    }
    else if (fieldName == "item") {
      setItem(transformedValue);
    }
    else if (fieldName == "phase") {
      setPhase(transformedValue);
    }
    else if (fieldName == "operation") {
      setOperation(transformedValue);
    }
    else if (fieldName == "templateName") {
      setTemplateName(transformedValue);
    }

    else if (fieldName == "buyOff") {
      setBuyOff(transformedValue);
      form.setFieldValue("buyOff", transformedValue);
    }
    else if (fieldName == "user") {
      setUser(transformedValue);
      form.setFieldValue("user", transformedValue);
    }
    else if (fieldName == "site") {
      setOPlant(transformedValue);
      form.setFieldValue("site", transformedValue);
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
      setItem(record?.item); +
        form.setFieldValue("item", record?.item);
      setItemVersion(record?.revision);
    }


    else if (field == "templateName") {
      setTemplateName(record?.templateName);
      form.setFieldValue("templateName", record?.templateName);
    }

    else if (field == "buyOff") {
      setBuyOff(record?.buyOff);
      setBuyOffVersion(record?.version);
      form.setFieldValue("buyOff", record?.buyOff);
    }

    else if (field == "user") {
      setUser(record?.user);
      form.setFieldValue("user", record?.user);
    }

    else if (field == "site") {
      setOPlant(record?.site);
      form.setFieldValue("site", record?.site);
    }

    handleModalOk(field, record);
  };

  const renderProcessFields = () => (
    <div style={{ marginTop: '2%' }}>

      {/* first row */}
      <Row gutter={24} justify="center" align="middle">
        <Col span={8}>
          <Form.Item
            name="site"
            label={<strong>{t('site')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          // required
          >
            <Input
              suffix={<GrChapterAdd onClick={(value) => handleClick(value, "site")} />}
              value={oPlant}
              onChange={(e) => handleInputChange("site", e.target.value)}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="user"
            label={<strong>{t('user')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Input
              suffix={<GrChapterAdd onClick={(value) => handleClick(value, "user")} />}
              value={user}
              onChange={(e) => handleInputChange("user", e.target.value)}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="batchNo"
            label={<strong>{t('batchNo')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Input
              suffix={<GrChapterAdd onClick={(value) => handleClick(value, "batchNo")} />}
              value={pcu}
              onChange={(e) => handleInputChange("batchNo", e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* second row */}
      <Row gutter={24} justify="center" align="middle">
        <Col span={8}>
          <Form.Item
            name="buyOff"
            label={<strong>{t('buyOff')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Input
              suffix={<GrChapterAdd onClick={(value) => handleClick(value, "buyOff")} />}
              onChange={(e) => handleInputChange("buyOff", e.target.value)}
              value={buyOff}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="dateRange"
            label={<strong>{t('dateRange')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
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
          <Col span={8}>
            <Form.Item
              name="dateTime"
              label={<strong>{t('dateTime')}</strong>}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <RangePicker
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={(dates) => {
                  const [start, end] = dates || [null, null];
                  handleDateRangeChange("startDate", start);
                  handleDateRangeChange("endDate", end);
                }}
                placeholder={['Start date', 'End date']}
                allowClear
                style={{ width: '100%' }}
                value={[form.getFieldValue('startDate'), form.getFieldValue('endDate')]}
              />
            </Form.Item>
          </Col>

        }

        {dateRange != "custom" &&
          <Col span={8} style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item wrapperCol={{ offset: 8 }}>
              <Button
                type="primary"
                onClick={handleSearch}
                style={{ marginRight: 8, backgroundColor: '#006064' }}
              >
                {t('search')}
              </Button>
              <Button onClick={() => {
                setData([]);
                setShopOrder("");
                setItem("");
                setPcu("");
                setTemplateName("");
                setBuyOff("");
                setUser("");
                setOPlant("");
                setBuyOffVersion("");
                setDateRange("24hours");
                form.resetFields();
              }}>
                {t('clear')}
              </Button>
            </Form.Item>
          </Col>
        }

      </Row>

      {/* third row */}
      {dateRange == "custom" &&
      <Row gutter={24} justify="center" align="middle">
        <Col span={4} style={{ display: 'flex', justifyContent: 'end' }}>
          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button
              type="primary"
              onClick={handleSearch}
              style={{ marginRight: 8, backgroundColor: '#006064' }}
            >
              {t('search')}
            </Button>
            <Button onClick={() => {
              setData([]);
              setShopOrder("");
              setItem("");
              setPcu("");
              setTemplateName("");
              setBuyOff("");
              setUser("");
              setOPlant("");
              setBuyOffVersion("");
              setDateRange("24hours");
              form.resetFields();
            }}>
              {t('clear')}
            </Button>
          </Form.Item>
        </Col>

        </Row>
      }

    </div>
  );

  const renderDiscreteFields = () => {
    const labelCol = { span: 8 };
    const wrapperCol = { span: 16 };
    return (
      <div style={{ marginTop: '2%' }}>
        <Row gutter={24} justify="center" align="middle">

          <Col span={8}>
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

          <Col span={8}>
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

          <Col span={8}>
            <Form.Item name="pcu" label={<strong>{t('pcu')}</strong>} labelCol={labelCol}
              wrapperCol={wrapperCol}>
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "pcu")} />}
                value={pcu}
                onChange={(e) => {
                  handleInputChange("pcu", e.target.value);
                }}
              />
            </Form.Item>
          </Col>



        </Row>

       

         {/* second row */}
      <Row gutter={24} justify="center" align="middle">
        <Col span={8}>
          <Form.Item
            name="buyOff"
            label={<strong>{t('buyOff')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Input
              suffix={<GrChapterAdd onClick={(value) => handleClick(value, "buyOff")} />}
              onChange={(e) => handleInputChange("buyOff", e.target.value)}
              value={buyOff}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="dateRange"
            label={<strong>{t('dateRange')}</strong>}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
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
          <Col span={8}>
            <Form.Item
              name="dateTime"
              label={<strong>{t('dateTime')}</strong>}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <RangePicker
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={(dates) => {
                  const [start, end] = dates || [null, null];
                  handleDateRangeChange("startDate", start);
                  handleDateRangeChange("endDate", end);
                }}
                placeholder={['Start date', 'End date']}
                allowClear
                style={{ width: '100%' }}
                value={[form.getFieldValue('startDate'), form.getFieldValue('endDate')]}
              />
            </Form.Item>
          </Col>

        }

        {dateRange != "custom" &&
          <Col span={8} style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item wrapperCol={{ offset: 8 }}>
              <Button
                type="primary"
                onClick={handleSearch}
                style={{ marginRight: 8, backgroundColor: '#006064' }}
              >
                {t('search')}
              </Button>
              <Button onClick={() => {
                setData([]);
                setShopOrder("");
                setItem("");
                setPcu("");
                setTemplateName("");
                setBuyOff("");
                setUser("");
                setOPlant("");
                setBuyOffVersion("");
                setDateRange("24hours");
                form.resetFields();
              }}>
                {t('clear')}
              </Button>
            </Form.Item>
          </Col>
        }

      </Row>

      {/* third row */}
      {dateRange == "custom" &&
      <Row gutter={24} justify="center" align="middle">
        <Col span={4} style={{ display: 'flex', justifyContent: 'end' }}>
          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button
              type="primary"
              onClick={handleSearch}
              style={{ marginRight: 8, backgroundColor: '#006064' }}
            >
              {t('search')}
            </Button>
            <Button onClick={() => {
              setData([]);
              setShopOrder("");
              setItem("");
              setPcu("");
              setTemplateName("");
              setBuyOff("");
              setUser("");
              setOPlant("");
              setBuyOffVersion("");
              setDateRange("24hours");
              form.resetFields();
            }}>
              {t('clear')}
            </Button>
          </Form.Item>
        </Col>

        </Row>
      }


      </div>
    )
  }

  return (
    <>
      <Form layout="horizontal" style={{ marginRight: '110px' }} form={form}>
        {type?.toLowerCase() === "process" ? renderProcessFields() : renderDiscreteFields()}
        {/* <Row gutter={24} justify="center" align="middle">
          <Col span={24} style={{ textAlign: 'center' }}>
            <Form.Item>
              <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                {t('search')}
              </Button>
              <Button onClick={() => {
                setData([]);
                setShopOrder("");
                setItem("");
                setPcu("");
                setTemplateName("");
                setBuyOff("");
                form.resetFields();
              }}>{t('clear')}</Button>
            </Form.Item>
          </Col>
        </Row> */}
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
          scroll={{ y: 'calc(100vh - 350px)' }}
          size="small"
          bordered
        />
      </Modal>
    </>
  );
};

export default SearchInputs;