import React, { useContext, useEffect, useState } from 'react';
import { Table, Input, Button, Space, Modal, Select, Form, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styles from '../styles/DataCollectionMaintenance.module.css';
import RoutingStepForm from "./ParameterForm";
import { DataCollectionContext } from '../hooks/DataCollectionContext';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@mui/icons-material';
import { updateDataCollection } from '@services/dataCollectionServices';
const { Option } = Select;


interface RoutingStep {
  stepId: string;
  stepType: string;
  routingBO?: string;
  routing?: string;
  routingVersion?: string;
  [key: string]: any; // Other optional keys
}



interface DynamicTableProps {
  columns: any[];
  data: Record<string, string>[];
}

const DynamicTableBuilder: React.FC<DynamicTableProps> = ({ columns, data }) => {
  const { t } = useTranslation();

  const { setIsRowSelected, setInsertClickBoolean, insertClick, setInsertClick, tableData, setTableData,
    rowSelectedData, setRowSelectedData, selectedRowKeys, setSelectedRowKeys,
    setIsStepModalVisible, setIsNextPage, payloadData, setPayloadData,
    setFormSchema, setShowAlert, setIsMainPageVisible,
    setIsAttachmentVisible } = useContext<any>(DataCollectionContext);
  const [isModalVisible, setIsModalVisible] = useState(false);


  const handleInputChange = (value: string, rowIndex: number, dataIndex: string) => {
    // Create a copy of the existing parameterList
    // debugger
    if (dataIndex == "parameterName") {
      value = value.toUpperCase().replace(/[^A-Z0-9_]/g, '').replace(/\s+/g, '');
    }
    const newParameterList = [...payloadData?.parameterList];

    // Update the specific field with the new value
    newParameterList[rowIndex][dataIndex] = value;
    // newParameterList[rowIndex].key = rowIndex + 1; 
    newParameterList[rowIndex].key = rowIndex;

    // Update the payloadData state to persist the changes
    setPayloadData((prevPayloadData) => ({
      ...prevPayloadData,
      parameterList: newParameterList,
    }));

    // Update the tableData to reflect the changes
    setTableData(newParameterList);
    setShowAlert(true);
  };

  const handleModalSave = (oEvent) => {
    debugger;
    let flagToSave = true;

    const oCreateDC = async () => { // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;


      try {
        if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
          setTimeout(async function () {
            console.log("Update request: ", payloadData);
            const updateResponse = await updateDataCollection(payloadData);
            console.log("Updated dc response: ", updateResponse);
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
      oCreateDC();

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
    debugger
    setRowSelectedData(recordData);
    setIsRowSelected(true);
    console.log("recordData: ", recordData);
    setIsModalVisible(true);
    setIsNextPage(true);
    setIsMainPageVisible(false);
    setIsAttachmentVisible(false);
    setIsStepModalVisible(true);
    setSelectedRowKeys([rowIndex])
    rowIndex = +recordData.stepId;
    rowIndex = (rowIndex / 10) - 1;

  };

  const handleInsert = () => {
    let newRow;
    setIsRowSelected(false);
    setInsertClickBoolean(true);
    if (payloadData.parameterList?.length > 0) {
      const newStepId: any = ((payloadData?.parameterList.length + 1) * 10).toString();
      setShowAlert(true);
      // Define the new row with the dynamically generated stepId
      newRow = {
        key: +((newStepId / (10)) - 1),
        id: +((newStepId / (10)) - 1),

        "sequence": newStepId,
        "parameterName": "",
        "description": "",
        "type": "Numeric",
        "prompt": "",
        "status": "Enabled",
        "allowMissingValues": false,
        "displayDataValues": true,
        "falseValue": "",
        "trueValue": "",
        "dataField": "",
        "formula": "",
        "minValue": "0",
        "maxValue": "100",
        "targetValue": "",
        "softLimitCheckOnMinOrMaxValue": false,
        "overrideMinOrMax": false,
        "autoLogNconMinOrMaxOverride": false,
        "certification": "",
        "ncCode": "",
        "mask": "",
        "unitOfMeasure": "",
        "requiredDataEntries": "0",
        "optionalDataEntries": "1"
      };

      // Add the new row to the existing table data
      const newData = [...tableData, newRow];
      setTableData(adjustStepIds(newData));

    }
    else {
      newRow = {
        key: 0,
        id: 0,

        "sequence": 10,
        "parameterName": "",
        "description": "",
        "type": "Numeric",
        "prompt": "",
        "status": "Enabled",
        "allowMissingValues": false,
        "displayDataValues": true,
        "falseValue": "",
        "trueValue": "",
        "dataField": "",
        "formula": "",
        "minValue": "0",
        "maxValue": "100",
        "targetValue": "",
        "softLimitCheckOnMinOrMaxValue": false,
        "overrideMinOrMax": false,
        "autoLogNconMinOrMaxOverride": false,
        "certification": "",
        "ncCode": "",
        "mask": "",
        "unitOfMeasure": "",
        "requiredDataEntries": "0",
        "optionalDataEntries": "1"
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
      parameterList: [...prevPayloadData?.parameterList, newRow]
    }));
    setIsNextPage(true);
    setIsStepModalVisible(true);
    setIsMainPageVisible(false);
    setIsAttachmentVisible(false);
    setInsertClick(insertClick + 1);
    // debugger
    const length = +payloadData?.parameterList.length;
    setSelectedRowKeys([length]);
    // form.setFieldsValue(newRow);
  };

  const handleInsertBefore = () => {
    debugger
    if (selectedRowKeys.length > 0) {
      const firstSelectedRowIndex = selectedRowKeys[0] as number; // Get the index of the first selected row
      setShowAlert(true);

      // Define the new row with a temporary stepId (it will be adjusted later)
      const newRow = {

        "sequence": 0,
        "parameterName": "",
        "description": "",
        "type": "Numeric",
        "prompt": "",
        "status": "Enabled",
        "allowMissingValues": false,
        "displayDataValues": true,
        "falseValue": "",
        "trueValue": "",
        "dataField": "",
        "formula": "",
        "minValue": "0",
        "maxValue": "100",
        "targetValue": "",
        "softLimitCheckOnMinOrMaxValue": false,
        "overrideMinOrMax": false,
        "autoLogNconMinOrMaxOverride": false,
        "certification": "",
        "ncCode": "",
        "mask": "",
        "unitOfMeasure": "",
        "requiredDataEntries": "0",
        "optionalDataEntries": "1"
      };

      // Insert the new row into the table data
      const newData = [...payloadData?.parameterList];
      newData.splice(firstSelectedRowIndex, 0, newRow); // Insert before the selected row

      // Adjust the stepIds to be sequential
      const adjustedData = newData.map((row, index) => ({
        ...row,
        sequence: (index + 1) * 10, // Sequential stepIds (10, 20, 30, ...)
        key: (index + 1),    // Ensure the key is also updated if needed
        id: (index + 1),    // Ensure the key is also updated if needed
      }));

      setTableData(adjustedData);

      // Update routingStepList in payloadData with adjustedData
      setPayloadData(prevPayloadData => ({
        ...prevPayloadData,
        parameterList: adjustedData,
      }));

      setSelectedRowKeys([]); // Clear selected row keys
    }
  };

  const handleInsertAfter = () => {
    if (selectedRowKeys.length > 0) {
      const firstSelectedRowIndex = selectedRowKeys[0] as number;
      setShowAlert(true);
      // Define the new row with a temporary stepId (it will be adjusted later)
      const newRow = {
        key: Date.now(), // Temporary unique key
        "sequence": 0,
        "parameterName": "",
        "description": "",
        "type": "Numeric",
        "prompt": "",
        "status": "Enabled",
        "allowMissingValues": false,
        "displayDataValues": true,
        "falseValue": "",
        "trueValue": "",
        "dataField": "",
        "formula": "",
        "minValue": "0",
        "maxValue": "100",
        "targetValue": "",
        "softLimitCheckOnMinOrMaxValue": false,
        "overrideMinOrMax": false,
        "autoLogNconMinOrMaxOverride": false,
        "certification": "",
        "ncCode": "",
        "mask": "",
        "unitOfMeasure": "",
        "requiredDataEntries": "0",
        "optionalDataEntries": "1"
      };

      // Insert the new row after the selected row in the table data
      // const newData = [...tableData];
      const newData = [...payloadData?.parameterList];
      newData.splice(+firstSelectedRowIndex + 1, 0, newRow);

      // Adjust the stepIds to be sequential
      const adjustedData = newData.map((row, index) => ({
        ...row,
        sequence: (index + 1) * 10, // Sequential stepIds (10, 20, 30, ...)
        key: (index + 1) * 10,    // Ensure the key is also updated if needed
      }));

      setTableData(adjustedData);

      // Update routingStepList in payloadData with adjustedData
      setPayloadData(prevPayloadData => ({
        ...prevPayloadData,
        parameterList: adjustedData,
      }));

      setSelectedRowKeys([]);
    }
  };




  const handleRemoveSelected = () => {
    if (selectedRowKeys.length > 0) {
      // Convert selected row keys into array of indices
      debugger
      setShowAlert(true);
      // Filter out the rows that have indices matching any in indicesToRemove
      const newParameterList = payloadData?.parameterList
        .filter((_, index) => !selectedRowKeys.includes(index)) // Remove rows with matching indices
        .map((row, index) => ({
          ...row,
          sequence: (index + 1) * 10, // Adjust stepId to match the new order
          key: (index + 1), // Adjust key to match the new order
          id: (index + 1)  // Adjust key to match the new order
        }));

      // Update table data and payloadData with the adjusted step IDs
      setTableData(newParameterList);
      setPayloadData(prevPayloadData => ({
        ...prevPayloadData,
        parameterList: newParameterList
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
      parameterList: []
    }));

    setSelectedRowKeys([]);
  };


  const parameterTableColumns = [
    { title: t('parameterName'), dataIndex: 'parameterName', key: 'parameterName' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
  ];

  const dataFieldTableColumns = [
    { title: t('dataField'), dataIndex: 'dataField', key: 'dataField' },
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
    let oParameterList = [...payloadData?.parameterList];  // Make a shallow copy of the array
    oParameterList[rowIndex] = {
      ...oParameterList[rowIndex],  // Copy the existing object
      status: value                 // Update the stepType value
    };

    // Update the payloadData with the modified oParameterList
    setPayloadData((prevData) => ({
      ...prevData,
      parameterList: oParameterList
    }));


  };


  const renderColumns = (): any => {
    return columns.map((col) => {
      let title: any = t(col.title); // Default title translation

      // Custom title for nextStepId and previousStepId with a red asterisk
      if (col.dataIndex === 'parameterName' || col.dataIndex === 'previousStepId') {
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
              <Option value="Enabled">Enabled</Option>
              <Option value="Disabled">Disabled</Option>
            </Select>
          ),
        };
      }

      return col;
    });
  };

  const modalColumns: ColumnsType<any> = [
    { title: t('sequence'), dataIndex: 'sequence', key: 'sequence' },
    { title: t('parameterName'), dataIndex: 'parameterName', key: 'parameterName' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
    { title: t('status'), dataIndex: 'status', key: 'status' },
    { title: t('details'), dataIndex: 'details', key: 'details' },
  ];

  let stepSchema: any = [
    {
      type: 'number',
      label: 'sequence',
      name: 'sequence',
      placeholder: '',
      required: true,
      width: "70%",
      fieldType: 'Number',
    },
    {
      type: 'select',
      label: 'type',
      name: 'type',
      placeholder: 'Select Type',
      required: true,
      width: "70%",
      defaultValue: "Numeric",
      options: [
        { value: 'Numeric', label: 'Numeric' },
        { value: 'Boolean', label: 'Boolean' },
        { value: 'Formula', label: 'Formula' },
        { value: 'Text', label: 'Text' },
        { value: 'Data Field List', label: 'Data Field List' },
      ],
    },
    {
      type: 'browse',
      label: 'parameterName',
      name: 'parameterName',
      placeholder: '',
      icon: true,
      correspondingVersion: '',
      correspondingDescription: 'description',
      required: true,
      tableColumns: parameterTableColumns,
      tableData: [],
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },
    {
      type: 'browse',
      label: 'description',
      name: 'description',
      placeholder: '',
      required: true,
      width: "70%",
      uppercase: true,
      noSpaces: false,
      noSpecialChars: false,
      disabled: false
    },
    {
      type: 'input',
      label: 'prompt',
      name: 'prompt',
      placeholder: '',
      required: true,
      icon: true,
      correspondingVersion: '',
      correspondingDescription: '',
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },
    {
      type: 'select',
      label: 'status',
      name: 'status',
      placeholder: 'Select Status',
      required: true,
      width: "70%",
      defaultValue: "Enabled",
      options: [
        { value: 'Enabled', label: 'Enabled' },
        { value: 'Disabled', label: 'Disabled' },
      ],
    },

    {
      type: 'switch',
      label: 'allowMissingValues',
      name: 'allowMissingValues',
      required: false,
      width: "70%",
      defaultValue: true,
      customTextOn: 'Yes',
      customTextOff: 'No',
    },
    {
      type: 'switch',
      label: 'displayDataValues',
      name: 'displayDataValues',
      required: false,
      width: "70%",
      defaultValue: true,
      customTextOn: 'Yes',
      customTextOff: 'No',
    },

    {
      type: 'input',
      label: 'falseValue',
      name: 'falseValue',
      placeholder: '',
      required: true,
      icon: true,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    }, {
      type: 'input',
      label: 'trueValue',
      name: 'trueValue',
      placeholder: '',
      required: true,
      icon: true,
      width: "70%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true,
      disabled: false
    },
    {
      type: 'browse',
      label: 'dataField',
      name: 'dataField',
      placeholder: '',
      icon: true,
      required: true,
      tableColumns: dataFieldTableColumns,
      tableData: [],
      width: "70%",
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

        {/* <Button
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
        </Button> */}
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
          bordered
        dataSource={payloadData?.parameterList}
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

      {/* <Table
        columns={renderColumns()}
        dataSource={payloadData?.parameterList}
        // rowSelection={{
        //   selectedRowKeys, // Use your state for selected row keys
        //   onChange: (selectedRowKeys) => {
        //     setSelectedRowKeys(selectedRowKeys);
        //   },
        // }}
        pagination={false}
        scroll={{ y: 380 }}
        onRow={(record) => ({
          onClick: () => {
            // Handle row click
            setRowSelectedData(record); // Update selected row data
            setSelectedRowKeys([record.key]); // Update selected row keys
            setIsModalVisible(true); // Show modal or perform any other action
          },
        })}
      /> */}

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
              dataSource={payloadData?.parameterList}
              pagination={false}
              scroll={{ y: 'calc(100vh - 450px)' }}
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
                },
              })}
            />


            <div style={{ width: '50%', maxHeight: "50vh", }}>
              <RoutingStepForm schema={stepSchema} rowSelectedData={rowSelectedData} />
            </div>
          </div>
        </div>






      </Modal>
    </div>
  );
};

export default DynamicTableBuilder;
