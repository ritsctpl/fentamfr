'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Space, Modal, Table, message } from 'antd';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { fetchAllProcessOrder } from '@services/processOrderService';
import { fetchTop50OrderNos } from '@services/equResourceService';
import { retrieveBatchNumber, retrieveBatchStepStatus } from '@services/podServices';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from '@modules/buyOff/components/userInstructions';

interface BatchStepStatusBarProps {
  setBatchStepStatusData: (data: any) => void;
}

const BatchStepStatusBar: React.FC<BatchStepStatusBarProps> = ({ setBatchStepStatusData }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [batchNumberVisible, setBatchNumberVisible] = useState(false);
  const [batchNumberData, setBatchNumberData] = useState([]);

  const [orderNumberVisible, setOrderNumberVisible] = useState(false);
  const [orderNumberData, setOrderNumberData] = useState([]);

  const manualContent = [
    {
      title: 'Batch Step Status User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the Batch Step Status Screen for logging, updating, and tracking maintenance activities.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'Batch Step Status' }
              ]
            }
          }
        },
        {
          title: '2. System Access',
          content: {
            type: 'table',
            data: {
              headers: ['Item', 'Description'],
              rows: [
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/batchStepStatus' },
                { Item: 'Login Requirement', Description: 'Username & Password' },
                { Item: 'Access Roles', Description: 'Technician, Supervisor, Admin' }
              ]
            }
          }
        },
        {
          title: '3. Navigation Path',
          content: {
            type: 'text',
            data: 'Main Menu →  Batch Step Status Maintenance →  Batch Step Status'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by Batch Number and Order Number' },
                { Section: 'Browse', Description: 'Lists past batch number records (columns like Batch Number, Order Number)' },
                { Section: 'Action Buttons', Description: 'GO, Clear' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Find Order Status',
              content: {
                type: 'steps',
                data: [
                  {
                    text: 'Select the Batch Number or Order Number',
                    subSteps: [
                      'Batch Number (Browse)',
                      'Order Number (Browse)',
                    ]
                  },
                  'Click "GO"',
                  'Order Status will be displayed',
                  {
                    text: 'Order Status Table',
                    subSteps: [
                      'Phase Id',
                      'Operation',
                      'In Queue Qty',
                      'Batch Started Time',
                      'In Work Qty',
                      'Complete Qty',
                      'Batch Completed Time',
                      'Scrap Qty',
                      'Product Code',
                      'Product Name',
                      'Approval',
                      'Batch Status'
                    ]
                  },
                  'Click "Clear" to clear the filters'
                ]
              }
            },
          ]
        },
        {
          title: '6. Field Definitions',
          content: {
            type: 'table',
            data: {
              headers: ['Field Name', 'Description', 'Required'],
              rows: [
                { 'Field Name': 'Batch Number', Description: 'Based on the batch number, the order status will displayed', Required: 'Yes' },
                { 'Field Name': 'Order Number', Description: 'Based on the order number, the order status will displayed', Required: 'Yes' },
              ]
            }
          }
        },
        {
          title: '9. FAQs / Troubleshooting',
          content: {
            type: 'table',
            data: {
              headers: ['Issue', 'Solution'],
              rows: [
                { 'Issue': 'No data is displayed', 'Solution': 'Please check the batch number or order number is released in multi order release and displayed in the pod' },
              ]
            }
          }
        }
      ]
    }
  ];

  const handleClear = () => {
    form.resetFields();
    setBatchStepStatusData([]);
  };

  const handleCancel = () => {
    setBatchNumberVisible(false);
    setOrderNumberVisible(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value;

    const patterns: { [key: string]: RegExp } = {
      batchNumber: /^[A-Z0-9_]*$/,
      orderNumber: /^[A-Z0-9_]*$/,
    };

    if (key === 'batchNumber' || key === 'orderNumber') {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    }

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
    }
  };

  // Batch Number
  const handleBatchNumberOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        batchNumber: selectedRow.batchNo,
      });
    }

    setBatchNumberVisible(false);
  };

  const handleBatchNumberClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const batchNumber = form.getFieldValue('batchNumber');

    try {
      let response;
      if (batchNumber) {
        response = await retrieveBatchNumber({ site, batchNumber: batchNumber });
        if (response && !response.errorCode) {
          const formattedData = response.batchNos.map((item: any, index: number) => ({
            id: index,
            ...item,
          }));
          
          setBatchNumberData(formattedData);
        } else {
          setBatchNumberData([]);
        }
      } else {
        response = await retrieveBatchNumber({ site });
        if (response && !response.errorCode) {
          const formattedData = response.batchNos.map((item: any, index: number) => ({
            id: index,
            ...item,
          }));
          
          setBatchNumberData(formattedData);
        } else {
          setBatchNumberData([]);
        }
      }

    } catch (error) {
      console.error('Error', error);
    }

    setBatchNumberVisible(true);
  };


  const batchNumberColumn = [
    {
      title: t("batchNumber"),
      dataIndex: "batchNo",
      key: "batchNo",
    }
  ]

  // Material

  const handleOrderNumberClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const orderNumber = form.getFieldValue('orderNumber');
    
    try {
      let response;
      if (orderNumber) {
        response = await fetchAllProcessOrder(site, orderNumber);
        if (response && !response.errorCode) {
          const formattedData = response.processOrderResponseList.map((item: any, index: number) => ({
            id: index,
            ...item,
          }));
          
          setOrderNumberData(formattedData);
        } else {
          setOrderNumberData([]);
        }
      } else {
        const request = {
          site: site
        }
        response = await fetchTop50OrderNos(request);
        if (response && !response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,
            ...item,
          }));
          
          setOrderNumberData(formattedData);
        } else {
          setOrderNumberData([]);
        }
      }

    } catch (error) {
      console.error('Error', error);
    }

    setOrderNumberVisible(true);
  };

  const handleOrderNumberOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        orderNumber: selectedRow.orderNumber,
        orderType: selectedRow.orderType,
        batchNumber: selectedRow.batchNumber,
      });
    }

    setOrderNumberVisible(false);
  };

  const orderNumberColumn = [
    {
      title: t("orderNumber"),
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: t("orderType"),
      dataIndex: "orderType",
      key: "orderType",
    },
    {
      title: t("batchNumber"),
      dataIndex: "batchNumber",
      key: "batchNumber",
    },
    {
      title: t("releaseTime"),
      dataIndex: "orderReleasedTime",
      key: "orderReleasedTime",
    }
  ]

  const handleSubmit = async (values: any) => {
    const cookies = parseCookies();
    const site = cookies.site;

    if (!values.batchNumber && !values.orderNumber) {
      message.error(t('Please provide either Batch Number or Order Number'));
      return;
    }

    const payload = {
      site,
      batchNo: values.batchNumber,
      orderNumber: values.orderNumber,
    }
    const response = await retrieveBatchStepStatus(payload);
    if(response.message){
      message.error(response.message);
      setBatchStepStatusData([]);
    }
    else{
      const processedData = response.flatMap(item => 
        item.stepStatusList.map(step => ({
          ...step,
          orderNo: item.orderNo,
          batchNo: item.batchNo
        }))
      );
      setBatchStepStatusData(processedData || []);
    }
  }

  return (
    <div style={{ width: '100%', paddingLeft: '16px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          alignItems: 'center',
          margin: '16px 16px 16px 0px',
          height: '100px',
        }}
      >
        <Form.Item
          name="batchNumber"
          label={t("batchNumber")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <Input
            suffix={
              <GrChapterAdd
                onClick={() =>
                  handleBatchNumberClick()
                }
              />
            }
            onChange={(e) => handleInputChange(e, 'batchNumber')}
          />
        </Form.Item>

        <Form.Item
          name="orderNumber"
          label={t("orderNumber")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <Input
            suffix={
              <GrChapterAdd
                onClick={() =>
                  handleOrderNumberClick()
                }
              />
            }
            onChange={(e) => handleInputChange(e, 'orderNumber')}
          />
        </Form.Item>

        <Form.Item
          style={{
            marginBottom: '-20px',
            width: '100%',
            display: 'flex',
          }}
        >
          <Space size={16}>
            <Button type="primary" htmlType="submit">
              {t('go')}
            </Button>
            <Button onClick={handleClear}>
              {t('clear')}
            </Button>
            <InstructionModal title="BatchStepStatusMaintenance">
              <UserInstructions manualContent={manualContent}/>
            </InstructionModal>
          </Space>
        </Form.Item>
      </Form>

      <Modal
        title={t("selectBatchNumber")}
        open={batchNumberVisible}
        onCancel={handleCancel}
        width={800}
        
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
            onDoubleClick: () => handleBatchNumberOk(record),
          })}
          bordered
          columns={batchNumberColumn}
          dataSource={batchNumberData}
          rowKey="batchNo"
          pagination={false}
          scroll={{ y: 'calc(100vh - 420px)' }}
        />
      </Modal>

      <Modal
        title={t("selectOrderNumber")}
        open={orderNumberVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
            onDoubleClick: () => handleOrderNumberOk(record),
          })}
          bordered
          columns={orderNumberColumn}
          dataSource={orderNumberData}
          rowKey="orderNumber"
          pagination={false}
          scroll={{ y: 'calc(100vh - 420px)' }}
        />
      </Modal>
    </div>
  );
};

export default BatchStepStatusBar;
