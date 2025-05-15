import React, { useContext, useEffect, useState } from 'react';
import { Table, Input, Button, Space, Modal, Select, Form, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styles from '../styles/RoutingMaintenance.module.css';
import RoutingStepForm from "./RoutingStepForm";
import { RoutingContext } from '../hooks/routingContext';
import { fetchTop50Routing } from '@services/routingServices';
import { parseCookies } from 'nookies';
import { retrieveErpOperation, retrieveErpWC, updateRouting } from '@services/routingServices';
import { useTranslation } from 'react-i18next';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { SearchOutlined } from '@mui/icons-material';
const { Option } = Select;
interface ColumnConfig {
  title: any;
  dataIndex: string;
  key: string;
  type: 'input' | 'button';
}

interface RoutingStep {
  stepId: string;
  stepType: string;
  routingBO?: string;
  routing?: string;
  routingVersion?: string;
  [key: string]: any; // Other optional keys
}

interface RoutingData {
  site: string;
  routing: string;
  version: string;
  routingStepList: RoutingStep[];
}

interface DataRow {
  [key: string]: string | number;
}

interface PayloadData {
  routingStepList: []
}

interface DynamicTableProps {
  columns: any[];
  data: Record<string, string>[];
}

const DynamicTableBuilder: React.FC<DynamicTableProps> = ({ columns, data }) => {
  const { t } = useTranslation();

  const { isRowSelected, setIsRowSelected, insertClickBoolean, setInsertClickBoolean, insertClick, setInsertClick, tableData, setTableData,
    rowSelectedData, setRowSelectedData, selectedRowKeys, setSelectedRowKeys,
    isStepModalVisible, setIsStepModalVisible, isNextPage, setIsNextPage, payloadData, setPayloadData, username,
    formSchema, setFormSchema, setShowAlert, isOperationRowSelected, setIsOperationRowSelected } = useContext<any>(RoutingContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalRowData, setModalRowData] = useState<Record<string, string> | null>(null);


  const handleInputChange = (value: string, rowIndex: number, dataIndex: string) => {
    // Create a copy of the existing routingStepList
    const newRoutingStepList = [...payloadData.routingStepList];

    // Update the specific field with the new value
    newRoutingStepList[rowIndex][dataIndex] = value;

    // Add or update the key based on the routingStepList length
    // newRoutingStepList[rowIndex].key = rowIndex + 1; 
    newRoutingStepList[rowIndex].key = rowIndex;

    // Update the payloadData state to persist the changes
    setPayloadData((prevPayloadData) => ({
      ...prevPayloadData,
      routingStepList: newRoutingStepList,
    }));

    // Update the tableData to reflect the changes
    setTableData(newRoutingStepList);
    setShowAlert(true);
  };









  const handleModalSave = (oEvent) => {
    debugger;
    let flagToSave = true;
    const updatedRowData = {
      ...payloadData,
      userId: username
    };


    // console.log("Request:", updatedRowData);

    const getRequiredFields = (fields: any[], fieldNames: string[]): any[] => {
      return fields.filter(field => fieldNames.includes(field.name));
    };

    const requiredFieldNames = ['operation', 'operationVersion', 'routing', 'routingVersion'];

    const requiredFields = getRequiredFields(formSchema, requiredFieldNames);

    // console.log(requiredFields);




    updatedRowData.routingStepList.forEach((step, index) => {

      if (requiredFields[0].disabled == false && step.stepType == "Operation") {
        if (step.operation == undefined || step.operation == "" || step.operation == null) {
          message.error({
            content: `Routing Step ${(index + 1) * 10}: Operation cannot be empty:`,
            duration: 3 // The message will close after 3 seconds
          });
          flagToSave = false;
          return
        }
      }

      if (requiredFields[1].disabled == false && step.stepType == "Operation") {
        if (step.operationVersion == undefined || step.operationVersion == "" || step.operationVersion == null) {
          message.error({
            content: `Routing Step ${(index + 1) * 10}: Operation version cannot be empty:`,
            duration: 3 // The message will close after 3 seconds
          });
          flagToSave = false;
          return
        }
      }

      if (requiredFields[2].disabled == false && step.stepType == "Routing") {
        if (step.routing == undefined || step.routing == "" || step.routing == null) {
          message.error({
            content: `Routing Step ${(index + 1) * 10}: Routing cannot be empty:`,
            duration: 3 // The message will close after 3 seconds
          });
          flagToSave = false;
          return
        }
      }

      if (requiredFields[3].disabled == false && step.stepType == "Routing") {
        if (step.routingVersion == undefined || step.routingVersion == "" || step.routingVersion == null) {
          message.error({
            content: `Routing Step ${(index + 1) * 10}: Routing Version cannot be empty:`,
            duration: 3 // The message will close after 3 seconds
          });
          flagToSave = false;
          return
        }
      }

      if (step.previousStepId == undefined || step.previousStepId == "") {
        message.error({
          content: `Routing Step ${(index + 1) * 10}: Previous StepId cannot be empty:`,
          duration: 3 // The message will close after 3 seconds
        });
        flagToSave = false;
        return
      }

      else if (step.nextStepId == undefined || step.nextStepId == "") {
        message.error({
          content: `Routing Step ${(index + 1) * 10}: Next StepId cannot be empty:`,
          duration: 3 // The message will close after 3 seconds
        });
        flagToSave = false;
        return;
      }


    });



    const oCreateRouting = async () => { // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;


      try {
        if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
          setTimeout(async function () {
            // console.log("Update request: ", updatedRowData);
            const updateResponse = await updateRouting(updatedRowData);
            // console.log("Updated reason Code response: ", updateResponse);
            if (updateResponse) {
              if (updateResponse.errorCode) {
                message.error(updateResponse.message);
              }
              else {
                message.success(updateResponse.message_details.msg);
                const formattedCustomData = updateResponse.response.customDataList.map((item, index) => ({
                  ...item,
                  id: index,
                  key: index
                }));

                setShowAlert(false);
              }
            }
          }, 0);

        }


      } catch (error) {
        console.error('Error creating reason code:', error);
      }
    };
    if (flagToSave == true)
      oCreateRouting();

    // setIsModalVisible(false);

  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const adjustStepIds = (rows: Record<string, string>[]) => {
    return rows.map((row, index, array) => {
      const stepId = (index + 1) * 10;
      return {
        ...row,
        stepId,
      };
    });
  };

  const handleDetailsClick = (recordData: any, rowIndex: number) => {
    setIsRowSelected(true);
    console.log("recordData: ", recordData);
    rowIndex = +recordData.stepId;
    rowIndex = (rowIndex / 10) - 1;
    // debugger
    stepSchema = stepSchema.map(field => {
      if (field.name == 'stepType') {
        const isOperation = payloadData.routingStepList[rowIndex].stepType == 'Operation';

        return field;
      }
      else if (field.name == 'routing' || field.name == 'routingVersion') {
        const stepTypeField = stepSchema.find(f => f.name == 'stepType');
        const isOperation = payloadData.routingStepList[rowIndex].stepType == 'Operation';


        return {
          ...field,
          required: !isOperation,
          disabled: isOperation,
        };
      }
      else if (field.name == 'operation' || field.name == 'operationVersion') {
        const stepTypeField = stepSchema.find(f => f.name == 'stepType');
        const isOperation = payloadData.routingStepList[rowIndex].stepType == 'Operation';


        return {
          ...field,
          required: isOperation,
          disabled: !isOperation,
        };
      }
      return field;
    });
    // console.log("form stepSchema from routing step list table: :", stepSchema);
    // debugger
    setFormSchema(stepSchema);
    // console.log("Selected details row data: ", payloadData.routingStepList[rowIndex]);
    setModalRowData(payloadData.routingStepList[rowIndex]);

    const updateRoutingSteps = (data: RoutingData): RoutingData => {
      const updatedRoutingStepList = data.routingStepList.map(step => {
        if (step.stepType == "Routing" && step.routingBO) {
          const splitRoutingBO = step.routingBO.split(",");

          // Assuming format is RoutingBo:site,routingValue,routingVersion
          return {
            ...step,
            routing: splitRoutingBO[1], // Extract routing value
            routingVersion: splitRoutingBO[2], // Extract routing version
          };
        }
        return step;
      });

      return {
        ...data,
        routingStepList: updatedRoutingStepList,
      };
    };

    const updatedData = updateRoutingSteps(payloadData);
    console.log("Split routing step data from table(outside table): ", updatedData)
    
    // setPayloadData((prevData) => ({
    //   ...prevData,
    //   updatedData
    // }));
     setPayloadData( updatedData)
     
     
   

    // setIsModalVisible(true);
    setIsNextPage(true);
    setIsStepModalVisible(false);

    setRowSelectedData(updatedData.routingStepList[rowIndex]);
    setSelectedRowKeys([rowIndex])
    
    if (updatedData.routingStepList[rowIndex].stepType.toLowerCase() == "operation") {
      setIsOperationRowSelected(true)
    }
    else {
      setIsOperationRowSelected(false)
    }
    console.log("payload data from table: ", payloadData);
  };

  const handleInsert = () => {
    let newRow;
    setIsRowSelected(false);
    setInsertClickBoolean(true);
    if (payloadData.routingStepList.length > 0) {
      const newStepId: any = ((payloadData.routingStepList.length + 1) * 10).toString();
      setShowAlert(true);
      // Define the new row with the dynamically generated stepId
      newRow = {
        key: +((newStepId / (10)) - 1),
        id: +((newStepId / (10)) - 1),

        stepId: newStepId,
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
      };

      // Add the new row to the existing table data
      const newData = [...tableData, newRow];
      setTableData(adjustStepIds(newData));

      const rowIndex = +payloadData.routingStepList.length - 1;
      stepSchema = stepSchema.map(field => {
        if (field.name == 'stepType') {
          const isOperation = payloadData.routingStepList[rowIndex].stepType == 'Operation';

          return field;
        }

        else if (field.name == 'routing' || field.name == 'routingVersion') {



          return {
            ...field,
            required: false,
            disabled: true,
          };
        }
        else if (field.name == 'operation' || field.name == 'operationVersion') {
          const stepTypeField = stepSchema.find(f => f.name == 'stepType');
          const isOperation = payloadData.routingStepList[rowIndex].stepType == 'Operation';


          return {
            ...field,
            required: true,
            disabled: false,
          };
        }
        return field;
      });
      // console.log("form stepSchema from routing step list table: :", stepSchema);

      setFormSchema(stepSchema);

    }
    else {
      newRow = {
        key: 0,
        id: 0,

        stepId: 10,
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
      };
      stepSchema = stepSchema.map(field => {
        // Check for routing and routingVersion fields
        if (field.name === 'routing' || field.name === 'routingVersion') {
          return {
            ...field,
            disabled: true // Set disabled based on your condition
          };
        }
        return field; // For all other fields, keep them as is
      });
      setFormSchema(stepSchema);
    }
    // Update the payloadData with the new row
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      routingStepList: [...prevPayloadData.routingStepList, newRow]
    }));
    setIsNextPage(true);
    setIsStepModalVisible(false);
    setInsertClick(insertClick + 1);
    debugger
    const length = +payloadData.routingStepList.length;
    setSelectedRowKeys([length]);
    // form.setFieldsValue(newRow);
  };

  const handleInsertBefore = () => {
    if (selectedRowKeys.length > 0) {
      const firstSelectedRowIndex = selectedRowKeys[0] as number;
      setShowAlert(true);
      // Define the new row with a temporary stepId (it will be adjusted later)
      const newRow = {
        key: Date.now(), // Temporary unique key
        stepId: 0,       // Temporary stepId, will be updated later
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
        queueDecision: "",
        erpSequence: "",
        lastReportingStep: false,
        reworkStep: false,
        blockPcusUntilInspectionFinished: false,
        nextStepId: "",
        previousStepId: "",
        entryStep: true,
        parentStep: true,
      };

      // Insert the new row into the table data
      // const newData = [...tableData];
      const newData = [...payloadData.routingStepList];
      newData.splice(firstSelectedRowIndex, 0, newRow);

      // Adjust the stepIds to be sequential
      const adjustedData = newData.map((row, index) => ({
        ...row,
        stepId: (index + 1) * 10, // Sequential stepIds (10, 20, 30, ...)
        key: (index + 1) * 10,    // Ensure the key is also updated if needed
      }));

      setTableData(adjustedData);

      // Update routingStepList in payloadData with adjustedData
      setPayloadData(prevPayloadData => ({
        ...prevPayloadData,
        routingStepList: adjustedData,
      }));

      setSelectedRowKeys([]);
    }
  };

  const handleInsertAfter = () => {
    if (selectedRowKeys.length > 0) {
      const firstSelectedRowIndex = selectedRowKeys[0] as number;
      setShowAlert(true);
      // Define the new row with a temporary stepId (it will be adjusted later)
      const newRow = {
        key: Date.now(), // Temporary unique key
        stepId: 0,       // Temporary stepId, will be updated later
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
        queueDecision: "",
        erpSequence: "",
        lastReportingStep: false,
        reworkStep: false,
        blockPcusUntilInspectionFinished: false,
        nextStepId: "",
        previousStepId: "",
        entryStep: true,
        parentStep: true,
      };

      // Insert the new row after the selected row in the table data
      // const newData = [...tableData];
      const newData = [...payloadData.routingStepList];
      newData.splice(+firstSelectedRowIndex + 1, 0, newRow);

      // Adjust the stepIds to be sequential
      const adjustedData = newData.map((row, index) => ({
        ...row,
        stepId: (index + 1) * 10, // Sequential stepIds (10, 20, 30, ...)
        key: (index + 1) * 10,    // Ensure the key is also updated if needed
      }));

      setTableData(adjustedData);

      // Update routingStepList in payloadData with adjustedData
      setPayloadData(prevPayloadData => ({
        ...prevPayloadData,
        routingStepList: adjustedData,
      }));

      setSelectedRowKeys([]);
    }
  };




  const handleRemoveSelected = () => {
    if (selectedRowKeys.length > 0) {
      // Convert selected row keys into array of indices
      let indicesToRemove = selectedRowKeys.map(key => parseInt(key, 10) / 10 - 1);

      setShowAlert(true);

      // Filter out the rows that have indices matching any in indicesToRemove
      const newRoutingStepList = payloadData.routingStepList
        .filter((_, index) => !selectedRowKeys.includes(index)) // Remove rows with matching indices
        .map((row, index) => ({
          ...row,
          stepId: (index + 1) * 10, // Adjust stepId to match the new order
          key: (index + 1) * 10  // Adjust key to match the new order
        }));

      // Update table data and payloadData with the adjusted step IDs
      setTableData(newRoutingStepList);
      setPayloadData(prevPayloadData => ({
        ...prevPayloadData,
        routingStepList: newRoutingStepList
      }));

      // Clear selected row keys
      setSelectedRowKeys([]);
    }
  };

  const handleRemoveAll = () => {
    // Clear table data
    setTableData([]);
    setShowAlert(true);
    // Clear routingStepList in payloadData
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      routingStepList: []
    }));

    setSelectedRowKeys([]);
  };


  const operationTableColumns = [
    { title: t('operation'), dataIndex: 'operation', key: 'operation' },
    { title: t('version'), dataIndex: 'revision', key: 'revision' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
  ];

  const erpOperationTableColumns = [
    { title: t('operation'), dataIndex: 'operation', key: 'operation' },
    { title: t('version'), dataIndex: 'revision', key: 'revision' },
    { title: t('description'), dataIndex: 'description', key: 'description' },

  ];

  const routingTableColumns = [
    { title: t('routing'), dataIndex: 'routing', key: 'routing' },
    { title: t('version'), dataIndex: 'version', key: 'version' },
    { title: t('description'), dataIndex: 'description', key: 'description' },

  ];

  const wcTableColumns = [
    { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
  ];


  const erpWcTableColumns = [
    { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
  ];



  const handleSelectChange = (value: string, rowIndex: number, dataIndex: string) => {
    // console.log(`Selected value: ${value}, Row index: ${rowIndex}, Data index: ${dataIndex}`);
    let oRoutingStepList = [...payloadData.routingStepList];  // Make a shallow copy of the array
    oRoutingStepList[rowIndex] = {
      ...oRoutingStepList[rowIndex],  // Copy the existing object
      stepType: value                 // Update the stepType value
    };

    // Update the payloadData with the modified oRoutingStepList
    setPayloadData((prevData) => ({
      ...prevData,
      routingStepList: oRoutingStepList
    }));


  };


  const renderColumns = (): any => {
    return columns.map((col) => {
      let title: any = t(col.title); // Default title translation

      // Custom title for nextStepId and previousStepId with a red asterisk
      if (col.dataIndex === 'nextStepId' || col.dataIndex === 'previousStepId') {
        title = (
          <span>
            <span style={{ color: 'red' }}>*</span> {t(col.title)}
          </span>
        );
      }

      if (col.type === 'input') {
        return {
          ...col,
          title, // Apply the title with or without the red asterisk
          filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
              <Input
                value={selectedKeys[0]}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={confirm}
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Button
                type="primary"
                onClick={confirm}
                size="small"
                style={{ width: 90, marginRight: 8 }}
              >
                {t('search')}
              </Button>
              <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                {t('reset')}
              </Button>
            </div>
          ),
          onFilter: (value, record) =>
            record[col.dataIndex] // Dynamically reference the column's dataIndex
              .toString()
              .toLowerCase()
              .includes((value as string).toLowerCase()),
          render: (text: string, record: any, rowIndex: number) => (
            <Input
              value={text}
              onChange={(e) => handleInputChange(e.target.value, rowIndex, col.dataIndex)}
            />
          ),
        };
      }

      if (col.type === 'button') {
        return {
          ...col,
          title, // Apply the title with or without the red asterisk
          render: (_: any, recordData: any, rowIndex: number) => (
            <Button onClick={() => handleDetailsClick(recordData, rowIndex)}>{t("details")}</Button>
          ),
        };
      }

      if (col.type === 'select') {
        return {
          ...col,
          title, // Apply the title with or without the red asterisk
          filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
              <Input
                value={selectedKeys[0]}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={confirm}
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Button
                type="primary"
                onClick={confirm}
                size="small"
                style={{ width: 90, marginRight: 8 }}
              >
                {t('search')}
              </Button>
              <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                {t('reset')}
              </Button>
            </div>
          ),
          onFilter: (value, record) =>
            record[col.dataIndex] // Dynamically reference the column's dataIndex
              .toString()
              .toLowerCase()
              .includes((value as string).toLowerCase()),
          render: (text: string, record: any, rowIndex: number) => (
            <Select
              defaultValue={text}
              onChange={(value) => handleSelectChange(value, rowIndex, col.dataIndex)}
            >
              <Option value="Routing">{t("Routing")}</Option>
              <Option value="Operation">{t("Operation")}</Option>
            </Select>
          ),
        };
      }

      return col;
    });
  };


  const modalColumns: ColumnsType<any> = [
    { title: t('stepId'), dataIndex: 'stepId', key: 'stepId' },
    { title: t('stepType'), dataIndex: 'stepType', key: 'stepType' },
    { title: t('stepDescription'), dataIndex: 'stepDescription', key: 'stepDescription' },
    { title: t('previousStepId'), dataIndex: 'previousStepId', key: 'previousStepId' },
    { title: t('nextStepId'), dataIndex: 'nextStepId', key: 'nextStepId' },
  ];


  let stepSchema: any = [
    {
      type: 'number',
      label: 'stepId',
      name: 'stepId',
      placeholder: '',
      required: true,
      width: "70%",
      fieldType: 'Number',
    },
    {
      type: 'select',
      label: 'stepType',
      name: 'stepType',
      placeholder: 'Select Step Type',
      required: true,
      width: "70%",
      defaultValue: "Operation",
      options: [
        { value: 'Operation', label: 'Operation' },
        { value: 'Routing', label: 'Routing' },
      ],
    },
    {
      type: 'browse',
      label: 'operation',
      name: 'operation',
      placeholder: '',
      icon: true,
      correspondingVersion: 'operationVersion',
      correspondingDescription: 'stepDescription',
      required: true,
      tableColumns: operationTableColumns,
      tableData: [],
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },
    {
      type: 'browse',
      label: 'operationVersion',
      name: 'operationVersion',
      placeholder: '',
      required: true,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },
    {
      type: 'browse',
      label: 'routing',
      name: 'routing',
      placeholder: '',
      required: true,
      icon: true,
      correspondingVersion: 'routingVersion',
      correspondingDescription: 'stepDescription',
      width: "70%",
      tableColumns: routingTableColumns,
      tableData: [],
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },

    {
      type: 'browse',
      label: 'routingVersion',
      name: 'routingVersion',
      placeholder: '',
      required: true,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },
    {
      type: 'browse',
      label: 'stepDescription',
      name: 'stepDescription',
      correspondingDescription: 'stepDescription',
      placeholder: '',
      required: false,
      width: "70%",
    },
    {
      type: 'number',
      label: 'maximumLoopCount',
      name: 'maximumLoopCount',
      placeholder: '',
      required: false,
      width: "70%",

    },
    {
      type: 'select',
      label: 'queueDecision',
      name: 'queueDecision',
      placeholder: '',
      required: false,
      width: "70%",
      defaultValue: "Completing Operator",
      options: [
        { value: 'Completing Operator', label: 'Completing Operator' },
        { value: 'Next Operator', label: 'Next Operator' },
      ],
    },
    {
      type: 'select',
      label: 'erpControlKey',
      name: 'erpControlKey',
      placeholder: '',
      required: false,
      width: "70%",
      defaultValue: "Master",
      options: [
        { value: 'Master', label: 'Master' },
        { value: 'ShopOrder Specific', label: 'ShopOrder Specific' },
        { value: 'PCU SPecific', label: 'PCU SPecific' },
        { value: 'NC Routing', label: 'NC Routing' },
      ],
    },
    {
      type: 'browse',
      label: 'erpOperation',
      name: 'erpOperation',
      placeholder: '',
      required: false,
      correspondingVersion: '',
      icon: true,
      width: "70%",
      tableColumns: erpOperationTableColumns,
      tableData: [],
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'browse',
      label: 'workCenter',
      name: 'workCenter',
      placeholder: '',
      icon: true,
      required: false,
      width: "70%",
      tableColumns: wcTableColumns,
      tableData: [],
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'browse',
      label: 'erpWorkCenter',
      name: 'erpWorkCenter',
      placeholder: '',
      icon: true,
      required: false,
      width: "70%",
      tableColumns: erpWcTableColumns,
      tableData: [],
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'input',
      label: 'requiredTimeInProcess',
      name: 'requiredTimeInProcess',
      placeholder: '',
      required: false,
      width: "70%",

    },
    {
      type: 'input',
      label: 'specialInstruction',
      name: 'specialInstruction',
      placeholder: '',
      required: false,
      width: "70%",
    },
    {
      type: 'number',
      label: 'erpSequence',
      name: 'erpSequence',
      placeholder: '',
      required: false,
      width: "70%",

    },
    {
      type: 'switch',
      label: 'blockPcusUntilInspectionFinished',
      name: 'blockPcusUntilInspectionFinished',
      required: false,
      width: "70%",
      defaultValue: true,
      customTextOn: 'Yes',
      customTextOff: 'No',
    },
    {
      type: 'switch',
      label: 'entryStep',
      name: 'entryStep',
      required: false,
      width: "70%",
      defaultValue: true,
      customTextOn: 'Yes',
      customTextOff: 'No',
    },
    {
      type: 'switch',
      label: 'isLastReportingStep',
      name: 'lastReportingStep',
      required: false,
      width: "70%",
      defaultValue: true,
      customTextOn: 'Yes',
      customTextOff: 'No',
    },
    {
      type: 'switch',
      label: 'reworkStep',
      name: 'reworkStep',
      required: false,
      width: "70%",
      defaultValue: true,
      customTextOn: 'Yes',
      customTextOff: 'No',
    },
    {
      type: 'number',
      label: 'previousStepId',
      name: 'previousStepId',
      placeholder: '',
      required: true,
      width: "70%",

    },
    {
      type: 'number',
      label: 'nextStepId',
      name: 'nextStepId',
      placeholder: '',
      required: true,
      width: "70%",

    },
  ];

  const handleAdd = () => {
    handleInsert();
    debugger;
    setTimeout(() => {
      const routingStepListLength = ((payloadData.routingStepList.length + 1) * 10).toString();
      // console.log("Step length: ", routingStepListLength);
      setSelectedRowKeys([routingStepListLength]);
      setShowAlert(true);
      const newRowData = {
        "key": routingStepListLength,
        "stepId": routingStepListLength,
        "stepType": "Operation",
        "operation": "",
        "operationVersion": "",
        "routing": "",
        "routingVersion": "",
        "routingBO": "",
        "stepDescription": "",
        "maximumLoopCount": "",
        "erpControlKey": "",
        "erpOperation": "",
        "workCenter": "",
        "erpWorkCenter": "",
        "requiredTimeInProcess": "",
        "specialInstruction": "",
        "queueDecision": "Completing Operator",
        "erpSequence": "",
        "lastReportingStep": false,
        "reworkStep": false,
        "blockPcusUntilInspectionFinished": false,
        "nextStepId": "",
        "previousStepId": "",
        "entryStep": false,
        "parentStep": false
      }
      setRowSelectedData(newRowData);

      setFormSchema(prevSchema => {
        const newSchema = [...prevSchema];

        // Disable specific fields based on the stepType value
        newSchema[4] = { ...newSchema[4], disabled: true };
        newSchema[5] = { ...newSchema[5], disabled: true };
        newSchema[4] = { ...newSchema[4], required: false };
        newSchema[5] = { ...newSchema[5], required: false };
        newSchema[2] = { ...newSchema[2], disabled: false };
        newSchema[3] = { ...newSchema[3], disabled: false };
        newSchema[2] = { ...newSchema[2], required: true };
        newSchema[3] = { ...newSchema[3], required: true };

        return newSchema;
      });

    }, 0);
  }

  // // console.log("stepSchema: ", stepSchema);
  // setRoutingStepsLength(payloadData.routingStepList * 10);
  // console.log("Routing Step List Data from payload: ", payloadData.routingStepList);
  return (
    <div>
      <Space style={{ marginBottom: '10px', float: 'right', marginTop: '2%' }}>
        <Button className={styles.cancelButton} onClick={handleInsert}>
          {t("insert")}
        </Button>

        <Button
          onClick={handleInsertBefore}
          className={styles.cancelButton}
          disabled={selectedRowKeys.length == 0}
        >
          {t("insertBefore")}
        </Button>
        <Button
          onClick={handleInsertAfter}
          className={styles.cancelButton}
          disabled={selectedRowKeys.length == 0}
        >
          {t("insertAfter")}
        </Button>
        <Button
          onClick={handleRemoveSelected}
          className={styles.cancelButton}
          disabled={selectedRowKeys.length == 0}
        >
          {t("removeSelected")}
        </Button>
        <Button className={styles.cancelButton} onClick={handleRemoveAll}>
          {t("removeAll")}
        </Button>
      </Space>
      <Table
        columns={renderColumns()}
        
        dataSource={payloadData.routingStepList}
        // rowKey={(record) => record.uniqueKey} // Use a unique key for each row, like an ID or other unique property
        rowSelection={{
          selectedRowKeys, // Use your state for selected row keys
          onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys);
            // setoRowSelectedData(selectedRows); // Store the selected row data
            // // console.log("Selected Rows: ", selectedRows);
          },
        }}
        // pagination={{ pageSize: 5 }}
        pagination={false}
        scroll={{ y: 'calc(100vh - 450px)' }}
      />

      <Modal
        title={t("routingStepDetails")}
        open={isModalVisible}
        onOk={handleModalSave}
        onCancel={handleModalCancel}
        style={{ top: 20 }}
        width={1500} // Increase width
        // height={"60vh"} // Increase width
        bodyStyle={{ height: '70vh' }} // Increase height

        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            {t("cancel")}
          </Button>,
          <Button key="save" type="primary" onClick={handleModalSave}>
            {t("save")}
          </Button>,
        ]}
      >


        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ marginBottom: '10px', marginRight: '41%' }}>
            <Button type='primary'
              // className={`${styles.floatingButton} ${styles.saveButton}`}
              onClick={handleAdd}
              style={{ alignSelf: 'flex-end', float: 'right' }}
            >
              {t("add")}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>


            <Table
              bordered
              columns={modalColumns}
              dataSource={payloadData.routingStepList}
              pagination={false}
              style={{ flex: 1, marginRight: '20px' }}
              rowSelection={{
                type: 'radio', // Single row selection
                selectedRowKeys: selectedRowKeys, // Controlled selection state
                onChange: (selectedRowKeys, selectedRows) => {
                  setSelectedRowKeys(selectedRowKeys); // Update selected row keys
                  setRowSelectedData(selectedRows[0]); // Update form data with selected row
                },
              }}
              onRow={(record) => ({
                onClick: () => {
                  setSelectedRowKeys([record.key]); // Manually trigger row selection
                  setRowSelectedData(record); // Update form data with selected row

                  const rowId = record.stepId;
                  const getStepTypeById = (stepId: string | number): string | undefined => {
                    const step = payloadData.routingStepList.find(step => step.stepId === stepId);
                    return step ? step.stepType : undefined;
                  };

                  const updatedSchema = stepSchema.map(field => {
                    if (field.name === 'routing' || field.name === 'routingVersion') {
                      const stepType = getStepTypeById(rowId);
                      const isOperation = stepType === 'Operation';

                      return {
                        ...field,
                        required: !isOperation,
                        disabled: isOperation,
                      };
                    } else if (field.name === 'operation' || field.name === 'operationVersion') {
                      const stepType = getStepTypeById(rowId);
                      const isOperation = stepType === 'Operation';

                      return {
                        ...field,
                        required: isOperation,
                        disabled: !isOperation,
                      };
                    }
                    return field;
                  });

                  // console.log("form stepSchema from routing steps list table:", updatedSchema);
                  setFormSchema(updatedSchema);
                },
              })}
            />


            <div style={{ width: '40%', maxHeight: "50vh", }}>
              <RoutingStepForm schema={stepSchema} rowSelectedData={rowSelectedData} />
            </div>
          </div>
        </div>






      </Modal>
    </div>
  );
};

export default DynamicTableBuilder;
