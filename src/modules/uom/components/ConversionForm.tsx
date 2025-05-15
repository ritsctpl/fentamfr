import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Select, Button, Switch, Modal, Table, Checkbox, Tooltip } from "antd";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";

import { fetchAllActivityGroup, retrieveAllBOMBySite } from "@services/activityService";
import { useTranslation } from "react-i18next";
import { UomContext } from "../hooks/UomContext";
import { SearchOutlined } from "@mui/icons-material";
import { retrieveTop50Item } from "@services/uomService";

const { Option } = Select;
const { TextArea } = Input;



interface ConversionFormProps {
  onChange: (values: Record<string, any>) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  rowSelectedData: [];
}



interface FormField {
  checked: boolean;
  type: 'input' | 'number' | 'select' | 'switch' | 'checkbox' | 'browse' | 'selectBrowse';
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
  addClickCount: number;

}

const ConversionForm: React.FC<ConversionFormProps> = ({
  onChange,
  layout = 'horizontal',
  labelCol = { span: 8 },
  wrapperCol = { span: 12 },
  rowSelectedData
}) => {
  const { uomConversionPayload,
    setUomConversionPayload, showAlertForConversion, setShowAlertForConversion, selectedRowData } = useContext<any>(UomContext);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isRatio, setIsRatio] = useState<any>(uomConversionPayload?.convertionItem);
  const [isBaseCount, setIsBaseCount] = useState<any>(uomConversionPayload?.baseUnit);
  const [isConversionUnitCount, setIsConversionUnitCount] = useState<any>(uomConversionPayload?.conversionUnit);




  useEffect(() => {
    if (selectedRowData) {
      form.setFieldsValue(selectedRowData)
      setIsRatio(selectedRowData?.convertionItem)
      setIsBaseCount(selectedRowData?.baseUnit)
      setIsConversionUnitCount(selectedRowData?.conversionUnit)


    }
  }, [rowSelectedData, selectedRowData]);

  useEffect(() => {
    // debugger
    form.setFieldsValue(uomConversionPayload);
  }, [uomConversionPayload]);


  useEffect(() => {
    if (uomConversionPayload) {
      // Set all form fields from the payload
      form.setFieldsValue({
        convertionItem: uomConversionPayload?.convertionItem,
        baseUnit: uomConversionPayload?.baseUnit,
        baseAmt: uomConversionPayload?.baseAmt,
        conversionUnit: uomConversionPayload?.conversionUnit,
        material: uomConversionPayload?.material,
        materialVersion: uomConversionPayload?.materialVersion
      });
    }
  }, [uomConversionPayload, form]);


  const handleSelectChange = (fieldName: string, value: string) => {
    // Update the form field value
    // debugger
    form.setFieldsValue({ [fieldName]: value });

    setShowAlertForConversion(true);
    setUomConversionPayload(prevPayloadData => {
      return {
        ...prevPayloadData,
        [fieldName]: value, // Update other fields
      };
    });
    setShowAlertForConversion(true);
  };




  const handleModalOk = () => {
    if (selectedRow) {

      setShowAlertForConversion(true)

      // Reset modal states
      setSelectedRow(null);
      setVisible(false);

    }
  };


  const handleLiveChange = (fieldName: string, value: any) => {
    // Convert the value to uppercase, remove spaces, and allow only underscores
    const sanitizedValue = value
      .toUpperCase()                  // Convert to uppercase
      .replace(/\s+/g, '')            // Remove all spaces
      .replace(/[^A-Z0-9_]/g, '');    // Remove all special characters except underscores

    // Update the form field with the sanitized value
    form.setFieldsValue({ [fieldName]: sanitizedValue });
    setShowAlertForConversion(true)


    // Handle update for both routingStepList and other fields
    setUomConversionPayload(prevPayloadData => {
      return {
        ...prevPayloadData,

        [fieldName]: sanitizedValue,
      };
    });

    // Notify about the form change (if needed)

  };




  const openModal = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      let response;
      response = await retrieveTop50Item(site);
      response = response.map((items, index) => ({
        ...items,
        key: index,
        id: index,
        material: items.item
      }));
      setTableData(response);
      console.log("response: ", response);

      setTableColumns([
        { title: 'Material', dataIndex: 'material', key: 'material' },
        { title: 'Version', dataIndex: 'revision', key: 'revision' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
      ]);

      setVisible(true);
    } catch (error) {
      console.error("Error fetching all BOM list:", error);
    }
  };


  const handleModalCancel = () => {
    setVisible(false);
  };

  const handleRowSelection = (record: any) => {
    // debugger
    setSelectedRow(record);
    setUomConversionPayload(prev => ({
      ...prev,
      material: record.material,
      materialVersion: record.revision
    }));
    setVisible(false);
  };







  const handleNumericInput = (value: string, field: FormField) => {
    // Remove any non-numeric characters except for decimal point
    let numericValue = value.replace(/[^0-9.]/g, '');

    // Remove leading zeros, but keep a single zero if it's the only digit
    numericValue = numericValue.replace(/^0+(?=\d)/, '');

    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Remove any 'e' or 'E' characters
    numericValue = numericValue.replace(/[eE]/g, '');

    // If the result is an empty string, set it to '0'
    if (numericValue === '') {
      numericValue = '0';
    }

    // Update the form field with the numeric value
    form.setFieldsValue({ [field.name]: +numericValue });

    setShowAlertForConversion(true);

    // Update the payload data
    setUomConversionPayload(prevPayloadData => ({
      ...prevPayloadData,
      [field.name]: numericValue,
    }));

    return numericValue;
  };


  const { t } = useTranslation();





  const handleSubmit = (values: any) => {

  };

  const unitOptions = [
    { value: 'g', label: 'Gram (g)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'l', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (mL)' },
    { value: 'count', label: 'Count' },
  ];

  const operationOptions = [
    { value: 'multiply', label: 'Multiply' },
    { value: 'division', label: 'Division' },
    { value: 'ratio', label: 'Ratio' },
  ];

  return (
    <>
      <Form
        form={form}
        layout={layout}
        onFinish={handleSubmit}
        style={{
          width: '100%',
          // maxHeight: '100vh',
          // overflowY: 'auto',
          marginTop: 16,
        }}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 12 }}
      >

        <Form.Item
          label={t('conversionFactor')}
          name="convertionItem"
          rules={[{ required: false, message: 'Please select conversion factor' }]}
        >
          <Select onChange={(value) => handleSelectChange('convertionItem', value)} value={uomConversionPayload?.convertionItem} options={operationOptions} />
        </Form.Item>

        <Form.Item
          label={t('baseUnit')}
          name="baseUnit"
          rules={[{ required: false, message: 'Please select base unit' }]}
        >
          <Select onChange={(value) => handleSelectChange('baseUnit', value)} options={unitOptions} value={uomConversionPayload?.baseUnit} />
        </Form.Item>

        <Form.Item
          label={t('formula')}
          name="baseAmt"
          rules={[{ required: true, message: 'Please input formula' }]}
        >
          <Input
            type="number"
            onChange={(e) => handleNumericInput(e.target.value, { name: 'baseAmt' } as FormField)}
            value={uomConversionPayload?.baseAmt}
          />
        </Form.Item>


        <Form.Item
          label={t('conversionUnit')}
          name="conversionUnit"
          rules={[{ required: false, message: 'Please select conversion unit' }]}
        >
          <Select onChange={(value) => handleSelectChange('conversionUnit', value)} options={unitOptions} value={uomConversionPayload?.conversionUnit} />
        </Form.Item>



        {/* {uomConversionPayload?.convertionItem == 'ratio' && <Form.Item
          label={t('count')}
          name="count"
          rules={[{ required: true, message: 'Please input count' }]}
        >
          <Input
            type="number"
            onChange={(e) => handleNumericInput(e.target.value, { name: 'count' } as FormField)}
            value={uomConversionPayload?.count}
          />
        </Form.Item>
        } */}

        {isRatio == 'ratio' && (isBaseCount == 'count' ||
          isConversionUnitCount == 'count') && <Form.Item
            label={t('material')}
            name="material"
            rules={[{ required: true, message: 'Please input material' }]}
          >
            <Input
              suffix={<GrChapterAdd onClick={() => openModal()} />}
              onChange={(e) => handleLiveChange('material', e.target.value)}
              value={uomConversionPayload?.material}
            />
          </Form.Item>
        }

        {isRatio == 'ratio' && (isBaseCount == 'count' ||
          isConversionUnitCount == 'count') && <Form.Item
            label={t('version')}
            name="materialVersion"
            rules={[{ required: true, message: 'Please input version' }]}
          >
            <Input onChange={(e) => handleLiveChange('materialVersion', e.target.value)} value={uomConversionPayload?.materialVersion} />
          </Form.Item>
        }

      </Form>


      <Modal
        title={t('selectMaterial')}
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
          pagination={false}
          scroll={{ y: 'calc(100vh - 400px)' }}
        />
      </Modal>

    </>
  );
};

export default ConversionForm;