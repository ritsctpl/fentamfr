import React, { useState, useEffect } from 'react';
import { Button, Input, Splitter, Modal, Space, Typography, message } from "antd";
import { PlusOutlined, AppstoreAddOutlined, InsertRowAboveOutlined, BlockOutlined, SaveOutlined, FolderOpenOutlined, FontSizeOutlined, TableOutlined, PieChartOutlined, 
CreditCardOutlined, LineChartOutlined, BarChartOutlined, 
FormOutlined, SnippetsOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { DraggableWidget } from './components/main/DraggableWidget';
import { DroppableArea } from './components/main/DroppableArea';
import { WidgetRenderer } from './WidgetRenderer';
import { PropertiesPanel } from './components/main/PropertiesPanel';
import { ComponentTree } from './components/main/ComponentTree';
import { DashboardWidget, ApiConfig } from './types';
import { DEFAULT_PROPS, DEFAULT_STYLES } from './hooks/constants';
import { executeApiCall } from './utils/apiHandler';
import CommonAppBar from '@components/CommonAppBar';
import { Layout } from 'antd';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface SavedDashboard {
    name: string;
    widgets: Record<string, DashboardWidget>;
    savedAt: string;
}

const Main: React.FC = () => {
    const router = useRouter();
    const [widgets, setWidgets] = useState<Record<string, DashboardWidget>>({});
    const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'components' | 'layers'>('components');
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [loadModalVisible, setLoadModalVisible] = useState(false);
    const [dashboardName, setDashboardName] = useState('');
    const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
    const [call, setCall] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over) {
            const isNewWidget = typeof active.id === 'string' && !widgets[active.id];
            const overId = over.id === 'dashboard-canvas' ? null : over.id;

            if (isNewWidget) {
                // Creating a new widget
                const newWidgetId = `${active.id}-${Date.now()}`;
                const { x, y } = event.delta;
                const widgetType = active.id as keyof typeof DEFAULT_PROPS;

                const newWidget: DashboardWidget = {
                    id: newWidgetId,
                    type: widgetType,
                    position: { x, y },
                    parentId: overId as string | undefined,
                    children: [],
                    props: {
                        style: DEFAULT_STYLES[widgetType],
                        ...(widgetType === 'form' ? { formFields: [...DEFAULT_PROPS.form.formFields] } : {}),
                        ...(widgetType === 'text' ? { text: DEFAULT_PROPS.text.text } : {}),
                        ...(widgetType === 'button' ? { text: DEFAULT_PROPS.button.text } : {}),
                        ...(widgetType === 'card' ? { title: DEFAULT_PROPS.card.title } : {})
                    }
                };

                setWidgets(prev => ({
                    ...prev,
                    [newWidgetId]: newWidget
                }));

                // If dropped into another widget, update parent's children
                if (overId) {
                    setWidgets(prev => ({
                        ...prev,
                        [overId]: {
                            ...prev[overId],
                            children: [...(prev[overId].children || []), newWidgetId]
                        }
                    }));
                }
            } else {
                // Moving existing widget
                const widgetId = active.id as string;
                const oldParentId = widgets[widgetId].parentId;

                if (oldParentId !== overId) {
                    setWidgets(prev => {
                        const newWidgets = { ...prev };

                        // Remove from old parent
                        if (oldParentId && prev[oldParentId]) {
                            newWidgets[oldParentId] = {
                                ...prev[oldParentId],
                                children: prev[oldParentId].children?.filter(id => id !== widgetId) || []
                            };
                        }

                        // Add to new parent
                        if (overId) {
                            newWidgets[overId] = {
                                ...prev[overId],
                                children: [...(prev[overId].children || []), widgetId]
                            };
                        }

                        // Update widget's parent
                        newWidgets[widgetId] = {
                            ...prev[widgetId],
                            parentId: overId as string | undefined
                        };

                        return newWidgets;
                    });
                }
            }
        }
    };

    const handleUpdateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
        setWidgets(prev => ({
            ...prev,
            [widgetId]: {
                ...prev[widgetId],
                ...updates,
                props: {
                    ...prev[widgetId].props,
                    ...updates.props
                }
            }
        }));
    };

    const handleDeleteWidget = (widgetId: string) => {
        setWidgets(prev => {
            const newWidgets = { ...prev };
            const widgetToDelete = newWidgets[widgetId];

            // Remove from parent's children
            if (widgetToDelete.parentId && newWidgets[widgetToDelete.parentId]) {
                newWidgets[widgetToDelete.parentId] = {
                    ...newWidgets[widgetToDelete.parentId],
                    children: newWidgets[widgetToDelete.parentId].children?.filter(id => id !== widgetId) || []
                };
            }

            // Recursively delete all children
            const deleteChildren = (parentId: string) => {
                const widget = newWidgets[parentId];
                if (widget.children) {
                    widget.children.forEach(childId => {
                        deleteChildren(childId);
                        delete newWidgets[childId];
                    });
                }
            };

            deleteChildren(widgetId);
            delete newWidgets[widgetId];

            if (selectedWidget === widgetId) {
                setSelectedWidget(null);
            }

            return newWidgets;
        });
    };

    const handleDuplicateWidget = (widgetId: string) => {
        const widget = widgets[widgetId];
        if (!widget) return;

        const duplicateWidget = (originalId: string, parentId?: string): string => {
            const original = widgets[originalId];
            const newId = `${original.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            setWidgets(prev => ({
                ...prev,
                [newId]: {
                    ...original,
                    id: newId,
                    parentId,
                    children: [],
                    position: parentId ? original.position : {
                        x: original.position.x + 20,
                        y: original.position.y + 20
                    },
                    props: {
                        ...original.props
                    }
                }
            }));

            // Duplicate children recursively
            if (original.children) {
                original.children.forEach(childId => {
                    const newChildId = duplicateWidget(childId, newId);
                    setWidgets(prev => ({
                        ...prev,
                        [newId]: {
                            ...prev[newId],
                            children: [...(prev[newId].children || []), newChildId]
                        }
                    }));
                });
            }

            return newId;
        };

        const newId = duplicateWidget(widgetId, widget.parentId);

        // Add to parent's children if it has a parent
        if (widget.parentId) {
            setWidgets(prev => ({
                ...prev,
                [widget.parentId!]: {
                    ...prev[widget.parentId!],
                    children: [...(prev[widget.parentId!].children || []), newId]
                }
            }));
        }
    };

    const handleToggleVisibility = (widgetId: string) => {
        setWidgets(prev => ({
            ...prev,
            [widgetId]: {
                ...prev[widgetId],
                props: {
                    ...prev[widgetId].props,
                    hidden: !prev[widgetId].props?.hidden
                }
            }
        }));
    };

    const handleFormSubmit = (formId: string, values: any) => {
        console.log('Form submitted in Main:', {
            formId,
            values,
            currentFormData: formData
        });
        
        // Update formData state with the correct structure
        setFormData(prev => {
            const newFormData = {
                ...prev,
                [formId]: values  // Store values under the form ID
            };
            console.log('Updated formData in Main:', newFormData);
            return newFormData;
        });
        
        // Update widget's lastSubmittedValues
        setWidgets(prev => {
            const updatedWidgets = {
                ...prev,
                [formId]: {
                    ...prev[formId],
                    lastSubmittedValues: values
                }
            };
            console.log('Updated widgets in Main:', updatedWidgets);
            return updatedWidgets;
        });

        // Handle flow connect if present
        if (widgets[formId]?.props?.flowConnect?.api) {
            const flowConnect = widgets[formId].props.flowConnect;
            handleApiCall(formId, flowConnect.targetComponent, flowConnect.api, values);
        }
    };

    const renderWidgetTree = (parentId: string | null = null) => {
        return Object.values(widgets)
            .filter(widget => widget.parentId === parentId && !widget.props?.hidden)
            .map(widget => (
                <WidgetRenderer
                    key={widget.id}
                    id={widget.id}
                    type={widget.type}
                    isSelected={selectedWidget === widget.id}
                    onSelect={() => setSelectedWidget(widget.id)}
                    style={{
                        position: parentId ? 'relative' : 'absolute',
                        left: parentId ? 0 : widget.position.x,
                        top: parentId ? 0 : widget.position.y,
                        ...widget.props?.style
                    }}
                    isEditMode={true}
                    {...widget.props}
                    formData={formData}
                    allComponents={widgets}
                    onFormSubmit={widget.type === 'form' ? 
                        (values) => handleFormSubmit(widget.id, values) : 
                        undefined
                    }
                >
                    {renderWidgetTree(widget.id)}
                </WidgetRenderer>
            ));
    };

    const handleSave = () => {
        if (!dashboardName.trim()) {
            message.error('Please enter a dashboard name');
            return;
        }

        const dashboard: SavedDashboard = {
            name: dashboardName,
            widgets,
            savedAt: new Date().toISOString()
        };

        // Save to localStorage
        const existingDashboards = JSON.parse(localStorage.getItem('savedDashboards') || '[]');
        const newDashboards = [...existingDashboards, dashboard];
        localStorage.setItem('savedDashboards', JSON.stringify(newDashboards));
        setSavedDashboards(newDashboards);

        message.success('Dashboard saved successfully!');
        setSaveModalVisible(false);
        setDashboardName('');
    };

    const handleLoad = (dashboard: SavedDashboard) => {
        setWidgets(dashboard.widgets);
        setLoadModalVisible(false);
        message.success('Dashboard loaded successfully!');
    };

    const loadSavedDashboards = () => {
        const dashboards = JSON.parse(localStorage.getItem('savedDashboards') || '[]');
        setSavedDashboards(dashboards);
        setLoadModalVisible(true);
    };

    const viewDashboards = () => {
        router.push('/rits/dashboard');
    };

    const handleApiCall = async (sourceWidgetId: string, targetWidgetId: string, api: ApiConfig, values?: any) => {
        try {
            const data = await executeApiCall(api, values);

            // Update the target widget with the API response
            if (widgets[targetWidgetId]) {
                handleUpdateWidget(targetWidgetId, {
                    props: {
                        ...widgets[targetWidgetId].props,
                        text: widgets[targetWidgetId].props?.text?.replace(/\{(\w+)\}/g, (match, key) => {
                            return data[key] !== undefined ? String(data[key]) : match;
                        })
                    }
                });
            }

            message.success('API call successful');
            return data;
        } catch (error) {
            message.error('API call failed');
            console.error('API call error:', error);
            throw error;
        }
    };

    const handleClick = async (widgetId: string) => {
        const widget = widgets[widgetId];
        if (widget?.props?.flowConnect?.type === 'onClick' &&
            widget.props.flowConnect.api &&
            widget.props.flowConnect.targetComponent) {
            await handleApiCall(
                widgetId,
                widget.props.flowConnect.targetComponent,
                widget.props.flowConnect.api
            );
        }
    };

    const handleMouseEnter = async (widgetId: string) => {
        const widget = widgets[widgetId];
        if (widget?.props?.flowConnect?.type === 'onHover' &&
            widget.props.flowConnect.api &&
            widget.props.flowConnect.targetComponent) {
            await handleApiCall(
                widgetId,
                widget.props.flowConnect.targetComponent,
                widget.props.flowConnect.api
            );
        }
    };

    useEffect(() => {
        // Handle onPageLoad API calls
        Object.entries(widgets).forEach(([widgetId, widget]) => {
            if (widget.props?.flowConnect?.type === 'onPageLoad' &&
                widget.props.flowConnect.api &&
                widget.props.flowConnect.targetComponent) {
                handleApiCall(
                    widgetId,
                    widget.props.flowConnect.targetComponent,
                    widget.props.flowConnect.api
                );
            }
        });
    }, []);

    return (
        <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' ,backgroundColor:'#fcfbfc'}}>
            <CommonAppBar
                onSearchChange={() => {}}
                allActivities={[]}
                username={''}
                site={''}
                appTitle={'Dashboard Creator'}
                onSiteChange={() => setCall(call + 1)}
            />
            <div style={{ width: '100%', height: '95%', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    height: '5%',
                    borderBottom: '1px solid #e8e8e8',
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff'
                }}>
                    <Space>
                        <Button
                            icon={<SaveOutlined />}
                            size='small'
                            onClick={() => setSaveModalVisible(true)}
                        >
                            Save
                        </Button>
                        <Button
                            icon={<FolderOpenOutlined />}
                            size='small'
                            onClick={loadSavedDashboards}
                        >
                            Load
                        </Button>
                        <Button
                            type="link"
                            onClick={viewDashboards}
                        >
                            View Dashboards
                        </Button>
                    </Space>
                </div>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <Splitter style={{ height: '95%' }}>
                        <Splitter.Panel defaultSize="3%" min="3%" max="3%">
                            <Button
                                type={activeView === 'components' ? "dashed" : "default"}
                                style={{ width: '100%', height: '7%', borderRadius: '0px', border: 'none' }}
                                onClick={() => setActiveView('components')}
                            >
                                <PlusOutlined />
                            </Button>
                            <Button
                                type={activeView === 'layers' ? "dashed" : "default"}
                                style={{ width: '100%', height: '7%', borderRadius: '0px', border: 'none' }}
                                onClick={() => setActiveView('layers')}
                            >
                                <AppstoreAddOutlined />
                            </Button>
                            <Button type="default" style={{ width: '100%', height: '7%', borderRadius: '0px', border: 'none' }}>
                                <InsertRowAboveOutlined />
                            </Button>
                        </Splitter.Panel>
                        <Splitter.Panel defaultSize="20%" min="3%" max="77%" style={{ overflow: 'auto' }}>
                            {activeView === 'components' ? (
                                <div style={{ height: '100%' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', padding: '10px' }}>
                                        Add
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        padding: '10px',
                                        boxSizing: 'border-box',
                                        borderBottom: '1px solid rgba(45, 45, 45, 0.2)'
                                    }}>
                                        <Input placeholder='Search for a widget' />
                                    </div>
                                    <div style={{ padding: '10px', boxSizing: 'border-box' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Components</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            <DraggableWidget
                                                id="div"
                                                icon={<BlockOutlined style={{ fontSize: '30px' }} />}
                                                label="div"
                                            />
                                            <DraggableWidget
                                                id="button"
                                                icon={<BlockOutlined style={{ fontSize: '30px' }} />}
                                                label="Button"
                                            />
                                            <DraggableWidget
                                                id="text"
                                                icon={<FontSizeOutlined style={{ fontSize: '30px' }} />}
                                                label="Text"
                                            />
                                            <DraggableWidget
                                                id="table"
                                                icon={<TableOutlined style={{ fontSize: '30px' }} />}
                                                label="Table"
                                            />
                                            <DraggableWidget
                                                id="card"
                                                icon={<CreditCardOutlined style={{ fontSize: '30px' }} />}
                                                label="Card"
                                            />
                                            <DraggableWidget
                                                id="form"
                                                icon={<FormOutlined style={{ fontSize: '30px' }} />}
                                                label="Form"
                                            />
                                            <DraggableWidget
                                                id="appbar"
                                                icon={<FormOutlined style={{ fontSize: '30px' }} />}
                                                label="AppBar"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px', boxSizing: 'border-box' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Charts</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            <DraggableWidget
                                                id="gauge"
                                                icon={<PieChartOutlined style={{ fontSize: '30px' }} />}
                                                label="Gauge"
                                            />
                                            <DraggableWidget
                                                id="bar"
                                                icon={<BarChartOutlined style={{ fontSize: '30px' }} />}
                                                label="Bar"
                                            />
                                            <DraggableWidget
                                                id="line"
                                                icon={<LineChartOutlined style={{ fontSize: '30px' }} />}
                                                label="Line"
                                            />
                                            
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px', boxSizing: 'border-box' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Inputs</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            <DraggableWidget
                                                id="textInput"
                                                icon={<SnippetsOutlined style={{ fontSize: '30px' }} />}
                                                label="Text Input"
                                            />
                                            <DraggableWidget
                                                id="browse"
                                                icon={<SnippetsOutlined style={{ fontSize: '30px' }} />}
                                                label="Browse"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <ComponentTree
                                    widgets={widgets}
                                    selectedWidget={selectedWidget}
                                    onSelect={setSelectedWidget}
                                    onDelete={handleDeleteWidget}
                                    onDuplicate={handleDuplicateWidget}
                                    onToggleVisibility={handleToggleVisibility}
                                />
                            )}
                        </Splitter.Panel>
                        <Splitter.Panel defaultSize="57%" min="20%" max="80%">
                            <DroppableArea>
                                {renderWidgetTree()}
                            </DroppableArea>
                        </Splitter.Panel>
                        <Splitter.Panel defaultSize="20%" min="20%" max="20%" style={{ overflow: 'auto' }}>
                            <PropertiesPanel
                                widget={selectedWidget ? widgets[selectedWidget] : null}
                                onUpdateWidget={handleUpdateWidget}
                                widgets={Object.values(widgets)}
                            />
                        </Splitter.Panel>
                    </Splitter>
                </DndContext>

                <Modal
                    title="Save Dashboard"
                    open={saveModalVisible}
                    onOk={handleSave}
                    onCancel={() => setSaveModalVisible(false)}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>Enter a name for your dashboard:</Text>
                        <Input
                            placeholder="Dashboard name"
                            value={dashboardName}
                            onChange={e => setDashboardName(e.target.value)}
                        />
                    </Space>
                </Modal>

                <Modal
                    title="Load Dashboard"
                    open={loadModalVisible}
                    onCancel={() => setLoadModalVisible(false)}
                    footer={null}
                >
                    <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                        {savedDashboards.length === 0 ? (
                            <Text>No saved dashboards found</Text>
                        ) : (
                            savedDashboards.map((dashboard, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '10px',
                                        border: '1px solid #e8e8e8',
                                        marginBottom: '10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => handleLoad(dashboard)}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{dashboard.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            Saved: {new Date(dashboard.savedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <Button size="small" type="primary">
                                        Load
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default Main;
