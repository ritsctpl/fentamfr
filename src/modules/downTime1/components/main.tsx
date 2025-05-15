import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, Row, Col, Space, message, Modal, Tabs, Layout } from 'antd';

import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import DownTimePlannedTable from './DownTimePlanned';
import DownTimeTable from './DownTime';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';

const { RangePicker } = DatePicker;

interface DownTimeFormProps {
  initialValues?: any;
  isEditing?: any;
  setInitialValues?: (values: any) => void;
  setEditingKey?: (key: any) => void;
}

const DownTimeMain: React.FC<DownTimeFormProps> = ({ setInitialValues, initialValues, isEditing, setEditingKey }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  // Remove the clear state as it's not needed
  const cookies = parseCookies();
  const site = cookies.site;
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);
  const handleSearch = (searchTerm: string) => {
    console.log('Search term:', searchTerm);
  };

  return (
    <Layout style={{ margin: 0, padding: 0 }}>
      <CommonAppBar appTitle="DownTime Screen" onSearchChange={handleSearch} />
      <Tabs
        defaultActiveKey="1"
        centered
        style={{ margin: 0, padding: 0 }}
        tabBarExtraContent={{
          right: (
            <div style={{ marginRight: '20px' }}>
              <InstructionModal title="DownTime Screen">
                <UserInstructions />
              </InstructionModal>
            </div>
          ),
        }}
        items={[
          {
            key: '1',
            label: 'Unplanned DT',
            children: (
              <DownTimeTable />
            ),
          },
          {
            key: '2',
            label: 'Planned DT',
            children: (<DownTimePlannedTable />),
          },
        ]}
      />
    </Layout>
  );
};

export default DownTimeMain;