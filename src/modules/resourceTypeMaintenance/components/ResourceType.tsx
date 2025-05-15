'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Transfer, Spin } from 'antd';
import type { TransferProps } from 'antd/es/transfer';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { ResourceTypeContext } from '@modules/resourceTypeMaintenance/hooks/ResourceTypeContext';
import { fetchAvailableResource, fetchResourceList } from '@services/resourceTypeServices';

interface ResourceType {
  key: string;
  resource: string;
}

interface ResourceTypeProps {
  drag: boolean;
} 

// Define the context type to avoid using 'any'
interface ResourceTypeContextType {
  formData: {
    resourceMemberList?: ResourceType[];
    available?: ResourceType[];
    resource?: string;
    createdDateTime?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<ResourceTypeContextType['formData']>>;
}

const ResourceType: React.FC<ResourceTypeProps> = ({
  drag
}) => {
  const [mockData, setMockData] = useState<ResourceType[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { formData, setFormData } = useContext<any>(ResourceTypeContext);

  useEffect(() => {
    const fetchResourceTypesData = async () => {
      setLoading(true);
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        let availableWithKeys: ResourceType[] = [];
        let assignedWithKeys: ResourceType[] = [];

        if (formData.resourceMemberList && formData.available) {
          assignedWithKeys = formData.resourceMemberList.map(item => ({
            key: item.resource || uuidv4(),
            resource: item.resource
          }));

          availableWithKeys = formData.available.map(user => ({
            key: user.key || uuidv4(),
            resource: user.resource
          }));

          setMockData([...availableWithKeys, ...assignedWithKeys]);
          setTargetKeys(assignedWithKeys.map(item => item.key));
        } else {
          if (drag) {
            const response = await fetchAvailableResource(site);
            const available = Array.isArray(response) ? response.map((item: any) => ({
              key: uuidv4(),
              resource: item.resource
            })) : [];

            setMockData(available);
            setTargetKeys([]);
          } else if (formData.resourceMemberList && formData.createdDateTime) {
            const response = await fetchResourceList(site, formData.resourceType || '');
            
            const available = Array.isArray(response) ? response.map((item: any) => ({
              key: uuidv4(),
              resource: item.resource
            })) : [];
            assignedWithKeys = formData.resourceMemberList?.map(user => ({
              ...user,
              key: user.key || uuidv4()
            })) || [];

            setMockData([...available, ...assignedWithKeys]);
            setTargetKeys(assignedWithKeys.map(item => item.key));
          } else {
            const response = await fetchAvailableResource(site);
            const available = Array.isArray(response) ? response.map((item: any) => ({
              key: uuidv4(),
              resource: item.resource
            })) : [];

            setMockData(available);
            setTargetKeys([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceTypesData();
  }, [drag, formData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys: any) => {
    setTargetKeys(newTargetKeys);

    const updatedAssignedResourceTypes = mockData.filter(item => newTargetKeys.includes(item.key));
    const updatedAvailableResourceTypes = mockData.filter(item => !newTargetKeys.includes(item.key));

    setFormData(prevData => ({
      ...prevData,
      resourceMemberList: updatedAssignedResourceTypes,
      available: updatedAvailableResourceTypes
    }));
  };

  const handleSearch: TransferProps['onSearch'] = (dir, value) => {
    console.log('Search:', dir, value);
  };

  const filterOption = (inputValue: string, option: ResourceType) =>
    option.resource.toLowerCase().includes(inputValue.toLowerCase());

  const renderItem = (item: ResourceType) => item.resource;

  return (
    <div style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        <Transfer
          dataSource={mockData}
          showSearch
          filterOption={filterOption}
          targetKeys={targetKeys}
          onChange={handleChange}
          onSearch={handleSearch}
          render={renderItem}
          listStyle={{ width: '100%', height: 300 }}
          rowKey={(item) => item.key}
          titles={[t("availableResource"), t("assignedResource")]}
          locale={{
            notFoundContent: (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>{t('No Data')}</div>
              </div>
            )
          }}
        />
      </Spin>
    </div>
  );
};

export default ResourceType;
