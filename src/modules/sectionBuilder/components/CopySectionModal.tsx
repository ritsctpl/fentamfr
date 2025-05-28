import React from "react";
import { Modal, Form, Input } from "antd";

interface CopySectionModalProps {
  isVisible: boolean;
  copySectionLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  onLabelChange: (value: string) => void;
}

export const CopySectionModal: React.FC<CopySectionModalProps> = ({
  isVisible,
  copySectionLabel,
  onCancel,
  onConfirm,
  onLabelChange,
}) => {
  return (
    <Modal
      title="Copy Section"
      open={isVisible}
      onOk={onConfirm}
      onCancel={onCancel}
      centered
      okText="Copy"
      cancelText="Cancel"
    >
      <Form layout="vertical">
        <Form.Item
          label="New Section Label"
          rules={[
            { required: true, message: "Please enter a new section label" },
          ]}
        >
          <Input
            ref={(input) => {
              if (input) {
                input.focus();
                input.select();
              }
            }}
            placeholder="Enter new section label"
            value={copySectionLabel}
            onChange={(e) => {
              const value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9_]/g, "");
              onLabelChange(value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
