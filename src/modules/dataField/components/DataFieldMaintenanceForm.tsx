import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Select, Button, Switch, Modal, Table, Checkbox, Tooltip } from "antd";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import {  retrieveAllActivity, retrieveTop50Activity } from "@services/dataFieldService";
import { useTranslation } from "react-i18next";
import { DataFieldContext } from "../hooks/DataFieldContext";


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

interface FormField {
  checked: boolean;
  type:
  | "input"
  | "number"
  | "select"
  | "switch"
  | "checkbox"
  | "browse"
  | "selectBrowse";
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  uppercase?: boolean;
  noSpaces?: boolean;
  noSpecialChars?: boolean;
  width?: string;
  icon?: boolean;
  correspondingVersion?: string;
  tableColumns?: any[]; // Added to handle columns in browse fields
  tableData?: any[]; // Added to handle data in browse fields
  disabled?: boolean;
}

interface DataFieldMaintenanceFormProps {
  onChange: (values: Record<string, any>) => void;
  setNewData: (values: Record<string, any>) => void;
  rowData: object;
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
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  layout?: "horizontal" | "vertical" | "inline";
}


const DataFieldMaintenanceForm: React.FC<DataFieldMaintenanceFormProps> = ({
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
  labelCol = { span: 8 },
  wrapperCol = { span: 12 },
  layout = "horizontal",
}) => {

  const { t } = useTranslation();
  let activityGroupList = [];
  const { payloadData, setPayloadData, showAlert, setShowAlert, schemaData, setIsList, setShowColumns} = useContext(DataFieldContext);
  const [form] = Form.useForm();
  const [schema, setSchema] = useState(schemaData);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);

  useEffect(() => {
    if (resetValue == false || rowData != null) {
      form.setFieldsValue(rowData);

      // console.log("Form Values: ", form.getFieldsValue());
      setFormValues(form.getFieldsValue());
      setFormValues(payloadData);

    } else if (resetValue == true || rowData == null) form.resetFields();
  }, [rowData, form, resetValue, resetValueCall]);

  useEffect(() => {

    if (itemRowData) {
      // console.log("itemRowData", itemRowData);
    }
  }, [rowData, form, itemRowData]);

  useEffect(() => {
    form.setFieldsValue(payloadData);
  }, [payloadData]);

  const openModal = async (fieldName: string, typedValue: string) => {
    debugger;
    if (fieldName == "preSaveActivity") {
      try {
        let oActivityList;
        const oTableColumns = [
          { title: t("activity"), dataIndex: 'activityId', key: 'activityId' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
        ];
        const cookies = parseCookies();
        const site = cookies.site;
        oActivityList = await retrieveTop50Activity(site);
        if (typedValue) {
          oActivityList = await retrieveAllActivity(site, typedValue);
        }
        setCurrentField(fieldName);
        if (oActivityList) {
          const formattedActivityList = oActivityList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            preSaveActivity: item.activityId,
          }));

          setTableColumns(oTableColumns);
          setTableData(formattedActivityList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }
        setVisible(true);
      }
      catch (error) {
        console.error("Error fetching all activity list:", error);
      }
    }
  };

  const handleInputChange = (value: string, field: FormField) => {
    debugger;
    setShowAlert(true);

    let newValue = value;
    if (field.uppercase) {
      newValue = newValue.toUpperCase();
    }
    if (field.noSpaces) {
      newValue = newValue.replace(/\s+/g, "");
    }
    if (field.noSpecialChars) {
      newValue = newValue.replace(/[^a-zA-Z0-9_]/g, "");
    }
    // Update the form field with the transformed value
    form.setFieldsValue({ [field.name]: newValue });
    // Get the updated form values
    const updatedFormValues = form.getFieldsValue();
    // Extract the relevant fields for routingStepList
    // Handle update for both routingStepList and other fields
    setPayloadData((prevPayloadData) => ({
      ...prevPayloadData,
      [field.name]: newValue, // Update other fields
    }));
    return newValue;
  };

  const handleClick = () => {
  };

  const handleSwitchChange = (checked: boolean, fieldName: string) => {
    // Update the form field value
    form.setFieldsValue({ [fieldName]: checked });
    // Handle update for both routingStepList and other fields
    setPayloadData((prevPayloadData) => {
      // Only update routingStepList if there are relevant fields
      return {
        ...prevPayloadData,
        [fieldName]: checked, // Update other fields
      };
    });
    setShowAlert(true);
  };

 

  const handleSelectChange = (value: any, fieldName: string) => {
    form.setFieldsValue({ [fieldName]: value });
  
    let newSchema = schema.map(field => {
      if (field.name === "maskGroup") {
        return { ...field, disabled: value !== "Text" && value !== "Number" && value !== "List" };
      } 
      else if (field.name === "browseIcon") {
        const newChecked = value === "List";
        if(value == "List"){
          setIsList(true)
        }
        else{
          setIsList(false);
        }
        // Update form value for browseIcon
        form.setFieldsValue({ [field.name]: newChecked });
        return { ...field, checked: newChecked };
      }
      else if (field.name === "mfrRef") {
        setShowColumns(false);
      }
      return field;
    });
  
    setSchema(newSchema);
  
    // Get all current form values
    const currentFormValues = form.getFieldsValue();
  
    setPayloadData((prevPayloadData) => ({
      ...prevPayloadData,
      ...currentFormValues, // Include all form values
      [fieldName]: value,
      browseIcon: newSchema.find(f => f.name === "browseIcon")?.checked || false,
    }));
  
    setShowAlert(true);
  };

  const handleSelectBrowseChange = (value: any, fieldName: string) => {
    // Update form values
    const activityGroupList = [];
    const selectedGroups = activityGroupList.filter((group) =>
      value.includes(group.activityGroupName)
    );
    setPayloadData((prevPayloadData) => ({
      ...prevPayloadData,
      activityGroupList: selectedGroups, // Update other fields
    }));
    // Ensure the form instance is correct
    console.log("Form instance:", form);
    console.log("Setting field:", fieldName, "with value:", value);
    form.setFieldsValue({
      [fieldName]: value,
    });
    // Optionally, you can perform additional actions based on the new value
    console.log(`Selected values for ${fieldName}:`, value);
    setShowAlert(true);
  };

  const renderField = (field: FormField) => {
    const fieldStyle = { width: field.width || "100%" };
    switch (field.type) {
      case "input":
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[
              {
                required: field.required,
                message: `${field.label} is required`,
              },
            ]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Input
              placeholder={field.placeholder}
              onChange={(e) =>
                form.setFieldsValue({
                  [field.name]: handleInputChange(e.target.value, field),
                })
              }
            />
          </Form.Item>
        );
      case "number":
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[
              {
                required: field.required,
                message: `${field.label} is required`,
              },
            ]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Input
              type="number"
              placeholder={field.placeholder}
              onChange={(e) =>
                form.setFieldsValue({
                  [field.name]: handleInputChange(e.target.value, field),
                })
              }
            />
          </Form.Item>
        );
      case "select":
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[
              {
                required: field.required,
                message: `${field.label} is required`,
              },
            ]}
            initialValue={field.defaultValue}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Select
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              onChange={(value) => handleSelectChange(value, field.name)}
            >
              {field.options?.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      case "selectBrowse":
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[
              {
                required: field.required,
                message: `${field.label} is required`,
              },
            ]}
            initialValue={field.defaultValue}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Select
              placeholder={field.placeholder}
              mode="multiple"
              onClick={handleClick}
              defaultValue={field.defaultValue}
              onChange={(value) => handleSelectBrowseChange(value, field.name)}
            >
              {activityGroupList.map((group) => (
                <Select.Option
                  key={group.activityGroupName}
                  value={group.activityGroupName}
                >
                  {group.activityGroupName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      case "switch":
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            valuePropName="checked"
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Switch
              checked={field.checked} // Ensure this is bound to your state or form
              onChange={(checked) => handleSwitchChange(checked, field.name)} // Add onChange event handler
            />
          </Form.Item>
        );
      case "checkbox":
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={t(field.label)}
            valuePropName="checked"
            rules={[
              {
                required: field.required,
                message: `${field.label} is required`,
              },
            ]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Checkbox />
          </Form.Item>
        );
      case "browse":
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[
              {
                required: field.required,
                message: `${t(field.label)} is required`,
              },
            ]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Input
              placeholder={field.placeholder}
              disabled={field.disabled}
              suffix={
                field.icon ? (
                  <Tooltip title="Search">
                    <GrChapterAdd
                      onClick={() =>
                        openModal(field.name, form.getFieldValue(field.name))
                      }
                    />
                  </Tooltip>
                ) : null
              }
              value={form.getFieldValue(field.name)}
              onChange={(e) => {
                const value = e.target.value;
                form.setFieldsValue({ [field.name]: value });
                // Call your live change handler here
                handleLiveChange(field.name, value);
              }}
            />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  const onFormChange = (value: any, version?: any) => {
    // if (currentField) {
    //   form.setFieldsValue({
    //     [currentField]: value,
    //     ...(version
    //       ? {
    //         [schema.find((field) => field.name === currentField)
    //           ?.correspondingVersion as string]: version,
    //       }
    //       : {}),
    //   });
    //   console.log("Form change value: ", form.getFieldsValue());
    //   //setPayloadData(form.getFieldsValue());
    // }
  };

  const handleLiveChange = (fieldName: string, value: any) => {
    // Convert the value to uppercase, remove spaces, and allow only underscores
    const sanitizedValue = value
      .toUpperCase() // Convert to uppercase
      .replace(/\s+/g, "") // Remove all spaces
      .replace(/[^A-Z0-9_]/g, ""); // Remove all special characters except underscores
    // Update the form field with the sanitized value
    form.setFieldsValue({ [fieldName]: sanitizedValue });
    // Handle update for both routingStepList and other fields
    setPayloadData((prevPayloadData) => {
      return {
        ...prevPayloadData,
        [fieldName]: sanitizedValue,
      };
    });
    // Notify about the form change (if needed)
    onFormChange(sanitizedValue, undefined);
    setShowAlert(true);
  };




  console.log("Payload data from form content: ", payloadData);
  const handleSubmit = (values: any) => {

  };

  const handleRowSelection = (record: any) => {
    setSelectedRow(record);
    handleModalOk(record);
  };

  const handleModalOk = (selectedRow) => {
    if (selectedRow) {
      // debugger
      const fieldSchema = schema.find((field) => field.name === currentField);
      if (fieldSchema) {
        const updatedFields = {
          [currentField]: selectedRow[fieldSchema.name],
          ...(fieldSchema.correspondingVersion
            ? {
              [fieldSchema.correspondingVersion]:
                selectedRow[fieldSchema.correspondingVersion],
            }
            : {}),
        };
        // Update form fields with selected data
        form.setFieldsValue(updatedFields);
        // Update the payload data
        setPayloadData((prevPayloadData) => ({
          ...prevPayloadData,
          ...updatedFields,
        }));
        // Reset modal states
        setSelectedRow(null);
        setVisible(false);
        setCurrentField(null);
      }
    }
    setShowAlert(true);
  };

  const handleModalCancel = () => {
    setVisible(false);
  };

  return (
    <>

      <Form
        form={form}
        layout={layout}
        onFinish={handleSubmit}
        style={{
          width: "100%",
          // maxHeight: "100vh", // Limit the form height
          // overflowY: "auto",
          marginTop: "3%"
        }}
      >
        {schema?.map((field) => renderField(field))}
      </Form>

      <Modal
        title={
          <>
            { t("selectActivity")}
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
          onRow={(record) => ({
            onDoubleClick: () => handleRowSelection(record),
          })}
          // pagination={{
          //   pageSize: 6,
          // }}
          pagination={false}
          scroll={{ y: 300 }}
        />
      </Modal>

     
    </>
  );
};

export default DataFieldMaintenanceForm;