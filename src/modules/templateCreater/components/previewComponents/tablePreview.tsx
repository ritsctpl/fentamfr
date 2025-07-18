import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

interface TablePreviewProps {
  component: any[];
  title?: string;
  instruction?: string;
}

function TablePreview({
  component,
  title = "",
  instruction = "",
}: TablePreviewProps) {
  // Define standard font size to use everywhere
  const standardFontSize = "12px";
  
  const renderTable = (tableComp: any) => {
    const { tableConfig, componentLabel } = tableComp;

    if (!tableConfig) return null;

    const { columnNames, rows, rowData } = tableConfig;
    const numRows = Number.parseInt(rows);

    // Create table data structure
    const tableRows = [];
    for (let i = 1; i <= numRows; i++) {
      const row: any = {};
      for (let j = 0; j < columnNames.length; j++) {
        const cellKey = `row${i}-col${j}`;
        row[`col${j}`] = rowData[cellKey] || "";
      }
      tableRows.push(row);
    }

    return (
      <div style={{ width: "100%" }}>
        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
            fontSize: standardFontSize,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Table Header */}
          <thead>
            <tr>
              {columnNames.map((col: any, index: number) => (
                <th
                  key={index}
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    fontSize: standardFontSize,
                    lineHeight: "1.2",
                  }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {tableRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columnNames.map((col: any, colIndex: number) => (
                  <td
                    key={colIndex}
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      textAlign: "center",
                      fontSize: standardFontSize,
                      lineHeight: "1.2",
                    }}
                  >
                    {row[`col${colIndex}`]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFormField = (comp: any) => {
    const { componentLabel, dataType, defaultValue, unit } = comp;

    const formatValue = () => {
      if (!defaultValue) return "";

      if (dataType === "Integer") {
        return Number.parseInt(defaultValue).toString();
      }
      return defaultValue;
    };

    return (
      <div
        key={comp.handle}
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: standardFontSize,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Text
          strong
          style={{
            color: "#000",
            fontSize: standardFontSize,
            marginRight: "8px",
          }}
        >
          {componentLabel}:
        </Text>
        <Text
          style={{
            fontSize: standardFontSize,
          }}
        >
          {formatValue()}
          {unit}
        </Text>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        fontFamily: "Arial, sans-serif",
        width: "100%",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "12px",
          fontSize: standardFontSize,
          fontWeight: "bold",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {title}
      </div>
      {/* Render components in their original order */}
      {component.map((comp, index) => {
        if (comp.dataType === "Table") {
          return (
            <div key={index}>
              {/* Table Title */}
              {renderTable(comp)}
            </div>
          );
        } else {
          return renderFormField(comp);
        }
      })}
    </div>
  );
}

export default TablePreview;
