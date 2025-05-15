import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Select, Button, Switch, Modal, Table } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from 'nookies';
import { retrieveAllBom, retrieveAllDataType, retrieveAllItemGroup, retrieveAllRouting, retrieveTop50Bom, retrieveTop50DataType, retrieveTop50ItemGroup, retrieveTop50Routing } from '@services/itemServices';
import { useTranslation } from 'react-i18next';
import { ItemContext } from '@modules/item/hooks/itemContext';
import { retrieveTop50BOM } from '@services/routingServices';

const { Option } = Select;

interface RoutingData {
  id: number;
  routing: string;
  version: string;
  description: string;
  status: string;
}

interface BOMData {
  id: number;
  bom: string;
  revision: string;
  description: string;
  status: string;
}

interface DataTypeData {
  id: number;
  dataType: string;
  category: string;
  description: string;
}

interface ItemGroupData {
  id: number;
  itemGroup: string;
  groupDescription: string;
}

interface ItemMaintenanceFormProps {
  onChange: (values: Record<string, any>) => void;
  setNewData: (values: Record<string, any>) => void;
  rowData: object;
  itemRowData: object;
  onValuesChange: (values: Record<string, any>) => void;
  setFormValues: (values: Record<string, any>) => void;
  setFormModifiedData: (values: Record<string, any>) => void;
  resetValue: boolean;
  resetValueCall: number;
  formValues: object;
  payloadData: object;
  setPayloadData: () => void;
}

const ItemMaintenanceForm: React.FC<ItemMaintenanceFormProps> = ({ onChange, rowData, setFormValues, resetValue, resetValueCall,
  setNewData, onValuesChange, formValues, itemRowData, setFormModifiedData }) => {

  const { payloadData, setPayloadData, setShowAlert, username } = useContext(ItemContext);
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [routingVisible, setRoutingVisible] = useState(false);
  const [bomVisible, setBomVisible] = useState(false);
  const [dataTypeVisible, setDataTypeVisible] = useState(false);
  const [itemGroupVisible, setItemGroupVisible] = useState(false);


  const [type, setType] = useState('');

  const [routingData, setRoutingData] = useState<RoutingData[]>([]);
  const [bomData, setBomData] = useState<BOMData[]>([]);
  const [dataTypeData, setDataTypeData] = useState<DataTypeData[]>([]);
  const [itemGroupData, setItemGroupData] = useState<ItemGroupData[]>([]);


  const handleValuesChange = (changedValues: any) => {
    // console.log("values: ", changedValues);
    onValuesChange(form.getFieldsValue());
  };
  useEffect(() => {
    if (resetValue == false || rowData != null) {
      form.setFieldsValue(rowData);

      // console.log("Form Values: ", form.getFieldValue());
      setFormValues(form.getFieldsValue());
    }
    else if (resetValue == true || rowData == null)
      form.resetFields();
  }, [rowData, form, resetValue, resetValueCall]);

  useEffect(() => {
    // console.log("Changed form values: ", formValues);
    // form.setFieldsValue(formValues);

  }, [formValues])

  // useEffect(() => {
  //  setFormValues(form.getFieldValue());
  // }, [ form]);

  useEffect(() => {
    // Set form fields with rowData when it changes
    // if (rowData) {
    //   form.setFieldsValue(rowData);
    // }

    if (itemRowData) {
      // console.log("itemRowData", itemRowData);
      //form.setFieldsValue(itemRowData);
    }
  }, [rowData, form, itemRowData]);

  useEffect(() => {
    form.setFieldsValue(payloadData)
  }, [payloadData]);

  useEffect(() => {
    const fetchRoutingData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = username;




    };

    fetchRoutingData();
  }, []);



  const onFinish = (values) => {
    setNewData(values)
    // console.log('called');

    // form.getFieldValue();
  }

  const handleRoutingClick = async () => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldsValue().routing;

    try {
      if (typedValue)
        response = await retrieveAllRouting(site, typedValue);
      else
        response = await retrieveTop50Routing(site);
      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            routing: item.routing,
            version: item.version,
            description: item.description,
            status: item.status,
          }));
          setRoutingData(formattedData);
        }
      }
      else {
        setRoutingData([]);
      }
    } catch (error) {
      console.error('Error fetching routing data:', error);
    }
    setRoutingVisible(true);
  };

  const handleBOMClick = async () => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;

    const typedValue = form.getFieldsValue().bom;
    try {
      if (typedValue)
        response = await retrieveAllBom(site, typedValue);
      else
        response = await retrieveTop50BOM(site);
      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            bom: item.bom,
            revision: item.revision,
            description: item.description,
            status: item.status,
          }));
          setBomData(formattedData);
        }
      }
      else {
        setBomData([]);

      }

    }
    catch (error) {
      console.error('Error fetching bom data:', error);
    }
    setBomVisible(true);
  };

  const handleDataTypeClick = async (oEvent, type) => {
    const dataType = oEvent.currentTarget.getAttribute('data-type');
    setType(dataType);
    let response, typedValue;
    const cookies = parseCookies();
    const site = cookies.site;
    if (dataType == "AssemblyDataType")
      typedValue = form.getFieldsValue().assemblyDataType;

    else if (dataType == "RemovalDataType")
      typedValue = form.getFieldsValue().removalDataType;

    else if (dataType == "ReceiptDataType")
      typedValue = form.getFieldsValue().receiptDataType;
    debugger
    try {
      if (typedValue)
        response = await retrieveAllDataType(site, typedValue, "Assembly");
      else
        response = await retrieveTop50DataType(site);
      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            dataType: item.dataType,
            category: item.category,
            description: item.description,
          }));
          setDataTypeData(formattedData);
        }
      }
      else {
        setDataTypeData([]);

      }
    } catch (error) {
      console.error('Error fetching datatype data:', error);
    }

    setDataTypeVisible(true);

  };

  const handleItemGroupClick = async (oEvent) => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldsValue().itemGroup;

    try {
      if (typedValue)
        response = await retrieveAllItemGroup(site, typedValue);
      else
        response = await retrieveTop50ItemGroup(site);
      if (response) {

        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            itemGroup: item.itemGroup,
            groupDescription: item.groupDescription,
          }));
          setItemGroupData(formattedData);
        }

      }
      else {
        setItemGroupData([]);
      }
    } catch (error) {
      console.error('Error fetching item group data:', error);
    }

    setItemGroupVisible(true);

  };


  const handleRoutingOk = (record) => {
    const routingValue = record.routing;
    const routingVersionValue = record.version;
    if (routingValue && routingVersionValue) {
      form.setFieldsValue({
        routing: routingValue,
        routingVersion: routingVersionValue,
      });
    }
    setFormValues(form.getFieldsValue());
    setRoutingVisible(false);
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }));
    setShowAlert(true);
  };

  const handleBOMOk = (record) => {

    const bomValue = record.bom;
    const bomVersionValue = record.revision;
    if (bomValue && bomVersionValue) {
      form.setFieldsValue({
        bom: bomValue,
        bomVersion: bomVersionValue,
      });
    }

    setFormValues(form.getFieldsValue());
    setBomVisible(false);
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }));
    setShowAlert(true);
  };

  const handleItemGroupOk = (oItemGroup) => {

    if (oItemGroup) {
      form.setFieldsValue({
        itemGroup: oItemGroup
      });
    }
    setFormValues(form.getFieldsValue());
    setItemGroupVisible(false);
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }));
    setShowAlert(true);
  };

  const handleDataTypeOk = (oDatatype) => {

    if (oDatatype) {
      if (type == "AssemblyDataType") {
        form.setFieldsValue({
          assemblyDataType: oDatatype,
        });

      }
      if (type == "RemovalDataType") {
        form.setFieldsValue({
          removalDataType: oDatatype,
        });
      }
      if (type == "ReceiptDataType") {
        form.setFieldsValue({
          receiptDataType: oDatatype,
        });
      }
    }
    // console.log("Form valus on slect: ", form.getFieldsValue())
    setFormValues(form.getFieldsValue());
    setDataTypeVisible(false);
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }));
    setShowAlert(true);
  };

  const handleCancel = () => {
    setRoutingVisible(false);
    setBomVisible(false);
    setDataTypeVisible(false);
    setItemGroupVisible(false);
  };

  const routingColumns = [
    {
      title: t('routing'),
      dataIndex: 'routing',
      key: 'routing',
    },
    {
      title: t('version'),
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const bomColumns = [
    {
      title: t('bom'),
      dataIndex: 'bom',
      key: 'bom',
    },
    {
      title: t('version'),
      dataIndex: 'revision',
      key: 'revision',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const dataTypeColumns = [
    {
      title: t('dataType'),
      dataIndex: 'dataType',
      key: 'dataType',
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const itemGroupColumns = [
    {
      title: t('itemGroup'),
      dataIndex: 'itemGroup',
      key: 'itemGroup',
    },
    {
      title: t('description'),
      dataIndex: 'groupDescription',
      key: 'groupDescription',
    },
  ];

  const handleInputChange = (name: string, value: any) => {
    let formattedValue;
    debugger

    if (name != "description" && name != "procurementType" && name != "itemType" && name != "qtyRestriction" && name != "status" && name != "currentVersion") {
      // Convert value to uppercase
      formattedValue = value.toUpperCase();
      formattedValue = formattedValue.replace(/\s+/g, '');
      formattedValue = formattedValue.replace(/[^A-Z0-9_-]/g, '');
    }
    else {
      formattedValue = value;
    }

    form.setFieldsValue({ [name]: formattedValue });
    setShowAlert(true);
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }));
  };

  return (
    <>
      <Form
        layout="horizontal"
        // style={{ width: '100%', marginTop: '2%' }}
        form={form}
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 24 }}
        style={{
          marginTop: '2%',
          // maxHeight: '65vh',
          // overflowY: 'auto',
          // width: '100%',
          // padding: '15px'
        }}
      >
        <Form.Item
          label={t("item")}
          name="item"
          rules={[{ required: true, message: 'Item is required' }]}
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            onChange={(e) =>
              // setTimeout(() => {
                handleInputChange('item', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
              // }, 2)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("revision")}
          name="revision"
          rules={[{ required: true, message: 'Revision is required' }]}
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('revision', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 10)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("description")}
          name="description"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            onChange={(e) => handleInputChange('description', e.target.value)}

          />
        </Form.Item>

        <Form.Item
          label={t("itemGroup")}
          name="itemGroup"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            suffix={
              <GrChapterAdd onClick={handleItemGroupClick} style={{ cursor: 'pointer' }} />
            }

            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('itemGroup', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }

          />


        </Form.Item>

        <Form.Item
          label={t("status")}
          name="status"
          rules={[{ required: true, message: 'Status is required' }]}
          initialValue="New"
        >
          <Select
            style={{ width: '40%' }}
            onChange={(value) => handleInputChange('status', value)}
          >
            <Option value="New">New</Option>
            <Option value="Releasable">Releasable</Option>
            <Option value="Hold">Hold</Option>
            <Option value="Obsolete">Obsolete</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("procurementType")}
          name="procurementType"
          rules={[{ required: true, message: 'Procurement Type is required' }]}
          initialValue="Manufactured"
        >
          <Select
            style={{ width: '40%' }}
            onChange={(value) => handleInputChange('procurementType', value)}
          >
            <Option value="Manufactured">Manufactured</Option>
            <Option value="Manufactured / Purchased">Manufactured / Purchased</Option>
            <Option value="Purchased">Purchased</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("currentVersion")}
          name="currentVersion"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch onChange={(checked) => handleInputChange('currentVersion', checked)} />
        </Form.Item>

        <Form.Item
          label={t("itemType")}
          name="itemType"
          rules={[{ required: true, message: 'Item Type is required' }]}
          initialValue="Manufactured"
        >
          <Select
            style={{ width: '40%' }}
            onChange={(value) => handleInputChange('itemType', value)}
          >
            <Option value="Manufactured">Manufactured</Option>
            <Option value="Manufactured / Purchased">Manufactured / Purchased</Option>
            <Option value="Purchased">Purchased</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("qtyRestriction")}
          name="qtyRestriction"
          initialValue="Any Number"
        >
          <Select
            style={{ width: '40%' }}
            onChange={(value) => handleInputChange('qtyRestriction', value)}
          >
            <Option value="Any Number">Any Number</Option>
            <Option value="Only 1">Only 1</Option>
            <Option value="Whole Number">Whole Number</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("lotSize")}
          name="lotSize"
          rules={[{ required: true, message: 'Lot Size is required' }]}
          initialValue=""
        >
          <Input
            type="number"
            placeholder=""
            style={{ width: '40%' }}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => handleInputChange('lotSize', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label={t("routing")}
          name="routing"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            suffix={
              <GrChapterAdd onClick={handleRoutingClick} style={{ cursor: 'pointer' }} />
            }
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('routing', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("routingVersion")}
          name="routingVersion"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('routingVersion', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("bom")}
          name="bom"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            suffix={
              <GrChapterAdd onClick={handleBOMClick} style={{ cursor: 'pointer' }} />
            }
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('bom', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("bomVersion")}
          name="bomVersion"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('bomVersion', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("assemblyDataType")}
          name="assemblyDataType"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            suffix={
              <Button
                type="text"
                icon={<GrChapterAdd />}
                // onClick={handleDataTypeClick}
                data-type="AssemblyDataType"
                onClick={(e) => handleDataTypeClick(e, 'AssemblyDataType')}
              // onChange={(e) => form.setFieldsValue({ assemblyDataType: e.target.value })}

              />
            }
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('assemblyDataType', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }

          />
        </Form.Item>

        <Form.Item
          label={t("removalDataType")}
          name="removalDataType"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            name="removalDataType"
            suffix={
              <Button
                type="text"
                icon={<GrChapterAdd />}
                data-type="RemovalDataType"
                // onClick={handleDataTypeClick}
                onClick={(e) => handleDataTypeClick(e, 'RemovalDataType')}
              // onChange={(e) => form.setFieldsValue({ removalDataType: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
              

              />
              

            }
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('removalDataType', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }

          />
        </Form.Item>

        <Form.Item
          label={t("receiptDataType")}
          name="receiptDataType"
          initialValue=""
        >
          <Input
            placeholder=""
            style={{ width: '40%' }}
            name="receiptDataType"
            suffix={
              <Button
                type="text"
                icon={<GrChapterAdd />}
                data-type="ReceiptDataType"
                // onClick={handleDataTypeClick}
                onClick={(e) => handleDataTypeClick(e, 'ReceiptDataType')}
              // onChange={(e) => form.setFieldsValue({ receiptDataType: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}

              />
            }
            onChange={(e) =>
              // setTimeout(() => {
              handleInputChange('receiptDataType', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              // }, 100)
            }

          />
        </Form.Item>



        {/* <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item> */}
      </Form>

      <Modal
        title={t("selectRouting")}
        open={routingVisible}
        onOk={handleRoutingOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          // rowSelection={{
          //   type: 'radio',
          //   selectedRowKeys: selectedRoutingRowKeys,
          //   onChange: onRoutingTableRowSelection,
          // }}
          onRow={(record) => ({
            onDoubleClick: () => handleRoutingOk(record),
          })}
          columns={routingColumns}
          dataSource={routingData}
          rowKey="id" // Use the generated id as the row key
          pagination={false}
          scroll={{ y: 'calc(100vh - 450px)' }}
          bordered
        />
      </Modal>

      <Modal
        title={t("selectBOM")}
        open={bomVisible}
        onOk={handleBOMOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          // rowSelection={{
          //   type: 'radio',
          //   selectedRowKeys: selectedBOMRowKeys,
          //   onChange: onBOMTableRowSelection,
          // }}
          columns={bomColumns}
          dataSource={bomData}
          onRow={(record) => ({
            onDoubleClick: () => handleBOMOk(record),
          })}
          rowKey="bom" // Use the bom as the row key
          pagination={false}
          scroll={{ y: 'calc(100vh - 450px)' }}
          bordered
        />
      </Modal>

      <Modal
        title={t("selectDataType")}
        open={dataTypeVisible}
        onOk={handleDataTypeOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          columns={dataTypeColumns}
          dataSource={dataTypeData}
          rowKey="id"
         
          onRow={(record) => ({
            onDoubleClick: () => handleDataTypeOk(record.dataType),
          })}
          // pagination={{ pageSize: 6 }} // Set page size to 8
          pagination={false}
          scroll={{ y: 'calc(100vh - 450px)' }}
          bordered
        />
      </Modal>

      <Modal
        title={t("selectItemGroup")}
        open={itemGroupVisible}
        footer={null}
        onOk={handleItemGroupOk}
        onCancel={handleCancel}
        width={800}
      >
        <Table
          columns={itemGroupColumns}
          dataSource={itemGroupData}
          rowKey="id"
          onRow={(record) => ({
            onDoubleClick: () => handleItemGroupOk(record.itemGroup),
          })}
          // pagination={{ pageSize: 6 }} // Set page size to 8
          pagination={false}
          scroll={{ y: 'calc(100vh - 300px)' }}

        />
      </Modal>
    </>
  );
};

export default ItemMaintenanceForm;