'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/templateCreater/styles/templateBuilder.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import CommonTable from '@components/CommonTable';
import { Modal, Form, Input, Button } from 'antd';
import InstructionModal from '@components/InstructionModal';
import { TemplateBuilderContext } from '../hooks/TemplateBuilderContext';
import TemplateBuilderBar from './TemplateBuilderBar';
import TemplateEditorScreen from './TemplateEditorScreen';

// Updated dummy data to match the new table structure
const dummyTableData: any[] = [
  { 
    templateId: 'TEMP-001', 
    templateName: 'Introduction Template', 
    version: '1.0', 
    date: '2023-01-15',
    description: 'A standard introduction template'
  },
  { 
    templateId: 'TEMP-002', 
    templateName: 'Report Template', 
    version: '2.1', 
    date: '2023-03-22',
    description: 'Comprehensive report template'
  },
  { 
    templateId: 'TEMP-003', 
    templateName: 'Summary Template', 
    version: '1.2', 
    date: '2023-05-10',
    description: 'Brief summary template'
  },
];

// Define table columns configuration for CommonTable
// const tableColumns = (any): any[] => [
//   {
//     title: 'Template ID',
//     dataIndex: 'templateId',
//     key: 'templateId',
//   },
//   {
//     title: 'Template Name',
//     dataIndex: 'templateName',
//     key: 'templateName',
//   },
//   {
//     title: 'Version',
//     dataIndex: 'version',
//     key: 'version',
//   },
//   {
//     title: 'Date',
//     dataIndex: 'date',
//     key: 'date',
//   },
// ];

const TemplateBuilderMain: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<any>({});
  const [selected, setSelected] = useState<object>({});
  const { isAuthenticated, token } = useAuth();
  const [filteredData, setFilteredData] = useState<any[]>(dummyTableData);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [drag, setDrag] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [resetValueCall, setResetValueCall] = useState<number>(0);
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState<any>(null);
  const [isFromTableClick, setIsFromTableClick] = useState<boolean>(false);

  useEffect(() => {
    const fetchResourceData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: any = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };
    fetchResourceData();
  }, [isAuthenticated, username, call]);

  const handleAddClick = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  const handleRowSelect = (row: any) => {
    console.log("Row selected:", row);
    setEditorData(row); // pass selected row data
    setIsFromTableClick(true); // Mark that this is from a table click
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditorData(null);
    setIsFromTableClick(false);
  };

  const handleAddTemplate = () => {
    form.validateFields().then(values => {
      // Create new template and add to table
      const newId = filteredData.length > 0 ? Math.max(...filteredData.map(item => 
        item.templateId ? parseInt(item.templateId.split('-')[1]) : 0
      )) + 1 : 1;
      
      const templateId = `TEMP-${String(newId).padStart(3, '0')}`;
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const newTemplateData = {
        templateId: templateId,
        templateName: values.name,
        version: values.version || '1.0',
        date: currentDate,
        description: values.description || ''
      };
      
      setFilteredData(prev => [...prev, newTemplateData]);
      
      // Reset form and close modal
      form.resetFields();
      setIsAddModalVisible(false);
    });
  };

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const buttonLayout = {
    wrapperCol: { offset: 6, span: 18 },
  };

  // Direct conditional rendering
  if (showEditor) {
    return (
      <TemplateBuilderContext.Provider value={{ formData, setFormData }}>
        <div className={styles.container}>
          <div className={styles.dataFieldNav}>
            <CommonAppBar
              onSearchChange={() => { }}
              allActivities={[]}
              username={username}
              site={null}
              appTitle={t("Template Creater")} onSiteChange={() => { }} />
          </div>
          <TemplateEditorScreen
            data={isFromTableClick ? editorData : {}}
            onClose={handleCloseEditor}
            isNewTemplate={!isFromTableClick || (editorData && Object.keys(editorData).length === 0)}
          />
        </div>
      </TemplateBuilderContext.Provider>
    );
  }

  return (
    <TemplateBuilderContext.Provider value={{ formData, setFormData }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("Template Creater")} onSiteChange={() => { }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <TemplateBuilderBar
                handleSearchClicks={() => { }}
                handleTop50={() => { }}
                button={
                  <InstructionModal title="Template Creator">
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("templates")}({filteredData ? filteredData.length : 0})
                </Typography>
                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable 
                data={filteredData} 
                onRowSelect={handleRowSelect} 
                // columns={tableColumns}
              />
              <Modal
                title={t('confirmation')}
                open={isModalVisible}
                onOk={() => { }}
                onCancel={() => { }}
                okText={t('confirm')}
                cancelText={t('cancel')}
              >
                <p>{t('alertRow')}</p>
              </Modal>
              
              {/* Add Template Modal */}
              <Modal
                title={t('Add New Template')}
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null}
              >
                <Form 
                  form={form}
                  name="templateForm"
                  {...formLayout}
                  onFinish={handleAddTemplate}
                  className={styles.modalForm}
                >
                  <Form.Item
                    name="name"
                    label={t('Template Name')}
                    rules={[{ required: true, message: t('Please enter template name') }]}
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="version"
                    label={t('Version')}
                    initialValue="1.0"
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="description"
                    label={t('Description')}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  
                  <Form.Item {...buttonLayout}>
                    <Button 
                      onClick={() => setIsAddModalVisible(false)}
                      style={{ marginRight: 8 }}
                    >
                      {t('Cancel')}
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                    >
                      {t('Save')}
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </TemplateBuilderContext.Provider>
  );
};

export default TemplateBuilderMain;

