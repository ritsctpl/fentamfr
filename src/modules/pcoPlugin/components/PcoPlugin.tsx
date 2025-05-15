'use client'
import { useAuth } from '@context/AuthContext';
import { retrieveActivity } from '@services/activityService';
import { decryptToken } from '@utils/encryption';
import jwtDecode from 'jwt-decode';
import { parseCookies } from 'nookies';
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Select, Row, Col } from 'antd';
import AreaChart from './AreaChart';
import BarChart from './BarChart';
import LineChart from './LineChart';

interface DecodedToken {
  preferred_username: string;
}

type ChartType = 'area' | 'bar' | 'line';

interface Resource {
  name: string;
  value: string;
}

interface Station {
  id: string;
  resource: string;  // changed from 'station'
  tags: Resource[];  // changed from 'resources'
}

interface DataPoint {
  date: string;
  [key: string]: any;
}

const MAX_HISTORY = 5;

const PcoPlugin = () => {
  const { isAuthenticated, token } = useAuth();
  const [username, setUsername] = useState('');
  const [statusCards, setStatusCards] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>(''); // keep variable name but it refers to resource now
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('area');
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const [hasSetDefault, setHasSetDefault] = useState(false);

  // Chart colors configuration
  const chartColors = {
    threshold: [7, 8.5],
    itemcolor: ['#52c41a', '#faad14', '#ff4d4f'],
    linecolor: [
      '#1890ff', // blue
      '#52c41a', // green
      '#faad14', // yellow
      '#ff4d4f', // red
      '#722ed1', // purple
      '#13c2c2', // cyan
      '#eb2f96', // pink
      '#fa8c16', // orange
    ]
  };

  // Helper function to parse value based on type
  const parseValue = (value: any): number => {
    // Remove quotes if present
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    // Handle boolean values
    if (value === 'true' || value === true) return 1;
    if (value === 'false' || value === false) return 0;

    // Handle numeric values
    const numValue = Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };

  // Function to get current value for a station and resource
  const getCurrentValue = (stationId: string, resourceName: string, data: Station[]): number => {
    const station = data.find(s => s.resource === stationId);
    if (!station) return 0;

    const resource = station.tags.find(r => r.name === resourceName);
    if (!resource) return 0;

    return parseValue(resource.value);
  };

  // Function to update chart data with new value
  const updateChartData = useCallback((newValue: number) => {
    const now = Date.now();
    // Ensure we don't update too frequently (minimum 500ms between updates)
    if (now - lastUpdateTimeRef.current < 500) return;
    lastUpdateTimeRef.current = now;

    const currentTime = new Date().toLocaleTimeString();
    
    setChartData(prevData => {
      // Create new data point
      const newPoint: DataPoint = {
        date: currentTime,
        [selectedResource]: newValue
      };

      // If we have no previous data, start with this point
      if (prevData.length === 0) return [newPoint];

      // Add new point and keep only last MAX_HISTORY points
      const newData = [...prevData, newPoint];
      return newData.slice(-MAX_HISTORY);
    });
  }, [selectedResource]);

  // Setup WebSocket connection
  useEffect(() => {
    const setupWebSocket = async () => {
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
      const site = cookies.site;
      const activityId = "PCO_PLUGIN"
      const currentSite = site;

      try {
        const activities = await retrieveActivity(site, activityId, currentSite);
        const activityRuleUrl = activities.activityRules[0].setting;
        
        // Close existing WebSocket if any
        if (wsRef.current) {
          wsRef.current.close();
        }

        // Create new WebSocket connection
        const ws = new WebSocket(activityRuleUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          const message = event.data;
          const parsedData: Station[] = JSON.parse(message) || [];
          setStatusCards(parsedData || []);

          // Set default station and resource if not set yet
          if (!hasSetDefault && parsedData.length > 0) {
            const firstStation = parsedData[0].resource;
            const firstResource = parsedData[0].tags[0]?.name;
            
            if (firstStation && firstResource) {
              setSelectedStation(firstStation);
              setSelectedResource(firstResource);
              
              // Initialize chart with first value
              const initialValue = getCurrentValue(firstStation, firstResource, parsedData);
              const currentTime = new Date().toLocaleTimeString();
              setChartData([{
                date: currentTime,
                [firstResource]: initialValue
              }]);
              
              setHasSetDefault(true);
            }
          }

          // Update chart data if we have a selected station and resource
          if (selectedStation && selectedResource) {
            const currentValue = getCurrentValue(selectedStation, selectedResource, parsedData);
            updateChartData(currentValue);
          }
        };

        return () => {
          if (ws) {
            ws.close();
          }
        };
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
      }
    };

    setupWebSocket();
  }, [isAuthenticated, token, updateChartData, hasSetDefault]);

  // Reset hasSetDefault when station or resource changes manually
  useEffect(() => {
    if (selectedStation || selectedResource) {
      setHasSetDefault(true);
    }
  }, [selectedStation, selectedResource]);

  // Get unique stations
  const stations = statusCards.map(card => card.resource);

  // Get resources for selected station
  const getResourcesForStation = () => {
    const selectedCard = statusCards.find(card => card.resource === selectedStation);
    return selectedCard ? selectedCard.tags.map(resource => resource.name) : [];
  };

  const handleStationChange = (value: string) => {
    setSelectedStation(value);
    setSelectedResource('');
    setChartData([]);
    lastUpdateTimeRef.current = 0;
  };

  // Handle resource selection
  const handleResourceChange = (value: string) => {
    setSelectedResource(value);
    setChartData([]); // Clear existing data
    lastUpdateTimeRef.current = 0;
    
    // Initialize with current value
    const currentValue = getCurrentValue(selectedStation, value, statusCards);
    const currentTime = new Date().toLocaleTimeString();
    setChartData([{
      date: currentTime,
      [value]: currentValue
    }]);
  };

  // Handle chart type selection
  const handleChartTypeChange = (value: ChartType) => {
    setSelectedChartType(value);
  };

  // Render selected chart type
  const renderChart = () => {
    if (chartData.length === 0) return null;

    const chartProps = {
      data: chartData,
      title: `${selectedResource} Values Over Time`,
      color: chartColors,
      description: `Live tracking of ${selectedResource} values for station ${selectedStation}`
    };

    switch (selectedChartType) {
      case 'area':
        return <AreaChart {...chartProps} />;
      case 'bar':
        return <BarChart {...chartProps} theshold={chartColors.threshold} />;
      case 'line':
        return <LineChart {...chartProps} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Select
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Select Station"
            value={selectedStation}
            onChange={handleStationChange}
          >
            {stations.map((station) => (
              <Select.Option key={station} value={station}>
                {station}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Select Resource"
            value={selectedResource}
            onChange={handleResourceChange}
            disabled={!selectedStation}
          >
            {getResourcesForStation().map((resource) => (
              <Select.Option key={resource} value={resource}>
                {resource}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%', marginBottom: '16px' }}
            value={selectedChartType}
            onChange={handleChartTypeChange}
            disabled={!selectedResource}
          >
            <Select.Option value="area">Area Chart</Select.Option>
            <Select.Option value="bar">Bar Chart</Select.Option>
            <Select.Option value="line">Line Chart</Select.Option>
          </Select>
        </Col>
      </Row>
      {selectedResource && (
        <Row>
          <Col span={24}>
            {renderChart()}
          </Col>
        </Row>
      )}
    </div>
  );
}

export default PcoPlugin;