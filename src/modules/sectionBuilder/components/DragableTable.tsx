import React from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { HolderOutlined } from "@ant-design/icons";
import { MdDeleteOutline } from "react-icons/md";

interface DragableTableProps<T> {
  dataSource: T[];
  columns?: ColumnsType<T>;
  onDragEnd: (dragIndex: number, dropIndex: number) => void;
  onRemoveComponent?: (record: T) => void;
  rowKey?: string;
  scroll?: { y?: string | number; x?: string | number };
  style?: React.CSSProperties;
}

export function DragableTable<T>({
  dataSource,
  columns,
  onDragEnd,
  onRemoveComponent,
  rowKey = "id",
  scroll = { y: "calc(100vh - 350px)", x: "max-content" },
  style,
}: DragableTableProps<T>) {
  console.log(dataSource);
  // Default columns if not provided
  const defaultColumns: ColumnsType<T> = [
    {
      title: "Drag",
      dataIndex: "drag",
      width: 50,
      // fixed: "left",
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
      title: "Component Label",
      dataIndex: "label",
      key: "label",
      width: 150,
    },
    {
      title: "Data Type",
      dataIndex: "dataType",
      key: "dataType",
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      width: 50,
      fixed: "right",
      align: "center",
      render: (_, record) =>
        onRemoveComponent ? (
          <MdDeleteOutline
            size={20}
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
              (item) => item[rowKey as keyof T] === props["data-row-key"]
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
