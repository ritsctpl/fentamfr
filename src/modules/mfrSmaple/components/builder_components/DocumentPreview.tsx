import React, { useEffect, useState } from 'react';

interface FormMetaData {
    dataIndex: string;
    title: string;
    required?: boolean;
    type?: string;
}

interface ComponentConfig {
    title: string;
    type: 'form' | 'table' | 'list' | 'section' | 'flowChart' | 'tableWithForm';
    metaData?: FormMetaData[];
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
}

interface TemplateComponent {
    id: string;
    type: string;
    config: ComponentConfig;
}

interface DocumentPreviewProps {
    data: {
        components: {
            header: TemplateComponent[];
            main: TemplateComponent[];
            footer: TemplateComponent[];
        };
    };
}

const A4_DIMENSIONS = {
    width: '210mm',
    height: '297mm',
    padding: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
    }
};

const PAGE_CONTENT_HEIGHT = 267; // Adjusted to match A4 height in mm (297mm - 30mm for margins)

const COMPONENT_HEIGHTS = {
    form: (fields: number) => fields * 7,  // More precise height calculation
    table: (rows: number) => (rows * 6) + 10, // Base height + rows
    list: (items: number) => (items * 4) + 8,
    section: (lines: number) => (lines * 4) + 6,
    flowChart: (steps: number) => (steps * 10) + 8 // More precise height per step
};

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ data }) => {
    const { components } = data;
    const [pages, setPages] = useState<{
        content: TemplateComponent[];
    }[]>([]);

    const styles = {
        container: {
            padding: '20px',
            background: '#f5f5f5',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '20px'
        },
        page: {
            width: A4_DIMENSIONS.width,
            minHeight: A4_DIMENSIONS.height,
            background: 'white',
            padding: `${A4_DIMENSIONS.padding.top} ${A4_DIMENSIONS.padding.right} ${A4_DIMENSIONS.padding.bottom} ${A4_DIMENSIONS.padding.left}`,
            boxSizing: 'border-box' as const,
            position: 'relative' as const,
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'visible'
        },
        content: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '4mm',
            position: 'relative' as const,
            overflow: 'visible'
        },
        section: {
            marginBottom: '4mm',
            pageBreakInside: 'avoid' as const,
            breakInside: 'avoid-page' as const
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '11px',
            pageBreakInside: 'avoid' as const,
            breakInside: 'avoid-page' as const
        },
        headerCell: {
            border: '1px solid black',
            padding: '2mm',
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            textAlign: 'center' as const
        },
        cell: {
            border: '1px solid black',
            padding: '2mm',
            verticalAlign: 'top' as const
        },
        list: {
            margin: '0',
            padding: '0 0 0 20px',
            fontSize: '11px',
            lineHeight: '1.4'
        },
        listTitle: {
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '2mm'
        },
        listItem: {
            marginBottom: '1mm'
        },
        section_title: {
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '2mm',
            backgroundColor: '#f8f8f8',
            padding: '2mm'
        },
        section_content: {
            fontSize: '11px',
            lineHeight: '1.4',
            whiteSpace: 'pre-wrap' as const
        },
        flowChart: {
            fontSize: '11px',
            lineHeight: '1.4',
            width: '100%'
        },
        flowChartTitle: {
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '4mm',
            textAlign: 'center' as const
        },
        flowChartSubTitle: {
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '3mm',
            textAlign: 'left' as const
        },
        flowStep: {
            position: 'relative' as const,
            marginBottom: '8mm',
            padding: '3mm',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '2mm',
            textAlign: 'center' as const,
            pageBreakInside: 'avoid' as const
        },
        flowStepArrow: {
            position: 'relative' as const,
            textAlign: 'center' as const,
            marginBottom: '3mm',
            '&::after': {
                content: '"⇩"',
                fontSize: '16px',
                display: 'block',
                marginTop: '2mm'
            }
        },
        pageNumber: {
            position: 'absolute' as const,
            right: A4_DIMENSIONS.padding.right,
            bottom: '5mm',
            fontSize: '9px'
        },
        footer: {
            marginTop: 'auto',
            position: 'relative' as const,
            bottom: 0,
            width: '100%'
        }
    };

    const calculateComponentHeight = (component: TemplateComponent): number => {
        const { config } = component;
        let height = 0;

        // Base height for title if present
        if (config.title) {
            height += 8;
        }

        switch (config.type) {
            case 'form':
                const fieldsPerColumn = config.style?.form?.column 
                    ? Math.ceil((config.metaData?.length || 0) / config.style.form.column)
                    : config.metaData?.length || 0;
                height += fieldsPerColumn * 8;
                break;
            case 'table':
                height += (config.data?.length || 0) * 8 + 10;
                break;
            case 'flowChart':
                const totalSteps = config.data.reduce((acc: number, section: any) => 
                    acc + (section.steps?.length || 0), 0);
                height += totalSteps * 15;
                break;
            default:
                height += 20;
        }

        return height;
    };

    useEffect(() => {
        const mainComponents = components.main || [];
        const newPages: { content: TemplateComponent[] }[] = [];
        let currentPage: TemplateComponent[] = [];
        let currentHeight = 0;
        const MAX_PAGE_HEIGHT = 240; // mm, accounting for margins and header/footer

        const processComponent = (component: TemplateComponent) => {
            const componentHeight = calculateComponentHeight(component);

            // If component height exceeds remaining page space
            if (currentHeight + componentHeight > MAX_PAGE_HEIGHT) {
                // Push current page if not empty
                if (currentPage.length > 0) {
                    newPages.push({ content: [...currentPage] });
                    currentPage = [];
                    currentHeight = 0;
                }

                // If component is larger than page height, split it
                if (component.config.type === 'flowChart') {
                    const steps = component.config.data.reduce((acc: string[], section: any) => 
                        acc.concat(section.steps || []), []);
                    
                    const stepsPerPage = Math.floor(MAX_PAGE_HEIGHT / 15);
                    
                    for (let i = 0; i < steps.length; i += stepsPerPage) {
                        const pageSteps = steps.slice(i, i + stepsPerPage);
                        if (pageSteps.length > 0) {
                            const splitComponent = {
                                ...component,
                                id: `${component.id}-${i}`,
                                config: {
                                    ...component.config,
                                    data: [{
                                        steps: pageSteps
                                    }],
                                    title: i === 0 ? component.config.title : undefined
                                }
                            };
                            
                            if (currentPage.length > 0) {
                                newPages.push({ content: [...currentPage] });
                                currentPage = [];
                            }
                            currentPage = [splitComponent];
                            currentHeight = calculateComponentHeight(splitComponent);
                            
                            if (currentHeight >= MAX_PAGE_HEIGHT) {
                                newPages.push({ content: [...currentPage] });
                                currentPage = [];
                                currentHeight = 0;
                            }
                        }
                    }
                } else {
                    // For other components that don't need splitting
                    currentPage = [component];
                    currentHeight = componentHeight;
                }
            } else {
                // Component fits on current page
                currentPage.push(component);
                currentHeight += componentHeight;
            }
        };

        mainComponents.forEach(processComponent);

        if (currentPage.length > 0) {
            newPages.push({ content: currentPage });
        }

        setPages(newPages);
    }, [components]);

    const renderFormComponent = (component: TemplateComponent) => {
        const { config } = component;
        const formData = config.data.reduce((acc, item) => {
            acc[item.dataIndex] = item.value;
            return acc;
        }, {});

        // Get number of columns from style config or default to 1
        const columns = config.style?.form?.column || 1;

        if (columns > 1 && config.metaData) {
            // Split metadata into columns
            const itemsPerColumn = Math.ceil(config.metaData.length / columns);
            const columnGroups = Array.from({ length: columns }, (_, index) => {
                const start = index * itemsPerColumn;
                return config.metaData.slice(start, start + itemsPerColumn);
            });

            return (
                <div style={styles.section}>
                    {config.title && (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th colSpan={columns * 2} style={styles.headerCell}>
                                        {config.title}
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    )}
                    <table style={styles.table}>
                        <tbody>
                            {Array.from({ length: itemsPerColumn }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columnGroups.map((group, colIndex) => {
                                        const field = group[rowIndex];
                                        if (!field) return null;
                                        return (
                                            <React.Fragment key={colIndex}>
                                                <td style={{ ...styles.cell, width: '15%', backgroundColor: '#f8f8f8' }}>
                                                    {field.title}
                                                </td>
                                                <td style={{ ...styles.cell, width: '35%' }}>
                                                    {formData[field.dataIndex] || ''}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Single column layout
        return (
            <div style={styles.section}>
                {config.title && (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={2} style={styles.headerCell}>
                                    {config.title}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {config.metaData?.map((field, index) => (
                                <tr key={index}>
                                    <td style={{ ...styles.cell, width: '30%', backgroundColor: '#f8f8f8' }}>
                                        {field.title}
                                    </td>
                                    <td style={styles.cell}>
                                        {formData[field.dataIndex] || ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    const renderTableComponent = (component: TemplateComponent) => {
        const { config } = component;
        return (
            <div style={styles.section}>
                {config.title && (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={config.metaData?.length || 0} style={styles.headerCell}>
                                    {config.title}
                                </th>
                            </tr>
                            <tr>
                                {config.metaData?.map((column, index) => (
                                    <th key={index} style={styles.headerCell}>
                                        {column.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {config.data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {config.metaData?.map((column, colIndex) => (
                                        <td key={colIndex} style={styles.cell}>
                                            {row[column.dataIndex]?.toString() || ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    const renderListComponent = (component: TemplateComponent) => {
        const { config } = component;
        return (
            <div style={styles.section}>
                {config.title && <div style={styles.listTitle}>{config.title}</div>}
                {config.data.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        {section.title && <div style={styles.listTitle}>{section.title}</div>}
                        <ul style={styles.list}>
                            {section.list.map((item: string, itemIndex: number) => (
                                <li key={itemIndex} style={styles.listItem}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    const renderSectionComponent = (component: TemplateComponent) => {
        const { config } = component;
        return (
            <div style={styles.section}>
                {config.title && <div style={styles.section_title}>{config.title}</div>}
                {config.data.map((section, index) => (
                    <div key={index}>
                        {section.title && <div style={styles.section_title}>{section.title}</div>}
                        <div style={styles.section_content}>{section.value}</div>
                    </div>
                ))}
            </div>
        );
    };

    const renderFlowChartComponent = (component: TemplateComponent) => {
        const { config } = component;
        return (
            <div style={{
                ...styles.section,
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
            }}>
                {config.title && (
                    <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '4mm',
                        textAlign: 'center'
                    }}>
                        {config.title}
                    </div>
                )}
                {config.data.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        {section.title && <div style={styles.flowChartSubTitle}>{section.title}</div>}
                        {section.steps && section.steps.map((step: string, stepIndex: number) => (
                            <div key={stepIndex} style={{
                                pageBreakInside: 'avoid',
                                breakInside: 'avoid'
                            }}>
                                <div style={{
                                    border: '1px solid black',
                                    padding: '2mm',
                                    marginBottom: '2mm',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    pageBreakInside: 'avoid',
                                    breakInside: 'avoid'
                                }}>
                                    {step}
                                </div>
                                {stepIndex < section.steps.length - 1 && (
                                    <div style={{ 
                                        textAlign: 'center',
                                        marginBottom: '2mm',
                                        fontSize: '14px',
                                        pageBreakInside: 'avoid',
                                        breakInside: 'avoid'
                                    }}>
                                        ⇩
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    const renderComponent = (component: TemplateComponent) => {
        switch (component.config.type) {
            case 'form':
                return renderFormComponent(component);
            case 'table':
                return renderTableComponent(component);
            case 'list':
                return renderListComponent(component);
            case 'section':
                return renderSectionComponent(component);
            case 'flowChart':
                return renderFlowChartComponent(component);
            default:
                return null;
        }
    };

    return (
        <div style={styles.container}>
            {pages.map((page, pageIndex) => (
                <div key={pageIndex} style={{
                    ...styles.page,
                    pageBreakAfter: 'always',
                    pageBreakBefore: pageIndex === 0 ? 'avoid' : 'always'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '8mm' }}>
                        {components.header?.map(component => renderComponent(component))}
                    </div>

                    {/* Main Content */}
                    <div style={styles.content}>
                        {page.content.map(component => renderComponent(component))}
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: 'auto',
                        width: '100%',
                        position: 'relative',
                        bottom: 0,
                        paddingTop: '5mm'
                    }}>
                        {components.footer?.map(component => renderComponent(component))}
                        <div style={{
                            position: 'absolute',
                            right: '0',
                            bottom: '0',
                            fontSize: '9px'
                        }}>
                            Page {pageIndex + 1} of {pages.length}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentPreview; 