import React from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { HolderOutlined, ClearOutlined } from "@ant-design/icons";
import { MdDeleteOutline } from "react-icons/md";
import { GroupId } from "../types/TemplateTypes";

interface DragableTableProps {
  dataSource: GroupId[];
  columns?: ColumnsType<GroupId>;
  onDragEnd: (dragIndex: number, dropIndex: number) => Promise<void>;
  onRemoveComponent?: (record: GroupId) => void;
  onClearComponents?: () => void;
  onRowClick?: (record: GroupId) => void;
  rowKey?: string;
  scroll?: { y?: string | number; x?: string | number };
  style?: React.CSSProperties;
  selectedRow?: GroupId | null;
}

export function DragableTable({
  dataSource,
  columns,
  onDragEnd,
  onRemoveComponent,
  onClearComponents,
  onRowClick,
  rowKey = "uniqueId",
  scroll = { y: "calc(100vh - 200px)", x: "max-content" },
  style,
  selectedRow,
}: DragableTableProps) {

  console.log(dataSource, 'dataSource');
  
  // Default columns if not provided
  const defaultColumns: ColumnsType<GroupId> = [
    {
      title: "Drag",
      dataIndex: "drag",
      width: 50,
      render: (_, record, index) => (
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer?.setData("text/plain", `${index}`);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dragIndex = parseInt(e.dataTransfer?.getData("text/plain") || "0");
            await onDragEnd(dragIndex, index);
          }}
          style={{ cursor: "move" }}
        >
          <HolderOutlined
            style={{
              color: "#1890ff",
            }}
          />
        </div>
      ),
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      width: 120,
      render: (text, record) => {
        if (record.componentLabel) {
          return <div>{record.componentLabel}</div>;
        } else if (record.sectionLabel) {
          return <div>{record.sectionLabel}</div>;
        } else if (record.groupLabel) {
          return <div>{record.groupLabel}</div>;
        } else {
          return <div>{record.label}</div>;
        }
      },
    },
    {
      title: "Handle",
      dataIndex: "handle",
      key: "handle",
      width: 200,
    },
    {
      title: () => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Actions
          {onClearComponents && dataSource.length > 0 && (
            <ClearOutlined
              onClick={onClearComponents}
              style={{
                color: "red",
                cursor: "pointer",
                marginLeft: "8px",
              }}
            />
          )}
        </div>
      ),
      key: "actions",
      width: 50,
      align: "center",
      render: (_, record) =>
        onRemoveComponent ? (
          <MdDeleteOutline
            size={16}
            style={{
              color: "red",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveComponent(record);
            }}
          />
        ) : null,
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns || defaultColumns}
      rowKey={rowKey}
      pagination={false}
      scroll={scroll}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        style: {
          cursor: 'pointer',
          // backgroundColor: selectedRow?.[rowKey] === record[rowKey] ? '#e6f7ff' : undefined
        }
      })}
      tableLayout="fixed"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    />
  );
}
