import React, { useState } from 'react';
import { Form, Input, Button, Modal, Table, Tooltip, message } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { fetchTop50ReasonCode } from '../../services/reasonCodeService';
import { parseCookies } from 'nookies';
import { retrieveBatchNumberHeader, setUnHold } from '@services/holdunholdServices';

interface ChangeUnHoldStatusProps {
  filterFormData: any;
  selectedRowData: any;
  setCall1: (value: number) => void;
  call1 :any
}

const ChangeUnHoldStatus: React.FC<ChangeUnHoldStatusProps> = ({
  filterFormData,
  selectedRowData,
  setCall1,
  call1
}) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<string>('');
  const [reasonCodes, setReasonCodes] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredReasonCodes, setFilteredReasonCodes] = useState<any[]>([]);
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    console.log('Form values:', values);


    const request = {
      site: parseCookies()?.site || '',
      batchNumber: selectedRowData?.[0]?.batchNo,
      orderNo: selectedRowData?.[0]?.orderNumber,
  }
    const fetchBatchNum = await retrieveBatchNumberHeader(request);

    const data = {
      site: parseCookies().site || '',
      operation: filterFormData.defaultOperation,
      phase: filterFormData.defaultPhaseId,
      phaseId: filterFormData.defaultPhaseId,
      resource: filterFormData.defaultResource,
      recipe: fetchBatchNum?.response?.recipeName,
      recipeVersion: fetchBatchNum?.response?.recipeVersion,
      material: fetchBatchNum?.response?.material,
      materialVersion: fetchBatchNum?.response?.materialVersion,
      ...selectedRowData?.[0],
    }
    const response = await setUnHold(data);
    console.log(response, "response");
    if (response?.message_details?.msg_type === 'S') {
      message.success(response?.message_details?.msg);
      setCall1(call1+1)
  } else {
      message.error(response?.message);
  }
  };

  const openModal = async () => {
    try {
      const site = parseCookies().site || '';
      const codes = await fetchTop50ReasonCode(site);
      const codesWithKeys = codes.map((code: any) => ({
        ...code,
        key: code.reasonCode
      }));
      setReasonCodes(codesWithKeys);
      // Filter based on current input value
      const currentSearchText = form.getFieldValue('reasonCode') || '';
      const filtered = codesWithKeys.filter(code => 
        code.reasonCode.toLowerCase().includes(currentSearchText.toLowerCase()) ||
        code.description.toLowerCase().includes(currentSearchText.toLowerCase())
      );
      setFilteredReasonCodes(filtered);
      setSearchText(currentSearchText);
      setVisible(true);
    } catch (error) {
      console.error('Error fetching reason codes:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = reasonCodes.filter(code => 
      code.reasonCode.toLowerCase().includes(value.toLowerCase()) ||
      code.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredReasonCodes(filtered);
  };

  const handleModalOk = () => {
    if (selectedRow) {
      form.setFieldsValue({
        reasonCode: selectedRow.reasonCode,
      });
      setVisible(false);
    }
  };

  const handleModalCancel = () => {
    setVisible(false);
  };

  const handleRowSelection = (record: any) => {
    console.log('Selected row:', record);
    setSelectedRow(record);
    setSelectedRowKey(record.reasonCode);
    form.setFieldsValue({
      reasonCode: record.reasonCode,
    });
    setVisible(false);
  };

  const tableColumns = [
    { title: t('reasonCode'), dataIndex: 'reasonCode', key: 'reasonCode' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
  ];

  const rowSelection = {
    type: 'radio' as const,
    selectedRowKeys: [selectedRowKey],
    onChange: (_: React.Key[], selectedRows: any[]) => {
      if (selectedRows.length > 0) {
        handleRowSelection(selectedRows[0]);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
    }}>
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleSubmit}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
          borderRadius: '8px',
          background: '#fff'
        }}
      >
        <Form.Item
          label={t('reasonCode')}
          name="reasonCode"
          rules={[{ required: true, message: t('Please select a reason code') }]}
        >
          <Input
            placeholder={t('Select reason code')}
            onChange={(e) => handleSearch(e.target.value)}
            suffix={
              <GrChapterAdd onClick={openModal} style={{ cursor: 'pointer' }} />
            }
          />
        </Form.Item>

        <Form.Item
          label={t('comment')}
          name="comment"
          rules={[{ required: true, message: t('Please enter a comment') }]}
        >
          <Input
            placeholder={t('Enter comment')}
          />
        </Form.Item>

        <Form.Item
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            type="primary"
            htmlType="submit"
          >
            UNHOLD
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title={t('Select Reason Code')}
        open={visible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
      >
        <Table
          columns={tableColumns}
          dataSource={filteredReasonCodes}
          rowSelection={rowSelection}
          onRow={(record) => ({
            onClick: () => handleRowSelection(record),
            style: {
              cursor: 'pointer',
              background: record.reasonCode === selectedRowKey ? '#e6f7ff' : 'transparent'
            }
          })}
          pagination={{
            pageSize: 6,
          }}
        />
      </Modal>
    </div>
  );
};

export default ChangeUnHoldStatus;