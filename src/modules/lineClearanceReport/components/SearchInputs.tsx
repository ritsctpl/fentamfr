import React, { useEffect, useState } from 'react';
import { Input, Button, Row, Col, Form, Modal, Tooltip, Table, message, Select, DatePicker, Dropdown } from 'antd';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DownOutlined } from '@ant-design/icons';

import { parseCookies } from 'nookies';
import { GrChapterAdd } from 'react-icons/gr';
import { useTranslation } from 'react-i18next';
import { retrieveBatchNoList, retrieveItemList, retrieveItemTop50List, retrieveLogs, retrieveOperationList, retrieveOrderNumberList, retrievePcuList, retrievePhaseList, retrieveShopOrderAllList, retrieveShopOrderTop50List } from '@services/equResourceService';
import { fetchAllUsers, fetchtop50LineClearance, fetchTop50Sites, fetchTop50Users, retrieveLineClearanceLogs } from '@services/lineClearanceReportService';
import dayjs from 'dayjs';
import { fetchResourceAll, fetchResourceTop50 } from '@services/ResourceService';
import { AiFillFilePdf } from 'react-icons/ai';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';
const { RangePicker } = DatePicker;

interface SearchInputsProps {
  setData: (data: any[]) => void;
  podCategory: string;
  type: string;
  plant: string;
  dateRange: string
  setDateRange: (dateRange: string) => void;
  status: string;
  setStatus: (status: string) => void;
  data?: any[];
}



const SearchInputs: React.FC<SearchInputsProps> = ({ setData, podCategory, type, plant, dateRange, setDateRange, status, setStatus, data = [] }) => {
  const [form] = Form.useForm();
  const [shopOrder, setShopOrder] = useState('');
  const [item, setItem] = useState('');
  const [pcu, setPcu] = useState('');
  const [itemVersion, setItemVersion] = useState('');
  const { t } = useTranslation();
  const [field, setField] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [phase, setPhase] = useState('');
  const [operation, setOperation] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [user, setUser] = useState('');
  const [resource, setResource] = useState('');
  const [oPlant, setOPlant] = useState('');

  useEffect(() => {
    const cookies = parseCookies();
    const user_Id = cookies.rl_user_id;

    // Set default values for site and user
    setOPlant(plant);
    setUser(user_Id);

    // Set form field values
    form.setFieldsValue({
      site: plant,
      user: user_Id
    });

    // Fetch initial data if plant is available
    if (plant) {
      fetch24HrData();
    }
  }, [plant]);

  const dateRangeOptions = [
    { value: '24hours', label: '24hours' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom' }
  ];

  const statusOptions = [
    { value: 'Complete', label: 'Complete' },
    { value: 'Start', label: 'Start' },
    { value: 'New', label: 'New' },
  ];

  const fetch24HrData = async () => {
    const cookies = parseCookies();
    const user_Id = cookies.rl_user_id;

    let response;

    let sample, startDate, endDate;
    startDate = dayjs(form?.getFieldsValue()?.dateTime?.[0]).format('YYYY-MM-DDTHH:mm:ss');
    endDate = dayjs(form?.getFieldsValue()?.dateTime?.[1]).format('YYYY-MM-DDTHH:mm:ss');
    if (type?.toLowerCase() == 'process') {
      // debugger

      sample = {
        batchNo: pcu ? [pcu] : null,
        templeteName: templateName || null,
        site: oPlant || plant,
        userId: user || user_Id || null,
        resourceId: resource || null,
        dateRange: "24hours",
        status: "Complete",
        startDate: "",
        endDate: ""
      }
    }
    else {

      sample = {
        pcu: pcu ? [pcu] : null,
        templeteName: templateName || null,
        site: oPlant || plant,
        userId: user || user_Id || null,
        resourceId: resource || null,
        dateRange: "24hours",
        status: "Complete",
        startDate: "",
        endDate: ""
      }
    }
    try {
      response = await retrieveLineClearanceLogs(sample);
      // debugger
      if (!response?.errorCode) {
        if (type?.toLowerCase() == 'process') {
          setData(response || []);
        }
        else {
          setData(response || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);

    }
  }

  const site = parseCookies().site;

  const handleSearch = async () => {
    // debugger
    let response;
    let sample
    message.destroy();
    const cookies = parseCookies();
    const user_Id = cookies?.rl_user_id;

    const startDate = dayjs(form?.getFieldsValue()?.dateTime?.[0])?.format('YYYY-MM-DDTHH:mm:ss');
    const endDate = dayjs(form?.getFieldsValue()?.dateTime?.[1])?.format('YYYY-MM-DDTHH:mm:ss');

    if (dateRange == "custom") {
      if (startDate > endDate) {
        message.error("Start date cannot be greater than end date");
        return;
      }
    }

    if (type?.toLowerCase() == 'process') {
      sample = {
        batchNo: pcu ? pcu : null,
        templeteName: templateName || null,
        site: oPlant || plant,
        userId: user || user_Id || null,
        resourceId: resource || null,
        status: status || null,
        dateRange: dateRange,
        startDate: dateRange == "custom" ? startDate : "",
        endDate: dateRange == "custom" ? endDate : ""
      }
    }
    else {
      sample = {
        pcu: pcu ? pcu : null,
        templeteName: templateName || null,
        site: oPlant || plant,
        userId: user || user_Id || null,
        resourceId: resource || null,
        status: status || null,
        dateRange: dateRange,
        startDate: dateRange == "custom" ? startDate : "",
        endDate: dateRange == "custom" ? endDate : ""
      }
    }

    try {
      // const response = await RetrivePcuu(site, {pcu,shopOrderBO:shopOrder,itemBO:`ItemBO:${site},${item},${itemVersion}`,type:"process",itemVersion:itemVersion});
      response = await retrieveLineClearanceLogs(sample);
      response = response.map((item: any, index: any) => ({
        ...item,
        key: index
      }));
      // debugger
      if (type?.toLowerCase() == 'process') {
        setData(response || []);
      }
      else {
        setData(response || []);
      }
      console.log(response, "response");
    } catch (error) {
      console.error('Error fetching data:', error);
      // You might want to add error handling here (e.g., showing a notification)
    }
  };


  const handleClick = async (value: any, fieldName: any) => {
    if (fieldName == "batchNo") {
      try {
        let oList: any;
        const oTableColumns = [
          { title: t('batchNo'), dataIndex: 'batchNo', key: 'batchNo' },
          { title: t('material'), dataIndex: 'material', key: 'material' },
          { title: t('materialVersion'), dataIndex: 'materialVersion', key: 'materialVersion' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        oList = await retrieveBatchNoList({ site: oPlant || plant });
        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("batchNo");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "resource") {
      try {
        let oList: any;
        const oTableColumns = [
          { title: t('resource'), dataIndex: 'resource', key: 'resource' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        oList = await fetchResourceAll(oPlant || plant);
        console.log(oList, "oList");

        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("resource");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "pcu") {
      try {
        let oList: any;
        const oTableColumns = [
          { title: t('pcu'), dataIndex: 'pcu', key: 'pcu' },
          { title: t('item'), dataIndex: 'item', key: 'item' },
          { title: t('itemVersion'), dataIndex: 'itemVersion', key: 'itemVersion' },
          { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder' },
        ]
        setTableColumns(oTableColumns);
        oList = await retrievePcuList({ site: oPlant || plant });
        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("pcu");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "templateName") {
      try {
        let oList: any;
        const oTableColumns = [
          { title: t('templateName'), dataIndex: 'templateName', key: 'templateName' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
        ]
        setTableColumns(oTableColumns);
        oList = await fetchtop50LineClearance(oPlant || plant);
        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("templateName");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "shopOrder") {
      try {
        let oList: any;
        const oTableColumns = [
          { title: t('shopOrder'), dataIndex: 'shopOrder', key: 'shopOrder' },
          { title: t('plannedMaterial'), dataIndex: 'plannedMaterial', key: 'plannedMaterial' },
          { title: t('orderType'), dataIndex: 'orderType', key: 'orderType' },
          { title: t('status'), dataIndex: 'status', key: 'status' }
        ]
        setTableColumns(oTableColumns);
        if (form.getFieldsValue().shopOrder) {
          oList = await retrieveShopOrderAllList({ site: oPlant || plant, orderNumber: form.getFieldsValue().shopOrder });
        }
        else {
          oList = await retrieveShopOrderTop50List({ site: oPlant || plant });
        }
        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("shopOrder");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "item") {

      try {
        let oList: any;
        const oTableColumns = [
          { title: t('item'), dataIndex: 'item', key: 'item' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
          { title: t('revision'), dataIndex: 'revision', key: 'revision' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        if (form.getFieldsValue().item) {
          oList = await retrieveItemList({ site: oPlant || plant, item: form.getFieldsValue().item });
        }
        else {
          oList = await retrieveItemTop50List({ site: oPlant || plant });
        }
        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("item");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "phase") {
      try {
        let oList: any;
        const oTableColumns = [
          { title: t('phase'), dataIndex: 'phase', key: 'phase' },
        ]
        setTableColumns(oTableColumns);
        oList = await retrievePhaseList(oPlant || plant);
        oList = oList.map((item: any, index: any) => ({
          phase: item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("phase");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "operation") {
      try {
        let oList: any;
        oList = await retrieveOperationList(oPlant || plant, phase);
        oList = oList.map((item: any, index: any) => ({
          operation: item,
          key: index
        }));
        const oTableColumns = [
          { title: t('operation'), dataIndex: 'operation', key: 'operation' },
        ]
        setTableColumns(oTableColumns);
        setTableData(oList || []);
        setVisible(true);
        setField("operation");
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "user") {

      try {
        let oList: any;
        const oTableColumns = [
          { title: t('user'), dataIndex: 'user', key: 'user' },
          // { title: t('firstName'), dataIndex: 'firstName', key: 'firstName' },
          { title: t('lastName'), dataIndex: 'lastName', key: 'lastName' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        if (form?.getFieldsValue()?.user) {
          oList = await fetchAllUsers({ user: form?.getFieldsValue()?.user });
        }
        else {
          oList = await fetchTop50Users({ site: oPlant || plant });
        }
        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);
        setVisible(true);
        setField("user");
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    }

    else if (fieldName == "site") {
      try {
        let oList: any;
        oList = await fetchTop50Sites();
        oList = oList.map((item: any, index: any) => ({
          ...item,
          key: index
        }));
        const oTableColumns = [
          { title: t('site'), dataIndex: 'site', key: 'site' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
        ]
        setTableColumns(oTableColumns);
        setTableData(oList || []);
        setVisible(true);
        setField("site");
      } catch (error) {
        console.error("Error fetching site list:", error);
      }
    }

  }

  const handleDateRangeChange = (fieldname: string, value: any) => {
    if (fieldname === "dateRange") {
      setDateRange(value);
      if (value != "custom") {
        form.setFieldValue("startDate", "");
        form.setFieldValue("endDate", "");
      }
    } else if (fieldname === "startDate" || fieldname === "endDate") {
      form.setFieldValue(fieldname, value);
    } else {
      form.setFieldValue(fieldname, value);
    }
  };

  const handleStatusChange = (fieldname: string, value: any) => {
    setStatus(value);
    form.setFieldValue(fieldname, value);
  }

  const handleInputChange = (fieldName: any, value: any) => {
    // debugger
    let transformedValue
    if (fieldName != "user")
      transformedValue = value.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9_]/g, '');

    else
      transformedValue = value.replace(/[^A-Z0-9_]/gi, '');

    if (fieldName == "batchNo") {
      setPcu(transformedValue);
    }
    else if (fieldName == "pcu") {
      setPcu(transformedValue);
    }

    else if (fieldName == "orderNumber") {
      setShopOrder(transformedValue);
    }
    else if (fieldName == "shopOrder") {
      setShopOrder(transformedValue);
    }
    else if (fieldName == "item") {
      setItem(transformedValue);
    }
    else if (fieldName == "phase") {
      setPhase(transformedValue);
    }
    else if (fieldName == "operation") {
      setOperation(transformedValue);
    }
    else if (fieldName == "templateName") {
      setTemplateName(transformedValue);
    }
    else if (fieldName == "resource") {
      setResource(transformedValue);
    }


    else if (fieldName == "user") {
      setUser(transformedValue);
      form.setFieldValue("user", transformedValue);
    }
    else if (fieldName == "site") {
      setOPlant(transformedValue);
      form.setFieldValue("site", transformedValue);
    }
  };

  const handleModalOk = (field: any, record: any) => {

    setVisible(false);
  };

  const handleModalCancel = () => {
    setVisible(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // debugger
    setSearchText(e.target.value);
  };


  const handleRowSelection = (field: any, record: any) => {
    // debugger
    // setSelectedRow(record);
    if (field == "batchNo") {
      setPcu(record?.batchNo);
      form.setFieldValue("batchNo", record?.batchNo);
    }
    else if (field == "pcu") {
      setPcu(record?.pcu);
      form.setFieldValue("pcu", record?.pcu);
    }
    else if (field == "phase") {
      setPhase(record?.phase);
      form.setFieldValue("phase", record?.phase);
    }
    else if (field == "operation") {
      setOperation(record?.operation);
      form.setFieldValue("operation", record?.operation);
    }
    else if (field == "shopOrder") {
      setShopOrder(record?.shopOrder);
      form.setFieldValue("shopOrder", record?.shopOrder);
    }
    else if (field == "orderNumber") {
      setShopOrder(record?.orderNumber);
      form.setFieldValue("orderNumber", record?.orderNumber);
    }

    else if (field == "item") {
      setItem(record?.item);
      form.setFieldValue("item", record?.item);
      setItemVersion(record?.revision);
    }

    else if (field == "resource") {
      setResource(record?.resource);
      form.setFieldValue("resource", record?.resource);
    }

    else if (field == "templateName") {
      setTemplateName(record?.templateName);
      form.setFieldValue("templateName", record?.templateName);
    }

    else if (field == "user") {
      setUser(record?.user);
      form.setFieldValue("user", record?.user);
    }

    else if (field == "site") {
      setOPlant(record?.site);
      form.setFieldValue("site", record?.site);
    }

    handleModalOk(field, record);
  };

  const handleExportPDF = () => {
    try {
      // Create a new PDF document with A2 size in landscape for maximum width
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a2'
      });

      const title = 'Line Clearance Report';

      // Add title
      doc.setFontSize(18);
      doc.text(title, 5, 20);

      // Add report metadata
      doc.setFontSize(10);
      const currentDate = new Date().toLocaleString();
      doc.text(`Generated on: ${currentDate}`, 5, 28);
      doc.text(`Site: ${oPlant || plant}`, 5, 33);

      // Add filter criteria
      let yPos = 38;
      if (pcu) {
        doc.text(`${type?.toLowerCase() === 'process' ? 'Batch No' : 'PCU'}: ${pcu}`, 5, yPos);
        yPos += 5;
      }
      if (templateName) {
        doc.text(`Template Name: ${templateName}`, 5, yPos);
        yPos += 5;
      }
      if (user) {
        doc.text(`User: ${user}`, 5, yPos);
        yPos += 5;
      }
      if (resource) {
        doc.text(`Resource: ${resource}`, 5, yPos);
        yPos += 5;
      }
      if (status) {
        doc.text(`Status: ${status}`, 5, yPos);
        yPos += 5;
      }
      if (dateRange) {
        doc.text(`Date Range: ${dateRange}`, 5, yPos);
        yPos += 5;
      }

      // Use the data passed from parent component
      const reportData = data || [];

      // If no data, show message
      if (reportData.length === 0) {
        doc.text('No data available for export', 5, yPos + 5);
        doc.save('LineClearanceReport.pdf');
        return;
      }

      // Get available width for the table
      const pageWidth = doc.internal.pageSize.width;
      const margins = { left: 2, right: 2 }; // Minimal margins
      const availableWidth = pageWidth - margins.left - margins.right;

      // Define column configurations with relative widths
      const columnConfig = type?.toLowerCase() === 'process' ? [
        { header: 'Batch No', dataKey: 'batchNo', width: 5 },
        { header: 'Template Name', dataKey: 'templeteName', width: 7 },
        { header: 'Description', dataKey: 'description', width: 7 },
        { header: 'Phase', dataKey: 'phase', width: 4 },
        { header: 'Operation', dataKey: 'operation', width: 5 },
        { header: 'Resource', dataKey: 'resourceId', width: 5 },
        { header: 'Work Center', dataKey: 'workCenterId', width: 6 },
        { header: 'Task Name', dataKey: 'taskName', width: 6 },
        { header: 'Task Description', dataKey: 'taskDescription', width: 7 },
        { header: 'Mandatory', dataKey: 'isMandatory', width: 4 },
        { header: 'Evidence Req', dataKey: 'evidenceRequired', width: 4 },
        { header: 'Status', dataKey: 'status', width: 4 },
        { header: 'Started By', dataKey: 'startedBy', width: 5 },
        { header: 'Started Date', dataKey: 'startedDateTime', width: 6 },
        { header: 'Completed Date', dataKey: 'completedDateTime', width: 6 },
        { header: 'Completed By', dataKey: 'completedBy', width: 5 },
        { header: 'Approved', dataKey: 'approved', width: 4 },
        { header: 'Approved Date', dataKey: 'approvedDateTime', width: 6 },
        { header: 'Approved By', dataKey: 'approvedBy', width: 5 },
        { header: 'Reason', dataKey: 'reason', width: 6 },
        { header: 'Updated Date', dataKey: 'updatedDateTime', width: 6 },
        { header: 'Updated By', dataKey: 'updatedBy', width: 5 }
      ] : [
        { header: 'PCU', dataKey: 'pcu', width: 5 },
        { header: 'Template Name', dataKey: 'templeteName', width: 7 },
        { header: 'Description', dataKey: 'description', width: 7 },
        { header: 'Resource', dataKey: 'resourceId', width: 5 },
        { header: 'Task Name', dataKey: 'taskName', width: 6 },
        { header: 'Task Description', dataKey: 'taskDescription', width: 7 },
        { header: 'Mandatory', dataKey: 'isMandatory', width: 4 },
        { header: 'Evidence Req', dataKey: 'evidenceRequired', width: 4 },
        { header: 'Status', dataKey: 'status', width: 4 },
        { header: 'Started By', dataKey: 'startedBy', width: 5 },
        { header: 'Started Date', dataKey: 'startedDateTime', width: 6 },
        { header: 'Completed Date', dataKey: 'completedDateTime', width: 6 },
        { header: 'Completed By', dataKey: 'completedBy', width: 5 },
        { header: 'Approved', dataKey: 'approved', width: 4 },
        { header: 'Approved Date', dataKey: 'approvedDateTime', width: 6 },
        { header: 'Approved By', dataKey: 'approvedBy', width: 5 },
        { header: 'Reason', dataKey: 'reason', width: 6 },
        { header: 'Updated Date', dataKey: 'updatedDateTime', width: 6 },
        { header: 'Updated By', dataKey: 'updatedBy', width: 5 }
      ];

      // Calculate actual column widths
      const totalRelativeWidth = columnConfig.reduce((sum, col) => sum + col.width, 0);
      const columnStyles = {};
      columnConfig.forEach((col, index) => {
        const actualWidth = (col.width / totalRelativeWidth) * availableWidth;
        columnStyles[index] = {
          cellWidth: actualWidth, // Remove the division factor to use full width
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle',
          cellPadding: 0.5,
          fontSize: 6.5
        };
      });

      // Prepare data for autotable
      const tableRows = reportData.map(item => {
        return columnConfig.map(col => {
          const value = item[col.dataKey];
          if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
          }
          if (col.dataKey === 'evidence') {
            return value ? '[Evidence Available]' : '--';
          }
          if (col.dataKey.includes('Date')) {
            return value ? new Date(value).toLocaleString() : '--';
          }
          if (typeof value === 'string' && value.length > 30) {
            return value.substring(0, 27) + '...';
          }
          return value || '--';
        });
      });

      // Add the table to the PDF with optimized settings
      (doc as any).autoTable({
        head: [columnConfig.map(col => col.header)],
        body: tableRows,
        startY: yPos + 5,
        theme: 'grid',
        styles: {
          fontSize: 6.5,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [80, 80, 80],
          minCellHeight: 8,
          cellPadding: 0.5,
          halign: 'left'
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: 255,
          fontSize: 7,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          minCellHeight: 10
        },
        columnStyles: columnStyles,
        margin: margins,
        tableWidth: 'auto', // Change to auto to allow full width
        didDrawPage: (data: any) => {
          // Add header to each page  
          doc.setFontSize(8);
          doc.text('Line Clearance Report', 5, 8);
          doc.text(`Site: ${oPlant || plant}`, pageWidth - 45, 8);
          doc.text(`Page ${data.pageNumber}`, pageWidth - 10, 8);
        }
      });

      // Save the PDF
      doc.save('LineClearanceReport.pdf');
      message.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error('Failed to export PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      const reportData = data || [];

      if (reportData.length === 0) {
        message.warning('No data available for export');
        return;
      }

      // Prepare headers based on type
      const headers = type?.toLowerCase() === 'process' ? [
        'Batch No', 'Template Name', 'Description', 'Phase', 'Operation', 'Resource',
        'Work Center', 'Task Name', 'Task Description', 'Mandatory', 'Evidence Required',
        'Status', 'Started By', 'Started Date', 'Completed Date', 'Completed By',
        'Approved', 'Approved Date', 'Approved By', 'Reason', 'Updated Date', 'Updated By'
      ] : [
        'PCU', 'Template Name', 'Description', 'Resource', 'Task Name', 'Task Description',
        'Mandatory', 'Evidence Required', 'Status', 'Started By', 'Started Date',
        'Completed Date', 'Completed By', 'Approved', 'Approved Date', 'Approved By',
        'Reason', 'Updated Date', 'Updated By'
      ];

      // Prepare data for Excel
      const excelData = reportData.map(item => {
        const row = type?.toLowerCase() === 'process' ? {
          'Batch No': item.batchNo || '--',
          'Template Name': item.templeteName || '--',
          'Description': item.description || '--',
          'Phase': item.phase || '--',
          'Operation': item.operation || '--',
          'Resource': item.resourceId || '--',
          'Work Center': item.workCenterId || '--',
          'Task Name': item.taskName || '--',
          'Task Description': item.taskDescription || '--',
          'Mandatory': item.isMandatory ? 'Yes' : 'No',
          'Evidence Required': item.evidenceRequired ? 'Yes' : 'No',
          'Status': item.status || '--',
          'Started By': item.startedBy || '--',
          'Started Date': item.startedDateTime ? new Date(item.startedDateTime).toLocaleString() : '--',
          'Completed Date': item.completedDateTime ? new Date(item.completedDateTime).toLocaleString() : '--',
          'Completed By': item.completedBy || '--',
          'Approved': item.approved ? 'Yes' : 'No',
          'Approved Date': item.approvedDateTime ? new Date(item.approvedDateTime).toLocaleString() : '--',
          'Approved By': item.approvedBy || '--',
          'Reason': item.reason || '--',
          'Updated Date': item.updatedDateTime ? new Date(item.updatedDateTime).toLocaleString() : '--',
          'Updated By': item.updatedBy || '--'
        } : {
          'PCU': item.pcu || '--',
          'Template Name': item.templeteName || '--',
          'Description': item.description || '--',
          'Resource': item.resourceId || '--',
          'Task Name': item.taskName || '--',
          'Task Description': item.taskDescription || '--',
          'Mandatory': item.isMandatory ? 'Yes' : 'No',
          'Evidence Required': item.evidenceRequired ? 'Yes' : 'No',
          'Status': item.status || '--',
          'Started By': item.startedBy || '--',
          'Started Date': item.startedDateTime ? new Date(item.startedDateTime).toLocaleString() : '--',
          'Completed Date': item.completedDateTime ? new Date(item.completedDateTime).toLocaleString() : '--',
          'Completed By': item.completedBy || '--',
          'Approved': item.approved ? 'Yes' : 'No',
          'Approved Date': item.approvedDateTime ? new Date(item.approvedDateTime).toLocaleString() : '--',
          'Approved By': item.approvedBy || '--',
          'Reason': item.reason || '--',
          'Updated Date': item.updatedDateTime ? new Date(item.updatedDateTime).toLocaleString() : '--',
          'Updated By': item.updatedBy || '--'
        };
        return row;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      // Add title and metadata
      const titleData = [
        ['Line Clearance Report'],
        [`Generated on: ${new Date().toLocaleString()}`],
        [`Site: ${oPlant || plant}`],
        pcu ? [`${type?.toLowerCase() === 'process' ? 'Batch No' : 'PCU'}: ${pcu}`] : [],
        templateName ? [`Template Name: ${templateName}`] : [],
        user ? [`User: ${user}`] : [],
        resource ? [`Resource: ${resource}`] : [],
        status ? [`Status: ${status}`] : [],
        dateRange ? [`Date Range: ${dateRange}`] : [],
        [] // Empty row before table
      ].filter(row => row.length > 0);

      // Create a new worksheet with title and metadata
      const finalWs = XLSX.utils.aoa_to_sheet(titleData);
      const tableStart = titleData.length;

      // Copy the table data to the final worksheet
      XLSX.utils.sheet_add_json(finalWs, excelData, {
        header: headers,
        origin: `A${tableStart + 1}`
      });

      // Auto-size columns
      const colWidths = headers.map(header => ({
        wch: Math.max(
          header.length,
          ...excelData.map(row => String(row[header] || '').length)
        )
      }));
      finalWs['!cols'] = colWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, finalWs, 'Line Clearance Report');

      // Save the file
      XLSX.writeFile(wb, 'LineClearanceReport.xlsx');
      message.success('Excel exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error('Failed to export Excel');
    }
  };

  const exportMenu = {
    items: [
      {
        key: 'pdf',
        label: t('Export as PDF'),
        onClick: handleExportPDF
      },
      {
        key: 'excel',
        label: t('Export as Excel'),
        onClick: handleExportExcel
      }
    ]
  };

  const renderProcessFields = () => {
    const labelCol = { span: 8 };  // Controls label width
    const wrapperCol = { span: 16 };  // Controls input field width

    return (
      <div style={{ marginTop: '2%' }}>
        {/* First row */}
        <Row gutter={24} justify="center" align="middle">

          <Col span={8}>
            <Form.Item
              name="site"
              label={<strong>{t('site')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            // required
            >
              <Input
                // defaultValue={oPlant}
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "site")} />}
                value={oPlant}
                onChange={(e) => handleInputChange("site", e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="user"
              label={<strong>{t('user')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                // defaultValue={user}
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "user")} />}
                value={user}
                onChange={(e) => handleInputChange("user", e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="resource"
              label={<strong>{t('resource')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "resource")} />}
                value={resource}
                onChange={(e) => handleInputChange("resource", e.target.value)}
              />
            </Form.Item>
          </Col>

          {/* <Col span={8}>
            <Form.Item name="batchNo" label={<strong>{t('batchNo')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}>
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "batchNo")} />}
                value={pcu}
                onChange={(e) => {
                  const newValue = e.target.value
                    .toUpperCase()
                    .replace(/\s+/g, '')
                    .replace(/[^A-Z0-9_]/g, '');
                  // debugger
                  handleInputChange("batchNo", newValue);
                }}
              />
            </Form.Item>
          </Col> */}




        </Row>

        {/* second row */}
        <Row gutter={24} justify="center" align="middle">

          <Col span={8}>
            <Form.Item name="batchNo" label={<strong>{t('batchNo')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}>
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "batchNo")} />}
                value={pcu}
                onChange={(e) => {
                  const newValue = e.target.value
                    .toUpperCase()
                    .replace(/\s+/g, '')
                    .replace(/[^A-Z0-9_]/g, '');
                  // debugger
                  handleInputChange("batchNo", newValue);
                }}
              />
            </Form.Item>
          </Col>


          <Col span={8}>
            <Form.Item name="templateName" label={<strong>{t('templateName')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}>
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "templateName")} />}
                onChange={(e) => {
                  const newValue = e.target.value
                    .toUpperCase()
                    .replace(/\s+/g, '')
                    .replace(/[^A-Z0-9_]/g, '');
                  handleInputChange("templateName", newValue);
                }}
                value={templateName}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="status"
              label={<strong>{t('status')}</strong>}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Select
                defaultValue={status}
                value={status}
                onChange={(value) => handleStatusChange("status", value)}
                options={statusOptions}
                placeholder="Select status"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="dateRange"
              label={<strong>{t('dateRange')}</strong>}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Select
                defaultValue={"24hours"}
                value={dateRange}
                onChange={(value) => handleDateRangeChange("dateRange", value)}
                options={dateRangeOptions}
                placeholder="Select date range"
              />
            </Form.Item>
          </Col>

          {dateRange == "custom" &&
            <Col span={16}>
              <Form.Item
                name="dateTime"
                label={<strong>{t('dateTime')}</strong>}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                <RangePicker
                  showTime={{ format: 'HH:mm:ss' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  onChange={(dates) => {
                    const [start, end] = dates || [null, null];
                    handleDateRangeChange("startDate", start);
                    handleDateRangeChange("endDate", end);
                  }}
                  placeholder={['Start date', 'End date']}
                  allowClear
                  style={{ width: '48%' }}
                  value={[form.getFieldValue('startDate'), form.getFieldValue('endDate')]}
                />
              </Form.Item>
            </Col>
          }

          {dateRange != "custom" &&
            <Col span={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'start' }}>
              {/* <Form.Item wrapperCol={{ offset: 4 }}> */}
                <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                  {t('search')}
                </Button>
                <Button style={{ marginRight: 8 }} onClick={() => {
                  setData([]);
                  setShopOrder("");
                  setItem("");
                  setPcu("");
                  setTemplateName("");
                  setUser("");
                  setOPlant("");
                  form.resetFields();
                }}>
                  {t('clear')}
                </Button>
                <Dropdown menu={exportMenu}>
                  <Button style={{marginRight: 8}} type='primary' icon={<AiFillFilePdf />}>
                    {t('export')} <DownOutlined />
                  </Button>
                </Dropdown>
                <span>
                  <InstructionModal title="Line Clearance Report">
                    <UserInstructions />
                  </InstructionModal>
                </span>
              {/* </Form.Item> */}
            </Col>
          }
          <Col span={8}></Col>
        </Row>


        {/* third row */}
        {dateRange == "custom" &&
          <Row gutter={24} justify="center" >
            <Col span={6} style={{ display: 'flex', justifyContent: 'end', marginBottom: 10 }}>
              {/* <Form.Item wrapperCol={{ offset: 6 }}> */}
                <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                  {t('search')}
                </Button>
                <Button style={{ marginRight: 8 }} onClick={() => {
                  setData([]);
                  setShopOrder("");
                  setResource("");
                  setItem("");
                  setPcu("");
                  setTemplateName("");
                  setUser("");
                  setOPlant("");
                  setDateRange("24hours");
                  setStatus("Complete");
                  form.resetFields();
                }}>
                  {t('clear')}
                </Button>
                <Dropdown menu={exportMenu}>
                  <Button  type='primary' style={{ width: 'auto', marginRight: 8 }} icon={<AiFillFilePdf />}>
                    {t('export')} <DownOutlined />
                  </Button>
                </Dropdown>
                <span>
                  <InstructionModal title="Line Clearance Report">
                    <UserInstructions />
                  </InstructionModal>
                </span>
              {/* </Form.Item> */}
            </Col>
          </Row>
        }
        {/* </Row> */}
      </div>
    )
  };

  const renderDiscreteFields = () => {
    const labelCol = { span: 8 };
    const wrapperCol = { span: 16 };
    return (
      <div style={{ marginTop: '2%' }}>
        <Row gutter={24} justify="center" align="middle">
          <Col span={6}>
            <Form.Item
              name="site"
              label={<strong>{t('site')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            // required
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "site")} />}
                value={oPlant}
                onChange={(e) => handleInputChange("site", e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="user"
              label={<strong>{t('user')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "user")} />}
                value={user}
                onChange={(e) => handleInputChange("user", e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item name="pcu"
              label={<strong>{t('pcu')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}>
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "pcu")} />}
                value={pcu}
                onChange={(e) => {
                  const newValue = e.target.value
                    .toUpperCase()
                    .replace(/\s+/g, '')
                    .replace(/[^A-Z0-9_]/g, '');
                  handleInputChange("pcu", newValue);
                }}
              />
            </Form.Item>
          </Col>

        </Row>
        {/* second row */}
        <Row gutter={24} justify="center" align="middle">
          <Col span={6}>
            <Form.Item name="templateName" label={<strong>{t('templateName')}</strong>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}>
              <Input
                suffix={<GrChapterAdd onClick={(value) => handleClick(value, "templateName")} />}
                onChange={(e) => {
                  const newValue = e.target.value
                    .toUpperCase()
                    .replace(/\s+/g, '')
                    .replace(/[^A-Z0-9_]/g, '');
                  handleInputChange("templateName", newValue);
                }}
                value={templateName}
              />
            </Form.Item>
          </Col>

          <Col span={12} >
            {/* <Form.Item wrapperCol={{ offset: 4 }}> */}
              <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                {t('search')}
              </Button>
              <Button style={{ marginRight: 8 }} onClick={() => {
                setData([]);
                setShopOrder("");
                setItem("");
                setPcu("");
                setTemplateName("");
                setUser("");
                setOPlant("");
                form.resetFields();
              }}>
                {t('clear')}
              </Button>
              <Dropdown menu={exportMenu}>
                <Button type='primary' icon={<AiFillFilePdf />}>
                  {t('export')} <DownOutlined />
                </Button>
              </Dropdown>
              <span>
                <InstructionModal title="Line Clearance Report">
                  <UserInstructions />
                </InstructionModal>
              </span>
            {/* </Form.Item> */}
          </Col>
        </Row>
      </div>
    )
  };

  return (
    <>
      <Form layout="horizontal" style={{ marginRight: '110px' }} form={form}>
        {type?.toLowerCase() === "process" ? renderProcessFields() : renderDiscreteFields()}
        {/* <Row gutter={24} justify="center" align="middle">
          <Col span={24} style={{ textAlign: 'center' }}>
            <Form.Item>
              <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
                {t('search')}
              </Button>
              <Button onClick={() => {
                setData([]);
                setShopOrder("");
                setItem("");
                setPcu("");
                setTemplateName("");
                form.resetFields();
              }}>{t('clear')}</Button>
            </Form.Item>
          </Col>
        </Row> */}
      </Form>

      <Modal
        title={
          <>
            {t('select')} {t(field)}
            <Tooltip title="Search">
            </Tooltip>
            {searchVisible && (
              <Input
                style={{ marginTop: 16 }}
                value={searchText}
                onChange={handleSearchChange}
              />
            )}
          </>
        }
        open={visible}
        onOk={() => form.submit()}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      >
        <Table
          columns={tableColumns}
          dataSource={tableData}
          onRow={(record) => ({
            onDoubleClick: () => handleRowSelection(field, record),
          })}
          pagination={false}
          scroll={{ y: 300 }}
          size="small"
          bordered
        />
      </Modal>
    </>
  );
};

export default SearchInputs;