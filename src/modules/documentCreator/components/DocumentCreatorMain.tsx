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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DocumentPreview from '../builderComponents/DocumentPreview';
import { CiViewList, CiViewTable } from 'react-icons/ci';
import { RxSection } from "react-icons/rx";
import { TiFlowChildren } from 'react-icons/ti';
import { FaWpforms } from 'react-icons/fa6';

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

// Add dummy product codes
const dummyProductCodes = [
  { id: 'PC1', name: 'Skincare' },
  { id: 'PC2', name: 'Haircare' },
  { id: 'PC3', name: 'Bodycare' },
  { id: 'PC4', name: 'Cosmetics' }
];

const DocumentCreator: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const { isAuthenticated, token } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeComponent, setActiveComponent] = useState<TemplateComponent | null>(null);
  const { t } = useTranslation();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [mfrNo, setMfrNo] = useState<string>('');
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('header');
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<'master' | 'child'>('master');
  const [selectedMFR, setSelectedMFR] = useState<string>('');
  const [mfrVersion, setMfrVersion] = useState<string>('');
  const [batchSize, setBatchSize] = useState<number>();
  const [versionKey, setVersionKey] = useState<string>('');
  const [selectedMasterTemplate, setSelectedMasterTemplate] = useState<any>(null);
  const [version, setVersion] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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
    if (storedTemplates) {
      const parsedTemplates = JSON.parse(storedTemplates);
      setTemplates(parsedTemplates);
    }

    // Load existing document list
    const storedDocuments = localStorage.getItem('documentList');
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

  const generateMFRNo = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const newMFRNo = `MFR-${timestamp}-${random}`;
    setMfrNo(newMFRNo);
  };

  // Add dummy product groups
  const dummyProductGroups = [
    { id: 'PG1', name: 'Skincare' },
    { id: 'PG2', name: 'Haircare' },
    { id: 'PG3', name: 'Bodycare' },
    { id: 'PG4', name: 'Cosmetics' }
  ];

  // Function to get all MFRs from table data
  const getAvailableMFRs = () => {
    return filteredData.map(doc => ({
      id: doc.mfrNo,
      version: doc.version || '',
      productName: doc.productName
    }));
  };

  // Handle MFR selection
  const handleMFRChange = (value: string) => {
    setSelectedMFR(value);
    const selectedDoc = filteredData.find(doc => doc.mfrNo === value);
    if (selectedDoc) {
      setMfrVersion(selectedDoc.version || '');
      // If it's a child document, also set the product name and template from parent
      if (documentType === 'child') {
        setSelectedProduct(selectedDoc.productName);
        setSelectedMasterTemplate(selectedDoc.template);
        // Get the template data from localStorage
        const templatesStr = localStorage.getItem('templates');
        if (templatesStr) {
          const templates = JSON.parse(templatesStr);
          const masterTemplate = templates.find((t: any) => t.title === selectedDoc.template);
          if (masterTemplate) {
            setSelectedMasterTemplate(masterTemplate);
          }
        }
      }
    }
  };

  const handleModalOk = () => {
    if (documentType === 'master') {
      // Validation for master document
      if (!selectedProduct || !selectedTemplate || !batchSize || !version || !mfrNo) {
        message.error('Please fill in all required fields');
        return;
      }
    } else {
      // Validation for child document
      if (!selectedMFR || !mfrNo) {
        message.error('Please fill in all required fields');
        return;
      }
    }

    // Get existing documents from localStorage or initialize empty array
    const existingDocuments = JSON.parse(localStorage.getItem('documentList') || '[]');

    // Find the current template data
    const currentTemplate = documentType === 'master' ?
      templates.find(temp => temp.id === selectedTemplate) :
      selectedMasterTemplate;

    if ((documentType === 'master' && currentTemplate) ||
      (documentType === 'child' && selectedMasterTemplate)) {
      const newDocument = {
        id: Date.now().toString(),
        template: documentType === 'master' ? currentTemplate.title : selectedMasterTemplate.title,
        type: documentType,
        productName: documentType === 'master'
          ? dummyProductGroups.find(p => p.id === selectedProduct)?.name || ''
          : filteredData.find(d => d.mfrNo === selectedMFR)?.productName || '',
        mfrNo: mfrNo,
        createdDate: new Date().toISOString(),
        status: 'Draft',
        version: version,
        batchSize: documentType === 'master' ? batchSize : undefined,
        versionKey: documentType === 'master' ? versionKey : undefined,
        parentMFRId: documentType === 'child' ? selectedMFR : null,
        // Always use the current template's components
        components: documentType === 'child' ?
          selectedMasterTemplate.components :
          currentTemplate.components
      };

      // Add new document to existing documents
      const updatedDocuments = [...existingDocuments, newDocument];

      // Save to localStorage
      localStorage.setItem('documentList', JSON.stringify(updatedDocuments));

      // Update state
      setFilteredData(updatedDocuments);
      setIsModalVisible(false);
      resetModalFields();
      message.success('Document created successfully');
    } else {
      message.error(documentType === 'master' ? 'Template not found' : 'Master template not found');
    }
  };

  const resetModalFields = () => {
    setDocumentType('master');
    setSelectedProduct('');
    setSelectedTemplate('');
    setMfrNo('');
    setSelectedMFR('');
    setBatchSize(undefined);
    setVersionKey('');
    setMfrVersion('');
    setVersion('');
    setSelectedMasterTemplate(null);
    setSelectedCategory('');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    resetModalFields();
  };

  const handleSearchClick = async (searchTerm: string) => {
    if (searchTerm) {
      const documents = localStorage.getItem('documentList');
      if (documents) {
        const parsedDocs = JSON.parse(documents);
        const filtered = parsedDocs.filter((doc: any) =>
          doc.mfrNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
      }
    } else {
      // If no search term, show all documents
      const documents = localStorage.getItem('documentList');
      if (documents) {
        setFilteredData(JSON.parse(documents));
      }
    }
  };

  const handleTop50 = async () => {
    const documents = localStorage.getItem('documentList');
    if (documents) {
      const parsedDocs = JSON.parse(documents);
      setFilteredData(parsedDocs);
    }
  };

  // const handleRowSelect = (row: any) => {
  //   console.log(row,'row');

  //   const selectedTemplateData = templates.find(temp => temp.title === row.title);
  //   setSelectedDocument({ ...row, template: selectedTemplateData });

  //   // Set header as the default active component if available
  //   if (selectedTemplateData?.components?.header && selectedTemplateData.components.header.length > 0) {
  //     setActiveComponent(selectedTemplateData.components.header[0]);
  //   }

  //   setIsPanelVisible(true);
  // };

  const handlePanelClose = () => {
    setIsPanelVisible(false);
    setSelectedDocument(null);
  };

  const handleRowSelect = (row: any) => {
    console.log(row, 'row');

    // Find the current template that matches the selected document's template name
    const currentTemplate = templates.find(temp => temp.title === row.template);

    if (!currentTemplate) {
      message.error('Template not found');
      return;
    }

    // Create the document structure with components from the CURRENT template
    const documentData = {
      ...row,
      template: {
        ...currentTemplate,
        // Always use the current template's components instead of stored ones
        components: currentTemplate.components || {
          header: [],
          main: [],
          footer: []
        }
      }
    };

    // Set the selected document with the proper structure
    setSelectedDocument(documentData);

    // Set header as the default active component if available
    if (currentTemplate.components?.header && currentTemplate.components.header.length > 0) {
      setActiveComponent(currentTemplate.components.header[0]);
      setActiveTab('header');
    } else if (currentTemplate.components?.main && currentTemplate.components.main.length > 0) {
      setActiveComponent(currentTemplate.components.main[0]);
      setActiveTab('main');
    }

    setIsPanelVisible(true);
  };

  const getIconForType = (type: string) => {
    console.log(type, 'llll');
    switch (type.toLowerCase()) {
      case 'table':
        return <CiViewTable />
      case 'form':
        return <FaWpforms />;
      case 'section':
        return <RxSection />;
      case 'list':
        return <CiViewList />;
      case 'flowchart':
        return <TiFlowChildren />;
      default:
        return <ListAltIcon />;
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

  const renderComponent = (component: TemplateComponent, section: 'header' | 'main' | 'footer') => {
    if (!component?.config) return null;

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
        componentId: component.id,
        section: section
      }
    };

    const componentClassName = `${styles.componentWrapper} ${activeComponent?.id === component.id ? styles.activeSection : ''}`;

    switch (component.config.type) {
      case 'form':
        return (
          <div id={`component-${component.id}`} className={componentClassName}>
            <BuilderForm {...commonProps} />
          </div>
        );
      case 'table':
        return (
          <div id={`component-${component.id}`} className={componentClassName}>
            <BuilderTable {...commonProps} />
          </div>
        );
      case 'tableWithForm':
        return (
          <div id={`component-${component.id}`} className={componentClassName}>
            <BuilderTableWithForm {...commonProps} />
          </div>
        );
      case 'list':
      case 'dotList':
        return (
          <div id={`component-${component.id}`} className={componentClassName}>
            <DotList {...commonProps} />
          </div>
        );
      case 'section':
        return (
          <div id={`component-${component.id}`} className={componentClassName}>
            <BuilderSection {...commonProps} />
          </div>
        );
      case 'flowChart':
        return (
          <div id={`component-${component.id}`} className={componentClassName}>
            <FlowView {...commonProps} />
          </div>
        );
      case 'treeTable':
        return (
          <div id={`component-${component.id}`} className={componentClassName}>
            <TreeTable {...commonProps} />
          </div>
        );
      default:
        return null;
    }
  };

  // const renderComponent = (component: TemplateComponent, section: 'header' | 'main' | 'footer') => {
  //   if (!component.config) return null;

  //   const commonProps = {
  //     isEditable: true,
  //     props: {
  //       title: component.config.title,
  //       type: component.config.type,
  //       metaData: component.config.metaData,
  //       data: component.config.data || [],
  //       style: component.config.style || {
  //         heading: { titleAlign: 'left' },
  //         form: { column: 1 }
  //       },
  //       componentId: component.id,
  //       section: section
  //     }
  //   };

  //   switch (component.config.type) {
  //     case 'form':
  //       return (
  //         <div
  //           id={`component-${component.id}`}
  //           className={`${styles.formSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
  //         >
  //           <BuilderForm {...commonProps} />
  //         </div>
  //       );
  //     case 'table':
  //       return (
  //         <div
  //           id={`component-${component.id}`}
  //           className={`${styles.tableSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
  //         >
  //           <BuilderTable {...commonProps} />
  //         </div>
  //       );
  //     case 'tableWithForm':
  //       return (
  //         <div
  //           id={`component-${component.id}`}
  //           className={`${styles.tableSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
  //         >
  //           <BuilderTableWithForm {...commonProps} />
  //         </div>
  //       );
  //     case 'list':
  //     case 'dotList':
  //       return (
  //         <div
  //           id={`component-${component.id}`}
  //           className={`${styles.listSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
  //         >
  //           <DotList {...commonProps} />
  //         </div>
  //       );
  //     case 'section':
  //       return (
  //         <div
  //           id={`component-${component.id}`}
  //           className={`${styles.sectionComponent} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
  //         >
  //           <BuilderSection {...commonProps} />
  //         </div>
  //       );
  //     case 'flowChart':
  //       return (
  //         <div
  //           id={`component-${component.id}`}
  //           className={`${styles.flowChartSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
  //         >
  //           <FlowView {...commonProps} />
  //         </div>
  //       );
  //     case 'treeTable':
  //       return (
  //         <div
  //           id={`component-${component.id}`}
  //           className={`${styles.treeTableSection} ${activeComponent?.id === component.id ? styles.activeSection : ''}`}
  //         >
  //           <TreeTable {...commonProps} />
  //         </div>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  const handleDeleteTemplate = () => {
    Modal.confirm({
      title: t('Confirm Delete'),
      content: t('Are you sure you want to delete this product code?'),
      okText: t('Delete'),
      okType: 'danger',
      cancelText: t('Cancel'),
      onOk: () => {
        // Remove from documents list
        const updatedDocuments = filteredData.filter(doc => doc.id !== selectedDocument.id);
        setFilteredData(updatedDocuments);
        localStorage.setItem('documentList', JSON.stringify(updatedDocuments));

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

  const getMFRTemplates = () => {
    // Filter templates to only show MFR type templates
    return templates.filter(template => template.type === 'MFR').map(template => ({
      id: template.id,
      title: template.title
    }));
  };

  return (
    <div>
      <div className={`${styles.dataFieldNav} ${isPanelVisible ? styles.shrink : ''}`}>
        <CommonAppBar
          onSearchChange={() => { }}
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("MFR Creation")} onSiteChange={handleSiteChange} />
      </div>
      <div className={styles.container}>
        {/* Sliding Panel */}
        <div className={`${styles.slidingPanel} ${isPanelVisible ? styles.visible : ''}`}>
          <div className={styles.slidingPanelHeader}>
            <div>

              <h2 className={styles.slidingPanelTitle}>
                {selectedDocument?.title || t('Document Details')}
              </h2>
              <div className={styles.mfrNumber}>
                {selectedDocument?.mfrNo && `${selectedDocument.mfrNo}`}
              </div>
            </div>
            <div className={styles.headerButtons}>
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
              <div className={styles.componentSection}>
                {/* Header Components */}
                <div className={styles.sectionTitle}>{t('Header')}</div>
                {selectedDocument.template?.components?.header?.map((item: TemplateComponent, index: number) => (
                  <div
                    key={item.id || index}
                    className={`${styles.typeItem} ${activeComponent?.id === item.id ? styles.active : ''}`}
                    onClick={() => handleComponentClick(item, 'header')}
                  >
                    <div className={styles.typeIcon}>
                      {getIconForType(item.config?.type || item.type)}
                    </div>
                    <span className={styles.typeText}>{item.config.title}</span>
                  </div>
                ))}

                {/* Main Components */}
                <div className={styles.sectionTitle}>{t('Main')}</div>
                {selectedDocument.template?.components?.main?.map((item: TemplateComponent, index: number) => (
                  <div
                    key={item.id || index}
                    className={`${styles.typeItem} ${activeComponent?.id === item.id ? styles.active : ''}`}
                    onClick={() => handleComponentClick(item, 'main')}
                  >
                    <div className={styles.typeIcon}>
                      {getIconForType(item.config?.type || item.type)}
                    </div>
                    <span className={styles.typeText}>{item.config.title}</span>
                  </div>
                ))}

                {/* Footer Components */}
                <div className={styles.sectionTitle}>{t('Footer')}</div>
                {selectedDocument.template?.components?.footer?.map((item: TemplateComponent, index: number) => (
                  <div
                    key={item.id || index}
                    className={`${styles.typeItem} ${activeComponent?.id === item.id ? styles.active : ''}`}
                    onClick={() => handleComponentClick(item, 'footer')}
                  >
                    <div className={styles.typeIcon}>
                      {getIconForType(item.config?.type || item.type)}
                    </div>
                    <span className={styles.typeText}>{item.config.title}</span>
                  </div>
                ))}
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
                  {t("MFR Document Creater")}({filteredData ? filteredData.length : 0})
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
                {selectedDocument.template?.components?.header?.length > 0 && (
                  <div className={styles.sectionContainer} data-section-title={t('Header')}>
                    {selectedDocument.template?.components?.header?.map((component: TemplateComponent) => (
                      <div key={component.id} className={styles.componentWrapper}>
                        {renderComponent(component, 'header')}
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Components */}
                <div className={styles.sectionContainer} data-section-title={t('Main')}>
                  {selectedDocument.template?.components?.main?.map((component: TemplateComponent) => (
                    <div key={component.id} className={styles.componentWrapper}>
                      {renderComponent(component, 'main')}
                    </div>
                  ))}
                </div>

                {/* Footer Components */}
                {
                  selectedDocument.template?.components?.footer?.length > 0 &&
                  <div className={styles.sectionContainer} data-section-title={t('Footer')}>
                    {selectedDocument.template?.components?.footer?.map((component: TemplateComponent) => (
                      <div key={component.id} className={styles.componentWrapper}>
                        {renderComponent(component, 'footer')}
                      </div>
                    ))}
                  </div>
                }
                {/* <div className={styles.sectionContainer} data-section-title={t('Footer')}>
                  {selectedDocument.template?.components?.footer?.map((component: TemplateComponent) => (
                    <div key={component.id} className={styles.componentWrapper}>
                      {renderComponent(component, 'footer')}
                    </div>
                  ))}
                </div> */}
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
            <div key="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button key="close" onClick={handlePreviewModalClose}>
                {t("Close")}
              </Button>
              <Button
                key="download"
                // type="primary"
                icon={<PictureAsPdfIcon />}
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
            </div>
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
          title={t("MFR Document")}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={t("ok")}
          cancelText={t("cancel")}
          width={500}
        >
          <Form layout="horizontal" wrapperCol={{ span: 24 }} labelCol={{ span: 8 }}>
            <Form.Item
              label={t("Type")}
              required
            >
              <Select
                value={documentType}
                onChange={(value) => {
                  setDocumentType(value as "master" | "child");
                  // Reset fields when type changes
                  setSelectedMFR('');
                  setMfrVersion('');
                  setSelectedProduct('');
                  setSelectedMasterTemplate(null);
                }}
                style={{ width: '100%' }}
                defaultValue="master"
              >
                <Select.Option value="master">Master</Select.Option>
                <Select.Option value="child">Child</Select.Option>
              </Select>
            </Form.Item>

            {documentType === 'master' && (
              <>
                <Form.Item
                  label={t("Category")}
                  required
                >
                  <Select
                    placeholder={t("Select a Category")}
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value)}
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="API">API</Select.Option>
                    <Select.Option value="intermediate">Intermediate</Select.Option>
                    <Select.Option value="formulation">Formulation</Select.Option>
                    <Select.Option value="packaging">Packaging</Select.Option>
                    <Select.Option value="testing">Testing</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t("Product Code")}
                  required
                >
                  <Select
                    placeholder={t("Select a Product Code")}
                    value={selectedProduct}
                    onChange={(value) => setSelectedProduct(value)}
                    style={{ width: '100%' }}
                  >
                    {dummyProductCodes.map((code) => (
                      <Select.Option key={code.id} value={code.id}>
                        {code.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t("MFR Template")}
                  required
                >
                  <Select
                    placeholder={t("Select a Template")}
                    value={selectedTemplate}
                    onChange={(value) => setSelectedTemplate(value)}
                    style={{ width: '100%' }}
                  >
                    {getMFRTemplates().map((template) => (
                      <Select.Option key={template.id} value={template.id}>
                        {template.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t("Batch Size")}
                  required
                >
                  <Input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label={t("Version")}
                  required
                >
                  <Input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="Enter version"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </>
            )}

            {documentType === 'child' && (
              <>
                <Form.Item
                  label={t("MFR")}
                  required
                >
                  <Select
                    placeholder={t("Select MFR")}
                    value={selectedMFR}
                    onChange={handleMFRChange}
                    style={{ width: '100%' }}
                  >
                    {getAvailableMFRs().map((mfr) => (
                      <Select.Option key={mfr.id} value={mfr.id}>
                        {`${mfr.id} - ${mfr.productName}`}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedMFR && (
                  <>
                    <Form.Item
                      label={t("Version")}
                    >
                      <Input
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="Enter version"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    {selectedMasterTemplate && (
                      <Form.Item
                        label={t("Template")}
                      >
                        <Input
                          value={selectedMasterTemplate.title}
                          disabled
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    )}
                  </>
                )}
              </>
            )}

            <Form.Item
              label={t("MFR No.")}
              required
            >
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 100px)' }}
                  value={mfrNo}
                  onChange={(e) => setMfrNo(e.target.value)}
                  placeholder="MFR Number"
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
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default DocumentCreator; 