import React, { useState, useRef } from 'react';
import { Table, Input, Button, InputRef, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import styles from '@modules/documentCreator/styles/DocumentCreator.module.css';
import { useTranslation } from 'react-i18next';

interface DocumentListItem {
  id: string;
  productName: string;
  template: string;
  mfrNo: string;
  type: string;
  createdDate: string;
  status: string;
  version: string;
  batchSize?: number;
  versionKey?: string;
  masterMFRId?: string;
  [key: string]: any;
}

interface DocumentCreatorTableProps {
  data: DocumentListItem[];
  onRowSelect?: (row: DocumentListItem) => void;
}

const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const DocumentCreatorTable: React.FC<DocumentCreatorTableProps> = ({ data: initialData, onRowSelect }) => {
  const [selectedRow, setSelectedRow] = useState<DocumentListItem | null>(null);
  const [tableData, setTableData] = useState<DocumentListItem[]>(initialData);
  const searchInput = useRef<InputRef | null>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  const handleRowClick = (row: DocumentListItem) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row);
    }
  };

  const generateNewMFRNumber = (documents: DocumentListItem[]) => {
    // Get current date in YYYYMMDD format
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');

    // Find the highest sequence number for today
    let maxSeq = 0;
    const prefix = `MFR-${dateStr}-`;
    documents.forEach(doc => {
      if (doc.mfrNo.startsWith(prefix)) {
        const seq = parseInt(doc.mfrNo.substring(prefix.length), 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    // Generate new MFR number with incremented sequence
    return `${prefix}${(maxSeq + 1).toString().padStart(3, '0')}`;
  };

  const handleCopy = (record: DocumentListItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event

    Modal.confirm({
      title: t('Copy Document'),
      content: t('Are you sure you want to create a copy of this document?'),
      okText: t('Yes'),
      cancelText: t('No'),
      onOk: () => {
        // Get existing documents from localStorage
        const documentsStr = localStorage.getItem('documentList');
        if (!documentsStr) {
          message.error('No documents found');
          return;
        }

        const documents = JSON.parse(documentsStr);

        // Create new document with copied data
        const newDocument = {
          ...record,
          id: Date.now().toString(),
          mfrNo: generateNewMFRNumber(documents),
          createdDate: new Date().toISOString(),
          status: 'Approved',
          template: record.template  // Explicitly preserve the template field
        };

        // Add new document to the list
        const updatedDocuments = [...documents, newDocument];
        localStorage.setItem('documentList', JSON.stringify(updatedDocuments));

        // Update the table data without refreshing the page
        setTableData(updatedDocuments);
        
        message.success('Document copied successfully');
      }
    });
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: any) => void,
    dataIndex: string
  ) => {
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex: string): ColumnsType<DocumentListItem>[number] => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${capitalizeFirstLetter(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters!)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns: ColumnsType<DocumentListItem> = [
    {
      title: t('MFR No.'),
      dataIndex: 'mfrNo',
      key: 'mfrNo',
      ...getColumnSearchProps('mfrNo'),
      sorter: (a, b) => a.mfrNo.localeCompare(b.mfrNo),
    },
    {
      title: t('Version'),
      dataIndex: 'version',
      key: 'version',
      ...getColumnSearchProps('version'),
      sorter: (a, b) => (a.version || '').localeCompare(b.version || ''),
    },
    {
      title: t('Product Name'),
      dataIndex: 'productName',
      key: 'productName',
      ...getColumnSearchProps('productName'),
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps('status'),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: t('Effective Date'),
      dataIndex: 'createdDate',
      key: 'createdDate',
      ...getColumnSearchProps('createdDate'),
      sorter: (a, b) => a.createdDate.localeCompare(b.createdDate),
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: t('Actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          icon={<CopyOutlined />}
          onClick={(e) => handleCopy(record, e)}
          type="text"
          title={t('Copy Document')}
        />
      ),
    }
  ];

  return (
    <Table
      className={styles.table}
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        className: record === selectedRow ? styles.selectedRow : '',
      })}
      pagination={false}
      scroll={{ y: 'calc(100vh - 270px)' }}
    />
  );
};

export default DocumentCreatorTable;
