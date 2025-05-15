import React, { useContext, useEffect, useState } from 'react';
import { Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { ItemContext } from '@modules/item/hooks/itemContext';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid'; 
import { retrieveAvailableDocumentList } from '@services/itemServices';
import { useTranslation } from 'react-i18next';
interface RecordType {
  key: string;
  document: string; 
}
interface Document {
  document: string;
}
interface DragDropTableProps {
    resetValue : boolean;
}

const PrintDocuments: React.FC<DragDropTableProps> = ({resetValue}) => {
  const { payloadData, setPayloadData, setShowAlert } = useContext(ItemContext); 
  const [availableData, setAvailableData] = useState<RecordType[]>([]);
  const [assignedData, setAssignedData] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      let response, tempAvailableData = [], tempAssignedData = [];
      debugger
      if (resetValue) {
        response = await retrieveAvailableDocumentList(site, "", "");
      } else {
        response = await retrieveAvailableDocumentList(site, payloadData.item, payloadData.revision);
      }
      const availableUserGroupList = response;
      const availableDocumentsList = payloadData?.availableDocuments && payloadData?.availableDocuments.length > 0
        ? payloadData?.availableDocuments
        : availableUserGroupList;
  
      if (availableDocumentsList) {
        tempAvailableData = availableDocumentsList.map((item: { document: string }, index: number) => ({
          key: index.toString(),
          document: item.document,
        }));
      }

      if (payloadData?.printDocuments) {
        tempAssignedData = (payloadData?.printDocuments as Document[]).map((group: Document) => ({
          key: uuidv4(),
          document: group?.document,
        }));
      }
      setAvailableData(tempAvailableData);
      setAssignedData(tempAssignedData);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [payloadData.item]); 
  useEffect(() => {
    const updatedUserGroups = assignedData.map(item => ({
        document: item.document,
    }));
    setPayloadData(prev => ({
      ...prev,
      printDocuments: updatedUserGroups || [],
    }));
  }, [assignedData, setPayloadData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys, direction, moveKeys) => {
    // console.log('handleChange called', { newTargetKeys, direction, moveKeys });

    if (direction === 'left') {
        const movedItems = assignedData.filter(item => moveKeys.includes(item.key));
        const updatedAssignedData = assignedData.filter(item => !moveKeys.includes(item.key));
        const updatedAvailableData = [...availableData, ...movedItems];

        setAssignedData(updatedAssignedData);
        setAvailableData(updatedAvailableData);
        setPayloadData(prev => ({
            ...prev,
            printDocuments: updatedAssignedData.map(item => ({ document: item.document })),
            availableDocuments: updatedAvailableData.map(item => ({ document: item.document })),
        }));
    } else {
        const movedItems = availableData.filter(item => moveKeys.includes(item.key));
        const updatedAvailableData = availableData.filter(item => !moveKeys.includes(item.key));
        const updatedAssignedData = [...assignedData, ...movedItems];
        setAvailableData(updatedAvailableData);
        setAssignedData(updatedAssignedData);
        setPayloadData(prev => ({
            ...prev,
            printDocuments: updatedAssignedData.map(item => ({ document: item.document })),
            availableDocuments: updatedAvailableData.map(item => ({ document: item.document })),
        }));
    }
    setShowAlert(true);
};


  const filterOption: TransferProps['filterOption'] = (inputValue, item) => {
    return item.document.toLowerCase().includes(inputValue.toLowerCase()); 
  };
  const renderItem = (item: RecordType) => {
    return {
      label: <span className="custom-item">{item.document}</span>, 
      value: item.key,
    };
  };
  if (loading) {
    return <Spin tip="Loading..." />;
  }
  if (error) {
    return <Alert message={error} type="error" />;
  }
  // console.log("Payload data from print docs : ", payloadData);
  return (
<Transfer
      dataSource={availableData.concat(assignedData)} 
      listStyle={{
        width: '50%',
        height: '50vh',
        margin: "20px"
      }}
      targetKeys={assignedData.map(item => item.key)}
      onChange={handleChange}
      render={renderItem}
      titles={[t('availableDocuments'), t('assignedDocuments')]}
      showSearch
      filterOption={filterOption}
    />
  );
};
export default PrintDocuments;