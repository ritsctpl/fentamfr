import React, { useState, useEffect, useContext } from 'react';
import styles from '@modules/resourceMaintenances/styles/resource.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip, Button as Btn, Select, Card } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, Button, Typography, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { DocumentCreatorContext } from '../hooks/DocumentCreatorContext';

interface DocumentCreatorBodyProps {
    isAdding: boolean;
    selected: any;
    drag: boolean;
    fullScreen: boolean;
    resetValue: boolean;
    call: number;
    onClose: () => void;
    setCall: (val: number) => void;
    setIsAdding: (val: boolean) => void;
    setFullScreen: (val: boolean) => void;
}

const DocumentCreatorBody: React.FC<DocumentCreatorBodyProps> = ({ selected,
    fullScreen, setIsAdding, drag, call, setCall, isAdding, onClose,
    resetValue, setFullScreen }) => {

    const { formData, setFormData, setFormChange, activeTab, setActiveTab, formChange } = useContext<any>(DocumentCreatorContext);
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [templateOptions, setTemplateOptions] = useState<any[]>([]);
    const [templateComponents, setTemplateComponents] = useState<any[]>([]);
    const [tabItems, setTabItems] = useState<{ label: string, key: string }[]>([{ label: "Main", key: "main" }]);
    const [isNewDocument, setIsNewDocument] = useState<boolean>(true);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    // Load template options from localStorage
    useEffect(() => {
        try {
            const templatesJson = localStorage.getItem('templates');
            if (templatesJson) {
                const templates = JSON.parse(templatesJson);
                setTemplateOptions(templates);
            }
        } catch (error) {
            console.error('Error loading templates from localStorage:', error);
        }
    }, []);

    // Handle selected document change
    useEffect(() => {
        if (selected && selected.id) {
            setIsNewDocument(false);
            
            // Find the template details for the selected document
            const templateType = selected.template;
            const template = templateOptions.find(t => t.type === templateType);
            
            if (template && template.components) {
                setSelectedTemplate(template);
                setTemplateComponents(template.components);
                
                // Generate tabs based on main components
                const tabs = [{ label: "Main", key: "main" }]; // Default main tab
                
                if (template.components && template.components.main) {
                    // Add tabs based on main components' type values
                    template.components.main.forEach(item => {
                        if (item.type) {
                            tabs.push({ 
                                label: item.config?.title || capitalizeFirstLetter(item.type), 
                                key: item.id 
                            });
                        }
                    });
                }
                
                setTabItems(tabs);
            }
            
            // Set form fields for the selected document
            form.setFieldsValue({
                type: selected.type,
                template: selected.template,
                title: selected.title,
                description: selected.description
            });
        } else {
            setIsNewDocument(true);
            setTabItems([{ label: "Main", key: "main" }]);
            setTemplateComponents([]);
            setSelectedTemplate(null);
        }
    }, [selected, templateOptions]);

    // Handle template selection change
    const handleTemplateChange = (value) => {
        const template = templateOptions.find(t => t.type === value);
        if (template) {
            setSelectedTemplate(template);
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handleOpenChange = () => {
        setFullScreen(true);
    }

    const handleCloseChange = () => {
        setFullScreen(false);
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleClose = () => {
        if (formChange) {
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    onClose();
                    setIsAdding(false);
                    setFormChange(false);
                    form.resetFields();
                    setActiveTab(0);
                },
                onCancel() { },
            });
        }
        else {
            onClose();
            setIsAdding(false);
            setFormChange(false);
            form.resetFields();
            setActiveTab(0);
        }
    };

    const handleSave = async () => {
        const errors = [];
        if (!form.getFieldValue('type')) {
            errors.push('Type');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        try {
            const values = await form.validateFields();
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;
            
            // Find the selected template from templateOptions
            const selectedTemplate = templateOptions.find(template => template.type === values.template) || {};
            
            // Create a new document entry with form data
            const newDocument = {
                id: Date.now(), // Temporary ID for demo purposes
                type: values.type,
                template: values.template || '',
                title: selectedTemplate.title || '',
                description: selectedTemplate.description || '',
                components: JSON.parse(JSON.stringify(selectedTemplate.components || {})), // Deep copy of components
                createdDateTime: new Date().toISOString(),
                modifiedDateTime: new Date().toISOString(),
            };
            
            // Save to localStorage
            try {
                // Get existing document list from localStorage
                const existingDocumentsJson = localStorage.getItem('documentList');
                let documentList = [];
                
                if (existingDocumentsJson) {
                    documentList = JSON.parse(existingDocumentsJson);
                }
                
                // Add new document to the list
                documentList.unshift(newDocument);
                
                // Save updated list back to localStorage
                localStorage.setItem('documentList', JSON.stringify(documentList));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
            
            // Update the context with the new document
            setFormData(prevData => ({
                ...prevData,
                ...values,
                ...newDocument,
            }));
            
            // Show success message
            message.success('Document created successfully');
            
            // Update the table data (this will trigger a re-render of the table)
            setCall(call + 1);
            
            // Reset form and close the form panel
            setFormChange(false);
            setIsAdding(false);
            form.resetFields();
            setActiveTab(0);
            
        } catch (error) {
            console.error('Error creating document:', error);
            message.error('An error occurred while saving the document.');
        }
    };

    const handleCancel = () => {
        if (formChange) {
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    onClose();
                    setIsAdding(false);
                    setFormChange(false);
                    form.resetFields();
                    setActiveTab(0);
                },
                onCancel() { },
            });
        }
        else {
            onClose();
            setIsAdding(false);
            setFormChange(false);
            form.resetFields();
            setActiveTab(0);
        }
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleConfirmDelete = () => {
        // Not implemented yet
    };

    const handleOpenCopyModal = () => {
        // Not implemented yet
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        const formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        form.setFieldsValue({ [fieldName]: formattedValue });
    };

    const handleConfirmCopy = async () => {
        // Not implemented yet
    };

    const handleChange = (changedValues) => {
        setFormChange(true);
        setFormData(prevData => ({
            ...prevData,
            ...changedValues,
        }));
        
        // If template changes, update the component structure
        if (changedValues.template) {
            handleTemplateChange(changedValues.template);
        }
    };

    // Render form fields based on metadata in component configuration
    const renderConfigFields = (config) => {
        if (!config) return null;
        
        // Render form fields based on config type
        if (config.type === 'form') {
            return (
                <Card title={config.title} style={{ marginBottom: 16 }}>
                    <Form.Item label={config.title} name={`field_${config.title}`}>
                        <Input placeholder={`Enter ${config.title}`} />
                    </Form.Item>
                </Card>
            );
        }
        
        return (
            <div>
                <Typography variant="subtitle1">{config.title}</Typography>
            </div>
        );
    };

    // Render component content
    const renderComponentContent = (component) => {
        if (!component) return null;
        
        // Check if component has items to render
        if (Array.isArray(component)) {
            return component.map((item, index) => (
                <div key={item.id || index}>
                    {renderConfigFields(item.config)}
                </div>
            ));
        }
        
        // For single component
        return renderConfigFields(component.config);
    };

    const renderTabContent = () => {
        // For a new document, show only type and template selection
        if (isNewDocument) {
            return (
                <Form
                    layout="horizontal"
                    style={{ width: '100%' }}
                    form={form}
                    onValuesChange={handleChange}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 24 }}
                >
                    <Form.Item
                        label={t('Type')}
                        name="type"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the Type!',
                            },
                        ]}
                    >
                        <Input
                            style={{ width: '40%' }}
                            placeholder="Type"
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("Template")}
                        name="template"
                    >
                        <Select 
                            style={{ width: '40%' }} 
                            placeholder="Select Template"
                            onChange={handleTemplateChange}
                        >
                            {templateOptions.map((template, index) => (
                                <Select.Option key={template.id || index} value={template.type}>
                                    {template.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            );
        }
        
        // For existing document, show dynamic tabs based on template components
        const currentTab = tabItems[activeTab];
        
        if (!currentTab) return null;
        
        // Handle main tab which shows document metadata
        if (currentTab.key === 'main') {
            return (
                <Form
                    layout="horizontal"
                    style={{ width: '100%' }}
                    form={form}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 24 }}
                >
                    <Form.Item label={t('Type')} name="type">
                        <Input style={{ width: '40%' }} disabled />
                    </Form.Item>
                    
                    <Form.Item label={t('Title')} name="title">
                        <Input style={{ width: '40%' }} disabled />
                    </Form.Item>
                    
                    <Form.Item label={t('Description')} name="description">
                        <Input style={{ width: '40%' }} disabled />
                    </Form.Item>
                </Form>
            );
        }
        
        // For component tabs, render the component content
        if (selectedTemplate && selectedTemplate.components) {
            // Find the component by ID in main array
            const component = selectedTemplate.components.main?.find(item => item.id === currentTab.key);
            
            if (component) {
                return (
                    <div>
                        {renderConfigFields(component.config)}
                    </div>
                );
            }
        }
        
        return null;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selected?.title ? selected.title : t("Create Document")}
                                </p>
                                {selected?.id && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('description')}:&nbsp;
                                            <span className={styles.fadedText}>{selected.description}</span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('createdOn')}:&nbsp;
                                            <span className={styles.fadedText}>
                                                {dayjs(selected.createdDateTime).format('DD-MM-YYYY HH:mm:ss')}
                                            </span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('modifiedOn')}:&nbsp;
                                            <span className={styles.fadedText}>
                                                {dayjs(selected.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                {
                                    fullScreen ?
                                        <Tooltip title={t("exitFullScreen")}>
                                            <Button onClick={handleCloseChange} className={styles.actionButton}>
                                                <CloseFullscreenIcon />
                                            </Button>
                                        </Tooltip> :
                                        <Tooltip title={t("enterFullScreen")}>
                                            <Button onClick={handleOpenChange} className={styles.actionButton}>
                                                <OpenInFullIcon />
                                            </Button>
                                        </Tooltip>
                                }

                                {selected?.id && (
                                    <>
                                        <Tooltip title={t("copy")}>
                                            <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                                <CopyIcon />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title={t("delete")}>
                                            <Button onClick={handleOpenModal} className={styles.actionButton}>
                                                <DeleteIcon />
                                            </Button>
                                        </Tooltip>
                                    </>
                                )}

                                <Tooltip title={t("close")}>
                                    <Button onClick={handleClose} className={styles.actionButton}>
                                        <CloseIcon />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div className={styles.splitScreen}>
                        <div className={styles.verticalTabs}>
                            <List>
                                {tabItems.map((tab, index) => (
                                    <ListItem key={tab.key} disablePadding>
                                        <ListItemButton
                                            selected={activeTab === index}
                                            onClick={() => setActiveTab(index)}
                                        >
                                            <ListItemText primary={t(tab.label)} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                        <div className={styles.tabContent}>
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
            <footer className={styles.footer}>
                <div className={styles.floatingButtonContainer}>
                    <Btn
                        type="primary"
                        onClick={handleSave}
                    >
                        {!isNewDocument ? t("save") : t("create")}
                    </Btn>
                    <Btn
                        onClick={handleCancel}
                    >
                        {t("cancel")}
                    </Btn>
                </div>
            </footer>
            <Modal
                title={t("copyResource")}
                open={isCopyModalVisible}
                onOk={handleConfirmCopy}
                onCancel={handleCloseCopyModal}
                okText={t("copy")}
                cancelText={t("cancel")}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        label={t("resourceType")}
                        name="resourceType"
                        rules={[{ required: true, message: 'Please enter the Resource Type' }]}
                    >
                        <Input placeholder="Enter Resource Type" onChange={(e) => handleFieldChange(e, 'resourceType')} />
                    </Form.Item>
                    <Form.Item
                        label={t("resourceTypeDescription")}
                        name="resourceTypeDescription"
                    >
                        <Input placeholder="Enter resourceTypeDescription" onChange={(e) => handleFieldChange(e, 'resourceTypeDescription')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DocumentCreatorBody; 