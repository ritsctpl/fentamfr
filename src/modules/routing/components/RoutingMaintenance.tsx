"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/RoutingMaintenance.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Form, Input, Modal, Select, Table, Tabs, message, notification } from "antd";
import { fetchTop50Routing, updateRouting } from "@services/routingServices";
import RoutingBodyContent from "./RoutingBodyContent";
import RoutingCommonBar from "./RoutingCommonBar";
import { createRouting, retrieveAllRouting, retrieveCustomDataList, retrieveRouting } from "@services/routingServices";
import { Option } from "antd/es/mentions";
import { RoutingContext } from "../hooks/routingContext";
import RoutingStepForm from "./RoutingStepForm";
import dayjs from 'dayjs';
import TabPane from "antd/es/tabs/TabPane";


// import DataFormat from "@/utils/dataFormat";

interface DataRow {
  [key: string]: string;
}

interface DecodedToken {
  preferred_username: string;
}

interface CustomDataRow {
  customData: string;
  value: any;
}

interface RoutingStep {
  stepId: string;
  stepType: string;
  operation?: string;
  operationVersion?: string;
  routing?: string;
  routingVersion?: string;
  stepDescription?: string;
  routingBO?: string;
  [key: string]: any; // to allow additional keys
}

interface RoutingData {
  site: string;
  routing: string;
  version: string;
  routingStepList: RoutingStep[];
}


const RoutingMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [form] = Form.useForm();
  const [top50Data, setTop50Data] = useState<DataRow[]>([]);
  const [rowData, setRowData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isNextPage, setIsNextPage] = useState<boolean>(false);
  const [isStepModalVisible, setIsStepModalVisible] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<DataRow | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [resetValueCall, setResetValueCall] = useState<number>(0);
  const [rowClickCall, setRowClickCall] = useState<number>(0);
  const [customDataForCreate, setCustomDataForCreate] = useState<
    CustomDataRow[]
  >([]);

  const [formattedData, setFormattedData] = useState<{ [key: string]: any }[]>([]);
  const [customDataOnRowSelect, setCustomDataOnRowSelect] = useState<
    any[]
  >([]);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [bomList, setBomList] = useState<DataRow[]>([]);
  const [documentList, setDocumentList] = useState<DataRow[]>([]);
  const [formSchema, setFormSchema] = useState<any>();
  const [payloadData, setPayloadData] = useState<any>();
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rowSelectedData, setRowSelectedData] = useState<any | null>(null);
  const [tableData, setTableData] = useState([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [insertClick, setInsertClick] = useState<number>(0);
  const [insertClickBoolean, setInsertClickBoolean] = useState<boolean>(false);
  const [isRowSelected, setIsRowSelected] = useState<boolean>(false);
  const [isOperationRowSelected, setIsOperationRowSelected] = useState<boolean>(false);
  const [isStepRowClicked, setIsStepRowClicked] = useState<number>(0);
  let oCustomDataList;

  useEffect(() => {
    const fetchItemData = async () => {
      // // debugger;
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
          // console.log("user name: ", username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }


      setTimeout(async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        try {
          const item = await fetchTop50Routing(site);
          // console.log("Top 50 routings: ", item);
          setTop50Data(item);
          setFilteredData(item); // Initialize filtered data
        } catch (error) {
          console.error("Error fetching top 50 routing:", error);
        }
    }, 1000);
     

    };

    fetchItemData();
  }, [isAuthenticated, username, call]);


  useEffect(() => {
    const element: any = document.querySelector('.MuiBox-root.css-19midj6');
    if (element) {
      element.style.padding = '0px';
    }
  }, []);

 

  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site; // You can replace this with cookies.site if needed
    const userId = username;

    try {
      // Fetch the item list and wait for it to complete
      const oAllItem = await retrieveAllRouting(site, searchTerm);

      // Once the item list is fetched, filter the data
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = oAllItem.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = top50Data; // If no search term, show all items
      }

      // Update the filtered data state
      setFilteredData(filtered);

      // // console.log("Filtered items: ", filtered);
    } catch (error) {
      console.error('Error fetching routing on search:', error);
    }
  };

  const handleAddClick = () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsModalVisible(true)
    // setIsAdding(true);
    setIsAdding(false);
    //setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setShowAlert(false);


    const fetchCustomDataList = async () => {
      // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      // console.log("cookies: ", cookies);
      const site = cookies.site;

      try {
        const category = "Routing";
        const userId = username;
        oCustomDataList = await retrieveCustomDataList(site, category, userId); // Assuming retrieve document is an API call or a data fetch function
        if (!oCustomDataList.errorCode) {
          const transformedCustomDataList = oCustomDataList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: uuidv4(),
              value: ""
            })
          );

          // console.log("Custom Data list: ", transformedCustomDataList);
          setCustomDataOnRowSelect(transformedCustomDataList);
          // setPayloadData(transformedCustomDataList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCustomDataList(); // Call the renamed function
    form.setFieldsValue({
      routing: "",
      version: "",
      description: "",
      routingType: "Master",  // Default value
      status: "New",          // Default value
      currentVersion: false  // Default value for checkbox
    });
    setShowAlert(false)
    // form.resetFields();
  };

  const { t } = useTranslation();


  const handleRowSelect = (row: DataRow) => {
    //setRowClickCall(rowClickCall + 1);
    //setSelectedRowData(row);
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);
    // // debugger
    const fetchRoutingData = async () => {
      // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;
      const routing = row.routing;
      const version = row.version;

     

      try {
        const oRoutingResponse = await retrieveRouting(site, routing, version);
        // console.log("Retrieved Routing: ", oRoutingResponse);

        if (!oRoutingResponse.errorCode) {
          let combinedCustomDataList = oRoutingResponse.customDataList.map((data, index) => ({
            ...data,
            key: index,
            id: uuidv4(),
          }));

          try {
            const category = "Routing";
            const userId = username;
            const oCustomDataList = await retrieveCustomDataList(site, category, userId);

            if (!oCustomDataList.errorCode) {
              const transformedCustomDataTemplate = oCustomDataList.map(data => ({
                ...data,
                key: uuidv4(),
                id: uuidv4(),
                value: ""
              }));

              // Add non-matching items from transformedCustomDataTemplate to combinedCustomDataList
              transformedCustomDataTemplate.forEach(templateData => {
                const isMatching = combinedCustomDataList.some(
                  itemData => itemData.customData == templateData.customData
                );
                if (!isMatching) {
                  combinedCustomDataList.push({
                    ...templateData,
                    key: combinedCustomDataList.length,
                  });
                }
              });
            }
          } catch (error) {
            console.error("Error fetching custom data list:", error);
            // If there's an error, we'll use only the data from the first API
          }

          const transformedRoutingStepList = oRoutingResponse.routingStepList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: index,
            })
          );

          const updatedRouting = {
            ...oRoutingResponse,
            customDataList: combinedCustomDataList,
            routingStepList: transformedRoutingStepList,
          };

          // console.log("Combined Custom Data list: ", combinedCustomDataList);

          setSelectedRowData(updatedRouting);
          setCustomDataOnRowSelect(combinedCustomDataList);
          setRowData(updatedRouting);
          setPayloadData(updatedRouting);
        }
      } catch (error) {
        console.error("Error retrieving routing:", error);
      }
    };

    if (showAlert == true && isAdding == true) {

      Modal.confirm({
        title: t('confirm'),
        content: t('rowSelectionMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk: async () => {
          // Proceed with the API call if confirmed
          await fetchRoutingData();
          setShowAlert(false);
        },
        onCancel() {
          // console.log('Action canceled');
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchRoutingData();

    }
    setIsAdding(true);

  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };



  const bomTableColumns = [
    { title: t('bom'), dataIndex: 'bom', key: 'bom' },
    { title: t('version'), dataIndex: 'revision', key: 'revision' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
  ];

  const documentTableColumns = [
    { title: t('document'), dataIndex: 'document', key: 'document' },
    { title: t('version'), dataIndex: 'version', key: 'version' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
    // { title: 'Current Version', dataIndex: 'currentVersion', key: 'currentVersion' },
  ];

  const routingTableColumns = [
    { title: t('routing'), dataIndex: 'routing', key: 'routing' },
    { title: t('version'), dataIndex: 'version', key: 'version' },
    { title: t('description'), dataIndex: 'description', key: 'description' }
  ]

  const operationTableColumns = [
    { title: t('operation'), dataIndex: 'operation', key: 'operation' },
    { title: t('revision'), dataIndex: 'revision', key: 'revision' },
    { title: t('description'), dataIndex: 'description', key: 'description' }
  ]

  const workCenterTableColumns = [
    { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter' },
    { title: t('description'), dataIndex: 'description', key: 'description' }
  ]



  let schema: any = [
    {
      type: 'select',
      label: 'routingType',
      name: 'routingType',
      placeholder: '',
      required: false,
      width: "50%",
      defaultValue: "Master",
      options: [
        { value: 'Master', label: 'Master' },
        { value: 'ShopOrder Specific', label: 'ShopOrder Specific' },
        { value: 'PCU SPecific', label: 'PCU SPecific' },
        { value: 'NC Routing', label: 'NC Routing' },
      ],
    },
    {
      type: 'input',
      label: 'version',
      name: 'version',
      placeholder: '',
      required: false,
      width: "50%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'input',
      label: 'description',
      name: 'description',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'select',
      label: 'status',
      name: 'status',
      placeholder: '',
      required: false,
      defaultValue: "New",
      width: "50%",
      options: [
        { value: 'Releasable', label: 'Releasable' },
        { value: 'New', label: 'New' },
        { value: 'Hold', label: 'Hold' },
        { value: 'Hold Consec NC', label: 'Hold Consec NC' },
        { value: 'Hold SPC Viol', label: 'Hold SPC Viol' },
        { value: 'Hold SPC warn', label: 'Hold SPC warn' },
        { value: 'Hold Yield Rate', label: 'Hold Yield Rate' },
        { value: 'Frozen', label: 'Frozen' },
        { value: 'Obsolete', label: 'Obsolete' },

      ],
    },
    {
      type: 'select',
      label: 'subType',
      name: 'subType',
      placeholder: '',
      required: true,
      width: "50%",
      defaultValue: "Sequential",
      options: [
        { value: 'Sequential', label: 'Sequential' },
        { value: 'Simultaneous', label: 'Simultaneous' },
        { value: 'AnyOrder', label: 'AnyOrder' },
      ],
    },
    {
      type: 'browse',
      label: 'document',
      name: 'document',
      placeholder: '',
      icon: true,
      correspondingVersion: '',
      required: false,
      tableColumns: documentTableColumns,
      tableData: documentList,
      width: "50%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'input',
      label: 'dispositionGroup',
      name: 'dispositionGroup',
      placeholder: '',
      icon: false,
      correspondingVersion: '',
      required: false,
      tableColumns: bomTableColumns,
      tableData: bomList,
      width: "50%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'browse',
      label: 'bom',
      name: 'bom',
      placeholder: 'Select BOM',
      icon: true,
      correspondingVersion: 'bomVersion',
      required: false,
      tableColumns: bomTableColumns,
      tableData: bomList,
      width: "50%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'browse',
      label: 'revision',
      name: 'bomVersion',
      placeholder: 'Select BOM Version',
      required: false,
      width: "50%",
      uppercase: true,
      noSpaces: true,
      noSpecialChars: true
    },
    {
      type: 'switch',
      label: 'relaxedRoutingFlow',
      name: 'relaxedRoutingFlow',
      placeholder: '',
      required: false,

      width: "50%",
    }, {
      type: 'switch',
      label: 'replicationToErp',
      name: 'replicationToErp',
      placeholder: '',
      required: false,

      width: "50%",
    }, {
      type: 'switch',
      label: 'currentVersion',
      name: 'currentVersion',
      placeholder: '',
      required: false,

      width: "50%",
    },

  ];

  let stepSchema = [
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
      disabled: false,
      defaultValue: "123"
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
      tableColumns: operationTableColumns,
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
      tableColumns: workCenterTableColumns,
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
      tableColumns: workCenterTableColumns,
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



  const appendAdditionalKeys = (form: any) => {
    // Get the current form values
    const formValues = form.getFieldsValue();
    const cookies = parseCookies();
    // Define additional keys and values
    const additionalData = {
      relaxedRoutingFlow: false,
      subType: "Sequential",
      document: '',
      dispositionGroup: '',
      bom: '',
      bomVersion: '',
      replicationToErp: false,
      isParentRoute: false,
      routingStepList: [],
      customDataList: customDataOnRowSelect || [],
      createdDateTime: '',
      updatedDateTime: '',
      createdBy: '',
      modifiedBy: '',
      userId: username,
      site: cookies.site
    };

    // Merge form values with additional data
    const updatedValues = { ...formValues, ...additionalData };

    return updatedValues;
  };



  // // console.log("Retrieve all bom: ", bomList);

  // // console.log("Schema: ", schema)

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOk = async () => {
    // // console.log("Routing creation json: ", form.getFieldsValue());
    const updatedValues = appendAdditionalKeys(form);
    // console.log("Routing creation json: ", updatedValues);
    try {
      const createResponse = await createRouting(updatedValues);
      // console.log("Create routing response: ", createResponse);
      if (!createResponse.errorCode) {
        message.success(createResponse.message_details.msg)
        setCall(call + 1);
        setPayloadData(createResponse.response);




        // setPayloadData(customDataOnRowSelect);
      }
      else {
        message.error(createResponse.message);
      }

    } catch (error) {
      console.error("Error creating routing:", error);
    }
    setIsModalVisible(false);

  };

  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = (values: any) => {
    // console.log('Form Values:', values);
    handleOk();
  };



  const handleInputChange = (fieldName: string, value: string) => {
    // // debugger
    form.setFieldsValue({ [fieldName]: value });
  };

  // console.log("Payload data: ", payloadData);
  const modalColumns: any = [
    { title: t('stepId'), dataIndex: 'stepId', key: 'stepId' },
    { title: t('stepType'), dataIndex: 'stepType', key: 'stepType' },
    { title: t('stepDescription'), dataIndex: 'stepDescription', key: 'stepDescription' },
    { title: t('previousStepId'), dataIndex: 'previousStepId', key: 'previousStepId' },
    { title: t('nextStepId'), dataIndex: 'nextStepId', key: 'nextStepId' },
  ];

  const handleAdd = () => {
    setIsRowSelected(false);
    setInsertClickBoolean(true);
    handleInsert();
    // debugger;
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

  const handleInsert = () => {
    // Determine the new stepId based on the current number of rows
    // const newStepId = (tableData.length + 1) * 10;
    const newStepId = ((payloadData.routingStepList.length + 1) * 10).toString();
    setShowAlert(true);
    // Define the new row with the dynamically generated stepId
    const newRow = {
      key: newStepId,
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

    // Add the new row to the existing table data
    // const newData = [...tableData, newRow];
    const newData = [...payloadData.routingStepList, newRow];
    setTableData(adjustStepIds(newData));

    // Update the payloadData with the new row
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      routingStepList: [...prevPayloadData.routingStepList, newRow]
    }));
    setIsNextPage(true);
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

 

  const handleSave = (oEvent) => {
    debugger;
    let flagToSave = true;
    const updatedRowData = {
      ...payloadData,
      userId: username,
      routerDetails: []
    };

    if (payloadData.routingStepList.length == 0) {
      message.error("No routing steps");
      return;
    }

    const getRequiredFields = (fields: any, fieldNames: string[]): any => {
      return fields.filter(field => fieldNames.includes(field.name));
    };

    const requiredFieldNames = ['operation', 'operationVersion', 'routing', 'routingVersion'];

    const requiredFields = getRequiredFields(formSchema, requiredFieldNames);

    // console.log(requiredFields);

    debugger
    // console.log("Request:", updatedRowData);




    const updateRoutingStepList = (updatedRowData: RoutingData): RoutingData => {
      const { site, routing, version, routingStepList } = updatedRowData;

      const updatedList = routingStepList.map(step => {
        if (step.stepType == "Routing") {
          const routingValue = step.routing || "";
          const routingVersionValue = step.routingVersion || "";
          if (step.routing) {
            return {
              ...step,
              routingBO: `RoutingBo:${site},${routingValue},${routingVersionValue}`,
              routerDetails: []
            };
          }
        }
        return step;
      });

      // This line replaces the routingStepList with the updatedList
      return {
        ...updatedRowData,
        routingStepList: updatedList,
      };
    };


    const updatedData: any = updateRoutingStepList(updatedRowData);
    console.log("Formatted routing steplist(updatedData): ", updatedData);
    console.log("payload data request: ", payloadData)

    updatedData.routingStepList.forEach((step, index) => {

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
        debugger

        // if(!step.routingBO){
        //   message.error({
        //     content: `Routing Step ${(index + 1) * 10}: Routing and Routing Version cannot be empty:`,
        //     duration: 3 // The message will close after 3 seconds
        //   });
        //   flagToSave = false;
        //   return
        // }

        if (step.routing) {
          if (step?.routing == undefined || step?.routing == "" || step?.routing == null) {
            message.error({
              content: `Routing Step ${(index + 1) * 10}: Routing cannot be empty:`,
              duration: 3 // The message will close after 3 seconds
            });
            flagToSave = false;
            return
          }
        }



        if (step.routingBO) {
          if (step.routingBO.split(",")[1] == undefined || step.routingBO.split(",")[1] == "" || step.routingBO.split(",")[1] == null) {
            message.error({
              content: `Routing Step ${(index + 1) * 10}: Routing cannot be empty:`,
              duration: 3 // The message will close after 3 seconds
            });
            flagToSave = false;
            return
          }
        }
        else {
          message.error({
            content: `Routing Step ${(index + 1) * 10}: Routing cannot be empty:`,
            duration: 3 // The message will close after 3 seconds
          });
          flagToSave = false;
          return
        }
      }

      if (requiredFields[3].disabled == false && step.stepType == "Routing") {
        if (step.routingBO) {
          if (step.routingBO.split(",")[2] == undefined || step.routingBO.split(",")[2] == "" || step.routingBO.split(",")[2] == null) {
            message.error({
              content: `Routing Step ${(index + 1) * 10}: Routing Version cannot be empty:`,
              duration: 3 // The message will close after 3 seconds
            });
            flagToSave = false;
            return
          }
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
      let finalReq = updatedData;
      // if (finalReq.updatedData)
      //   finalReq = finalReq.updatedData
      console.log("Request:", finalReq);
      finalReq.userId = username || finalReq.createdBy
      console.log("Final req: ", finalReq);



      try {
        if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
          setTimeout(async function () {
            const updateResponse = await updateRouting(finalReq);
            console.log("Updated routing response: ", updateResponse);
            if (updateResponse) {
              if (updateResponse.errorCode) {
                if (updateResponse.message)
                  message.error(updateResponse?.message);

                if (updateResponse.message_details) {
                  if (updateResponse.message_details.msg)
                    message.error(updateResponse?.message_details.msg);
                }
              }
              else {
                if (updateResponse.message_details) {
                  if (updateResponse.message_details.msg)
                    message.success(updateResponse?.message_details.msg);
                }
                // debugger
                const formattedCustomData = updateResponse.response?.customDataList.map((item, index) => ({
                  ...item,
                  id: index,
                  key: index
                }));

                if (insertClickBoolean) {
                  // handleInsert();
                  // setInsertClick(insertClick + 1);
                  // const routingStepListLength = ((payloadData.routingStepList.length + 1) * 10).toString();
                  // console.log("Step length: ", routingStepListLength);
                  // setSelectedRowKeys([routingStepListLength]);
                }
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

  const setToRetrieve = () => {
    const fetchRoutingData = async () => {
      // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;
      const routing = payloadData.routing;
      const version = payloadData.version;

      try {
        const oRoutingResponse = await retrieveRouting(site, routing, version); // Fetch the item data
        // console.log("Retrieved Routing: ", oRoutingResponse);

        if (!oRoutingResponse.errorCode) {
          // Transform customDataList to include index and id
          const transformedCustomDataList = oRoutingResponse.customDataList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: uuidv4(),
            })
          );
          const transformedRoutingStepList = oRoutingResponse.routingStepList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: index,
            })
          );
          oRoutingResponse.customDataList = transformedCustomDataList;
          oRoutingResponse.routingStepList = transformedRoutingStepList;
          setSelectedRowData(oRoutingResponse);
          setCustomDataOnRowSelect(transformedCustomDataList);
          setRowData(oRoutingResponse);
          setPayloadData(oRoutingResponse)
          setActiveTab(1);
        }
      } catch (error) {
        console.error("Error retrieving routing:", error);
      }
    };

    fetchRoutingData();
  }

  const handleModalCancel = async () => {
    setIsStepModalVisible(true);
    setInsertClickBoolean(false);
    await setToRetrieve();
    setTimeout(() => {
      setActiveTab(1);
    }, 1000);
    setSelectedRowKeys([]);
  };




  return (

    <RoutingContext.Provider value={{
      isRowSelected, setIsRowSelected, isOperationRowSelected, setIsOperationRowSelected,
      insertClickBoolean, setInsertClickBoolean,
      insertClick, setInsertClick, activeTab, setActiveTab, tableData, setTableData, rowSelectedData, setRowSelectedData,
      selectedRowKeys, setSelectedRowKeys, isStepModalVisible, setIsStepModalVisible, fullScreen, setFullScreen, isNextPage,
      setIsNextPage, payloadData, setPayloadData, username, schema, formSchema, setFormSchema, stepSchema, showAlert, setShowAlert, isAdding,
      isStepRowClicked, setIsStepRowClicked
    }}>

      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("routingTitle")} onSiteChange={function (newSite: string): void {
              setCall(call + 1);
            }} />
        </div>
        {isStepModalVisible && <div className={styles.dataFieldBopayloadDatady}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <RoutingCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("router")} ({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton
                  onClick={handleAddClick}
                  className={styles.circlepayloadDataButton}
                >
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
            </div>
            <div
              className={`${styles.formContainer} ${isAdding
                ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show
                }`
                : ""
                }`}
            >
              <RoutingBodyContent
                call={call}
                setCall={setCall}
                resetValueCall={resetValueCall}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                resetValue={resetValue}
                oCustomDataList={oCustomDataList}
                isAdding={isAdding}
                customDataForCreate={customDataForCreate}
                customDataOnRowSelect={customDataOnRowSelect}
                rowClickCall={rowClickCall}
                setFullScreen={setFullScreen}
                username={username}
                setCustomDataOnRowSelect={setCustomDataOnRowSelect}
                addClick={addClick}

                schema={schema}
                payloadData={payloadData}
                setPayloadData={setPayloadData} setIsAdding={function (boolean: any): void {
                  throw new Error("Function not implemented.");
                }} setResetValueCall={function (): void {
                  throw new Error("Function not implemented.");
                }} itemData={[]} itemRowData={[]} availableDocuments={[]} assignedDocuments={[]} availableDocumentForCreate={[]} fullScreen={false} updatedRowData={undefined}
              />

            </div>

            <Modal style={{ marginTop: "-65px" }} title={t("createRouting")} open={isModalVisible} onCancel={handleCancel} footer={null}>
              <Form style={{ marginTop: "35px" }} layout="vertical" form={form} onFinish={handleFormSubmit} labelCol={{ span: 7 }}
                wrapperCol={{ span: 24 }}>
                <Form.Item
                  label={t("router")}
                  name="routing"
                  rules={[{ required: true, message: 'Routing is required' }]}
                  initialValue=""
                >
                  <Input
                    placeholder="Enter Routing"

                    onChange={(e) =>
                      handleInputChange('routing', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={t("version")}
                  name="version"
                  rules={[{ required: true, message: 'Version is required' }]}
                  initialValue=""
                >
                  <Input
                    placeholder="Enter Version"

                    onChange={(e) =>
                      handleInputChange('version', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                    }
                  />
                </Form.Item>




                <Form.Item label={t("routingDescription")} name="description">
                  <Input placeholder="Enter Routing Description" />
                </Form.Item>

                <Form.Item
                  label={t("routingType")}
                  name="routingType"
                  initialValue="Master"
                >
                  <Select>
                    <Option value="Master">Master</Option>
                    <Option value="Shop Order Specific">Shop Order Specific</Option>
                    <Option value="PCU Specific">PCU Specific</Option>
                    <Option value="NC Routing">NC Routing</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t("status")}
                  name="status"
                  initialValue="New"
                >
                  <Select>
                    <Select.Option value="Releasable">Releasable</Select.Option>
                    <Select.Option value="New">New</Select.Option>
                    <Select.Option value="Hold">Hold</Select.Option>
                    <Select.Option value="Hold Consec NC">Hold Consec NC</Select.Option>
                    <Select.Option value="Hold SPC Viol">Hold SPC Viol</Select.Option>
                    <Select.Option value="Hold SPC Warn">Hold SPC Warn</Select.Option>
                    <Select.Option value="Hold Yield Rate">Hold Yield Rate</Select.Option>
                    <Select.Option value="Frozen">Frozen</Select.Option>
                    <Select.Option value="Obsolete">Obsolete</Select.Option>

                  </Select>
                </Form.Item>

                <Form.Item name="currentVersion" label={t("currentVersion")} valuePropName="checked">
                  <Checkbox></Checkbox>
                </Form.Item>

                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" htmlType="submit">
                      {t("add")}
                    </Button>
                    <Button style={{ marginLeft: '10px' }} onClick={handleCancel}>
                      {t("cancel")}
                    </Button>
                  </div>
                </Form.Item>

              </Form>
            </Modal>


          </div>
        </div>}
      </div>

      {!isStepModalVisible &&

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', marginTop: '0%', marginLeft: '1.5%', overflow: 'hidden' }}>


          <div className={styles.split}>
            <div>
              <p className={styles.headingtext}>
                {payloadData?.routing}
              </p>
              {payloadData?.createdDateTime && (
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div>
                    <p className={styles.dateText}>
                      {t('version')} :
                      <span className={styles.fadedText}>{payloadData?.version || ''}</span>
                    </p>

                    <p className={styles.dateText}>
                      {t('description')} :
                      <span className={styles.fadedText}>{payloadData?.description || ''}</span>
                    </p>

                    <p className={styles.dateText}>
                      {t('createdOn')} :
                      <span className={styles.fadedText}>
                        {dayjs(payloadData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss') || ''}
                      </span>
                    </p>

                    <p className={styles.dateText}>
                      {t('subType')} :
                      <span className={styles.fadedText}>{payloadData?.subType || ''}</span>
                    </p>

                  </div>
                  <div>
                    <p className={styles.dateText}>
                      {t('currentVersion')} :
                      <span className={styles.fadedText}>
                        {payloadData?.currentVersion ? payloadData.currentVersion.toString() : 'false'}
                      </span>
                    </p>

                    <p className={styles.dateText}>
                      {t('status')} :
                      <span className={styles.fadedText}>
                        <span className={styles.fadedText}>{payloadData?.status || ''}</span>
                      </span>
                    </p>

                    <p className={styles.dateText}>
                      {t('modifiedOn')} :
                      <span className={styles.fadedText}>
                        {dayjs(payloadData?.updatedDateTime).format('DD-MM-YYYY HH:mm:ss') || ''}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>


          </div>



          {/* <div style={{ marginBottom: '10px', marginRight: '41%', marginTop: '-1%', }}>
            <button
              className={`${styles.floatingButton} ${styles.saveButton}`}
              onClick={handleAdd}
              style={{ alignSelf: 'flex-end', float: 'right', marginRight: '18%' }}
            >
              {t("add")}
            </button>
          </div> */}

          <div style={{
             display: 'flex',
             justifyContent: 'center', 
             marginBottom: '10px',
              // marginRight: '41%', 
              marginTop: '-1%' }}>
            <button
              className={`${styles.floatingButton} ${styles.saveButton}`}
              onClick={handleAdd}
              // style={{ marginRight: '7%' }}
            >
              {t("add")}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', height: '100%', marginRight: '0%' }}>
            <Table
              columns={modalColumns}
              bordered
              dataSource={payloadData.routingStepList}
              // pagination={{pageSize: 5}}
              pagination={false}
              scroll={{ y: "60vh" }}
              style={{ flex: 1, marginRight: '20px', maxWidth: '55%'}}
              rowSelection={{
                type: 'radio', // Single row selection
                selectedRowKeys: selectedRowKeys, // Controlled selection state
                onChange: (selectedRowKeys, selectedRows) => {
                  debugger
                  setSelectedRowKeys(selectedRowKeys); // Update selected row keys
                  setRowSelectedData(selectedRows[0]); // Update form data with selected row
                  setIsRowSelected(true);
                  setInsertClickBoolean(false);
                  // setToRetrieve();
                },
              }}
              onRow={(record) => ({
                onClick: () => {
                  debugger
                  setSelectedRowKeys([record.key]); // Manually trigger row selection
                  setRowSelectedData(record); // Update form data with selected row
                  setIsStepRowClicked(isStepRowClicked + 1);
                  const rowId = record.stepId;
                  if (record.stepType.toLowerCase() == "operation") {
                    setIsOperationRowSelected(true);
                  }
                  else {
                    setIsOperationRowSelected(false);
                  }
                  const getStepTypeById = (stepId: string | number): string | undefined => {
                    const step = payloadData.routingStepList.find(step => step.stepId == stepId);
                    return step ? step.stepType : undefined;
                  };

                  const updatedSchema = stepSchema.map(field => {
                    if (field.name == 'routing' || field.name == 'routingVersion') {
                      const stepType = getStepTypeById(rowId);
                      const isOperation = stepType == 'Operation';

                      return {
                        ...field,
                        required: !isOperation,
                        disabled: isOperation,
                      };
                    } else if (field.name == 'operation' || field.name == 'operationVersion') {
                      const stepType = getStepTypeById(rowId);
                      const isOperation = stepType == 'Operation';

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
                  console.log("Split routing step data: ", updatedData)
                  setPayloadData((prevData) => ({
                    ...prevData,
                    updatedData
                  }));
                  setPayloadData(updatedData)
                  let rowIndex = +record.stepId;
                  rowIndex = (rowIndex / 10) - 1;
                  // setRowSelectedData(updatedData.routingStepList[rowIndex]);
                  setRowSelectedData(updatedData.routingStepList[rowIndex]);
                  console.log("payloadData check: ", payloadData)
                },
              })}
            />



            <div style={{ width: '30%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
               marginTop: '-10%' 
               }}>
              {/* Text Heading above the Tabs */}
              <div style={{
                //  marginBottom: '0px', marginTop: "auto" 
                 }}>
                <h3>{t('routingStepDetails')}</h3>
              </div>

              {/* Tabs */}
              <Tabs defaultActiveKey="1">
                {/* First Tab for Routing Step Form */}
                <TabPane tab={t('main')} key="1">
                  <RoutingStepForm schema={stepSchema} rowSelectedData={rowSelectedData} />
                </TabPane>
              </Tabs>

              {/* Button container for Save and Cancel */}
              {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-7%', marginRight: '5%' }}>
                <Button
                  type="primary"
                  onClick={handleSave}
                  style={{ marginRight: '8px' }}
                >
                  {t("save")}
                </Button>
                <Button
                  className="cancelButton" // Assuming you have a cancelButton style
                  onClick={handleModalCancel}
                >
                  {t("cancel")}
                </Button>
              </div> */}

              <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <Button
                  type="primary"
                  onClick={handleSave}
                  style={{  width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {t("save")}
                </Button>
                <Button
                  className="cancelButton" // Assuming you have a cancelButton style
                  onClick={handleModalCancel}
                  style={{  width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {t("cancel")}
                </Button>
              </div>

            </div>


          </div>
        </div>}

    </RoutingContext.Provider>
  );
};

export default RoutingMaintenance;
