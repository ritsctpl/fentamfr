"use client"
import React, { useState } from 'react';
import { TextHead } from './TextHead';
import StatusIndicator from './StatusIndicator';
import SideBar from './SideBar';
import ApprovalBody from './StageBody';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import { RefreshOutlined, SearchOutlined } from '@mui/icons-material';

function SatgeApproval() {
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
        <TextHead text="Stage Approval Dashboard" textColor="black" fontSize="16px" fontWeight="bold" />
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
        <Form.Item name="batchId" label="Batch ID" style={{ margin: '0px' }}>
          <Input size='large' placeholder='Enter Batch ID' />
        </Form.Item>
        <Form.Item name="initialReview" label="Initial Review" style={{ margin: '0px' }}>
          <Select size='large' placeholder='Select Initial Review' options={[{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }]} />
        </Form.Item>
        <Form.Item name="status" label="Status" style={{ margin: '0px' }}>
          <Select size='large' placeholder='Select Status' options={[{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }]} />
        </Form.Item>
        <Form.Item name="productCode" label="Product Code" style={{ margin: '0px' }}>
          <Input size='large' placeholder='Enter Product Code' />
        </Form.Item>
        <Form.Item name="priority" label="Priority" style={{ margin: '0px' }}>
          <Select size='large' placeholder='Select Priority' options={[{ label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' }]} />
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

export default SatgeApproval;