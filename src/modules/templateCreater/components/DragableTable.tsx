import React from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { HolderOutlined, ClearOutlined } from "@ant-design/icons";
import { MdDeleteOutline } from "react-icons/md";
import { GroupId } from "../types/TemplateTypes";

interface DragableTableProps {
  dataSource: GroupId[];
  columns?: ColumnsType<GroupId>;
  onDragEnd: (dragIndex: number, dropIndex: number) => void;
  onRemoveComponent?: (record: GroupId) => void;
  onClearComponents?: () => void;
  rowKey?: string;
  scroll?: { y?: string | number; x?: string | number };
  style?: React.CSSProperties;
}

export function DragableTable({
  dataSource,
  columns,
  onDragEnd,
  onRemoveComponent,
  onClearComponents,
  rowKey = "handle",
  scroll = { y: "calc(100vh - 200px)", x: "max-content" },
  style,
}: DragableTableProps) {
  // Default columns if not provided
  const defaultColumns: ColumnsType<GroupId> = [
    {
      title: "Drag",
      dataIndex: "drag",
      width: 30,
      render: () => (
        <HolderOutlined
          style={{
            cursor: "move",
            color: "#1890ff",
          }}
        />
      ),
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      width: 120,
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
            onClick={() => onRemoveComponent(record)}
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
      components={{
        body: {
          row: (props) => {
            const index = dataSource.findIndex(
              (item) => item[rowKey as keyof GroupId] === props["data-row-key"]
            );
            return React.createElement("tr", {
              ...props,
              style: {
                ...props.style,
                cursor: "move",
              },
              onDragStart: (e) => {
                e.dataTransfer?.setData("text/plain", `${index}`);
              },
              onDragOver: (e) => {
                e.preventDefault();
              },
              onDrop: (e) => {
                e.preventDefault();
                const dragIndex = parseInt(
                  e.dataTransfer?.getData("text/plain") || "0"
                );
                onDragEnd(dragIndex, index);
              },
              draggable: true,
            });
          },
        },
      }}
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
