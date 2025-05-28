import React from "react";
import { Tooltip } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../styles/SectionBuilderTab.module.css";

interface SectionBuilderHeaderProps {
  selectedSection: any;
  isPreview: boolean;
  onOpenPreview: () => void;
  onCopySection: () => void;
  onDeleteSection: () => void;
}

export const SectionBuilderHeader: React.FC<SectionBuilderHeaderProps> = ({
  selectedSection,
  isPreview,
  onOpenPreview,
  onCopySection,
  onDeleteSection,
}) => {
  return (
    <div className={styles.header}>
      <span className={styles["header-title"]}>
        {!selectedSection &&<span className={styles["header-title-text"]}>Section Builder</span>}
        {selectedSection && (
          <span className={styles["header-title-text"]}>
            {selectedSection.sectionLabel}
          </span>
        )}
      </span>
      <div className={styles["header-actions"]}>
        {selectedSection && (
          <>
            <Tooltip
              title={isPreview ? "Hide Preview" : "Show Preview"}
              placement="bottom"
            >
              {isPreview ? (
                <EyeInvisibleOutlined
                  style={{
                    color: "#ff4d4f", // Red color to indicate hiding
                    cursor: "pointer",
                    fontSize: "22px",
                    marginRight: "10px",
                  }}
                  onClick={onOpenPreview}
                />
              ) : (
                <EyeOutlined
                  style={{
                    color: "#1890ff", // Blue color for preview
                    cursor: "pointer",
                    fontSize: "22px",
                    marginRight: "10px",
                  }}
                  onClick={onOpenPreview}
                />
              )}
            </Tooltip>
            <Tooltip title="Copy Section" placement="bottom">
              <CopyIcon
                style={{
                  color: selectedSection.handle ? "#1890ff" : "#d9d9d9",
                  cursor: selectedSection.handle ? "pointer" : "not-allowed",
                  fontSize: "22px",
                  marginRight: "10px",
                }}
                onClick={selectedSection.handle ? onCopySection : undefined}
              />
            </Tooltip>
            <Tooltip title="Delete Section" placement="bottom">
              <DeleteIcon
                style={{
                  color: selectedSection.handle ? "#ff4d4f" : "#d9d9d9",
                  cursor: selectedSection.handle ? "pointer" : "not-allowed",
                  fontSize: "22px",
                }}
                onClick={selectedSection.handle ? onDeleteSection : undefined}
              />
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};
