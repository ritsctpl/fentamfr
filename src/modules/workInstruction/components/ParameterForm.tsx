import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Select, Switch, Checkbox, Button, Modal, Table, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { GrChapterAdd } from "react-icons/gr";
import { useTranslation } from 'react-i18next';
import {
  retrieveAllOperation, retrieveAllRouting, retrieveAllWC, retrieveErpOperation, retrieveErpWC, retrieveTop50Operation,
  retrieveTop50Routing, retrieveTop50WC
} from '@services/routingServices';
import { parseCookies } from 'nookies';
import { retrieveAllCertification, retrieveAllDataField, retrieveAllNCCode, retrieveAllParameterNames, retrieveTop50Certification, retrieveTop50DataField, retrieveTop50NCCode } from '@services/dataCollectionServices';
import { WorkInstructionContext } from '../hooks/WorkInstructionContext';
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

  rowSelectedData: any;
}

const DynamicForm: React.FC<DynamicFormProps> = ({

  layout = 'horizontal',
  labelCol = { span: 12 },
  wrapperCol = { span: 24 },
  rowSelectedData
}) => {

  const { insertClickBoolean, insertClick, setInsertClick, payloadData, setPayloadData, schema, stepSchema,
    setFormSchema, formSchema, setShowAlert, isOperationRowSelected, setIsOperationRowSelected, isStepRowClicked,
    setIsStepRowClicked } = useContext<any>(WorkInstructionContext);

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
  const [isMask, setIsMask] = useState<boolean>(true);
  const [isAutoLogNC, setIsAutoLogNC] = useState<boolean>(false);
  const [isCertification, setIsCertification] = useState<boolean>(false);

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
    form.setFieldsValue(rowSelectedData);
    if (rowSelectedData?.type == 'Numeric') {
      setIsNumeric(false);
      setIsDataFieldList(true);
      setIsBoolean(true);
    }
    else if (rowSelectedData?.type == 'Data Field List') {
      setIsNumeric(true);
      setIsDataFieldList(false);
      setIsBoolean(true);
    }
    else if (rowSelectedData?.type == 'Boolean') {
      setIsNumeric(true);
      setIsDataFieldList(true);
      setIsBoolean(false);
    }
    else if (rowSelectedData?.type == 'Text') {
      setIsNumeric(true);
      setIsDataFieldList(true);
      setIsBoolean(true);
    }
  }, [rowSelectedData]);

  // console.log("row selected data: ", rowSelectedData)

  useEffect(() => {
    if (insertClickBoolean) {
      const stepId = (payloadData.parameterList.length) * 10;
      form.setFieldsValue({
        "sequence": stepId,
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



  const handleModalOk = (selectedRow) => {
    if (selectedRow) {
      debugger
      setShowAlert(true);
      const updatedFields = {
        [currentField]: selectedRow[currentField],
      };

      // Update the form values
      form.setFieldsValue(updatedFields);

      const updatedParameterList = payloadData.parameterList.map(param => {
        if (param.sequence == form.getFieldsValue().sequence) {
          return { ...param, [currentField]: selectedRow[currentField] }; // Update the specific field
        }
        return param; // Return unchanged parameter
      });

      setPayloadData(prevData => ({
        ...prevData,
        parameterList: updatedParameterList // Update the parameterList with modified values
      }));

      // Notify about the form change
      // onFormChange(updatedFields[currentField], fieldSchema?.correspondingVersion ? updatedFields[fieldSchema.correspondingVersion] : undefined);
    }

    // Close the modal
    setVisible(false);
  };






  const handleModalCancel = () => {
    setVisible(false);
  };

  const handleRowSelection = (record: any) => {
    debugger
    setSelectedRow(record);
    handleModalOk(record);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger
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
    if (fieldName == "parameterName") {

      try {
        let oParameterList;
        const parameterTableColumns = [
          { title: t('parameterName'), dataIndex: 'parameterName', key: 'parameterName' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        // if (typedValue)
        //   oParameterList = await retrieveAllOperation(site, typedValue);
        // else
        oParameterList = await retrieveAllParameterNames(site);

        if (oParameterList) {
          const formattedParameterList = oParameterList.map((item, index) => ({
            ...item,
            key: index,
            id: index,
          }));


          setCurrentField(fieldName);
          setTableColumns(parameterTableColumns);
          setTableData(formattedParameterList);
        }

        else {
          setTableColumns(parameterTableColumns);
          setTableData([]);
        }

      } catch (error) {
        console.error("Error fetching all parameter list:", error);
      }
    }
    else if (fieldName == "ncCode") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('ncCode'), dataIndex: 'ncCode', key: 'ncCode' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        debugger
        if (typedValue)
          oList = await retrieveAllNCCode(site, typedValue);
        else
          oList = await retrieveTop50NCCode(site);

        if (oList) {
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
        console.error("Error fetching all nc code list:", error);
      }
    }
    else if (fieldName == "dataField") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('dataField'), dataIndex: 'dataField', key: 'dataField' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        debugger
        if (typedValue)
          oList = await retrieveAllDataField(site, typedValue);
        else
          oList = await retrieveTop50DataField(site);

        if (oList) {
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
        console.error("Error fetching all data field list:", error);
      }
    }
    else if (fieldName == "certification") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('certification'), dataIndex: 'certification', key: 'certification' },
          // { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('description'), dataIndex: 'description', key: 'description' }
        ]
        const typedValue = form.getFieldsValue()[fieldName];
        const cookies = parseCookies();
        const site = cookies.site;
        debugger
        if (typedValue)
          oList = await retrieveAllCertification(site, typedValue);
        else
          oList = await retrieveTop50Certification(site);

        if (oList) {
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
        console.error("Error fetching all certification list:", error);
      }
    }

  }


  const handleInputChange2 = (fieldName: any, value: any) => {
    debugger
    form.setFieldsValue({ [fieldName]: value });
    const seqValue = form.getFieldsValue().sequence;
    setPayloadData((prevData) => ({
      ...prevData,
      ...form.getFieldsValue()
    }))
    console.log("Parameter payload: ", payloadData?.parameterList);
  };

  const handleInputChange = (fieldName: any, value: any) => {
    // ... existing code ...
    form.setFieldsValue({ [fieldName]: value });
    debugger
    const updatedParameterList = payloadData.parameterList.map(param => {
      if (param.sequence == form.getFieldsValue().sequence) {
        return { ...param, [fieldName]: value }; // Update the specific field
      }
      return param; // Return unchanged parameter
    });

    if (fieldName == "autoLogNconMinOrMaxOverride" && value == false)
      setIsAutoLogNC(false)
    else if(fieldName == "autoLogNconMinOrMaxOverride" && value == true)
      setIsAutoLogNC(true)

    if (fieldName == "overrideMinOrMax" && value == false)
      setIsCertification(false);
    else if(fieldName == "overrideMinOrMax" && value == true)
      setIsCertification(true);

    setPayloadData(prevData => ({
      ...prevData,
      parameterList: updatedParameterList // Update the parameterList with modified values
    }));

    // console.log("Parameter payload: ", updatedParameterList);
  };

  const handleSelectChange = (fieldName: any, value: any) => {
    debugger
    form.setFieldsValue({ [fieldName]: value });
    if (value == 'Numeric') {
      setIsNumeric(false);
      setIsDataFieldList(true);
      setIsBoolean(true);
      setIsMask(true);
    }
    else if (value == 'Data Field List') {
      setIsNumeric(true);
      setIsDataFieldList(false);
      setIsBoolean(true);
      setIsMask(false);
    }
    else if (value == 'Boolean') {
      setIsNumeric(true);
      setIsDataFieldList(true);
      setIsBoolean(false);
      setIsMask(false);
    }
    else if (value == 'Text') {
      setIsNumeric(true);
      setIsDataFieldList(true);
      setIsBoolean(true);
      setIsMask(true);
    }
    else if (value == 'Formula') {
      setIsMask(true);
    }


    const updatedParameterList = payloadData.parameterList.map(param => {
      if (param.sequence == form.getFieldsValue().sequence) {
        return { ...param, [fieldName]: value }; // Update the specific field
      }
      return param; // Return unchanged parameter
    });

    setPayloadData(prevData => ({
      ...prevData,
      parameterList: updatedParameterList // Update the parameterList with modified values
    }));
  };

  console.log("Parameter payload: ", payloadData)

  return (
    <>


      <Form
        form={form}
        layout={layout}
        onFinish={handleSubmit}
        style={{
          width: '100%',
          maxHeight: 'calc(100vh - 30vh)', // Limit the form height
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
          label={t("type")}
          name="type"
          initialValue="Numeric"
          style={{ width: "60%" }}
        >
          <Select onChange={(value) => handleSelectChange('type', value)} >
            <Select.Option value="Numeric">Numeric</Select.Option>
            <Select.Option value="Boolean">Boolean</Select.Option>
            <Select.Option value="Formula">Formula</Select.Option>
            <Select.Option value="Text">Text</Select.Option>
            <Select.Option value="Data Field List">Data Field List</Select.Option>

          </Select>
        </Form.Item>

        <Form.Item label={t("parameterName")} style={{ width: "60%" }} name="parameterName" required={true}>
          <Input
            placeholder=""

            suffix={

              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "parameterName")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()                  // Convert to uppercase
                // .replace(/\s+/g, '')            // Remove all spaces
                .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores
              handleInputChange("parameterName", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("description")}
          name="description"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('description', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("prompt")}
          name="prompt"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('prompt', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("status")}
          name="status"
          initialValue="Enabled"
          style={{ width: "60%" }}
        >
          <Select onChange={(value) => handleSelectChange('status', value)}>
            <Select.Option value="Enabled">Enabled</Select.Option>
            <Select.Option value="Disabled">Disabled</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("allowMissingValues")}
          name="allowMissingValues"
          valuePropName="checked" // Use checked for Switch
          initialValue={false} // Set initial value to true for "Enabled"
          style={{ width: "60%" }}
        >
          <Switch
            onChange={(checked) => handleInputChange('allowMissingValues', checked)} // Handle change
          />
        </Form.Item>

        <Form.Item
          label={t("displayDataValues")}
          name="displayDataValues"
          valuePropName="checked" // Use checked for Switch
          initialValue={false} // Set initial value to true for "Enabled"
          style={{ width: "60%" }}
        >
          <Switch
            onChange={(checked) => handleInputChange('displayDataValues', checked)} // Handle change
          />
        </Form.Item>

        <Form.Item
          label={t("falseValue")}
          name="falseValue"
          required={!isBoolean}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            disabled={isBoolean}
            onChange={(e) =>
              handleInputChange('falseValue', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("trueValue")}
          name="trueValue"
          required={!isBoolean}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            disabled={isBoolean}
            onChange={(e) =>
              handleInputChange('trueValue', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item label={t("dataField")} style={{ width: "60%" }} name="dataField" required={!isDataFieldList}>
          <Input
            placeholder=""
            disabled={isDataFieldList}

            suffix={

              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "dataField")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()                  // Convert to uppercase
                .replace(/\s+/g, '')            // Remove all spaces
                .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores
              handleInputChange("dataField", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("formula")}
          name="formula"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('formula', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("minValue")}
          name="minValue"
          required={!isNumeric}
          initialValue="0"
          style={{ width: "60%" }}
        >
          <Input
            disabled={isNumeric}
            onChange={(e) =>
              handleInputChange('minValue', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Form.Item>

        <Form.Item
          label={t("maxValue")}
          name="maxValue"
          required={!isNumeric}
          initialValue="100"
          style={{ width: "60%" }}
        >
          <Input
            disabled={isNumeric}
            onChange={(e) =>
              handleInputChange('maxValue', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Form.Item>

        <Form.Item
          label={t("targetValue")}
          name="targetValue"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('targetValue', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item
          name="softLimitCheckOnMinOrMaxValue"
          valuePropName="checked" // Use checked for Switch
          initialValue={false} // Set initial value to true for "Enabled"
          style={{ width: "60%", marginLeft: '20%' }}
        >
          {/* <Switch
            onChange={(checked) => handleInputChange('softLimitCheckOnMinOrMaxValue', checked)} // Handle change
          /> */}

          <Checkbox
            onChange={(e) => handleInputChange('softLimitCheckOnMinOrMaxValue', e.target.checked)} // Handle change
          > {t("softLimitCheckOnMinOrMaxValue")} </Checkbox>
        </Form.Item>

        <Form.Item
          name="overrideMinOrMax"
          valuePropName="checked" // Use checked for Switch
          initialValue={false} // Set initial value to true for "Enabled"
          style={{ width: "60%", marginLeft: '20%' }}
        >
          {/* <Switch
            onChange={(checked) => handleInputChange('overrideMinOrMax', checked)} // Handle change
          /> */}
          <Checkbox
            onChange={(e) => handleInputChange('overrideMinOrMax', e.target.checked)} // Handle change
          > {t("overrideMinOrMax")} </Checkbox>

        </Form.Item>

        <Form.Item
          name="autoLogNconMinOrMaxOverride"
          valuePropName="checked" // Use checked for Checkbox
          initialValue={false} // Set initial value to false
          style={{ width: "60%", marginLeft: '20%' }} // Added flex styling
        >
          <Checkbox
            onChange={(e) => handleInputChange('autoLogNconMinOrMaxOverride', e.target.checked)} // Handle change
          > {t("autoLogNconMinOrMaxOverride")} </Checkbox>
          {/* <span style={{ marginLeft: '8px' }}>{t("autoLogNconMinOrMaxOverride")}</span>  */}
        </Form.Item>

        <Form.Item label={t("certification")} style={{ width: "60%" }} name="certification" required={false}>
          <Input
            placeholder=""
            disabled={!isCertification}
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "certification")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()                  // Convert to uppercase
                .replace(/\s+/g, '')            // Remove all spaces
                .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores
              handleInputChange("certification", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item label={t("ncCode")} style={{ width: "60%" }} name="ncCode" required={true}>
          <Input
            placeholder=""
            disabled={!isAutoLogNC}
            suffix={
              <GrChapterAdd
                onClick={(value) =>
                  handleClick(value, "ncCode")
                }
              />
            }
            onChange={(e) => {
              const newValue = e.target.value
                .toUpperCase()                  // Convert to uppercase
                .replace(/\s+/g, '')            // Remove all spaces
                .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores
              handleInputChange("ncCode", newValue); // Update the form with the new value
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("mask")}
          name="mask"

          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            disabled={!isMask}
            onChange={(e) =>
              handleInputChange('mask', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("unitOfMeasure")}
          name="unitOfMeasure"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('unitOfMeasure', e.target.value)
            }
          />
        </Form.Item>

        <Form.Item
          label={t("requiredDataEntries")}
          name="requiredDataEntries"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('requiredDataEntries', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Form.Item>

        <Form.Item
          label={t("optionalDataEntries")}
          name="optionalDataEntries"
          required={false}
          initialValue=""
          style={{ width: "60%" }}
        >
          <Input
            onChange={(e) =>
              handleInputChange('optionalDataEntries', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Form.Item>


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

export default DynamicForm;
