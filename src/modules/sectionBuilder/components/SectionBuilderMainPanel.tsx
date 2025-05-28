import React from "react";
import {
  Form,
  Input,
  DatePicker,
  Spin,
  Select,
  Row,
  Col,
  Empty,
  Button,
} from "antd";
import moment from "moment";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";

import styles from "../styles/SectionBuilderTab.module.css";
import { DragableTable } from "./DragableTable";
import SectionPreview from "./sectionPreview";

interface SectionBuilderMainPanelProps {
  onAddSection: () => void;
  form: any;
  isLoading: boolean;
  loadingMessage: string;
  selectedSection: any;
  selectedComponents: any[];
  sectionFormValues: {
    sectionLabel: string;
    instructions: string;
    effectiveDateTime: string;
    structureType: "structured" | "unstructured";
    componentIds?: any[];
    style?: {
      marginsEnabled: boolean;
      textAlignment: string;
      tableAlignment: string;
      splitColumns: number;
    };
  };
  isPreview: boolean;
  onSectionLabelChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onEffectiveDateChange: (date: moment.Moment | null) => void;
  onStructureTypeChange: (value: "structured" | "unstructured") => void;
  onDragEnd: (dragIndex: number, dropIndex: number) => void;
  onRemoveComponent: (record: any) => void;
  onClearComponents: () => void;
  previewComponent: any[];
}

export const SectionBuilderMainPanel: React.FC<
  SectionBuilderMainPanelProps
> = ({
  form,
  isLoading,
  loadingMessage,
  selectedSection,
  selectedComponents,
  sectionFormValues,
  isPreview,
  onSectionLabelChange,
  onInstructionsChange,
  onEffectiveDateChange,
  onStructureTypeChange,
  onDragEnd,
  onRemoveComponent,
  onClearComponents,
  previewComponent,
  onAddSection
}) => {
  return (
    <div
      className={styles["main-section"]}
      style={{
        position: "relative",
        height: "calc(100vh - 90px)",
      }}
    >
      {/* Main Form Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 100,
          }}
        >
          <Spin
            size="large"
            tip={loadingMessage}
            style={{
              fontSize: "14px",
              color: "#1890ff",
            }}
          />
        </div>
      )}

      {!selectedSection ? (
        <span
          style={{
            color: "#999",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            width: "100%",
            padding: "20px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <Empty
            style={{ fontSize: "14px", color: "#888" }}
            description="Please select a Section or create a new one from the list of Section"
          />
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={onAddSection}
            style={{ marginTop: "10px" }}
          >
            Create New Section
          </Button>
        </span>
      ) : isPreview ? (
        <SectionPreview previewComponent={previewComponent} />
      ) : (
        <>
          {/* Main Section Form */}
          <Form
            form={form}
            style={{
              // marginBottom: "8px",
              width: "100%",
            }}
          >
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Form.Item
                  name="sectionLabel"
                  label="Section Label"
                  rules={[
                    { required: true, message: "Please enter section label" },
                  ]}
                >
                  <Input
                    placeholder="Enter Section Label"
                    size="middle"
                    style={{ fontSize: "12px" }}
                    disabled={selectedSection?.handle ? true : false}
                    value={sectionFormValues.sectionLabel}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase();
                      onSectionLabelChange(value);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="instructions" label="Instruction">
                  <Input
                    placeholder="Enter Instruction"
                    size="middle"
                    style={{ fontSize: "12px" }}
                    value={sectionFormValues.instructions}
                    onChange={(e) => onInstructionsChange(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="structureType"
                  label="Structure Type"
                  rules={[
                    { required: true, message: "Please select structure type" },
                  ]}
                >
                  <Select
                    placeholder="Select Structure Type"
                    style={{ width: "100%" }}
                    size="middle"
                    value={sectionFormValues.structureType}
                    onChange={(value) => {
                      form.setFieldsValue({ structureType: value });
                      onStructureTypeChange(value);
                    }}
                  >
                    <Select.Option value="structured">Structured</Select.Option>
                    <Select.Option value="unstructured">
                      Unstructured
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="effectiveDateTime" label="Effective DateTime">
                  <DatePicker
                    style={{
                      width: "100%",
                      fontSize: "12px",
                    }}
                    size="middle"
                    placeholder="Select Date"
                    value={
                      sectionFormValues.effectiveDateTime
                        ? moment(sectionFormValues.effectiveDateTime)
                        : null
                    }
                    onChange={(date) => onEffectiveDateChange(date)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {selectedSection && (
            <DragableTable
              dataSource={selectedComponents.map((component) => ({
                ...component,
                id: component.id || `${Date.now()}-${component.componentLabel}`,
              }))}
              onDragEnd={onDragEnd}
              onRemoveComponent={onRemoveComponent}
              onClearComponents={onClearComponents}
            />
          )}
        </>
      )}
    </div>
  );
};
