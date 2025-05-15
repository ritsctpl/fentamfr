import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Button, InputNumber, Row, Col, Select, message, Switch } from 'antd';
import { decryptToken } from '@utils/encryption';
import { DecodedToken } from '../types/changeEquipmentType';
import jwtDecode from 'jwt-decode';
import { useAuth } from '@context/AuthContext';
import { completeBatch, completePcu, fetchStart, retrieveBatchNumberHeader, } from '@services/podServices';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { Option } from 'antd/es/mentions';
import { retrieveAllReasonCodeBySite } from '@services/reasonCodeService';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';

interface YieldConfirmationProps {
  filterFormData: any;
  selectedRowData: any[];

  call1: any
  setFilterFormData: any
  setPhaseId: any
  onRemoveContainer: any
  buttonId: any
  call2: any
  phaseByDefault: any;
  data: any
  selectedContainer: any
  buttonLabel: any;
  setCall1: (value: number) => void;
  setSelectedRowData: any
}

const YieldConfirmation: React.FC<YieldConfirmationProps> = ({ data, buttonLabel, filterFormData, selectedRowData, call1, call2, setFilterFormData, setPhaseId,
  onRemoveContainer, buttonId, phaseByDefault, selectedContainer, setCall1, setSelectedRowData }) => {
  console.log(phaseByDefault, "phaseByDefault");

  const { token } = useAuth();
  const [form] = Form.useForm();
  const [isScrapFilled, setIsScrapFilled] = useState(false);
  const [scrapQty, setScrapQty] = useState(0)
  const [reasonCodeArray, setreasonCodeArray] = useState([])
  const { t } = useTranslation();
  console.log(selectedRowData, "selectedRowData");

  console.log(data, "data");
  // Effect to set initial values based on selectedRowData
  console.log("selectedContainer", selectedContainer);
  useEffect(() => {
    try {
      const decryptedToken = decryptToken(token);
      const decoded: DecodedToken = jwtDecode(decryptedToken);
      if (selectedRowData.length == 1) {
        form.setFieldsValue({
          productName: selectedRowData[0]?.item || '',
          batchNo: selectedRowData[0]?.batchNo || '',
          phase: filterFormData?.defaultPhaseId || phaseByDefault || selectedRowData[0]?.phaseId,
          operation: filterFormData?.defaultOperation || '',
          qty: filterFormData?.qtty || selectedRowData[0]?.qty || '',
          yieldQuantity: undefined,
          scrapQuantity: undefined,
          reasonCode: undefined,
          yieldPercentage: undefined,
          reason: '',
          uom: selectedRowData[0]?.uom,
          finalReport: false,
        });
      }
    }
    catch (e) {
      console.error("Error in decoding the token", e);
    }
  }, [selectedRowData, form, token, filterFormData, call2, data]);

  useEffect(() => {
    const cookies = parseCookies();
    const site = cookies?.site;
    const fetchReasonCodes = async () => {
      try {
        const reasonCodes = await retrieveAllReasonCodeBySite(site);
        setreasonCodeArray(reasonCodes);
        // setreasonCodeDefault(reasonCodes[0]?.reasonCode)
      }
      catch (e) {
        console.error("Error in retrieving the reason code", e);
      }

    };
    fetchReasonCodes();
  }, []);


  const getItemAndVersion = async () => {
    const cookies = parseCookies();
    const site = cookies?.site;
    const user = cookies?.rl_user_id;
    const batchNumber = form.getFieldValue('batchNo');
    const orderNumber = selectedRowData?.[0]?.orderNumber;
    try {
      const request = {
        site: site,
        batchNumber: batchNumber,
        orderNo: orderNumber,
        user: user,
      }
      // debugger
      const response = await retrieveBatchNumberHeader(request);
      return response;
    }
    catch (e) {
      console.error("Error in retrieving the batch header", e);
    }
  }

  const onFinish = async (values: any) => {

    const { yield: yieldValue, batchSize, qty } = values;
    const cookies = parseCookies();
    const site = cookies?.site;
    const user = cookies?.rl_user_id;
    let request;
    // Set yieldPercentage to qty if it is empty
    const yieldPercentage = values.yieldPercentage || qty;
    values = delete values?.phase
    try {
      const itemObject = await getItemAndVersion() as any;

      request = {
        "sync": true,
        "completeBatches": [
          {
            batchNumber: form.getFieldValue('batchNo'),
            quantity: form.getFieldValue('qty') || 0,
            resource: filterFormData?.defaultResource || '',
            workCenter: selectedRowData[0]?.workCenter || '',
            user: user,
            orderNumber: selectedRowData[0]?.orderNumber || '',
            material: selectedRowData[0]?.material || itemObject?.response?.material || '',
            materialVersion: selectedRowData[0]?.materialVersion || itemObject?.response?.materialVersion || '',
            recipe: itemObject?.response?.recipeName,
            recipeVersion: itemObject?.response?.recipeVersion,
            site: site,
            phase: filterFormData?.defaultPhaseId || phaseByDefault || selectedRowData[0]?.phaseId,
            operation: filterFormData?.defaultOperation || '',
            yieldQuantity: form.getFieldValue('yieldQuantity') || 0,
            scrapQuantity: form.getFieldValue('scrapQuantity') || 0,
            reasonCode: form.getFieldValue('reasonCode') || 'Unknown',
            uom: form.getFieldValue('uom'),
            finalReport: form.getFieldValue('finalReport'),
          }
        ]
      }
    }
    catch (e) {
      console.error("Error in fetching the batch details from header");
    }

    try {
      const res = filterFormData?.podCategory?.toLowerCase() === 'process' || filterFormData?.podCategory?.toLowerCase() === 'processorder' ? await completeBatch(request) : await completePcu(request)
      message.destroy();
      // debugger
      if (res?.status === 'success' && !res?.errorCode) {
        message.success(res?.batchDetails[0]?.message);
        // console.log(buttonLabel)
        onRemoveContainer(buttonLabel)
        setCall1(call1 + 1);


        // check for clearPCU
        const currentButton = filterFormData?.buttonList?.find(button =>
          button.activityList?.some(activity => activity.url?.includes("yieldConfirmation")
          )
        );
        console.log("currentButton", currentButton);
        const shouldClearPCU = currentButton?.activityList?.[0]?.clearsPcu;
        console.log("shouldClearPCU", shouldClearPCU);
        if (shouldClearPCU) {
          setSelectedRowData([]);
        }

        setFilterFormData(prev => ({
          qtty: null,
          ...prev,

        }));
        form.setFieldsValue({
          qty: null,
        });
      }
      else if (res?.errorCode) {
        message.error(res?.message);
        // onRemoveContainer(buttonLabel)
      }
      else {
        message.error(res?.batchDetails[0]?.message);
        // onRemoveContainer(buttonLabel)
      }


    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const onValuesChange = (changedValues: any) => {
    if (changedValues.scrap !== undefined) {
      setIsScrapFilled(changedValues.scrap > 0);
    }
  };



  return (
    <>
      <style>
        {`
          // .small-label-form .ant-form-item-label > label {
          //   font-size: 12px !important;
          // }
        `}
      </style>
      <div style={{ maxWidth: '800px', margin: '20px auto', height: 'calc(100vh - 200px)' }}>
        <Form
          layout="horizontal"
          form={form}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
          size="small"
          className="small-label-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Batch No" name="batchNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phase" name="phase">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>

            <Col span={12}>
              <Form.Item label="Operation" name="operation">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Qty" name="qty">
                <InputNumber min={0} style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="UOM" name="uom">
                <Select style={{ width: '100%' }} defaultValue="KG">
                  <Select.Option value="PCS">PCS</Select.Option>
                  <Select.Option value="EA">EA</Select.Option>
                  <Select.Option value="KG">KG</Select.Option>
                  <Select.Option value="LBS">LBS</Select.Option>
                  <Select.Option value="M">M</Select.Option>
                  <Select.Option value="FT">FT</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Yield" name="yieldQuantity">
                <InputNumber

                  style={{ width: '100%' }}
                  formatter={value => `${value}`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>

            <Col span={12}>
              <Form.Item label="Rejection Quantity" name="scrapQuantity">
                <InputNumber style={{ width: '100%' }} onChange={(value: number | null) => setScrapQty(value || 0)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Reason Code" name="reasonCode" rules={[{ required: scrapQty > 0 }]}>
                <Select
                  style={{ width: '100%' }}
                  placeholder={t('selectReasonCode')}
                >
                  {reasonCodeArray?.map(reason => (
                    <Option key={reason.reasonCode} value={reason.reasonCode} >
                      {reason.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Final Report" name="finalReport" rules={[{ required: false, }]}>
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item wrapperCol={{ offset: 8 }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button type="primary" htmlType="submit">
                    {t('complete')}
                  </Button>
                  <span>
                    <InstructionModal title="Yield Confirmation">
                      <UserInstructions />
                    </InstructionModal>
                  </span>
                </div>
              </Form.Item>
            </Col>
          </Row>

          {isScrapFilled && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Reason"
                  name="reason"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 19 }}
                  rules={[{ required: true, message: 'Please input reason for scrap' }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* <Form.Item wrapperCol={{ offset: 8, span: 8 }} style={{ textAlign: 'center', width: '100%' }}>
            <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
              {t('complete')}
            </Button>
          </Form.Item> */}

        </Form>
      </div>
    </>
  );
};

export default YieldConfirmation;