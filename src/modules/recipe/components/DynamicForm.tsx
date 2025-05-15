import React, { useContext, useEffect, useState } from "react";
import { Form, Input, Switch, Select, TimePicker } from "antd";
import { useTranslation } from "react-i18next";
import { DynamicBrowse } from "@components/BrowseComponent";
import moment from "moment";
import { OperationContext } from "../hooks/recipeContext";
import { OperationData, statusOptions } from "../types/recipeTypes";

interface FormValues {
  [key: string]: any;
  workCenter?: string;
  resourceType?: string;
  operationType?: string;
  status?: string;
  defaultResource?: string;
  description?: string; // Added description field
}

interface DynamicFormProps {
  data: FormValues;
  fields: string[];
  onValuesChange: (changedValues: FormValues) => void;
}

const uiWc: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: "Select Work Center",
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: "workcenter",
  tabledataApi: "workcenter-service",
};

const uiResoureType: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: "Select Resource",
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: "resource",
  tabledataApi: "resourcetype-service",
};

const uiDefaultResoureType: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: "Select Resource",
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: "resource",
  tabledataApi: "resource-service",
};

const { Option } = Select;

const batchUomOptions = [
  { value: "KG", label: "kg" },
  { value: "G", label: "g" },
  { value: "MM", label: "mm" },
  { value: "M", label: "m" },
  { value: "CM", label: "cm" },
  { value: "L", label: "l" },
  { value: "EA", label: "ea" },
];

const DynamicForm: React.FC<DynamicFormProps> = ({
  data,
  fields,
  onValuesChange,
}) => {
  const { isEditing, erpShift } = useContext(OperationContext);
  const { t } = useTranslation();
  const [form] = Form.useForm<OperationData>();
  const [workCenter, setWorkCenter] = useState<string | undefined>(
    data?.workCenter
  );
  const [resourceType, setResourceType] = useState<string | undefined>(
    data?.resourceType
  );
  const [defaultResource, setDefaultResource] = useState<string | undefined>(
    data?.defaultResource
  );

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      workCenter: workCenter,
      resourceType: resourceType,
      defaultResource: defaultResource,
    });
    setDefaultResource(data?.defaultResource);
    setWorkCenter(data?.workCenter);
    setResourceType(data?.resourceType);
  }, [data, form, workCenter, resourceType, defaultResource]);

  const handleWorkCenterChange = (newValues: any[]) => {
    if (newValues.length === 0) {
      setWorkCenter("");
      onValuesChange({ workCenter: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].workCenter;
      setWorkCenter(newValue);
      onValuesChange({ workCenter: newValue.toUpperCase() });
    }
  };

  const handleResourceChange = (newValues: any[]) => {
    console.log(newValues, "array");

    if (newValues.length === 0) {
      setResourceType("");
      onValuesChange({ resourceType: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].resourceType;
      setResourceType(newValue);
      onValuesChange({ resourceType: newValue.toUpperCase() });
    }
  };

  const handleDefaultResourceChange = (newValues: any[]) => {
    if (newValues.length === 0) {
      setDefaultResource("");
      onValuesChange({ defaultResource: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].resource;
      setDefaultResource(newValue);
      onValuesChange({ defaultResource: newValue.toUpperCase() });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const rawValue = e.target.value;
    let sanitizedValue;
    if (key === "recipeDescription") {
      sanitizedValue = rawValue;
    } else if (key === "recipeId") {
      sanitizedValue = rawValue
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "") // Allow hyphens
        .replace(/[ ]{2,}/g, " ");
    } else {
      sanitizedValue = rawValue
        .replace(/[^a-zA-Z0-9_-]/g, "") // Allow hyphens
        .toUpperCase();
    }

    form.setFieldsValue({ [key]: sanitizedValue });
    onValuesChange({ [key]: sanitizedValue });
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={(values) => console.log("Form Values:", values)}
      onValuesChange={(changedValues) =>
        onValuesChange(changedValues as FormValues)
      }
      style={{ width: "60%" }}
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 14 }}
    >
      {fields.map((key) => {
        const value = data?.[key];
        if (value === undefined) {
          return null;
        }

        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        //   if (key === 'totalExpectedCycleTime' || key === 'totalActualCycleTime') {
        //   return (
        //     <Form.Item
        //     key={key}
        //     name={key}
        //     label={t(`${key}`)}

        //   >
        //     <TimePicker format="HH:mm" style={{ width: "100%" }}/>
        //   </Form.Item>
        //   );
        // }
        if (key === "status") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Select defaultValue={value}>
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === "workCenter") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true }]} // Add validation rule
            >
              <DynamicBrowse
                uiConfig={uiWc}
                initial={workCenter}
                onSelectionChange={handleWorkCenterChange}
              />
            </Form.Item>
          );
        }
        if (key === "recipeId") {
          return (
            <Form.Item key={key} name={key} label={`${t(`${key}`)}`} required>
              <Input
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }
        if (key === "recipeName") {
          return (
            <Form.Item key={key} name={key} label={`${t(`${key}`)}`} required>
              <Input
                defaultValue={value}
                disabled={isEditing && erpShift}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === "resourceType") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={`${t(`${key}`)}`} // Add an asterisk to indicate required
              rules={[{ required: true }]} // Add validation rule
            >
              <DynamicBrowse
                uiConfig={uiResoureType}
                initial={resourceType}
                onSelectionChange={handleResourceChange}
              />
            </Form.Item>
          );
        }

        if (key === "defaultResource") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={`${t(`${key}`)}`} // Add an asterisk to indicate required
              rules={[{ required: true }]} // Add validation rule
            >
              <DynamicBrowse
                uiConfig={uiDefaultResoureType}
                initial={defaultResource}
                onSelectionChange={handleDefaultResourceChange}
              />
            </Form.Item>
          );
        }

        if (typeof value === "boolean") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              valuePropName="checked"
            >
              <Switch checked={value} />
            </Form.Item>
          );
        }
        if (key === "maxLoopCount") {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Input
                type="number"
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }
        if (key === "operation") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[
                { required: true, message: `${t(`${key}`)} is required` },
              ]}
            >
              <Input
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        {
          /* <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[{ required: field.required, message: `${t(field.label)} is required` }]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}


          >
            <Input
              placeholder={field.placeholder}
              disabled={field.disabled}
              suffix={field.icon ? (
                <Tooltip title="Search">
                  <GrChapterAdd onClick={() => openModal(field.name)} />
                </Tooltip>
              ) : null}
              value={form.getFieldValue(field.name)}
              onChange={(e) => {
                const value = e.target.value;
                form.setFieldsValue({ [field.name]: value });
                // Call your live change handler here
                handleLiveChange(field.name, value);
              }}
            />
          </Form.Item> */
        }

        if (key === "version") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[
                { required: true, message: `${t(`${key}`)} is required` },
              ]}
            >
              <Input
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === "batchUom") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `${t(`${key}`)} is required` }]}
            >
              <Select defaultValue={value || batchUomOptions[0].value}>
                {batchUomOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === "batchSize") {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[
                { required: true, message: `${t(`${key}`)} is required` },
              ]}
            >
              <Input
                type="text"
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        return (
          <Form.Item key={key} name={key} label={t(`${key}`)}>
            <Input
              defaultValue={value}
              onChange={(e) => handleInputChange(e, key)}
            />
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default DynamicForm;
