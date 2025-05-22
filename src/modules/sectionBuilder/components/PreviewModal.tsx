import React from "react";
import { Modal } from "antd";

interface PreviewModalProps {
  previewComponents?: any[];
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  previewComponents,
  onClose,
}) => {
  return (
    <Modal
      open={!!previewComponents}
      onCancel={onClose}
      width={600} // A4 width in pixels (210mm)
      bodyStyle={{
        height: 650, // A4 height in pixels (297mm)
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        margin: 0,
        overflow: "hidden",
      }}
      footer={null}
      centered
      title="Preview"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          border: "1px solid #d9d9d9",
        }}
      >
        {/* Blank A4 page content will go here */}
      </div>
    </Modal>
  );
};

export default PreviewModal;
