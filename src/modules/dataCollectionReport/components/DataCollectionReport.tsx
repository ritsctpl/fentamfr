import React, { useEffect, useState } from 'react';
import { Input, Button, Table, Modal, Row, Col, Divider } from 'antd';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import CommonAppBar from '@components/CommonAppBar';
import SearchInputs from './SearchInputs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Form } from 'antd';
import DataCollectionGraph from './DataCollectionGraph';
import logo from '../../../images/rits-logo.png';
import { FileOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const DataCollection: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [tabValue, setTabValue] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  const CustomTabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showDetailModal = (record: any) => {
    setSelectedDetail(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDetail(null);
  };

  const renderDetailContent = (detail: any) => {
    const groups = {
      parameter: {
        title: 'Parameter Information',
        fields: ['parameterBo', 'description', 'actualValue', 'nominalValue', 'upperLimit', 'lowerLimit', 'unit']
      },
      operation: {
        title: 'Operation Details',
        fields: ['operationBO', 'dcGroupBO', 'pcuBO', 'itemBO']
      },
      time: {
        title: 'Time Information',
        fields: ['testDateTime', 'creationTime', 'modifiedTime']
      }
    };

    const formatValue = (key: string, value: any) => {
      if (!value && value !== 0) return '-';
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date')) {
        return new Date(value).toLocaleString();
      }
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    };

    const formatLabel = (key: string) => {
      return t(`${key}`)
        
    };

    return (
      <>
        {Object.entries(groups).map(([groupKey, group]) => (
          <div key={groupKey}>
            <Divider orientation="left" style={{ margin: '8px 0' }}>{group.title}</Divider>
            <Row gutter={[8, 4]}>
              {group.fields.map(field => {
                if (detail[field] !== undefined) {
                  return (
                    <Col span={6} key={field}>
                      <div style={{ 
                        padding: '4px', 
                        background: '#f5f5f5', 
                        borderRadius: '2px',
                        marginBottom: '4px',
                        height: '100%'
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#555',
                          fontSize: '12px'
                        }}>
                          {formatLabel(field)}
                        </div>
                        <div style={{ 
                          marginTop: '2px',
                          fontSize: '13px'
                        }}>
                          {formatValue(field, detail[field])}
                        </div>
                      </div>
                    </Col>
                  );
                }
                return null;
              })}
            </Row>
          </div>
        ))}

        <Divider orientation="left" style={{ margin: '8px 0' }}>Additional Information</Divider>
        <Row gutter={[8, 4]}>
          {Object.entries(detail).map(([key, value]) => {
            const isFieldInGroups = Object.values(groups)
              .flatMap(g => g.fields)
              .includes(key);
            
            const excludeKeys = ['key', '_events', '_eventsCount', '_maxListeners'];
            
            if (!isFieldInGroups && !excludeKeys.includes(key) && value !== undefined) {
              return (
                <Col span={6} key={key}>
                  <div style={{ 
                    padding: '4px', 
                    background: '#f5f5f5', 
                    borderRadius: '2px',
                    marginBottom: '4px',
                    height: '100%'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#555',
                      fontSize: '12px'
                    }}>
                      {formatLabel(key)}
                    </div>
                    <div style={{ 
                      marginTop: '2px',
                      fontSize: '13px'
                    }}>
                      {formatValue(key, value)}
                    </div>
                  </div>
                </Col>
              );
            }
            return null;
          })}
        </Row>
      </>
    );
  };

  const columns = [
    {
      title: t('dcGroupVersion'),
      dataIndex: 'dcGroupBO',
      key: 'dcGroupBO',
    },
    {
      title: t('parameter'),
      dataIndex: 'parameterBo', 
      key: 'parameterBo',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('value'),
      dataIndex: 'actualValue',
      key: 'actualValue',
    },
    {
      title: t('pcu'),
      dataIndex: 'pcuBO',
      key: 'pcuBO',
    },
    {
      title: t('dateTime'),
      dataIndex: 'testDateTime',
      key: 'testDateTime',
    },
    {
      title: t('material'),
      dataIndex: 'itemBO',
      key: 'itemBO',
    },
    {
      title: t('operation'),
      dataIndex: 'operationBO',
      key: 'operationBO',
    },
    {
      title: t('detail'),
      dataIndex: 'detail',
      key: 'detail',
      render: (text: string, record: any) => (
        <Button type="link" onClick={() => showDetailModal(record)}>
          <FileOutlined />
        </Button>
      ),
    },
  ];

  const [data, setData] = useState([]);

  const handleSearch = (values: any) => {
    console.log('Searching with:', values);
  };

  const handleClear = () => {
    form.resetFields();
  };

  const handlePdfExport = () => {
    const doc = new jsPDF();
    
    // Add logo on the left
    const logoWidth = 40;
    const logoHeight = 20;
    doc.addImage(logo.src, 'PNG', 14, 10, logoWidth, logoHeight);
    
    // Add company address on the right
    doc.setFontSize(10);
    doc.text([
      'RITS',
      '46/4, Novel Tech Park, Hosur Rd',
      'Kudlu Gate, Krishna Reddy Industrial Area',
      'H.S.R Extension, Bengaluru',
      'Karnataka 560068'
    ], 140, 15);
    
    // Add report title
    doc.setFontSize(16);
    doc.text('Data Collection Report', 14, logoHeight + 30);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, logoHeight + 40);
    
    // Filter out the Detail column for PDF
    const pdfColumns = columns.filter(col => col.key !== 'detail');
    
    // Convert table data for PDF, excluding the Detail column
    const tableData = data?.map(item => [
      item?.dcGroupBO,
      item?.parameterBo,
      item?.description,
      item?.actualValue,
      item?.pcuBO,
      item?.testDateTime,
      item?.itemBO,
      item?.operationBO
    ]);

    // Generate PDF table with filtered columns
    (doc as any).autoTable({
      head: [pdfColumns.map(col => col?.title)],
      body: tableData,
      startY: logoHeight + 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
      margin: { top: 80 }
    });

    // Save the PDF
    doc.save('data-collection-report.pdf');
  };

  return (
    <div className="production-log">
      <CommonAppBar appTitle="Data Collection Report" onSearchChange={handleSearch}/>
      <SearchInputs setData={setData} onViewPdf={handlePdfExport}/>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="data collection tabs"
          >
            <Tab label="Table View" />
            <Tab label="Graph View" />
          </Tabs>
        </Box>

        <CustomTabPanel value={tabValue} index={0}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey="id"
            scroll={{ y: 'calc(100vh - 300px)' }}
            size="small"
            onRow={() => ({
              style: {
                fontSize: '13.5px', // Add explicit padding to make rows more compact
              }
            })}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={1}>
          <DataCollectionGraph data={data} />
        </CustomTabPanel>
      </Box>

      <Modal
        title={t('detailInformation')}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        {selectedDetail && (
          <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
            {renderDetailContent(selectedDetail)}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataCollection;

