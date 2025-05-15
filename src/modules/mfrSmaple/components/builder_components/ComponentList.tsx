import React, { useEffect, useState } from 'react';
import { Card, Divider } from 'antd';
import { FormOutlined, TableOutlined } from '@ant-design/icons';

interface ComponentListProps {
    onDragStart: (componentType: string) => void;
}

interface SavedComponent {
    id: number;
    componentName: string;
    description: string;
    type: 'Table' | 'Form' | 'Section';
    config: {
        title: string;
        columns: any[];
        data: any[];
        style: any;
    };
}

const ComponentList: React.FC<ComponentListProps> = ({ onDragStart }) => {
    const [savedComponents, setSavedComponents] = useState<SavedComponent[]>([]);

    // Load saved components from localStorage
    useEffect(() => {
        const components = localStorage.getItem('components');
        if (components) {
            setSavedComponents(JSON.parse(components));
        }
    }, []);

    const predefinedComponents = [
        {
            type: 'ProductDetails',
            title: 'Product Details',
            icon: <FormOutlined />,
            description: 'Form component for product details'
        },
        {
            type: 'BillOfMaterial',
            title: 'Bill of Material',
            icon: <TableOutlined />,
            description: 'Table component for materials list'
        },
        {
            type: 'MasterFormulaRecord',
            title: 'Master Formula Record',
            icon: <FormOutlined />,
            description: 'Form component for master formula record'
        },
        {
            type: 'ApprovedBy',
            title: 'Approved By MFR',
            icon: <TableOutlined />,
            description: 'Table component for approved by'
        },
        {
            type: 'ActiveComposition',
            title: 'Active Composition',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'Abbreviations',
            title: 'Abbreviations',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'BrifMaifacturing',
            title: 'Brif Maifacturing',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'GeneralDosAndDonts',
            title: 'General Do’s & Don’ts:',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'ManufacturingProcedure',
            title: 'Manufacturing Procedure',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },

        //BMR//

        {
            type: 'BatchManufacturingRecord',
            title: 'Batch Manufacturing Record',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'AprovedbyBMR',
            title: 'Aproved By BMR',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'ProductDetailsBmr',
            title: 'Product Details BMR',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'ProcessingInstructions',
            title: 'Processing Instructions',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'RawMaterialIndent',
            title: 'Raw Material Indent',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'LineClearanceForManufacturing',
            title: 'Line Clearance For Manufacturing',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'RawMaterialDispensing',  
            title: 'Raw Material Dispensing',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'FlowView',
            title: 'Flow View',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'RawMaterialDispensingList',
            title: 'Raw Material Dispensing List',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'RawMaterialDispensingAreaTemp',
            title: 'Raw Material Dispensing Area Temperature',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'EquipmentCalibrationSOPDetails',
            title: 'Equipment’s Calibration & Operations SOP details:',
            icon: <TableOutlined />,
            description: 'Table component for composition by'
        },
        {
            type: 'Manufacturing',
            title: 'Manufacturing',
            icon: <TableOutlined />,
            description: 'Table component for composition by'  
        },
        {
            type: 'BulkSampling',
            title: 'Bulk Sampling',
            icon: <TableOutlined />,
            description: 'Table component for composition by'  
        },
        {
            type: 'BulkSample',
            title: 'Bulk Sample',
            icon: <TableOutlined />,
            description: 'Table component for composition by'  
        },
        {
            type: 'BulkSpecification',
            title: 'Bulk Specification',
            icon: <TableOutlined />,
            description: 'Table component for composition by'  
        },
        {
            type: 'BulkUnloading',
            title: 'Bulk Unloading',
            icon: <TableOutlined />,
            description: 'Table component for composition by'  
        },
        {
            type: 'BulkYeildCalculation',
            title: 'Bulk Yeild Calculation',
            icon: <TableOutlined />,
            description: 'Table component for composition by'  
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
                <h4 style={{ margin: '0 0 10px 0' }}>Predefined Components</h4>
                {predefinedComponents.map((component) => (
                    <Card
                        key={component.type}
                        size="small"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('componentType', component.type);
                            onDragStart(component.type);
                        }}
                        style={{ cursor: 'grab', marginBottom: '8px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {component.icon}
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{component.title}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{component.description}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {savedComponents.length > 0 && (
                <>
                    <Divider style={{ margin: '12px 0' }} />
                    <div>
                        <h4 style={{ margin: '0 0 10px 0' }}>Saved Components</h4>
                        {savedComponents.map((component) => (
                            <Card
                                key={component.id}
                                size="small"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('componentType', `saved_${component.id}`);
                                    e.dataTransfer.setData('componentData', JSON.stringify(component));
                                    onDragStart(`saved_${component.id}`);
                                }}
                                style={{ cursor: 'grab', marginBottom: '8px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {component.type === 'Form' ? <FormOutlined /> : <TableOutlined />}
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{component.componentName}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{component.description}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ComponentList; 