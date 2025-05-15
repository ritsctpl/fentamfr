'use client'
import React, { useEffect, useState } from 'react'
import { Form, Row, Col, DatePicker, Select, Button, Table, Card, message, Modal, Input, Space, Tooltip, Switch, Layout } from 'antd'
import CommonAppBar from '@components/CommonAppBar'
import { useAuth } from '@context/AuthContext'
import { HistoricalContext } from '@modules/historicalFilterTable/hooks/HistoricalContext'
import styles from '@modules/historicalFilterTable/styles/historical.module.css'
import { decryptToken } from '@utils/encryption'
import jwtDecode from 'jwt-decode'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { parseCookies } from 'nookies'
import { fetchAllMaterial, fetchAllResource, fetchAllWorkCenter, fetchTop50Material, fetchTop50Resource, fetchTop50WorkCenter } from '@services/cycleTimeService'
import { RetriveResourceSelectedRow } from '@services/ResourceService'
import { GrChapterAdd } from 'react-icons/gr'
import { fetchShift } from '@services/shiftService'
import { FcViewDetails } from 'react-icons/fc'
import { fetchEndpointsData } from '@services/oeeServicesGraph'
import { CalendarOutlined, DownloadOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons'
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { BsArrowDownCircle } from 'react-icons/bs'
import { title } from 'process'
import { ToggleOnOutlined } from '@mui/icons-material'
import * as XLSX from 'xlsx';
import { useRouter, useSearchParams } from 'next/navigation';
import OeeTabs from './OeeTabs'
import { retrieveActivity } from '@services/activityService'
import UserInstructions from '@modules/buyOff/components/userInstructions'
import InstructionModal from '@components/InstructionModal'

interface DecodedToken {
    preferred_username: string;
}

interface TableRecord {
    oee: number;
    workCenter?: string;
    resource?: string;
    date: string;
    downTime: number;
    availability: number;
    performance: number;
    quality: number;
}

const HistoricalTableMain = () => {
    const [form] = Form.useForm();
    const [formData, setFormData] = React.useState({})
    const [call, setCall] = useState<number>(0)
    const { isAuthenticated, token } = useAuth();
    const { t } = useTranslation()
    const [username, setUsername] = useState<string | null>(null)
    const [site, setSite] = useState<string | null>(null)
    const [workCenterData7d, setWorkCenterData7d] = useState<TableRecord[]>([])
    const [workCenterData3m, setWorkCenterData3m] = useState<TableRecord[]>([])
    const [resourceData7d, setResourceData7d] = useState<TableRecord[]>([])
    const [resourceData3m, setResourceData3m] = useState<TableRecord[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [workCenterData, setWorkCenterData] = useState<any>([])
    const [workCenterVisible, setWorkCenterVisible] = useState(false)
    const [resourceData, setResourceData] = useState<any>([])
    const [resourceVisible, setResourceVisible] = useState(false)
    const [shiftData, setShiftData] = useState<any[]>([])
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [showOeeTabs, setShowOeeTabs] = useState(false);
    const router = useRouter();
    const [showMainContent, setShowMainContent] = useState(true);
    const [selectedTableType, setSelectedTableType] = useState<'7days' | '3months' | null>(null);
    const [lastClickedRow, setLastClickedRow] = useState<any>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [eventType, setEventType] = useState<boolean>(true);

    const searchParams = useSearchParams();
    const [activityId, setActivityId] = useState<any>(searchParams.get('ActivityId'));
    const [activityRules, setActivityRules] = useState<any>([]);
    console.log(activityRules, 'activityRules');

    const manualContent = [
        {
            title: 'Historical Table User Manual',
            sections: [
                {
                    title: '1. Introduction',
                    content: {
                        type: 'table',
                        data: {
                            rows: [
                                { label: 'Purpose', value: 'To guide users on how to use the Historical Table Screen for logging, updating, and tracking Historical Table.' },
                                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                                { label: 'Module Name', value: 'Historical Table' }
                            ]
                        }
                    }
                },
                {
                    title: '2. System Access',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Item', 'Description'],
                            rows: [
                                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/historical_dashboard' },
                                { Item: 'Login Requirement', Description: 'Username & Password' },
                                { Item: 'Access Roles', Description: 'Technician, Supervisor, Admin' }
                            ]
                        }
                    }
                },
                {
                    title: '3. Navigation Path',
                    content: {
                        type: 'text',
                        data: 'Main Menu → Historical Table → Historical Table Entry/Tracking'
                    }
                },
                {
                    title: '4. Screen Overview',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Section', 'Description'],
                            rows: [
                                { Section: 'Header', Description: 'Filter by date, workcenter, resource, shift, event type' },
                                { Section: 'Body', Description: 'In bottom, it will show the last 7 days and last 3 months data for resource and workcenter' },
                                { Section: 'Action Buttons', Description: 'Card, Drill Down' },
                            ]
                        }
                    }
                },
                {
                    title: '5. Step-by-Step Instructions',
                    subsections: [
                        {
                            title: '5.1. Screen Navigation',
                            content: {
                                type: 'steps',
                                data: [
                                    {
                                        text: 'Tables will be shown last 7 days and last 3 months data for resource and workcenter',
                                        subSteps: [
                                            'Date',
                                            'Workcenter',
                                            'Downtime',
                                            'OEE',
                                            'Availability',
                                            'Performance',
                                            'Quality',
                                            'Details',
                                        ]
                                    },
                                ]
                            }
                        }
                    ]
                },
                {
                    title: '6. Work Center Table',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Component', 'Action', 'Description'],
                            rows: [
                                { Component: 'Work Center Table', Action: 'Click "Workcenter Row"', Description: 'It will filter the data for the selected workcenter' },
                            ]
                        }
                    }
                },
                {
                    title: '7. Detail',
                    subsections: [
                        {
                            title: '7.1. Screen Navigation',
                            content: {
                                type: 'steps',
                                data: [
                                    {
                                        text: 'Detail Row will be shown',
                                        subSteps: [
                                            'On click of "Details" button, it will navigate to the detail screen',
                                            'Detail screen will show the detail of the selected Workcenter or Resource',
                                            'Availablity (Tab)',
                                            'Performance (Tab)',
                                            'Quality (Tab)',
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    title: '8. Availability',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Component', 'Action', 'Description'],
                            rows: [
                                { Component: 'Availability Against Resource', Action: 'On Load', Description: 'It will show the availability against resource for the selected workcenter or resource' },
                                { Component: 'Availability Against Shift', Action: 'On Load', Description: 'It will show the availability against shift for the selected workcenter or resource' },
                                { Component: 'Machine Timeline', Action: 'On Load', Description: 'It will show the available (green), scheduled downtime (yellow), unscheduled downtime (red) for the selected workcenter or resource' }, 
                            ]
                        }
                    }
                },
                {
                    title: '9. Availability Against Resource',
                    subsections: [
                        {
                            title: '9.1. Screen Filter',
                            content: {
                                type: 'steps',
                                data: [
                                    {
                                        text: 'On click "Bar"',
                                        subSteps: [
                                            'On click of "Bar", it will filter against resource for the selected',
                                            'The filter will be applied on the other components (Against Resource, Against Shift, Machine Timeline) as well',
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    title: '10. Performance',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Component', 'Action', 'Description'],
                            rows: [
                                { Component: 'Performance Against Resource', Action: 'On Load', Description: 'It will show the performance against resource for the selected workcenter or resource' },
                                { Component: 'Performance Against Shift', Action: 'On Load', Description: 'It will show the performance against shift for the selected workcenter or resource' },
                                { Component: 'Production Performance Summary', Action: 'On Load', Description: 'It will show the performance Interval Start Datetime, Interval End Datetime, Production Actual Qty, Plan Target Qty	,Goodqty, Bad Qty' },
                                { Component: 'Time-Based Production Report', Action: 'On Load', Description: 'It will show the performance Time-Based Production Report for the selected workcenter or resource' },
                            ]
                        }
                    }
                },
                {
                    title: '11. Performance Against Resource',
                    subsections: [
                        {
                            title: '11.1. Screen Filter',
                            content: {
                                type: 'steps',
                                data: [
                                    {
                                        text: 'On click "Bar"',
                                        subSteps: [
                                            'On click of "Bar", it will filter against resource for the selected',
                                            'The filter will be applied on the other components (Performance Against Shift, Production Performance Summary, Time-Based Production Report) as well',
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    title: '12. Quality',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Component', 'Action', 'Description'],
                            rows: [
                                { Component: 'Quality Against Resource', Action: 'On Load', Description: 'It will show the quality against resource for the selected workcenter or resource' },
                                { Component: 'Quality Against Shift', Action: 'On Load', Description: 'It will show the quality against shift for the selected workcenter or resource' },
                                { Component: 'Quality Summary by Time Interval', Action: 'On Load', Description: 'It will show the quality Quality Summary by Time Interval for the selected workcenter or resource' },
                                { Component: 'Good Quantity Vs Bad Quantity Against Resource', Action: 'On Load', Description: 'It will show the quality Good Quantity Vs Bad Quantity Against Resource for the selected workcenter or resource' },
                            ]
                        }
                    }
                },
                {
                    title: '13. Quality Against Resource',
                    subsections: [
                        {
                            title: '13.1. Screen Filter',
                            content: {
                                type: 'steps',
                                data: [
                                    {
                                        text: 'On click "Bar"',
                                        subSteps: [
                                            'On click of "Bar", it will filter against resource for the selected',
                                            'The filter will be applied on the other components (Quality Against Shift, Quality Summary by Time Interval, Good Quantity Vs Bad Quantity Against Resource) as well',
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },  
                {
                    title: '14. FAQs / Troubleshooting',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Issue', 'Solution'],
                            rows: [
                                { Issue: 'No data is showing in the screen', Solution: 'Check any production is done today, check the internet connection' },
                                { Issue: 'Drill down screen is not working', Solution: 'Check the resource is available in the current shift' },
                            ]
                        }
                    }
                }
            ]
        }
    ];

    useEffect(() => {
        const fetchResourceData = async () => {
            if (isAuthenticated && token) {
                try {
                    const decryptedToken = decryptToken(token);
                    const decoded: DecodedToken = jwtDecode(decryptedToken);
                    setUsername(decoded.preferred_username);
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
            const cookies = parseCookies();
            const site = cookies.site

            try {
                const response = await retrieveActivity(site, activityId, site);
                console.log(response, 'response');
                setActivityRules(response.activityRules);
            } catch (error) {
                console.error('Error fetching activity:', error);
            }
            try {
                const response = await fetchShift(site);
                const shiftOptions = response.map(shift => ({
                    value: shift.handle,
                    label: shift.shiftId,
                }));
                setShiftData(shiftOptions);
            } catch (error) {
                console.error('Error fetching shifts:', error);
            }

            const payload = {
                p_site: site,
                p_event_type: eventType ? "machine" : "manual",
            }

            fetchEndpointsData(
                payload,
                "oee-service/apiregistry",
                "getHistoricalData"
            ).then(response => {
                const historicalData = response.data.data[0].get_historical_data;
                const last_7days_workcenter = JSON.parse(historicalData.value).last_7days_workcenter;
                const last_7days_resource = JSON.parse(historicalData.value).last_7days_resource;
                const last_3months_workcenter = JSON.parse(historicalData.value).last_3months_workcenter;
                const last_3months_resource = JSON.parse(historicalData.value).last_3months_resource;
                setWorkCenterData7d(last_7days_workcenter);
                setResourceData7d(last_7days_resource);
                setWorkCenterData3m(last_3months_workcenter);
                setResourceData3m(last_3months_resource);

            }).catch(() => ({ data: { data: [] } }))
        };
        fetchResourceData();
    }, [isAuthenticated, token, eventType]);

    const handleSiteChange = (newSite: string) => {
        setSite(newSite);
        setCall(call + 1);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, "");

        const patterns: { [key: string]: RegExp } = {
            resource: /[^A-Z0-9_\-\(\)]*$/,
            item: /[^A-Z0-9_\-\(\)]*$/,
            workcenter: /[^A-Z0-9_\-\(\)]*$/,
        };
    }

    const WorkcenterDetailsClick = (record, tableType: '7days' | '3months') => {
        setSelectedTableType(tableType);
        if (tableType === '3months') {
            // Transform the data for 3 months view
            const transformedRecord = {
                ...record,
                month: record.date,
                date: undefined
            };
            setSelectedRecord(transformedRecord);
        } else {
            setSelectedRecord(record);
        }
        setShowMainContent(false);
    }

    const handleBackToMain = () => {
        setShowMainContent(true);
        setSelectedRecord(null);
        setSelectedTableType(null);
    }

    const getColumnSearchProps = (dataIndex: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => {
                            if (clearFilters) {
                                clearFilters();
                            }
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined className={styles['anticon']} style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value: string, record: TableRecord) => {
            const recordValue = record[dataIndex];
            if (!recordValue) return false;
            return recordValue.toString().toLowerCase().includes(value.toLowerCase());
        },
        onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => {
                    const searchInput = document.querySelector('.ant-table-filter-dropdown input') as HTMLInputElement;
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 100);
            }
        },
    });

    // const getRowStyle = (oee) => {
    //     const oeeValue = parseFloat(oee);
    //     if (oeeValue >= 85) return { className: styles.oeeHigh };
    //     if (oeeValue >= 65) return { className: styles.oeeMedium };
    //     return { className: styles.oeeLow };
    // };

    const getMetricClass = (value) => {
        const numValue = parseFloat(value);
        if (numValue >= 85) return styles.good;
        if (numValue >= 65) return styles.average;
        return styles.poor;
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const workcenterColumns = [
        {
            title: t('Date'),
            dataIndex: 'date',
            key: 'date',
            render: (text) => <div className={styles.dateCell}>{text}</div>,
            ...getColumnSearchProps('date'),
        },
        {
            title: t('Work Center'),
            dataIndex: 'workCenter',
            key: 'workCenter',
            width: 150,
            render: (text) => <div className={styles.workCenterName}>{text}</div>,
            ...getColumnSearchProps('workCenter'),
        },
        {
            title: 'Downtime',
            dataIndex: 'downTime',
            key: 'downTime',
            render: (text) => <div className={styles.timeBadge}>{formatTime(text)}</div>,
            ...getColumnSearchProps('downTime'),
        },
        {
            title: 'OEE',
            dataIndex: 'oee',
            key: 'oee',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('oee'),
        },
        {
            title: t('Availability'),
            dataIndex: 'availability',
            key: 'availability',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('availability'),
        },
        {
            title: t('Performance'),
            dataIndex: 'performance',
            key: 'performance',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('performance'),
        },
        {
            title: t('Quality'),
            dataIndex: 'quality',
            key: 'quality',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('quality'),
        },
        {
            title: t('Details'),
            dataIndex: 'details',
            key: 'details',
            render: (_, record) => (
                <div className={styles.detailsButton}>
                    <Tooltip title={t('View Details')}>
                        <FcViewDetails
                            style={{ fontSize: '22px', color: 'white' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                WorkcenterDetailsClick(record, '7days');
                            }}
                        />
                    </Tooltip>
                </div>
            ),
        }
    ];

    const workcenterColumns3m = [
        {
            title: t('Date'),
            dataIndex: 'date',
            key: 'date',
            render: (text) => <div className={styles.dateCell}>{text}</div>,
            ...getColumnSearchProps('date'),
        },
        {
            title: t('Work Center'),
            dataIndex: 'workCenter',
            key: 'workCenter',
            width: 150,
            render: (text) => <div className={styles.workCenterName}>{text}</div>,
            ...getColumnSearchProps('workCenter'),
        },
        {
            title: 'Downtime',
            dataIndex: 'downTime',
            key: 'downTime',
            render: (text) => <div className={styles.timeBadge}>{formatTime(text)}</div>,
            ...getColumnSearchProps('downTime'),
        },
        {
            title: 'OEE',
            dataIndex: 'oee',
            key: 'oee',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('oee'),
        },
        {
            title: t('Availability'),
            dataIndex: 'availability',
            key: 'availability',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('availability'),
        },
        {
            title: t('Performance'),
            dataIndex: 'performance',
            key: 'performance',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('performance'),
        },
        {
            title: t('Quality'),
            dataIndex: 'quality',
            key: 'quality',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('quality'),
        },
        {
            title: t('Details'),
            dataIndex: 'details',
            key: 'details',
            render: (_, record) => (
                <div className={styles.detailsButton}>
                    <Tooltip title={t('View Details')}>
                        <FcViewDetails
                            style={{ fontSize: '22px', color: 'white' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                WorkcenterDetailsClick(record, '3months');
                            }}
                        />
                    </Tooltip>
                </div>
            ),
        }
    ];

    const resourceColumns = [
        {
            title: t('Date'),
            dataIndex: 'date',
            key: 'date',
            render: (text) => <div className={styles.dateCell}>{text}</div>,
            ...getColumnSearchProps('date'),
        },
        {
            title: t('Resource'),
            dataIndex: 'resource',
            key: 'resource',
            width: 150,
            render: (text) => <div className={styles.workCenterName}>{text}</div>,
            ...getColumnSearchProps('resource'),
        },
        {
            title: 'Downtime',
            dataIndex: 'downTime',
            key: 'downTime',
            render: (text) => <div className={styles.timeBadge}>{formatTime(text)}</div>,
            ...getColumnSearchProps('downTime'),
        },
        {
            title: 'OEE',
            dataIndex: 'oee',
            key: 'oee',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('oee'),
        },
        {
            title: t('Availability'),
            dataIndex: 'availability',
            key: 'availability',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('availability'),
        },
        {
            title: t('Performance'),
            dataIndex: 'performance',
            key: 'performance',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('performance'),
        },
        {
            title: t('Quality'),
            dataIndex: 'quality',
            key: 'quality',
            render: (text) => <div className={`${styles.metricValue} ${getMetricClass(text)}`}>{text}%</div>,
            ...getColumnSearchProps('quality'),
        }
    ];

    const handleSearch = async () => {
        try {
            setLoading(true);
            const cookies = parseCookies();
            const site = cookies.site;
            const values = form.getFieldsValue();

            // Ensure all form fields are properly handled with null values
            const payload = {
                p_site: site,
                p_event_type: eventType ? "machine" : "manual",
                p_start_date: values.dateRange?.[0] ? dayjs(values.dateRange[0]).format('YYYY-MM-DD') : null,
                p_end_date: values.dateRange?.[1] ? dayjs(values.dateRange[1]).format('YYYY-MM-DD') : null,
                p_workcenter: values.workCenter || null,
                p_resource: values.resource || null,
                p_shifts: values.shift && values.shift.length > 0 ? values.shift : null,
            }

            fetchEndpointsData(
                payload,
                "oee-service/apiregistry",
                "getHistoricalData"
            ).then(response => {
                setLoading(false);
                const historicalData = response.data.data[0].get_historical_data;
                const last_7days_workcenter = JSON.parse(historicalData.value).last_7days_workcenter;
                const last_7days_resource = JSON.parse(historicalData.value).last_7days_resource;
                const last_3months_workcenter = JSON.parse(historicalData.value).last_3months_workcenter;
                const last_3months_resource = JSON.parse(historicalData.value).last_3months_resource;
                setWorkCenterData7d(last_7days_workcenter);
                setResourceData7d(last_7days_resource);
                setWorkCenterData3m(last_3months_workcenter);
                setResourceData3m(last_3months_resource);
            }).catch(error => {
                setLoading(false);
                console.error('Error');
                setWorkCenterData7d([]);
                setResourceData7d([]);
                setWorkCenterData3m([]);
                setResourceData3m([]);
            })

        } catch (error) {
            console.error('Validation error:', error);
        }
    };

    const handleReset = () => {
        setLoading(true);
        const cookies = parseCookies();
        const site = cookies.site;
        const payload = {
            p_site: site,
            p_event_type: "machine",
        }

        fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "getHistoricalData"
        ).then(response => {
            const historicalData = response.data.data[0].get_historical_data;
            const last_7days_workcenter = JSON.parse(historicalData.value).last_7days_workcenter;
            const last_7days_resource = JSON.parse(historicalData.value).last_7days_resource;
            const last_3months_workcenter = JSON.parse(historicalData.value).last_3months_workcenter;
            const last_3months_resource = JSON.parse(historicalData.value).last_3months_resource;

            // Reset all table data
            setWorkCenterData7d(last_7days_workcenter);
            setResourceData7d(last_7days_resource);
            setWorkCenterData3m(last_3months_workcenter);
            setResourceData3m(last_3months_resource);

            // Reset form fields
            form.resetFields();
            setLoading(false);
        }).catch((error) => {
            console.error('Error resetting data:', error);
            setLoading(false);
            message.error('Failed to reset data');
            return { data: { data: [] } };
        });
    };

    const handleResourceClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('resource');
        const newValue = { resource: typedValue };

        try {
            let response = typedValue ? await fetchAllResource(site, newValue) : await fetchTop50Resource(site);
            if (response && !response.errorCode) {
                const formattedData = response.map((item: any, index: number) => ({ id: index, ...item }));
                setResourceData(formattedData);
            } else {
                setResourceData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setResourceVisible(true);
    };

    const handleResourceOk = async (selectedRow: any | undefined) => {
        if (selectedRow) {
            const cookies = parseCookies();
            const site = cookies.site;
            form.setFieldsValue({ resource: selectedRow.resource });

            try {
                const response = await RetriveResourceSelectedRow(site, { resource: selectedRow.resource });
                if (response?.resourceTypeList?.length > 0) {
                    const resourceType = response.resourceTypeList[0].resourceType;
                    form.setFieldsValue({ resourceType: resourceType });
                }
            } catch (error) {
                console.error('Error fetching resource type:', error);
            }
        }
        setResourceVisible(false);
    };

    const ResourceColumn = [
        { title: t("resource"), dataIndex: "resource", key: "resource" },
        { title: t("description"), dataIndex: "description", key: "description" },
        { title: t("status"), dataIndex: "status", key: "status" },
    ];

    const handleWorkCenterClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('workCenter');
        const newValue = { workCenter: typedValue };

        try {
            let response = typedValue ? await fetchAllWorkCenter(site, newValue) : await fetchTop50WorkCenter(site);
            if (response && !response.errorCode) {
                const formattedData = response.workCenterList.map((item: any, index: number) => ({ id: index, ...item }));
                setWorkCenterData(formattedData);
            } else {
                setWorkCenterData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }
        setWorkCenterVisible(true);
    };

    const handleWorkCenterOk = (selectedRow: any) => {
        if (selectedRow) {
            form.setFieldsValue({ workCenter: selectedRow.workCenter });
        }
        setWorkCenterVisible(false);
    };

    const WorkCenterColumn = [
        { title: t("workCenter"), dataIndex: "workCenter", key: "workCenter" },
        { title: t("description"), dataIndex: "description", key: "description" },
    ];

    const handleCancel = () => {
        setResourceVisible(false);
        setWorkCenterVisible(false);
    };

    const getRowKey = (record: any) => {
        return `${record.date}_${record.workCenter || record.resource}`;
    };

    const handleTableRowClick = (record: any, type: 'workcenter' | 'resource') => {
        const currentRowKey = getRowKey(record);

        if (lastClickedRow && getRowKey(lastClickedRow) === currentRowKey) {
            // If clicking the same row again, reset
            console.log('Resetting selection');
            handleReset();
            setLastClickedRow(null);
            setSelectedRowKeys([]);
        } else {
            // If clicking a new row, search
            console.log('Selecting new row');
            if (type === 'workcenter') {
                form.setFieldsValue({ workCenter: record.workCenter });
            } else if (type === 'resource') {
                form.setFieldsValue({ resource: record.resource });
            }
            handleSearch();
            setLastClickedRow(record);
            setSelectedRowKeys([currentRowKey]);
        }
    };

    const handleDownloadExcel = (data: any[], title: string) => {
        try {
            // Create a worksheet
            const ws = XLSX.utils.json_to_sheet(data.map(item => ({
                Date: item.date,
                'Work Center': item.workCenter,
                'Resource': item.resource,
                'Downtime': item.downTime,
                'OEE': item.oee,
                'Availability': item.availability,
                'Performance': item.performance,
                'Quality': item.quality
            })));

            // Create a workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            // Generate Excel file
            XLSX.writeFile(wb, `${title}.xlsx`);
            message.success('Excel file downloaded successfully');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            message.error('Failed to download Excel file');
        }
    };

    const handleEventTypeChange = (checked) => {
        setEventType(checked);
    };

    return (
        <HistoricalContext.Provider value={{ formData, setFormData }}>
            <CommonAppBar
                onSearchChange={() => { }}
                allActivities={[]}
                username={username}
                site={site}
                appTitle={t("Historical Table")}
                onSiteChange={handleSiteChange}
            />
            <Layout className={styles.container}>
                <Layout.Content className={styles.contentWrapper}>
                    {showMainContent ? (
                        <>
                            <Card className={styles.filterCard}>
                                <Form form={form} wrapperCol={{ span: 18 }} labelCol={{ span: 6 }} layout="horizontal" onValuesChange={(changedValues) => { console.log(changedValues) }} >
                                    <Row gutter={16}>
                                        <Col span={5} className={styles['ant-col-4']}>
                                            <Form.Item
                                                name="dateRange"
                                                label={t("Date Range")}
                                                className={styles['ant-form-item']}
                                            >
                                                <DatePicker.RangePicker
                                                    format="YYYY-MM-DD"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5} className={styles['ant-col-4']}>
                                            <Form.Item
                                                name="workCenter"
                                                label={t("Work Center")}
                                                key={'workCenter'}
                                                className={styles['ant-form-item']}
                                            >
                                                <Input
                                                    placeholder='Please select work center'
                                                    autoComplete='off'
                                                    suffix={<GrChapterAdd onClick={() => { handleWorkCenterClick() }} />}
                                                    onChange={(e) => handleInputChange(e, 'workCenter')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5} className={styles['ant-col-4']}>
                                            <Form.Item
                                                name="resource"
                                                label={t("Resource")}
                                                key={'resource'}
                                                className={styles['ant-form-item']}
                                            >
                                                <Input
                                                    autoComplete='off'
                                                    placeholder='Please select resource'
                                                    suffix={<GrChapterAdd onClick={() => { handleResourceClick() }} />}
                                                    onChange={(e) => handleInputChange(e, 'resource')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5} className={styles['ant-col-4']}>
                                            <Form.Item
                                                name="shift"
                                                label={t("Shift")}
                                                className={styles['ant-form-item']}
                                            >
                                                <Select
                                                    mode='multiple'
                                                    placeholder={t("Select Shift")}
                                                    options={shiftData}
                                                    style={{ width: '100%' }}
                                                    allowClear
                                                    optionLabelProp="label"
                                                />
                                            </Form.Item>
                                        </Col>
                                        {/* <Col span={2} className={styles['ant-col-4']}>
                                            <Switch checked={eventType} onChange={handleEventTypeChange} checkedChildren="machine" unCheckedChildren="manual" />
                                        </Col> */}
                                        {activityRules?.some(rule => rule.ruleName === "machineData" && rule.setting === "true") ? (
                                            <Col span={2} className={styles['ant-col-4']}>
                                                <Switch checked={eventType} onChange={handleEventTypeChange} checkedChildren="machine" unCheckedChildren="manual" />
                                            </Col>
                                        ) :
                                            <Col span={2} className={styles['ant-col-4']}></Col>}
                                        <Col span={1} className={styles['ant-col-4']}>
                                            <Button
                                                type="primary"
                                                icon={<SearchOutlined className={styles['anticon']} />}
                                                onClick={handleSearch}
                                                loading={loading}
                                                style={{ width: '100%' }}
                                            />
                                        </Col>
                                        <Col span={1} className={styles['ant-col-4']}>
                                            <InstructionModal title="Historical Table">
                                                <UserInstructions manualContent={manualContent} />
                                            </InstructionModal>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card>

                            <div className={styles.tableSection}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24} lg={12} md={24}>
                                        <Card
                                            title={<><CalendarOutlined /> {t("Last 7 days (Work Center)")}</>}
                                            extra={
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
                                                    <Button
                                                        icon={<DownloadOutlined />}
                                                        onClick={() => handleDownloadExcel(workCenterData7d, "Last_7_days_Work_Center")}
                                                    />
                                                </div>
                                            }
                                            className={styles.tableCard}
                                        >
                                            <div className={styles.workCenterTable}>
                                                <Table
                                                    columns={workcenterColumns}
                                                    dataSource={workCenterData7d}
                                                    pagination={false}
                                                    size="middle"
                                                    loading={loading}
                                                    onRow={(record) => ({
                                                        onDoubleClick: () => handleTableRowClick(record, 'workcenter'),
                                                        className: selectedRowKeys.includes(getRowKey(record)) ? styles.selectedRow : ''
                                                    })}
                                                    scroll={{ y: 230 }}
                                                    rowKey={getRowKey}
                                                />
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={24} lg={12} md={24}>
                                        <Card
                                            title={<><CalendarOutlined /> {t("Last 3 months (Work Center)")}</>}
                                            extra={
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
                                                    <Button
                                                        icon={<DownloadOutlined />}
                                                        onClick={() => handleDownloadExcel(workCenterData3m, "Last_3_months_Work_Center")}
                                                    />
                                                </div>
                                            }
                                            className={styles.tableCard}
                                        >
                                            <div className={styles.workCenterTable}>
                                                <Table
                                                    columns={workcenterColumns3m}
                                                    dataSource={workCenterData3m}
                                                    pagination={false}
                                                    size="middle"
                                                    loading={loading}
                                                    onRow={(record) => ({
                                                        onDoubleClick: () => handleTableRowClick(record, 'workcenter'),
                                                        className: selectedRowKeys.includes(getRowKey(record)) ? styles.selectedRow : ''
                                                    })}
                                                    scroll={{ y: 230 }}
                                                    rowKey={getRowKey}
                                                />
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={24} lg={12} md={24}>
                                        <Card
                                            title={<><CalendarOutlined /> {t("Last 7 days (Resource)")}</>}
                                            extra={
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
                                                    {/* <Switch /> */}
                                                    <Button
                                                        icon={<DownloadOutlined />}
                                                        onClick={() => handleDownloadExcel(resourceData7d, "Last_7_days_Resource")}
                                                    />
                                                </div>
                                            }
                                            className={styles.tableCard}
                                        >
                                            <div className={styles.workCenterTable}>
                                                <Table
                                                    columns={resourceColumns}
                                                    dataSource={resourceData7d}
                                                    pagination={false}
                                                    size="middle"
                                                    loading={loading}
                                                    onRow={(record) => ({
                                                        onDoubleClick: () => handleTableRowClick(record, 'resource'),
                                                        className: selectedRowKeys.includes(getRowKey(record)) ? styles.selectedRow : ''
                                                    })}
                                                    scroll={{ y: 230 }}
                                                    rowKey={getRowKey}
                                                />
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={24} lg={12} md={24}>
                                        <Card
                                            title={<><CalendarOutlined /> {t("Last 3 months (Resource)")}</>}
                                            extra={
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
                                                    {/* <Switch /> */}
                                                    <Button
                                                        icon={<DownloadOutlined />}
                                                        onClick={() => handleDownloadExcel(resourceData3m, "Last_3_months_Resource")}
                                                    />
                                                </div>
                                            }
                                            className={styles.tableCard}
                                        >
                                            <div className={styles.workCenterTable}>
                                                <Table
                                                    columns={resourceColumns}
                                                    dataSource={resourceData3m}
                                                    pagination={false}
                                                    size="middle"
                                                    loading={loading}
                                                    onRow={(record) => ({
                                                        onDoubleClick: () => handleTableRowClick(record, 'resource'),
                                                        className: selectedRowKeys.includes(getRowKey(record)) ? styles.selectedRow : ''
                                                    })}
                                                    scroll={{ y: 230 }}
                                                    rowKey={getRowKey}
                                                />
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    ) : (
                        <div>
                            <OeeTabs
                                defaultActiveKey="availability"
                                availability={selectedRecord.availability}
                                performance={selectedRecord.performance}
                                quality={selectedRecord.quality}
                                oee={selectedRecord.oee}
                                record={selectedRecord}
                                tableType={selectedTableType}
                                onBack={handleBackToMain}
                                eventType={eventType ? "machine" : "manual"}
                            />
                        </div>
                    )}
                </Layout.Content>
            </Layout>

            <Modal title={t("selectResource")} open={resourceVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleResourceOk(record) })}
                    columns={ResourceColumn}
                    dataSource={resourceData}
                    rowKey="resource"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <Modal title={t("selectWorkCenter")} open={workCenterVisible} onCancel={handleCancel} width={1000} footer={null}>
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({ onDoubleClick: () => handleWorkCenterOk(record) })}
                    columns={WorkCenterColumn}
                    dataSource={workCenterData}
                    rowKey="workCenter"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </Modal>

            <style jsx global>{`
                .no-hover-table .ant-table-tbody > tr:hover > td {
                    background: inherit !important;
                }
            `}</style>
        </HistoricalContext.Provider>
    )
}

export default HistoricalTableMain;