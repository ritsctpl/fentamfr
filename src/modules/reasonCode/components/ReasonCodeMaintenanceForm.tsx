import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Select, Modal, Table } from "antd";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import { fetchAllReasonCode, fetchAllResource,  fetchAllWorkCenter, fetchTop50ReasonCode, fetchTop50Resource, fetchTop50WorkCenter } from "@services/reasonCodeService";
import { useTranslation } from "react-i18next";
import { ReasonCodeContext } from "../hooks/reasonCodeContext";

const { Option } = Select;
const { TextArea } = Input;

interface ResourceData {
  id: number;
  resource: string;
  description: string;
}

interface WorkCenterData {
  id: number;
  workCenter: string;
  description: string;
}

interface ReasonCodeMaintenanceFormProps {
  onChange: (values: Record<string, any>) => void;
  setNewData: (values: Record<string, any>) => void;
  rowData: any;
  itemRowData: object;
  onValuesChange: (values: Record<string, any>) => void;
  setFormValues: (values: Record<string, any>) => void;
  resetValue: boolean;
  resetValueCall: number;
  formValues: object;
  setPayloadData: () => void;
  setShowAlert: (boolean) => void;
  username: string;
  formData: any;
  onSelectChange: any;
  addClick: any;
  addClickCount: any;
  setAddClick: any;
  payloadData: any;
}


const ReasonCodeMaintenanceForm: React.FC<ReasonCodeMaintenanceFormProps> = ({
  onChange,
  rowData,
  setFormValues,
  resetValue,
  resetValueCall,
  setNewData,
  onValuesChange,
  formValues,
  itemRowData,
  username,

}) => {
  const { t } = useTranslation();

  const { payloadData, setPayloadData, showAlert, setShowAlert } = useContext(ReasonCodeContext);
  const [form] = Form.useForm();

  const [reasonCodeVisible, setReasonCodeVisible] = useState(false);
  const [bomVisible, setBomVisible] = useState(false);
  const [dataTypeVisible, setDataTypeVisible] = useState(false);
  const [itemGroupVisible, setItemGroupVisible] = useState(false);

  const [selectedReasonCodeRowKeys, setSelectedRoutingRowKeys] = useState<
    React.Key[]
  >([]);
  const [selectedBOMRowKeys, setSelectedBOMRowKeys] = useState<React.Key[]>([]);



  const [reasonCodeFilter, setReasonCodeFilter] = useState("");
  const [bomFilter, setBOMFilter] = useState("");

  const [reasonCodeData, setReasonCodeData] = useState<any[]>([]);
  const [bomData, setBomData] = useState<any[]>([]);


  const [resourceVisible, setResourceVisible] = useState(false);
  const [workCenterVisible, setWorkCenterVisible] = useState(false);

  

  const [type, setType] = useState<string>("Resource");
  const [resourceData, setResourceData] = useState<ResourceData[]>([]);
  const [workCenterData, setWorkCenterData] = useState<WorkCenterData[]>([]);
  const [resourceRequired, setResourceRequired] = useState(true);
  const [workCenterRequired, setWorkCenterRequired] = useState(false);


  useEffect(() => {
    if (resetValue == false || rowData != null) {
      form.setFieldsValue({
        ...rowData,
        type: rowData?.type || "Resource" // Ensure type defaults to Resource
      });

      console.log("Form Values: ", form.getFieldsValue());
      setFormValues(form.getFieldsValue());
      setFormValues(payloadData);

    } else if (resetValue == true || rowData == null) {
      form.resetFields();
      form.setFieldsValue({ type: "Resource" }); // Set default type when resetting
    }
  }, [rowData, form, resetValue, resetValueCall]);



  useEffect(() => {
    // Set form fields with rowData when it changes
    // if (rowData) {
    //   form.setFieldsValue(rowData);
    // }

    if (itemRowData) {
      console.log("itemRowData", itemRowData);
      //form.setFieldsValue(itemRowData);
    }
  }, [rowData, form, itemRowData]);

  useEffect(() => {
    form.setFieldsValue({
      ...payloadData,
      type: payloadData?.type || "Resource" // Ensure type defaults to Resource
    });
    
    if (payloadData?.type === "Resource" || !payloadData?.type) {
      setWorkCenterRequired(false);
      setResourceRequired(true);
    } else {
      setWorkCenterRequired(true);
      setResourceRequired(false);
    }
  }, [payloadData]);

  useEffect(() => {
    handleResourceClick();
    handleWorkCenterClick();
  }, []);



  const onFinish = (values) => {
    setNewData(values);
    console.log("called");

    // form.getFieldsValue();
  };

  const handleValuesChange = (changedValues: any) => {
    console.log("values: ", changedValues);
    onValuesChange(form.getFieldsValue());
  };

  const handleReasonCodeClick = async () => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = username;
    const typedValue = form.getFieldsValue().reasonCode;
    try {
      if (typedValue)
        response = await fetchAllReasonCode(site, typedValue);
      else
        response = await fetchTop50ReasonCode(site);
      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index, // Use index as ID
            reasonCode: item.reasonCode,
            description: item.description,
            category: item.category,
            status: item.status,
          }));
          setReasonCodeData(formattedData);
        }
        else {
          setReasonCodeData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching reason code data:", error);
    }
    setReasonCodeVisible(true);
  };

  const handleBOMClick = () => {
    setBomVisible(true);
  };

  const handleResourceClick = async () => {

    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = username;
    const typedValue = form.getFieldsValue().resource;
    // debugger
    try {
      if (typedValue)
        response = await fetchAllResource(site, typedValue);
      else
        response = await fetchTop50Resource(site);
      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index, // Use index as ID
            ...item
          }));
          setResourceData(formattedData);
        }
        else {
          setResourceData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching resource data:", error);
    }


    // setResourceVisible(true);
  };

  // Handle opening of Work Center modal
  const handleWorkCenterClick = async () => {
    // Simulate fetching data for Work Center
    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = username;
    const typedValue = form.getFieldsValue().workCenter;
    // debugger
    try {
      if (typedValue)
        response = await fetchAllWorkCenter(site, typedValue);
      else
        response = await fetchTop50WorkCenter(site);
      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index, // Use index as ID
            ...item
          }));
          setWorkCenterData(formattedData);
        }
        else {
          setWorkCenterData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching work center data:", error);
    }

    // setWorkCenterVisible(true);
  };

  const handleReasonCodeOk = (typedValue) => {

    if (typedValue) {
      form.setFieldsValue({
        reasonCode: typedValue,
      });
    }
    setFormValues(form.getFieldsValue());
    setReasonCodeVisible(false);

    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue(),
    }));
  };

  const handleBOMOk = () => {
    const selectedRow = bomData.find(
      (item) => item.bom === selectedBOMRowKeys[0]
    );
    if (selectedRow) {
      form.setFieldsValue({
        bom: selectedRow.bom,
        bomVersion: selectedRow.revision,
      });
    }
    setFormValues(form.getFieldsValue());
    setBomVisible(false);
  };



  const handleCancel = () => {
    setReasonCodeVisible(false);
    setBomVisible(false);
    setDataTypeVisible(false);
    setItemGroupVisible(false);
    setWorkCenterVisible(false);
    setResourceVisible(false);
  };

 

  const onBOMTableRowSelection = (selectedRowKeys: React.Key[]) => {
    setSelectedBOMRowKeys(selectedRowKeys);
  };



  const handleResourceOk = (selectedRow) => {

    if (selectedRow) {
      form.setFieldsValue({
        resource: selectedRow.resource,
      });
    }
    setFormValues(form.getFieldsValue());
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue(),
    }));
    setResourceVisible(false);
  };

  // Handle selection and update form for Work Center
  const handleWorkCenterOk = (selectedRow) => {
    // const selectedRow = workCenterData.find(
    //   (item) => item.workCenter === selectedWorkCenterRowKeys[0]
    // );
    if (selectedRow) {
      form.setFieldsValue({
        workCenter: selectedRow.workCenter,
      });
    }
    setFormValues(form.getFieldsValue());
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue(),
    }));
    setWorkCenterVisible(false);
  };





  const resourceColumns = [
    {
      title: t("resource"),
      dataIndex: "resource",
      key: "resource",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    },
  ];

  const workCenterColumns = [
    {
      title: t("workCenter"),
      dataIndex: "workCenter",
      key: "workCenter",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    },
  ];

  const reasonCodeColumns = [
    {
      title: t('reasonCode'), // i18n for 'Reason Code'
      dataIndex: 'reasonCode',
      key: 'reasonCode',
    },
    {
      title: t('description'), // i18n for 'Description'
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('category'), // i18n for 'Category'
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: t('status'), // i18n for 'Status'
      dataIndex: 'status',
      key: 'status',
    },
  ];
  

  const msgTypeColumns = [
    {
      title: t("messageType"),  // "Message Type" translated
      dataIndex: "messageType",
      key: "messageType",
    },
    {
      title: t("revision"),  // "Version" translated
      dataIndex: "revision",
      key: "revision",
    },
    {
      title: t("description"),  // "Description" translated
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("status"),  // "Status" translated
      dataIndex: "status",
      key: "status",
    },
  ];



  const filteredBOMData = [];

  const handleInputChange = (fieldName: string, value: string) => {
    let convertedValue = value;

    // Convert value only if fieldName is 'reasonCode'
    if (fieldName != 'description' && fieldName != 'resource' && fieldName != 'workCenter') {
      convertedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    }
    setShowAlert(true);
    // console.log(`Updating ${fieldName} with value:`, convertedValue);

    // setTimeout(() => {
    form.setFieldsValue({ [fieldName]: convertedValue });
    // }, 10);

    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }))



  };

  const handleTypeChange = (value: string) => {
    // Set the type based on the selected value
    setType(value);
    if (value == "Resource") {
      setWorkCenterRequired(false);
      setResourceRequired(true);
    }
    else {
      setWorkCenterRequired(true);
      setResourceRequired(false);
    }
    // Optionally, you can set this value in the form as well
    form.setFieldsValue({ type: value });

    // If you want to update the payload or other state based on the type
    setPayloadData((prevData) => ({
      ...prevData,
      type: value,
    }));
  };


  // console.log("Payload data from form content: ", payloadData);

  console.log("resourceData", payloadData);
  return (
    <>
      <Form
        layout="horizontal"
        style={{ width: "100%", marginTop: "3%" }}
        form={form}
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }} // Adjusted to match the form width
      >
        <Form.Item
          label={t("reasonCode")}
          name="reasonCode"
          initialValue=""
          rules={[{ required: true, message: "Reason Code is required" }]}
        >
          <Input
            placeholder=""
            style={{ width: "40%" }}
            suffix={
              <GrChapterAdd
                onClick={() =>
                  handleReasonCodeClick()
                }
              />
            }
            onChange={(e) => handleInputChange("reasonCode", e.target.value)}
          />
        </Form.Item>

        <Form.Item label={t("description")} name="description" initialValue="">
          <Input
            placeholder=""
            style={{ width: "40%" }}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label={t("category")}
          name="category"
          rules={[{ required: true, message: "Category is required" }]}
          initialValue="Corrective Action"
        >
          <Select
            style={{ width: "40%" }}
            onChange={(value) => handleInputChange("category", value)}
          >
            <Option value="Corrective Action">Corrective Action</Option>
            <Option value="Hold">Hold</Option>
            <Option value="ECO Change Request">ECO Change Request</Option>
            <Option value="Floor Stock">Floor Stock</Option>
            <Option value="Equipment Status">Equipment Status</Option>
          </Select>
        </Form.Item>

        <Form.Item label={t("type")} name="type" initialValue="Resource">
          <Select
            style={{ width: "40%" }}
            onChange={handleTypeChange}  // Call the new function here
          >
            <Option value="Resource">Resource</Option>
            <Option value="Work Center">Work Center</Option>
          </Select>
        </Form.Item>

        {/* Resource Field */}
        {(payloadData?.type === "Resource" || !payloadData?.type) && (
          <Form.Item 
            label={t("resource")} 
            name="resource" 
            required={resourceRequired}
            rules={[{ required: resourceRequired, message: "Resource is required" }]}
          >
            <Select
              mode="multiple"
              style={{ width: "40%" }}
              value={Array.isArray(payloadData?.resource) ? payloadData?.resource : payloadData?.resource}
              options={resourceData.map((item) => ({
                label: item.resource,
                value: item.resource,
              }))}
              onChange={(value) => handleInputChange("resource", value)}
            />
          </Form.Item>
        )}

        {payloadData?.type == "Work Center" && (
          <Form.Item label={t("workCenter")} name="workCenter" required={workCenterRequired}>
            {/* <Input
              placeholder=""
              style={{ width: "40%" }}
              suffix={
                
                <GrChapterAdd
                  onClick={() =>
                    handleWorkCenterClick()
                  }
                />
              }
              onChange={(e) => handleInputChange("workCenter", e.target.value)}
            /> */}
            <Select
              mode="multiple"
              placeholder=""
              style={{ width: "40%" }}
              value={payloadData?.workCenter}
              options={workCenterData.map((item) => ({
                label: item.workCenter,
                value: item.workCenter,
              }))}
              onChange={(value) => handleInputChange("workCenter", value)}
            />
          </Form.Item>
        )}




        <Form.Item
          label={t("status")}
          name="status"
          rules={[{ required: true, message: "Status is required" }]}
          initialValue="Enabled"
        >
          <Select
            style={{ width: "40%" }}
            onChange={(value) => handleInputChange("status", value)}
          >
            <Option value="Enabled">Enabled</Option>
            <Option value="Disabled">Disabled</Option>
          </Select>
        </Form.Item>

        <Form.Item label={t("messageType")} name="messageType" initialValue="">
          <Input
            placeholder=""
            style={{ width: "40%" }}
            suffix={
             
              <GrChapterAdd
                onClick={() =>
                  handleBOMClick()
                }
              />
            }
            onChange={(e) => handleInputChange("messageType", e.target.value)}
          />
        </Form.Item>
      </Form>

      <Modal
        title={t("selectReasonCode")}
        open={reasonCodeVisible}
        onOk={handleReasonCodeOk}
        onCancel={handleCancel}
        width={1000}
        footer={null}
      >
        <Table
          onRow={(record) => ({
            onDoubleClick: () => handleReasonCodeOk(record.reasonCode),
          })}
          style={{overflowX:'auto'}}
          columns={reasonCodeColumns}
          dataSource={reasonCodeData}
          rowKey="id" // Use the generated id as the row key
          pagination={{ pageSize: 6 }} // Set page size to 8
        />
      </Modal>

      <Modal
        title={t("selectMessageType")}
        open={bomVisible}
        onOk={handleBOMOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedBOMRowKeys,
            onChange: onBOMTableRowSelection,
          }}
          columns={msgTypeColumns}
          dataSource={filteredBOMData}
          rowKey="bom" // Use the bom as the row key
          pagination={{ pageSize: 6 }} // Set page size to 8
        />
      </Modal>


      {/* Resource Modal */}
      <Modal
        title={t("selectResource")}
        open={resourceVisible}
        onOk={handleResourceOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          
          onRow={(record) => ({
            onDoubleClick: () => handleResourceOk(record),
          })}
          columns={resourceColumns}
          dataSource={resourceData}
          rowKey="resource"
          pagination={{ pageSize: 6 }}
        />
      </Modal>

    
      <Modal
        title={t("selectWorkCenter")}
        open={workCenterVisible}
        onOk={handleWorkCenterOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
        
          onRow={(record) => ({
            onDoubleClick: () => handleWorkCenterOk(record),
          })}
          columns={workCenterColumns}
          dataSource={workCenterData}
          rowKey="workCenter"
          pagination={{ pageSize: 6 }}
        />
      </Modal>

    </>
  );
};

export default ReasonCodeMaintenanceForm;