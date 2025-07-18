import type { CSSProperties } from "react";

interface FormPreviewProps {
  component: any[];
  styleData?: {
    marginsEnabled?: boolean;
    textAlignment?: string;
    tableAlignment?: string;
    splitColumns?: number;
  };
  title?: string;
  instruction?: string;
}

function FormPreview({
  component,
  styleData = {},
  title = "",
  instruction = "",
}: FormPreviewProps) {
  console.log(styleData);

  // Mode 3: Simple form layout (marginsEnabled = false)
  if (styleData.marginsEnabled === false) {
    const formStyle: CSSProperties = {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      padding: "20px",
      textAlign:
        (styleData.textAlignment as CSSProperties["textAlign"]) || "left",
    };

    const titleStyle: CSSProperties = {
      fontWeight: "bold",
      marginBottom: "15px",
      textAlign: "center",
    };

    const instructionStyle: CSSProperties = {
      fontSize: "12px",
      color: "#000",
      // marginTop: "10px",
      marginLeft: "5px",
    };

    const itemStyle: CSSProperties = {
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
    };

    const labelStyle: CSSProperties = {
      fontWeight: "bold",
      marginRight: "10px",
      minWidth: "200px",
    };

    const valueStyle: CSSProperties = {
      marginLeft: "10px",
    };

    return (
      <div style={formStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        {component.map((item, index) => (
          <div key={index} style={itemStyle}>
            <span style={labelStyle}>{item.componentLabel}</span>
            <span>:</span>
            <span style={valueStyle}>
              {item.defaultValue === "NA" ? "" : item.defaultValue}
              {item.unit && item.defaultValue !== "NA" ? ` ${item.unit}` : ""}
            </span>
          </div>
        ))}
        {instruction && <div style={instructionStyle}>{instruction}</div>}
      </div>
    );
  }

  // Mode 2: Split columns layout
  if (styleData.splitColumns && styleData.splitColumns > 1) {
    const containerStyle: CSSProperties = {
      width: "38vw",
      maxWidth: "38vw",
      overflowX: "auto",
      border: "1px solid black",
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      textAlign:
        (styleData.textAlignment as CSSProperties["textAlign"]) || "left",
      ...(styleData.marginsEnabled ? { margin: "10px" } : {}),
    };

    const titleStyle: CSSProperties = {
      textAlign: "center",
      fontWeight: "bold",
      borderBottom: "1px solid black",
      padding: "10px",
      backgroundColor: "#f5f5f5",
    };

    const instructionStyle: CSSProperties = {
      fontSize: "12px",
      color: "#000",
      // marginTop: "10px",
      marginLeft: "10px",
    };

    // Group items into rows based on splitColumns
    const groupedItems = [];
    for (let i = 0; i < component.length; i += styleData.splitColumns) {
      groupedItems.push(component.slice(i, i + styleData.splitColumns));
    }

    const rowStyle: CSSProperties = {
      display: "flex",
      borderBottom: "1px solid black",
    };

    const cellStyle: CSSProperties = {
      flex: 1,
      display: "flex",
      borderRight: "1px solid black",
    };

    const labelCellStyle: CSSProperties = {
      width: "50%",
      padding: "5px",
      fontWeight: "bold",
      backgroundColor: "#f9f9f9",
      borderRight: "1px solid black",
      textAlign:
        (styleData.tableAlignment as CSSProperties["textAlign"]) || "left",
    };

    const valueCellStyle: CSSProperties = {
      width: "50%",
      padding: "5px",
      textAlign:
        (styleData.tableAlignment as CSSProperties["textAlign"]) || "left",
    };

    return (
      <div>
        <div style={containerStyle}>
          {title && <div style={titleStyle}>{title}</div>}
          {groupedItems.map((row, rowIndex) => (
            <div key={rowIndex} style={rowStyle}>
              {row.map((item, cellIndex) => (
                <div
                  key={cellIndex}
                  style={{
                    ...cellStyle,
                    ...(cellIndex === row.length - 1
                      ? { borderRight: "none" }
                      : {}),
                  }}
                >
                  <div style={labelCellStyle}>{item.componentLabel}</div>
                  <div style={valueCellStyle}>
                    {item.defaultValue === "NA" ? "" : item.defaultValue}
                    {item.unit && item.defaultValue !== "NA"
                      ? ` ${item.unit}`
                      : ""}
                  </div>
                </div>
              ))}
              {/* Fill empty cells if row is not complete */}
              {row.length < styleData.splitColumns &&
                Array.from({ length: styleData.splitColumns - row.length }).map(
                  (_, emptyIndex) => (
                    <div key={`empty-${emptyIndex}`} style={cellStyle}>
                      <div style={labelCellStyle}></div>
                      <div style={valueCellStyle}></div>
                    </div>
                  )
                )}
            </div>
          ))}
        </div>
        {instruction && <div style={instructionStyle}>{instruction}</div>}
      </div>
    );
  }

  // Mode 1: Default table layout
  const containerStyle: CSSProperties = {
    width: "38vw",
    maxWidth: "38vw",
    overflowX: "auto",
    border: "1px solid black",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    textAlign:
      (styleData.textAlignment as CSSProperties["textAlign"]) || "left",
    ...(styleData.marginsEnabled ? { margin: "10px" } : {}),
  };

  const titleStyle: CSSProperties = {
    textAlign: "center",
    fontWeight: "bold",
    borderBottom: "1px solid black",
    padding: "10px",
    backgroundColor: "#f5f5f5",
  };

  const instructionStyle: CSSProperties = {
    fontSize: "12px",
    color: "#000",
    // marginTop: "10px",
    marginLeft: "10px",
  };

  const rowStyle: CSSProperties = {
    display: "flex",
    borderBottom: "1px solid black",
  };

  const labelCellStyle: CSSProperties = {
    width: "40%",
    borderRight: "1px solid black",
    padding: "5px",
    fontWeight: "bold",
    backgroundColor: "#f9f9f9",
    textAlign:
      (styleData.tableAlignment as CSSProperties["textAlign"]) || "left",
  };

  const valueCellStyle: CSSProperties = {
    width: "60%",
    padding: "5px",
    textAlign:
      (styleData.tableAlignment as CSSProperties["textAlign"]) || "left",
  };

  return (
    <div>
      <div style={containerStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        {component.map((item, index) => (
          <div key={index} style={rowStyle}>
            <div style={labelCellStyle}>{item.componentLabel}</div>
            <div style={valueCellStyle}>
              {item.defaultValue === "NA" ? "" : item.defaultValue}
              {item.unit && item.defaultValue !== "NA" ? ` ${item.unit}` : ""}
            </div>
          </div>
        ))}
      </div>
      {instruction && <div style={instructionStyle}>{instruction}</div>}
    </div>
  );
}

export default FormPreview;
