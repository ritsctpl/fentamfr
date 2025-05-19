import React, { useContext, useMemo, useState } from 'react';
import { HolderOutlined, DeleteOutlined } from '@ant-design/icons';
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
import { Button, Table, Empty, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { calc } from 'antd/es/theme/internal';

interface TableRow {
  id: number;
  section: string;
  type: string;
  heading: string;
}

interface EditorTableProps {
  data?: any;
  rows?: TableRow[];
  onMoveRow?: (fromIndex: number, toIndex: number) => void;
  onDeleteRow?: (rowId: number) => void;
  onRowSelect?: (row: TableRow) => void;
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

const EditorTable: React.FC<EditorTableProps> = ({ data, rows, onMoveRow, onDeleteRow, onRowSelect }) => {
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null);
  console.log(rows,'rows');
  
  
  // Determine which rows to display based on props priority
  const tableRows = rows && rows.length > 0 
    ? rows 
    : data && Object.keys(data).length > 0 
      ? [data] 
      : [];

      console.log('tableRows', tableRows);

  // Convert for Ant Design Table
  const dataSource = tableRows.map((row, index) => ({
    key: String(row.id),
    id: row.id,
    slNo: index + 1,
    section: row.section,
    type: row.type,
    heading: row.heading,
  }));

  console.log('dataSource', dataSource);
  

  const handleDelete = (id: number) => {
    if (onDeleteRow) {
      onDeleteRow(id);
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
      width: 80 
    },
    { 
      title: 'Section', 
      dataIndex: 'section',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <div>{text}</div>
          <Tag color={
            record.type === 'Section' ? 'blue' : 
            record.type === 'Group' ? 'green' : 
            'default'
          }>
            {record.type}
          </Tag>
        </div>
      )
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

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 20, fontWeight: 600, fontSize: 20 }}>Editor Table</h3>
      
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