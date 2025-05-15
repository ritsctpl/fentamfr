import React, { useEffect, useState } from 'react';
import "../TemplateMain.css";
import { Button, Card, Dropdown, Input, Modal, Tag, message } from 'antd';
import Title from 'antd/es/typography/Title';
import { DeleteOutlined, EditOutlined, FilterOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import ComponentBuilder from './builder/ComponentBuilder';
import { IoAdd } from "react-icons/io5";

interface Component {
    id: number;
    componentName: string;
    description: string;
    type: 'Table' | 'Form' | 'Section';
    updatedDate: string;
    config: {
        title: string;
        columns: any[];
        data: any[];
        style: any;
    };
}

function ComponentScreen() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isVisible, setVisible] = useState(true);
    const [data, setData] = useState<Component | null>(null);
    const [components, setComponents] = useState<Component[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Load components from localStorage
    useEffect(() => {
        const savedComponents = localStorage.getItem('components');
        if (savedComponents) {
            setComponents(JSON.parse(savedComponents));
        }
    }, []);

    // Save components to localStorage
    useEffect(() => {
        localStorage.setItem('components', JSON.stringify(components));
    }, [components]);

    const handleSaveComponent = (componentData: any) => {
        const newComponent: Component = {
            id: Date.now(),
            componentName: componentData.componentName,
            description: componentData.description,
            type: componentData.type,
            updatedDate: new Date().toLocaleDateString(),
            config: {
                title: componentData.config.title,
                columns: componentData.config.columns,
                data: componentData.config.data,
                style: componentData.config.style
            }
        };

        setComponents(prev => [...prev, newComponent]);
        message.success('Component saved successfully!');
    };

    const handleDeleteComponent = (componentId: number) => {
        Modal.confirm({
            title: 'Delete Component',
            content: 'Are you sure you want to delete this component?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                setComponents(prev => prev.filter(c => c.id !== componentId));
                message.success('Component deleted successfully!');
            }
        });
    };

    const handleEditComponent = (component: Component) => {
        setData(component);
        setVisible(false);
    };

    const handleShow = (component: Component | null) => {
        setData(component);
        setVisible(false);
    };

    const filteredComponents = components.filter(component =>
        (component.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedType || component.type === selectedType)
    );

    const getComponentTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'Table': 'blue',
            'Form': 'green',
            'Section': 'orange'
        };
        return colors[type] || 'default';
    };

    return (
        isVisible ? (
            <div className="TemplateScreen">
                <header style={{ width: '100%', height: '8%', display: 'flex', justifyContent: 'space-between' }}>
                    <Title level={3} style={{ margin: 0 }}>List of Components</Title>
                    <Button type="primary" onClick={() => handleShow(null)}>
                        <IoAdd size={20}/>New Component
                    </Button>
                </header>
                <main style={{ width: '100%', height: '92%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Input 
                            type="text" 
                            placeholder="Search Components" 
                            size="large" 
                            prefix={<SearchOutlined />}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            allowClear 
                        />
                        <Button 
                            size="large"
                            onClick={() => setSelectedType(null)}
                            style={{ float: 'right' }}
                        >
                            <FilterOutlined />
                        </Button>
                    </div>
                    <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'wrap', 
                        gap: 20,
                        overflow: 'auto'
                    }}>
                        {filteredComponents.map((component) => (
                            <Card
                                key={component.id}
                                hoverable
                                title={component.componentName}
                                extra={
                                    <Dropdown
                                        menu={{
                                            items: [
                                                {
                                                    key: 'edit',
                                                    label: 'Edit',
                                                    icon: <EditOutlined />,
                                                    onClick: () => handleEditComponent(component)
                                                },
                                                {
                                                    key: 'delete',
                                                    label: 'Delete',
                                                    icon: <DeleteOutlined />,
                                                    danger: true,
                                                    onClick: () => handleDeleteComponent(component.id)
                                                }
                                            ]
                                        }}
                                        trigger={['click']}
                                    >
                                        <Button size="small" className="btmInfo">
                                            <MoreOutlined />
                                        </Button>
                                    </Dropdown>
                                }
                                style={{ 
                                    width: 400, 
                                    height: 'max-content', 
                                    border: '1px solid #ccc',
                                }}
                                styles={{
                                    header: {
                                        borderBottom: 'none',
                                        minHeight: '40px',
                                    },
                                    body: {
                                        minHeight: '100px',
                                        paddingTop: '0',
                                    },
                                }}
                            >
                                <p style={{ 
                                    color: '#666', 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis' 
                                }}>
                                    {component.description}
                                </p>
                                <p style={{ color: '#666' }}>
                                    <Tag color={getComponentTypeColor(component.type)}>
                                        {component.type}
                                    </Tag> 
                                    Updated {component.updatedDate}
                                </p>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'end',
                                    width: '100%',
                                }}>
                                    <Button 
                                        style={{ fontWeight: '500' }}
                                        onClick={() => handleEditComponent(component)}
                                    >
                                        <EditOutlined />Edit
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        ) : (
            <ComponentBuilder 
                config={{
                    isVisible,
                    setVisible,
                    data,
                    onSave: handleSaveComponent,
                    permitive: data ? 'edit' : undefined
                }}
            />
        )
    );
}

export default ComponentScreen;
