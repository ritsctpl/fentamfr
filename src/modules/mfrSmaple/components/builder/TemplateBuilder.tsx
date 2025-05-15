import { Button, Card, Collapse, Form, Input, Modal, Select, Switch, Tabs, Tag, Radio, Upload, Dropdown, message } from "antd";
import Title from "antd/es/typography/Title";
import TextArea from "antd/lib/input/TextArea";
import React, { useEffect, useState } from "react";
import { IoArrowBack, IoChevronDown, IoChevronUp, IoSettingsOutline } from "react-icons/io5";
import { CopyOutlined, DeleteOutlined, MinusCircleOutlined, PullRequestOutlined, UploadOutlined, DownOutlined } from "@ant-design/icons";
import { HiOutlineDocumentText } from "react-icons/hi2";
import ComponentList from "../builder_components/ComponentList";
import BuilderForm from "../builder_components/BuilderForm";
import BuilderTable from "../builder_components/BuilderTable";
import { RiDeleteBin6Line, RiDraggable } from "react-icons/ri";
import { IoCopyOutline } from "react-icons/io5";
import TreeTable from "../builder_components/TreeTable";
import DotList from "../builder_components/DotList";
import BuilderSection from "../builder_components/BuilderSection";
import DocumentPreview from '../builder_components/DocumentPreview';
import { Template } from '../../TemplateMain';

import {
    TEMPLATE_TYPES,
    PRODUCT_DETAILS_PROPS,
    BILL_OF_MATERIAL_PROPS,
    MASTER_FORMULA_RECORD_PROPS,
    APPROVED_BY_PROPS,
    MANUFACTURING_PROCEDURE_PROPS,
    GENERAL_DOS_AND_DONTS_PROPS,
    BRIEF_MANUFACTURING_PROPS,
    ACTIVE_COMPOSITION_PROPS,
    ABBREVIATIONS_PROPS,
    BATCH_MANUFACTURING_RECORD_PROPS,
    APPROVED_BY_BMR_PROPS,
    PRODUCT_DETAILS_BMR_PROPS,
    PROCESSING_INSTRUCTIONS_PROPS,
    RAW_MATERIAL_INDENT_PROPS,
    LINE_CLEARANCE_FOR_MANUFACTURING_PROPS,
    RAW_MATERIAL_DISPENSING_PROPS,
    MANUFACTURING_FLOW_CHART_PROPS,
    RAW_MATERIAL_DISPENSING_LIST_PROPS,
    RAW_MATERIAL_DISPENSING_AREA_TEMP_PROPS,
    EQUIPMENT_CALIBRATION_SOP_DETAILS_PROPS,
    MANUFACTURING_PROPS,
    BULK_SAMPLING_PROPS,
    BULK_SAMPLE_PROPS,
    BULK_SPECIFICATION_PROPS,
    BULK_UNLOADING_PROPS,
    BULK_YEILD_CALCULATION_PROPS
} from '../../constants/builderConstants';
import BuilderTableWithForm from "../builder_components/BuilderTableWithForm";
import FlowView from "../builder_components/FlowView";

interface TemplateBuilderProps {
    config: {
        isVisible: boolean;
        setVisible: (visible: boolean) => void;
        data: any;
        onSave: (templateData: any) => void;
        onDelete: (templateId: number) => void;
    };
}

const COMPONENTS_MAP = {
    ProductDetails: { component: BuilderForm, props: PRODUCT_DETAILS_PROPS },
    ProductDetailsBmr: { component: BuilderForm, props: PRODUCT_DETAILS_BMR_PROPS },
    BillOfMaterial: { component: BuilderTable, props: BILL_OF_MATERIAL_PROPS },
    MasterFormulaRecord: { component: BuilderForm, props: MASTER_FORMULA_RECORD_PROPS },
    ApprovedBy: { component: BuilderTable, props: APPROVED_BY_PROPS },
    AprovedbyBMR: { component: BuilderTable, props: APPROVED_BY_BMR_PROPS },
    ActiveComposition: { component: BuilderTable, props: ACTIVE_COMPOSITION_PROPS },
    Abbreviations: { component: BuilderForm, props: ABBREVIATIONS_PROPS },
    BrifMaifacturing: { component: TreeTable, props: BRIEF_MANUFACTURING_PROPS },
    GeneralDosAndDonts: { component: DotList, props: GENERAL_DOS_AND_DONTS_PROPS },
    ManufacturingProcedure: { component: BuilderSection, props: MANUFACTURING_PROCEDURE_PROPS },
    BatchManufacturingRecord: { component: BuilderForm, props: BATCH_MANUFACTURING_RECORD_PROPS },
    ProcessingInstructions: { component: DotList, props: PROCESSING_INSTRUCTIONS_PROPS },
    RawMaterialIndent: { component: BuilderTable, props: RAW_MATERIAL_INDENT_PROPS },
    LineClearanceForManufacturing: { component: BuilderTable, props: LINE_CLEARANCE_FOR_MANUFACTURING_PROPS },
    RawMaterialDispensing: { component: BuilderTableWithForm, props: RAW_MATERIAL_DISPENSING_PROPS },
    FlowView: { component: FlowView, props: MANUFACTURING_FLOW_CHART_PROPS },
    RawMaterialDispensingList: { component: DotList, props: RAW_MATERIAL_DISPENSING_LIST_PROPS },
    RawMaterialDispensingAreaTemp: { component: BuilderTable, props: RAW_MATERIAL_DISPENSING_AREA_TEMP_PROPS },
    EquipmentCalibrationSOPDetails: { component: BuilderTable, props: EQUIPMENT_CALIBRATION_SOP_DETAILS_PROPS },
    Manufacturing: { component: TreeTable, props: MANUFACTURING_PROPS },
    BulkSampling: { component: BuilderForm, props: BULK_SAMPLING_PROPS },
    BulkSample: { component: BuilderTable, props: BULK_SAMPLE_PROPS },
    BulkSpecification: { component: DotList, props: BULK_SPECIFICATION_PROPS },
    BulkUnloading: { component: BuilderTableWithForm, props: BULK_UNLOADING_PROPS },
    BulkYeildCalculation: { component: BuilderForm, props: BULK_YEILD_CALCULATION_PROPS },
};

interface DroppedComponent {
    id: string;
    type: string;
    config: {
        title: string;
        type: 'form' | 'section' | 'table' | 'list' | 'flowChart' | 'tableWithForm';
        metaData: any;
        data: any[];
        style?: {
            heading?: {
                titleAlign?: string;
            };
            form?: {
                column?: number;
            };
            table?: {
                column?: number;
            };
        };
    };
    isDataLoaded?: boolean;
}

interface SaveTemplateForm {
    templateName: string;
    description: string;
    type: string;
}

const previewStyles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
        fontSize: '14px'
    },
    tableCell: {
        border: '1px solid #000',
        padding: '8px',
        textAlign: 'left'
    },
    heading: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '15px',
        textAlign: 'center'
    },
    section: {
        marginBottom: '25px'
    }
};

function TemplateBuilder({ config }: TemplateBuilderProps) {
    const [form] = Form.useForm();
    const [headerFooter, setHeaderFooter] = useState(false);
    const [type, setType] = useState<string>(config?.data?.type || TEMPLATE_TYPES[0].value);
    const [selectedComponentId, setSelectedComponentId] = useState<string>('');
    const [dataConnection, setDataConnection] = useState<'api' | 'database'>('api');
    const [dataConfig, setDataConfig] = useState({
        apiUrl: '',
        method: 'GET',
        headers: {},
        queryParams: {},
        databaseType: 'mysql',
        tableName: '',
        query: ''
    });
    const [templates, setTemplates] = useState<Template[]>([]);

    // Initialize components from saved template if it exists
    const [headerComponents, setHeaderComponents] = useState<DroppedComponent[]>(
        config.data?.components?.header || []
    );
    const [mainComponents, setMainComponents] = useState<DroppedComponent[]>(
        config.data?.components?.main || []
    );
    const [footerComponents, setFooterComponents] = useState<DroppedComponent[]>(
        config.data?.components?.footer || []
    );

    // Reset form when data changes
    useEffect(() => {
        if (config.data) {
            form.setFieldsValue({
                id: config.data.id,
                version: config.data.version,
                type: config.data.type,
                description: config.data.description
            });
            setType(config.data.type);
        } else {
            form.resetFields();
            setType(TEMPLATE_TYPES[0].value);
        }
    }, [config.data, form]);

    // Reset components when data changes
    useEffect(() => {
        if (config.data?.components) {
            const processComponents = (components) => {
                return components.map(component => {
                    const componentProps = COMPONENTS_MAP[component.type]?.props;
                    if (componentProps?.defaultVisible) {
                        // For components with defaultVisible true, use their default data if no data exists
                        const defaultData = componentProps.data;
                        return {
                            ...component,
                            config: {
                                ...component.config,
                                data: component.config.data?.length ? component.config.data : defaultData
                            },
                            isDataLoaded: true
                        };
                    }
                    return component;
                });
            };

            setHeaderComponents(processComponents(config.data.components.header || []));
            setMainComponents(processComponents(config.data.components.main || []));
            setFooterComponents(processComponents(config.data.components.footer || []));
            
            // Restore the configuration state if it exists
            if (config.data.configurationState) {
                setConfiguredComponents(config.data.configurationState);
            }
        } else {
            setHeaderComponents([]);
            setMainComponents([]);
            setFooterComponents([]);
            setConfiguredComponents({});
        }
    }, [config.data]);

    const [draggedComponent, setDraggedComponent] = useState<{ zone: 'header' | 'main' | 'footer', id: string } | null>(null);
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [saveTemplateForm] = Form.useForm<SaveTemplateForm>();
    const [viewMode, setViewMode] = useState(false);
    const [mappingMode, setMappingMode] = useState<'manual' | 'upload'>('manual');
    const [mappingConfig, setMappingConfig] = useState({
        sourceFields: [],
        targetFields: [],
        transformations: [],
        validations: []
    });

    const [configuredComponents, setConfiguredComponents] = useState<{[key: string]: {
        componentType: string;
        dataConnection: 'api' | 'database';
        config: any;
        isConfigured: boolean;
    }}>({});

    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

    const [copyModalVisible, setCopyModalVisible] = useState(false);
    const [copyForm] = Form.useForm();

    // Add dummy data sources

    // Function to create a component without data
    const createEmptyComponent = (type: string, componentConfig: any): DroppedComponent => {
        // Initialize data based on component type and defaultVisible property
        let initialData;

        if (componentConfig.type === 'tableWithForm') {
            initialData = { form: [], table: [] };
        } else if (componentConfig.defaultVisible) {
            // Use the default data from props if defaultVisible is true
            initialData = componentConfig.data;
        } else if (componentConfig.type === 'table') {
            initialData = [];
        } else if (componentConfig.type === 'form') {
            initialData = [];
        } else if (componentConfig.type === 'list') {
            initialData = [];
        } else {
            initialData = [];
        }

        return {
            id: Math.random().toString(36).substr(2, 9),
            type,
            config: {
                ...componentConfig,
                data: initialData,
                title: componentConfig.title,
                type: componentConfig.type,
                metaData: componentConfig.metaData,
                style: componentConfig.style
            },
            isDataLoaded: componentConfig.defaultVisible || false
        };
    };

    const handleDrop = (zone: 'header' | 'main' | 'footer') => (e: React.DragEvent) => {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('componentType');
        if (componentType && COMPONENTS_MAP[componentType]) {
            const newComponent = createEmptyComponent(componentType, COMPONENTS_MAP[componentType].props);

            switch (zone) {
                case 'header':
                    setHeaderComponents(prev => [...prev, newComponent]);
                    break;
                case 'main':
                    setMainComponents(prev => [...prev, newComponent]);
                    break;
                case 'footer':
                    setFooterComponents(prev => [...prev, newComponent]);
                    break;
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDelete = (zone: 'header' | 'main' | 'footer', id: string) => {
        switch (zone) {
            case 'header':
                setHeaderComponents(prev => prev.filter(comp => comp.id !== id));
                break;
            case 'main':
                setMainComponents(prev => prev.filter(comp => comp.id !== id));
                break;
            case 'footer':
                setFooterComponents(prev => prev.filter(comp => comp.id !== id));
                break;
        }
    };

    const handleCopy = (zone: 'header' | 'main' | 'footer', component: DroppedComponent) => {
        const newComponent = {
            ...component,
            id: Math.random().toString(36).substr(2, 9)
        };

        switch (zone) {
            case 'header':
                setHeaderComponents(prev => [...prev, newComponent]);
                break;
            case 'main':
                setMainComponents(prev => [...prev, newComponent]);
                break;
            case 'footer':
                setFooterComponents(prev => [...prev, newComponent]);
                break;
        }
    };

    const handleComponentDragStart = (zone: 'header' | 'main' | 'footer', id: string) => (e: React.DragEvent) => {
        e.stopPropagation(); // Prevent parent drop zone from interfering
        setDraggedComponent({ zone, id });
        // Add a ghost image for drag preview
        const dragPreview = document.createElement('div');
        dragPreview.classList.add('component-drag-preview');
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 0, 0);
        setTimeout(() => document.body.removeChild(dragPreview), 0);
    };

    const handleComponentDragOver = (zone: 'header' | 'main' | 'footer', id: string) => (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedComponent || draggedComponent.zone !== zone) return;

        const components = zone === 'header' ? headerComponents :
            zone === 'main' ? mainComponents :
                footerComponents;

        const draggedIndex = components.findIndex(c => c.id === draggedComponent.id);
        const hoverIndex = components.findIndex(c => c.id === id);

        if (draggedIndex === hoverIndex) return;

        // Get the bounding rectangle of current target
        const targetElement = e.currentTarget as HTMLElement;
        const targetRect = targetElement.getBoundingClientRect();

        // Get the middle Y of the target
        const targetMiddleY = targetRect.top + (targetRect.height / 2);

        // Get the current mouse position
        const mouseY = e.clientY;

        // Only perform the move when the mouse has crossed half of the items height
        if ((draggedIndex < hoverIndex && mouseY < targetMiddleY) ||
            (draggedIndex > hoverIndex && mouseY > targetMiddleY)) {
            return;
        }

        // Reorder the components
        const newComponents = [...components];
        const [removed] = newComponents.splice(draggedIndex, 1);
        newComponents.splice(hoverIndex, 0, removed);

        // Update the appropriate state
        switch (zone) {
            case 'header':
                setHeaderComponents(newComponents);
                break;
            case 'main':
                setMainComponents(newComponents);
                break;
            case 'footer':
                setFooterComponents(newComponents);
                break;
        }
    };

    const handleComponentDragEnd = () => {
        setDraggedComponent(null);
    };

    const handleMoveComponent = (zone: 'header' | 'main' | 'footer', id: string, direction: 'up' | 'down') => {
        const components = zone === 'header' ? headerComponents :
            zone === 'main' ? mainComponents :
                footerComponents;

        const currentIndex = components.findIndex(c => c.id === id);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === components.length - 1)
        ) {
            return; // Already at the top/bottom
        }

        const newComponents = [...components];
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Swap the components
        [newComponents[currentIndex], newComponents[newIndex]] =
            [newComponents[newIndex], newComponents[currentIndex]];

        // Update the appropriate state
        switch (zone) {
            case 'header':
                setHeaderComponents(newComponents);
                break;
            case 'main':
                setMainComponents(newComponents);
                break;
            case 'footer':
                setFooterComponents(newComponents);
                break;
        }
    };

    // Save button click handler
    const handleSaveClick = () => {
        // Create clean components without loaded data, except for defaultVisible components
        const cleanComponents = (components: DroppedComponent[]) => {
            return components.map(component => {
                const componentProps = COMPONENTS_MAP[component.type]?.props;
                
                // If component has defaultVisible true, keep its data
                if (componentProps?.defaultVisible) {
                    return {
                        ...component,
                        config: {
                            ...component.config,
                            data: component.config.data?.length ? component.config.data : componentProps.data
                        },
                        isDataLoaded: true
                    };
                }

                // For other components, reset the data
                return {
                    ...component,
                    config: {
                        ...component.config,
                        data: component.config.type === 'tableWithForm' ? { form: [], table: [] } : [],
                        title: component.config.title,
                        type: component.config.type,
                        metaData: component.config.metaData,
                        style: component.config.style
                    },
                    isDataLoaded: false
                };
            });
        };

        const templateData = {
            components: {
                header: cleanComponents(headerComponents),
                main: cleanComponents(mainComponents),
                footer: cleanComponents(footerComponents)
            },
            configurationState: configuredComponents // Keep configuration state for future data loading
        };
        
        config.onSave(templateData);
    };

    const handleLoadData = (componentId: string, source: 'api' | 'database') => {
        const updateComponentData = (components: DroppedComponent[]) => 
            components.map(component => {
                if (component.id === componentId) {
                    const componentType = component.type;
                    const originalProps = COMPONENTS_MAP[componentType]?.props;
                    
                    if (!originalProps) return component;

                    return {
                        ...component,
                        config: {
                            ...component.config,
                            data: originalProps.data,
                            metaData: originalProps.metaData
                        },
                        isDataLoaded: true
                    };
                }
                return component;
            });

        setMainComponents(updateComponentData(mainComponents));
        setHeaderComponents(updateComponentData(headerComponents));
        setFooterComponents(updateComponentData(footerComponents));
    };

    const handleComponentDoubleClick = (componentId: string) => {
        setSelectedComponent(componentId);
        setSelectedComponentId(componentId); // For data configuration
    };

    const renderComponent = (component: DroppedComponent) => {
        const ComponentToRender = COMPONENTS_MAP[component.type]?.component;
        if (!ComponentToRender) return null;

        const componentProps = {
            ...COMPONENTS_MAP[component.type].props,
            data: component.isDataLoaded ? component.config.data : (component.config.type === 'tableWithForm' ? { form: [], table: [] } : []),
            metaData: component.config.metaData,
            styles: viewMode ? previewStyles : COMPONENTS_MAP[component.type].props.styles,
            isPreview: viewMode
        };

        return (
            <div style={{ width: '100%' }}>
                <ComponentToRender
                    key={component.id}
                    props={componentProps}
                    isEditable={!viewMode}
                />
            </div>
        );
    };

    const handleSaveDataConfig = () => {
        if (!selectedComponentId) return;

        const componentType = mainComponents.find(c => c.id === selectedComponentId)?.type || '';
        console.log('Saving config for component:', componentType);
        
        setConfiguredComponents({
            ...configuredComponents,
            [selectedComponentId]: {
                componentType,
                dataConnection,
                config: mappingConfig,
                isConfigured: true
            }
        });
    };

    const handleConfigFileUpload = (file: any) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target?.result as string);
                setMappingConfig(config);
            } catch (error) {
                console.error('Error parsing config file:', error);
            }
        };
        reader.readAsText(file);
        return false; // Prevent default upload behavior
    };

    const renderComponentWithDragHandle = (component: DroppedComponent, zone: 'header' | 'main' | 'footer') => (
        <Card
            key={component.id}
            onDoubleClick={() => handleComponentDoubleClick(component.id)}
            style={{
                border: selectedComponent === component.id ? '2px solid #1890ff' : undefined,
                transition: 'all 0.3s'
            }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        draggable
                        onDragStart={handleComponentDragStart(zone, component.id)}
                        onDragOver={handleComponentDragOver(zone, component.id)}
                        onDragEnd={handleComponentDragEnd}
                        style={{ cursor: 'grab', display: 'inline-block' }}
                    >
                        <RiDraggable color="#666" />
                    </div>
                    {configuredComponents[component.id]?.isConfigured && (
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'api',
                                        label: `${component.isDataLoaded ? 'Reload' : 'Load'} from API`,
                                        onClick: () => handleLoadData(component.id, 'api')
                                    },
                                    {
                                        key: 'database',
                                        label: `${component.isDataLoaded ? 'Reload' : 'Load'} from Database`,
                                        onClick: () => handleLoadData(component.id, 'database')
                                    }
                                ]
                            }}
                        >
                            <Button size="small" type="default">
                                {component.isDataLoaded ? 'Reload' : 'Load'} Data <DownOutlined />
                            </Button>
                        </Dropdown>
                    )}
                </div>
            }
            extra={
                <div style={{ display: 'flex', gap: 10 }}>
                    <IoChevronUp
                        onClick={() => handleMoveComponent(zone, component.id, 'up')}
                        style={{ cursor: 'pointer' }}
                    />
                    <IoChevronDown
                        onClick={() => handleMoveComponent(zone, component.id, 'down')}
                        style={{ cursor: 'pointer' }}
                    />
                    <IoCopyOutline
                        onClick={() => handleCopy(zone, component)}
                        style={{ cursor: 'pointer' }}
                    />
                    <RiDeleteBin6Line
                        onClick={() => handleDelete(zone, component.id)}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            }
            styles={{
                header: {
                    minHeight: 25,
                    padding: 10
                },
                body: {
                    padding: 10,
                }
            }}
        >
            {renderComponent(component)}
        </Card>
    );

    const handleCopyTemplate = async () => {
        try {
            const values = await copyForm.validateFields();
            
            // Create a deep copy of the current template data
            const copiedTemplate = {
                ...config.data,
                id: Date.now(), // New ID for the copied template
                title: values.title,
                version: values.version,
                description: values.description,
                updatedDate: new Date().toLocaleDateString(),
            };

            // Add the copied template to the templates list
            setTemplates(prev => [...prev, copiedTemplate]);
            setCopyModalVisible(false);
            copyForm.resetFields();
            message.success('Template copied successfully!');
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <header style={{ width: '100%', height: '8%', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: 10, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button style={{ padding: 5 }} size="small" onClick={() => config.setVisible(false)}><IoArrowBack size={15} /></Button>
                    <Title level={3} style={{ margin: 0 }}>{config.data ? config.data.title : 'New Template'}</Title>
                    <Tag color='gold'>{'View Mode'}</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div>Preview <Switch
                        checked={viewMode}
                        onChange={() => setViewMode(!viewMode)}
                    /></div>
                    <Button type="text" onClick={() => setCopyModalVisible(true)}><CopyOutlined style={{ fontSize: '20px', color: '#000' }} /></Button>
                      <Button
                        type="text"
                        onClick={() => config.data && config.onDelete(config.data.id)}
                    >
                        <DeleteOutlined style={{ fontSize: '20px', color: '#000' }} />
                    </Button>
                    <Button type="primary" onClick={handleSaveClick}>Save Template</Button>
                </div>
            </header>
            <main style={{ width: '100%', height: '92%', display: 'flex' }}>
                {/* Document Details */}
                <div style={{ width: '23%', height: '100%', borderRight: '1px solid #eee', padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>

                    <Collapse
                        collapsible="header"
                        expandIconPosition="end"
                        defaultActiveKey={['1']}
                        style={{ border: '1px solid #eee', height: 'max-content' }}
                        items={[
                            {
                                key: '1',
                                label: 'Components',
                                styles: {
                                    header: {
                                        fontSize: 16,
                                        fontWeight: '500',
                                        color: '#333'
                                    },
                                },
                                children: (
                                    <ComponentList onDragStart={() => { }} />
                                ),
                            },
                        ]}
                    />
                </div>
                {/* Document Editor */}
                {viewMode ? (
                    <div style={{ width: '50%', height: '100%', borderRight: '1px solid #eee', boxSizing: 'border-box', overflow: 'auto' }}>
                        <DocumentPreview data={{
                            components: {
                                header: headerComponents,
                                main: mainComponents,
                                footer: footerComponents
                            }
                        }} />
                    </div>
                ) : <div style={{ width: '50%', height: '100%', borderRight: '1px solid #eee', padding: 10, boxSizing: 'border-box', overflow: 'auto' }}>

                    <Card
                        title={<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><HiOutlineDocumentText size={20} />Document Editor</div>}
                        extra={<Button size="small" style={{ fontSize: 13, fontWeight: 600, border: 'none' }} onClick={() => setHeaderFooter(!headerFooter)} >{headerFooter ? 'Hide' : 'Show'} Header/Footer</Button>}
                        style={{ width: '100%', minHeight: '100%', height: 'auto', border: '1px solid #e4e4e7', boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px' }}
                        styles={{
                            body: {
                                padding: 0,
                                height: 'auto'
                            },
                            header: {
                                padding: 10,
                            }
                        }}
                    >
                        {headerFooter &&
                            <header
                                onDrop={handleDrop('header')}
                                onDragOver={handleDragOver}
                                style={{ width: '100%', minHeight: '100px', maxHeight: 'auto', borderBottom: '1px dashed #3ec0f7', padding: 10, boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, marginBottom: 10 }}>
                                    <span>Header (appears on all pages)</span>
                                    <IoSettingsOutline size={15} />
                                </div>
                                <div style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    height: 'auto',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 20
                                }}>
                                    {headerComponents.length === 0 ? (
                                        <div style={{
                                            width: '100%',
                                            height: '100px',
                                            border: '2px dashed #e4e4e7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#666',
                                        }}>
                                            Drop Header Components Here
                                        </div>
                                    ) : (
                                        headerComponents.map(component => renderComponentWithDragHandle(component, 'header'))
                                    )}
                                </div>
                            </header>
                        }
                        <main
                            style={{
                                width: '100%',
                                minHeight: '65vh',
                                height: 'auto',
                                padding: 10,
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20
                            }}
                            onDrop={handleDrop('main')}
                            onDragOver={handleDragOver}
                        >
                            {mainComponents.length === 0 ? (
                                <div style={{
                                    width: '100%',
                                    height: '65vh',
                                    border: '2px dashed #e4e4e7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666',
                                }}>
                                    Drop Components Here
                                </div>
                            ) : (
                                mainComponents.map(component => renderComponentWithDragHandle(component, 'main'))
                            )}
                        </main>
                        {headerFooter &&
                            <footer
                                onDrop={handleDrop('footer')}
                                onDragOver={handleDragOver}
                                style={{ width: '100%', minHeight: '100px', borderTop: '1px dashed #3ec0f7', maxHeight: 'auto', padding: 10, boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, marginBottom: 10 }}>
                                    <span>Footer (appears on all pages)</span>
                                    <IoSettingsOutline size={15} />
                                </div>
                                <div style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    height: 'auto',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 20
                                }}>
                                    {footerComponents.length === 0 ? (
                                        <div style={{
                                            width: '100%',
                                            height: '100px',
                                            border: '2px dashed #e4e4e7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#666',
                                        }}>
                                            Drop Footer Components Here
                                        </div>
                                    ) : (
                                        footerComponents.map(component => renderComponentWithDragHandle(component, 'footer'))
                                    )}
                                </div>
                            </footer>
                        }
                    </Card>
                </div>}
                <div style={{ width: '27%', height: '100%', padding: '10px', boxSizing: 'border-box', overflow: 'auto' }}>
                    <Card
                        style={{ width: '100%', border: '1px solid #e4e4e7' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            <Tabs items={[{
                                key: '1',
                                label: 'Style Configuration',
                                children: (
                                    <Card size="small" title="Style Configuration">
                                        <Form layout="vertical">
                                            <Form.Item label="Title Alignment">
                                                <Select
                                                    defaultValue="left"
                                                    options={[
                                                        { label: 'Left', value: 'left' },
                                                        { label: 'Center', value: 'center' },
                                                        { label: 'Right', value: 'right' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Column Count">
                                                <Select
                                                    defaultValue={1}
                                                    options={[
                                                        { label: '1 Column', value: 1 },
                                                        { label: '2 Columns', value: 2 },
                                                        { label: '3 Columns', value: 3 }
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                )
                            }, {
                                key: '2',
                                label: 'Data Configuration',
                                children: (
                                    <Card size="small" title="Data Configuration">
                                        <Form layout="vertical">
                                            <Form.Item label="Selected Component">
                                                <Select
                                                    value={selectedComponentId}
                                                    onChange={setSelectedComponentId}
                                                    options={mainComponents.map(component => ({ 
                                                        label: component.config.title, 
                                                        value: component.id 
                                                    }))}
                                                    placeholder="Select a component"
                                                />
                                            </Form.Item>
                                            <Form.Item label="Selected Component Type">
                                                <Select
                                                    defaultValue="form"
                                                    options={[
                                                        { label: 'Form', value: 'form' },
                                                        { label: 'Table', value: 'table' },
                                                        { label: 'Tree', value: 'tree' },
                                                        { label: 'List', value: 'list' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Data Connection">
                                                <Select
                                                    value={dataConnection}
                                                    onChange={(value: 'api' | 'database') => setDataConnection(value)}
                                                    options={[
                                                        { label: 'API', value: 'api' },
                                                        { label: 'Database', value: 'database' }
                                                    ]}
                                                />
                                            </Form.Item>
                                            {dataConnection === 'api' && (
                                                <>
                                                <Form.Item label="API URL">
                                                        <Input 
                                                            placeholder="Enter API URL"
                                                            value={dataConfig.apiUrl}
                                                            onChange={e => setDataConfig({...dataConfig, apiUrl: e.target.value})}
                                                        />
                                                </Form.Item>
                                                    <Form.Item label="Method">
                                                        <Select
                                                            defaultValue="GET"
                                                            options={[
                                                                { label: 'GET', value: 'GET' },
                                                                { label: 'POST', value: 'POST' },
                                                                { label: 'PUT', value: 'PUT' },
                                                                { label: 'DELETE', value: 'DELETE' }
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Headers">
                                                        <TextArea 
                                                            placeholder="Enter headers in JSON format"
                                                            rows={3}
                                                        />
                                                    </Form.Item>
                                                </>
                                            )}
                                            {dataConnection === 'database' && (
                                                <>
                                                    <Form.Item label="Database Type">
                                                        <Select
                                                            defaultValue="mysql"
                                                            options={[
                                                                { label: 'MySQL', value: 'mysql' },
                                                                { label: 'PostgreSQL', value: 'postgresql' },
                                                                { label: 'MongoDB', value: 'mongodb' },
                                                                { label: 'SQLite', value: 'sqlite' }
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item label="Table Name">
                                                        <Input placeholder="Enter table name" />
                                                    </Form.Item>
                                                    <Form.Item label="Query">
                                                        <TextArea 
                                                            placeholder="Enter SQL query"
                                                            rows={3}
                                                        />
                                                    </Form.Item>
                                                </>
                                            )}
                                            <Form.Item label="Data Mapping Configuration">
                                                <Radio.Group 
                                                    value={mappingMode} 
                                                    onChange={e => setMappingMode(e.target.value)}
                                                    style={{ marginBottom: '16px' }}
                                                >
                                                    <Radio.Button value="manual">Manual Configuration</Radio.Button>
                                                    <Radio.Button value="upload">Upload Configuration</Radio.Button>
                                                </Radio.Group>

                                                {mappingMode === 'upload' && (
                                                    <Upload
                                                        accept=".json"
                                                        beforeUpload={handleConfigFileUpload}
                                                        maxCount={1}
                                                    >
                                                        <Button icon={<UploadOutlined />}>Upload Configuration File</Button>
                                                    </Upload>
                                                )}

                                                {mappingMode === 'manual' && (
                                                    <>
                                                        <Form.Item label="Source Fields">
                                                            <Select
                                                                mode="multiple"
                                                                placeholder="Select source fields"
                                                                style={{ width: '100%' }}
                                                                options={[
                                                                    { label: 'Field 1', value: 'field1' },
                                                                    { label: 'Field 2', value: 'field2' },
                                                                    { label: 'Field 3', value: 'field3' }
                                                                ]}
                                                            />
                                                        </Form.Item>

                                                        <Form.Item label="Target Fields">
                                                            <Select
                                                                mode="multiple"
                                                                placeholder="Select target fields"
                                                                style={{ width: '100%' }}
                                                                options={[
                                                                    { label: 'Target 1', value: 'target1' },
                                                                    { label: 'Target 2', value: 'target2' },
                                                                    { label: 'Target 3', value: 'target3' }
                                                                ]}
                                                            />
                                                        </Form.Item>

                                                        <Form.Item label="Field Transformations">
                                                            <Card size="small">
                                                                <Form.List name="transformations">
                                                                    {(fields, { add, remove }) => (
                                                                        <>
                                                                            {fields.map(({ key, name }) => (
                                                                                <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                                                    <Form.Item name={[name, 'sourceField']} style={{ flex: 1 }}>
                                                                                        <Select placeholder="Source Field">
                                                                                            <Select.Option value="field1">Field 1</Select.Option>
                                                                                            <Select.Option value="field2">Field 2</Select.Option>
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Form.Item name={[name, 'transformation']} style={{ flex: 1 }}>
                                                                                        <Select placeholder="Transformation">
                                                                                            <Select.Option value="uppercase">To Uppercase</Select.Option>
                                                                                            <Select.Option value="lowercase">To Lowercase</Select.Option>
                                                                                            <Select.Option value="number">To Number</Select.Option>
                                                                                            <Select.Option value="date">To Date</Select.Option>
                                                                                            <Select.Option value="custom">Custom Function</Select.Option>
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Form.Item name={[name, 'targetField']} style={{ flex: 1 }}>
                                                                                        <Select placeholder="Target Field">
                                                                                            <Select.Option value="target1">Target 1</Select.Option>
                                                                                            <Select.Option value="target2">Target 2</Select.Option>
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                                                                </div>
                                                                            ))}
                                                                            <Button type="dashed" onClick={() => add()} block>
                                                                                Add Transformation
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </Form.List>
                                                            </Card>
                                                        </Form.Item>

                                                        <Form.Item label="Validation Rules">
                                                            <Card size="small">
                                                                <Form.List name="validations">
                                                                    {(fields, { add, remove }) => (
                                                                        <>
                                                                            {fields.map(({ key, name }) => (
                                                                                <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                                                    <Form.Item name={[name, 'field']} style={{ flex: 1 }}>
                                                                                        <Select placeholder="Select Field">
                                                                                            <Select.Option value="field1">Field 1</Select.Option>
                                                                                            <Select.Option value="field2">Field 2</Select.Option>
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Form.Item name={[name, 'rule']} style={{ flex: 1 }}>
                                                                                        <Select placeholder="Validation Rule">
                                                                                            <Select.Option value="required">Required</Select.Option>
                                                                                            <Select.Option value="email">Email</Select.Option>
                                                                                            <Select.Option value="number">Number</Select.Option>
                                                                                            <Select.Option value="date">Date</Select.Option>
                                                                                            <Select.Option value="custom">Custom</Select.Option>
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Form.Item name={[name, 'message']} style={{ flex: 1 }}>
                                                                                        <Input placeholder="Error Message" />
                                                                                    </Form.Item>
                                                                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                                                                </div>
                                                                            ))}
                                                                            <Button type="dashed" onClick={() => add()} block>
                                                                                Add Validation Rule
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </Form.List>
                                                            </Card>
                                                        </Form.Item>
                                                    </>
                                                )}

                                                <Form.Item label="Preview Configuration">
                                                    <TextArea
                                                        value={JSON.stringify(mappingConfig, null, 2)}
                                                        rows={6}
                                                        readOnly
                                                    />
                                                </Form.Item>
                                            </Form.Item>
                                            <Form.Item>
                                                <Button 
                                                    type="primary" 
                                                    onClick={handleSaveDataConfig}
                                                    disabled={!selectedComponentId}
                                                >
                                                    Save Configuration
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                )
                            }]} />

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button>Reset</Button>
                                <Button type="primary">Apply Changes</Button>
                            </div>
                        </div>

                    </Card>
                </div>
            </main>

            {/* Copy Template Modal */}
            <Modal
                title="Copy Template"
                open={copyModalVisible}
                onOk={handleCopyTemplate}
                onCancel={() => {
                    setCopyModalVisible(false);
                    copyForm.resetFields();
                }}
                okText="Copy"
                cancelText="Cancel"
            >
                <Form
                    form={copyForm}
                    layout="vertical"
                    style={{ marginTop: 20 }}
                >
                    <Form.Item
                        name="title"
                        label="Template Name"
                        rules={[
                            { required: true, message: 'Please enter template name' },
                            { min: 3, message: 'Template name must be at least 3 characters' }
                        ]}
                        initialValue={config.data?.title ? `Copy of ${config.data.title}` : ''}
                    >
                        <Input placeholder="Enter template name" />
                    </Form.Item>

                    <Form.Item
                        name="version"
                        label="Version"
                        rules={[
                            { required: true, message: 'Please enter version' }
                        ]}
                        initialValue={config.data?.version || ''}
                    >
                        <Input placeholder="Enter version" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { required: true, message: 'Please enter template description' },
                            { min: 10, message: 'Description must be at least 10 characters' }
                        ]}
                        initialValue={config.data?.description || ''}
                    >
                        <Input.TextArea
                            placeholder="Enter template description"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default TemplateBuilder;