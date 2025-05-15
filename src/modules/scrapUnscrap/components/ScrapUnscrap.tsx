// src/modules/activityMaintenance/components/ActivityMaintenance.tsx

'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, Table, Popconfirm, Modal, Row, Col, Select, message, Drawer, Switch, Tooltip } from 'antd';
import { parseCookies } from 'nookies';
import styles from '../styles/CommonTable.module.css'; // Use the styles from the module
import { decryptToken } from '@/utils/encryption';
import { useAuth } from '@context/AuthContext';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from '@modules/changeEquipmentStatus/types/changeEquipmentType';
import { fetchAllShopOrderData, fetchPcuToUnScrap, fetchShopOrderTop50, retrievePCUHeader, retrievePCUtoScrap, retrievePCUtoUnscrap, scrap, unScrap, updateResourceStatus } from '@services/scrapUnscrapService';
import { useTranslation } from 'react-i18next';
import { RetriveResourcePod } from '@services/podServices';
import { PodConfig } from '@modules/podApp/types/userTypes';
import { GrChapterAdd } from "react-icons/gr";
import TextArea from 'antd/es/input/TextArea';
import ScrapUnscrapPluginApp from '@modules/scrapUnscrap/components/ScrapUnscrap';
import CommonAppBar from '@components/CommonAppBar';

interface TableRecord {
  key: React.Key;
  [key: string]: any;
}

interface ScrapUnscrapProps {
  filterFormData: PodConfig;
  selectedRowData: any;
  call2: number;
  selectedContainer: any;
  phaseByDefault: any
}

// Define the component with typed props
const ScrapUnscrap: React.FC<ScrapUnscrapProps> = ({ filterFormData, selectedRowData, call2 }) => {
  // console.log(filterFormData, "filterFormData");

  const [form] = Form.useForm();
  const { t } = useTranslation()
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [operation, setOperation] = useState(filterFormData?.defaultOperation)
  const [uiWcOrRes, setuiWcOrRes] = useState(filterFormData?.defaultResource)
  const { isAuthenticated, token } = useAuth();
  const [pcuList, setPcuList] = useState<any>([]);
  const [objectLabel, setObjectLabel] = useState<string>('PCU'); // New state for dynamic label
  const [visible, setVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  const [field, setField] = useState<any>();
  const [buttonText, setButtonText] = useState<string>("Scrap");

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(null);
  const [call, setCall] = useState<number>(0);

  useEffect(() => {
    // Update local state when filterFormData changes
    setOperation(filterFormData?.defaultOperation);
    setuiWcOrRes(filterFormData?.defaultResource);
  }, [filterFormData]);
  // console.log("selectedRowData: ", selectedRowData);

  // Handler function for when the selection changes


  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      const cookies = parseCookies();
      const site = cookies.site;
      setSite(site);
      // const res = await RetriveResourcePod(site, filterFormData?.defaultResource)
      // console.log(res, 'ress');

      // setOldState(res.setUpState);
      form.setFieldsValue({
        object: selectedRowData?.[0]?.pcu,
        comments: "",
        activity: "Scrap",
        type: "PCU"
      });
      setButtonText("Scrap");
      setObjectLabel("PCU");
      setPcuList([]);

    };

    fetchToken();
  }, [isAuthenticated, token, site, filterFormData?.defaultResource, selectedRowData, call2, call]);










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
        debugger
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

  const handleScrap = async () => {
    debugger
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

    if (buttonText == "Scrap") {
      debugger;
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
          object: form.getFieldsValue().object,
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
          objectList: [form.getFieldsValue().object],
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
        object: form.getFieldsValue().object,
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
        objectList: [form.getFieldsValue().object]
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
    { title: t('pcu'), dataIndex: 'pcu', key: 'pcu', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('status'), dataIndex: 'status', key: 'status', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('operation'), dataIndex: 'operation', key: 'operation', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('version'), dataIndex: 'operationVersion', key: 'operationVersion', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('resource'), dataIndex: 'resource', key: 'resource', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('material'), dataIndex: 'item', key: 'item', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('itemVersion'), dataIndex: 'itemVersion', key: 'itemVersion', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('routing'), dataIndex: 'router', key: 'router', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('version'), dataIndex: 'routerVersion', key: 'routerVersion', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('bom'), dataIndex: 'bom', key: 'bom', align: 'center' as 'left' | 'right' | 'center' },
    { title: t('bomVersion'), dataIndex: 'bomVersion', key: 'bomVersion', align: 'center' as 'left' | 'right' | 'center' },
  ];


  return (
    <>
      <div className={styles.containers}>
      <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("scrapUnscrapTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        <div style={{
          width: '100%',
          marginLeft: '7%',
          marginTop: '2%',
          marginBottom: '1%'
        }}>
        

          <Form
            form={form}
            layout="horizontal"

            // style={{ width: '100%' }}
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 34 }}

          >


            <Form.Item
              label={t("activity")}
              name="activity"
              initialValue="Scrap"
              style={{ width: "60%" }}
              required={true}
            >
              <Select onChange={(value) => handleSelectChange('activity', value)}>
                <Select.Option value="Scrap">Scrap</Select.Option>
                <Select.Option value="Unscrap">Unscrap</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={t("type")}
              name="type"
              initialValue="PCU"
              style={{ width: "60%" }}
            >
              <Select onChange={(value) => handleSelectChange('type', value)}>
                <Select.Option value="PCU">PCU</Select.Option>
                <Select.Option value="Shop Order">Shop Order</Select.Option>
                <Select.Option value="Process Lot">Process Lot</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label={t(objectLabel)} style={{ width: "60%" }} name="object" required={true}>
              <Input
                suffix={
                  <GrChapterAdd
                    onClick={(value) =>
                      handleClick(value, objectLabel)
                    }
                  />
                }
                onChange={(e) => {
                  const newValue = e.target.value
                    .toUpperCase()                  // Convert to uppercase
                    .replace(/\s+/g, '')            // Remove all spaces
                    .replace(/[^A-Z0-9_-]/g, '');   // Allow hyphen and remove all other special characters
                  handleInputChange(objectLabel, newValue); // Update the form with the new value
                }}
              />
            </Form.Item>

            <Form.Item label={t("comments")} style={{ width: "60%" }} name="comments" required={false}>
              <TextArea
                onChange={(e) => {
                  const newValue = e.target.value
                  // .toUpperCase()                  // Convert to uppercase
                  // .replace(/\s+/g, '')            // Remove all spaces
                  // .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores
                  handleInputChange("comments", newValue); // Update the form with the new value
                }}
              />
            </Form.Item>
          </Form>
        </div>



        <Table
          className={styles.assemblyTable}
          dataSource={pcuList}
          columns={oTableColumns}
          rowKey="key"
          pagination={false}
          size="middle"
          scroll={{ y: 55 * 5 }}
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
        />


        <div className={styles.submitButton} style={{ marginTop: '10px', gap: '10px' }}>

          <Button
            type="primary"
            onClick={handleRetrieve}
          >
            {t('retrieve')}
          </Button>
          <Button
            type="primary"
            onClick={handleScrap}
          >
            {t(buttonText)}
          </Button>
          <Button
            type="default"
            onClick={handleClear}
          >
            {t('clear')}
          </Button>
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

        {/* <ScrapUnscrapPluginApp  filterFormData={filterFormData} selectedRowData={selectedRowData} call2={call2} selectedContainer={null}  phaseByDefault={null} /> */}

      </div>

    </>
  );
};

export default ScrapUnscrap;

