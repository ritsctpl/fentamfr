import React, { useContext, useMemo, useState } from 'react';
import { HolderOutlined, DeleteOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table, Empty, Tag, Switch, Tooltip, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';

interface TableRow {
  id: number;
  section: string;
  type: string;
  heading: string;
  handle?: string;
  componentIds?: any[];
  sectionIds?: any[];
}

interface EditorTableProps {
  data?: any;
  rows?: TableRow[];
  onMoveRow?: (fromIndex: number, toIndex: number) => void;
  onDeleteRow?: (rowId: number) => void;
  onRowSelect?: (row: TableRow) => void;
  onPreviewClick?: () => void;
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

const EditorTable: React.FC<EditorTableProps> = ({ data, rows, onMoveRow, onDeleteRow, onRowSelect, previewMode, setPreviewMode, onPreviewClick }) => {
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { t } = useTranslation();

  // Determine which rows to display based on props priority
  const tableRows = rows && rows.length > 0
    ? rows
    : data && Object.keys(data).length > 0
      ? [data]
      : [];

  // Convert for Ant Design Table
  const dataSource = tableRows.map((row, index) => ({
    key: String(row.id),
    id: row.id,
    slNo: index + 1,
    section: row.section,
    type: row.type,
    heading: row.heading,
    handle: row.handle || '',
  }));

  const handleDelete = (id: number) => {
    if (onDeleteRow) {
      onDeleteRow(id);
    }
  };

  // Get tag color based on type
  const getTypeTagColor = (type: string) => {
    switch (type) {
      case 'Section': return 'blue';
      case 'Group': return 'green';
      case 'Component': return 'orange';
      default: return 'default';
    }
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Drag',
      key: 'sort',
      width: 80,
      render: () => <DragHandle />
    },
    {
      title: 'Sl.No',
      dataIndex: 'slNo',
      width: 80,
      align: 'center'
    },
    {
      title: 'Contents',
      dataIndex: 'section',
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {/* <Tag color={getTypeTagColor(record.type)}>
              {record.type}
            </Tag> */}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      align: 'center'
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(record.id);
          }}
        />
      ),
      align: 'center'
    },
  ];

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id && onMoveRow) {
      const activeIndex = dataSource.findIndex((record) => record.key === active.id);
      const overIndex = dataSource.findIndex((record) => record.key === over?.id);

      onMoveRow(activeIndex, overIndex);
    }
  };

  const handleRowClick = (record: any) => {
    setSelectedRowKey(Number(record.key));

    // Find the original row object and pass it to parent component
    if (onRowSelect) {
      const selectedRow = tableRows.find(row => row.id === Number(record.key));
      if (selectedRow) {
        onRowSelect(selectedRow);
      }
    }
  };

  const onRow = (record: any) => ({
    onClick: () => handleRowClick(record),
  });

  // Handle preview click with loading indicator
  const handlePreviewClick = () => {
    if (onPreviewClick) {
      setIsPreviewLoading(true);
      onPreviewClick();
      // No need to call setPreviewMode here as parent component will handle it
    } else {
      // Fallback to direct mode change if no handler provided
      setPreviewMode(true);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <h3 style={{ marginBottom: 0, fontWeight: 600, fontSize: 20 }}>{t('Editor Table')}</h3>
        {dataSource.length > 0 && (
          <Tooltip title={t('Preview')}>
            <Button 
              type="text" 
              icon={isPreviewLoading ? <LoadingOutlined /> : <EyeOutlined />}
              onClick={handlePreviewClick}
              style={{ fontSize: 18, cursor: 'pointer' }}
              disabled={isPreviewLoading}
            />
          </Tooltip>
        )}
      </div>

      {dataSource.length === 0 ? (
        <Empty
          description="No rows added yet. Configure your row in the left panel and click Save to add it."
          style={{
            margin: '40px 0',
            padding: '20px',
            background: '#f9f9f9',
            borderRadius: 8
          }}
        />
      ) : (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext items={dataSource.map((i) => i.key)} strategy={verticalListSortingStrategy}>
            <Table
              rowKey="key"
              components={{ body: { row: Row } }}
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              scroll={{ y: "calc(100vh - 200px)" }}
              rowClassName={(record) => record.key === String(selectedRowKey) ? 'ant-table-row-selected' : ''}
              onRow={onRow}
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderRadius: 8,
              }}
            />
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default EditorTable;