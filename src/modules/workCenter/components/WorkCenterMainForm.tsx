import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Switch,
  Modal,
  Table,
  Checkbox,
  Tooltip,
} from "antd";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import {
  fetchAllActivityGroup,
  
  retrieveAllRouting,
  
  retrieveParentWorkCenter,
  retrieveTop50Routing,
} from "@services/workCenterService";
import { useTranslation } from "react-i18next";
import { WorkCenterContext } from "../hooks/workCenterContext";
const { Option } = Select;
const { TextArea } = Input;
interface ReasonCodeData {
  id: number;
  reasonCode: string;
  category: string;
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
interface FormProps {
  onChange: (values: Record<string, any>) => void;
  layout?: "horizontal" | "vertical" | "inline";
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  rowSelectedData: [];
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
const WorkCenterMaintenanceForm: React.FC<FormProps> = ({
  onChange,
  layout = "horizontal",
  labelCol = { span: 8 },
  wrapperCol = { span: 12 },
  rowSelectedData,
}) => {
  const { payloadData, setPayloadData, schemaData, addClickCount, mainSchema, showAlert, setShowAlert } =
    useContext<any>(WorkCenterContext);
  const [form] = Form.useForm();
  const [formSchema, setFormSchema] = useState(schemaData);
  const [formattedData, setFormattedData] = useState<{ [key: string]: any }[]>(
    []
  );
  const [visible, setVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activityGroupValue, setActivityGroupValue] = useState();
  const [schema, setSchema] = useState(schemaData);
  const [activityGroupList, setActivityGroupList] = useState([]);
  const [isRoutingClicked, setIsRoutingClicked] = useState(false);
  // console.log("Schema: ", schema)
  // console.log("Payload data from routing form: ", payloadData);

  useEffect(() => {
    if (rowSelectedData) {
      form.setFieldsValue(rowSelectedData);
    }
  }, [rowSelectedData]);


  useEffect(() => {
    if (!payloadData) return;
    form.setFieldsValue(payloadData);
    form.setFieldsValue({
      activityGroup: payloadData.activityGroupList?.map(
        (group) => group.activityGroupName
      ), // Set default values
      // Set other fields similarly
    });
    
  }, [payloadData]);
 
  useEffect(() => {
    const changedSchemaData = schemaData.map((field) => {
      if (field.name === "activityGroup") {
        return {
          ...field,
          defaultValue: [],
        };
      }
      return field;
    });
    setSchema(changedSchemaData);
  }, [addClickCount]);
  const onFormChange = (value: any, version?: any) => {
    if (currentField) {
      form.setFieldsValue({
        [currentField]: value,
        ...(version
          ? {
            [schema.find((field) => field.name === currentField)
              ?.correspondingVersion as string]: version,
          }
          : {}),
      });
      console.log("Form change value: ", form.getFieldsValue());
      //setPayloadData(form.getFieldsValue());
    }
  };
  const handleSelectChange = (value: string, fieldName: string) => {
    // Update the form field value
    form.setFieldsValue({ [fieldName]: value });
    // Handle update for both routingStepList and other fields
    setPayloadData((prevPayloadData) => {
      return {
        ...prevPayloadData,
        [fieldName]: value, // Update other fields
      };
    });
    setShowAlert(true);
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
  const handleSelectBrowseChange = (value: any, fieldName: string) => {
    // Update form values
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
        newValue = newValue.replace(/[^a-zA-Z0-9_-]/g, "");
    }
    
    // Update the form field with the transformed value
    form.setFieldsValue({ [field.name]: newValue });
    
    // Get the updated form values
    const updatedFormValues = form.getFieldsValue();
    
    // Handle update for both routingStepList and other fields
    setPayloadData((prevPayloadData) => ({
        ...prevPayloadData,
        [field.name]: newValue, // Update other fields
    }));
    
    return newValue;
  };
  
  const handleModalOk = (selectedRow) => {
    if (selectedRow) {
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
  const handleLiveChange = (fieldName: string, value: any) => {
    // Convert the value to uppercase, remove spaces, and allow underscores and hyphens
    const sanitizedValue = value
        .toUpperCase() // Convert to uppercase
        .replace(/\s+/g, "") // Remove all spaces
        .replace(/[^A-Z0-9_-]/g, ""); // Remove all special characters except underscores and hyphens

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
  const openModal = async (fieldName: string, typedValue: string) => {
    debugger;
    if (fieldName == "routing") {
      try {
        let oRoutingList;
        setIsRoutingClicked(true);
        const cookies = parseCookies();
        const site = cookies.site;
        oRoutingList = await retrieveTop50Routing(site);
        if (typedValue) {
          oRoutingList = await retrieveAllRouting(site, typedValue);
        }
        if (oRoutingList) {
          const formattedRoutingList = oRoutingList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            routingVersion: item.version,
          }));
          setCurrentField(fieldName);
          const fieldSchema = schema.find((field) => field.name === fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData(formattedRoutingList);
          }
        }
        else{
          const fieldSchema = schema.find((field) => field.name === fieldName);
          if (fieldSchema?.tableColumns ) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData([]);
          }
        }
        setVisible(true);
      } catch (error) {
        console.error("Error fetching all Routing list:", error);
      }
    } else if (fieldName == "defaultParentWorkCenter") {
      try {
        setIsRoutingClicked(false);
        const cookies = parseCookies();
        const site = cookies.site;
        const oWCList = await retrieveParentWorkCenter(
          site,
          payloadData.workCenter || ""
        );
        if (oWCList) {
          const formattedWCList = oWCList?.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            defaultParentWorkCenter: item.workCenter,
          }));
          setCurrentField(fieldName);
          const fieldSchema = schema.find((field) => field.name === fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData(formattedWCList);
          }
        }
        else{
          const fieldSchema = schema.find((field) => field.name === fieldName);
          if (fieldSchema?.tableColumns ) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData([]);
          }
        }
        setVisible(true);

      } catch (error) {
        console.error("Error fetching all parent work Center list:", error);
      }
    }

  };
  const handleModalCancel = () => {
    setVisible(false);
  };
  const handleRowSelection = (record: any) => {
    setSelectedRow(record);
    handleModalOk(record);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const filteredData = tableData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );
  const handleClick = () => {
    const fetchActivityGroupData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const response = await fetchAllActivityGroup(site);
        if (!response.errorCode) {
          // Map over the response data to add an index as a key
          const dataWithKeys = response.map((item: any, index: number) => ({
            key: index, // Add an index as key
            ...item, // Spread the original item data
          }));
          setActivityGroupList(dataWithKeys);
          console.log("activity group list: ", activityGroupList);
        }
      } catch (error) {
        console.error("Error fetching all activity group data:", error);
      }
    };
    fetchActivityGroupData();
  };
  const { t } = useTranslation();
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
  const handleSubmit = (values: any) => {
    console.log("Form Values:", {
      ...values,
      ...schema.reduce((acc, field) => {
        if (field.type === "switch" && values[field.name] === undefined) {
          acc[field.name] = false;
        }
        if (field.type === "checkbox" && values[field.name] === undefined) {
          acc[field.name] = false;
        }
        return acc;
      }, {}),
    });
  };
  // console.log("Schemea data from form: ", schema);
  return (
    <>
      <Form
        form={form}
        layout={layout}
        onFinish={handleSubmit}
        style={{
          // width: "100%",
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
            { isRoutingClicked ? t("selectRouting") : t("selectWorkCenter") }

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
        // onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      >
        <Table
          columns={tableColumns}
          dataSource={filteredData}
          onRow={(record) => ({
            onDoubleClick: () => handleRowSelection(record),
          })}
          pagination={{
            pageSize: 6,
          }}
        />
      </Modal>
    </>
  );
};
export default WorkCenterMaintenanceForm;
