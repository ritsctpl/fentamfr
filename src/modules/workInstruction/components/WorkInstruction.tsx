"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/WorkInstructionMaintenance.module.css";
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
import { Button, Checkbox, Form, Input, Modal, Select, Switch, Table, Tabs, Upload, message, notification } from "antd";

import { createDataCollection, fetchTop50DataCollection, retrieveAllDataCollection, retrieveDataCollection, updateDataCollection, updateRouting } from "@services/dataCollectionServices";
import { createRouting, retrieveCustomDataList } from "@services/dataCollectionServices";
import { Option } from "antd/es/mentions";
import ParameterForm from "./ParameterForm";
import dayjs from 'dayjs';
import TabPane from "antd/es/tabs/TabPane";
import AttachmentForm from "./AttachmentForm";
import WorkInstructionBodyContent from "./WorkInstructionBodyContent";
import { WorkInstructionContext } from "../hooks/WorkInstructionContext";
import WorkInstructionCommonBar from "./WorkInstructionCommonBar";
import { createWorkInstruction, fetchWorkInstructionTop50, retrieveAllWorkInstructionGroup, RetriveWorkInstructionRow, UpdateWorkInstruction } from "@services/workInstructionService";
import { Update } from "@mui/icons-material";
import { fontFamily } from "html2canvas/dist/types/css/property-descriptors/font-family";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import mammoth from 'mammoth';


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

const instructionOptions = [
  { value: 'text', label: 'Text' },
  { value: 'url', label: 'Url' },
  { value: 'file', label: 'File' },
];

const WorkInstruction: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [form] = Form.useForm();
  const [top50Data, setTop50Data] = useState<DataRow[]>([]);
  const [rowData, setRowData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isNextPage, setIsNextPage] = useState<boolean>(false);
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
  const [rowSelectedData, setRowSelectedData] = useState<any>(null);

  const [selectedAttachmnetRowKeys, setSelectedAttachmnetRowKeys] = useState([]);
  const [attachmentRowSelectedData, setAttachmentRowSelectedData] = useState<any>(null);
  const [tableData, setTableData] = useState([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [insertClick, setInsertClick] = useState<number>(0);
  const [insertClickBoolean, setInsertClickBoolean] = useState<boolean>(false);
  const [isRowSelected, setIsRowSelected] = useState<boolean>(false);
  const [isOperationRowSelected, setIsOperationRowSelected] = useState<boolean>(false);
  const [isStepRowClicked, setIsStepRowClicked] = useState<number>(0);
  const [isAttachmentVisible, setIsAttachmentVisible] = useState<boolean>(false);
  const [isMainPageVisible, setIsMainPageVisible] = useState<boolean>(true);
  const [isStepModalVisible, setIsStepModalVisible] = useState<boolean>(false);
  const [insertClickBooleanForAttachment, setInsertClickBooleanForAttachment] = useState<boolean>(false);
  const [insertClickForAttachment, setInsertClickForAttachment] = useState<number>(0);
  const [selectedInstructionType, setSelectedInstructionType] = useState<string | undefined>('');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);

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

      const cookies = parseCookies();
      const site = cookies.site;

      try {
        const item = await fetchWorkInstructionTop50(site);
        console.log(item,'items');
        
        setTop50Data(item);
        setFilteredData(item); // Initialize filtered data
      } catch (error) {
        console.error("Error fetching top 50 data Collection:", error);
      }

    };

    fetchItemData();
  }, [isAuthenticated, username, call]);

  useEffect(() => {
    const element: any = document.querySelector('.MuiBox-root.css-19midj6');
    if (element) {
      element.style.padding = '0px';
    }
  }, []);

  const fetchItemList = async () => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      // const reasonCode = await retrieveAllReasonCode(site);
      const reasonCode = await fetchWorkInstructionTop50(site);
      // // console.log("ALL ITEMS: ", reasonCode);
      setTop50Data(reasonCode);
    } catch (error) {
      console.error("Error fetching data fields:", error);
    }
  };


  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site; // You can replace this with cookies.site if needed
    try {
      // Fetch the item list and wait for it to complete
      debugger
      const oAllItem = await retrieveAllWorkInstructionGroup(site);
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
      console.error('Error fetching data Collection on search:', error);
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
    form.setFieldsValue({
      dataCollection: "",
      version: "",
      description: "",
      status: "Releasable",
    })


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
      status: "Releasable",          // Default value
      currentVersion: false  // Default value for checkbox
    });
    setShowAlert(false)
  };

  const { t } = useTranslation();


  const handleRowSelect = (row: DataRow) => {
    // debugger
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);
    const fetchDCData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const payload = {
        site: site,
        userId: cookies.rl_user_id,
        workInstruction: row.workInstruction,
        revision: row.revision,
      }

      try {
        const WiResponse = await RetriveWorkInstructionRow(site, payload);
        console.log("WI retrieve response: ", WiResponse);

        if (!WiResponse.errorCode) {
          let combinedCustomDataList = WiResponse?.customDataList?.map((data, index) => ({
            ...data,
            key: index,
            id: uuidv4(),
          }));

          try {
            const category = "Work Instruction";
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
                const isMatching = combinedCustomDataList?.some(
                  itemData => itemData.customData == templateData.customData
                );
                if (!isMatching) {
                  combinedCustomDataList?.push({
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

          const transformedAttachmentList = WiResponse.attachmentList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: index,
            })
          );

          const attachmentTableList = WiResponse.attachmentList.map((item, index) => {
            const attachments = [];

            // Define the keys to check
            const keys = [
              'itemGroup',
              'item',
              'itemVersion',
              'routing',
              'routingVersion',
              'operation',
              'operationVersion',
              'workCenter',
              'resource',
              'shopOrder',
              'pcu'
            ];

            // Iterate over the keys and push non-null values to the attachments array
            keys.forEach(key => {
              if (item[key]) {
                attachments.push(`${key}:${item[key]}`);
              }
            });

            return {
              sequence: item.sequence,
              attachment: attachments.join(', '), // Join the non-null attachments with a comma
              key: index,
              id: index,
            };
          });

          console.log("Formatted attachmnet list: ", attachmentTableList);
          setPayloadData((prevData) => ({
            ...prevData,
            attachmentTableList: attachmentTableList
          }));

          const updatedDC = {
            ...WiResponse,
            customDataList: combinedCustomDataList,
            attachmentList: transformedAttachmentList,
            attachmentTableList: attachmentTableList
          };

          // console.log("Combined Custom Data list: ", combinedCustomDataList);

          setSelectedRowData(updatedDC);
          setCustomDataOnRowSelect(combinedCustomDataList);
          setRowData(updatedDC);
          setPayloadData(updatedDC);
        }
      } catch (error) {
        console.error("Error retrieving dc:", error);
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
          await fetchDCData();
          setShowAlert(false);
        },
        onCancel() {
          // console.log('Action canceled');
        },
      });
    } else {
      fetchDCData();

    }
    setIsAdding(true);

  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };






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
      label: 'status',
      name: 'status',
      placeholder: '',
      required: false,
      defaultValue: "Releasable",
      width: "50%",
      options: [
        { value: 'Releasable', label: 'Releasable' },
        { value: 'Hold', label: 'Hold' },
        { value: 'Obsolete', label: 'Obsolete' },

      ],
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
      type: 'switch',
      label: 'required',
      name: 'required',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'switch',
      label: 'currentVersion',
      name: 'currentVersion',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'switch',
      label: 'alwaysShowInNewWindow',
      name: 'alwaysShowInNewWindow',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'switch',
      label: 'logViewing',
      name: 'logViewing',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'switch',
      label: 'changeAlert',
      name: 'changeAlert',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'switch',
      label: 'erpWi',
      name: 'erpWi',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'select',
      label: 'instructionType',
      name: 'instructionType',
      placeholder: '',
      required: false,
      defaultValue: "",
      width: "50%",
      options: [
        { value: 'text', label: 'Text' },
        { value: 'url', label: 'Url' },
        { value: 'file', label: 'File' },
      ],
    },
    {
      type: 'input',
      label: 'text',
      name: 'text',
      placeholder: '',
      required: false,
      width: "50%",
      visible: false
    },
    {
      type: 'input',
      label: 'url',
      name: 'url',
      placeholder: '',
      required: false,
      width: "50%",
      visible: false
    },
    {
      type: 'input',
      label: 'file',
      name: 'file',
      placeholder: '',
      required: false,
      width: "50%",
      visible: false
    },
  ];









  let stepSchema = [
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
    const formValues = form.getFieldsValue();
    const cookies = parseCookies();

    const additionalData = {
      ...formValues,
      attachmentList: [],
      customDataList: [],
      site: cookies.site
    };

    const updatedValues = { ...formValues, ...additionalData };
    return updatedValues;
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOk = async () => {
    const updatedValues = appendAdditionalKeys(form);
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    const workInstruction = form.getFieldsValue().workInstruction;
    const revision = form.getFieldsValue().revision;
    const text = form.getFieldsValue().text;
    const instructionType = form.getFieldsValue().instructionType;
    const url = form.getFieldsValue().url;
    const file = form.getFieldsValue().file;
    if (workInstruction == undefined || workInstruction == "" || workInstruction == null) {
      message.error("Work Instruction cannot be empty");
      return;
    }
    if (revision == undefined || revision == "" || revision == null) {
      message.error("Revision cannot be empty");
      return;
    }

    if (instructionType == undefined || instructionType == "" || instructionType == null) {
      message.error("Instruction Type cannot be empty");
      return;
    }

    if (!text && !url && !file) {
      message.error("At least one of Text, URL, or File must be provided");
      return;
    }
    const req = {site, userId, ...updatedValues};
    console.log("WI create request: ", req);

    try {
      console.log("WI create request: ",updatedValues);
      
      const createResponse = await createWorkInstruction(site, userId, updatedValues);
      console.log("WI create response: ", createResponse);
      if (!createResponse.errorCode) {
        message.success(createResponse.message_details.msg)
        setCall(call + 1);
        setPayloadData(createResponse.response);
        form.resetFields();
        setIsModalVisible(false);
        setSelectedInstructionType('')
      }
      else {
        message.error(createResponse.message);
      }

    } catch (error) {
      console.error("Error creating data collection:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = (values: any) => {
    handleOk();
  };

  const handleInputChange = (fieldName: string, value: string) => {
    form.setFieldsValue({ [fieldName]: value });
  };

  const modalColumns: any = [
    { title: t('sequence'), dataIndex: 'sequence', key: 'sequence' },
    { title: t('parameterName'), dataIndex: 'parameterName', key: 'parameterName' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
    { title: t('status'), dataIndex: 'status', key: 'status' },
    // { title: t('details'), dataIndex: 'details', key: 'details' },
  ];

  const handleAdd = () => {
    setIsRowSelected(false);
    setInsertClickBoolean(true);
    handleInsert();
    // debugger;
    setTimeout(() => {
      const parameterListLength = ((payloadData.parameterList.length + 1) * 10).toString();
      // console.log("Step length: ", routingStepListLength);
      setSelectedRowKeys([parameterListLength]);
      setShowAlert(true);
      const keyValue = +parameterListLength / 10;
      const newRowData = {
        "key": keyValue,
        "sequence": parameterListLength,
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
      }
      setRowSelectedData(newRowData);
    }, 0);
  }

  const handleAddForAttachment = () => {
    setIsRowSelected(false);
    setInsertClickBooleanForAttachment(true);
    handleInsertForAttachment();
    // debugger;
    setTimeout(() => {
      const attachmentListLength = ((payloadData.attachmentList.length + 1) * 10).toString();
      // console.log("Step length: ", routingStepListLength);
      setSelectedRowKeys([attachmentListLength]);
      setShowAlert(true);
      const keyValue = +attachmentListLength / 10;
      const newRowData = {
        "key": keyValue,
        "sequence": attachmentListLength,
        "itemGroup": "",
        "item": "",
        "itemVersion": "",
        "routing": "",
        "routingVersion": "",
        "operation": "",
        "operationVersion": "",
        "workCenter": "",
        "resource": "",
        "resourceType": "",
        "customOrder": "",
        "shopOrder": "",
        "pcu": "",
        "bom": "",
        "bomVersion": "",
        "component": "",
        "componentVersion": ""
      }
      setAttachmentRowSelectedData(newRowData);
    }, 0);
  }

  const handleInsertForAttachment = () => {
    // Determine the new stepId based on the current number of rows
    // const newStepId = (tableData.length + 1) * 10;
    const newStepId = (((payloadData.attachmentList.length + 1) * 10).toString());
    setShowAlert(true);
    // Define the new row with the dynamically generated stepId
    const newRow = {
      "key": newStepId,
      "sequence": newStepId,
      "itemGroup": "",
      "item": "",
      "itemVersion": "",
      "routing": "",
      "routingVersion": "",
      "operation": "",
      "operationVersion": "",
      "workCenter": "",
      "resource": "",
      "resourceType": "",
      "customOrder": "",
      "shopOrder": "",
      "pcu": "",
      "bom": "",
      "bomVersion": "",
      "component": "",
      "componentVersion": ""
    };



    // Add the new row to the existing table data
    // const newData = [...tableData, newRow];
    const newData = [...payloadData.attachmentList, newRow];
    // setTableData(adjustStepIds(newData));

    // Update the payloadData with the new row
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      attachmentList: [...prevPayloadData.attachmentList, newRow]
    }));
    setIsNextPage(true);
  };

  const handleInsert = () => {
    // Determine the new stepId based on the current number of rows
    // const newStepId = (tableData.length + 1) * 10;
    const newStepId = ((payloadData.parameterList.length + 1) * 10).toString();
    setShowAlert(true);
    // Define the new row with the dynamically generated stepId
    const newRow = {
      "key": newStepId,
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
    // const newData = [...tableData, newRow];
    const newData = [...payloadData.parameterList, newRow];
    setTableData(adjustStepIds(newData));

    // Update the payloadData with the new row
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      parameterList: [...prevPayloadData.parameterList, newRow]
    }));
    setIsNextPage(true);
  };

  const adjustStepIds = (rows: any) => {
    return rows.map((row, index, array) => {
      const stepId = (index + 1) * 10;
      return {
        ...row,
        stepId,
      };
    });
  };


  const handleSave = (oEvent) => {
    let flagToSave = true, isEmpty = false;
    payloadData.attachmentList.map(item => {
      const otherKeys = [
        'itemGroup', 'item', 'itemVersion', 'routing',
        'routingVersion', 'operation', 'operationVersion',
        'workCenter', 'resource', 'resourceType', 'shopOrder',
        'pcu', 'bom', 'bomVersion', 'component', 'componentVersion'
      ];

      const hasEmptyValue = otherKeys.every(key =>
        item[key] == "" || item[key] == null || item[key] == undefined
      );

      if (hasEmptyValue) {
        flagToSave = false;
        isEmpty = true;
        return;
      }
    })

    if (isEmpty) {
      message.error("Please attach at least one of the attachments");
      return;
    }

    const oCreateDC = async () => { 
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      try {
        if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
          setTimeout(async function () {
            console.log("Update work instruction request: ", payloadData);

            const updateResponse = await UpdateWorkInstruction(site, userId, payloadData);
            console.log("Updated work instruction response: ", updateResponse);
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
                setShowAlert(false);
              }
            }
          }, 0);

        }


      } catch (error) {
        console.error('Error updating data collection:', error);
      }
    };
    if (flagToSave == true)
      oCreateDC();

    // setIsModalVisible(false);

  };

  const setToRetrieve = () => {
    const fetchDCData = async () => {
      // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;

      const payload = {
        site: site,
        userId: cookies.rl_user_id,
        ...payloadData
      }

      try {
        const oDCResponse = await RetriveWorkInstructionRow(site, payload); // Fetch the item data
        console.log("Retrieved WorkInstruction: ", oDCResponse);

        // console.log("Retrieved dc: ", oDCResponse);

        if (!oDCResponse.errorCode) {
          // Transform customDataList to include index and id
          const transformedCustomDataList = oDCResponse.customDataList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: uuidv4(),
            })
          );
          const transformedAttachmentList = oDCResponse.attachmentList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: index,
            })
          );
          const attachmentTableList = oDCResponse.attachmentList.map(item => {
            const attachments = [];

            // Define the keys to check
            const keys = [
              'itemGroup',
              'item',
              'itemVersion',
              'routing',
              'routingVersion',
              'operation',
              'operationVersion',
              'workCenter',
              'resource',
              'resourceType',
              'customOrder',
              'shopOrder',
              'pcu',
              'bom',
              'bomVersion',
              'component',
              'componentVersion'
            ];

            // Iterate over the keys and push non-null values to the attachments array
            keys.forEach(key => {
              if (item[key]) {
                attachments.push(`${key}:${item[key]}`);
              }
            });

            return {
              sequence: item.sequence,
              attachment: attachments.join(', '), // Join the non-null attachments with a comma
              key: (+item.sequence / 10) - 1,
              id: (+item.sequence / 10) - 1
            };
          });
          oDCResponse.customDataList = transformedCustomDataList;
          oDCResponse.attachmentList = transformedAttachmentList;
          oDCResponse.attachmentTableList = attachmentTableList;
          setSelectedRowData(oDCResponse);
          setCustomDataOnRowSelect(transformedCustomDataList);
          setRowData(oDCResponse);
          setPayloadData(oDCResponse)
          //setActiveTab(1);
        }
      } catch (error) {
        console.error("Error retrieving dc:", error);
      }
    };

    fetchDCData();
  }

  const handleModalCancel = async () => {
    setIsStepModalVisible(false);
    setIsAttachmentVisible(false);
    setIsMainPageVisible(true);
    setInsertClickBoolean(false);
    await setToRetrieve();
    setTimeout(() => {
      //setActiveTab(1);
    }, 1000);
    setSelectedRowKeys([]);
  };

  const handleAttachmnetModalCancel = async () => {
    setIsStepModalVisible(false);
    setIsAttachmentVisible(false);
    setIsMainPageVisible(true);
    setInsertClickBoolean(false);
    await setToRetrieve();
    setTimeout(() => {
      // setActiveTab(2);
    }, 0);
    setSelectedAttachmnetRowKeys([]);
  };
  const attachmentColumns = [
    { title: t('sequence'), dataIndex: 'sequence', key: 'sequence', type: 'input', width: '15%' },
    { title: t('attachment'), dataIndex: 'attachment', key: 'attachment', type: 'input' },
    // { title: t('details'), dataIndex: 'details', key: 'details', type: 'button' },
  ];

  const handleInstructionChange = (value: string) => {
    setSelectedInstructionType(value);

    // Reset specific fields when instructionType changes
    form.setFieldsValue({
      url: '',
      text: '',
      file: '',
    });
  };

  const handleFileUpload = async (file: File, key: string) => {
    const reader = new FileReader();
    
    // Handle DOCX files separately
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        
        try {
          // Convert DOCX to HTML
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value);
          
          // Also store the base64 for form submission
          const base64String = await convertToBase64(file);
          const base64WithoutPrefix = base64String.split(',')[1];
          
          form.setFieldsValue({ 
            [key]: base64WithoutPrefix,
            fileName: file.name 
          });
        } catch (error) {
          console.error('Error converting DOCX:', error);
          message.error('Failed to preview DOCX file');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Handle other file types as before
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(',')[1];
        
        const doc = {
          uri: base64String,
          fileType: file.type,
          fileName: file.name
        };
        setPreviewDoc(doc);
        setDocxHtml(null);
        
        form.setFieldsValue({ 
          [key]: base64WithoutPrefix,
          fileName: file.name 
        });
      };
      reader.onerror = () => {
        message.error("Failed to upload file!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to convert File to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  console.log(selectedRowData, 'selectedRowData');

  // Add this CSS somewhere in your component or in a separate CSS file
  const docxPreviewStyles = {
    '.docx-preview': {
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333',
    },
    '.docx-preview h1': {
      fontSize: '24px',
      marginBottom: '16px',
    },
    '.docx-preview p': {
      marginBottom: '12px',
    },
    '.docx-preview table': {
      borderCollapse: 'collapse',
      width: '100%',
      marginBottom: '16px',
    },
    '.docx-preview td, .docx-preview th': {
      border: '1px solid #ddd',
      padding: '8px',
    }
  };

  return (

    <WorkInstructionContext.Provider value={{
      isRowSelected, setIsRowSelected, isOperationRowSelected, setIsOperationRowSelected,
      insertClickBoolean, setInsertClickBoolean,
      insertClick, setInsertClick, activeTab, setActiveTab, tableData, setTableData, rowSelectedData, setRowSelectedData,
      selectedRowKeys, setSelectedRowKeys, isStepModalVisible, setIsStepModalVisible, fullScreen, setFullScreen, isNextPage,
      setIsNextPage, payloadData, setPayloadData, username, schema, formSchema, setFormSchema, stepSchema, showAlert, setShowAlert, isAdding,
      isStepRowClicked, setIsStepRowClicked, selectedAttachmnetRowKeys, setSelectedAttachmnetRowKeys, attachmentRowSelectedData, setAttachmentRowSelectedData,
      isAttachmentVisible, setIsAttachmentVisible, isMainPageVisible, setIsMainPageVisible, insertClickBooleanForAttachment, setInsertClickBooleanForAttachment,
      insertClickForAttachment, setInsertClickForAttachment
    }} >


      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("workInstructionMaintenance")} onSiteChange={function (): void { setCall(call + 1) }} />
        </div>
        {isMainPageVisible && <div className={styles.dataFieldBopayloadDatady}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <WorkInstructionCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("workInstruction")} ({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton
                  onClick={handleAddClick}
                  className={styles.circlepayloadDataButton}
                  style={{ position: 'relative', right: '25px' }}
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
              <WorkInstructionBodyContent
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

            <Modal style={{ marginTop: "-65px" }} title={t("createWorkInstruction")} open={isModalVisible}
              onCancel={handleCancel} onOk={handleFormSubmit} okText={t("add")} cancelText={t('cancel')}>

              <Form style={{ marginTop: "1px", maxHeight: '70vh', overflowY: 'auto' }} layout="vertical" form={form} onFinish={handleFormSubmit} labelCol={{ span: 10 }}
                wrapperCol={{ span: 24 }} >
                <Form.Item
                  label={t("workInstruction")}
                  name="workInstruction"
                  rules={[{ required: true, message: 'Work Instruction is required' }]}
                  initialValue=""
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange('workInstruction', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={t("revision")}
                  name="revision"
                  rules={[{ required: true, message: 'Version is revision' }]}
                  initialValue=""
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange('version', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={t("description")}
                  name="description"
                  required={false}
                  initialValue=""
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={t("status")}
                  name="status"
                  initialValue="Releasable"
                >
                  <Select>
                    <Select.Option value="Releasable">Releasable</Select.Option>
                    <Select.Option value="Hold">Hold</Select.Option>
                    <Select.Option value="Obsolete">Obsolete</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name='required'
                  label={t("required")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name='currentVersion'
                  label={t("currentVersion")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name='alwaysShowInNewWindow'
                  label={t("alwaysShowInNewWindow")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name='logViewing'
                  label={t("logViewing")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name='changeAlert'
                  label={t("changeAlert")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name='erpWi'
                  label={t("erpWi")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name='instructionType'
                  label={t("instructionType")}
                  rules={[{ required: true, message: `Please select Instruction Type` }]}
                >
                  <Select onChange={handleInstructionChange}>
                    {instructionOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedInstructionType === 'url' && (
                  <Form.Item
                    name='url'
                    label={t('url')}
                    rules={[{ required: true, message: `Please input URL` }]}
                  >
                    <Input onChange={(e) => handleInputChange('url', e.target.value)} />
                  </Form.Item>
                )}

                {selectedInstructionType === 'text' && (
                  <Form.Item
                    name='text'
                    label={t('text')}
                    rules={[{ required: true, message: `Please input text` }]}
                  >
                    <Input onChange={(e) => handleInputChange('text', e.target.value)} />
                  </Form.Item>
                )}

                {selectedInstructionType === 'file' && (
                  <>
                    <Form.Item
                      name='file'
                      label={t('file')}
                      rules={[{ required: true, message: `Please upload a file` }]}
                    >
                      <Upload
                        accept="*/*"
                        maxCount={1}
                        beforeUpload={(file) => {
                          const isValidFileType = true;
                          if (!isValidFileType) {
                            message.error('Invalid file type!');
                          }
                          return isValidFileType;
                        }}
                        customRequest={({ file, onSuccess }) => {
                          handleFileUpload(file as File, 'file');
                          onSuccess?.("ok");
                        }}
                      >
                        <button>{t('uploadFile')}</button>
                      </Upload>
                    </Form.Item>

                    {(docxHtml || previewDoc) && (
                      <div style={{ height: '500px', width: '100%', marginBottom: '35px', overflow: 'auto' }}>
                        {docxHtml ? (
                          // DOCX preview
                          <div 
                            style={{ 
                              height: '100%', 
                              overflow: 'auto', 
                              border: '1px solid #d9d9d9',
                              padding: '16px'
                            }}
                            dangerouslySetInnerHTML={{ __html: docxHtml }} 
                          />
                        ) : previewDoc && (
                          // Other file types preview
                          <DocViewer
                            documents={[previewDoc]}
                            pluginRenderers={DocViewerRenderers}
                            config={{
                              header: {
                                disableHeader: false,
                                disableFileName: false,
                                retainURLParams: false
                              }
                            }}
                            style={{ height: 500 }}
                          />
                        )}
                      </div>
                    )}

                    <Form.Item
                      name='fileName'
                      label={t('fileName')}
                      rules={[{ required: true, message: `Please input file name` }]}
                    >
                      <Input onChange={(e) => handleInputChange('fileName', e.target.value)} />
                    </Form.Item>
                  </>
                )}
              </Form>

            </Modal>


          </div>
        </div>}
      </div>

      {isAttachmentVisible &&

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
                      {t('revision')} :
                      <span className={styles.fadedText}>{payloadData?.revision || ''}</span>
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


                  </div>
                  <div>
                    <p className={styles.dateText}>
                      {t('revision')} :
                      <span className={styles.fadedText}>
                        {payloadData?.revision ? payloadData.currentVersion.toString() : 'false'}
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
                        {dayjs(payloadData?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') || ''}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>


          </div>



          <div style={{ marginBottom: '10px', marginRight: '41%', marginTop: '-1%', }}>
            <button
              className={`${styles.floatingButton} ${styles.saveButton}`}
              onClick={handleAddForAttachment}
              style={{ alignSelf: 'flex-end', float: 'right', marginRight: '18%' }}
            >
              {t("add")}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: "100%", marginRight: '0%' }}>
            <Table
              columns={attachmentColumns}
              bordered
              dataSource={payloadData?.attachmentTableList}
              // pagination={{pageSize: 5}}
              pagination={false}
              scroll={{ y: "60vh" }}
              style={{ flex: 1, marginRight: '20px', width: "40%" }}
              // rowSelection={{
              //   type: undefined, // Single row selection
              //   selectedRowKeys: selectedAttachmnetRowKeys, // Controlled selection state
              //   onChange: (selectedAttachmnetRowKeys, selectedRows) => {
              //     debugger
              //     const selectedRow = selectedRows[0] as any; // Cast record to the expected type
              //     const rowIndex = (+selectedRow.sequence / 10) - 1;
              //     const aRowData = payloadData.attachmentList[rowIndex];
              //     setSelectedAttachmnetRowKeys(selectedAttachmnetRowKeys); // Update selected row keys
              //     setAttachmentRowSelectedData(aRowData); // Update form data with selected row
              //     setIsRowSelected(true);
              //     setInsertClickBooleanForAttachment(false);
              //     // setToRetrieve();
              //   },
              // }}
              onRow={(record) => ({
                onClick: () => {
                  const selectedRow = record as any; // Cast record to the expected type
                  const rowIndex = (+selectedRow.sequence / 10) - 1;
                  const aRowData = payloadData.attachmentList[rowIndex];
                  setSelectedAttachmnetRowKeys([selectedRow.key]);

                  setAttachmentRowSelectedData(aRowData); // Update form data with selected row
                  setIsStepRowClicked(isStepRowClicked + 1);
                  // console.log("payloadData check: ", payloadData)
                  // console.log("Row Selected data: ", record);

                },
              })}
            />



            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginTop: '-10%' }}>
              <div style={{ marginBottom: '0px', marginTop: "8%" }}>
                <h3>{t('attachmentDetails')}</h3>
              </div>

              <Tabs defaultActiveKey="1">
                <TabPane tab={t('main')} key="1">
                  <AttachmentForm schema={stepSchema} rowSelectedData={rowSelectedData} />
                </TabPane>
              </Tabs>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-7%', marginRight: '5%' }}>
                <Button
                  type="primary"
                  onClick={handleSave}
                  style={{ marginRight: '8px' }}
                >
                  {t("save")}
                </Button>
                <Button
                  className="cancelButton" // Assuming you have a cancelButton style
                  onClick={handleAttachmnetModalCancel}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>


          </div>
        </div>}

    </WorkInstructionContext.Provider>
  );
};

export default WorkInstruction;
