import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Modal, Table, Tooltip } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import { useTranslation } from 'react-i18next';
import {
  retrieveAllOperation, retrieveAllRouting,
} from '@services/routingServices';
import { parseCookies } from 'nookies';
import {
  fetchAllWorkCenter, fetchResourceAll, fetchResourceTop50, fetchShopAllData, fetchShopTop50, fetchTop50Item, fetchTop50Operation, fetchTop50Routing,
  fetchTop50WorkCenter, retrieveAllItem, retrieveAllItemGroup,
  retrieveListOfPCU, retrieveTop50ItemGroup
} from '@services/dataCollectionServices';
import { fetchAllBom, fetchAllResourceType, fetchTop50Bom, fetchTop50ResourceType } from '@services/workInstructionService';
import { fetchAllComponent, fetchTop50Component, RetriveBomSelectedRow } from '@services/BomService';
import { ToolGroupContext } from '../hooks/ToolGroupContext';
// import DataFormat from '@/utils/dataFormat';

interface DynamicFormProps {
  schema: any;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  rowSelectedData: any;
}

const AttachmentForm: React.FC<DynamicFormProps> = ({

  layout = 'horizontal',
  labelCol = { span: 12 },
  wrapperCol = { span: 24 },
  rowSelectedData
}) => {

  const { insertClickBoolean, insertClick, setInsertClick, payloadData, setPayloadData, schema, stepSchema,
    setFormSchema, formSchema, setShowAlert, isOperationRowSelected, setIsOperationRowSelected, isStepRowClicked,
    setIsStepRowClicked, attachmentRowSelectedData, insertClickBooleanForAttachment, insertClickForAttachment, setInsertClickBooleanForAttachment,
  } = useContext<any>(ToolGroupContext);

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
  const [isNumeric, setIsNumeric] = useState<boolean>(false);
  const [isDataFieldList, setIsDataFieldList] = useState<boolean>(true);
  const [isBoolean, setIsBoolean] = useState<boolean>(true);
  const [isAttchmentModified, setIsAttchmentModified] = useState<boolean>(false);
  const [isAttachmentChanged, setIsAttachmentChanged] = useState<number>(0);
  const [bomLists, setBomLists] = useState<any>([]);
  // console.log("Form schema: ", formSchema)
  // setFormSchema(stepSchema)


  // console.log("Payload data from routing form: ", payloadData);
  useEffect(() => {
    // form.setFieldsValue(payloadData)
  }, [payloadData]);



  // useEffect(() => {
  //   schema.map(field => renderField(field))
  // }, [schema]);

  // useEffect(() => {
  //   formSchema?.map(field => renderField(field))
  // }, [formSchema]);

  useEffect(() => {
    form.setFieldsValue(attachmentRowSelectedData);
  }, [attachmentRowSelectedData]);

  // console.log("row selected data: ", rowSelectedData)

  useEffect(() => {
    // debugger
    if (insertClickBooleanForAttachment) {
      const seq = (payloadData.attachmentList.length) * 10;
      form.setFieldsValue({
        "sequence": seq,
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
      })
    }
  }, [insertClickForAttachment])

  useEffect(() => {
    if (setIsAttchmentModified)
      generateAttachmentList()
  }, [isAttachmentChanged])





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



  const handleModalOk = (selectedRow) => {
    if (selectedRow) {
      // debugger
      setShowAlert(true);
      const updatedFields = {
        [currentField]: selectedRow[currentField],
      };
      setIsAttchmentModified(true);
      setIsAttachmentChanged(isAttachmentChanged + 1);
      // Update the form values
      form.setFieldsValue(updatedFields);

      if (currentField == "item") {
        form.setFieldsValue({ itemVersion: selectedRow.revision });
        // Update the payloadData as well
        const updatedList = payloadData.attachmentList.map(param => {
          if (param.sequence == form.getFieldsValue().sequence) {
            return {
              ...param,
              [currentField]: selectedRow[currentField], // Update the specific field
              itemVersion: selectedRow.revision // Set itemVersion in payloadData
            };
          }
          return param; // Return unchanged parameter
        });
        setPayloadData(prevData => ({
          ...prevData,
          attachmentList: updatedList // Update the attachmentList with modified values
        }));
      }

      else if (currentField == "routing") {
        form.setFieldsValue({ routingVersion: selectedRow.version });
        // Update the payloadData as well
        const updatedList = payloadData.attachmentList.map(param => {
          if (param.sequence == form.getFieldsValue().sequence) {
            return {
              ...param,
              [currentField]: selectedRow[currentField], // Update the specific field
              routingVersion: selectedRow.version // Set itemVersion in payloadData
            };
          }
          return param; // Return unchanged parameter
        });
        setPayloadData(prevData => ({
          ...prevData,
          attachmentList: updatedList // Update the attachmentList with modified values
        }));
      }

      else if (currentField == "bom") {
        setBomLists(selectedRow);
        form.setFieldsValue({ bomVersion: selectedRow.revision });
        form.setFieldsValue({ component: '', componentVersion: '' });
        const updatedList = payloadData.attachmentList.map(param => {
          if (param.sequence == form.getFieldsValue().sequence) {
            return {
              ...param,
              [currentField]: selectedRow[currentField], // Update the specific field
              bomVersion: selectedRow.revision // Set itemVersion in payloadData
            };
          }
          return param; // Return unchanged parameter
        });
        setPayloadData(prevData => ({
          ...prevData,
          attachmentList: updatedList // Update the attachmentList with modified values
        }));
      }

      else if (currentField == "operation") {
        form.setFieldsValue({ operationVersion: selectedRow.revision });
        // Update the payloadData as well
        const updatedList = payloadData.attachmentList.map(param => {
          if (param.sequence == form.getFieldsValue().sequence) {
            return {
              ...param,
              [currentField]: selectedRow[currentField], // Update the specific field
              operationVersion: selectedRow.revision // Set itemVersion in payloadData
            };
          }
          return param; // Return unchanged parameter
        });
        setPayloadData(prevData => ({
          ...prevData,
          attachmentList: updatedList // Update the attachmentList with modified values
        }));
      }

      else if (currentField == "component") {
        form.setFieldsValue({ componentVersion: selectedRow.componentVersion });
        // Update the payloadData as well
        const updatedList = payloadData.attachmentList.map(param => {
          if (param.sequence == form.getFieldsValue().sequence) {
            return {
              ...param,
              [currentField]: selectedRow[currentField], // Update the specific field
              componentVersion: selectedRow.componentVersion // Set itemVersion in payloadData
            };
          }
          return param; // Return unchanged parameter
        });
        setPayloadData(prevData => ({
          ...prevData,
          attachmentList: updatedList // Update the attachmentList with modified values
        }));
      }

      else {
        const updatedList = payloadData.attachmentList.map(param => {
          if (param.sequence == form.getFieldsValue().sequence) {
            return { ...param, [currentField]: selectedRow[currentField] }; // Update the specific field
          }
          return param; // Return unchanged parameter
        });

        setPayloadData(prevData => ({
          ...prevData,
          attachmentList: updatedList // Update the attachmentList with modified values
        }));
      }

      // Notify about the form change
      // onFormChange(updatedFields[currentField], fieldSchema?.correspondingVersion ? updatedFields[fieldSchema.correspondingVersion] : undefined);

    }

    setInsertClickBooleanForAttachment(false);
    setVisible(false);
  };

  const generateAttachmentList = () => {
    // Add this computed property to transform the attachment list
    const attachmentTableList = payloadData.attachmentList.map(item => {
      const attachments = [];

      // Define the keys to check
      const keys = [
        "stepId",
        "quantityRequired",
        'item',
        'itemVersion',
        'routing',
        'routingVersion',
        'operation',
        'operationVersion',
        'workCenter',
        'resource',
        'resourceType',
        'shopOrder',
        'pcu',
      ];

      keys.forEach(key => {
        if (item[key]) {
          attachments.push(`${key}:${item[key]}`);
        }
      });

      return {
        sequence: item.sequence,
        attachment: attachments.join(', ') // Join the non-null attachments with a comma
      };
    });

    console.log("Formatted attachmnet list: ", attachmentTableList);
    setPayloadData((prevData) => ({
      ...prevData,
      attachmentTableList: attachmentTableList
    }));
  }

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

  const { t } = useTranslation();
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

  const handleClick = async (value, fieldName) => {
    setField(fieldName);
    setVisible(true);
    if (fieldName == "itemGroup") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('itemGroup'), dataIndex: 'itemGroup', key: 'itemGroup' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        if (typedValue)
          oList = await retrieveAllItemGroup(site, typedValue);
        else
          oList = await retrieveTop50ItemGroup(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            description: item.groupDescription
          }));


          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }

        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all item group list:", error);
      }
    }
    else if (fieldName == "item") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('item'), dataIndex: 'item', key: 'item' },
          { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue)
          oList = await retrieveAllItem(site, typedValue);
        else
          oList = await fetchTop50Item(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }

        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all item list:", error);
      }
    }
    else if (fieldName == "routing") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('routing'), dataIndex: 'routing', key: 'routing' },
          { title: t('version'), dataIndex: 'version', key: 'version' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue)
          oList = await retrieveAllRouting(site, typedValue);
        else
          oList = await fetchTop50Routing(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all routing list:", error);
      }
    }

    else if (fieldName == "operation") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('operation'), dataIndex: 'operation', key: 'operation' },
          { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue)
          oList = await retrieveAllOperation(site, typedValue);
        else
          oList = await fetchTop50Operation(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all operation list:", error);
      }
    }

    else if (fieldName == "workCenter") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue)
          oList = await fetchAllWorkCenter(site, typedValue);
        else
          oList = await fetchTop50WorkCenter(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all work center list:", error);
      }
    }

    else if (fieldName == "resource") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('resource'), dataIndex: 'resource', key: 'resource' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue)
          oList = await fetchResourceAll(site, typedValue);
        else
          oList = await fetchResourceTop50(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all resource list:", error);
      }
    }

    else if (fieldName == "resourceType") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('resourceType'), dataIndex: 'resourceType', key: 'resourceType' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('resourceTypeDescription'), dataIndex: 'resourceTypeDescription', key: 'resourceTypeDescription' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue) {
          oList = await fetchAllResourceType(site, typedValue);
        }
        else {
          oList = await fetchTop50ResourceType(site);
          console.log("oList: ", oList);
        }
        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all Resource Type list:", error);
      }
    }

    else if (fieldName == "shopOrder") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder' },
          { title: t('orderType'), dataIndex: 'orderType', key: 'orderType' },
          { title: t('status'), dataIndex: 'status', key: 'status' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        if (typedValue)
          oList = await fetchShopAllData(site, typedValue);
        else
          oList = await fetchShopTop50(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all shop order list:", error);
      }
    }

    else if (fieldName == "pcu") {
      try {
        let oList;
        debugger
        const oTableColumns = [
          { title: t('pcu'), dataIndex: 'pcu', key: 'pcu' },
          // { title: t('orderType'), dataIndex: 'orderType', key: 'orderType' },
          { title: t('status'), dataIndex: 'status', key: 'status' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // debugger
        // if (typedValue)
        //   oList = await fetchShopAllData(site, typedValue);
        // else
        oList = await retrieveListOfPCU(site);

        if (!oList.errorCode) {
          const formattedList = oList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all shop order list:", error);
      }
    }


    else if (fieldName == "bom") {
      setBomLists([])

      try {
        let oList;
        const oTableColumns = [
          { title: t('bom'), dataIndex: 'bom', key: 'bom' },
          { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        if (typedValue) {
          oList = await fetchAllBom(site, typedValue);
        } else {
          oList = await fetchTop50Bom(site);
        }

        if (!oList.errorCode) {
          const formattedList = oList.bomList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));

          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all bom list:", error);
      }
    }

    else if (fieldName == "component") {
      try {
        let oList;
        const oTableColumns = [
          { title: t('component'), dataIndex: 'component', key: 'component' },
          { title: t('componentVersion'), dataIndex: 'componentVersion', key: 'componentVersion' },
          { title: t('componentDescription'), dataIndex: 'componentDescription', key: 'componentDescription' }
        ]

        const cookies = parseCookies();
        const site = cookies.site;
        oList = await RetriveBomSelectedRow(site, bomLists);

        if (!oList.errorCode) {
          const formattedList = oList.bomComponentList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
            component: item.component,
            componentVersion: item.componentVersion,
          }));
          setCurrentField(fieldName);
          setTableColumns(oTableColumns);
          setTableData(formattedList);
        }
        else {
          setTableColumns(oTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all bom list:", error);
      }
    }
  }


  const handleInputChange = (fieldName: any, value: any) => {
    form.setFieldsValue({ [fieldName]: value });
    const updatedParameterList = payloadData.attachmentList.map(param => {
      if (param.sequence == form.getFieldsValue().sequence) {
        return { ...param, [fieldName]: value }; // Update the specific field
      }
      return param; // Return unchanged parameter
    });

    setPayloadData(prevData => ({
      ...prevData,
      attachmentList: updatedParameterList // Update the attachmentList with modified values
    }));

    console.log("Parameter payload: ", updatedParameterList);
    setIsAttchmentModified(true);
    setIsAttachmentChanged(isAttachmentChanged + 1);
  };

  return (
    <>
      <Form
        form={form}
        layout={layout}
        onFinish={handleSubmit}
        style={{
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: "15px"
        }}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label={t("sequence")}
          name="sequence"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('sequence', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Form.Item>

        <Form.Item
          label={t("stepId")}
          name="stepId"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('stepId', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Form.Item>

        <Form.Item
          label={t("quantityRequired")}
          name="quantityRequired"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            type='number'
            onChange={(e) =>
              handleInputChange('quantityRequired', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Form.Item>

        {/* <Form.Item label={t("itemGroup")} style={{ width: "60%" }} name="itemGroup" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "itemGroup")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("itemGroup", newValue); // Update the form with the new value
            }}
          />
        </Form.Item> */}

        <Form.Item label={t("item")} style={{ width: "60%" }} name="item" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "item")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("item", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("itemVersion")}
          name="itemVersion"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("itemVersion", newValue);
            }}
          />
        </Form.Item>

        <Form.Item label={t("routing")} style={{ width: "60%" }} name="routing" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "routing")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("routing", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("routingVersion")}
          name="routingVersion"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("routingVersion", newValue);
            }}
          />
        </Form.Item>

        <Form.Item label={t("operation")} style={{ width: "60%" }} name="operation" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "operation")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("operation", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("operationVersion")}
          name="operationVersion"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("operationVersion", newValue);
            }}
          />
        </Form.Item>

        <Form.Item label={t("workCenter")} style={{ width: "60%" }} name="workCenter" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "workCenter")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("workCenter", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item label={t("resource")} style={{ width: "60%" }} name="resource" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "resource")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("resource", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item label={t("resourceType")} style={{ width: "60%" }} name="resourceType" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "resourceType")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("resourceType", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item label={t("shopOrder")} style={{ width: "60%" }} name="shopOrder" required={false}>
          <Input
            placeholder=""
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "shopOrder")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("shopOrder", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        {/* <Form.Item
          label={t("customOrder")}
          name="customOrder"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("customOrder", newValue);
            }}
          />
        </Form.Item> */}

        <Form.Item label={t("pcu")} style={{ width: "60%" }} name="pcu" required={false}>
          <Input
            placeholder=""

            suffix={

              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "pcu")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_-]/g, '');
              handleInputChange("pcu", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>


        {/* <Form.Item label={t("bom")} style={{ width: "60%" }} name="bom" required={false}>
          <Input
            placeholder=""

            suffix={

              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "bom")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("bom", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("bomVersion")}
          name="bomVersion"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("bomVersion", newValue);
            }}
          />
        </Form.Item>


        <Form.Item label={t("component")} style={{ width: "60%" }} name="component" required={false}>
          <Input
            placeholder=""

            suffix={

              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "component")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("component", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("componentVersion")}
          name="componentVersion"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9_]/g, '');
              handleInputChange("componentVersion", newValue);
            }}
          />
        </Form.Item> */}
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
          onRow={(record) => ({
            onDoubleClick: () => handleRowSelection(record),
          })}
          // pagination={{
          //   pageSize: 6,
          // }}
          pagination={false}
          scroll={{ y: 300 }}
        />
      </Modal>
    </>
  );
};

export default AttachmentForm;
