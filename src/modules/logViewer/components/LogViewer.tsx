import React, { useEffect, useState } from 'react';
import { Input, Button, Table, Row, Col, Form, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import CommonAppBar from '@components/CommonAppBar';
import SearchInputs from './SearchInputs';
import { parseCookies } from 'nookies';
import { fetchSiteAll } from '@services/siteServices';
import { useTranslation } from 'react-i18next';


const LogViewerMain: React.FC = () => {
  const [form] = Form.useForm();
  const [columns, setColumns] = useState([]);
  const [type, setType] = useState('');
  const [call, setCall] = useState<number>(0);
  const [plant, setPlant] = useState('');
  const [data, setData] = useState([]);
  let podCategory = '', username = '';
  const { t } = useTranslation();
  const [user, setUser] = useState('');
  const [level, setLevel] = useState('info');




  useEffect(() => {
    // debugger
    setTimeout(() => {
      fetchData();
      setLevel('info');
    }, 1000);
  }, []);

  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      username = cookies?.rl_user_id;
      await setColumnsData();
      // setData([
      //   {
      //     key: 1,
      //     level: 'Info',
      //     message: 'Process started successfully',
      //     startDate: '2024-02-19 10:00:00',
      //     endDate: '2024-02-19 10:05:00',
      //   },
      //   {
      //     key: 2,
      //     level: 'Error',
      //     message: 'Failed to fetch data',
      //     startDate: '2024-02-19 10:10:00',
      //     endDate: '2024-02-19 10:12:00',
      //   },
      //   {
      //     key: 3,
      //     level: 'Warning',
      //     message: 'Memory usage high',
      //     startDate: '2024-02-19 10:15:00',
      //     endDate: '2024-02-19 10:20:00',
      //   },
      //   {
      //     key: 4,
      //     level: 'Info',
      //     message: 'User login successful',
      //     startDate: '2024-02-19 10:30:00',
      //     endDate: '2024-02-19 10:35:00',
      //   },
      //   {
      //     key: 5,
      //     level: 'Error',
      //     message: 'Database connection lost',
      //     startDate: '2024-02-19 10:40:00',
      //     endDate: '2024-02-19 10:45:00',
      //   },
      //   {
      //     key: 6,
      //     level: 'Warning',
      //     message: 'Disk space running low',
      //     startDate: '2024-02-19 10:50:00',
      //     endDate: '2024-02-19 10:55:00',
      //   },
      //   {
      //     key: 7,
      //     level: 'Info',
      //     message: 'Report generated successfully',
      //     startDate: '2024-02-19 11:00:00',
      //     endDate: '2024-02-19 11:05:00',
      //   },
      //   {
      //     key: 8,
      //     level: 'Error',
      //     message: 'API response timeout',
      //     startDate: '2024-02-19 11:10:00',
      //     endDate: '2024-02-19 11:15:00',
      //   },
      //   {
      //     key: 9,
      //     level: 'Warning',
      //     message: 'Unauthorized access attempt',
      //     startDate: '2024-02-19 11:20:00',
      //     endDate: '2024-02-19 11:25:00',
      //   },
      //   {
      //     key: 10,
      //     level: 'Info',
      //     message: 'Backup completed successfully',
      //     startDate: '2024-02-19 11:30:00',
      //     endDate: '2024-02-19 11:35:00',
      //   },
      //   {
      //     key: 11,
      //     level: 'Error',
      //     message: 'System crashed unexpectedly',
      //     startDate: '2024-02-19 11:40:00',
      //     endDate: '2024-02-19 11:45:00',
      //   },
      //   {
      //     key: 12,
      //     level: 'Warning',
      //     message: 'Slow network detected',
      //     startDate: '2024-02-19 11:50:00',
      //     endDate: '2024-02-19 11:55:00',
      //   },
      //   {
      //     key: 13,
      //     level: 'Info',
      //     message: 'User password updated',
      //     startDate: '2024-02-19 12:00:00',
      //     endDate: '2024-02-19 12:05:00',
      //   },
      //   {
      //     key: 14,
      //     level: 'Error',
      //     message: 'Payment transaction failed',
      //     startDate: '2024-02-19 12:10:00',
      //     endDate: '2024-02-19 12:15:00',
      //   },
      //   {
      //     key: 15,
      //     level: 'Warning',
      //     message: 'Software update required',
      //     startDate: '2024-02-19 12:20:00',
      //     endDate: '2024-02-19 12:25:00',
      //   },
      //   {
      //     key: 16,
      //     level: 'Info',
      //     message: 'Server restarted successfully',
      //     startDate: '2024-02-19 12:30:00',
      //     endDate: '2024-02-19 12:35:00',
      //   },
      //   {
      //     key: 17,
      //     level: 'Error',
      //     message: 'Email delivery failed',
      //     startDate: '2024-02-19 12:40:00',
      //     endDate: '2024-02-19 12:45:00',
      //   },
      //   {
      //     key: 18,
      //     level: 'Warning',
      //     message: 'High CPU usage detected',
      //     startDate: '2024-02-19 12:50:00',
      //     endDate: '2024-02-19 12:55:00',
      //   },
      //   {
      //     key: 19,
      //     level: 'Info',
      //     message: 'Scheduled job completed',
      //     startDate: '2024-02-19 13:00:00',
      //     endDate: '2024-02-19 13:05:00',
      //   },
      //   {
      //     key: 20,
      //     level: 'Error1',
      //     message: 'Access token expired',
      //     startDate: '2024-02-19 13:10:00',
      //     endDate: '2024-02-19 13:15:00',
      //   },
      // ]


      // )


    }
    catch (error) {
      // Handle error
      console.error('Error retrieveing site:', error);

    }
  }






  const setColumnsData = async () => {
  
      setColumns([
        {
          title: 'Level',
          dataIndex: 'level',
          key: 'level',
          width: 70,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (text: string) => {
            let color = '';
            switch (text.toLowerCase()) {
              case 'info':
                color = '#1890ff'; // Blue for Info
                break;
              case 'warning':
                color = '#faad14'; // Yellow for Warning
                break;
              case 'error':
                color = '#ff4d4f'; // Red for Error
                break;
              default:
                color = 'gray'; // Default color
            }

            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center', // Centers content horizontally
                  gap: '8px'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: color,
                  }}
                />
                <span>{text}</span>
              </div>
            );
          },
        },

        {
          title: t('message'),
          dataIndex: 'message',
          key: 'message',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },
        {
          title: t('startDate'),
          dataIndex: 'startDate',
          key: 'startDate',
          width: 150,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },

        {
          title: t('endDate'),
          dataIndex: 'endDate',
          key: 'endDate',
          width: 120,
          whiteSpace: 'nowrap',
          align: 'center',
          render: (value: any) => value || '--'
        },


      ]);
    

  }


  return (
    <div className="production-log">
      <CommonAppBar
        appTitle="Log Viewer"
        onSearchChange={() => { }}
        allActivities={[]}
        username={username}
        site={null}
        onSiteChange={function (newSite: string): void {
          // debugger
          setCall(call + 1); setPlant(newSite);
          setUser("");
        }}
      />
      <SearchInputs setData={setData} type={type} plant={plant}
        user={user} setUser={setUser} level={level} setLevel={setLevel}
      />

      {/* Add a container div with specific styles */}
      <div style={{ overflow: 'auto', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          scroll={{ y: 'calc(100vh - 240px)' }}
          size="small"
          style={{ width: '99%', }}
          bordered
        />
      </div>

    </div>
  );
};

export default LogViewerMain;

