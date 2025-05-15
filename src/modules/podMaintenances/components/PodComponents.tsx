import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Modal, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from '@modules/podMaintenances/styles/podMainStyles.module.css';
import { useTranslation } from 'react-i18next';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import { createBomCustom } from '@services/BomService';
import { parseCookies } from 'nookies';
import { defaultRButton } from '@modules/podMaintenances/types/podMaintenanceTypes';

interface DataType {
  key: number;
  sequence: number;
  buttonId: string;
  buttonLabel: string;
  buttonType: string;
}

interface AlternateComponentTableProps {
  openHalfScreen: boolean;
  call: number;
  setOpenHalfScreen: (val: boolean) => void;
}

const PodComponents: React.FC<AlternateComponentTableProps> = ({
  setOpenHalfScreen,
  openHalfScreen,
  call
}) => {
  const { mainForm, setMainForm, setButtonForm, componentCall, setSequence, formChange, setFormChange, setMainActiveTab, setButtonActiveTab, buttonFormChange, setButtonFormChange } = useContext<any>(PodMaintenanceContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<DataType | null>(null);
  const [selectedRow, setSelectedRow] = useState<DataType | null>(null);
  
  const { t } = useTranslation();

  console.log(openHalfScreen, 'openHalfScreen');
  

  useEffect(() => {
    if (mainForm) {
      const mappedData = mainForm?.buttonList?.map((button) => ({
        key: button.sequence,
        sequence: button.sequence,
        buttonId: button.buttonId,
        buttonLabel: button.buttonLabel,
        buttonType: button.buttonType,
      }));
      setDataSource(mappedData);
    } else {
      setDataSource([]);
    }
  }, [mainForm, componentCall, call]);
  
  const handleInsert = async () => {
    setOpenHalfScreen(true);
    setMainActiveTab(0);
    
    // Calculate the new sequence based on the last item in buttonList
    const newSequence = mainForm.buttonList?.length === 0 ? 10 : +mainForm.buttonList[mainForm.buttonList.length - 1].sequence + 10;
    
    // Set the sequence state
    setSequence(newSequence);
    
    // Initialize buttonForm with the new sequence
    setButtonForm({
      ...defaultRButton,
      sequence: String(newSequence)
    });
    
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    try {
      const payload = { site, userId, category: "BOM Component" };
      const customData = await createBomCustom(site, userId, payload);
      
      // Update buttonForm with custom data while preserving the sequence
      setButtonForm(prevData => ({ 
        ...prevData, 
        componentCustomDataList: customData,
        sequence: String(newSequence)
      }));
    } catch (error) {
      console.error('Full error object:', error);
    }
  };

  const handleInsertBefore = async () => {
    if (selectedRowKeys.length !== 1) return;
    
    // Get the selected row
    const selectedKey = selectedRowKeys[0];
    const selectedRowData = dataSource.find(row => row.key === selectedKey);
    if (!selectedRowData) return;
    
    setOpenHalfScreen(true);
    setMainActiveTab(0);
    setButtonForm(defaultRButton);
    
    // Use the exact same sequence as the selected row instead of calculating an intermediate value
    const selectedSequence = +selectedRowData.sequence;
    
    // Set the sequence for the new form to be the same as the selected row
    const newSequence = selectedSequence;
    
    // Always need to resequence when inserting before
    setButtonForm(prevData => ({ 
      ...prevData, 
      needsResequencing: true, 
      insertPosition: 'before', 
      targetSequence: selectedSequence 
    }));
    
    setSequence(newSequence);
    
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    try {
      const payload = { site, userId, category: "BOM Component" };
      const customData = await createBomCustom(site, userId, payload);
      setButtonForm(prevData => ({ 
        ...prevData, 
        componentCustomDataList: customData,
        sequence: newSequence
      }));
    } catch (error) {
      console.error('Full error object:', error);
    }
  };

  const handleInsertAfter = async () => {
    if (selectedRowKeys.length !== 1) return;
    
    // Get the selected row
    const selectedKey = selectedRowKeys[0];
    const selectedRowData = dataSource.find(row => row.key === selectedKey);
    if (!selectedRowData) return;
    
    setOpenHalfScreen(true);
    setMainActiveTab(0);
    setButtonForm(defaultRButton);
    
    // Get the selected sequence
    const selectedSequence = +selectedRowData.sequence;
    
    // Simply add 10 to the selected sequence for "Insert After"
    const newSequence = selectedSequence + 10;
    
    // Always need to resequence when inserting after
    setButtonForm(prevData => ({ 
      ...prevData, 
      needsResequencing: true, 
      insertPosition: 'after', 
      targetSequence: selectedSequence 
    }));
    
    setSequence(newSequence);
    
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    try {
      const payload = { site, userId, category: "BOM Component" };
      const customData = await createBomCustom(site, userId, payload);
      setButtonForm(prevData => ({ 
        ...prevData, 
        componentCustomDataList: customData,
        sequence: newSequence
      }));
    } catch (error) {
      console.error('Full error object:', error);
    }
  };
 
  const handleRemoveSelected = () => {
    if (selectedRowKeys.length === 0) {
      return;
    }
    
    // First, create a set of the selected sequence values for easier lookup
    const selectedSequenceSet = new Set(selectedRowKeys);
    
    // Filter the main button list first to ensure we have the complete button data
    const updatedButtonList = mainForm.buttonList.filter(
      component => !selectedSequenceSet.has(component.sequence)
    );
    
    // Resequence the remaining buttons with 10, 20, 30 pattern while preserving all properties
    const reSequencedButtonList = updatedButtonList.map((component, index) => ({
      ...component,
      sequence: String((index + 1) * 10)
    }));
    
    // Update the dataSource based on the updated button list to ensure consistency
    const updatedDataSource = reSequencedButtonList.map(button => ({
      key: button.sequence,
      sequence: button.sequence,
      buttonId: button.buttonId,
      buttonLabel: button.buttonLabel,
      buttonType: button.buttonType,
    }));
    
    // Update state
    setDataSource(updatedDataSource);
    setSelectedRowKeys([]);
    setMainForm(prevForm => ({
      ...prevForm,
      buttonList: reSequencedButtonList
    }));
  };

  const handleRemoveAll = () => {
    if (dataSource.length === 0) return;

    setDataSource([]);
    setSelectedRowKeys([]);
    setMainForm(prevForm => ({
      ...prevForm,
      buttonList: []
    }));
  };

  const onRowSelect = (record: DataType) => {
    const selectedComponent = mainForm.buttonList.find(
      (component) => component.sequence === record.sequence
    );
    
    if (buttonFormChange) {
      setSelectRowData(selectedComponent || null);
      setIsModalVisible(true);
      setFormChange(false);
    } else {
      setButtonForm(selectedComponent || null);
      setSequence(record.sequence);
      setOpenHalfScreen(true);
      setMainActiveTab(0);
      setButtonActiveTab(0);
    }
  };

  const handleModalOk = () => {
    if (selectRowData) {
      setButtonForm(selectRowData);
      setSequence(selectRowData.sequence);
    }
    setIsModalVisible(false);
    setButtonFormChange(false);
    setButtonActiveTab(0)
  };
  

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setButtonFormChange(true);
  };

  const getColumnSearchProps = (dataIndex: keyof DataType) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => confirm()}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    onFilter: (value: string, record: DataType) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });

  

  const columns: ColumnsType<DataType> = [
    {
      title: t("sequence"),
      dataIndex: 'sequence',
      key: 'sequence',
      ...getColumnSearchProps('sequence'),
      sorter: (a, b) => a.sequence - b.sequence,
      render: (text: number) => text,
    },
    {
      title: t("buttonId"),
      dataIndex: 'buttonId',
      key: 'buttonId',
      ...getColumnSearchProps('buttonId'),
      sorter: (a, b) => a.buttonId.localeCompare(b.buttonId),
      render: (text: string) => text,
    },
    {
      title: t("buttonLabel"),
      dataIndex: 'buttonLabel',
      key: 'buttonLabel',
      ...getColumnSearchProps('buttonLabel'),
      sorter: (a, b) => a.buttonLabel.localeCompare(b.buttonLabel),
      render: (text: string) => text,
    },
    {
      title: t("buttonType"),
      dataIndex: 'buttonType',
      key: 'buttonType',
      ...getColumnSearchProps('buttonType'),
      sorter: (a, b) => a.buttonType.localeCompare(b.buttonType),
      render: (text: string) => text,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={handleInsert} style={{ marginRight: 8 }} className={styles.cancelButton}>
          {t("insert")}
        </Button>
        {selectedRowKeys.length === 1 && !openHalfScreen && (
          <>
            <Button 
              onClick={handleInsertBefore} 
              style={{ marginRight: 8 }} 
              className={styles.cancelButton}
            >
              {t("insertBefore")}
            </Button>
            <Button 
              onClick={handleInsertAfter} 
              style={{ marginRight: 8 }} 
              className={styles.cancelButton}
            >
              {t("insertAfter")}
            </Button>
          </>
        )}
        {!openHalfScreen && (
          <>
            <Button
              className={styles.cancelButton}
              onClick={handleRemoveSelected}
              style={{ marginRight: 8 }}
            >
              {t("removeSelected")}
            </Button>
            <Button className={styles.cancelButton} onClick={handleRemoveAll}>
              {t("removeAll")}
            </Button>
          </>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ y: 'calc(100vh - 430px)' }}
        rowSelection={
          !openHalfScreen
            ? {
                selectedRowKeys,
                onChange: (keys) => {
                  setSelectedRowKeys(keys);
                },
                columnWidth: 30,
              }
            : undefined
        }
        onRow={(record) => ({
          onClick: () => onRowSelect(record),
        })}
      />
      <Modal
        title={t('confirmation')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('confirm')}
        cancelText={t('cancel')}
      >
        <p>{t('alertRow')}</p>
      </Modal>
    </div>
  );
};

export default PodComponents;
