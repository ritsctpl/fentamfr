import React, { useEffect, useState } from 'react';
import { Button, Table, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import CommonAppBar from '@components/CommonAppBar';
import SearchInputs from './SearchInputs';
import { parseCookies } from 'nookies';
import { fetchSiteAll } from '@services/siteServices';
import { useTranslation } from 'react-i18next';


const LineClearanceReport: React.FC = () => {
  const [columns, setColumns] = useState([]);
  const [type, setType] = useState('');
  const [call, setCall] = useState<number>(0);
  const [plant, setPlant] = useState('');
  const [data, setData] = useState([]);
  let podCategory = '',username = '';
  const { t } = useTranslation();
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewType, setPreviewType] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('24hours');
  const [status, setStatus] = useState<string>('Complete');
 

  useEffect(() => {
    // debugger
    fetchDataForPlantChange();
  }, [plant]);

  useEffect(() => {
    // debugger
    setTimeout(() => {
      fetchData();
    }, 1000);
  }, []);

  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      username = cookies?.rl_user_id;
      const response = await fetchSiteAll(site);
      console.log(response);
      podCategory = response?.type;
      setType(response?.type);
      await setColumnsData();
      setPlant(site);
    }
    catch (error) {
      console.error('Error retrieveing site:', error);
    }
  } 
  
  const fetchDataForPlantChange = async () => {
    try {
      const cookies = parseCookies();
      username = cookies?.rl_user_id;
      if(plant){
        const response = await fetchSiteAll(plant);
        console.log(response);
        podCategory = response?.type;
        setType(response?.type);
        await setColumnsData();
      }
    }
    catch (error) {
      console.error('Error retrieveing site:', error);

    }
  }

  const handlePreview = (evidence: string) => {
    const [header] = evidence.split(',');
    const mimeType = header.split(';')[0].split(':')[1];
    
    // Extract file type from MIME type
    let fileType = '';
    if (mimeType.includes('pdf')) {
      fileType = 'pdf';
    } else if (mimeType.includes('image')) {
      fileType = mimeType.split('/')[1];
    } else if (mimeType.includes('wordprocessingml.document')) {
      fileType = 'docx';
    } else if (mimeType.includes('spreadsheetml.sheet')) {
      fileType = 'xlsx';
    }
    
    setPreviewContent(evidence);
    setPreviewType(fileType);
    if(fileType !== 'docx' && fileType !== 'xlsx'){
      setIsPreviewModalVisible(true);
    }
  };

  const renderPreviewContent = () => {
    if (!previewContent) return null;

    if (previewType === 'pdf') {
      return (
        <iframe
          src={previewContent}
          width="100%"
          height="500px"
          title="Preview"
        />
      );
    } else if (['jpeg', 'jpg', 'png', 'gif'].includes(previewType)) {
      return <img src={previewContent} alt="Preview" style={{ maxWidth: '100%' }} />;
    } else if (previewType === 'docx') {
      window.open(previewContent, '_blank');
      return <div>{t('openingWordDocument')}</div>;
    } else if (previewType === 'xlsx') {
      window.open(previewContent, '_blank');
      return <div>{t('openingExcelDocument')}</div>;
    }
    
    return <div>{t('unsupportedFileType')}</div>;
  };

  const setColumnsData = async () => {
    if (podCategory?.toLowerCase() === 'process') {
      setColumns([
        {
          title: t('batchNo'),
          dataIndex: 'batchNo',
          key: 'batchNo',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('templateName'),
          dataIndex: 'templeteName',
          key: 'templeteName',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('description'),
          dataIndex: 'description',
          key: 'description',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('phase'),
          dataIndex: 'phase',
          key: 'phase',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('operation'),
          dataIndex: 'operation',
          key: 'operation',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('resource'),
          dataIndex: 'resourceId',
          key: 'resourceId',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('workCenter'),
          dataIndex: 'workCenterId',
          key: 'workCenterId',
          width: 180,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
       
        
        {
          title: t('taskName'),
          dataIndex: 'taskName',
          key: 'taskName',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('taskDescription'),
          dataIndex: 'taskDescription',
          key: 'taskDescription',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('mandatory'),
          dataIndex: 'isMandatory',
          key: 'isMandatory',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: boolean) => (value ? "true" : "false"),
        },
        {
          title: t('evidenceRequired'),
          dataIndex: 'evidenceRequired',
          key: 'evidenceRequired',
          width: 140,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: boolean) => (value ? "true" : "false"),
        },
        {
          title: t('evidence'),
          dataIndex: 'evidence',
          key: 'evidence',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (evidence: string) => evidence ? (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(evidence)}
            >
              {t('preview')}
            </Button>
          ) : '--'
        },
        {
          title: t('status'),
          dataIndex: 'status',
          key: 'status',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('startedBy'),
          dataIndex: 'startedBy',
          key: 'startedBy',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
       
        {
          title: t('startedDateTime'),
          dataIndex: 'startedDateTime',
          key: 'startedDateTime',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('completedDateTime'),
          dataIndex: 'completedDateTime',
          key: 'completedDateTime',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('completedBy'),
          dataIndex: 'completedBy',
          key: 'completedBy',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('approved'),
          dataIndex: 'approved',
          key: 'approved',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: boolean) => (value ? "true" : "false"),
        },
       
        {
          title: t('approvedDateTime'),
          dataIndex: 'approvedDateTime',
          key: 'approvedDateTime',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('approvedBy'),
          dataIndex: 'approvedBy',
          key: 'approvedBy',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('reason'),
          dataIndex: 'reason',
          key: 'reason',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        // {
        //   title: t('rejectedDateTime'),
        //   dataIndex: 'rejectedDateTime',
        //   key: 'rejectedDateTime',
        //   width: 150,
        //   whiteSpace: 'nowrap',
        //   align: 'center',
        //   render: (value: any) => value || '--'
        // },
        // {
        //   title: t('rejectedBy'),
        //   dataIndex: 'rejectedBy',
        //   key: 'rejectedBy',
        //   width: 150,
        //   whiteSpace: 'nowrap',
        //   align: 'center',
        //   render: (value: any) => value || '--'
        // },
        {
          title: t('updatedDateTime'),
          dataIndex: 'updatedDateTime',
          key: 'updatedDateTime',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('updatedBy'),
          dataIndex: 'updatedBy',
          key: 'updatedBy',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
      ]);
    }
   
  }

  


  const formattedData = Array.isArray(data) ? data.map(item => ({
    ...item,
    event_type: item.event_type || '---',
    batchNo: item.batchNo || '---',

    shop_order_bo: item.shop_order_bo || '---',
    item: item.item || '---',
    router_bo: item.router_bo || '---',
    router_version: item.router_version || '---',
    qty: item.qty || '---',
    event_data: item.event_data || '---',
    status: item.status || '---',
  })) : [];

  return (
    <div className="production-log">
      <CommonAppBar
        appTitle="Line Clearance Report"
        onSearchChange={() => { }}
        allActivities={[]}
        username={username}
        site={null}
        onSiteChange={function (newSite: string): void {
          // debugger
           setCall(call + 1); setPlant(newSite) 
          }}
      />
      <SearchInputs setData={setData} podCategory={podCategory} type={type} plant={plant} dateRange={dateRange} setDateRange={setDateRange} status={status} setStatus={setStatus} data={data}/>

      {/* Add a container div with specific styles */}
      <div style={{ width: '100%', overflow: 'auto' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          scroll={{ y: dateRange == "custom" ? 'calc(100vh - 360px)' : 'calc(100vh - 305px)' }}
          size="small"
          bordered
        />
      </div>
      <Modal
        title={t('evidence')}
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
        {renderPreviewContent()}
    </div>
      </Modal>
    </div>
  );
};

export default LineClearanceReport;

