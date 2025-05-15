import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Select, Switch, Checkbox, Button, Modal, Table, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { GrChapterAdd } from "react-icons/gr";
import { RoutingContext } from '../hooks/routingContext';
import { useTranslation } from 'react-i18next';
import { retrieveAllBOM,  retrieveAllDocumentList,  retrieveTop50BOM, retrieveTop50DocumentList } from '@services/routingServices';
import { parseCookies } from 'nookies';
// import DataFormat from '@/utils/dataFormat'; 


interface FormField {
  checked: boolean;
  type: 'input' | 'number' | 'select' | 'switch' | 'checkbox' | 'browse';
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

interface UpdatedRoutingStep {
  stepId?: string;
  stepType?: string;
  operation?: string;
  operationVersion?: string;
  routing?: string;
  routingVersion?: string;
  stepDescription?: string;
  maximumLoopCount?: string;
  queueDecision?: string;
  erpControlKey?: string;
  erpOperation?: string;
  workCenter?: string;
  erpWorkCenter?: string;
  requiredTimeInProcess?: string;
  specialInstruction?: string;
  erpSequence?: string;
  blockPcusUntilInspectionFinished?: boolean;
  entryStep?: boolean;
  lastReportingStep?: boolean;
  reworkStep?: boolean;
  previousStepId?: string;
  nextStepId?: string;
  key?: string; // To store stepId as key
}


interface DynamicFormProps {
  schema: FormField[];
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  
}

const DynamicForm: React.FC<DynamicFormProps> = ({

  layout = 'horizontal',
  labelCol = { span: 12 },
  wrapperCol = { span: 24 },
}) => {

  const { payloadData, setPayloadData, schema, setShowAlert, rowSelectedData, setRowSelectedData } = useContext<any>(RoutingContext);

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [formSchema, setFormSchema] = useState(schema);
  const [formattedData, setFormattedData] = useState<{ [key: string]: any }[]>([]);




  // console.log("Payload data from routing form: ", payloadData);
  useEffect(() => {
    form.setFieldsValue(payloadData)
  }, [payloadData]);

  useEffect(() => {
    form.setFieldsValue(rowSelectedData)
  }, [rowSelectedData]);

  useEffect(() => {
    schema.map(field => renderField(field))
  }, [schema]);



  const onFormChange = (value: any, version?: any) => {
    if (currentField) {
      form.setFieldsValue({
        [currentField]: value,
        ...(version ? { [schema.find(field => field.name === currentField)?.correspondingVersion as string]: version } : {}),
      });
      console.log("Form change value: ", form.getFieldsValue())
      //setPayloadData(form.getFieldsValue());
    }
  };



  const handleSelectChange = (value: string, fieldName: string) => {
    // Update the form field value
    form.setFieldsValue({ [fieldName]: value });

    // Get the updated form values
    const updatedFormValues = form.getFieldsValue();

    // Extract relevant fields for routingStepList
    const relevantFields = [
      'stepId', 'stepType', 'operation', 'operationVersion', 'routing',
      'routingVersion', 'stepDescription', 'maximumLoopCount', 'queueDecision',
      'erpControlKey', 'erpOperation', 'workCenter', 'erpWorkCenter',
      'requiredTimeInProcess', 'specialInstruction', 'erpSequence',
      'blockPcusUntilInspectionFinished', 'entryStep', 'lastReportingStep',
      'reworkStep', 'previousStepId', 'nextStepId'
    ];

    // Prepare updatedRoutingStep only if relevant fields are present
    // const updatedRoutingStep = relevantFields.reduce((acc, key) => {
    const updatedRoutingStep: UpdatedRoutingStep = relevantFields.reduce<UpdatedRoutingStep>((acc, key) => {

      if (key in updatedFormValues) {
        acc[key] = updatedFormValues[key];
      }
      return acc;
    }, {});

    if (updatedRoutingStep.stepId) {
      updatedRoutingStep.key = updatedRoutingStep.stepId;
    }

    // Handle update for both routingStepList and other fields
    setPayloadData(prevPayloadData => {
      const updatedRoutingStepList = updatedRoutingStep.stepId
        ? [
          ...prevPayloadData.routingStepList.filter(step => step.stepId !== updatedRoutingStep.stepId),
          updatedRoutingStep
        ]
        : prevPayloadData.routingStepList;

      return {
        ...prevPayloadData,
        routingStepList: updatedRoutingStepList,
        [fieldName]: value, // Update other fields
      };
    });
    setFormSchema(prevSchema => {
      const newSchema = [...prevSchema];

      // Disable specific fields based on the stepType value
      if (updatedFormValues.stepType === 'Operation') {
        newSchema[4] = { ...newSchema[4], disabled: true };
        newSchema[5] = { ...newSchema[5], disabled: true };
        newSchema[4] = { ...newSchema[4], required: false };
        newSchema[5] = { ...newSchema[5], required: false };
        newSchema[2] = { ...newSchema[2], disabled: false };
        newSchema[3] = { ...newSchema[3], disabled: false };
        newSchema[2] = { ...newSchema[2], required: true };
        newSchema[3] = { ...newSchema[3], required: true };
      } else if (updatedFormValues.stepType === 'Routing') {
        newSchema[2] = { ...newSchema[2], disabled: true };
        newSchema[3] = { ...newSchema[3], disabled: true };
        newSchema[2] = { ...newSchema[2], required: false };
        newSchema[3] = { ...newSchema[3], required: false };
        newSchema[4] = { ...newSchema[4], disabled: false };
        newSchema[5] = { ...newSchema[5], disabled: false };
        newSchema[4] = { ...newSchema[4], required: true };
        newSchema[5] = { ...newSchema[5], required: true };
      }

      return newSchema;
    });
    console.log("Scheme change: ", schema)
    setShowAlert(true);
  };




  const handleSwitchChange = (checked: boolean, fieldName: string) => {
    // Update the form field value
    form.setFieldsValue({ [fieldName]: checked });

    // Get the updated form values
    const updatedFormValues = form.getFieldsValue();

    // Extract the relevant fields for routingStepList
    const relevantFields = [
      'stepId', 'stepType', 'operation', 'operationVersion', 'routing',
      'routingVersion', 'stepDescription', 'maximumLoopCount', 'queueDecision',
      'erpControlKey', 'erpOperation', 'workCenter', 'erpWorkCenter',
      'requiredTimeInProcess', 'specialInstruction', 'erpSequence',
      'blockPcusUntilInspectionFinished', 'entryStep', 'lastReportingStep',
      'reworkStep', 'previousStepId', 'nextStepId'
    ];

    // Prepare updatedRoutingStep only if relevant fields are present
    // const updatedRoutingStep = relevantFields.reduce((acc, key) => {
    const updatedRoutingStep: UpdatedRoutingStep = relevantFields.reduce<UpdatedRoutingStep>((acc, key) => {

      if (key in updatedFormValues) {
        acc[key] = updatedFormValues[key];
      }
      return acc;
    }, {});

    if (updatedRoutingStep.stepId) {
      updatedRoutingStep.key = updatedRoutingStep.stepId;
    }

    // Handle update for both routingStepList and other fields
    setPayloadData(prevPayloadData => {
      // Only update routingStepList if there are relevant fields
      const updatedRoutingStepList = updatedRoutingStep.stepId
        ? [
          ...prevPayloadData.routingStepList.filter(step => step.stepId !== updatedRoutingStep.stepId),
          updatedRoutingStep
        ]
        : prevPayloadData.routingStepList;

      return {
        ...prevPayloadData,
        routingStepList: updatedRoutingStepList,
        [fieldName]: checked, // Update other fields
      };
    });
    setShowAlert(true);
  };





  const handleInputChange = (value: string, field: FormField) => {
    debugger;
    let newValue = value;

    if (field.uppercase) {
      newValue = newValue.toUpperCase();
    }
    if (field.noSpaces) {
      newValue = newValue.replace(/\s+/g, '');
    }
    if (field.noSpecialChars) {
      newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');
    }

    // Update the form field with the transformed value
    form.setFieldsValue({ [field.name]: newValue });
    setShowAlert(true);
    // Get the updated form values
    const updatedFormValues = form.getFieldsValue();

    // Extract the relevant fields for routingStepList
    const relevantFields = [
      'stepId', 'stepType', 'operation', 'operationVersion', 'routing',
      'routingVersion', 'stepDescription', 'maximumLoopCount', 'queueDecision',
      'erpControlKey', 'erpOperation', 'workCenter', 'erpWorkCenter',
      'requiredTimeInProcess', 'specialInstruction', 'erpSequence',
      'blockPcusUntilInspectionFinished', 'entryStep', 'lastReportingStep',
      'reworkStep', 'previousStepId', 'nextStepId'
    ];

    // Prepare updatedRoutingStep only if relevant fields are present
    // const updatedRoutingStep = relevantFields.reduce((acc, key) => {
    const updatedRoutingStep: UpdatedRoutingStep = relevantFields.reduce<UpdatedRoutingStep>((acc, key) => {

      if (key in updatedFormValues) {
        acc[key] = updatedFormValues[key];
      }
      return acc;
    }, {});

    if (updatedRoutingStep.stepId) {
      updatedRoutingStep.key = updatedRoutingStep.stepId;
    }

    // Handle update for both routingStepList and other fields
    setPayloadData(prevPayloadData => {
      // Only update routingStepList if there are relevant fields
      const updatedRoutingStepList = updatedRoutingStep.stepId
        ? [
          ...prevPayloadData.routingStepList.filter(step => step.stepId !== updatedRoutingStep.stepId),
          updatedRoutingStep
        ]
        : prevPayloadData.routingStepList;

      return {
        ...prevPayloadData,
        routingStepList: updatedRoutingStepList,
        [field.name]: newValue, // Update other fields
      };
    });

    return newValue;
    
  };

  const handleModalOk = (selectedRow) => {
    if (selectedRow) {
      const fieldSchema = schema.find(field => field.name === currentField);

      // Prepare updated fields from selectedRow based on the field schema
      const updatedFields = {
        [currentField]: selectedRow[fieldSchema?.name],
      };

      if (fieldSchema?.correspondingVersion) {
        const versionField = fieldSchema.correspondingVersion;
        updatedFields[versionField] = selectedRow[versionField];
      }

      // Update the form values
      form.setFieldsValue(updatedFields);

      // Get the current form values
      const updatedFormValues = form.getFieldsValue();

      // Extract relevant fields for routingStepList
      const relevantFields = [
        'stepId', 'stepType', 'operation', 'operationVersion', 'routing',
        'routingVersion', 'stepDescription', 'maximumLoopCount', 'queueDecision',
        'erpControlKey', 'erpOperation', 'workCenter', 'erpWorkCenter',
        'requiredTimeInProcess', 'specialInstruction', 'erpSequence',
        'blockPcusUntilInspectionFinished', 'entryStep', 'lastReportingStep',
        'reworkStep', 'previousStepId', 'nextStepId'
      ];

      // Prepare the routingStepList update
      // const updatedRoutingStep = relevantFields.reduce((acc, key) => {
      const updatedRoutingStep: UpdatedRoutingStep = relevantFields.reduce<UpdatedRoutingStep>((acc, key) => {

        if (key in updatedFormValues) {
          acc[key] = updatedFormValues[key];
        }
        return acc;
      }, {});

      if (updatedRoutingStep.stepId) {
        updatedRoutingStep.key = updatedRoutingStep.stepId;
      }

      // Handle update for both routingStepList and other fields
      setPayloadData(prevPayloadData => {
        const existingIndex = prevPayloadData.routingStepList.findIndex(step => step.stepId === updatedRoutingStep.stepId);

        let updatedRoutingStepList;

        if (existingIndex > -1) {
          // Update the existing record
          updatedRoutingStepList = [
            ...prevPayloadData.routingStepList.slice(0, existingIndex),
            updatedRoutingStep,
            ...prevPayloadData.routingStepList.slice(existingIndex + 1)
          ];
        } else {
          // Add a new record only if stepId is present
          updatedRoutingStepList = updatedRoutingStep.stepId
            ? [...prevPayloadData.routingStepList, updatedRoutingStep]
            : prevPayloadData.routingStepList;
        }

        return {
          ...prevPayloadData,
          routingStepList: updatedRoutingStepList,
          ...updatedFields // Update other fields
        };
        setShowAlert(true);
      });

      // Notify about the form change
      onFormChange(updatedFields[currentField], fieldSchema?.correspondingVersion ? updatedFields[fieldSchema.correspondingVersion] : undefined);
    }

    // Close the modal
    setVisible(false);
  };

  


  const handleLiveChange = (fieldName: string, value: any) => {
    // Convert the value to uppercase, remove spaces, and allow only underscores
    const sanitizedValue = value
      .toUpperCase()                  // Convert to uppercase
      .replace(/\s+/g, '')            // Remove all spaces
      .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores

    // Update the form field with the sanitized value
    form.setFieldsValue({ [fieldName]: sanitizedValue });

    // Get the current form values
    const updatedFormValues = form.getFieldsValue();

    // Extract relevant fields for routingStepList
    const relevantFields = [
      'stepId', 'stepType', 'operation', 'operationVersion', 'routing',
      'routingVersion', 'stepDescription', 'maximumLoopCount', 'queueDecision',
      'erpControlKey', 'erpOperation', 'workCenter', 'erpWorkCenter',
      'requiredTimeInProcess', 'specialInstruction', 'erpSequence',
      'blockPcusUntilInspectionFinished', 'entryStep', 'lastReportingStep',
      'reworkStep', 'previousStepId', 'nextStepId'
    ];

    // Prepare the routingStepList update
    const updatedRoutingStep: UpdatedRoutingStep = relevantFields.reduce<UpdatedRoutingStep>((acc, key) => {
      if (key in updatedFormValues) {
        acc[key] = updatedFormValues[key];
      }
      return acc;
    }, {});

    if (updatedRoutingStep.stepId) {
      updatedRoutingStep.key = updatedRoutingStep.stepId;
    }

    // Handle update for both routingStepList and other fields
    setPayloadData(prevPayloadData => {
      const existingIndex = prevPayloadData.routingStepList.findIndex(step => step.stepId === updatedRoutingStep.stepId);

      let updatedRoutingStepList;

      if (existingIndex > -1) {
        // Update the existing record
        updatedRoutingStepList = [
          ...prevPayloadData.routingStepList.slice(0, existingIndex),
          updatedRoutingStep,
          ...prevPayloadData.routingStepList.slice(existingIndex + 1)
        ];
      } else {
        // Add a new record only if stepId is present
        updatedRoutingStepList = updatedRoutingStep.stepId
          ? [...prevPayloadData.routingStepList, updatedRoutingStep]
          : prevPayloadData.routingStepList;
      }

      return {
        ...prevPayloadData,
        routingStepList: updatedRoutingStepList,
        // Only update other fields outside of routingStepList that aren't part of routingStepList
        ...Object.fromEntries(
          Object.entries(updatedFormValues).filter(
            ([key]) => !relevantFields.includes(key)
          )
        )
      };
    });

    // Notify about the form change (if needed)
    onFormChange(sanitizedValue, undefined);
    setShowAlert(true);
  };



  const openModal = async (fieldName: string) => {
    if (fieldName == "bom") {
      try {
        let oBomList;
        const typedValue = form.getFieldsValue().bom;
        const cookies = parseCookies();
        const site = cookies.site;
        if (typedValue)
          oBomList = await retrieveAllBOM(site, typedValue);
        else
          oBomList = await retrieveTop50BOM(site);
        debugger;

        if (oBomList) {
          const formattedBomList = oBomList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            bomVersion: item.revision
          }));

          setCurrentField(fieldName);
          const fieldSchema = schema.find(field => field.name === fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData(formattedBomList);
          }
        }

        else {
          const fieldSchema = schema.find(field => field.name === fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData([]);
          }
        }

      } catch (error) {
        console.error("Error fetching all BOM list:", error);
      }
    }

    else if (fieldName == "document") {
      try {
        let oList;
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldsValue().document;
        if (typedValue)
          oList = await retrieveAllDocumentList(site, typedValue);
        else
          oList = await retrieveTop50DocumentList(site);
        debugger;
        if (oList) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          const fieldSchema = schema.find(field => field.name === fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData(formattedList);
          }

        }
        else {
          const fieldSchema = schema.find(field => field.name === fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(fieldSchema.tableColumns);
            setTableData([]);
          }
        }
      } catch (error) {
        console.error("Error fetching all document list:", error);
      }
    }

    setVisible(true);
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

  const filteredData = tableData.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );




  const { t } = useTranslation();


  const renderField = (field: FormField) => {
    const fieldStyle = { width: field.width || '100%' };

    switch (field.type) {
      case 'input':
        return (
          <Form.Item
            key={field.name}
            // label={field.label}
            label={t(field.label)}
            name={field.name}
            rules={[{ required: field.required, message: `${field.label} is required` }]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Input
              // placeholder={field.placeholder}
              onChange={e =>
                form.setFieldsValue({
                  [field.name]: handleInputChange(e.target.value, field),
                })
              }
            />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[{ required: field.required, message: `${field.label} is required` }]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Input
              type="number"
              // placeholder={field.placeholder}
              onChange={e =>
                form.setFieldsValue({
                  [field.name]: handleInputChange(e.target.value, field),
                })
              }
            />
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[{ required: field.required, message: `${field.label} is required` }]}
            initialValue={field.defaultValue}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Select 
            defaultValue={field.defaultValue}
              onChange={(value) => handleSelectChange(value, field.name)} >
              {field.options?.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'switch':
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
              checked={field.checked} // You can bind this to a value in your state or form
              onChange={(checked) => handleSwitchChange(checked, field.name)} // Add onChange event handler
            />

          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={t(field.label)}
            valuePropName="checked"
            rules={[{ required: field.required, message: `${field.label} is required` }]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Checkbox />
          </Form.Item>
        );
      case 'browse':
        return (
          <Form.Item
            key={field.name}
            label={t(field.label)}
            name={field.name}
            rules={[{ required: field.required, message: `${t(field.label)} is required` }]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}


          >
            <Input
              // placeholder={field.placeholder}
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
          </Form.Item>

        );
      default:
        return null;
    }
  };

  const handleSubmit = (values: any) => {
    console.log('Form Values:', {
      ...values,
      ...schema.reduce((acc, field) => {
        if (field.type === 'switch' && values[field.name] === undefined) {
          acc[field.name] = false;
        }
        if (field.type === 'checkbox' && values[field.name] === undefined) {
          acc[field.name] = false;
        }
        return acc;
      }, {}),
    });
  };

  return (
    <>
     

      <Form
        form={form}
        layout={layout}
        onFinish={handleSubmit}
        style={{
          width: '100%',
          // maxHeight: '100vh', // Limit the form height
          // overflowY: 'auto',
          marginTop: '2%',
        }}
      >
        {formSchema.map(field => renderField(field))}
      </Form>


      <Modal
        title={
          <>
            {t('select')}
            <Tooltip title="Search">
              {/*<SearchOutlined
                onClick={() => setSearchVisible(!searchVisible)}
                style={{ marginLeft: 8 }}
              />*/}
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
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      // footer={[
      //   <Button key="cancel" onClick={handleModalCancel}>
      //     Cancel
      //   </Button>,
      //   <Button key="ok" type="primary" onClick={handleModalOk}>
      //     OK
      //   </Button>,
      // ]}
      >
        <Table
          columns={tableColumns}
          dataSource={filteredData}
          // rowSelection={{
          //   type: 'radio',
          //   onSelect: handleRowSelection,
          // }}
          onRow={(record) => ({
            onClick: () => handleRowSelection(record),
          })}
          pagination={{
            pageSize: 6,
          }}
        />
      </Modal>
    </>
  );
};

export default DynamicForm;
