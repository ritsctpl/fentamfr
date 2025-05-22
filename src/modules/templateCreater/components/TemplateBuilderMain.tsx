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
import { fetchAllItemGroup, fetchTop50ItemGroup } from '@services/workInstructionService';
import { GrChapterAdd } from 'react-icons/gr';

const TemplateBuilderMain: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState<any>(null);
  const [isFromTableClick, setIsFromTableClick] = useState<boolean>(false);
  const [rowData, setRowData] = useState<any>(null);
  const [itemGroupData, setItemGroupData] = useState<any>([]);
  const [ItemGroupVisible, setItemGroupVisible] = useState(false);

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
      const payload = {
        site: site,
        userId: userId,
        templateLabel: values.name,
        templateVersion: values.version || 'A',
        currentVersion: values.currentVersion,
        templateType: values.templateType,
        productGroup: values.productGroup,
        groupIds: [],
      };

      const response = await createTemplate(payload);
      if (response.message_details) {
        message.destroy();
        message.success(response.message_details.msg)
        form.resetFields();
        setIsAddModalVisible(false);
        setCall(call + 1);
      } else {
        message.destroy();
        message.error('Failed to create template');
        console.error('Failed to create template:', response.error);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      message.destroy();
      message.error('Error creating template');
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
      productGroup: /^[A-Z0-9_\-\(\)]*$/,
    };

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
    }
  };

  const handleCancel = () => {
    setItemGroupVisible(false);
  };

  const handleProductGroupClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('productGroup');
    const newValue = { itemGroup: typedValue };

    try {
      let response = typedValue ? await fetchAllItemGroup(site, newValue) : await fetchTop50ItemGroup(site);
      if (response && !response.errorCode) {
        const formattedData = response.groupNameList.map((item: any, index: number) => ({ id: index, ...item }));
        setItemGroupData(formattedData);
      } else {
        setItemGroupData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }
    setItemGroupVisible(true);
  };

  const handleItemGroupOk = (selectedRow: any) => {
    console.log(selectedRow,'selectedRow');
    
    if (selectedRow) {
      form.setFieldsValue({ productGroup: selectedRow.itemGroup });
      message.destroy();
      message.success('Product group selected');
    }
    setItemGroupVisible(false);
  };

  const ItemGroupColumn = [
    { title: t("itemGroup"), dataIndex: "itemGroup", key: "itemGroup" },
    { title: t("groupDescription"), dataIndex: "groupDescription", key: "groupDescription" },
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
            <div className={styles.commonTableContainer}>
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

                  <Form.Item
                    name="productGroup"
                    label={t('Product Group')}
                  >
                    <Input
                      autoComplete='off'
                      suffix={<GrChapterAdd onClick={() => {
                        handleProductGroupClick();
                      }} />}
                      onChange={(e) => handleInputChange(e, 'productGroup')}
                    />
                  </Form.Item>

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
              <Modal title={t("selectItemGroup")} open={ItemGroupVisible} onCancel={handleCancel} width={800} footer={null}>
                <Table
                  style={{ overflow: 'auto' }}
                  onRow={(record) => ({ onDoubleClick: () => handleItemGroupOk(record) })}
                  columns={ItemGroupColumn}
                  dataSource={itemGroupData}
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

