import React, { useState, useEffect, useContext } from 'react';
import { Table, Input, message, Space } from 'antd';
import { retrieveCustomDataList } from '@services/operationService';
import { parseCookies } from 'nookies';
import { ShiftContext } from '../hooks/shiftContext';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';
import { CustomData } from '@modules/shiftMaintenance/types/shiftTypes';

interface CommonData {
  sequence: string;
  customData: string;
  fieldLabel: string;
  required: boolean;
}

const CustomDataTable: React.FC<{ currentFormData: any }> = ({ currentFormData }) => {
  const { formData, setFormData } = useContext(ShiftContext);
  const [commonData, setCommonData] = useState<CommonData[]>([]);
  const [customData, setCustomData] = useState<CustomData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const {t} =useTranslation()

  useEffect(() => {
    const fetchCommonData = async () => {
      setLoading(true);
      try {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;

        const response = await retrieveCustomDataList(site, 'Shift', userId);
        console.log(response)
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

  useEffect(() => {
    if (commonData.length === 0) return;

    // Initialize customData based on commonData and formData
    const initialCustomData = Array.isArray(commonData) ? commonData.map(item => ({
      customData: item.customData,
      value: formData.customDataList?.find(customItem => customItem.customData === item.customData)?.value || ''
    })) : [];
    

    // Update state only if there is a real change
    setCustomData(prevCustomData => {
      if (JSON.stringify(prevCustomData) !== JSON.stringify(initialCustomData)) {
        return initialCustomData;
      }
      return prevCustomData;
    });
  }, [commonData, formData]);

  const handleValueChange = debounce((value: string, customDataKey: string) => {
    setCustomData(prevCustomData => {
      const updatedCustomData = prevCustomData.map(item =>
        item.customData === customDataKey
          ? { ...item, value }
          : item
      );

      // Update formData with new customData values
      setFormData(prevFormData => ({
        ...currentFormData,
        customDataList: updatedCustomData
      }));

      return updatedCustomData;
    });
  })

  const customDataTableColumns = [
    {
      title: t('customData'),
      dataIndex: 'customData',
      ellipsis:true,
      key: 'customData',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: t('data'),
      dataIndex: 'value',
      ellipsis:true,
      key: 'value',
      render: (text: string, record: CommonData) => {
        const value = customData.find(item => item.customData === record.customData)?.value || '';
        return (
          <Input
            value={value}
            onChange={(e) => handleValueChange(e.target.value, record.customData)}
          />
        );
      },
    }
  ];

  const combinedData = Array.isArray(commonData) ? commonData.map((commonItem) => {
    const userData = customData.find(item => item.customData === commonItem.customData);
    return {
      ...commonItem,
      value: userData ? userData.value : '',
    };
  }) : [];

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        {/* <Button onClick={() => message.info('Custom data refreshed')} type="primary">
          Refresh
        </Button> */}
      </Space>
      <Table
        bordered
        dataSource={combinedData || []}
        columns={customDataTableColumns}
        rowKey="customData"
        loading={loading}
      />
    </div>
  );
};

export default CustomDataTable;
