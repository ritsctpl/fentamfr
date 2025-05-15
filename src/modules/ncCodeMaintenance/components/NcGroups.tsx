import React, { useContext, useEffect, useState } from 'react';
import { Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { NcCodeContext } from '@modules/ncCodeMaintenance/hooks/NcCodeUseContext';
import { retrieveAvailableNcGroup, retrieveAvailableNcGroups } from '@services/ncCodeService';

interface RecordType {
  key: string;
  ncGroup: string;
}

const NcGroups: React.FC = () => {
  const { formData, setFormData, setFormChange, resetValue } = useContext<any>(NcCodeContext);
  const [availableGroups, setAvailableGroups] = useState<any>([]);
  const [assignedGroups, setAssignedGroups] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      let response;
      if (resetValue) {
        response = await retrieveAvailableNcGroup(site);
      } else {
        response = await retrieveAvailableNcGroups(site, formData.ncCode);
      }

      const transformedResponse = response.map((item: { handle: any; ncGroup: string; }) => ({
        handle: item.handle,
        ncGroup: item.ncGroup,
      }));

      const availableUserGroupList = transformedResponse;

      const availableList = formData.availableNcGroupsItems && formData.availableNcGroupsItems.length > 0
        ? formData.availableNcGroupsItems
        : availableUserGroupList;

      const tempAvailableData = availableList.map((item: { ncGroup: any; }, index: number) => ({
        key: uuidv4(), // Ensure unique key generation
        ncGroup: item.ncGroup, // Correctly map 'ncGroup' to 'ncGroup'
      }));

      const tempAssignedData = (formData.ncGroupsList as any).map((group: any) => ({
        key: uuidv4(), // Ensure unique key generation
        ncGroup: group.ncGroup, // Correctly map 'ncGroup' to 'ncGroup'
      }));

      setAvailableGroups(tempAvailableData);
      setAssignedGroups(tempAssignedData);
      setIsLoading(false);
    } catch (error) {
      setFetchError('Failed to fetch data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updatedUserGroups = assignedGroups.map(item => ({
      ncGroup: item.ncGroup, // Ensure 'ncGroup' is used
    }));
    setFormData(prev => ({
      ...prev,
      ncGroupsList: updatedUserGroups || [],
    }));
  }, [assignedGroups, setFormData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys, direction, moveKeys) => {
    if (direction === 'left') {
      const movedItems = assignedGroups.filter(item => moveKeys.includes(item.key));
      const updatedAssignedGroups = assignedGroups.filter(item => !moveKeys.includes(item.key));
      const updatedAvailableGroups = [...availableGroups, ...movedItems];

      setAssignedGroups(updatedAssignedGroups);
      setAvailableGroups(updatedAvailableGroups);

      setFormData(prev => ({
        ...prev,
        ncGroupsList: updatedAssignedGroups.map(item => ({ ncGroup: item.ncGroup })), // Use 'ncGroup'
        availableNcGroupsItems: updatedAvailableGroups.map(item => ({ ncGroup: item.ncGroup })), // Use 'ncGroup'
      }));
    } else {
      const movedItems = availableGroups.filter(item => moveKeys.includes(item.key));
      const updatedAvailableGroups = availableGroups.filter(item => !moveKeys.includes(item.key));
      const updatedAssignedGroups = [...assignedGroups, ...movedItems];

      setAvailableGroups(updatedAvailableGroups);
      setAssignedGroups(updatedAssignedGroups);

      setFormData(prev => ({
        ...prev,
        ncGroupsList: updatedAssignedGroups.map(item => ({ ncGroup: item.ncGroup })), 
        availableNcGroupsItems: updatedAvailableGroups.map(item => ({ ncGroup: item.ncGroup })), 
      }));
    }
    setFormChange(true);
  };

  const filterOption: TransferProps['filterOption'] = (inputValue, item) => {
    return item.ncGroup.toLowerCase().includes(inputValue.toLowerCase());
  };

  const renderItem = (item: RecordType) => {
    return {
      label: <span className="custom-item">{item.ncGroup}</span>, // Ensure 'ncGroup' is used
      value: item.key,
    };
  };

  if (isLoading) {
    return <Spin tip="Loading..." />;
  }
  if (fetchError) {
    return <Alert message={fetchError} type="error" />;
  }

  return (
    <Transfer
      dataSource={availableGroups.concat(assignedGroups)}
      listStyle={{
        width: '50%',
        height: '50vh',
        margin: "20px"
      }}
      targetKeys={assignedGroups.map(item => item.key)}
      onChange={handleChange}
      render={renderItem}
      titles={[t('availableNcGroups'), t('assignedNcGroups')]}
      showSearch
      filterOption={filterOption}
    />
  );
};

export default NcGroups;