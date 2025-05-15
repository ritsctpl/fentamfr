import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Spin, Input, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { DataRow } from '../types/userTypes';
import { SearchOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

interface DynamicTableProps {
  data: any[];
  loading: boolean;
  selectedRowData: any[];
  setSelectedRowData: React.Dispatch<React.SetStateAction<any[]>>;
  handleTableChange?: (pagination: any) => void;
  list: any;
  allowMultipleSelection?: boolean;
}

import { createContext, useContext } from 'react';
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import { FilterDropdownProps } from 'antd/es/table/interface';
import { PodContext } from '@modules/podApp/hooks/userContext';

interface DragIndexState {
  active: UniqueIdentifier;
  over: UniqueIdentifier | undefined;
  direction?: 'left' | 'right';
}

const DragIndexContext = createContext<DragIndexState>({ active: -1, over: -1 });

const dragActiveStyle = (dragState: DragIndexState, id: string) => {
  const { active, over, direction } = dragState;
  let style: React.CSSProperties = {};
  if (active && active === id) {
    style = { backgroundColor: 'gray', opacity: 0.5 };
  } else if (over && id === over && active !== over) {
    style = direction === 'right'
      ? { borderRight: '1px dashed gray' }
      : { borderLeft: '1px dashed gray' };
  }
  return style;
};

const TableBodyCell: React.FC<{ id: string;[key: string]: any }> = (props) => {
  const dragState = useContext<DragIndexState>(DragIndexContext);
  return (
    <td {...props} style={{ ...props.style, ...dragActiveStyle(dragState, props.id) }} />
  );
};

const TableHeaderCell: React.FC<{ id: string;[key: string]: any }> = (props) => {
  const dragState = useContext(DragIndexContext);
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: props.id });
  const style: React.CSSProperties = {
    ...props.style,
    cursor: 'move',
    fontSize: '13.5px',
    fontWeight: '600',
    backgroundColor: 'rgb(243 243 243)',
    ...(isDragging ? { position: 'relative', userSelect: 'none' } : {}),
    ...dragActiveStyle(dragState, props.id),
  };
  return <th {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};

const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  loading,
  selectedRowData,
  setSelectedRowData,
  handleTableChange,
  list
}) => {
  console.log(data, "datdfa");
  
  const { t } = useTranslation();
  const { podCategoryType } = useContext(PodContext);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<DragIndexState>({ active: -1, over: -1 });
  // console.log(data, "list");
  useEffect(() => {
    if (data?.length > 0 && data[0]?.columnLists) {
      setColumnOrder(data[0].columnLists.map((item: any) => item.dataField));
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    })
  );

  const handleCheckboxChange = (key: string, checked: boolean, record: any) => {
    setSelectedRowData(prevData => {
      if (checked) {
        if (!prevData.some(item => item.pcu === record.pcu)) {
          return list?.allowMultipleSelection ? [...prevData, record] : [record];
        }
      } else {
        return prevData.filter(item => item.pcu !== record.pcu);
      }
      return prevData;
    });
  };

  const handleRowClick = (record) => {
    const { status, ...recordWithoutStatus } = record;
    const isChecked = selectedRowData.some(item => item.pcu === record.pcu);
    handleCheckboxChange(record.pcu, !isChecked, recordWithoutStatus);
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const allSelectedRows = dataSource.map(record => record);
      setSelectedRowData(allSelectedRows);
    } else {
      setSelectedRowData([]);
    }
  };
  const transformData = (data: { columnLists: any[] }[]): { column: ColumnsType<DataRow>; dataSource: DataRow[] } => {
    if (!data?.length || !data[0]?.columnLists) {
      return { column: [], dataSource: [] };
    }

    const firstItem = data[0];
    const columnLists = firstItem.columnLists || [];

    const column: ColumnsType<DataRow> = [
      {
        title: () => (
          <Checkbox
            checked={selectedRowData.length === data?.length && data?.length > 0}
            indeterminate={selectedRowData.length > 0 && selectedRowData.length < data?.length}
            onChange={(e) => handleSelectAllChange(e.target.checked)}
            disabled={!list?.allowMultipleSelection}
          />
        ),
        dataIndex: 'select',
        key: 'select',
        width: 10,
        fixed: 'left',
        render: (_: any, record: DataRow) => (
          <Checkbox
            checked={selectedRowData.some(selected => selected.pcu === record.pcu)}
            onChange={(e) => handleCheckboxChange(record.pcu, e.target.checked, record)}
          />
        ),
      },
      ...columnOrder
        .map(key => columnLists.find((item: any) => item.dataField === key))
        .filter(Boolean)
        .map((item: any) => {
          const columnConfig = list?.columnList?.find(
            (col: any) => col.columnName.toLowerCase() === item.dataField.toLowerCase()
          );
          return {
            title: item.dataField === 'pcu' ? t('pcu') : t(item.dataField),
            // title: podCategoryType === 'processOrder' ? t('pcu') : t(item.dataField),
            dataIndex: item.dataField,
            key: item.dataField,
            width: columnConfig?.width ? parseInt(columnConfig.width) : 'auto',
            onHeaderCell: () => ({ id: item.dataField }),
            onCell: () => ({ id: item.dataField }),
            ...(list?.allowOperatorToSortRows && {
              sorter: (a, b) => {
                if (typeof a[item.dataField] === 'string') {
                  return a[item.dataField].localeCompare(b[item.dataField]);
                }
                return a[item.dataField] - b[item.dataField];
              }
            }),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
              <div style={{ padding: 8 }}>
                <Input
                  placeholder={`Search ${t(item.dataField)}`}
                  value={selectedKeys[0]}
                  onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                  onPressEnter={() => confirm()}
                  style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => clearFilters && clearFilters()}>Reset</Button>
                  <Button type="primary" onClick={() => confirm()}>Search</Button>
                </div>
              </div>
            ),
            filterIcon: filtered => (
              list?.allowOperatorToSortRows ? (
                <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
              ) : null
            ),
            onFilter: (value, record) =>
              record[item.dataField]
                ?.toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
            ...(item.dataField === 'Status' && {
              render: (text: string) => (
                <span style={{
                  color: text === 'Active' ? '#52c41a' : 'inherit'
                }}>
                  {text}
                </span>
              )
            })
          };
        }),
    ];

    const dataSource: DataRow[] = data
      .map((item) => ({
        key: uuidv4(),
        ...item.columnLists.reduce((acc: any, col: any) => {
          acc[col.dataField] = col.dataField === 'Status' && col.dataAttribute === 'active'
            ? 'Active ✅'
            : col.dataField === 'Status' && col.dataAttribute === 'In Queue'
              ? 'In Queue 🕒'
              : col.dataAttribute;
          return acc;
        }, {}),
      }))
      .sort((a, b) => {
        if (a.Status === 'Active ✅' && b.Status !== 'Active ✅') return -1;
        if (a.Status !== 'Active ✅' && b.Status === 'Active ✅') return 1;
        return 0;
      });

    return { column, dataSource };
  };

  const { column, dataSource } = data?.length === 0 ? { column: [], dataSource: [] } : transformData(data);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setColumnOrder(prevOrder => {
        const oldIndex = prevOrder.indexOf(String(active.id));
        const newIndex = prevOrder.indexOf(String(over.id));
        return arrayMove(prevOrder, oldIndex, newIndex);
      });
    }
    setDragIndex({ active: -1, over: -1 });
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const activeIndex = column.findIndex(i => i.key === active.id);
    const overIndex = column.findIndex(i => i.key === over?.id);
    setDragIndex({
      active: active.id,
      over: over?.id,
      direction: overIndex > activeIndex ? 'right' : 'left',
    });
  };
console.log(dataSource,"dataSource")
  return (
    <Spin spinning={loading} tip="Processing...">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <DndContext
          sensors={sensors}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          collisionDetection={closestCenter}
        >
          <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
            <DragIndexContext.Provider value={dragIndex}>
              <Table
                size="small"
                dataSource={dataSource}
                bordered={true}
                columns={column}
                rowKey="key"
                onChange={handleTableChange}
                pagination={false}
                scroll={{ y: 'calc(100vh - 490px)', x: 'max-content' }}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  style: { fontSize: '13.5px' }
                })}
                style={{
                  overflowY: 'auto',
                  height: '100%'
                }}
                components={list?.allowOperatorToChangeColumnSequence ? {
                  header: { cell: TableHeaderCell },
                  body: { cell: TableBodyCell },
                } : {}}
              />
            </DragIndexContext.Provider>
          </SortableContext>
        </DndContext>
        {/* <div 
          style={{
            height: '5px',
            borderTop: '1px solid #f0f0f0',
            background: 'rgb(243 243 243)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            fontSize: '14px',
            cursor: 'row-resize'
          }}
          // onMouseDown={(e) => {
          //   const startY = e.clientY;
          //   const table = e.currentTarget.parentElement;
          //   const startHeight = table.getBoundingClientRect().height;
          //   const maxHeight = 200;
          //   const onMouseMove = (e) => {
          //     const delta = e.clientY - startY;
          //     const newHeight = Math.min(startHeight + delta, maxHeight);
          //     table.style.height = `${newHeight}px`;
          //   };

          //   const onMouseUp = () => {
          //     document.removeEventListener('mousemove', onMouseMove);
          //     document.removeEventListener('mouseup', onMouseUp);
          //   };

          //   document.addEventListener('mousemove', onMouseMove);
          //   document.addEventListener('mouseup', onMouseUp);
          // }}
        >
        </div> */}
      </div>
    </Spin>
  );
};

export default DynamicTable;