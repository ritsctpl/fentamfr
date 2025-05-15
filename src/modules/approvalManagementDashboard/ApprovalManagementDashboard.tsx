"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Layout, Typography, message } from "antd";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@context/AuthContext";
import { decryptToken } from "@utils/encryption";
import jwtDecode from "jwt-decode";
import { parseCookies } from "nookies";
import { t } from "i18next";
import styles from "../approvalManagementDashboard/styles/approvalManagementDashboard.module.css";
import CommonTable from "./components/CommonTable";
import ApprovalFilters from "./components/ApprovalFilters";
import { AnimatePresence } from "framer-motion";
import PDFViewer from "./components/PDFViewer";

const dummydata = [
  {
    documentName: "MFR-001",
    createdBy: "User 1",
    reviewDate: "2025-05-06",
    status: "In-Review",
    view: "MFR-001",
    action: "Approve/Reject",
    type: "mfr",
    pdfUrl: "/manufacturing/dummypdf/MFR.pdf",
  },
  {
    documentName: "BMR-001",
    createdBy: "User 2",
    reviewDate: "2025-05-06",
    status: "In-Review",
    view: "BMR-001",
    action: "View",
    type: "bmr",
    pdfUrl: "/manufacturing/dummypdf/BMR.pdf",
  },
  {
    documentName: "MFR-002",
    createdBy: "User 3",
    reviewDate: "2025-05-05",
    status: "Approved",
    view: "MFR-002",
    action: "View",
    type: "mfr",
    pdfUrl: "/manufacturing/dummypdf/MFR.pdf",
  },
  {
    documentName: "BMR-002",
    createdBy: "User 4",
    reviewDate: "2025-05-04",
    status: "Rejected",
    view: "BMR-002",
    action: "View",
    type: "bmr",
    pdfUrl: "/manufacturing/dummypdf/BMR.pdf",
  },
  {
    documentName: "MFR-003",
    createdBy: "User 5",
    reviewDate: "2025-05-03",
    status: "In-Review",
    view: "MFR-003",
    action: "Approve/Reject",
    type: "mfr",
    pdfUrl: "/manufacturing/dummypdf/MFR.pdf",
  },
  {
    documentName: "BMR-003",
    createdBy: "User 6",
    reviewDate: "2025-05-02",
    status: "Approved",
    view: "BMR-003",
    action: "View",
    type: "bmr",
    pdfUrl: "/manufacturing/dummypdf/BMR.pdf",
  },
  {
    documentName: "MFR-004",
    createdBy: "User 7",
    reviewDate: "2025-05-01",
    status: "Rejected",
    view: "MFR-004",
    action: "View",
    type: "mfr",
    pdfUrl: "/manufacturing/dummypdf/MFR.pdf",
  },
  {
    documentName: "BMR-004",
    createdBy: "User 8",
    reviewDate: "2025-04-30",
    status: "In-Review",
    view: "BMR-004",
    action: "Approve/Reject",
    type: "bmr",
    pdfUrl: "/manufacturing/dummypdf/BMR.pdf",
  },
];

interface DecodedToken {
  preferred_username: string;
}

const ApprovalManagementDashboard = () => {
  4;
  const { isAuthenticated, token } = useAuth();
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [documentNameFilter, setDocumentNameFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [requestDate, setRequestDate] = useState<any>(null);
  const [moduleFilter, setModuleFilter] = useState<string>("");

  // State for dynamic data
  const [documents, setDocuments] = useState(dummydata);

  const [selectedPDF, setSelectedPDF] = useState<{
    path: string;
    documentName: string;
  } | null>(null);
  useEffect(() => {
    const fetchResourceData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };
    fetchResourceData();
  }, [isAuthenticated, username, call, token, site]);
  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

  // Filtered data logic using useMemo for performance
  const filteredData = useMemo(() => {
    return documents.filter((item) => {
      // Type filter
      if (typeFilter && item.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      // Document name filter - case insensitive search
      if (
        documentNameFilter &&
        !item.documentName
          .toLowerCase()
          .includes(documentNameFilter.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        statusFilter &&
        item.status.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      // Date filter
      if (requestDate && item.reviewDate !== requestDate.format("YYYY-MM-DD")) {
        return false;
      }

      return true;
    });
  }, [typeFilter, documentNameFilter, statusFilter, requestDate, documents]);

  // Handle refresh
  const handleRefresh = () => {
    setTypeFilter("");
    setDocumentNameFilter("");
    setStatusFilter("");
    setRequestDate(null);
    setModuleFilter("");
    setDocuments(dummydata);
    message.success("Filters reset successfully");
  };

  // Approve and Reject handlers with status update
  const handleApprove = (record: any, nextGroup: string, nextUser: string) => {
    const updatedDocs = documents.map((doc) =>
      doc.documentName === record.documentName
        ? {
            ...doc,
            status: "Approved",
            action: "View",
          }
        : doc
    );
    setDocuments(updatedDocs);
    message.success(`Document ${record.documentName} approved`);
  };

  const handleReject = (record: any) => {
    const updatedDocs = documents.map((doc) =>
      doc.documentName === record.documentName
        ? { ...doc, status: "Rejected", action: "Resubmit" }
        : doc
    );
    setDocuments(updatedDocs);
    message.error(
      `Document ${record.documentName} has been rejected and sent back to ${record.createdBy}`
    );
  };

  // Modify handleViewDocument to use a more specific PDF path
  const handleViewDocument = (record: any) => {
    setSelectedPDF({
      path: record.pdfUrl,
      documentName: record.documentName,
    });
  };

  const handleClosePDF = () => {
    setSelectedPDF(null);
  };

  // Apply filters when filter values change
  useEffect(() => {
    const fetchItemData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    fetchItemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, username]);

  return (
    <div className={styles.container}>
      <CommonAppBar
        onSearchChange={() => {}}
        allActivities={[]}
        username={username}
        site={null}
        appTitle={t("Approval Management Dashboard")}
        onSiteChange={handleSiteChange}
      />
      <div className={styles.dataFieldBody}>
        <ApprovalFilters
          moduleFilter={moduleFilter}
          statusFilter={statusFilter}
          requestDate={requestDate}
          typeFilter={typeFilter}
          documentNameFilter={documentNameFilter}
          setModuleFilter={setModuleFilter}
          setStatusFilter={setStatusFilter}
          setRequestDate={setRequestDate}
          setTypeFilter={setTypeFilter}
          setDocumentNameFilter={setDocumentNameFilter}
          onRefresh={handleRefresh}
        />

        <div className={styles.dataFieldBodyContentsTop}>
          <Typography className={styles.dataLength}>
            {t("Approval Documents")} ({filteredData.length})
          </Typography>
        </div>

        <CommonTable
          data={filteredData}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={handleViewDocument}
        />
      </div>
      {/* <AnimatePresence>
        {selectedPDF && (
          <PDFViewer
            fileUrl={selectedPDF.path}
            documentName={selectedPDF.documentName}
            onClose={handleClosePDF}
            // username={username}
          />
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default ApprovalManagementDashboard;
