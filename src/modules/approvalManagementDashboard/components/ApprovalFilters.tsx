import React from "react";
import {
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Space,
  Card,
  Button,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { MdCheckCircle, MdAccessTime, MdCancel } from "react-icons/md";
import { t } from "i18next";

interface ApprovalFiltersProps {
  moduleFilter: string;
  statusFilter: string;
  requestDate: any;
  typeFilter: string;
  documentNameFilter: string;
  setModuleFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setRequestDate: (value: any) => void;
  setTypeFilter: (value: string) => void;
  setDocumentNameFilter: (value: string) => void;
  onRefresh: () => void;
}

const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  moduleFilter,
  statusFilter,
  requestDate,
  typeFilter,
  documentNameFilter,
  setModuleFilter,
  setStatusFilter,
  setRequestDate,
  setTypeFilter,
  setDocumentNameFilter,
  onRefresh,
}) => {
  return (
    <Card
      style={{
        width: "100%",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        borderRadius: "4px",
        marginBottom: "8px",
      }}
      bodyStyle={{
        padding: "8px 12px",
      }}
    >
      <Row gutter={16} align="middle" justify="space-between">
        <Col>
          <Space size={12}>
            {/* Type Filter */}
            <Row align="middle" gutter={6}>
              <Col style={{ fontSize: "12px", fontWeight: 500 }}>
                {t("Type")}:
              </Col>
              <Col>
                <Select
                  placeholder={t("Select Type")}
                  style={{
                    width: 180,
                    fontSize: "12px",
                    height: 32,
                  }}
                  value={typeFilter}
                  onChange={(value) => setTypeFilter(value)}
                  suffixIcon={<FilterOutlined style={{ fontSize: "12px" }} />}
                >
                  <Select.Option value="MFR">MFR</Select.Option>
                  <Select.Option value="BMR">BMR</Select.Option>
                </Select>
              </Col>
            </Row>

            {/* Document Name Filter */}
            <Row align="middle" gutter={6}>
              <Col style={{ fontSize: "12px", fontWeight: 500 }}>
                {t("Document Name")}:
              </Col>
              <Col>
                <Input
                  placeholder={
                     `Search Document`
                  }
                  suffix={<SearchOutlined style={{ fontSize: "12px" }} />}
                  style={{
                    width: 180,
                    fontSize: "12px",
                    height: 32,
                  }}
                  value={documentNameFilter}
                  onChange={(e) => setDocumentNameFilter(e.target.value)}
                  // disabled={!typeFilter}
                />
              </Col>
            </Row>

            {/* Status Filter */}
            <Row align="middle" gutter={6}>
              <Col style={{ fontSize: "12px", fontWeight: 500 }}>
                {t("Status")}:
              </Col>
              <Col>
                <Select
                  placeholder={t("Select Status")}
                  style={{
                    width: 180,
                    fontSize: "12px",
                    height: 32,
                  }}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  suffixIcon={<FilterOutlined style={{ fontSize: "12px" }} />}
                  allowClear
                >
                  <Select.Option value="approved">
                    <MdCheckCircle
                      style={{ marginRight: "8px", color: "#52c41a" }}
                    />
                    {t("Approved")}
                  </Select.Option>
                  <Select.Option value="pending">
                    <MdAccessTime
                      style={{ marginRight: "8px", color: "#faad14" }}
                    />
                    {t("Pending")}
                  </Select.Option>
                  <Select.Option value="rejected">
                    <MdCancel
                      style={{ marginRight: "8px", color: "#ff4d4f" }}
                    />
                    {t("Rejected")}
                  </Select.Option>
                  <Select.Option value="in-review">
                    <MdAccessTime
                      style={{ marginRight: "8px", color: "#1890ff" }}
                    />
                    {t("In-Review")}
                  </Select.Option>
                </Select>
              </Col>
            </Row>

            {/* Date Filter */}
            <Row align="middle" gutter={6}>
              <Col style={{ fontSize: "12px", fontWeight: 500 }}>
                {t("Date")}:
              </Col>
              <Col>
                <DatePicker
                  placeholder={t("Select Date")}
                  style={{
                    width: 180,
                    fontSize: "12px",
                    height: 32,
                  }}
                  value={requestDate}
                  onChange={(date) => setRequestDate(date)}
                  allowClear
                />
              </Col>
            </Row>
          </Space>
        </Col>

        {/* Refresh Button */}
        <Col>
          <Space size="small">
            <Tooltip title={t("Refresh")}>
              <Button
                icon={<ReloadOutlined style={{ fontSize: "12px" }} />}
                onClick={onRefresh}
                type="text"
                size="small"
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default ApprovalFilters;
