'use client'
import styles from '@/modules/opcplugin/opcPlugin.module.css';
import { useState, useEffect } from 'react';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@context/AuthContext';
import { decryptToken } from '@utils/encryption';
import jwtDecode from 'jwt-decode';
import { retrieveActivity, retrieveAllActivity } from '@services/activityService';
import { Select } from 'antd';

interface DecodedToken {
  preferred_username: string;
}

const OpcPlugin: React.FC = () => {
  const [statusCards, setStatusCards] = useState<any[]>([]);
  const { isAuthenticated, token } = useAuth();
  const [username, setUsername] = useState('');
  const [newResource, setNewResource] = useState('');
  const [filterCards, setFilterCards] = useState<any[]>([]);
  // const [filterCards, setFilterCards] = useState<any[]>([
  //   {
  //     id: 1,
  //     resource: 'TABLETLINE1_WC',
  //     tags: [
  //       { name: 'temperature', value: '28.5°C', },
  //       { name: 'pressure', value: '3.2 bar' },
  //       { name: 'status', value: 'Running' }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     resource: 'TABLETLINE2_WC', 
  //     tags: [
  //       { name: 'temperature', value: '26.7°C', },
  //       { name: 'pressure', value: '2.8 bar' },
  //       { name:'status', value: 'Idle' }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     resource: 'LIQUIDLINE1_WC',
  //     tags: [
  //       { name: 'temperature', value: '24.3°C', },
  //       { name: 'pressure', value: '2.1 bar' },
  //       { name:'status', value: 'Running' }
  //     ]
  //   },
  //   {
  //     id: 4,
  //     resource: 'LIQUIDLINE2_WC',
  //     tags: [
  //       { name: 'temperature', value: '27.9°C', },
  //       { name: 'pressure', value: '2.9 bar' },
  //       { name:'status', value: 'Maintenance' }
  //     ]
  //   },
  //   {
  //     id: 5,
  //     resource: 'GRIPSTER_L2_PRET_0025',
  //     tags: [
  //       { name: 'temperature', value: '23.1°C', },
  //       { name: 'pressure', value: '1.8 bar' },
  //       { name:'status', value: 'Running' }
  //     ]
  //   },
  //   {
  //     id: 6,
  //     resource: 'PHARMBLOC_L2_PRET_0027',
  //     tags: [
  //       { name: 'temperature', value: '29.4°C', },
  //       { name: 'pressure', value: '3.5 bar' },
  //       { name:'status', value: 'Warning' }
  //     ]
  //   },
  //   {
  //     id: 7,
  //     resource: 'LIQUID_LABELLING_L2_PRET_0032',
  //     tags: [
  //       { name: 'temperature', value: '25.8°C', },
  //       { name: 'pressure', value: '2.4 bar' },
  //       { name:'status', value: 'Running' }
  //     ]
  //   },
  //   {
  //     id: 8,
  //     resource: 'MAIN_LIQ_MFG_VESSEL_L2_PRET_0015',
  //     tags: [
  //       { name: 'temperature', value: '26.2°C', },
  //       { name: 'pressure', value: '2.7 bar' },
  //       { name:'status', value: 'Running' }
  //     ]
  //   },
  // ]);
  const [call, setCall] = useState(0);
  const t = (key: string) => key;
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [hasSetDefault, setHasSetDefault] = useState(false);

  // Define default resources
  const defaultResources = [
    { name: 'ph', value: '-' },
    { name: 'pump_fault', value: '-' },
    { name: 'temperature', value: '-' },
    { name: 'pressure', value: '-' },
    { name: 'flow_rate', value: '-' },
    { name: 'level', value: '-' },
    { name: 'status', value: '-' },
    { name: 'voltage', value: '-' },
    { name: 'current', value: '-' },
    { name: 'power', value: '-' }
  ];

  useEffect(() => {

    const fetchActivity = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      const site = "OPC_PLUGIN"
      const currentSite = site;

      let activityRuleUrl;

      try {
        const activities = await retrieveActivity(site, "OPC_PLUGIN", currentSite);
        activityRuleUrl = activities.activityRules[0].setting;
      } catch (error) {
        console.error("Error fetching data fields:", error);
      }
      console.log(activityRuleUrl, 'activityRuleUrl');

      const ws = new WebSocket(activityRuleUrl);
      ws.onmessage = (event) => {
        const message = event.data;
        try {
          const parsedData = JSON.parse(message);
          console.log(parsedData, 'parsedData');

          setFilterCards(parsedData || []);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };
      return () => ws.close();
    }
    fetchActivity();
  }, [isAuthenticated, token, call]);

  // Set first station as default only once when filterCards data loads
  useEffect(() => {
    if (filterCards.length > 0 && !hasSetDefault) {
      setSelectedStations([filterCards[0].station]);
      setHasSetDefault(true);
    }
  }, [filterCards, hasSetDefault]);

  const renderResourcesList = (resources: any[]) => {
    const displayResources = [...resources];

    defaultResources.forEach((defaultResource) => {
      if (!displayResources.find(r => r.name === defaultResource.name)) {
        displayResources.push(defaultResource);
      }
    });

    const limitedResources = displayResources.slice(0, 10);

    const isMobile = window.innerWidth <= 480;
    const firstColumnSize = isMobile ? 10 : 5;

    const leftColumnResources = limitedResources.slice(0, firstColumnSize);
    const rightColumnResources = limitedResources.slice(firstColumnSize, 10);

    const formatValue = (value: any) => {
      if (value === '-') return '-';
      if (typeof value === 'boolean') return value ? 'ON' : 'OFF';

      // Remove quotes if present
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      // Try to parse as number and format if successful
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return numValue.toFixed(2);
      }

      // Return original value if it's not a number
      return value;
    };

    return (
      <div className={styles.resourcesList}>
        <div className={styles.resourcesColumns}>
          <div className={styles.resourcesColumn}>
            {leftColumnResources.map((resource, index) => (
              <div key={index} className={styles.resourceItem}>
                <span className={styles.resourceName}>{resource.name}:</span>
                <span className={styles.speedValue}>
                  {formatValue(resource.value)}
                </span>
              </div>
            ))}
          </div>
          {!isMobile && (
            <div className={styles.resourcesColumn}>
              {rightColumnResources.map((resource, index) => (
                <div key={index + 5} className={styles.resourceItem}>
                  <span className={styles.resourceName}>{resource.name}:</span>
                  <span className={styles.speedValue}>
                    {formatValue(resource.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get unique stations for dropdown - Updated to use resource instead of station
  const stationOptions = Array.from(new Set(filterCards.map(card => card.resource))).map(resource => ({
    label: resource,
    value: resource,
  }));

  // Filter cards based on selected stations - Updated to use resource instead of resources
  const filteredCards = selectedStations.length > 0
    ? filterCards.filter(card => selectedStations.includes(card.resource))
    : filterCards; // Show all cards if no selection

  // Update the default station selection to use resource
  useEffect(() => {
    if (filterCards.length > 0 && !hasSetDefault) {
      setSelectedStations([filterCards[0].resource]);
      setHasSetDefault(true);
    }
  }, [filterCards, hasSetDefault]);

  return (
    <div className={styles.opcContainer}>
      <div className={styles.filterSection}>
        <Select
          mode="multiple"
          style={{ width: 400, marginBottom: 16 }}
          placeholder="Select Stations"
          options={stationOptions}
          value={selectedStations}
          onChange={setSelectedStations}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
          }
          allowClear
        />
      </div>
      <div className={styles.opcGrid}>
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className={`${styles.statusCard} ${styles[`status-${card.resource.replace(/\s+/g, '')}`]}`}
          >
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <span className={styles.title}>{card.resource}</span>
              </div>
              {renderResourcesList(card.tags)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OpcPlugin;


