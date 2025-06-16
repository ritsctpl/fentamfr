"use client"
import React, { useState } from 'react';
import { TextHead } from './TextHead';
import StatusIndicator from './StatusIndicator';
import SideBar from './SideBar';
import ApprovalBody from './ApprovalBody';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import { RefreshOutlined, SearchOutlined } from '@mui/icons-material';

function DocumentApproval() {
  const [filter, setFilter] = useState(false);
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        height: '8%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '15px',
        borderBottom: '1px solid #E0E0E0',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box',
      }}>
        <TextHead text="Document Approval Dashboard" textColor="black" fontSize="16px" fontWeight="bold" />
        <StatusIndicator />
      </div>

      {filter && <Form style={{
        width: '100%',
        height: '8%',
        display: 'flex',
        padding: '15px',
        alignItems: 'center',
        borderBottom: '1px solid #E0E0E0',
        gap: '10px',
      }}
      >
        <Form.Item name="date" label="Date" style={{ margin: '0px' }}>
          <DatePicker
            size='large'
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item name="documentId" label="Document ID" style={{ margin: '0px' }}>
          <Input size='large' />
        </Form.Item>
        <Form.Item name="status" label="Status" style={{ margin: '0px' }}>
          <Select size='large' options={[{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }]} />
        </Form.Item>
        <Button icon={<SearchOutlined style={{ fontSize: '16px' }} />} size='large'>Search</Button>
        <Button icon={<RefreshOutlined style={{ fontSize: '16px' }} />} size='large'>Reset</Button>
      </Form>
      }
      <div style={{
        width: '100%',
        height: '92%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
      }}>
        <SideBar filter={filter} setFilter={setFilter} />
        <ApprovalBody />
      </div>
    </div>
  );
}

export default DocumentApproval;