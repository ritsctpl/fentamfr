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
import { Modal, Form, Input, Button, Switch, message, Select, Table } from 'antd';
import InstructionModal from '@components/InstructionModal';
import { TemplateBuilderContext } from '../hooks/TemplateBuilderContext';
import TemplateBuilderBar from './TemplateBuilderBar';
import TemplateEditorScreen from './TemplateEditorScreen';
import CommonTable from './CommonTable';
import { createTemplate, getAllTemplates, getTop50Templates, retrieveTemplates } from '@services/templateService';
import { get } from 'http';
import { GrChapterAdd } from 'react-icons/gr';
import { fetchAllMaterial, fetchTop50Material } from '@services/cycleTimeService';

// const dummyTableData: any[] = [
//   { 
//     templateId: 'TEMP-001', 
//     templateName: 'Standard Template', 
//     version: 'A', 
//     date: '2024-03-15',
//     description: 'A standard template with sections and components',
//     templateSections: [
//       {
//         id: 1,
//         section: 'Header',
//         type: 'Section',
//         heading: 'Document Header',
//         component: {
//           title: { type: 'text', content: 'Document Title' },
//           subtitle: { type: 'text', content: 'Document Subtitle' },
//           date: { type: 'input', label: 'Document Date' },
//           author: { type: 'input', label: 'Author Name' }
//         }
//       },
//       {
//         id: 2,
//         section: 'Main Content',
//         type: 'Group',
//         heading: 'Main Content Group',
//         sections: [
//           {
//             id: 3,
//             section: 'Introduction',
//             type: 'Component',
//             heading: 'Introduction Component',
//             component: {
//               text: { type: 'text', content: 'Welcome to this document' },
//               description: { type: 'text', content: 'This is a detailed introduction section' },
//               input: { type: 'input', label: 'Additional Notes' },
//               button: { type: 'button', label: 'Save Notes' }
//             }
//           },
//           {
//             id: 4,
//             section: 'Details',
//             type: 'Component',
//             heading: 'Details Component',
//             component: {
//               table: {
//                 type: 'table',
//                 columns: ['Item', 'Description', 'Status'],
//                 data: [
//                   ['Item 1', 'Description 1', 'Active'],
//                   ['Item 2', 'Description 2', 'Pending']
//                 ]
//               },
//               notes: { type: 'text', content: 'Additional details can be added here' }
//             }
//           }
//         ]
//       }
//     ]
//   },
//   { 
//     templateId: 'TEMP-002', 
//     templateName: 'Report Template', 
//     version: '2.1', 
//     date: '2024-03-20',
//     description: 'Comprehensive report template with nested groups',
//     templateSections: [
//       {
//         id: 1,
//         section: 'Executive Summary',
//         type: 'Section',
//         heading: 'Executive Summary Section',
//         component: {
//           summary: { type: 'text', content: 'Executive Summary of the Report' },
//           keyPoints: { type: 'text', content: 'Key points to be highlighted' },
//           date: { type: 'input', label: 'Report Date' },
//           status: { type: 'input', label: 'Report Status' }
//         }
//       },
//       {
//         id: 2,
//         section: 'Report Body',
//         type: 'Group',
//         heading: 'Report Body Group',
//         sections: [
//           {
//             id: 3,
//             section: 'Findings',
//             type: 'Component',
//             heading: 'Findings Component',
//             component: {
//               table: {
//                 type: 'table',
//                 columns: ['Finding', 'Impact', 'Priority'],
//                 data: [
//                   ['Finding 1', 'High', 'Critical'],
//                   ['Finding 2', 'Medium', 'Important']
//                 ]
//               },
//               notes: { type: 'text', content: 'Additional findings notes' }
//             }
//           },
//           {
//             id: 4,
//             section: 'Analysis',
//             type: 'Component',
//             heading: 'Analysis Component',
//             component: {
//               text: { type: 'text', content: 'Detailed analysis of findings' },
//               input: { type: 'input', label: 'Analysis Notes' },
//               button: { type: 'button', label: 'Update Analysis' }
//             }
//           }
//         ]
//       }
//     ]
//   },
//   { 
//     templateId: 'TEMP-003', 
//     templateName: 'Project Template', 
//     version: '1.2', 
//     date: '2024-03-25',
//     description: 'Project documentation template',
//     templateSections: [
//       {
//         id: 1,
//         section: 'Project Overview',
//         type: 'Section',
//         heading: 'Project Overview Section',
//         component: {
//           title: { type: 'text', content: 'Project Title' },
//           description: { type: 'text', content: 'Project Description' },
//           startDate: { type: 'input', label: 'Start Date' },
//           endDate: { type: 'input', label: 'End Date' }
//         }
//       },
//       {
//         id: 2,
//         section: 'Project Details',
//         type: 'Group',
//         heading: 'Project Details Group',
//         sections: [
//           {
//             id: 3,
//             section: 'Objectives',
//             type: 'Component',
//             heading: 'Objectives Component',
//             component: {
//               table: {
//                 type: 'table',
//                 columns: ['Objective', 'Status', 'Due Date'],
//                 data: [
//                   ['Objective 1', 'In Progress', '2024-04-01'],
//                   ['Objective 2', 'Not Started', '2024-04-15']
//                 ]
//               },
//               notes: { type: 'text', content: 'Additional objective details' }
//             }
//           },
//           {
//             id: 4,
//             section: 'Timeline',
//             type: 'Component',
//             heading: 'Timeline Component',
//             component: {
//               text: { type: 'text', content: 'Project Timeline Overview' },
//               input: { type: 'input', label: 'Timeline Notes' },
//               button: { type: 'button', label: 'Update Timeline' }
//             }
//           }
//         ]
//       }
//     ]
//   },
// ];

// const tableColumns = [
//   {
//     title: 'Template Name',
//     dataIndex: 'templateLabel',
//     key: 'templateLabel',
//   },
//   {
//     title: 'Template Version',
//     dataIndex: 'templateVersion',
//     key: 'templateVersion',
//   },
//   {
//     title: 'Currect Version',
//     dataIndex: 'currentVersion',
//     key: 'currentVersion',
//   }
// ];

const TemplateBuilderMain: React.FC = () => {
  const cookies = parseCookies();
  const { isAuthenticated, token } = useAuth();
  // const [filteredData, setFilteredData] = useState<any[]>(dummyTableData);
  const [filteredData, setFilteredData] = useState<any[]>([]);
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
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState<any>(null);
  const [isFromTableClick, setIsFromTableClick] = useState<boolean>(false);
  const [rowData, setRowData] = useState<any>(null);
  const [itemData, setItemData] = useState<any>([]);
  const [ItemVisible, setItemVisible] = useState(false);

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
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const response = await getTop50Templates(site);
        setFilteredData(response);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };
    fetchResourceData();
  }, [isAuthenticated, username, call]);

  const handleAddClick = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  const handleRowSelect = async (row: any) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    const payload = {
      site: site,
      userId: userId,
      templateLabel: row.templateLabel,
      templateVersion: row.templateVersion,
      currentVersion: row.currentVersion,
    }

    try {
      const response = await retrieveTemplates(payload);
      setIsFromTableClick(true);
      setShowEditor(true);
      setRowData(response);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const payload = {
      site: site,
      templateLabel: searchTerm || '',
    }

    try {
      const AllTemplateList = await getAllTemplates(payload);
      setFilteredData(AllTemplateList);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleAddTemplate = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    try {
      const values = await form.validateFields();
      // Prepare payload for API call
      const payload = {
        site: site,
        userId: userId,
        templateLabel: values.name,
        templateVersion: values.version || 'A',
        currentVersion: values.currentVersion,
        templateType: values.templateType,
        groupIds: [],
      };

      const response = await createTemplate(payload);
      if (response.message_details) {
        message.success(response.message_details.msg)
        form.resetFields();
        setIsAddModalVisible(false);
        setCall(call + 1);
      } else {
        console.error('Failed to create template:', response.error);
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const buttonLayout = {
    wrapperCol: { offset: 9, span: 24 },
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, "");

    const patterns: { [key: string]: RegExp } = {
      item: /^[A-Z0-9_\-\(\)]*$/,
    };

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
    }
  };

  const handleCancel = () => {
    setItemVisible(false);
  };

  const handleItemClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('item');
    const newValue = { item: typedValue };

    try {
      let response = typedValue ? await fetchAllMaterial(site, newValue) : await fetchTop50Material(site);
      if (response && !response.errorCode) {
        const formattedData = response.itemList.map((item: any, index: number) => ({ id: index, ...item }));
        setItemData(formattedData);
      } else {
        setItemData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }
    setItemVisible(true);
  };

  const handleItemOk = (selectedRow: any) => {
    if (selectedRow) {
      form.setFieldsValue({ productGroup: selectedRow.item });
    }
    setItemVisible(false);
  };

  const ItemColumn = [
    { title: t("item"), dataIndex: "item", key: "item" },
    { title: t("revision"), dataIndex: "revision", key: "revision" },
    { title: t("description"), dataIndex: "description", key: "description" },
    { title: t("status"), dataIndex: "status", key: "status" },
  ];

  // Direct conditional rendering
  if (showEditor) {
    return (
      <TemplateBuilderContext.Provider value={{ call, setCall, setShowEditor, setIsFromTableClick }}>
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
            rowData={rowData}
            isNewTemplate={!isFromTableClick || (editorData && Object.keys(editorData).length === 0)}
          />
        </div>
      </TemplateBuilderContext.Provider>
    );
  }

  return (
    <TemplateBuilderContext.Provider value={{ call, setCall, setShowEditor, setIsFromTableClick }}>
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
                handleSearchClicks={handleSearchClick}
                setFilteredData={setFilteredData}
                button={
                  <InstructionModal title="Template Creator">
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("Templates")}({filteredData ? filteredData.length : 0})
                </Typography>
                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable
                data={filteredData || []}
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
                    initialValue="A"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="templateType"
                    label={t('Template Type')}
                  >
                    <Select
                      options={[
                        { value: "MFR", text: "MFR" },
                        { value: "BMR", text: "BMR" },
                        { value: "BPR", text: "BPR" },
                      ]}
                      placeholder={t('Select Template Type')}
                    />
                  </Form.Item>

                  {/* <Form.Item
                    name="productGroup"
                    label={t('Product Group')}
                  >
                    <Input
                      autoComplete='off'
                      suffix={<GrChapterAdd onClick={() => {
                        handleItemClick();
                      }} />}
                      onChange={(e) => handleInputChange(e, 'productGroup')}
                    />
                  </Form.Item> */}

                  <Form.Item
                    name="currentVersion"
                    label={t('Current Version')}
                  >
                    <Switch />
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
              <Modal title={t("selectItem")} open={ItemVisible} onCancel={handleCancel} width={800} footer={null}>
                <Table
                  style={{ overflow: 'auto' }}
                  onRow={(record) => ({ onDoubleClick: () => handleItemOk(record) })}
                  columns={ItemColumn}
                  dataSource={itemData}
                  rowKey="item"
                  pagination={false}
                  scroll={{ y: 'calc(100vh - 350px)' }}
                />
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </TemplateBuilderContext.Provider>
  );
};

export default TemplateBuilderMain;

