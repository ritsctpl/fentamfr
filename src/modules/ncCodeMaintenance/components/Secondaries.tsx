import React, { useContext, useEffect, useState } from 'react';
import { Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { NcCodeContext } from '@modules/ncCodeMaintenance/hooks/NcCodeUseContext';
import { retrieveAvailableSecondaries, retrieveAvailableSecondary } from '@services/ncCodeService';

interface RecordType {
  key: string;
  secondaries: string;
}

const Secondaries: React.FC = () => {
  const { formData, setFormData, setFormChange, resetValue } = useContext<any>(NcCodeContext);
  const [availableSecondaries, setAvailableSecondaries] = useState<any>([]);
  const [assignedSecondaries, setAssignedSecondaries] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      let response;
      if (resetValue) {
        response = await retrieveAvailableSecondary(site);
      } else {
        response = await retrieveAvailableSecondaries(site, formData.ncCode);
      }

      const transformedResponse = response.map((item: { handle: any; secondaries: string; }) => ({
        handle: item.handle,
        secondaries: item.secondaries,
      }));

      const availableUserGroupList = transformedResponse;

      const availableList = formData.availableSecondariesItems && formData.availableSecondariesItems.length > 0
        ? formData.availableSecondariesItems
        : availableUserGroupList;

      const tempAvailableSecondaries = availableList.map((item: { secondaries: any; }, index: number) => ({
        key: uuidv4(),
        secondaries: item.secondaries,
      }));

      const tempAssignedSecondaries = (formData.secondariesGroupsList as any).map((group: any) => ({
        key: uuidv4(),
        secondaries: group.secondaries,
      }));

      setAvailableSecondaries(tempAvailableSecondaries);
      setAssignedSecondaries(tempAssignedSecondaries);
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
    const updatedUserGroups = assignedSecondaries.map(item => ({
      secondaries: item.secondaries,
    }));
    setFormData(prev => ({
      ...prev,
      secondariesGroupsList: updatedUserGroups || [],
    }));
  }, [assignedSecondaries, setFormData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys, direction, moveKeys) => {
    if (direction === 'left') {
      const movedItems = assignedSecondaries.filter(item => moveKeys.includes(item.key));
      const updatedAssignedSecondaries = assignedSecondaries.filter(item => !moveKeys.includes(item.key));
      const updatedAvailableSecondaries = [...availableSecondaries, ...movedItems];

      setAssignedSecondaries(updatedAssignedSecondaries);
      setAvailableSecondaries(updatedAvailableSecondaries);

      setFormData(prev => ({
        ...prev,
        secondariesGroupsList: updatedAssignedSecondaries.map(item => ({ secondaries: item.secondaries })),
        availableSecondariesItems: updatedAvailableSecondaries.map(item => ({ secondaries: item.secondaries })),
      }));
    } else {
      const movedItems = availableSecondaries.filter(item => moveKeys.includes(item.key));
      const updatedAvailableSecondaries = availableSecondaries.filter(item => !moveKeys.includes(item.key));
      const updatedAssignedSecondaries = [...assignedSecondaries, ...movedItems];

      setAvailableSecondaries(updatedAvailableSecondaries);
      setAssignedSecondaries(updatedAssignedSecondaries);

      setFormData(prev => ({
        ...prev,
        secondariesGroupsList: updatedAssignedSecondaries.map(item => ({ secondaries: item.secondaries })),
        availableSecondariesItems: updatedAvailableSecondaries.map(item => ({ secondaries: item.secondaries })),
      }));
    }
    setFormChange(true);
  };

  const filterOption: TransferProps['filterOption'] = (inputValue, item) => {
    return item.secondaries.toLowerCase().includes(inputValue.toLowerCase());
  };

  const renderItem = (item: RecordType) => {
    return {
      label: <span className="custom-item">{item.secondaries}</span>,
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
      dataSource={availableSecondaries.concat(assignedSecondaries)}
      listStyle={{
        width: '50%',
        height: '50vh',
        margin: "20px"
      }}
      targetKeys={assignedSecondaries.map(item => item.key)}
      onChange={handleChange}
      render={renderItem}
      titles={[t('availableSecondaries'), t('assignedSecondaries')]}
      showSearch
      filterOption={filterOption}
    />
  );
};

export default Secondaries;