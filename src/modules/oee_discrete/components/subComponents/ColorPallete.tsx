import React from "react";
import { Button, Drawer, Modal, Space, Checkbox } from "antd";
import { IoIosColorPalette } from "react-icons/io";
import { FaRegFilePdf } from "react-icons/fa6";
import FilterSettings from "../setting";
import PdfContent from "../PdfContent";

interface ColorPalleteProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  componentIds: string[];
  setComponentIds: (ids: string[]) => void;
  selectAll: boolean;
  handleSelectAllChange: (e: any) => void;
  options: { label: string; value: string }[];
  handleCheckboxChange: (checkedValues: any) => void;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  isModalVisible2: boolean;
  setIsModalVisible2: (visible: boolean) => void;
  generatePDF: () => void;
}

const ColorPallete: React.FC<ColorPalleteProps> = ({
  visible,
  setVisible,
  componentIds,
  setComponentIds,
  selectAll,
  handleSelectAllChange,
  options,
  handleCheckboxChange,
  isModalVisible,
  setIsModalVisible,
  isModalVisible2,
  setIsModalVisible2,
  generatePDF,
}) => {
  return (
    <>
      <Drawer
        width="55%"
        title="Customize Colors"
        closable={false}
        open={visible}
        extra={
          <Space>
            <Button
              onClick={() => {
                localStorage.removeItem("filterColors");
                window.location.reload();
              }}
              danger
            >
              Reset Color Filter
            </Button>
            <Button onClick={() => setVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={() => setVisible(false)}>
              OK
            </Button>
          </Space>
        }
      >
        <FilterSettings visible={visible} />
      </Drawer>
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="download" type="primary" onClick={generatePDF}>
            Download
          </Button>,
        ]}
        width="90%"
        bodyStyle={{
          height: "72vh",
          overflowY: "scroll",
          padding: "20px",
        }}
      >
        <div id="pdf-content" style={{ width: "100%" }}>
          <PdfContent componentIds={componentIds} />
        </div>
      </Modal>
      <Modal
        title="Export Filter"
        open={isModalVisible2}
        onCancel={() => setIsModalVisible2(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible2(false)}>
            Cancel
          </Button>,
          <Button
            disabled={componentIds.length === 0}
            key="download"
            type="primary"
            onClick={() => { setIsModalVisible(true) }}
          >
            Preview
          </Button>,
        ]}
        width={400}
        bodyStyle={{ height: "300px", overflowY: "scroll" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Button
            onClick={() => {
              setComponentIds([sessionStorage.getItem("activeTabIndex")]);
              setIsModalVisible(true);
            }}
          >
            Download current Tab
          </Button>
          <h4>Other Options</h4>
          <Checkbox checked={selectAll} onChange={handleSelectAllChange}>
            Select All
          </Checkbox>
          <Checkbox.Group
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
            options={options}
            value={componentIds}
            onChange={handleCheckboxChange}
          />
        </div>
      </Modal>
    </>
  );
};

export default ColorPallete;