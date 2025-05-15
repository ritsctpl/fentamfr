import React, { useEffect, useState } from 'react'
import FilterOprReport from './FilterOprReport'
import { Col, Row, message, Spin, Empty } from 'antd'
import CustomCard from './CustomCard'
import CustomTable from './CustomTable'
import CommonAppBar from '@components/CommonAppBar'
import jwtDecode from "jwt-decode";
import { useAuth } from "@context/AuthContext";
import { parseCookies } from "nookies";
import { decryptToken } from '@utils/encryption'
import styles from '../styles/FIlterStyle.module.css';

import { getApiRegistry, getOperatorReport } from '@services/oeeServices'
import BarChart from './BarChart'

// Type definitions
interface DecodedToken {
  preferred_username: string;
}

interface FormData {
  site: string | null;
  category: string[];
  startTime: string | null;
  endTime: string | null;
  shiftId: string | null;
  batchNumber: string | null;
  operation: string | null;
  workCenter: string | null;
  resource: string | null;
  item: string | null;
  shoporderId: string | null;
}

interface OverallOeeData {
  oee: number;
  performance: number;
  availability: number;
  quality: number;
}

const OperatorReportDashboard: React.FC = () => {
  const cookies = parseCookies();
  const { isAuthenticated, token } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  // State management
  const [category, setCategory] = useState<string[]>(['OEE']);
  const [overAllData, setOverAllData] = useState<Record<string, any>>({});
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    site: cookies.site || null,
    category: ['OEE'],
    startTime: null,
    endTime: null,
    shiftId: null,
    batchNumber: null,
    operation: null,
    workCenter: null,
    resource: null,
    item: null,
    shoporderId: null
  });

  // Data states
  const [overallOee, setOverallOee] = useState<OverallOeeData[]>([]);
  const [aggData, setAggData] = useState<any[]>([]);
  const [getOeeData, setGetOeeData] = useState<any[]>([]);
  const [getPerformanceData, setGetPerformanceData] = useState<any[]>([]);
  const [getAvailabilityData, setGetAvailabilityData] = useState<any[]>([]);
  const [getQualityData, setGetQualityData] = useState<any[]>([]);
  const [oeeGraph, setOeeGraph] = useState<any[]>([]);
  const [availabilityGraph, setAvailabilityGraph] = useState<any[]>([]);
  const [performanceGraph, setPerformanceGraph] = useState<any[]>([]);
  const [qualityGraph, setQualityGraph] = useState<any[]>([]);
  const [day, setDay] = useState<any[]>([]);
  const [month, setMonth] = useState<any[]>([]);
  const [year, setYear] = useState<any[]>([]);
  const [dayGraph, setDayGraph] = useState<any[]>([]);
  const [monthGraph, setMonthGraph] = useState<any[]>([]);
  const [yearGraph, setYearGraph] = useState<any[]>([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !token) return;

      try {
        setIsLoading(true);
        const decryptedToken = decryptToken(token);
        const decoded: DecodedToken = jwtDecode(decryptedToken);
        setUsername(decoded.preferred_username);
      } catch (error) {
        console.error("Error decoding token:", error);
        messageApi.error('Failed to authenticate user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, token, cookies.site]);

  // Set default OEE data
  useEffect(() => {
    if (category.includes('OEE') && Object.keys(overAllData).length === 0) {
      setCategory(['OEE']);
    }
  }, []);

  const prepareRequestBody = (formData: FormData) => {
    return Object.entries(formData).reduce((acc: Record<string, any>, [key, value]) => {
      if (value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          acc[key] = value;
        } else if (typeof value === 'string' || typeof value === 'number') {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
  };

  const fetchApiData = async (endpoint: string, setter: (data: any[]) => void, body: any) => {
    try {
      const response = await getApiRegistry(body, endpoint);
      setter(response?.data || []);
    } catch (error) {
      // console.error(`Error fetching ${endpoint}:`, error);
      // messageApi.error(`Failed to fetch ${endpoint} data`);
      setter([]);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      const requestBody = prepareRequestBody(formData);

      try {
        // Parallel API calls for better performance
        await Promise.all([
          fetchApiData('get_raggregatedoee', setAggData, requestBody),
          fetchApiData('get_roee', setGetOeeData, requestBody),
          fetchApiData('get_ravailability', setGetAvailabilityData, requestBody),
          fetchApiData('get_rperformance', setGetPerformanceData, requestBody),
          fetchApiData('get_rquality', setGetQualityData, requestBody),
          fetchApiData('get_roverall', setOverallOee, requestBody),
          fetchApiData('get_roeebymachine', setOeeGraph, requestBody),
          fetchApiData('get_ravailability_graph', setAvailabilityGraph, requestBody),
          fetchApiData('get_rperformance_graph', setPerformanceGraph, requestBody),
          fetchApiData('get_rquality_graph', setQualityGraph, requestBody),
          fetchApiData('get_r_day', setDay, requestBody),
          fetchApiData('get_r_month', setMonth, requestBody),
          fetchApiData('get_r_year', setYear, requestBody),
          fetchApiData('get_r_day_graph', setDayGraph, requestBody),
          fetchApiData('get_r_month_graph', setMonthGraph, requestBody),
          fetchApiData('get_r_year_graph', setYearGraph, requestBody),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        messageApi.error('Failed to fetch some data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [formData , cookies.site]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {contextHolder}
      <CommonAppBar
        onSearchChange={() => { }}
        allActivities={[]}
        username={username}
        site={null}
        appTitle={"Operator Report Dashboard"}
        onSiteChange={() => { }}
      />
      <FilterOprReport 
        setCategory={setCategory} 
        setOverAllData={setOverAllData} 
        setFormData={setFormData}
        formData={formData}
        category={category}
      />
      
      {/* Metrics Overview */}
      {/* <Row gutter={[24, 24]} justify="space-around" style={{ width: '100%', marginTop: '20px', flexShrink: 0 }}>
        {[
          { label: 'Oee', value: overallOee[0]?.oee, className: styles.blueBox },
          { label: 'Performance', value: overallOee[0]?.performance, className: styles.greenBox },
          { label: 'Availability', value: overallOee[0]?.availability, className: styles.redBox },
          { label: 'Quantity', value: overallOee[0]?.quality, className: styles.blueBox }
        ].map((metric, index) => (
          <Col span={5} key={metric.label}>
            <div className={`${styles.metricBox} ${metric.className}`}>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={styles.metricValue}>{overallOee?.length > 1 ? 'N/A' : metric.value?.toFixed(2) || 'N/A'}</span>
            </div>
          </Col>
        ))}
      </Row> */}

      {/* Main Content Area */}
      <div style={{
        padding: '10px',
        flexGrow: 1,
        overflowY: 'auto',
        height: 'calc(100vh - 280px)'
      }}>
        <div style={{ width: '100%', height: '100%' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" tip="Loading data..." />
            </div>
          ) : !formData.category || formData.category.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Please select a category to view the report"
              />
            </div>
          ) : (
            <>
              {/* OEE Section */}
              {renderOEESection()}
              
              {/* Availability Section */}
              {renderAvailabilitySection()}
              
              {/* Quality Section */}
              {renderQualitySection()}
              
              {/* Performance Section */}
              {renderPerformanceSection()}
              
              {/* Time-based Section */}
              {renderDayBasedSection()}
              {renderMonthBasedSection()}
              {renderYearBasedSection()}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Helper render functions
  function renderOEESection() {
    if (!formData.category.includes('OEE') || 
        formData.category.includes('DAY') || 
        formData.category.includes('MONTH') || 
        formData.category.includes('YEAR')) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%', height: '38%' }}>
            <CustomCard data={aggData} title="Aggregate OEE Details" height="100%">
              <CustomTable
                data={aggData}
                scroll={{ x: 'max-content' }}
              />
            </CustomCard>
          </div>
          <div style={{ width: '100%', height: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '90%', height: '1px', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
          </div>
          <div style={{ width: '100%', height: '60%' }}>
            <CustomCard data={getOeeData} title="OEE Details" height="100%">
              <CustomTable
                data={getOeeData}
              scroll={{ x: 'max-content' }}
              />
            </CustomCard>
          </div>
        </div>
        <div style={{ width: '15px', height: '100%', display: 'flex',justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ width: '1px', height: '90%', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <CustomCard data={oeeGraph} title="OEE Graph" height="100%">
            <BarChart data={oeeGraph} type='percentage' />
          </CustomCard>
        </div>
      </div>
    );
  }

  function renderAvailabilitySection() {
    if (!formData.category.includes('Availability') || 
        formData.category.includes('DAY') || 
        formData.category.includes('MONTH') || 
        formData.category.includes('YEAR')) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CustomCard data={[]} title="Availability Details" height="100%">
            <CustomTable
              data={getAvailabilityData}
              scroll={{ x: 'max-content' }}
            />
          </CustomCard>
        </div>
        <div style={{ width: '15px', height: '100%', display: 'flex',justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ width: '1px', height: '90%', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <CustomCard data={[]} title="Availability Graph" height="100%">
            <BarChart data={availabilityGraph} type='percentage' />
          </CustomCard>
        </div>
      </div>
    );
  }

  function renderQualitySection() {
    if (!formData.category.includes('Quality') || 
        formData.category.includes('DAY') || 
        formData.category.includes('MONTH') || 
        formData.category.includes('YEAR')) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CustomCard data={[]} title="Quality Details" height="100%">
            <CustomTable
              data={getQualityData}
              scroll={{ x: 'max-content' }}
            />
          </CustomCard>
        </div>
        <div style={{ width: '15px', height: '100%', display: 'flex',justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ width: '1px', height: '90%', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <CustomCard data={[]} title="Quality Graph" height="100%">
            <BarChart data={qualityGraph} type="percentage" />
          </CustomCard>
        </div>
      </div>
    );
  }

  function renderPerformanceSection() {
    if (!formData.category.includes('Performance') || 
        formData.category.includes('DAY') || 
        formData.category.includes('MONTH') || 
        formData.category.includes('YEAR')) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CustomCard data={[]} title="Performance Details" height="100%">
            <CustomTable
              data={getPerformanceData}
              scroll={{ x: 'max-content' }}
            />
          </CustomCard>
        </div>
        <div style={{ width: '15px', height: '100%', display: 'flex',justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ width: '1px', height: '90%', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <CustomCard data={[]} title="Performance Graph" height="100%">
            <BarChart data={performanceGraph} type='percentage' />
          </CustomCard>
        </div>
      </div>
    );
  }

  function renderDayBasedSection() {
    if (!formData.category.some(cat => ['DAY'].includes(cat))) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CustomCard data={[]} title="Day Details" height="100%">
                <CustomTable
                  data={day}
                  scroll={{ x: 'max-content' }}
                />
              </CustomCard>
        </div>
        <div style={{ width: '15px', height: '100%', display: 'flex',justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ width: '1px', height: '90%', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <CustomCard data={[]} title="Day Graph" height="100%">
              <BarChart data={dayGraph} type='percentage' />
          </CustomCard>
        </div>
      </div>
    );
  }
  function renderMonthBasedSection() {
    if (!formData.category.some(cat => ['MONTH'].includes(cat))) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CustomCard data={[]} title="Month Details" height="100%">
                <CustomTable
                  data={month}
                  scroll={{ x: 'max-content' }}
                />
              </CustomCard>
        </div>
        <div style={{ width: '15px', height: '100%', display: 'flex',justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ width: '1px', height: '90%', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <CustomCard data={[]} title="Month Graph" height="100%">
            <BarChart data={monthGraph} type='percentage' />
          </CustomCard>
        </div>
      </div>
    );
  }
  function renderYearBasedSection() {
    if (!formData.category.some(cat => ['YEAR'].includes(cat))) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CustomCard data={year} title="Year Details" height="100%">
                <CustomTable
                  data={year}
                  scroll={{ x: 'max-content' }}
                />
              </CustomCard>
        </div>
        <div style={{ width: '15px', height: '100%', display: 'flex',justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ width: '1px', height: '90%', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <CustomCard data={[]} title="Year Graph" height="100%">
            <BarChart data={yearGraph} type='percentage' />
          </CustomCard>
        </div>
      </div>
    );
  }
}



export default OperatorReportDashboard