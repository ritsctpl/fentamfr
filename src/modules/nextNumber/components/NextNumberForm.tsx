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

import { useTranslation } from "react-i18next";
import { NextNumberContext } from "../hooks/nextNumberContext";
import { fetchTop50, fetchTop50Activities, retrieveAllActivity, retrieveAllBOM, retrieveAllItem, retrieveAllItemGroup, retrieveTop50ItemGroup } from "@services/nextNumberServices";
import { retrieveTop50BOM } from "@services/routingServices";
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import { retrieveAllDataType, retrieveTop50DataType } from "@services/itemServices";
const { Option } = Select;
const { TextArea } = Input;

interface FormProps {
  onChange: (values: Record<string, any>) => void;
  setNewData: (values: Record<string, any>) => void;
  onValuesChange: (values: Record<string, any>) => void;
  layout?: "horizontal" | "vertical" | "inline";
  labelCol?: { span: number };
  wrapperCol?: { span: number };
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
const NextNumberForm: React.FC<FormProps> = (
  {
    setNewData,
    onValuesChange,
    layout = "horizontal",
    labelCol = { span: 8 },
    wrapperCol = { span: 12 },
  }
) => {
  const { t } = useTranslation();

  const { formData, setFormData, resetForm, setResetForm, payloadData, setPayloadData, addClickCount, mainSchema, showAlert, setShowAlert } =
    useContext(NextNumberContext);
  const [form] = Form.useForm();
  // const [formSchema, setFormSchema] = useState(schemaData);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [itemVisible, setItemVisible] = useState(false);
  const [bomVisible, setBomVisible] = useState(false);
  const [dataTypeVisible, setDataTypeVisible] = useState(false);
  const [activityVisible, setActivityVisible] = useState(false);
  const [itemGroupVisible, setItemGroupVisible] = useState(false);



  const [type, setType] = useState('');

  const [itemData, setItemData] = useState<any[]>([]);
  const [bomData, setBomData] = useState<any[]>([]);
  const [dataTypeData, setDataTypeData] = useState<any[]>([]);
  const [itemGroupData, setItemGroupData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);


  const [isNumberTypeVisible, setIsNumberTypeVisible] = useState(true);
  const [isOrderTypeVisible, setIsOrderTypeVisible] = useState(true);
  const [isDefinedByVisible, setIsDefinedByVisible] = useState(true);
  const [isItemVisible, setIsItemVisible] = useState(true);
  const [isObjectVersionVisible, setIsObjectVersionVisible] = useState(true);
  const [isItemGroupVisible, setIsItemGroupVisible] = useState(false);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);
  const [isContainerInputVisible, setIsContainerInputVisible] = useState(false);
  const [isPrefixVisible, setIsPrefixVisible] = useState(true);
  const [isSuffixVisible, setIsSuffixVisible] = useState(true);
  const [isNumberBaseVisible, setIsNumberBaseVisible] = useState(true);
  const [isSequenceLengthVisible, setIsSequenceLengthVisible] = useState(true);
  const [isMinSequenceVisible, setIsMinSequenceVisible] = useState(true);
  const [isMaxSequenceVisible, setIsMaxSequenceVisible] = useState(true);
  const [isWarningThresholdVisible, setIsWarningThresholdVisible] = useState(true);
  const [isIncrementByVisible, setIsIncrementByVisible] = useState(true);
  const [isCurrentSequenceVisible, setIsCurrentSequenceVisible] = useState(true);
  const [isResetSequenceNumberVisible, setIsResetSequenceNumberVisible] = useState(true);
  const [isNextNumberActivityVisible, setIsNextNumberActivityVisible] = useState(true);
  const [isCreateContinuousSfcVisible, setIsCreateContinuousSfcVisible] = useState(true);
  const [isCommitNextNumberChangesVisible, setIsCommitNextNumberChangesVisible] = useState(true);
  const [isSampleNextNumberVisible, setIsSampleNextNumberVisible] = useState(true);

  const [clickCount, setClickCount] = useState(0);



  useEffect(() => {
    setFormData(form.getFieldsValue());
    setPayloadData(form.getFieldsValue());
  }, [form])


  useEffect(() => {
    if (resetForm) {
      form.resetFields();
      form.setFieldsValue({
        prefix: "",
        suffix: "",
        sampleNextNumber: "",
        description: ""
      })
      setResetForm(false)
    }
  }, [resetForm])

  useEffect(() => {
    if (!payloadData) return;
    form.setFieldsValue({
      ...payloadData,
    });
  }, [payloadData]);

  useEffect(() => {
    form.setFieldsValue({
      ...formData
    })
  }, [formData]);





  // console.log("form values: ", formData);
  const handleSelectChange = (fieldName: string, value: string) => {
    // Update the form field value
    form.setFieldsValue({ [fieldName]: value });
    // Handle update for both routingStepList and other fields
    // setPayloadData((prevPayloadData) => {
    //   return {
    //     ...prevPayloadData,
    //     [fieldName]: value, // Update other fields
    //   };
    // });
    setFormData(form.getFieldsValue());
    setShowAlert(true);
  };
  const handleSwitchChange = (checked: boolean, fieldName: string) => {
    // Update the form field value
    form.setFieldsValue({ [fieldName]: checked });
    // Handle update for both routingStepList and other fields
    // setPayloadData((prevPayloadData) => {
    //   // Only update routingStepList if there are relevant fields
    //   return {
    //     ...prevPayloadData,
    //     [fieldName]: checked, // Update other fields
    //   };
    // });
    setFormData(form.getFieldsValue());
    setShowAlert(true);
  };

  const handleInputChange = (field: any, value: any) => {
     debugger;
    setShowAlert(true);

    let newValue = value;

    // Update the form field with the transformed value
    form.setFieldsValue({ [field]: newValue });
    // Get the updated form values
    const updatedFormValues = form.getFieldsValue();
    // setPayloadData((prevPayloadData) => ({
    //   ...prevPayloadData,
    //   [field]: newValue, // Update other fields
    // }));
    setFormData(form.getFieldsValue());
    return newValue;
  };


  const handleDefinedByChange = (value, field) => {
    // debugger
    form.setFieldsValue({ field: value });
    const definedBy = form.getFieldsValue().defineBy;
    if (field == "Item") {
      setIsItemGroupVisible(false);
      setIsItemVisible(true);
      setIsObjectVersionVisible(true);
    }
    else {
      setIsItemGroupVisible(true);
      setIsItemVisible(false);
      setIsObjectVersionVisible(false);
    }
    // setPayloadData((prevData) => ({
    //   ...form.getFieldsValue()
    // }));
    setFormData(form.getFieldsValue());
  }

  const handleNumberTypeChange = (value, field) => {
    // debugger
    form.setFieldsValue({ field: value });

    // setPayloadData((prevData) => ({
    //   ...form.getFieldsValue()
    // }));
    setFormData(form.getFieldsValue());

    const definedBy = payloadData.defineBy;
    if (definedBy == "Item") {
      setIsItemGroupVisible(false);
      setIsItemVisible(true);
      setIsObjectVersionVisible(true);
      setIsContainerInputVisible(false);
    }
    else {
      setIsItemGroupVisible(true);
      setIsItemVisible(false);
      setIsObjectVersionVisible(false);
      setIsContainerInputVisible(false);
    }
    if (field == "PCU release" || field == "Batch Number" || field == "MFR" || field == "BMR" || field == "BPR" || field == "Process Order") {
      setIsOrderTypeVisible(true);
      setIsDefinedByVisible(true);
      setIsContainerInputVisible(false);
    }
    else if (field == "PCU Serialize" || field == "Floor Stock Receipt") {
      setIsOrderTypeVisible(false);
      setIsContainerInputVisible(false);

    }

    else if (
      field == "Shop Order" ||
      field == "Process Order" ||
      field == "Process Lot" ||
      field == "RMA Number" ||
      field == "Incident Number" ||
      field == "Component Hold" ||
      field == "Slot Configuration" ||
      field == "Customer Order" ||
      field == "ECO Number" ||
      field == "Vertical Reference Number" ||
      field == "Horizontal Reference Number" ||
      field == "Test Plan Configuration" ||
      field == "CNC Program ID" ||
      field == "Packaging Material Type"
    ) {
      setIsItemGroupVisible(false);
      setIsItemVisible(false);
      setIsObjectVersionVisible(false);
      setIsOrderTypeVisible(false);
      setIsDefinedByVisible(false);
      setIsContainerInputVisible(false);

    }

    else if (field == 'Container Number') {
      setIsContainerInputVisible(true);
      setIsItemGroupVisible(false);
      setIsItemVisible(false);
      setIsObjectVersionVisible(false);
      setIsDefinedByVisible(false);
      setIsOrderTypeVisible(false);

    }

  }








  const onFinish = (values) => {
    setNewData(values)
    console.log('called');

    // form.getFieldValue();
  }

  const handleItemClick = async () => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldsValue().item;

    try {
      if (typedValue)
        response = await retrieveAllItem(site, typedValue);
      else
        response = await fetchTop50(site);

      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            objectVersion: item.revision,
            ...item
          }));
          setItemData(formattedData);
        }
      }
      else {
        setItemData([]);
      }
    } catch (error) {
      console.error('Error fetching routing data:', error);
    }
    setItemVisible(true);
  };

  const handleBOMClick = async () => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;

    const typedValue = form.getFieldsValue().bom;
    try {
      if (typedValue)
        response = await retrieveAllBOM(site, typedValue);
      else
        response = await retrieveTop50BOM(site);
      if (response) {
        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            bom: item.bom,
            revision: item.revision,
            description: item.description,
            status: item.status,
          }));
          setBomData(formattedData);
        }
      }
      else {
        setBomData([]);

      }

    }
    catch (error) {
      console.error('Error fetching bom data:', error);
    }
    setBomVisible(true);
  };



  const handleItemGroupClick = async () => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldsValue().itemGroup;

    try {
      // debugger;
      if (typedValue)
        response = await retrieveAllItemGroup(site, typedValue);
      else
        response = await retrieveTop50ItemGroup(site);
      if (response) {

        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            groupDescription: item.groupDescription,
            ...item
          }));
          setItemGroupData(formattedData);
        }

      }
      else {
        setItemGroupData([]);
      }
    } catch (error) {
      console.error('Error fetching item group data:', error);
    }

    setItemGroupVisible(true);

  };

  const handleActivityClick = async () => {
    let response;
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldsValue().nextNumberActivity;

    try {
      // debugger;
      if (typedValue)
        response = await retrieveAllActivity(site, typedValue);
      else
        response = await fetchTop50Activities(site);
      if (response) {

        if (!response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,  // Use index as ID
            nextNumberActivity: item.activityId,
            ...item
          }));
          setActivityData(formattedData);
        }

      }
      else {
        setActivityData([]);
      }
    } catch (error) {
      console.error('Error fetching item group data:', error);
    }

    setActivityVisible(true);

  };


  const handleItemOk = (record) => {
    // debugger
    const itemValue = record.item;
    const versionValue = record.objectVersion;
    if (itemValue && versionValue) {
      form.setFieldsValue({
        item: itemValue,
        objectVersion: versionValue,
      });
    }
    // setFormValues(form.getFieldsValue());
    setItemVisible(false);
    // setPayloadData((prevData) => ({
    //   ...prevData,
    //   ...form.getFieldsValue()
    // }));
    setFormData(form.getFieldsValue());
    setShowAlert(true);
  };

  const handleBOMOk = (record) => {

    const bomValue = record.bom;
    const bomVersionValue = record.revision;
    if (bomValue && bomVersionValue) {
      form.setFieldsValue({
        bom: bomValue,
        bomVersion: bomVersionValue,
      });
    }

    // setFormValues(form.getFieldsValue());
    setBomVisible(false);
    // setPayloadData((prevData) => ({
    //   ...prevData,
    //   ...form.getFieldsValue()
    // }));
    setFormData(form.getFieldsValue());
    setShowAlert(true);
  };

  const data = [
    { Parameter: "%COMMENTS%", Description: "Text entered by the operator" },
    { Parameter: "%SITE%", Description: "The site for the message" },
    { Parameter: "%SLOT%", Description: "The slot associated with the message" },
    { Parameter: "%SOURCE%", Description: "The source where the message occurred" },
    { Parameter: "%PRIORITY%", Description: "The priority of the shop order" },
    { Parameter: "%ACTIVITY%", Description: "The ID or the activity that released the PCU number" },
    { Parameter: "%ITEM_BO.(1)%", Description: "The site where the material is being released" },
    { Parameter: "%ITEM%", Description: "The site where the material group of the material being released is produced" },
    { Parameter: "%ITEM_GROUP%", Description: "The site where the material group of the material being released is produced" },
    { Parameter: "%ONEDIGITYEAR%", Description: "The last digit of the current year" },
    { Parameter: "%WEEKOFYEAR%", Description: "The current week of the current year, For example, On January 19, 2010, %WEEKOFYEAR% generates week 4." },
    { Parameter: "%ISO_WEEKOFYEAR%", Description: "The current week of the current year calculated by using ISO 8601 standard, For example, On January 1, 2016, %ISO_WEEKOFYEAR% generates week 53. On January 4, 2016, %ISO_WEEKOFYEAR% generates week 1." },
    { Parameter: "%ISO_ONEDIGITYEAR%", Description: "The last digit of the current year calculated by using ISO 8601 standard" },
    { Parameter: "%PCU_BO.(1)%", Description: "The site where the material group of the material being released is produced" },
    { Parameter: "%USER_BO.(0)%", Description: "The site where the material group of the material being released is produced" },
    { Parameter: "%USER_BO.(1)%", Description: "The site of the user ID of the person performing the action" },
    { Parameter: "%ITEM_BO.(2)%", Description: "The material produced by the SFC number, or the component being nonconformed" },
    { Parameter: "%ITEM_GROUP_BO.(0)%", Description: "The site where the material group of the material being released is produced" },
    { Parameter: "%ITEM_GROUP_BO.(1)%", Description: "The site where the material group of the material being released is produced" }
  ];

  const columns: any = [
    {
      title: t('parameter'),
      dataIndex: 'Parameter',
      key: 'Parameter',
    },
    {
      title: t('description'),
      dataIndex: 'Description',
      key: 'Description',
    },
  ];

  const handleItemGroupOk = (oItemGroup) => {

    if (oItemGroup) {
      form.setFieldsValue({
        itemGroup: oItemGroup
      });
    }
    // setFormValues(form.getFieldsValue());
    setItemGroupVisible(false);
    // setPayloadData((prevData) => ({
    //   ...prevData,
    //   ...form.getFieldsValue()
    // }));
    setFormData(form.getFieldsValue());
    setShowAlert(true);
  };

  const handleActivityOk = (oActivity) => {

    if (oActivity) {
      form.setFieldsValue({
        nextNumberActivity: oActivity
      });
    }
    // setFormValues(form.getFieldsValue());
    setActivityVisible(false);
    // setPayloadData((prevData) => ({
    //   ...prevData,
    //   ...form.getFieldsValue()
    // }));
    setFormData(form.getFieldsValue());
    setShowAlert(true);
  };

  let lastClickTimestamp = 0;

  const handleActivityOk1 = (oActivity) => {
    const currentTimestamp = new Date().getTime();
    const timeDiff = currentTimestamp - lastClickTimestamp;

    // Increment click count on each click
    setClickCount((prevCount) => prevCount + 1);

    // Check if it's a double click (time difference < 300ms)
    if (timeDiff < 300 && clickCount === 2 && oActivity) {
      form.setFieldsValue({
        nextNumberActivity: oActivity
      });
      setActivityVisible(false);
      setFormData(form.getFieldsValue());
      setShowAlert(true);

      // Reset click count after the double click
      setClickCount(0);
    }

    lastClickTimestamp = currentTimestamp;
  };

  const handleDataTypeOk = (oDatatype) => {

    if (oDatatype) {
      if (type == "AssemblyDataType") {
        form.setFieldsValue({
          assemblyDataType: oDatatype,
        });

      }
      if (type == "RemovalDataType") {
        form.setFieldsValue({
          removalDataType: oDatatype,
        });
      }
      if (type == "ReceiptDataType") {
        form.setFieldsValue({
          receiptDataType: oDatatype,
        });
      }
    }
    console.log("Form valus on slect: ", form.getFieldsValue())
    // setFormValues(form.getFieldsValue());
    setDataTypeVisible(false);
    // setPayloadData((prevData) => ({
    //   ...prevData,
    //   ...form.getFieldsValue()
    // }));
    setFormData(form.getFieldsValue());
    setShowAlert(true);
  };

  const handleCancel = () => {
    setItemVisible(false);
    setBomVisible(false);
    setDataTypeVisible(false);
    setItemGroupVisible(false);
    setActivityVisible(false);
    setIsModalVisible(false);
  };


  const itemColumns = [
    {
      title: t('item'),
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: t('version'),
      dataIndex: 'objectVersion',
      key: 'objectVersion',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const bomColumns = [
    {
      title: t('container'),
      dataIndex: 'container',
      key: 'container',
    },

    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },

  ];

  const dataTypeColumns = [
    {
      title: t('dataType'),
      dataIndex: 'dataType',
      key: 'dataType',
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const itemGroupColumns = [
    {
      title: t('itemGroup'),
      dataIndex: 'itemGroup',
      key: 'itemGroup',
    },
    {
      title: t('description'),
      dataIndex: 'groupDescription',
      key: 'groupDescription',
    },
  ];

  const activityColumns = [
    {
      title: t('activity'),
      dataIndex: 'nextNumberActivity',
      key: 'nextNumberActivity',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];



  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleValuesChange = (changedValues: any) => {
    console.log("values: ", changedValues);
    onValuesChange(form.getFieldsValue());
  };

  return (
    <>
      <Form
        layout="horizontal"
        form={form}
        style={{ width: '100%' }}
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 24 }}
      >
        {isNumberTypeVisible && (
          <Form.Item
            label={t("numbeType")}
            name="numberType"
            rules={[{ required: true, message: 'Number Type is required' }]}
            initialValue="PCU release"
          >
            <Select
              style={{ width: '40%' }}
              onChange={(value) => handleNumberTypeChange('numberType', value)}
            >
              <Option value="PCU release">PCU release</Option>
              <Option value="PCU Serialize">PCU Serialize</Option>
              <Option value="Shop Order">Shop Order</Option>
              <Option value="Process Order">Process Order</Option>
              <Option value="Process Lot">Process Lot</Option>
              <Option value="RMA Number">RMA Number</Option>
              <Option value="RMA PCU Number">RMA PCU Number</Option>
              <Option value="Incident Number">Incident Number</Option>
              <Option value="Container Number">Container Number</Option>
              <Option value="Floor Stock Number">Floor Stock Number</Option>
              <Option value="Batch Number">Batch Number</Option>
              <Option value="Component Hold">Component Hold</Option>
              <Option value="Slot Configuration">Slot Configuration</Option>
              <Option value="Customer Order">Customer Order</Option>
              <Option value="ECO Number">ECO Number</Option>
              <Option value="Vertical Reference Number">Vertical Reference Number</Option>
              <Option value="Horizontal Reference Number">Horizontal Reference Number</Option>
              <Option value="Test plan Configuration">Test plan Configuration</Option>
              <Option value="CNC Program ID">CNC Program ID</Option>
              <Option value="Packing Material Type">Packing Material Type</Option>

            </Select>
          </Form.Item>
        )}

        {isOrderTypeVisible && (
          <Form.Item
            label={t("orderType")}
            name="orderType"
            rules={[{ required: true, message: 'Order Type is required' }]}
            initialValue="Production"
          >
            <Select
              style={{ width: '40%' }}
              onChange={(value) => handleInputChange('orderType', value)}
            >
              <Option value="Production">Production</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Inspection">Inspection</Option>
              <Option value="Rework">Rework</Option>
              <Option value="Repetitive">Repetitive</Option>
              <Option value="RMA">RMA</Option>
              <Option value="Tooling">Tooling</Option>
              <Option value="Spare">Spare</Option>
              <Option value="Installation">Installation</Option>

            </Select>
          </Form.Item>
        )}

        {isDefinedByVisible && (
          <Form.Item
            label={t("definedBy")}
            name="defineBy"
            rules={[{ required: true, message: 'Defined By is required' }]}
            initialValue="Item"
          >
            <Select
              style={{ width: '40%' }}
              onChange={(value) => handleDefinedByChange('defineBy', value)}
            >
              <Option value="Item">Item</Option>
              <Option value="Item Group">Item Group</Option>
            </Select>
          </Form.Item>
        )}

        {isContainerInputVisible && (
          <Form.Item
            label={t("containerInput")}
            name="containerInput"
            initialValue=""
          >
            <Input
              placeholder=""
              style={{ width: '40%' }}
              suffix={

                <GrChapterAdd
                  onClick={() =>
                    handleBOMClick()
                  }
                />
              }
              onChange={(e) =>
                setTimeout(() => {
                  handleInputChange('containerInput', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                }, 100)
              }
            />
          </Form.Item>
        )}


        {isItemVisible && (
          <Form.Item
            label={t("item")}
            name="item"
            initialValue=""
            rules={[{ required: true, message: 'Item is required' }]}
          >
            <Input
              placeholder=""
              style={{ width: '40%' }}
              suffix={


                <GrChapterAdd
                  onClick={() =>
                    handleItemClick()
                  }
                />
              }
              onChange={(e) =>
                // setTimeout(() => {
                  handleInputChange('item', e.target.value.toUpperCase().replace(/[^A-Z0-9_*]/g, ''))
                // }, 100)
              }
            />
          </Form.Item>
        )}

        {isObjectVersionVisible && (
          <Form.Item
            label={t("version")}
            name="objectVersion"
            initialValue=""
            rules={[{ required: true, message: 'Version is required' }]}
          >
            <Input
              placeholder=""
              style={{ width: '40%' }}
              onChange={(e) =>
                // setTimeout(() => {
                  handleInputChange('objectVersion', e.target.value.toUpperCase().replace(/[^A-Z0-9_*]/g, ''))
                // }, 100)
              }
            />
          </Form.Item>
        )}

        {isItemGroupVisible && (
          <Form.Item
            label={t("itemGroup")}
            name="itemGroup"
            initialValue=""
            rules={[{ required: true, message: 'Item Group is required' }]}
          >
            <Input
              placeholder=""
              style={{ width: '40%' }}
              suffix={

                <GrChapterAdd
                  onClick={() =>
                    handleItemGroupClick()
                  }
                />
              }
              onChange={(e) =>
                // setTimeout(() => {
                handleInputChange('itemGroup', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                // }, 100)
              }
            />
          </Form.Item>
        )}

        {isDescriptionVisible && (
          <Form.Item
            label={t("description")}
            name="description"
          >
            <span style={{ width: '40%', display: 'inline-block' }}>
              {formData?.description}
            </span>
          </Form.Item>
        )}


        {isPrefixVisible && (
          <Form.Item
            label={t("prefix")}
            name="prefix"

          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                style={{ width: '40%' }}
                value={formData?.prefix}
                onChange={(e) =>
                  // setTimeout(() => {
                    handleInputChange('prefix', e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9_().%-]/g, '') // Allow A-Z, 0-9, _().% and hyphen (-)
                    )
                    
                  // }, 100)
                }
              />
              <Button style={{ marginLeft: '8px' }} onClick={showModal}>
                <NotListedLocationIcon />
              </Button>
            </div>
          </Form.Item>
        )}

        {isSuffixVisible && (
          <Form.Item
            label={t("suffix")}
            name="suffix"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                style={{ width: '40%' }}
                value={formData?.suffix}
                onChange={(e) =>
                  // setTimeout(() => {
                    handleInputChange('suffix', e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9_().%-]/g, '') // Allow A-Z, 0-9, _().% and hyphen (-)
                    )
                    
                  // }, 100)
                }
              />
              <Button style={{ marginLeft: '8px' }} onClick={showModal}>
                <NotListedLocationIcon />
              </Button>
            </div>
          </Form.Item>
        )}

        {isNumberBaseVisible && (
          <Form.Item
            label={t("numberBase")}
            name="numberBase"
            rules={[{ required: true, message: 'Number base is required' }]}
            initialValue="10"
          >
            <Input
              type="number"
              placeholder=""
              style={{ width: '40%' }}
              onKeyDown={(e) => {
                // Allow only numeric keys and essential control keys (backspace, arrow keys, etc.)
                if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleInputChange('numberBase', e.target.value)}
            />
          </Form.Item>
        )}

        {isSequenceLengthVisible && (
          <Form.Item
            label={t("sequenceLength")}
            name="sequenceLength"
            rules={[{ required: true, message: 'Sequnece length is required' }]}
            initialValue="3"
          >
            <Input
              type="number"
              placeholder=""
              style={{ width: '40%' }}
              onKeyDown={(e) => {
                // Allow only numeric keys and essential control keys (backspace, arrow keys, etc.)
                if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleInputChange('sequenceLength', e.target.value)}
            />
          </Form.Item>
        )}

        {isMinSequenceVisible && (
          <Form.Item
            label={t("minSequence")}
            name="minSequence"
            initialValue="1"
          >
            <Input
              type="number"
              placeholder=""
              style={{ width: '40%' }}
              onKeyDown={(e) => {
                // Allow only numeric keys and essential control keys (backspace, arrow keys, etc.)
                if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleInputChange('minSequence', e.target.value)}
            />
          </Form.Item>
        )}

        {isMaxSequenceVisible && (
          <Form.Item
            label={t("maxSequence")}
            name="maxSequence"
            initialValue="100"
          >
            <Input
              type="number"
              placeholder=""
              style={{ width: '40%' }}
              onKeyDown={(e) => {
                // Allow only numeric keys and essential control keys (backspace, arrow keys, etc.)
                if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleInputChange('maxSequence', e.target.value)}
            />
          </Form.Item>
        )}

        {isWarningThresholdVisible && (
          <Form.Item
            label={t("warningThreshold")}
            name="warningThreshold"
            initialValue=""
          >
            <Input
              type="number"
              placeholder=""
              style={{ width: '40%' }}
              onKeyDown={(e) => {
                // Allow only numeric keys and essential control keys (backspace, arrow keys, etc.)
                if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleInputChange('warningThreshold', e.target.value)}
            />
          </Form.Item>
        )}

        {isIncrementByVisible && (
          <Form.Item
            label={t("incrementBy")}
            name="incrementBy"
            initialValue=""
          >
            <Input
              type="number"
              placeholder=""
              style={{ width: '40%' }}
              onKeyDown={(e) => {
                // Allow only numeric keys and essential control keys (backspace, arrow keys, etc.)
                if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleInputChange('incrementBy', e.target.value)}
            />
          </Form.Item>
        )}

        {isCurrentSequenceVisible && (
          <Form.Item
            label={t("currentSequence")}
            name="currentSequence"
            rules={[{ required: true, message: 'Current Sequence is required' }]}
            initialValue=""
          >
            <Input
              type="text" // Set as text to allow control over the input
              placeholder=""
              style={{ width: '40%' }}
              onKeyDown={(e) => {
                // Allow only numeric keys and essential control keys (backspace, arrow keys, etc.)
                if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleInputChange('currentSequence', e.target.value)} // Only numbers
            />

          </Form.Item>
        )}

        {isResetSequenceNumberVisible && (
          <Form.Item
            label={t("resetSequenceNumber")}
            name="resetSequenceNumber"
            initialValue="Never"
          >
            <Select
              style={{ width: '40%' }}
              onChange={(value) => handleSelectChange('resetSequenceNumber', value)}
            >
              <Option value="Never">Never</Option>
              <Option value="Always">Always</Option>

              <Option value="Daily">Daily</Option>
              <Option value="Weekly">Weekly</Option>
              <Option value="Monthly">Monthly</Option>
              <Option value="Yearly">Yearly</Option>
              <Option value="Weekly-Sunday">Weekly-Sunday</Option>
              <Option value="Weekly-Monday">Weekly-Monday</Option>
              <Option value="Weekly-Tuesday">Weekly-Tuesday</Option>
              <Option value="Weekly-Wednesday">Weekly-Wednesday</Option>
              <Option value="Weekly-Thursday">Weekly-Thursday</Option>
              <Option value="Weekly-Friday">Weekly-Friday</Option>
              <Option value="Weekly-Saturday">Weekly-Saturday</Option>
            </Select>
          </Form.Item>
        )}

        {isNextNumberActivityVisible && (
          <Form.Item
            label={t("nextNumberActivity")}
            name="nextNumberActivity"
            initialValue=""
          >

            <Input
              placeholder=""
              style={{ width: '40%' }}
              suffix={

                <GrChapterAdd
                  onClick={() =>
                    handleActivityClick()
                  }
                />
              }
              onChange={(e) =>
                // setTimeout(() => {
                handleInputChange('nextNumberActivity', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                // }, 100)
              }
            />
          </Form.Item>
        )}

        {isCreateContinuousSfcVisible && (
          <Form.Item
            label={t("createContinuousSfc")}
            name="createContinuousSfcOnImport"
            initialValue={false}
          >
            <Switch onChange={(checked) => handleInputChange('createContinuousSfcOnImport', checked)} />
          </Form.Item>
        )}

        {isCommitNextNumberChangesVisible && (
          <Form.Item
            label={t("commitNextNumberChangesImmediately")}
            name="commitNextNumberChangesImmediately"
            initialValue={false}
          >
            <Switch onChange={(checked) => handleInputChange('commitNextNumberChangesImmediately', checked)} />
          </Form.Item>
        )}

        {isSampleNextNumberVisible && (
          <Form.Item
            label={t("sampleNextNumber")}
            name="sampleNextNumber"
          >
            <span style={{ width: '40%', display: 'inline-block' }}>
              {formData?.sampleNextNumber}
            </span>
          </Form.Item>
        )}

      </Form>

      <Modal
        title={t("selectItem")}
        open={itemVisible}
        onOk={handleItemOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table

          onRow={(record) => ({
            onDoubleClick: () => handleItemOk(record),
          })}
          columns={itemColumns}
          dataSource={itemData}
          bordered={true}
          rowKey="id" // Use the generated id as the row key
          // pagination={{ pageSize: 6 }} // Set page size to 8
          pagination={false}
          size="small"
          scroll={{'y': 300}}

        />
      </Modal>

      <Modal
        title={t("selectContainer")}
        open={bomVisible}
        onOk={handleBOMOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table

          columns={bomColumns}
          dataSource={[]}
          bordered={true}
          onRow={(record) => ({
            onDoubleClick: () => handleBOMOk(record),
          })}
          rowKey="bom" // Use the bom as the row key
          // pagination={{ pageSize: 6 }} // Set page size to 8
          pagination={false}
          size="small"
          scroll={{'y': 300}}
        />
      </Modal>

      <Modal
        title={t("selectDataType")}
        open={dataTypeVisible}
        onOk={handleDataTypeOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          columns={dataTypeColumns}
          dataSource={dataTypeData}
          bordered={true}
          rowKey="id"
          onRow={(record) => ({
            onDoubleClick: () => handleDataTypeOk(record.dataType),
          })}
          pagination={{ pageSize: 6 }} // Set page size to 8


        />
      </Modal>

      <Modal
        title={t("selectItemGroup")}
        open={itemGroupVisible}
        footer={null}
        onOk={handleItemGroupOk}
        onCancel={handleCancel}
        width={800}
      >
        <Table
          columns={itemGroupColumns}
          dataSource={itemGroupData}
          rowKey="id"
          bordered={true}
          onRow={(record) => ({
            onDoubleClick: () => handleItemGroupOk(record.itemGroup),
          })}
          // pagination={{ pageSize: 6 }} // Set page size to 8
          pagination={false}
          size="small"
          scroll={{'y': 300}}


        />
      </Modal>

      <Modal
        title={t("selectActivity")}
        open={activityVisible}
        footer={null}
        onOk={handleActivityOk}
        onCancel={handleCancel}
        width={800}
      >
        <Table
          columns={activityColumns}
          dataSource={activityData}
          bordered={true}
          rowKey="id"
          onRow={(record) => ({
            onDoubleClick: () => handleActivityOk(record.nextNumberActivity),
          })}
          // pagination={{ pageSize: 6 }} // Set page size to 8
          pagination={false}
          size="small"
          scroll={{'y': 300}}


        />
      </Modal>

      <Modal
        title={t("parametersAndDescription")}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
        footer={null}
      >
        <Table
          columns={columns}
          dataSource={data}
          bordered={true}
          // pagination={{ pageSize: 6 }}
          pagination={false}
          size="small"
          scroll={{'y': 300}}
          rowKey="Parameter"
        />
      </Modal>
    </>
  );
};
export default NextNumberForm;
