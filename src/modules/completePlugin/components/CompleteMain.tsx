import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Button, InputNumber, Row, Col, Select, message, Switch } from 'antd';
import { decryptToken } from '@utils/encryption';
import { DecodedToken } from '../types/changeEquipmentType';
import jwtDecode from 'jwt-decode';
import { useAuth } from '@context/AuthContext';
import { completeBatch, completePcu, fetchStart, retrieveBatchNumberHeader,  } from '@services/podServices';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { Option } from 'antd/es/mentions';
import { retrieveAllReasonCodeBySite } from '@services/reasonCodeService';
 
interface BatchCompleteProps {
  filterFormData: any;
  selectedRowData: any[]; 
  
  call1:any
  setFilterFormData:any
  setPhaseId:any
  onRemoveContainer:any
  buttonId:any
  call2:any
  phaseByDefault: any;
  data:any
  selectedContainer:any
  buttonLabel:any;
  setCall1: (value: number) => void;
  setSelectedRowData:any
}
 
const CompleteMain: React.FC<BatchCompleteProps> = ({ data,buttonLabel, filterFormData, selectedRowData , call1, call2,setFilterFormData,setPhaseId ,
  onRemoveContainer,buttonId, phaseByDefault, selectedContainer, setCall1, setSelectedRowData}) => {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [isScrapFilled, setIsScrapFilled] = useState(false);
  const [reasonCode, setreasonCode] = useState(null)
  const [reasonCodeArray, setreasonCodeArray] = useState([])
  const { t } = useTranslation();
 
  useEffect(() => {
    const decryptedToken = decryptToken(token);
    // const decoded: DecodedToken = jwtDecode(decryptedToken);
    if (selectedRowData?.length == 1) {
      form.setFieldsValue({
        productName: selectedRowData?.[0]?.item || '',
        batchNo: selectedRowData?.[0]?.batchNo || '',
        phase: filterFormData?.defaultPhaseId || phaseByDefault,
        operation: filterFormData?.defaultOperation || '',
        qty: filterFormData?.qtty ||  selectedRowData?.[0]?.qty || '',
        yieldQuantity: undefined,
        scrapQuantity: undefined,
        reasonCode: undefined,
        yieldPercentage: undefined,
        reason: '',
        uom: 'KG',
        finalReport: false,
      });
    }
  }, [selectedRowData, form, token, filterFormData, call2, data]);

  // useEffect(() => {
  //   const cookies = parseCookies();
  //   const site = cookies?.site;
  //   const fetchReasonCodes = async () => {
  //     const reasonCodes = await retrieveAllReasonCodeBySite(site);
  //     console.log('Reason codes:', reasonCodes);
  //     setreasonCodeArray(reasonCodes);
  //     // setreasonCodeDefault(reasonCodes[0]?.reasonCode)

  //   };
  //   fetchReasonCodes();
  // }, []);
 

  const getItemAndVersion = async () => {
    const cookies = parseCookies(); 
    const site = cookies?.site;
    const user = cookies?.rl_user_id;
    const batchNumber = form.getFieldValue('batchNo');
    const orderNumber =  selectedRowData?.[0]?.orderNumber;

    const request = {
      site: site,
      batchNumber: batchNumber,
      orderNo: orderNumber,
      user: user,
    }
    // debugger
    try{
    const response = await retrieveBatchNumberHeader(request);
    return response?.errorCode? null : response;
    }
    catch(e){
      console.error("Error retrievig=ng batch header: ", e);
    }
    
    
  }
 
  const onFinish = async (values: any) => {

    const { yield: yieldValue, batchSize, qty } = values;
    const cookies = parseCookies();
    const site = cookies?.site;
    const user = cookies?.rl_user_id;
    let request;
    // Set yieldPercentage to qty if it is empty
    const yieldPercentage = values?.yieldPercentage || qty;
    values = delete values?.phase
    try{
    const itemObject = await getItemAndVersion() as any;

    
     request = {
      "sync": true,
      "completeBatches": [
        {
         
          batchNumber: form.getFieldValue('batchNo'),
          quantity: form.getFieldValue('qty')|| 0,
          resource: filterFormData?.defaultResource || '',
          workCenter: selectedRowData[0]?.workCenter || '',
          user: user,
          orderNumber: selectedRowData[0]?.orderNumber || '',
          material: selectedRowData[0]?.material || itemObject?.response?.material || '',
          materialVersion: selectedRowData[0]?.materialVersion || itemObject?.response?.materialVersion || '',
          recipe: itemObject?.response?.recipeName,
          recipeVersion: itemObject?.response?.recipeVersion,
          site: site,
          phase:  filterFormData?.defaultPhaseId || phaseByDefault || '',
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
  catch(e){
    console.error("error retrieving batch header ", e);
  }



    try {
      
      const res =filterFormData?.podCategory?.toLowerCase() === 'process' || filterFormData?.podCategory?.toLowerCase() === 'processorder' ?  await completeBatch(request) : await completePcu(request)
      message.destroy();
      // debugger
      
      if(res?.status === 'success' && !res?.errorCode){
        message.success(res?.batchDetails[0]?.message);
        // console.log(buttonLabel)
        onRemoveContainer(buttonLabel)
        setCall1(call1 + 1);
        

        // check for clearPCU
        const currentButton = filterFormData?.buttonList?.find(button => 
          button.activityList?.some(activity => activity.url?.includes("complete")
        )
        );
        // console.log("currentButton", currentButton);
        const shouldClearPCU = currentButton?.activityList?.[0]?.clearsPcu;
        // console.log("shouldClearPCU", shouldClearPCU);
        if (shouldClearPCU) {
          setSelectedRowData([]);
        }

        setFilterFormData(prev => ({
          qtty:null,
          ...prev,
          
        }));
        form.setFieldsValue({
          qty: null,
        });
      }
      else if(res?.errorCode){
        message.error(res?.message);
        // onRemoveContainer(buttonLabel)
      }
      else{
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
 
  const handleClear = () => {
    // Set specific fields to undefined to clear them
    form.setFieldsValue({
      batchSize: undefined,
      yield: undefined,
      scrap: undefined,
      yieldPercentage: undefined,
      reason: '',
    });
    setIsScrapFilled(false); // Reset the scrap filled state
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
      <div style={{ maxWidth: '800px', margin: '30px auto', height: 'calc(100vh - 200px)' }}>
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
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="UOM" name="uom">
                <Select style={{ width: '100%' }} defaultValue="KG">
                  <Select.Option value="PCS">PCS</Select.Option>
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
 
            {/* <Col span={12}>
              <Form.Item label="Scrap Quantity" name="scrapQuantity">
                <InputNumber type='number'  style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Reason Code" name="reasonCode">
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
            </Col> */}
            <Col span={12}>
              <Form.Item label="Final Report" name="finalReport" rules={[{ required: false, }]}>
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item  wrapperCol={{ offset: 8 }}>
                <Button type="primary" htmlType="submit">
                  {t('complete')}
                </Button>
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
 
         
 
        </Form>
      </div>
    </>
  );
};
 
export default CompleteMain;