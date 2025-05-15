'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '@modules/documentCreator/styles/DocumentCreator.module.css';
import DocumentCreatorTable from './DocumentCreatorTable';
import DocumentCreatorBar from './DocumentCreatorBar';
import { useAuth } from '@context/AuthContext';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { Typography, Modal, Select, Form, Input, Table, message, Button, Tabs } from 'antd';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import ViewListIcon from '@mui/icons-material/ViewList';
import BuilderForm from '../builderComponents/BuilderForm';
import BuilderTable from '../builderComponents/BuilderTable';
import BuilderTableWithForm from '../builderComponents/BuilderTableWithForm';
import DotList from '../builderComponents/DotList';
import BuilderSection from '../builderComponents/BuilderSection';
import FlowView from '../builderComponents/FlowView';
import TreeTable from '../builderComponents/TreeTable';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonAppBar from '@components/CommonAppBar';
import { decryptToken } from '@utils/encryption';
import { DecodedToken } from '@modules/changeEquipmentStatus/types/changeEquipmentType';
import jwtDecode from 'jwt-decode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DocumentPreview from '../builderComponents/DocumentPreview';

interface MetaDataField {
  dataIndex: string;
  title: string;
  required?: boolean;
  type?: string;
}

interface ComponentConfig {
  title: string;
  type: 'form' | 'table' | 'tableWithForm' | 'list' | 'section' | 'flowChart' | 'treeTable' | 'dotList';
  metaData?: MetaDataField[];
  data?: any[];
  style?: any;
}

interface TemplateComponent {
  id: string;
  type: string;
  config: ComponentConfig;
}

interface Template {
  id: string;
  title: string;
  description: string;
  type: string;
  components: {
    header: TemplateComponent[];
    footer: TemplateComponent[];
    main: TemplateComponent[];
  };
}

// Add dummy product data
const dummyProducts = [
  { id: 'P1', name: 'Face Cream' },
  { id: 'P2', name: 'Body Lotion' },
  { id: 'P3', name: 'Hair Serum' },
  { id: 'P4', name: 'Skin Moisturizer' }
];

const DocumentCreator: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateslist, setTemplateslist] = useState<any[]>([]);
  const [isTemplate, setIsTemplate] = useState([]);
  const { isAuthenticated, token } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeComponent, setActiveComponent] = useState<TemplateComponent | null>(null);
  const { t } = useTranslation();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>(null);
  const [mfrNo, setMfrNo] = useState<string>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('header');
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState<boolean>(false);
  const [bmrNumber, setBmrNumber] = useState('');
  const [batchSize, setBatchSize] = useState('');
  const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
  const [copyBmrNumber, setCopyBmrNumber] = useState('');
  const [copyBatchSize, setCopyBatchSize] = useState('');


  useEffect(() => {
    const fetchResourceData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };

    fetchResourceData();
  }, [isAuthenticated, username]);

  useEffect(() => {
    // Get templates from localStorage
    const storedTemplates = localStorage.getItem('templates');
    const storedTemplateslist = localStorage.getItem('documentList');
    const storedDocumentsList = localStorage.getItem('bmrList');
    debugger
    if (storedTemplates) {
      const parsedTemplates = JSON.parse(storedTemplates);
      setTemplates(parsedTemplates);
    }
    if (storedTemplateslist) {
      const parsedTemplateslist = JSON.parse(storedTemplateslist);
      setTemplateslist(parsedTemplateslist);
    }
    if (storedDocumentsList) {
      const parsedDocumentsList = JSON.parse(storedDocumentsList);
      setIsTemplate(parsedDocumentsList);
    }

    // Load existing document list
    const storedDocuments = localStorage.getItem('bmrList');
    if (storedDocuments) {
      setFilteredData(JSON.parse(storedDocuments));
    }
  }, []);

  useEffect(() => {
    // Setup intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const componentId = entry.target.id.replace('component-', '');
            const component = selectedDocument?.template?.components?.main.find(
              (c) => c.id === componentId
            );
            if (component) {
              setActiveComponent(component);
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of component is visible
        rootMargin: '-10% 0px -10% 0px' // Add some margin to make transition smoother
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [selectedDocument]);

  // Observe components when they're rendered
  useEffect(() => {
    if (selectedDocument?.template?.components?.main) {
      // First disconnect any existing observations
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Then observe all component elements
      selectedDocument.template.components.main.forEach((component) => {
        const element = document.getElementById(`component-${component.id}`);
        if (element && observerRef.current) {
          observerRef.current.observe(element);
        }
      });
    }
  }, [selectedDocument, isPanelVisible]);

  const handleAddClick = () => {
    setIsModalVisible(true);
  };

  const getBMRTemplates = () => {
    // Filter templates to only show MFR type templates
    return templates.filter(template => template.type === 'BMR').map(template => ({
      id: template.id,
      title: template.title
    }));
  };

  const generateMFRNo = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const newMFRNo = `BMR-${timestamp}-${random}`;
    setBmrNumber(newMFRNo);
  };

  const handleModalOk = () => {
    if (selectedTemplate && selectedProduct && mfrNo) {
      const selectedTemplateData = templates.find(temp => temp.title === selectedTemplate);
      if (selectedTemplateData) {
        // Create new document list item with additional fields
        const newDocument: any = {
          id: Date.now().toString(),
          title: selectedTemplateData.title,
          type: selectedTemplateData.type,
          productName: dummyProducts.find(p => p.id === selectedProduct)?.name || '',
          mfrNo: mfrNo,
          createdDate: new Date().toISOString(),
          status: 'Draft'
        };

        // Update state and localStorage
        const updatedDocuments = [...filteredData, newDocument];
        setFilteredData(updatedDocuments);
        localStorage.setItem('bmrList', JSON.stringify(updatedDocuments));
        setIsModalVisible(false);
        setSelectedTemplate('');
        setSelectedProduct('');
        setMfrNo('');
        message.success('Document added successfully');
      }
    } else {
      message.error('Please fill in all required fields');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedTemplate('');
    setSelectedProduct('');
    setMfrNo('');
    setBmrNumber('');
    setBatchSize('');
  };

  const handleSearchClick = async (searchTerm: string) => {
    if (searchTerm) {
      const documents = localStorage.getItem('bmrList');
      if (documents) {
        const parsedDocs = JSON.parse(documents);
        const filtered = parsedDocs.filter((doc: any) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
      }
    } else {
      // If no search term, show all documents
      const documents = localStorage.getItem('bmrList');
      if (documents) {
        setFilteredData(JSON.parse(documents));
      }
    }
  };

  const handleTop50 = async () => {
    const documents = localStorage.getItem('bmrList');
    if (documents) {
      const parsedDocs = JSON.parse(documents);
      setFilteredData(parsedDocs.slice(0, 50));
    }
  };

  const handleRowSelect = (row: any) => {
    const selectedTemplateData = templates.find(temp => temp.title === row.title);
    setSelectedDocument({ ...row, template: selectedTemplateData });

    // Set header as the default active component if available
    if (selectedTemplateData?.components?.header && selectedTemplateData.components.header.length > 0) {
      setActiveComponent(selectedTemplateData.components.header[0]);
    }

    setIsPanelVisible(true);
  };

  const handlePanelClose = () => {
    setIsPanelVisible(false);
    setSelectedDocument(null);
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'productdetails':
        return <DescriptionIcon />;
      case 'billofmaterial':
      case 'activecomposition':
        return <ListAltIcon />;
      default:
        return <ViewListIcon />;
    }
  };

  const handleComponentClick = (component: TemplateComponent, section: 'header' | 'main' | 'footer') => {
    const element = document.getElementById(`component-${component.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setActiveComponent(component);
    setActiveTab(section);
  };

  const renderComponent = (component: TemplateComponent) => {
    if (!component.config) return null;

    const commonProps = {
      isEditable: true,
      props: {
        title: component.config.title,
        type: component.config.type,
        metaData: component.config.metaData,
        data: component.config.data || [],
        style: component.config.style || {
          heading: { titleAlign: 'left' },
          form: { column: 1 }
        },
        componentId: component.id
      }
    };

    switch (component.config.type) {
      case 'form':
        return (
          <div
            id={`component-${component.id}`}
            className={`${styles.formSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
          >
            <BuilderForm {...commonProps} />
          </div>
        );
      case 'table':
        return (
          <div
            id={`component-${component.id}`}
            className={`${styles.tableSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
          >
            <BuilderTable {...commonProps} />
          </div>
        );
      case 'tableWithForm':
        return (
          <div
            id={`component-${component.id}`}
            className={`${styles.tableSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
          >
            <BuilderTableWithForm {...commonProps} />
          </div>
        );
      case 'list':
      case 'dotList':
        return (
          <div
            id={`component-${component.id}`}
            className={`${styles.listSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
          >
            <DotList {...commonProps} />
          </div>
        );
      case 'section':
        return (
          <div
            id={`component-${component.id}`}
            className={`${styles.sectionComponent} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
          >
            <BuilderSection {...commonProps} />
          </div>
        );
      case 'flowChart':
        return (
          <div
            id={`component-${component.id}`}
            className={`${styles.flowChartSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
          >
            <FlowView {...commonProps} />
          </div>
        );
      case 'treeTable':
        return (
          <div
            id={`component-${component.id}`}
            className={`${styles.treeTableSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
          >
            <TreeTable {...commonProps} />
          </div>
        );
      default:
        return null;
    }
  };

  const handleDeleteTemplate = () => {
    Modal.confirm({
      title: t('Confirm Delete'),
      content: t('Are you sure you want to delete this product group?'),
      okText: t('Delete'),
      okType: 'danger',
      cancelText: t('Cancel'),
      onOk: () => {
        // Remove from documents list
        const updatedDocuments = filteredData.filter(doc => doc.id !== selectedDocument.id);
        setFilteredData(updatedDocuments);
        localStorage.setItem('bmrList', JSON.stringify(updatedDocuments));

        // Close panel and reset selection
        setIsPanelVisible(false);
        setSelectedDocument(null);
        setActiveComponent(null);

        message.success('Template deleted successfully');
      }
    });
  };

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

  const handleExportTemplate = () => {
    setIsPreviewModalVisible(true);
  };

  const handlePreviewModalClose = () => {
    setIsPreviewModalVisible(false);
  };

  const handleDownloadComplete = () => {
    message.success(t('PDF downloaded successfully'));
    handlePreviewModalClose();
  };

  const handleCopyClick = () => {
    setIsCopyModalVisible(true);
    // Generate a new BMR number for the copy
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const newBMRNo = `BMR-${timestamp}-${random}`;
    setCopyBmrNumber(newBMRNo);
    setCopyBatchSize(''); // Reset batch size for new copy
  };

  const handleCopyModalOk = () => {
    if (copyBmrNumber && copyBatchSize) {
      // Create a copy of the selected document with new BMR and batch size
      const documentCopy = {
        ...selectedDocument,
        id: Date.now().toString(),
        mfrNo: copyBmrNumber,
        batchSize: copyBatchSize,
        createdDate: new Date().toISOString(),
        status: 'Draft'
      };

      // Update state and localStorage
      const updatedDocuments = [...filteredData, documentCopy];
      setFilteredData(updatedDocuments);
      localStorage.setItem('bmrList', JSON.stringify(updatedDocuments));
      
      setIsCopyModalVisible(false);
      message.success('Template copied successfully');
    } else {
      message.error('Please fill in all required fields');
    }
  };

  const handleCopyModalCancel = () => {
    setIsCopyModalVisible(false);
    setCopyBmrNumber('');
    setCopyBatchSize('');
  };

  return (
    <div>
      <div className={`${styles.dataFieldNav} ${isPanelVisible ? styles.shrink : ''}`}>
        <CommonAppBar
          onSearchChange={() => { }}
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("BMR Creation")} onSiteChange={handleSiteChange} />
      </div>
      <div className={styles.container}>
        {/* Sliding Panel */}
        <div className={`${styles.slidingPanel} ${isPanelVisible ? styles.visible : ''}`}>
          <div className={styles.slidingPanelHeader}>
            <h2 className={styles.slidingPanelTitle}>
              {selectedDocument?.title || t('Batch Manufacturing Record')}
            </h2>
            <div className={styles.headerButtons}>
              <button
                className={styles.deleteButton}
                onClick={handleCopyClick}
                title={t('Copy Template')}
              >
                <ContentCopyIcon />
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleExportTemplate}
                title={t('Export Template')}
              >
                <PictureAsPdfIcon />
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteTemplate}
                title={t('Delete Template')}
              >
                <DeleteIcon />
              </button>
              <button className={styles.closeButton} onClick={handlePanelClose}>
                <CloseIcon />
              </button>
            </div>
          </div>
          {selectedDocument && (
            <div className={styles.slidingPanelContent}>
              <div className={styles.tabsContainer}>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: 'header',
                      label: t('Header'),
                      children: (
                        <div className={styles.componentSection}>
                          {selectedDocument.template?.components?.header?.map((item: TemplateComponent, index: number) => (
                            <div
                              key={item.id || index}
                              className={`${styles.typeItem} ${activeComponent?.id === item.id ? styles.active : ''}`}
                              onClick={() => handleComponentClick(item, 'header')}
                            >
                              <div className={styles.typeIcon}>
                                {getIconForType(item.type)}
                              </div>
                              <span className={styles.typeText}>{item.config.title}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: 'main',
                      label: t('Main'),
                      children: (
                        <div className={styles.componentSection}>
                          {selectedDocument.template?.components?.main?.map((item: TemplateComponent, index: number) => (
                            <div
                              key={item.id || index}
                              className={`${styles.typeItem} ${activeComponent?.id === item.id ? styles.active : ''}`}
                              onClick={() => handleComponentClick(item, 'main')}
                            >
                              <div className={styles.typeIcon}>
                                {getIconForType(item.type)}
                              </div>
                              <span className={styles.typeText}>{item.config.title}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: 'footer',
                      label: t('Footer'),
                      children: (
                        <div className={styles.componentSection}>
                          {selectedDocument.template?.components?.footer?.map((item: TemplateComponent, index: number) => (
                            <div
                              key={item.id || index}
                              className={`${styles.typeItem} ${activeComponent?.id === item.id ? styles.active : ''}`}
                              onClick={() => handleComponentClick(item, 'footer')}
                            >
                              <div className={styles.typeIcon}>
                                {getIconForType(item.type)}
                              </div>
                              <span className={styles.typeText}>{item.config.title}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className={`${styles.mainContent} ${isPanelVisible ? styles.shrink : ''}`}>
          {!selectedDocument ? (
            <>
              <DocumentCreatorBar handleSearchClicks={handleSearchClick} handleTop50={handleTop50} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("BMR Document Creater")}({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <DocumentCreatorTable data={filteredData} onRowSelect={handleRowSelect} />
            </>
          ) : (
            <div className={styles.documentContainer}>
              <div className={styles.componentsContainer}>
                {/* Header Components */}
                <div className={styles.sectionContainer} data-section-title={t('Header')}>
                  {selectedDocument.template?.components?.header?.map((component: TemplateComponent) => (
                    <div key={component.id} className={styles.componentWrapper}>
                      {renderComponent(component)}
                    </div>
                  ))}
                </div>

                {/* Main Components */}
                <div className={styles.sectionContainer} data-section-title={t('Main')}>
                  {selectedDocument.template?.components?.main?.map((component: TemplateComponent) => (
                    <div key={component.id} className={styles.componentWrapper}>
                      {renderComponent(component)}
                    </div>
                  ))}
                </div>

                {/* Footer Components */}
                <div className={styles.sectionContainer} data-section-title={t('Footer')}>
                  {selectedDocument.template?.components?.footer?.map((component: TemplateComponent) => (
                    <div key={component.id} className={styles.componentWrapper}>
                      {renderComponent(component)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        <Modal
          title={t("Document Preview")}
          open={isPreviewModalVisible}
          onCancel={handlePreviewModalClose}
          footer={[
            <Button key="close" onClick={handlePreviewModalClose}>
              {t("Close")}
            </Button>,
            <Button
              key="download"
              type="primary"
              // icon={<PictureAsPdfIcon />}
              onClick={() => {
                const previewComponent = document.querySelector('[data-page]');
                if (previewComponent) {
                  const event = new MouseEvent('downloadPDF', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                  });
                  previewComponent.dispatchEvent(event);
                }
              }}
            >
              {t("Download PDF")}
            </Button>
          ]}
          width={800}
        >
          <DocumentPreview
            data={{
              components: {
                header: selectedDocument?.template?.components?.header || [],
                main: selectedDocument?.template?.components?.main || [],
                footer: selectedDocument?.template?.components?.footer || []
              }
            }}
            onDownload={handleDownloadComplete}
          />
        </Modal>

        {/* Keep modal code unchanged */}
        <Modal
          title={t("BMR Document")}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={t("ok")}
          cancelText={t("cancel")}
          width={500}
        >



          <Form layout="horizontal" wrapperCol={{ span: 24 }} labelCol={{ span: 8 }}>
            <Form.Item
              label={t("Product Code")}
              required
              rules={[{ required: true, message: 'Please select a Product Group' }]}
            >
              <Select
                placeholder={t("Select a Product Code")}
                value={selectedProduct}
                onChange={(value) => setSelectedProduct(value)}
                style={{ width: '100%' }}
              >
                {dummyProducts.map((product) => (
                  <Select.Option key={product.id} value={product.id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={t("MFR No")}
              required
              rules={[{ required: true, message: 'Please enter MFR' }]}
            >
              <Select
                showSearch
                placeholder={t("Select a MFR")}
                value={mfrNo}
                onChange={(value) => { setMfrNo(value) }}
                style={{ width: '100%' }}
              >
                {templateslist.map((template) => (
                  <Select.Option key={template.id} value={template.mfrNo}>
                    {template.mfrNo}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={t("BMR Template")}
              required
            >
              <Select
                placeholder={t("Select a Template")}
                value={selectedTemplate}
                onChange={(value) => setSelectedTemplate(value)}
                style={{ width: '100%' }}
              >
                {getBMRTemplates().map((template) => (
                  <Select.Option key={template.id} value={template.title}>
                    {template.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={t("BMR Number")}
              required
              rules={[{ required: true, message: 'Please enter BMR number' }]}
            >
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 100px)' }}
                  value={bmrNumber}
                  onChange={(e) => setBmrNumber(e.target.value)}
                  placeholder="BMR Number"
                />
                <Button
                  type="primary"
                  onClick={generateMFRNo}
                  style={{ width: '100px' }}
                >
                  Generate
                </Button>
              </Input.Group>
            </Form.Item>


            <Form.Item
              label={t("Batchsize")}
              required
              rules={[{ required: true, message: 'Please select a Product Group' }]}
            >
              <Input value={batchSize} onChange={(e) => setBatchSize(e.target.value)} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Copy Template Modal */}
        <Modal
          title={t("Copy Template")}
          open={isCopyModalVisible}
          onOk={handleCopyModalOk}
          onCancel={handleCopyModalCancel}
          okText={t("Copy")}
          cancelText={t("Cancel")}
          width={500}
        >
          <Form layout="horizontal" wrapperCol={{ span: 24 }} labelCol={{ span: 8 }}>
            <Form.Item
              label={t("BMR Number")}
              required
              rules={[{ required: true, message: 'Please enter BMR number' }]}
            >
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 100px)' }}
                  value={copyBmrNumber}
                  onChange={(e) => setCopyBmrNumber(e.target.value)}
                  placeholder="BMR Number"
                />
                <Button
                  type="primary"
                  onClick={() => {
                    const timestamp = new Date().getTime();
                    const random = Math.floor(Math.random() * 1000);
                    const newBMRNo = `BMR-${timestamp}-${random}`;
                    setCopyBmrNumber(newBMRNo);
                  }}
                  style={{ width: '100px' }}
                >
                  Generate
                </Button>
              </Input.Group>
            </Form.Item>

            <Form.Item
              label={t("Batch Size")}
              required
              rules={[{ required: true, message: 'Please enter batch size' }]}
            >
              <Input 
                value={copyBatchSize} 
                onChange={(e) => setCopyBatchSize(e.target.value)}
                placeholder="Enter batch size"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default DocumentCreator; 