import React, { useEffect, useState } from 'react';
import { Input, Button, Table, Row, Col, Form, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import CommonAppBar from '@components/CommonAppBar';
import SearchInputs from './SearchInputs';
import { parseCookies } from 'nookies';
import { fetchSiteAll } from '@services/siteServices';
import { useTranslation } from 'react-i18next';


const LogBuyOffReport: React.FC = () => {
  const [form] = Form.useForm();
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
  const [buyOff, setBuyOff] = useState('');
  const [buyOffVersion, setBuyOffVersion] = useState('');
  const [user, setUser] = useState('');
  const [dateRange, setDateRange] = useState<string>('24hours');
 

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
      // debugger
      await setColumnsData();
      setPlant(site);

     
    }
    catch (error) {
      // Handle error
      console.error('Error retrieveing site:', error);

    }
  } 
  
  const fetchDataForPlantChange = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      username = cookies?.rl_user_id;
      if(plant){
        const response = await fetchSiteAll(plant);
        console.log(response);
        podCategory = response?.type;
        setType(response?.type);
        // debugger
        await setColumnsData();
      }

     
    }
    catch (error) {
      // Handle error
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
          title: t('buyOff'),
          dataIndex: 'buyOffBO',
          key: 'buyOffBO',
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
          title: t('orderNumber'),
          dataIndex: 'orderNumber',
          key: 'orderNumber',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('resource'),
          dataIndex: 'resourceId',
          key: 'resourceId',
          width: 180,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('recipe'),
          dataIndex: 'recipe',
          key: 'recipe',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('recipeVersion'),
          dataIndex: 'recipeVersion',
          key: 'recipeVersion',
          width: 120,
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
          title: t('operationVersion'),
          dataIndex: 'itemVersion',
          key: 'itemVersion',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        }, {
          title: t('item'),
          dataIndex: 'item',
          key: 'item',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('itemVersion'),
          dataIndex: 'itemVersion',
          key: 'itemVersion',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('buyOffAction'),
          dataIndex: 'buyOffAction',
          key: 'buyOffAction',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        }, {
          title: t('state'),
          dataIndex: 'state',
          key: 'state',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('quantity'),
          dataIndex: 'quantity',
          key: 'quantity',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },{
          title: t('comments'),
          dataIndex: 'comments',
          key: 'comments',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
       
        {
          title: t('user'),
          dataIndex: 'userId',
          key: 'userId',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
        }, {
          title: t('dateTime'),
          dataIndex: 'dateTime',
          key: 'dateTime',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
        },
        
      ]);
    }

    else{
      setColumns([
        {
          title: t('pcu'),
          dataIndex: 'pcu',
          key: 'pcu',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('buyOff'),
          dataIndex: 'buyOffBO',
          key: 'buyOffBO',
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
          title: t('shopOrder'),
          dataIndex: 'shopOrder',
          key: 'shopOrder',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('resource'),
          dataIndex: 'resourceId  ',
          key: 'resourceId',
          width: 180,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('routing'),
          dataIndex: 'routing',
          key: 'routing',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('routingVersion'),
          dataIndex: 'routingVersion',
          key: 'routingVersion',
          width: 120,
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
          title: t('operationVersion'),
          dataIndex: 'itemVersion',
          key: 'itemVersion',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        }, {
          title: t('item'),
          dataIndex: 'item',
          key: 'item',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('itemVersion'),
          dataIndex: 'itemVersion',
          key: 'itemVersion',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('buyOffAction'),
          dataIndex: 'buyOffAction',
          key: 'buyOffAction',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        }, {
          title: t('state'),
          dataIndex: 'state',
          key: 'state',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('quantity'),
          dataIndex: 'quantity',
          key: 'quantity',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },{
          title: t('comments'),
          dataIndex: 'comments',
          key: 'comments',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
     
        {
          title: t('user'),
          dataIndex: 'userId',
          key: 'userId',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
        }, {
          title: t('dateTime'),
          dataIndex: 'dateTime',
          key: 'dateTime',
          width: 100,
          whiteSpace: 'nowrap',
          align: 'center',
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
        appTitle="Buy Off Report"
        onSearchChange={() => { }}
        allActivities={[]}
        username={username}
        site={null}
        onSiteChange={function (newSite: string): void {
          // debugger
           setCall(call + 1); setPlant(newSite);
          setBuyOff("");
          setBuyOffVersion("");
          setUser("");
          }}
      />
      <SearchInputs setData={setData} podCategory={podCategory} type={type} plant={plant} 
      buyOff={buyOff} buyOffVersion={buyOffVersion} setBuyOff={setBuyOff} setBuyOffVersion={setBuyOffVersion} 
      user={user} setUser={setUser} dateRange={dateRange} setDateRange={setDateRange}
      />

      {/* Add a container div with specific styles */}
      <div style={{ width: '100%', overflow: 'auto' }}>
        <Table
          columns={columns}
          // dataSource={formattedData}
          dataSource={data}
          rowKey="id"
          pagination={false}
          scroll={{ y: dateRange == "custom" ? 'calc(100vh - 305px)' : 'calc(100vh - 250px)' }}
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
        {renderPreviewContent()}
      </Modal>
    </div>
  );
};

export default LogBuyOffReport;

