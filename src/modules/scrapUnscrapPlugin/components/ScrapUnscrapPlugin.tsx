// src/modules/activityMaintenance/components/ActivityMaintenance.tsx

'use client';

import React, { useContext, useEffect, useState, useRef } from 'react';
import { Tabs, Form, Input, Button, Table, Popconfirm, Modal, Row, Col, Select, message, Drawer, Switch, Tooltip, InputNumber } from 'antd';
import { parseCookies } from 'nookies';
import styles from '../styles/CommonTable.module.css'; // Use the styles from the module
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from '@modules/changeEquipmentStatus/types/changeEquipmentType';
import { fetchAllShopOrderData, fetchPcuToUnScrap, fetchShopOrderTop50, retrieveBatchNumberHeader, retrievePCUHeader, retrievePCUtoScrap, retrievePCUtoUnscrap, scrap,
   scrapBatchNumber, unScrap, unScrapBatchNumber, updateResourceStatus } from '@services/scrapUnscrapService';
import { useTranslation } from 'react-i18next';
import { RetriveResourcePod } from '@services/podServices';
import { PodConfig } from '@modules/podApp/types/userTypes';
import { GrChapterAdd } from "react-icons/gr";
import TextArea from 'antd/es/input/TextArea';
import InstructionModal from '@components/InstructionModal';
import ScrapManual from './ScrapManual';


interface TableRecord {
  key: React.Key;
  [key: string]: any;
}

interface ScrapUnscrapPluginProps {
  filterFormData: PodConfig;
  selectedRowData: any;
  call2: number;
  selectedContainer: any;
  phaseByDefault: string;
}

// Define the component with typed props
const ScrapUnscrapPlugin: React.FC<ScrapUnscrapPluginProps> = ({ filterFormData, selectedRowData, call2, selectedContainer, phaseByDefault }) => {
  // console.log(filterFormData, "filterFormData");

  const [form] = Form.useForm();
  const { t } = useTranslation()
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [operation, setOperation] = useState(filterFormData?.defaultOperation)
  const [uiWcOrRes, setuiWcOrRes] = useState(filterFormData?.defaultResource)
  const [pcuList, setPcuList] = useState<any>([]);
  const [objectLabel, setObjectLabel] = useState<string>(); // New state for dynamic label
  const [visible, setVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  const [field, setField] = useState<any>();
  const [buttonText, setButtonText] = useState<string>("Scrap");

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(null);

  // Create a ref for the first input
  const firstInputRef = useRef<any>(null);

  useEffect(() => {
    // Add a small delay to ensure the DOM is ready
    const timeoutId = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus({ preventScroll: true });
      }
    }, 0);
    if(filterFormData?.podCategory?.toLowerCase() == "process"){
      setObjectLabel("Batch Number")
    }
    else{
      setObjectLabel("PCU")
    }
    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, [call2]);

  useEffect(() => {
    // Update local state when filterFormData changes
    setOperation(filterFormData?.defaultOperation);
    setuiWcOrRes(filterFormData?.defaultResource);
  }, [filterFormData]);
  // console.log("selectedRowData: ", selectedRowData);

  // Handler function for when the selection changes


  useEffect(() => {
    const fetchToken = async () => {

      const cookies = parseCookies();
      const site = cookies.site;
      setSite(site);
       setUsername(cookies?.rl_user_id);
       // const res = await RetriveResourcePod(site, filterFormData?.defaultResource)
      // console.log(res, 'ress');

      // setOldState(res.setUpState);
      form.setFieldsValue({
        object: filterFormData?.podCategory?.toLowerCase() == "process" ? selectedRowData?.[0]?.batchNo : selectedRowData?.[0]?.pcu,
        comments: "",
        activity: "Scrap",
        type: filterFormData?.podCategory?.toLowerCase() == "process" ? "BatchNo" : "PCU"
      });
      setButtonText("Scrap");
     
      setPcuList([]);

    };

    fetchToken();
  }, [site, filterFormData?.defaultResource, selectedRowData, call2]);










  const handleClick = async (value, fieldName) => {
    // debugger
    setField(fieldName);
    setVisible(true);
    if (fieldName.toLowerCase() == "pcu") {

      try {
        let oList, oTableColumns;
        oTableColumns = [
          { title: t('pcu'), dataIndex: 'pcuBO', key: 'pcuBO' },
          { title: t('shopOrder'), dataIndex: 'shopOrderBO', key: 'shopOrderBO' },
          { title: t('item'), dataIndex: 'itemBO', key: 'itemBO' },
        ]
        const typedValue = form.getFieldsValue().object;
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (buttonText.toLowerCase() == "scrap")
          oList = await retrievePCUHeader(site);
        else {
          oList = await fetchPcuToUnScrap(site);

          oTableColumns = [
            { title: t('pcu'), dataIndex: 'pcu', key: 'pcu' },
            { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder' },
            { title: t('item'), dataIndex: 'item', key: 'item' },
            { title: t('status'), dataIndex: 'status', key: 'status' },
          ]
        }

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            description: item.groupDescription
          }));


          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }

        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all item group list:", error);
      }
    }
    else if (fieldName == "Shop Order") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder' },
          { title: t('status'), dataIndex: 'status', key: 'status' }
        ]
        const typedValue = form.getFieldsValue().object;
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue)
          oList = await fetchAllShopOrderData(site, typedValue);
        else
          oList = await fetchShopOrderTop50(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }

        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all item list:", error);
      }
    }
  }

  const handleSelectChange = (fieldName, value) => {
    if (fieldName === 'type') {
      setObjectLabel(value); // Update the label based on selected type

      form.setFieldsValue({
        object: ""
      })
    }
    else {
      setButtonText(value)
    }

  }

  const handleInputChange = (fieldName, value) => {
    // debugger
    if (fieldName == "comments") {
      form.setFieldsValue({
        comments: value
      })
    }
    else if (fieldName == "scrapQuantity") {
      form.setFieldsValue({
        scrapQuantity: value
      })
    }
    else {
      form.setFieldsValue({
        object: value
      })
    }
  }

  const handleModalCancel = () => {
    setVisible(false);
  }

  const handleRowSelection = (selectedRow) => {
    if (selectedRow) {
      let updatedFields;
      if (buttonText.toLowerCase() == "scrap") {
        updatedFields = {
          object: currentField === "PCU" ? selectedRow.pcuBO : selectedRow.shopOrder,
        };
      }

      else {
        updatedFields = {
          object: currentField === "PCU" ? selectedRow.pcu : selectedRow.shopOrder,
        };
      }
      // Update the form values
      form.setFieldsValue(updatedFields);
    }
    setVisible(false);
  }

  const handleRetrieve = async () => {
    setSelectedRowKeys(null);
    message.destroy();

    // if (form.getFieldsValue().object == "") {
    //   if (objectLabel.toLowerCase().replaceAll(' ', '') == "shoporder") {
    //     message.error("Shop order cannot be empty");
    //     return;
    //   }
    //   else if (objectLabel.toLowerCase().replaceAll(' ', '') == "pcu") {
    //     message.error("PCU cannot be empty");
    //     return;
    //   } else {
    //     message.error("Process Lot cannot be empty");
    //     return;
    //   }
    // }
    debugger
    if (filterFormData?.podCategory?.toLowerCase() == "process") {
      if (form.getFieldsValue().object == "" || form.getFieldsValue().object == null || form.getFieldsValue().object == undefined) {
        message.error("Batch number cannot be empty");
        return;
      }
      let response = selectedRowData.map((item, index) => ({
        ...item,
        key: index,
        id: index
      }));

      debugger
      const retrieveRequest = {
        site: site,
        batchNumber: form.getFieldsValue().object,
        orderNo: selectedRowData?.[0]?.orderNumber
      }
      const fetchBatchNum = await retrieveBatchNumberHeader(retrieveRequest);
      debugger
      if(response?.[0]){
        response[0].material = fetchBatchNum?.response?.material
        response[0].materialVersion = fetchBatchNum?.response?.materialVersion
        response[0].status = selectedRowData?.Status || selectedRowData?.[0]?.Status
      }
      setPcuList(response)
      // setPcuList([fetchBatchNum?.response])
    }
    else {

      if (objectLabel.toLowerCase().replaceAll(' ', '') == "pcu") {
        if (form.getFieldsValue().object == "" || form.getFieldsValue().object == null || form.getFieldsValue().object == undefined) {
          message.error("Please select a pcu");
          return;
        }
      }

      if (objectLabel.toLowerCase().replaceAll(' ', '') == "shoporder") {
        if (form.getFieldsValue().object == "" || form.getFieldsValue().object == null || form.getFieldsValue().object == undefined) {
          message.error("Please select a shop order");
          return;
        }

        if (selectedRowKeys && selectedRowKeys.length < 0) {
          message.error("Please select a pcu");
          return;
        }
      }

      if (objectLabel.toLowerCase().replaceAll(' ', '') == "processlot") {
        if (form.getFieldsValue().object == "" || form.getFieldsValue().object == null || form.getFieldsValue().object == undefined) {
          message.error("Please select a process lot");
          return;
        }
      }

      if (buttonText == "Scrap") {
        const request = {
          site: site,
          objectList: [form.getFieldsValue().object]
        }
        console.log("retrievePCUtoScrap request: ", request);
        let response = await retrievePCUtoScrap(request);
        console.log("retrievePCUtoScrap response: ", response);
        if (!response.errorCode) {
          response = response.map((item, index) => ({
            ...item,
            key: index,
            id: index
          }))
          setPcuList(response)
        }
      }

      else {
        // handleUnscrap()
        const request = {
          site: site,
          objectList: [form.getFieldsValue().object]
        }
        console.log("retrievePCUtoUnscrap request: ", request);
        let response = await retrievePCUtoUnscrap(request);
        console.log("retrievePCUtoUnscrap response: ", response);
        if (!response.errorCode) {
          response = response.map((item, index) => ({
            ...item,
            key: index,
            id: index
          }))
          setPcuList(response)
        }
      }
    }
  }

  const handleScrapBatchNumber = async () => {
    // debugger
    const cookies = parseCookies();
    const site = cookies.site;


    const retrieveRequest = {
      site: site,
      batchNumber: form.getFieldsValue().object
    }
    const fetchBatchNum = await retrieveBatchNumberHeader(retrieveRequest);

    const request = {
      "site": site,
      "batchNo": form.getFieldsValue().object,
      "phaseId": filterFormData?.defaultPhaseId || phaseByDefault,
      "operation": filterFormData?.defaultOperation,
      "resource": filterFormData?.defaultResource,
      "scrapQuantity": +form.getFieldsValue().scrapQuantity,
      "material": fetchBatchNum?.response?.material || selectedRowData?.[0]?.material,
      "materialVersion": fetchBatchNum?.response?.materialVersion || selectedRowData?.[0]?.materialVersion,
      "orderNumber": fetchBatchNum?.response?.orderNo || selectedRowData?.[0]?.orderNumber,
      "user": username
    }

    const response = await scrapBatchNumber(request);
    // debugger
    if (response?.errorCode) {
      message.error(response?.message);
    }
    else {
      if(response?.message_details?.msg_type == "E"){
        message.error(response?.message_details?.msg);
      }
      else{
        message.success(response?.message_details?.msg);
      }
    }
  }

  const handleUnScrapBatchNumber = async () => {
    // debugger
    const cookies = parseCookies();
    const site = cookies.site;


    const retrieveRequest = {
      site: site,
      batchNumber: form.getFieldsValue().object
    }
    const fetchBatchNum = await retrieveBatchNumberHeader(retrieveRequest);

    const request = {
      "site": site,
      "batchNo": form.getFieldsValue().object,
      "phaseId": filterFormData?.defaultPhaseId || phaseByDefault,
      "operation": filterFormData?.defaultOperation,
      "resource": filterFormData?.defaultResource,
      "scrapQuantity": +form.getFieldsValue().scrapQuantity,
      "material": fetchBatchNum?.response?.material || selectedRowData?.[0]?.material,
      "materialVersion": fetchBatchNum?.response?.materialVersion || selectedRowData?.[0]?.materialVersion,
      "orderNumber": fetchBatchNum?.response?.orderNo || selectedRowData?.[0]?.orderNumber,
      "user": username
    }
    const response = await unScrapBatchNumber(request);
    if (response?.errorCode) {
      message.error(response?.message);
    }
    else {
      if(response?.message_details?.msg_type == "E"){
        message.error(response?.message_details?.msg);
      }
      else{
        message.success(response?.message_details?.msg);
      }
    }
  }

  const handleScrap = async () => {
    // debugger
    message.destroy();
    if (filterFormData?.podCategory.toLowerCase() == "process") {
      if (form.getFieldsValue()?.object == "" || form.getFieldsValue()?.object == null || form.getFieldsValue()?.object == undefined) {
        message.error("Please select a batch number");
        return;
      }
     
      if (buttonText.toLowerCase() == "scrap") {
        handleScrapBatchNumber()
      }
      else {
        handleUnScrapBatchNumber()
      }
    }

    else {
      if (objectLabel.toLowerCase().replaceAll(' ', '') == "pcu") {
        if (form.getFieldsValue()?.object == "" || form.getFieldsValue()?.object == null || form.getFieldsValue()?.object == undefined) {
          message.error("Please select a pcu");
          return;
        }
      }

      if (objectLabel.toLowerCase().replaceAll(' ', '') == "shoporder") {
        if (form.getFieldsValue()?.object == "" || form.getFieldsValue()?.object == null || form.getFieldsValue()?.object == undefined) {
          message.error("Please select a shop order");
          return;
        }

        if (selectedRowKeys && selectedRowKeys.length < 0) {
          message.error("Please select a pcu");
          return;
        }
      }

      if (buttonText == "Scrap") {
        // debugger;
        let request;

        if (selectedRowKeys && selectedRowKeys.length > 0) {
          // Get selected rows from pcuList using selectedRowKeys
          const selectedRows = pcuList.filter(row => selectedRowKeys.includes(row.key));

          // Create an array of individual request objects
          request = selectedRows.map(row => ({
            site: site,
            object: row.pcu,
            operation: filterFormData?.defaultOperation,
            userId: username
          }));
        }
        else {
          // Single request if no rows selected
          request = [{
            site: site,
            object: form.getFieldsValue()?.object,
            operation: filterFormData?.defaultOperation,
            userId: username
          }];

          if (objectLabel.toLowerCase().replaceAll(' ', '') == "shoporder") {
            message.error("Please select a pcu");
            return
          }
        }

        console.log("scrap request: ", request);
        const response = await scrap(request);
        console.log("scrap response: ", response);
        if (!response.errorCode) {
          setSelectedRowKeys([]);
          if (response.msg_type == 'E')
            message.error(response.message_details.msg);
          else
            message.success(response.message_details.msg);

          request = {
            site: site,
            objectList: [form.getFieldsValue()?.object],
            operation: filterFormData?.defaultOperation,
            userId: username
          };


          console.log("retrievePCUtoScrap request: ", request);
          let retrievePCUtoScrapResponse = await retrievePCUtoScrap(request);
          console.log("retrievePCUtoScrap response2: ", retrievePCUtoScrapResponse);
          if (!retrievePCUtoScrapResponse.errorCode) {
            retrievePCUtoScrapResponse = retrievePCUtoScrapResponse.map((item, index) => ({
              ...item,
              key: index,
              id: index
            }))
            setPcuList(retrievePCUtoScrapResponse)
          }
        }
      }

      else {
        handleUnscrap()
      }
    }

  }

  const handleUnscrap = async () => {
    let request;

    if (selectedRowKeys && selectedRowKeys.length > 0) {
      // Get selected rows from pcuList using selectedRowKeys
      const selectedRows = pcuList.filter(row => selectedRowKeys.includes(row.key));

      // Create an array of individual request objects
      request = selectedRows.map(row => ({
        site: site,
        object: row.pcu,
        operation: filterFormData?.defaultOperation,
        userId: username
      }));
    }
    else {
      // Single request if no rows selected
      request = [{
        site: site,
        object: form.getFieldsValue()?.object,
        operation: filterFormData?.defaultOperation,
        userId: username
      }];

      if (objectLabel.toLowerCase().replaceAll(' ', '') == "shoporder") {
        message.error("Please select a pcu");
        return;
      }
    }

    console.log("Unscrap request: ", request);
    const response = await unScrap(request);
    console.log("Unscrap response: ", response);

    if (!response.errorCode) {
      setSelectedRowKeys([]);
      if (response.msg_type == 'E') {
        message.error(response.message_details.msg);
      } else {
        message.success(response.message_details.msg);
      }

      const retrieveRequest = {
        site: site,
        objectList: [form.getFieldsValue()?.object]
      };
      console.log("retrievePCUtoScrap request: ", retrieveRequest);
      let retrievePCUtoScrapResponse = await retrievePCUtoUnscrap(retrieveRequest);
      console.log("retrievePCUtoScrap response: ", retrievePCUtoScrapResponse);
      if (!retrievePCUtoScrapResponse.errorCode) {
        retrievePCUtoScrapResponse = retrievePCUtoScrapResponse.map((item, index) => ({
          ...item,
          key: index,
          id: index
        }));
        setPcuList(retrievePCUtoScrapResponse);
      }
    }
  };

  const handleClear = () => {
    form.setFieldsValue({
      object: "",
      comments: ""
    });
    setPcuList([]);
  }

  const oTableColumns = [
    { title: filterFormData?.podCategory.toLowerCase() == "process" ? t('batchNo') : t('pcu'), dataIndex: filterFormData?.podCategory.toLowerCase() == "process" ? 'batchNo' : 'pcu', key: filterFormData?.podCategory.toLowerCase() == "process" ? 'batchNo' : 'pcu', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('status'), dataIndex: filterFormData?.podCategory.toLowerCase() == "process" ? 'status' : 'status', key: filterFormData?.podCategory.toLowerCase() == "process" ? 'status' : 'status', align: 'center' as 'left' | 'right' | 'center' },

    { title: filterFormData?.podCategory.toLowerCase() == "process" ? t('orderNumber') : t('shopOrder'), dataIndex: filterFormData?.podCategory.toLowerCase() == "process" ? 'orderNumber' : 'shopOrder', key: filterFormData?.podCategory.toLowerCase() == "process" ? 'orderNumber' : 'shopOrder', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('material'), dataIndex: filterFormData?.podCategory.toLowerCase() == "process" ? 'material' : 'item', key: filterFormData?.podCategory.toLowerCase() == "process" ? 'material' : 'item', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('materialVersion'), dataIndex: filterFormData?.podCategory.toLowerCase() == "process" ? 'materialVersion' : 'itemVersion', key: filterFormData?.podCategory.toLowerCase() == "process" ? 'materialVersion' : 'itemVersion', align: 'center' as 'left' | 'right' | 'center' },
    ...(filterFormData?.podCategory?.toLowerCase() === "discrete" ? [
      { title: t('resource'), dataIndex: filterFormData?.podCategory.toLowerCase() == "process" ? 'defaultResource' : 'resource', key: filterFormData?.podCategory.toLowerCase() == "process" ? 'defaultResource' : 'resource', align: 'center' as 'left' | 'right' | 'center' },
      { title: t('operation'), dataIndex: 'operation', key: 'operation', align: 'center' as 'left' | 'right' | 'center' },
      { title: t('version'), dataIndex: 'operationVersion', key: 'operationVersion', align: 'center' as 'left' | 'right' | 'center' },
      { title: t('routing'), dataIndex: 'router', key: 'router', align: 'center' as 'left' | 'right' | 'center' },
      { title: t('version'), dataIndex: 'routerVersion', key: 'routerVersion', align: 'center' as 'left' | 'right' | 'center' },
      { title: t('bom'), dataIndex: 'bom', key: 'bom', align: 'center' as 'left' | 'right' | 'center' },
      { title: t('bomVersion'), dataIndex: 'bomVersion', key: 'bomVersion', align: 'center' as 'left' | 'right' | 'center' }
    ] : [])
  ];

  return (
    <>
      <div className={styles.containers} style={{ height: 'calc(100vh - 50px)' }}>
        <div style={{
          marginLeft: '7%',
          marginTop: '1%',
          rowGap: '0px',
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <Form
            form={form}
            layout="horizontal"
            size="small"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Row gutter={16}>
              {/* Left Column */}
              <Col span={12}>
                <Form.Item
                  label={t("activity")}
                  name="activity"
                  initialValue="Scrap"
                  required={true}
                  style={{ width: '80%' }}
                >
                  <Select
                    onChange={(value) => handleSelectChange('activity', value)}
                    ref={firstInputRef}
                  >
                    <Select.Option value="Scrap">Scrap</Select.Option>
                    <Select.Option value="Unscrap">Unscrap</Select.Option>
                  </Select>
                </Form.Item>

                {filterFormData?.podCategory.toLowerCase() == "discrete" && (
                  <Form.Item 
                    label={t(objectLabel)} 
                    name="object" 
                    required={true}
                    style={{ width: '80%' }}
                  >
                    <Input
                      suffix={filterFormData?.podCategory.toLowerCase() == "discrete" && (
                        <GrChapterAdd
                          onClick={(value) => handleClick(value, objectLabel)}
                        />
                      )}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .toUpperCase()
                          .replace(/\s+/g, '')
                          .replace(/[^A-Z0-9_-]/g, '');
                        handleInputChange(objectLabel, newValue);
                      }}
                    />
                  </Form.Item>
                )}

                {filterFormData?.podCategory.toLowerCase() == "process" && (
                  <Form.Item 
                    label={t(objectLabel)} 
                    name="object" 
                    required={true}
                    style={{ width: '80%' }}
                  >
                    <Input
                      onChange={(e) => {
                        const newValue = e.target.value
                          .toUpperCase()
                          .replace(/\s+/g, '')
                          .replace(/[^A-Z0-9_-]/g, '');
                        handleInputChange(objectLabel, newValue);
                      }}
                    />
                  </Form.Item>
                )}
              </Col>

              {/* Right Column */}
              <Col span={12}>
                {filterFormData?.podCategory.toLowerCase() == "discrete" && (
                  <Form.Item
                    label={t("type")}
                    name="type"
                    initialValue={filterFormData?.podCategory.toLowerCase() == "process" ? "BacthNo" : "PCU"}
                    style={{ width: '80%' }}
                  >
                    <Select onChange={(value) => handleSelectChange('type', value)}>
                      <Select.Option value="PCU">PCU</Select.Option>
                      <Select.Option value="Shop Order">Shop Order</Select.Option>
                      <Select.Option value="Process Lot">Process Lot</Select.Option>
                    </Select>
                  </Form.Item>
                )}

                {filterFormData?.podCategory.toLowerCase() == "process" && (
                  <Form.Item
                    label={t("type")}
                    name="type"
                    initialValue="BacthNo"
                    style={{ width: '80%' }}
                  >
                    <Select onChange={(value) => handleSelectChange('type', value)}>
                      <Select.Option value="BacthNo">Batch Number</Select.Option>
                      <Select.Option value="Order Number">Order Number</Select.Option>
                    </Select>
                  </Form.Item>
                )}

                {filterFormData?.podCategory.toLowerCase() == "process" && (
                  <Form.Item 
                    label={t("scrapQuantity")} 
                    name="scrapQuantity" 
                    required={false}
                    style={{ width: '80%' }}
                  >
                    <Input
                      type="number"
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/[^0-9]/g, '');
                        handleInputChange("scrapQuantity", newValue);
                      }}
                      onKeyDown={(e) => {
                        if (e.key.toLowerCase() === 'e') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                )}

                {filterFormData?.podCategory.toLowerCase() == "discrete" && (
                  <Form.Item 
                    label={t("comments")} 
                    name="comments" 
                    required={false}
                    style={{ width: '80%' }}
                  >
                    <TextArea
                      onChange={(e) => {
                        const newValue = e.target.value;
                        handleInputChange("comments", newValue);
                      }}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Form>
        </div>



        <Table
          className={styles.assemblyTable}
          dataSource={pcuList}
          columns={oTableColumns}
          rowKey="key"
          pagination={false}
          scroll={{ y: pcuList.length > 0 ? 'calc(100vh - 200px)' : '70px' }}
          bordered
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (newSelectedRowKeys) => {
              setSelectedRowKeys(newSelectedRowKeys);
            }
          }}
          onRow={(record: TableRecord) => ({
            onClick: () => {
              const key = record.key;
              const currentSelected = selectedRowKeys || [];
              const newSelectedRowKeys = currentSelected.includes(key)
                ? currentSelected.filter(k => k !== key)
                : [...currentSelected, key];
              setSelectedRowKeys(newSelectedRowKeys);
            }
          })}
          size="small"
        />


        <div className={styles.submitButton} style={{ marginTop: '10px', gap: '10px' }}>

          <Button
            type="primary"
            onClick={handleRetrieve}
            size="small"
            style={{ fontSize: 'auto' }}
          >
            {t('retrieve')}
          </Button>

          <Button
            type="primary"
            onClick={handleScrap}
            size="small"
          >
            {t(buttonText)}
          </Button>

          <Button
            type="default"
            onClick={handleClear}
            size="small"
            style={{ fontSize: 'auto' }}
          >
            {t('clear')}
          </Button>
          <div style={{display:'flex'}}> 
           <InstructionModal>
      <ScrapManual />
     </InstructionModal>
      </div>
        </div>

        <Modal
          title={
            <>
              {t('select')} {t(field)}


            </>
          }
          open={visible}
          // onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={800}
          footer={null}
        >
          <Table
            columns={tableColumns}
            dataSource={tableData}
            onRow={(record: TableRecord) => ({
              onDoubleClick: () => handleRowSelection(record),
            })}
            // pagination={{
            //   pageSize: 6,
            // }}
            pagination={false}
            scroll={{ y: 300 }}
          />
        </Modal>
      </div>

    </>
  );
};

export default ScrapUnscrapPlugin;

