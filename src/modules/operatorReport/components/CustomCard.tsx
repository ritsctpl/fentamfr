import React, { useState } from 'react';
import { Card, Modal, Button, Space, message } from 'antd';
import { DownloadOutlined, ExpandAltOutlined } from '@ant-design/icons';
import CustomTable from './CustomTable';

interface CustomCardProps {
  title?: string;
  children?: React.ReactNode;
  height?: string;
  data?: any;
}

const CustomCard: React.FC<CustomCardProps> = ({ title, children, height, data }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };


  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const downloadAsExcel = () => {
    try {
      // If no data, return
      if (!data || data.length === 0) {
        message.error('No data to download');
        return;
      }

      // Get headers from the first object's keys
      const headers = Object.keys(data[0]);

      // Create CSV content
      let csvContent = headers.join(',') + '\n'; // Headers row

      // Add data rows
      data.forEach(row => {
        const rowData = headers.map(header => {
          const value = row[header];
          // Handle special characters and commas
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          // If value contains comma, quote, or newline, wrap in quotes
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvContent += rowData.join(',') + '\n';
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${title?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <Card
        title={title}
        style={{
          height: height,
          display: 'flex',
          flexDirection: 'column'
        }}
        headStyle={{
          padding: '5px',
          minHeight: '10px',
          fontSize: '14px' // Adjust font size if needed
        }}
        bodyStyle={{
          flex: 1,
          padding: '0px',
          height: '100%',
          overflow: 'scroll'
        }}
        extra={
          <Space>
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={downloadAsExcel}
            />
            <Button
              type="text"
              icon={<ExpandAltOutlined />}
              onClick={showModal}
            />   
          </Space>
        }
      >
        {children}
      </Card>

      <Modal
        title={`${title} Details`}
        open={isModalVisible}
        onCancel={handleCancel}
        width="80%"
        footer={null}
        centered
      >
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' ,overflow:'auto' }}>
          {children}
        </div>
      </Modal>
    </div>
  );
};

export default CustomCard; 