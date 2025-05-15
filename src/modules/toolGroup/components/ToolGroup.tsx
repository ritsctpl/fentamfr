"use client";

import React, { useEffect, useState } from "react";
import styles from "@modules/toolGroup/styles/ToolGroupMaintenance.module.css";
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
import { Button, Form, Input, Modal, Select, Switch, Table, Tabs, Upload, message } from "antd";
import { retrieveCustomDataList } from "@services/dataCollectionServices";
import { Option } from "antd/es/mentions";
import dayjs from 'dayjs';
import TabPane from "antd/es/tabs/TabPane";
import AttachmentForm from "./AttachmentForm";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import mammoth from 'mammoth';
import { ToolGroupContext } from "../hooks/ToolGroupContext";
import ToolGroupCommonBar from "./ToolGroupCommonBar";
import { CreateToolGroup, fetchToolGroupsTop50, retrieveAllToolGroups, RetriveToolGroupRow, UpdateToolGroup } from "@services/toolGroup";
import ToolGroupBodyContent from "./ToolGroupBodyContent";


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

const ToolGroup: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
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

      try {
        const item = await fetchToolGroupsTop50(site);
        console.log(item,'fff');
        
        setTop50Data(item);
        setFilteredData(item);
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

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1)
  }

  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site; 
    try {
      const oAllItem = await retrieveAllToolGroups(site);
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;
      if (lowercasedTerm) {
        filtered = oAllItem.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = top50Data; 
      }
      setFilteredData(filtered);
    } catch (error) {
      console.error('Error fetching data Collection on search:', error);
    }
  };

  const handleAddClick = () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsModalVisible(true)
    setIsAdding(false);
    setFullScreen(false);
    setShowAlert(false);
    form.setFieldsValue({
      toolGroup: "",
      description: "",
      status: "Enabled",
    })


    const fetchCustomDataList = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const category = "Tool Group";
        const userId = username;
        oCustomDataList = await retrieveCustomDataList(site, category, userId);
        if (!oCustomDataList.errorCode) {
          const transformedCustomDataList = oCustomDataList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: uuidv4(),
              value: ""
            })
          );
          setCustomDataOnRowSelect(transformedCustomDataList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCustomDataList();
    form.setFieldsValue({
      toolGroup: "",
      description: "",
      status: "Enabled",
    });
    setShowAlert(false)
  };

  const { t } = useTranslation();

  const handleRowSelect = (row: DataRow) => {
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
        toolGroup: row.toolGroup,
      }

      try {
        const ToolGroupResponse = await RetriveToolGroupRow(site, payload);
        console.log("Tool Group retrieve response: ", ToolGroupResponse);

        if (!ToolGroupResponse.errorCode) {
          let combinedCustomDataList = ToolGroupResponse?.customDataList?.map((data, index) => ({
            ...data,
            key: index,
            id: uuidv4(),
          }));

          try {
            const category = "Tool Group";
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

          const transformedAttachmentList = ToolGroupResponse.attachmentList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: index,
            })
          );

          const attachmentTableList = ToolGroupResponse.attachmentList.map((item, index) => {
            const attachments = [];

            // Define the keys to check
            const keys = [
              'sequence',
              'quantityRequired',
              'stepId',
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
            ...ToolGroupResponse,
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
      type: 'input',
      label: 'description',
      name: 'description',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'input',
      label: 'location',
      name: 'location',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'input',
      label: 'toolQty',
      name: 'toolQty',
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
      defaultValue: "Enabled",
      width: "50%",
      options: [
        { value: 'Enabled', label: 'Enabled' },
        { value: 'Disabled', label: 'Disabled' },

      ],
    },
    {
      type: 'select',
      label: 'trackingControl',
      name: 'trackingControl',
      placeholder: '',
      required: false,
      defaultValue: "None",
      width: "50%",
      options: [
        { value: 'None', label: 'None' },
        { value: 'Lot', label: 'Lot' },
        { value: 'Serialized', label: 'Serialized' },
      ],
    },
    {
      type: 'switch',
      label: 'timeBased',
      name: 'timeBased',
      placeholder: '',
      required: false,
      width: "50%",
    },
    {
      type: 'switch',
      label: 'erpGroup',
      name: 'erpGroup',
      placeholder: '',
      required: false,
      width: "50%",
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
    // {
    //   type: 'select',
    //   label: 'stepId',
    //   name: 'stepId',
    //   placeholder: 'Select Step Id',
    //   required: true,
    //   width: "70%",
    //   defaultValue: "Operation",
    //   options: [
    //     { value: 'Operation', label: 'Operation' },
    //     { value: 'Routing', label: 'Routing' },
    //   ],
    // },
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
      type: 'number',
      label: 'quantityRequired',
      name: 'quantityRequired',
      placeholder: '',
      required: true,
      width: "70%",

    },
    {
      type: 'input',
      label: 'stepId',
      name: 'stepId',
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
    const toolGroup = form.getFieldsValue().toolGroup;
    if (toolGroup == undefined || toolGroup == "" || toolGroup == null) {
      message.error("Tool Group cannot be empty");
      return;
    }
    const req = {site, userId, ...updatedValues};
    console.log("Tool Group create request: ", req);

    try {
      console.log("Tool Group create request: ",updatedValues);
      
      const createResponse = await CreateToolGroup(site, userId, updatedValues);
      console.log("Tool Group create response: ", createResponse);
      if (!createResponse.errorCode) {
        message.success(createResponse.message_details.msg)
        setCall(call + 1);
        setPayloadData(createResponse.response);
        form.resetFields();
        setIsModalVisible(false);
      }
      else {
        message.error(createResponse.message);
      }

    } catch (error) {
      console.error("Error creating Tool Group:", error);
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

  const handleAddForAttachment = () => {
    setIsRowSelected(false);
    setInsertClickBooleanForAttachment(true);
    handleInsertForAttachment();
    setTimeout(() => {
      const attachmentListLength = ((payloadData.attachmentList.length + 1) * 10).toString();
      setSelectedRowKeys([attachmentListLength]);
      setShowAlert(true);
      const keyValue = +attachmentListLength / 10;
      const newRowData = {
        "key": keyValue,
        "sequence": attachmentListLength,
        "stepId": "",
        "quantityRequired": "",
        "item": "",
        "itemVersion": "",
        "routing": "",
        "routingVersion": "",
        "operation": "",
        "operationVersion": "",
        "workCenter": "",
        "resource": "",
        "resourceType": "",
        "shopOrder": "",
        "pcu": "",
      }
      console.log(newRowData,'newRowData');
      
      setAttachmentRowSelectedData(newRowData);
    }, 0);
  }

  const handleInsertForAttachment = () => {
    const newStepId = (((payloadData.attachmentList.length + 1) * 10).toString());
    setShowAlert(true);
    const newRow = {
      "key": newStepId,
      "sequence": newStepId,
      "stepId": "",
      "quantityRequired": "",
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
      "shopOrder": "",
      "pcu": "",
    };

    const newData = [...payloadData.attachmentList, newRow];
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      attachmentList: [...prevPayloadData.attachmentList, newRow]
    }));
    setIsNextPage(true);
  };

  const handleSave = (oEvent) => {
    let flagToSave = true, isEmpty = false;
    payloadData.attachmentList.map(item => {
      const otherKeys = [
        'sequence', 'stepId', 'quantityRequired', 'item', 'itemVersion', 'routing',
        'routingVersion', 'operation', 'operationVersion',
        'workCenter', 'resource', 'resourceType', 'shopOrder',
        'pcu',
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

    const oCreateTG = async () => { 
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
          setTimeout(async function () {
            console.log("Update Tool Group request: ", payloadData);

            const updateResponse = await UpdateToolGroup(site, payloadData);
            console.log("Updated Tool Group response: ", updateResponse);
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
      oCreateTG();

    // setIsModalVisible(false);

  };

  const setToRetrieve = () => {
    const fetchDCData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      const payload = {
        site: site,
        userId: cookies.rl_user_id,
        ...payloadData
      }

      try {
        const TGResponse = await RetriveToolGroupRow(site, payload); // Fetch the item data
        console.log("Retrieved Tool Group: ", TGResponse);

        if (!TGResponse.errorCode) {
          // Transform customDataList to include index and id
          const transformedCustomDataList = TGResponse.customDataList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: uuidv4(),
            })
          );
          const transformedAttachmentList = TGResponse.attachmentList.map(
            (data, index) => ({
              ...data,
              key: index,
              id: index,
            })
          );
          const attachmentTableList = TGResponse.attachmentList.map(item => {
            const attachments = [];

            // Define the keys to check
            const keys = [
              'stepId',
              'quantityRequired',
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
          TGResponse.customDataList = transformedCustomDataList;
          TGResponse.attachmentList = transformedAttachmentList;
          TGResponse.attachmentTableList = attachmentTableList;
          setSelectedRowData(TGResponse);
          setCustomDataOnRowSelect(transformedCustomDataList);
          setRowData(TGResponse);
          setPayloadData(TGResponse)
          //setActiveTab(1);
        }
      } catch (error) {
        console.error("Error retrieving dc:", error);
      }
    };

    fetchDCData();
  }

  const handleAttachmnetModalCancel = async () => {
    setIsStepModalVisible(false);
    setIsAttachmentVisible(false);
    setIsMainPageVisible(true);
    setInsertClickBoolean(false);
    await setToRetrieve();
    setSelectedAttachmnetRowKeys([]);
  };
  const attachmentColumns = [
    { title: t('sequence'), dataIndex: 'sequence', key: 'sequence', type: 'input', width: '15%' },
    { title: t('attachment'), dataIndex: 'attachment', key: 'attachment', type: 'input' },
  ];

  return (

    <ToolGroupContext.Provider value={{
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
            appTitle={t("toolGroupMaintenance")} onSiteChange={handleSiteChange} />
        </div>
        {isMainPageVisible && <div className={styles.dataFieldBopayloadDatady}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <ToolGroupCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("toolGroup")} ({filteredData ? filteredData.length : 0})
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
              <ToolGroupBodyContent
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

            <Modal style={{ marginTop: "-65px" }} title={t("createToolGroup")} open={isModalVisible}
              onCancel={handleCancel} onOk={handleFormSubmit} okText={t("add")} cancelText={t('cancel')}>

              <Form style={{ marginTop: "1px", maxHeight: '70vh', overflowY: 'auto' }} layout="vertical" form={form} onFinish={handleFormSubmit} labelCol={{ span: 10 }}
                wrapperCol={{ span: 24 }} >
                <Form.Item
                  label={t("toolGroup")}
                  name="toolGroup"
                  rules={[{ required: true, message: 'Tool Group is required' }]}
                  initialValue=""
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange('toolGroup', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
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
                  initialValue="Enabled"
                >
                  <Select>
                    <Select.Option value="Enabled">Enabled</Select.Option>
                    <Select.Option value="Disabled">Disabled</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t("trackingControl")}
                  name="trackingControl"
                  initialValue="None"
                >
                  <Select>
                    <Select.Option value="None">None</Select.Option>
                    <Select.Option value="Lot">Lot</Select.Option>
                    <Select.Option value="Serialized">Serialized</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t("location")}
                  name="location"
                  required={false}
                  initialValue=""
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange('location', e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={t("toolQty")}
                  name="toolQty"
                  required={false}
                  initialValue=""
                >
                  <Input
                    type="number"
                    onChange={(e) =>
                      handleInputChange('toolQty', e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item
                  name='timeBased'
                  label={t("timeBased")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name='erpGroup'
                  label={t("erpGroup")}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
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
                    {/* <p className={styles.dateText}>
                      {t('revision')} :
                      <span className={styles.fadedText}>{payloadData?.revision || ''}</span>
                    </p> */}

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
                    {/* <p className={styles.dateText}>
                      {t('revision')} :
                      <span className={styles.fadedText}>
                        {payloadData?.revision ? payloadData.currentVersion.toString() : 'false'}
                      </span>
                    </p> */}

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

    </ToolGroupContext.Provider>
  );
};

export default ToolGroup;
