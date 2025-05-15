import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Select, Switch, Checkbox, Button, Modal, Table, Tooltip } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import { RoutingContext } from '../hooks/routingContext';
import { useTranslation } from 'react-i18next';
import {
  retrieveAllOperation, retrieveAllRouting, retrieveAllWC, retrieveErpOperation, retrieveErpWC, retrieveTop50Operation,
  retrieveTop50Routing, retrieveTop50WC
} from '@services/routingServices';
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
  schema: any;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };

  rowSelectedData: any[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({

  layout = 'horizontal',
  labelCol = { span: 12 },
  wrapperCol = { span: 24 },
  rowSelectedData
}) => {

  const { insertClickBoolean, insertClick, setInsertClick, payloadData, setPayloadData, schema, stepSchema,
    setFormSchema, formSchema, setShowAlert, isOperationRowSelected, setIsOperationRowSelected, isStepRowClicked, setIsStepRowClicked } = useContext<any>(RoutingContext);

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // const [formSchema, setFormSchema] = useState(stepSchema);stepSchema
  const [formattedData, setFormattedData] = useState<{ [key: string]: any }[]>([]);
  const [field, setField] = useState<any>();


  // setFormSchema(stepSchema)


  // console.log("Payload data from routing form: ", payloadData);
  useEffect(() => {
    // form.setFieldsValue(payloadData)
  }, [payloadData]);



  useEffect(() => {
    schema.map(field => renderField(field))
  }, [schema]);

  useEffect(() => {
    formSchema?.map(field => renderField(field))
  }, [formSchema]);

  useEffect(() => {
    form.setFieldsValue(rowSelectedData)
  }, [rowSelectedData]);

  // console.log("row selected data: ", rowSelectedData)

  useEffect(() => {
    if (insertClickBoolean) {
      const stepId = (payloadData.routingStepList.length) * 10;
      form.setFieldsValue({
        stepId: stepId,
        stepType: "Operation",
        operation: "",
        operationVersion: "",
        routing: "",
        routingVersion: "",
        routingBO: "",
        stepDescription: "",
        maximumLoopCount: "",
        erpControlKey: "",
        erpOperation: "",
        workCenter: "",
        erpWorkCenter: "",
        requiredTimeInProcess: "",
        specialInstruction: "",
        queueDecision: "Completing operator",
        erpSequence: "",
        lastReportingStep: false,
        reworkStep: false,
        blockPcusUntilInspectionFinished: false,
        nextStepId: "",
        previousStepId: "",
        entryStep: false,
        parentStep: false,
      })
    }
  }, [insertClick])

  useEffect(() => {
    if (isOperationRowSelected)
      form.setFieldsValue({ routing: "", routingVersion: "" })
  }, [isOperationRowSelected, isStepRowClicked])



  const onFormChange = (value: any, version?: any) => {
    if (currentField) {
      // form.setFieldsValue({
      //   [currentField]: value,
      //   ...(version ? { [schema.find(field => field.name == currentField)?.correspondingVersion as string]: version } : {}),
      // });
      // console.log("Form change value: ", form.getFieldsValue())
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
    setShowAlert(true);
    // Handle update for both routingStepList and other fields

    setPayloadData(prevPayloadData => {
      // Find the index of the step to update
      debugger
      const stepIndex = prevPayloadData.routingStepList.findIndex(
        step => step.stepId == updatedRoutingStep.stepId
      );

      // Make a copy of the list
      let updatedRoutingStepList = [...prevPayloadData.routingStepList];
      debugger
      if (stepIndex > -1) {
        // Update the existing step immutably
        const updatedStep = {
          ...updatedRoutingStepList[stepIndex],
          ...updatedRoutingStep
        };

        // Conditionally clear the fields
        debugger
        if (fieldName == "stepType") {
          if (value == "Routing") {
            updatedStep.operation = "";
            updatedStep.operationVersion = "";
            form.setFieldsValue({ "operation": "", "operationVersion": "" })
          } else {
            updatedStep.routing = "";
            updatedStep.routingVersion = "";
            form.setFieldsValue({ "routing": "", "routingVersion": "" })
          }
        }
        // Replace the updated step in the list
        updatedRoutingStepList[stepIndex] = updatedStep;
      } else {
        // Add a new step if stepIndex doesn't exist
        updatedRoutingStepList.push(updatedRoutingStep);
      }

      // Sort the updated list by stepId
      updatedRoutingStepList = updatedRoutingStepList.sort(
        (a, b) => parseInt(a.stepId) - parseInt(b.stepId)
      );

      // Return the updated payload
      return {
        ...prevPayloadData,
        routingStepList: updatedRoutingStepList,
      };
    });


    setFormSchema(prevSchema => {
      const newSchema = [...prevSchema];

      // Disable specific fields based on the stepType value
      if (updatedFormValues.stepType == 'Operation') {
        newSchema[4] = { ...newSchema[4], disabled: true };
        newSchema[5] = { ...newSchema[5], disabled: true };
        newSchema[4] = { ...newSchema[4], required: false };
        newSchema[5] = { ...newSchema[5], required: false };
        newSchema[2] = { ...newSchema[2], disabled: false };
        newSchema[3] = { ...newSchema[3], disabled: false };
        newSchema[2] = { ...newSchema[2], required: true };
        newSchema[3] = { ...newSchema[3], required: true };
      } else if (updatedFormValues.stepType == 'Routing') {
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
  };






  const handleSwitchChange = (checked: boolean, fieldName: string) => {
    // Update the form field value
    form.setFieldsValue({ [fieldName]: checked });
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
    debugger
    // Prepare updatedRoutingStep only if relevant fields are present
    const updatedRoutingStep: UpdatedRoutingStep = relevantFields.reduce<UpdatedRoutingStep>((acc, key) => {
      if (key in updatedFormValues) {
        acc[key] = updatedFormValues[key];
      }
      return acc;
    }, {});

    if (updatedRoutingStep.stepId) {
      updatedRoutingStep.key = updatedRoutingStep.stepId;
    }

    setPayloadData(prevPayloadData => {
      // Find the index of the step to update
      const stepIndex = prevPayloadData.routingStepList.findIndex(step => step.stepId == updatedRoutingStep.stepId);

      // If the step exists, update it; otherwise, add the new step
      let updatedRoutingStepList = [...prevPayloadData.routingStepList];
      console.log("updatedRoutingStepList: ", updatedRoutingStepList);
      console.log("updatedRoutingStep: ", updatedRoutingStep);

      // Sort the updated list by stepId
      updatedRoutingStepList = updatedRoutingStepList.sort((a, b) => parseInt(a.stepId) - parseInt(b.stepId));

      if (stepIndex > -1) {
        updatedRoutingStepList[stepIndex] = { ...updatedRoutingStepList[stepIndex], ...updatedRoutingStep };
      } else {
        updatedRoutingStepList.push(updatedRoutingStep);
      }




      return {
        ...prevPayloadData,
        routingStepList: updatedRoutingStepList,
        // [fieldName]: checked, 
      };
    });
  };




  const handleInputChange = (value: string, field: FormField) => {
    // debugger;
    let newValue = value;
    setShowAlert(true);
    if (field.name != "previousStepId" && field.name != "nextStepId" && field.name != "erpSequence" && field.name != "maximumLoopCount" ) {
      if (field.uppercase) {
        newValue = newValue.toUpperCase();
      }
      if (field.noSpaces) {
        newValue = newValue.replace(/\s+/g, '');
      }
      if (field.noSpecialChars) {
        newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');
      }
    }
    else {
      // Handle previousStepId and nextStepId
      newValue = newValue.replace(/[^0-9,]/g, ''); // Allow only numbers and commas, no decimals, no 'e'
    }

    // Update the form field with the transformed value
    form.setFieldsValue({ [field.name]: newValue });

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
      // Find the index of the step to update
      const stepIndex = prevPayloadData.routingStepList.findIndex(step => step.stepId == updatedRoutingStep.stepId);

      // If the step exists, update it; otherwise, add the new step
      let updatedRoutingStepList = [...prevPayloadData.routingStepList];
      console.log("updatedRoutingStepList: ", updatedRoutingStepList);
      console.log("updatedRoutingStep: ", updatedRoutingStep);

      // Sort the updated list by stepId
      updatedRoutingStepList = updatedRoutingStepList.sort((a, b) => parseInt(a.stepId) - parseInt(b.stepId));

      if (stepIndex > -1) {
        updatedRoutingStepList[stepIndex] = { ...updatedRoutingStepList[stepIndex], ...updatedRoutingStep };
      } else {
        updatedRoutingStepList.push(updatedRoutingStep);
      }




      return {
        ...prevPayloadData,
        routingStepList: updatedRoutingStepList,
        // [fieldName]: checked, 
      };
    });

    return newValue;
  };

  const handleModalOk = (selectedRow) => {
    if (selectedRow) {
      // alert("ok btn")
      const fieldSchema = formSchema.find(field => field.name == currentField);
      setShowAlert(true);
      // debugger
      // Prepare updated fields from selectedRow based on the field schema
      const updatedFields = {
        [currentField]: selectedRow[fieldSchema?.name],
      };

      if (fieldSchema?.correspondingVersion) {
        const versionField = fieldSchema.correspondingVersion;
        const descriptionField = fieldSchema.correspondingDescription;
        updatedFields[versionField] = selectedRow[versionField];
        updatedFields[descriptionField] = selectedRow[descriptionField];
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
        const existingIndex = prevPayloadData.routingStepList.findIndex(step => step.stepId == updatedRoutingStep.stepId);

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
        updatedRoutingStepList = updatedRoutingStepList.sort((a, b) => parseInt(a.stepId) - parseInt(b.stepId));

        return {
          ...prevPayloadData,
          routingStepList: updatedRoutingStepList,
          // ...updatedFields // Update other fields
        };
      });

      // Notify about the form change
      onFormChange(updatedFields[currentField], fieldSchema?.correspondingVersion ? updatedFields[fieldSchema.correspondingVersion] : undefined);
    }

    // Close the modal
    setVisible(false);
  };




  const handleLiveChange = (fieldName: string, value: any) => {
    // Convert the value to uppercase, remove spaces, and allow only underscores
    debugger
    const sanitizedValue = value
      .toUpperCase()                  // Convert to uppercase
      .replace(/\s+/g, '')            // Remove all spaces
      .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores
    setShowAlert(true);
    // Update the form field with the sanitized value
    form.setFieldsValue({ [fieldName]: sanitizedValue });
    // setCurrentField(fieldName);
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
      const existingIndex = prevPayloadData.routingStepList.findIndex(step => step.stepId == updatedRoutingStep.stepId);

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
      updatedRoutingStepList = updatedRoutingStepList.sort((a, b) => parseInt(a.stepId) - parseInt(b.stepId));

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
  };


;

  const openModal = async (fieldName: string) => {
    // debugger
    setField(fieldName);
    setSelectedRow(null);
    if (fieldName == "operation") {

      try {
        let oOperationList;
        const operationTableColumns = [
          { title: t('operation'), dataIndex: 'operation', key: 'operation' },
          { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue().operation;
        const cookies = parseCookies();
        const site = cookies.site;
        if (typedValue)
          oOperationList = await retrieveAllOperation(site, typedValue);
        else
          oOperationList = await retrieveTop50Operation(site);

        if (oOperationList) {
          const formattedOperationList = oOperationList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            operationVersion: item.revision,
            stepDescription: item.description
          }));


          setCurrentField(fieldName);
          const fieldSchema = formSchema.find(field => field.name == fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(operationTableColumns);
            setTableData(formattedOperationList);
          }
        }

        else {
          const fieldSchema = formSchema.find(field => field.name == fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(operationTableColumns);
            // setTableColumns(fieldSchema.tableColumns);
            setTableData([]);
          }
        }

      } catch (error) {
        console.error("Error fetching all operation list:", error);
      }
    }

    else if (fieldName == "routing") {
      try {
        let oRoutingList;
        const routingTableColumns = [
          { title: t('routing'), dataIndex: 'routing', key: 'routing' },
          { title: t('version'), dataIndex: 'version', key: 'version' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue().routing;
        const cookies = parseCookies();
        const site = cookies.site;
        if (typedValue)
          oRoutingList = await retrieveAllRouting(site, typedValue);
        else
          oRoutingList = await retrieveTop50Routing(site);

        if (oRoutingList) {
          const formattedRoutingList = oRoutingList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            routing: item.routing,
            routingVersion: item.version,
            stepDescription: item.description
          }));

          setCurrentField(fieldName);
          const fieldSchema = formSchema.find(field => field.name == fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(routingTableColumns);
            // setTableColumns(fieldSchema.tableColumns);
            setTableData(formattedRoutingList);
          }
        }
        else {
          const fieldSchema = formSchema.find(field => field.name == fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(routingTableColumns);
            // setTableColumns(fieldSchema.tableColumns);
            setTableData([]);
          }
        }

      } catch (error) {
        console.error("Error fetching all BOM list:", error);
      }
    }

    else if (fieldName == "workCenter") {
      try {
        let oWCList;
        const workCenterTableColumns = [
          { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldsValue().workCenter;
        if (typedValue)
          oWCList = await retrieveAllWC(site, typedValue);
        else
          oWCList = await retrieveTop50WC(site);

        if (oWCList) {
          const formattedWCList = oWCList.map((item, index) => ({
            ...item,
            workCenter: item.workCenter,
            description: item.description,
            key: index,
            id: index,
          }));


          setCurrentField(fieldName);
          const fieldSchema = formSchema.find(field => field.name == fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(workCenterTableColumns);
            // setTableColumns(fieldSchema.tableColumns);
            setTableData(formattedWCList);
          }
        }
        else {
          const fieldSchema = formSchema.find(field => field.name == fieldName);
          if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
            setTableColumns(workCenterTableColumns);
            // setTableColumns(fieldSchema.tableColumns);
            setTableData([]);
          }
        }

      } catch (error) {
        console.error("Error fetching all WC list:", error);
      }
    }

    else if (fieldName == "erpOperation") {
      try {
        const operationTableColumns = [
          { title: t('operation'), dataIndex: 'operation', key: 'operation' },
          { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const cookies = parseCookies();
        const site = cookies.site;
        const oList = await retrieveErpOperation(site);
        //debugger;
        const formattedList = oList?.map((item, index) => ({
          ...item,
          key: index,
          id: index,
          erpOperation: item.operation
        }));


        setCurrentField(fieldName);
        const fieldSchema = formSchema.find(field => field.name == fieldName);
        if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
          setTableColumns(operationTableColumns);
          // setTableColumns(fieldSchema.tableColumns);
          // setTableData(fieldSchema.tableData);
          setTableData(formattedList);
        }

      } catch (error) {
        console.error("Error fetching all erp operation list:", error);
      }
    }

    else if (fieldName == "erpWorkCenter") {
      try {
        const workCenterTableColumns = [
          { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const cookies = parseCookies();
        const site = cookies.site;
        const oList = await retrieveErpWC(site);
        //debugger;
        const formattedList = oList.map((item, index) => ({
          ...item,
          key: index,
          id: index,
          erpWorkCenter: item.workCenter
        }));


        setCurrentField(fieldName);
        const fieldSchema = formSchema.find(field => field.name == fieldName);
        if (fieldSchema?.tableColumns && fieldSchema?.tableData) {
          setTableColumns(workCenterTableColumns);
          // setTableColumns(fieldSchema.tableColumns);
          // setTableData(fieldSchema.tableData);
          setTableData(formattedList);
        }

      } catch (error) {
        console.error("Error fetching all erp wc list:", error);
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
    debugger
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
            rules={[{ required: field.required }]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Input
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
              // type="number"
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
            rules={[{ required: field.required }]}
            initialValue={field.defaultValue}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
          >
            <Select defaultValue={field.defaultValue}
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
            // rules={[{ required: field.required }]}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            style={fieldStyle}
            required={field.required}

          >
            <Input
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
        if (field.type == 'switch' && values[field.name] == undefined) {
          acc[field.name] = false;
        }
        if (field.type == 'checkbox' && values[field.name] == undefined) {
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
          maxHeight: '70vh', // Limit the form height
          overflowY: 'auto',
          padding: "15px",
          marginLeft: "25%"
        }}
      >
        {formSchema.map(field => renderField(field))}
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
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      >
        <Table
          columns={tableColumns}
          dataSource={tableData}
          // rowSelection={{
          //   type: 'radio',
          //   onSelect: handleRowSelection,
          // }}
          onRow={(record) => ({
            onDoubleClick: () => handleRowSelection(record),
          })}
        
          pagination={false}
          scroll={{ y: 'calc(100vh - 450px)' }}
        />
      </Modal>
    </>
  );
};

export default DynamicForm;
