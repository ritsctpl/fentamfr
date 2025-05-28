import React, { useState, useEffect } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Table, Typography } from 'antd';
import moment from 'moment';

interface PreviewContentProps {
  previewData: any[];
  getGroupIds: any[];
}

const PreviewContent: React.FC<PreviewContentProps> = ({ previewData, getGroupIds }) => {
  const [form] = Form.useForm();
  const [pageCount, setPageCount] = useState(1);
  const { Title } = Typography;

  // Function to find the config type for a section based on sectionLabel
  const getSectionConfig = (sectionLabel: string) => {
    const groupId = getGroupIds.find(group => group.label === sectionLabel);
    return groupId?.config || { type: 'body' };
  };

  // Organize sections by type (header, body, footer) regardless of their position in the array
  const headerSections = previewData.filter(section => 
    getSectionConfig(section.sectionLabel).type === 'header'
  );
  
  const footerSections = previewData.filter(section => 
    getSectionConfig(section.sectionLabel).type === 'footer'
  );
  
  const bodySections = previewData.filter(section => {
    const config = getSectionConfig(section.sectionLabel);
    return config.type !== 'header' && config.type !== 'footer';
  });

  // Use the first header and footer if multiple are defined
  const headerSection = headerSections.length > 0 ? headerSections[0] : null;
  const footerSection = footerSections.length > 0 ? footerSections[0] : null;

  // Calculate approximate content size to determine if multiple pages are needed
  useEffect(() => {
    // Simple estimation - each component might take roughly 100px height
    const totalComponents = bodySections.reduce((acc, section) => {
      return acc + (section.components?.length || 0);
    }, 0);
    
    // A4 height minus header/footer space divided by average component height
    const componentsPerPage = 8; // Rough estimate
    const estimatedPages = Math.max(1, Math.ceil(totalComponents / componentsPerPage));
    
    setPageCount(estimatedPages);
  }, [bodySections]);

  // Render a table-like layout for form items
  const renderFormItemAsTableRow = (component: any) => {
    const {
      componentLabel,
      dataType,
      unit,
      defaultValue,
    } = component;

    const label = unit ? `${componentLabel} (${unit})` : componentLabel;
    let value = defaultValue;

    if (dataType === 'DatePicker' && defaultValue) {
      value = moment(defaultValue).format('DD/MM/YYYY');
    } else if (dataType === 'Decimal' || dataType === 'Integer') {
      value = unit ? `${defaultValue} ${unit}` : defaultValue;
    }

    return (
      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ 
          width: '200px', 
          padding: '8px 12px', 
          fontWeight: 'normal',
          textAlign: 'left',
          borderRight: '1px solid #f0f0f0'
        }}>
          {label}
        </div>
        <div style={{ 
          flex: 1, 
          padding: '8px 12px',
          textAlign: 'left'
        }}>
          {value || ''}
        </div>
      </div>
    );
  };

  const renderComponent = (component: any, sectionType: string) => {
    const {
      componentLabel,
      dataType,
      unit,
      defaultValue,
      required,
      tableConfig,
    } = component;

    // For master formula record section, render as table rows
    if (sectionType === 'MASTER FORMULA RECORD' && dataType !== 'Table') {
      return renderFormItemAsTableRow(component);
    }

    const label = unit ? `${componentLabel} (${unit})` : componentLabel;

    switch (dataType) {
      case 'Input':
        return (
          <Form.Item
            label={label}
            name={componentLabel}
            rules={[{ required: required }]}
            initialValue={defaultValue}
            style={{ marginBottom: '8px' }}
          >
            <Input placeholder={`Enter ${componentLabel}`} disabled />
          </Form.Item>
        );

      case 'Decimal':
        return (
          <Form.Item
            label={label}
            name={componentLabel}
            rules={[{ required: required }]}
            initialValue={defaultValue}
            style={{ marginBottom: '8px' }}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`Enter ${componentLabel}`}
              disabled
            />
          </Form.Item>
        );

      case 'Integer':
        return (
          <Form.Item
            label={label}
            name={componentLabel}
            rules={[{ required: required }]}
            initialValue={defaultValue}
            style={{ marginBottom: '8px' }}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`Enter ${componentLabel}`}
              precision={0}
              disabled
            />
          </Form.Item>
        );

      case 'DatePicker':
        return (
          <Form.Item
            label={label}
            name={componentLabel}
            rules={[{ required: required }]}
            initialValue={defaultValue ? moment(defaultValue) : null}
            style={{ marginBottom: '8px' }}
          >
            <DatePicker style={{ width: '100%' }} disabled />
          </Form.Item>
        );

      case 'Table':
        if (tableConfig) {
          // Calculate column widths based on number of columns to fit within page
          const totalColumns = tableConfig.columnNames.length;
          const availableWidth = 170; // mm (A4 width minus margins)
          const columnWidth = Math.floor((availableWidth / totalColumns) * 10) / 10; // mm per column
          
          const columns = tableConfig.columnNames.map((col: any, index: number) => ({
            title: col.title,
            dataIndex: `col${index}`,
            key: `col${index}`,
            width: `${columnWidth}mm`,
            align: 'center' as 'center',
            ellipsis: true,
          }));

          const dataSource = Array.from({ length: Number(tableConfig.rows) }).map((_, rowIndex) => {
            const rowData: any = { key: rowIndex };
            tableConfig.columnNames.forEach((_: any, colIndex: number) => {
              const key = `row${rowIndex + 1}-col${colIndex}`;
              rowData[`col${colIndex}`] = tableConfig.rowData[key] || '';
            });
            return rowData;
          });

          return (
            <div style={{ marginBottom: '20px' }}>
              {componentLabel !== 'BILL OF MATERIAL' && componentLabel !== 'mfr footer' && (
                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{componentLabel}</div>
              )}
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                size="small"
                bordered
                style={{ 
                  marginBottom: '8px',
                  width: '100%',
                  tableLayout: 'fixed'
                }}
                scroll={{ x: undefined }}
              />
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const renderMasterFormulaTable = (section: any) => {
    if (!section || !section.components || section.components.length === 0) return null;

    // Find components with specific labels
    const productNameComponent = section.components.find((comp: any) => comp.componentLabel === 'Product Name');
    const versionComponent = section.components.find((comp: any) => comp.componentLabel === 'Version');
    const batchSizeComponent = section.components.find((comp: any) => comp.componentLabel === 'Batch Size');
    const mfrNoComponent = section.components.find((comp: any) => comp.componentLabel === 'MFR No.');
    const supersedesComponent = section.components.find((comp: any) => comp.componentLabel === 'Supersedes');
    const shelfLifeComponent = section.components.find((comp: any) => comp.componentLabel === 'Shelf Life');
    const mfgLicComponent = section.components.find((comp: any) => comp.componentLabel === 'Mfg. Lic. Category');
    const effectiveDateComponent = section.components.find((comp: any) => comp.componentLabel === 'Effectrve Date');

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '15px', marginTop: '15px' }}>
          <Title level={4} style={{ margin: 0, textTransform: 'uppercase' }}>
            {section.sectionLabel}
          </Title>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Product Name</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{productNameComponent?.defaultValue || ''}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>MFR No.</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{mfrNoComponent?.defaultValue || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Version</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{versionComponent?.defaultValue || ''}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Supersedes</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{supersedesComponent?.defaultValue || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Batch Size</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{batchSizeComponent ? `${batchSizeComponent.defaultValue} ${batchSizeComponent.unit || ''}` : ''}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Shelf Life</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{shelfLifeComponent ? `${shelfLifeComponent.defaultValue} ${shelfLifeComponent.unit || ''}` : ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Mfg. Lic. Category</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{mfgLicComponent?.defaultValue || ''}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Effective Date</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{effectiveDateComponent?.defaultValue || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderBillOfMaterialSection = (section: any) => {
    if (!section || !section.components || section.components.length === 0) return null;

    // Find the product code component and BOM table component
    const productCodeComponent = section.components.find((comp: any) => comp.componentLabel === 'Product Code');
    const altBOMComponent = section.components.find((comp: any) => comp.componentLabel === 'Alt BOM');
    const bomTableComponent = section.components.find((comp: any) => comp.componentLabel === 'BILL OF MATERIAL');

    return (
      <div style={{ marginTop: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <Title level={4} style={{ margin: 0, textTransform: 'uppercase' }}>
            {section.sectionLabel}
          </Title>
        </div>
        
        {productCodeComponent && (
          <div style={{ marginBottom: '10px' }}>
            Product Code: {productCodeComponent.defaultValue}{productCodeComponent.unit ? ` ${productCodeComponent.unit}` : ''}
          </div>
        )}
        
        {bomTableComponent && renderComponent(bomTableComponent, section.sectionLabel)}
        
        {altBOMComponent && (
          <div style={{ marginTop: '10px' }}>
            Alt BOM: {altBOMComponent.defaultValue}{altBOMComponent.unit ? ` ${altBOMComponent.unit}` : ''}
          </div>
        )}
      </div>
    );
  };

  const renderSectionContent = (section: any, isStandalone = false) => {
    if (!section) return null;
    
    const config = getSectionConfig(section.sectionLabel);
    const alignment = config.alignment || 'left';
    
    // For header and footer sections, we might want different styling
    const cardStyle = isStandalone 
      ? { marginBottom: '0px', textAlign: alignment as any, border: 'none', background: 'transparent' }
      : { marginBottom: '15px', textAlign: alignment as any, border: 'none', background: 'transparent' };
    
    // For header and footer, we might want to hide the title or style it differently
    const showTitle = !isStandalone && config.type !== 'header' && config.type !== 'footer';

    // Special handling for MASTER FORMULA RECORD section
    if (section.sectionLabel === 'MASTER FORMULA RECORD') {
      return renderMasterFormulaTable(section);
    }

    // Special handling for BILL OF MATERIAL section
    if (section.sectionLabel === 'BILL OF MATERIAL') {
      return renderBillOfMaterialSection(section);
    }
    
    return (
      <Card
        // title={showTitle ? section.sectionLabel : null}
        style={cardStyle}
        headStyle={showTitle ? { backgroundColor: '#f5f5f5' } : {}}
        bordered={!isStandalone}
      >
        {config.logo && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img src={config.logo} alt="Logo" style={{ maxHeight: '60px' }} />
          </div>
        )}
        {section.components?.map((component: any) => (
          <div key={component._id}>
            {renderComponent(component, section.sectionLabel)}
          </div>
        ))}
      </Card>
    );
  };

  if (!previewData || previewData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        No preview data available
      </div>
    );
  }

  // Get header and footer heights from config
  const headerHeight = headerSection ? 
    (getSectionConfig(headerSection.sectionLabel).height || 10) : 0;
  
  const footerHeight = footerSection ? 
    (getSectionConfig(footerSection.sectionLabel).height || 10) : 0;

  // Split body content into pages if needed
  const splitBodyContentIntoPages = () => {
    // For now, we'll just put all body content on the first page
    // In a real implementation, you'd need to calculate content heights and split accordingly
    return [bodySections];
  };

  const bodyContentPages = splitBodyContentIntoPages();
  const actualPageCount = Math.max(pageCount, bodyContentPages.length);

  // Render multiple pages if needed
  const renderPages = () => {
    const pages = [];
    
    for (let i = 0; i < actualPageCount; i++) {
      const pageBodySections = bodyContentPages[Math.min(i, bodyContentPages.length - 1)];
      
      pages.push(
        <div 
          key={`page-${i}`} 
          className="pdf-page" 
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            height: 'auto',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px',
            pageBreakAfter: i < actualPageCount - 1 ? 'always' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Section - Always at the top of every page */}
          {headerSection && (
            <div className="pdf-header" style={{ 
              backgroundColor: 'white',
              borderBottom: '1px solid #eee',
              padding: `${getSectionConfig(headerSection.sectionLabel).margin || 10}px`,
              minHeight: `${headerHeight}mm`
            }}>
              {renderSectionContent(headerSection, true)}
            </div>
          )}
          
          {/* Body Content */}
          <div className="pdf-body" style={{ 
            padding: '15px 20px',
            flex: 1,
            minHeight: '180mm', // Ensure there's enough space between header and footer
            position: 'relative'
          }}>
            {i === 0 && (
              <Form
                form={form}
                layout="vertical"
                style={{ maxWidth: '100%' }}
              >
                {pageBodySections.map((section: any) => renderSectionContent(section))}
              </Form>
            )}
            
            {/* Page number */}
            <div style={{ 
              position: 'absolute', 
              bottom: '10mm', 
              right: '10mm',
              fontSize: '12px',
              color: '#888'
            }}>
              Page {i + 1} of {actualPageCount}
            </div>
          </div>
          
          {/* Footer Section - Always at the bottom of every page */}
          {footerSection && (
            <div className="pdf-footer" style={{ 
              backgroundColor: 'white',
              borderTop: '1px solid #eee',
              padding: `${getSectionConfig(footerSection.sectionLabel).margin || 10}px`,
              minHeight: `${footerHeight}mm`,
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%'
            }}>
              {renderSectionContent(footerSection, true)}
            </div>
          )}
        </div>
      );
    }
    
    return pages;
  };

  return (
    <div className="pdf-preview-container" style={{ 
      padding: '30px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {renderPages()}
    </div>
  );
};

export default PreviewContent; 