import React, { useState, useMemo, useCallback } from 'react';
import { templateDefinition } from './const';
import UniversalForm from './UniversalForm/UniversalForm';
import UniversalTable from './UniversalTable/UniversalTable';
import { Button } from 'antd';

// TypeScript interfaces for ObjectValues structure
interface ComponentData {
    tableData?: {
        rows: any[];
    };
    fieldValues?: Record<string, any>;
}

interface ComponentsMap {
    [componentId: string]: ComponentData;
}

interface FormsMap {
    [formId: string]: {
        components: ComponentsMap;
    };
}

interface SectionsMap {
    [sectionId: string]: {
        forms: FormsMap;
    };
}

interface ObjectValues {
    sections: SectionsMap;
}

// Helper to get a unique key for a component (componentRef or componentId)
const getComponentKey = (component: any) =>
    component.componentRef || component.definition?.componentRef || component.definition?.componentId || component.definition?.componentName;

// Helper to find component values in ObjectValues
const findComponentValues = (compId: string): any => {
    const objectValues = templateDefinition.ObjectValues as ObjectValues;
    if (!objectValues?.sections) {
        return null;
    }

    try {
        // Search through the nested structure to find component data
        for (const sectionId in objectValues.sections) {
            const section = objectValues.sections[sectionId];
            if (!section?.forms) continue;

            for (const formId in section.forms) {
                const form = section.forms[formId];
                if (!form?.components) continue;

                for (const componentId in form.components) {
                    if (componentId === compId) {
                        const component = form.components[componentId];
                        // Return table data or field values based on what exists
                        return component?.tableData?.rows || component?.fieldValues || null;
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Error finding component values:', error);
        return null;
    }
    return null;
};

// Helper to get initial field values from template structure
const getInitialFieldValues = (def: any): any => {
    if (!def?.fields) return {};

    const initialValues: Record<string, any> = {};
    def.fields.forEach((field: any) => {
        const fieldId = field.fieldId;
        if (!fieldId) return;

        if (field.fieldType === 'text') {
            if (field.displayMode === 'static' && field.content) {
                initialValues[fieldId] = field.content;
            } else if (field.displayMode === 'prefilled' && field.templateText) {
                if (field.bindingFields) {
                    initialValues[fieldId] = {
                        template_text: field.templateText,
                        resolved_values: field.bindingFields
                    };
                } else {
                    initialValues[fieldId] = field.multiline 
                        ? field.templateText.split('\n').filter((line: string) => line.trim() !== '')
                        : field.templateText;
                }
            } else if (field.defaultValue) {
                initialValues[fieldId] = field.multiline
                    ? field.defaultValue.split('\n').filter((line: string) => line.trim() !== '')
                    : field.defaultValue;
            }
        } else if (field.defaultValue !== undefined) {
            initialValues[fieldId] = field.defaultValue;
        }
    });
    return initialValues;
};

// Helper to get initial table data
const getInitialTableData = (tableConfig: any): any[] => {
    if (!tableConfig) return [];
    
    // If preloadRows exists, use it
    if (tableConfig.preloadRows?.length > 0) {
        return [...tableConfig.preloadRows];
    }
    
    // If rowControls exists with initialRows, create empty rows
    if (tableConfig.rowControls?.initialRows > 0) {
        return Array(tableConfig.rowControls.initialRows).fill({});
    }
    
    return [];
};

// Helper to group components by alignment
const groupComponentsByAlignment = (components: any[]) => {
    const alignments = [
        'top', 'top-left', 'top-right',
        'left', 'right',
        'bottom', 'bottom-left', 'bottom-right'
    ];
    const grouped: Record<string, any[]> = {};
    alignments.forEach(alignment => grouped[alignment] = []);
    components.forEach(comp => {
        const alignment = comp.componentAlignment || 'top';
        if (!grouped[alignment]) grouped[alignment] = [];
        grouped[alignment].push(comp);
    });
    return grouped;
};

// Helper to get which alignments are present
const getPresentAlignments = (grouped: Record<string, any[]>) => {
    const present: Record<string, boolean> = {};
    Object.keys(grouped).forEach(key => {
        if (grouped[key] && grouped[key].length > 0) present[key] = true;
    });
    return present;
};

// Dynamic area style based on present alignments
const getAreaStyle = (area: string, present: Record<string, boolean>): React.CSSProperties => {
    // Left/Right
    if (area === 'left' && !present.right) return { gridArea: 'left', gridColumn: '1 / -1' };
    if (area === 'right' && !present.left) return { gridArea: 'right', gridColumn: '1 / -1' };
    if (area === 'left' && present.right) return { gridArea: 'left', gridColumn: '1 / 3' };
    if (area === 'right' && present.left) return { gridArea: 'right', gridColumn: '3 / 7' };
    // Top-Left/Top-Right
    if (area === 'top-left' && !present['top-right']) return { gridArea: 'top-left', gridColumn: '1 / 7' };
    if (area === 'top-right' && !present['top-left']) return { gridArea: 'top-right', gridColumn: '7 / -1' };
    if (area === 'top-left' && present['top-right']) return { gridArea: 'top-left', gridColumn: '1 / 7' };
    if (area === 'top-right' && present['top-left']) return { gridArea: 'top-right', gridColumn: '7 / -1' };
    // Bottom-Left/Bottom-Right
    if (area === 'bottom-left' && !present['bottom-right']) return { gridArea: 'bottom-left', gridColumn: '1 / 7' };
    if (area === 'bottom-right' && !present['bottom-left']) return { gridArea: 'bottom-right', gridColumn: '7 / -1' };
    if (area === 'bottom-left' && present['bottom-right']) return { gridArea: 'bottom-left', gridColumn: '1 / 7' };
    if (area === 'bottom-right' && present['bottom-left']) return { gridArea: 'bottom-right', gridColumn: '7 / -1' };
    // Top/Bottom always full width
    if (area === 'top') return { gridArea: 'top', gridColumn: '1 / -1' };
    if (area === 'bottom') return { gridArea: 'bottom', gridColumn: '1 / -1' };
    // Default
    return { gridArea: area };
};

// CSS for the grid layout
const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateAreas: `
        'top top top'
        'top-left center top-right'
        'left center right'
        'bottom-left bottom bottom-right'
    `,
    gridTemplateColumns: '1fr 2fr 1fr',
    gridTemplateRows: 'auto auto auto auto',
    gap: '16px',
};

const TemplateScreen: React.FC = () => {
    // Memoize the initial values calculation
    const initialUserValues = useMemo(() => {
        const components: any[] = [];
        
        try {
            // Process sections and their components
            templateDefinition.ObjectTemplate.sections?.forEach(section => {
                section.definition?.forms?.forEach(form => {
                    form.definition?.components?.forEach(component => {
                        const compId = getComponentKey(component);
                        const def = component.definition;
                        
                        // Get existing values from ObjectValues if they exist
                        const existingValues = findComponentValues(compId);
                        
                        if (existingValues !== null) {
                            // If we have existing values, use them
                            components.push({
                                compId,
                                data: existingValues
                            });
                        } else {
                            // Otherwise, initialize with template defaults
                            if (def.componentType === 'table') {
                                components.push({
                                    compId,
                                    data: getInitialTableData(def.tableConfig)
                                });
                            } else {
                                components.push({
                                    compId,
                                    data: getInitialFieldValues(def)
                                });
                            }
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Error initializing component values:', error);
        }
        
        return components;
    }, []); // Empty dependency array as templateDefinition is constant

    // Initialize userData as array of component values
    const [userValues, setUserValues] = useState<any[]>(initialUserValues);

    // Memoize the component data change handler
    const handleComponentDataChange = useCallback((compId: string, newData: any) => {
        setUserValues(prevValues => {
            const updatedValues = [...prevValues];
            const index = updatedValues.findIndex(item => item.compId === compId);
            
            if (index === -1 && newData !== null) {
                // Add new component data
                updatedValues.push({ compId, data: newData });
            } else if (index !== -1) {
                if (newData === null) {
                    // Remove component data
                    updatedValues.splice(index, 1);
                } else {
                    // Update existing component data
                    updatedValues[index] = { compId, data: newData };
                }
            }
            
            return updatedValues;
        });
    }, []); // No dependencies as it only uses setState

    // Memoize the render component function
    const renderComponent = useCallback((component: any, key: string | number) => {
        const def = component.definition || component;
        const compId = getComponentKey(component);
        const componentData = userValues.find(item => item.compId === compId)?.data || null;
        
        if (def.componentType === 'table') {
            return (
                <div key={key} style={{ marginBottom: 24 }}>
                    <UniversalTable
                        editMode={false}
                        templateStructure={def.tableConfig}
                        userDatas={componentData}
                        setUserDatas={(data: any) => handleComponentDataChange(compId, data)}
                    />
                </div>
            );
        }
        // Default to form/text
        return (
            <div key={key} style={{ marginBottom: 24 }}>
                <UniversalForm
                    editMode={false}
                    templateStructure={def.fields}
                    userData={componentData}
                    setUserData={(data: any) => handleComponentDataChange(compId, data)}
                />
            </div>
        );
    }, [userValues, handleComponentDataChange]);

    // Render a form with alignment-aware layout
    const renderFormWithAlignment = (form: any, key: string) => {
        const components = form.definition?.components || [];
        const grouped = groupComponentsByAlignment(components);
        const present = getPresentAlignments(grouped);
        return (
            <div key={key} style={{ marginBottom: 32 }}>
                <div style={formGridStyle}>
                    <div style={getAreaStyle('top', present)}>
                        {grouped['top'].map((comp: any, idx: number) => renderComponent(comp, `${key}-top-${idx}`))}
                    </div>
                    <div style={getAreaStyle('top-left', present)}>
                        {grouped['top-left'].map((comp: any, idx: number) => renderComponent(comp, `${key}-top-left-${idx}`))}
                    </div>
                    <div style={getAreaStyle('top-right', present)}>
                        {grouped['top-right'].map((comp: any, idx: number) => renderComponent(comp, `${key}-top-right-${idx}`))}
                    </div>
                    <div style={getAreaStyle('left', present)}>
                        {grouped['left'].map((comp: any, idx: number) => renderComponent(comp, `${key}-left-${idx}`))}
                    </div>
                    <div style={{ gridArea: 'center' }}>
                        {/* Center is for components with no alignment or future use */}
                    </div>
                    <div style={getAreaStyle('right', present)}>
                        {grouped['right'].map((comp: any, idx: number) => renderComponent(comp, `${key}-right-${idx}`))}
                    </div>
                    <div style={getAreaStyle('bottom-left', present)}>
                        {grouped['bottom-left'].map((comp: any, idx: number) => renderComponent(comp, `${key}-bottom-left-${idx}`))}
                    </div>
                    <div style={getAreaStyle('bottom', present)}>
                        {grouped['bottom'].map((comp: any, idx: number) => renderComponent(comp, `${key}-bottom-${idx}`))}
                    </div>
                    <div style={getAreaStyle('bottom-right', present)}>
                        {grouped['bottom-right'].map((comp: any, idx: number) => renderComponent(comp, `${key}-bottom-right-${idx}`))}
                    </div>
                </div>
            </div>
        );
    };

    // Memoize the forms and components renderer
    const renderFormsAndComponents = useCallback((list: any[] = [], prefix: string) =>
        list.map((item: any, idx: number) => {
            // If it's a form, render with alignment
            if (item.definition?.components) {
                return renderFormWithAlignment(item, `${prefix}-form-${idx}`);
            }
            // If it's a direct component
            return renderComponent(item, `${prefix}-comp-${idx}`);
        }), [renderComponent]);

    // Memoize save handler
    const handleSave = useCallback(() => {
        const objectValues: ObjectValues = {
            sections: {}
        };

        templateDefinition.ObjectTemplate.sections?.forEach(section => {
            const sectionId = section.sectionRef;
            if (!sectionId) return;

            objectValues.sections[sectionId] = { forms: {} };

            section.definition?.forms?.forEach(form => {
                const formId = form.formRef;
                if (!formId) return;

                objectValues.sections[sectionId].forms[formId] = { components: {} };

                form.definition?.components?.forEach(component => {
                    const compId = getComponentKey(component);
                    if (!compId) return;

                    const componentData = userValues.find(item => item.compId === compId)?.data;
                    
                    if (componentData) {
                        const componentValue: ComponentData = 
                            component.definition?.componentType === 'table'
                                ? { tableData: { rows: componentData } }
                                : { fieldValues: componentData };
                                
                        objectValues.sections[sectionId].forms[formId].components[compId] = componentValue;
                    }
                });
            });
        });

        const saveObj = {
            ObjectTemplate: templateDefinition.ObjectTemplate,
            objectValues
        };
        console.log('Save:', saveObj);
    }, [userValues]); // Only depends on userValues

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <Button onClick={handleSave}>Save</Button>
            </div>
            {/* Render sections, and their forms/components */}
            {templateDefinition.ObjectTemplate.sections?.map((section: any, sidx: number) => (
                <div key={`section-${sidx}`} style={{ marginBottom: 32 }}>
                    <h2>{section.definition?.sectionName}</h2>
                    {/* Section forms */}
                    {renderFormsAndComponents(section.definition?.forms, `section-${sidx}-form`)}
                </div>
            ))}
        </div>
    );
};

export default TemplateScreen;
