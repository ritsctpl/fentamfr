import React, { useState, useEffect, useContext } from 'react';
import { Table, Space, Input, message } from 'antd';
import { OperationContext } from '@modules/operationMaintenance/hooks/operationContext';
import { OperationCustomData } from '@modules/operationMaintenance/types/operationTypes';
import { retrieveCustomDataList } from '@services/operationService';
import { parseCookies } from 'nookies';
import { t } from 'i18next';
import debounce from 'lodash/debounce';

// Define a type for the common data from the API
interface CommonData {
  sequence: string;
  customData: string;
  fieldLabel: string;
  required: boolean;
}

const CustomDataTable: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const [commonData, setCommonData] = useState<CommonData[]>([]);
  const [customData, setCustomData] = useState<OperationCustomData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch common data from the API when the component mounts
  useEffect(() => {
    const fetchCommonData = async () => {
      setLoading(true);
      try {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;

        const response = await retrieveCustomDataList(site, 'Operation', userId);
        setCommonData(response);
      } catch (error) {
        console.error('Failed to fetch common data:', error);
        message.error('Failed to load common data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommonData();
  }, []);

  // Initialize customData whenever commonData or formData changes
  useEffect(() => {
    const initialCustomData = commonData.map(item => ({
      customData: item.customData,
      value: formData.operationCustomDataList?.find(customItem => customItem.customData === item.customData)?.value || ''
    }));
    setCustomData(initialCustomData);
  }, [commonData, formData]);

  // Handle changes in input fields
  const handleValueChange = debounce((value: string, customDataKey: string) => {
    const updatedCustomData = customData.map(item =>
      item.customData === customDataKey
        ? { ...item, value }
        : item
    );

    setCustomData(updatedCustomData);
    setFormData(prevFormData => ({
      ...prevFormData,
      operationCustomDataList: updatedCustomData
    }));
  })

  // Define columns for the table based on commonData
  const customDataTableColumns = [
    {
      title: t('customData'),
      dataIndex: 'customData',
      key: 'customData',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: t('data'),
      dataIndex: 'value',
      key: 'value',
      render: (text: string, record: CommonData) => (
        <Input
          value={customData.find(item => item.customData === record.customData)?.value || ''}
          onChange={(e) => handleValueChange(e.target.value, record.customData)}
        />
      ),
    }
  ];

  // Combine common data with custom data for the table
  const combinedData = commonData.map((commonItem) => {
    const userData = customData.find(item => item.customData === commonItem.customData);
    return {
      ...commonItem,
      value: userData ? userData.value : '',
    };
  });

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
      </Space>
      <Table
        bordered
        dataSource={combinedData}
        columns={customDataTableColumns}
        rowKey={(record) => record.customData} // Ensure this is a unique key
        loading={loading}
        pagination={false}
        scroll={{ y: 'calc(100vh - 520px)' }}
      />
    </div>
  );
};

export default CustomDataTable;
