import React from "react";
import {
  Switch,
  InputNumber,
  Button,
  Radio,
  Typography,
  Space,
  message,
} from "antd";
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useSectionForm } from "../context/SectionFormContext";

const { Text } = Typography;

const ConfigFile: React.FC = () => {
  const { sectionFormValues, setSectionFormValues } = useSectionForm();
 console.log(sectionFormValues);
  const handleApply = () => {
    try {
      // Log the applied configuration
      console.log("Applied Configuration:", {
        marginsEnabled: sectionFormValues.style.marginsEnabled,
        textAlignment: sectionFormValues.style.textAlignment,
        tableAlignment: sectionFormValues.style.tableAlignment,
        splitColumns: sectionFormValues.style.splitColumns,
      });

      // Show success message
      message.success("Configuration applied successfully");
    } catch (error) {
      console.error("Error applying configuration:", error);
      message.error("Failed to apply configuration");
    }
  };

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <SettingOutlined
          style={{
            fontSize: "16px",
            color: "#4a4a4a",
            marginRight: "8px",
          }}
        />
        <Text
          strong
          style={{
            fontSize: "15px",
            color: "#333",
            margin: 0,
          }}
        >
          Configuration Panel
        </Text>
      </div>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Page Margins */}
        <div>
          <Text
            strong
            style={{
              fontSize: "13px",
              color: "#333",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Border Margin
          </Text>
          <div
            style={{
              backgroundColor: "#f9f9f9",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: "12px", color: "#666" }}>
              Enable Border Margin
            </Text>
            <Switch
              checked={sectionFormValues.style.marginsEnabled}
              onChange={(checked) =>
                setSectionFormValues((prev) => ({
                  ...prev,
                  style: {
                    ...prev.style,
                    marginsEnabled: checked,
                  },
                }))
              }
              size="small"
            />
          </div>
        </div>

        {/* Text Alignment */}
        <div>
          <Text
            strong
            style={{
              fontSize: "13px",
              color: "#333",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Text Alignment
          </Text>
          <Radio.Group
            value={sectionFormValues.style.textAlignment}
            onChange={(e) =>
              setSectionFormValues((prev) => ({
                ...prev,
                style: {
                  ...prev.style,
                  textAlignment: e.target.value,
                },
              }))
            }
            style={{ width: "100%", display: "flex" }}
            size="small"
          >
            <Radio.Button value="left" style={{ flex: 1, textAlign: "center" }}>
              <AlignLeftOutlined />
            </Radio.Button>
            <Radio.Button
              value="center"
              style={{ flex: 1, textAlign: "center" }}
            >
              <AlignCenterOutlined />
            </Radio.Button>
            <Radio.Button
              value="right"
              style={{ flex: 1, textAlign: "center" }}
            >
              <AlignRightOutlined />
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Table Alignment */}
        <div>
          <Text
            strong
            style={{
              fontSize: "13px",
              color: "#333",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Table Alignment
          </Text>
          <Radio.Group
            value={sectionFormValues.style.tableAlignment}
            onChange={(e) =>
              setSectionFormValues((prev) => ({
                ...prev,
                style: {
                  ...prev.style,
                  tableAlignment: e.target.value,
                },
              }))
            }
            style={{ width: "100%", display: "flex" }}
            size="small"
          >
            <Radio.Button value="left" style={{ flex: 1, textAlign: "center" }}>
              <AlignLeftOutlined />
            </Radio.Button>
            <Radio.Button
              value="center"
              style={{ flex: 1, textAlign: "center" }}
            >
              <AlignCenterOutlined />
            </Radio.Button>
            <Radio.Button
              value="right"
              style={{ flex: 1, textAlign: "center" }}
            >
              <AlignRightOutlined />
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Split Columns */}
        <div>
          <Text
            strong
            style={{
              fontSize: "13px",
              color: "#333",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Split Columns
          </Text>
          <InputNumber
            min={1}
            max={4}
            value={sectionFormValues.style.splitColumns}
            onChange={(value) => {
              // Only allow values between 1 and 4
              let newValue = Number(value);
              if (isNaN(newValue) || newValue < 1) newValue = 1;
              if (newValue > 4) newValue = 4;
              setSectionFormValues((prev) => ({
                ...prev,
                style: {
                  ...prev.style,
                  splitColumns: newValue,
                },
              }));
            }}
            style={{ width: "100%" }}
            size="small"
            parser={value => {
              // Remove non-numeric characters and restrict to 1-4
              let num = parseInt(value?.replace(/[^\d]/g, ""), 10);
              if (isNaN(num) || num < 1) return 1;
              if (num > 4) return 4;
              return num;
            }}
            maxLength={1}
          />
          <Text
            style={{
              fontSize: "11px",
              color: "#666",
              display: "block",
              marginTop: "4px",
            }}
          >
            Range: 1-4 columns
          </Text>
        </div>

        {/* Apply Button
        <Button
          type="primary"
          onClick={handleApply}
          style={{
            width: "100%",
            height: "36px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "500",
            marginTop: "8px",
          }}
        >
          Apply Configuration
        </Button> */}
      </Space>
    </div>
  );
};

export default ConfigFile;
