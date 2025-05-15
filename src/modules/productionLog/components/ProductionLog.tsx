import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, Table, Row, Col, Form } from 'antd';
import CommonAppBar from '@components/CommonAppBar';
import SearchInputs from './SearchInputs';
import api from '@services/api';
import { parseCookies } from 'nookies';
import { fetchSiteAll } from '@services/siteServices';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const ProductionLog: React.FC = () => {
  const [form] = Form.useForm();
  const [columns, setColumns] = useState([]);
  const [type, setType] = useState('');
  const [call, setCall] = useState<number>(0);
  const [plant, setPlant] = useState('');
  const [dateRange, setDateRange] = useState<string>('24hours');
  const dataList = useRef([]);
  const { t } = useTranslation();
  let podCategory = '',username = '';

 

  useEffect(() => {
    // debugger
    fetchDataForPlantChange();
  }, [plant]);

  useEffect(() => {
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
      // Handle error here
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

  const setColumnsData = async () => {
    const defaultRender = (text: any) => ({
      children: text || '--',
      props: { 
        style: dataList.current?.length > 0 ? { 
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: text === '--' || !text ? '150px' : 'auto',
          minWidth: '150px',
          maxWidth: text === '--' || !text ? '150px' : 'fit-content'
        } :  { 
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: '150px', // Set fixed width
          minWidth: '150px',
          maxWidth: '150px' // Set fixed maxWidth
        }
      }
    });

    if (podCategory?.toLowerCase() === 'process') {
      setColumns([
        {
          title: t('eventType'),
          dataIndex: 'event_type',
          key: 'event_type',
          render: defaultRender,
        },
        {
          title: t('batchNo'),
          dataIndex: 'batchNo',
          key: 'batchNo',
          render: defaultRender,
        },
        {
          title: t('processOrder'),
          dataIndex: 'orderNumber',
          key: 'orderNumber',
          render: defaultRender,
        },
        {
          title: t('item'),
          dataIndex: 'item',
          key: 'item',
          render: defaultRender,
        },
        {
          title: t('itemVersion'),
          dataIndex: 'item_version',
          key: 'item_version',
          render: defaultRender,
        },
        {
          title: t('phase'),
          dataIndex: 'phaseId',
          key: 'phaseId',
          render: defaultRender,
        },
         {
          title: t('operation'),
          dataIndex: 'operation',
          key: 'operation',
          render: defaultRender,
        },
        {
          title: t('operationVersion'),
          dataIndex: 'operation_version',
          key: 'operation_version',
          render: defaultRender,
        },
        {
          title: t('resource'),
          dataIndex: 'resource_id',
          key: 'resource_id',
          render: defaultRender,
        }, 
        {
          title: t('workCenter'),
          dataIndex: 'workcenter_id',
          key: 'workcenter_id',
          render: defaultRender,
        }, 
        {
          title: t('createdDatetime'),
          dataIndex: 'created_datetime',
          key: 'created_datetime',
          render: (text: string) => ({
            children: text ? dayjs(text)?.format('MMM DD YYYY hh:mm:ss A') : '--',
            props: { 
              style: dataList.current?.length > 0 ? { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: text ? 'auto' : '150px',
                minWidth: '150px',
                maxWidth: text ? 'fit-content' : '150px'
              } : { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: '150px',
                minWidth: '150px',
                maxWidth: '150px'
              }
            }
          }),
        },
        {
          title: t('quantity'),
          dataIndex: 'qty',
          key: 'qty',
          render: defaultRender,
        }, {
          title: t('user'),
          dataIndex: 'user_id',
          key: 'user_id',
          render: defaultRender,
        },
        {
          title: t('shift'),
          dataIndex: 'shift_id',
          key: 'shift_id',
          render: (text: string) => ({
            children: text ? text.split(',').pop() || '--' : '--',
            props: { 
              style: dataList.current?.length > 0 ? { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: text ? 'auto' : '150px',
                minWidth: '150px',
                maxWidth: text ? 'fit-content' : '150px'
              } : { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: '150px',
                minWidth: '150px',
                maxWidth: '150px'
              }
            }
          }),
        },
        {
          title: t('shiftStart'),
          dataIndex: 'shift_start_time',
          key: 'shift_start_time',
          render: defaultRender,
        }, {
          title: t('shiftEnd'),
          dataIndex: 'shift_end_time',
          key: 'shift_end_time',
          render: defaultRender,
        },{
          title: t('shiftAvailableTime'),
          dataIndex: 'shift_available_time',
          key: 'shift_available_time',
          render: defaultRender,
        },
        {
          title: t('totalBreakInMinutes'),
          dataIndex: 'total_break_hours',
          key: 'total_break_hours',
          render: defaultRender,
        },
        {
          title: t('plannedCycleTime'),
          dataIndex: 'planned_cycle_time',
          key: 'planned_cycle_time',
          render: defaultRender,
        },{
          title: t('actualCycleTime'),
          dataIndex: 'actual_cycle_time',
          key: 'actual_cycle_time',
          render: defaultRender,
        },
        {
          title: t('reasonCode'),
          dataIndex: 'reason_code',
          key: 'reason_code',
          render: defaultRender,
        },
        
        {
          title: t('eventData'),
          dataIndex: 'event_data',
          key: 'event_data',
          render: defaultRender,
        },
        {
          title: t('status'),
          dataIndex: 'status',
          key: 'status',
          render: defaultRender,
        }
      ].map(col => ({
        ...col,
        align: 'center',
      })));
    }
    else 
    // if (podCategory?.toLowerCase() === 'discrete') 
      {
      setColumns([
        {
          title: t('eventType'),
          dataIndex: 'event_type',
          key: 'event_type',
          render: defaultRender,
        },
        {
          title: t('pcu'),
          dataIndex: 'pcu',
          key: 'pcu',
          render: defaultRender,
        },
        {
          title: t('shopOrder'),
          dataIndex: 'shop_order_bo',
          key: 'shop_order_bo',
          render: defaultRender,
        },
        {
          title: t('item'),
          dataIndex: 'item',
          key: 'item',
          render: defaultRender,
        },{
          title: t('itemVersion'),
          dataIndex: 'item_version',
          key: 'item_version',
          render: defaultRender,
        },
        // {
        //   title: t('phase'),
        //   dataIndex: 'phaseId',
        //   key: 'phaseId',
        //   render: defaultRender,
        // },
        {
          title: t('operation'),
          dataIndex: 'operation',
          key: 'operation',
          render: defaultRender,
        },
        {
          title: t('operationVersion'),
          dataIndex: 'operation_version',
          key: 'operation_version',
          render: defaultRender,
        },
        {
          title: t('resource')  ,
          dataIndex: 'resource_id',
          key: 'resource_id',
          render: defaultRender,
        },
        
        {
          title: t('createdDatetime'),
          dataIndex: 'created_datetime',
          key: 'created_datetime',
          render: (text: string) => ({
            children: text ? dayjs(text)?.format('MMM DD YYYY HH:mm:ss A') : '--',
            props: { 
              style: dataList.current?.length > 0 ? { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: text ? 'auto' : '150px',
                minWidth: '150px',
                maxWidth: text ? 'fit-content' : '150px'
              } : { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: '150px',
                minWidth: '150px',
                maxWidth: '150px'
              }
            }
          }),
        },
        {
          title: t('quantity'),
          dataIndex: 'qty',
          key: 'qty',
          render: defaultRender,
        },
        {
          title: t('user'),
          dataIndex: 'user_id',
          key: 'user_id',
          render: defaultRender,
        },
        {
          title: t('shift'),
          dataIndex: 'shift_id',
          key: 'shift_id',
          render: (text: string) => ({
            children: text ? text.split(',').pop() || '--' : '--',
            props: { 
              style: dataList.current?.length > 0 ? { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: text ? 'auto' : '150px',
                minWidth: '150px',
                maxWidth: text ? 'fit-content' : '150px'
              } : { 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: '150px',
                minWidth: '150px',
                maxWidth: '150px'
              }
            }
          }),
        },
        {
          title: t('shiftStart'),
          dataIndex: 'shift_start_time',
          key: 'shift_start_time',
          render: defaultRender,
        }, {
          title: t('shiftEnd'),
          dataIndex: 'shift_end_time',
          key: 'shift_end_time',
          render: defaultRender,
        },{
          title: t('shiftAvailableTime'),
          dataIndex: 'shift_available_time',
          key: 'shift_available_time',
          render: defaultRender,
        },
        {
          title: t('totalBreakHours'),
          dataIndex: 'total_break_hours',
          key: 'total_break_hours',
          render: defaultRender,
        },
        {
          title: t('plannedCycleTime'),
          dataIndex: 'planned_cycle_time',
          key: 'planned_cycle_time',
          render: defaultRender,
        },{
          title: t('actualCycleTime'),
          dataIndex: 'actual_cycle_time',
          key: 'actual_cycle_time',
          render: defaultRender,
        },
        {
          title: t('reasonCode'),
          dataIndex: 'reason_code',
          key: 'reason_code',
          render: defaultRender,
        },
        
        {
          title: t('eventData'),
          dataIndex: 'event_data',
          key: 'event_data',
          render: defaultRender,
        },
        {
          title: t('status'),
          dataIndex: 'status',
          key: 'status',
          render: defaultRender,
        }
      ].map(col => ({
        ...col,
        align: 'center',
      })));
    }
  }

  // Sample data - replace with your actual data
  const [data, setData] = useState([]);



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
    <div className="production-log" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0
    }}>
      <CommonAppBar
        appTitle="Production Log"
        onSearchChange={() => { }}
        allActivities={[]}
        username={username}
        site={null}
        onSiteChange={function (newSite: string): void {
          setCall(call + 1); 
          setPlant(newSite);
          setDateRange("24hours");
        }}
      />
      <SearchInputs setData={setData} dataList={dataList} podCategory={podCategory} type={type} plant={plant} dateRange={dateRange} setDateRange={setDateRange}/>

      {/* Table Container */}
      <div style={{ 
        flex: 1,
        padding: '8px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          scroll={{ 
            x: dataList.current?.length == 0 ? '4000px' : 'auto',
            // Adjust height based on whether date range is custom
            y: dateRange  === 'custom' 
              ? 'calc(100vh - 350px)'  // More space for custom date inputs
              : 'calc(100vh - 300px)'  // Less space when no custom date inputs
          }}
          bordered={true}
          size="small"
          style={{
            flex: 1,
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default ProductionLog;

