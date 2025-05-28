import React, { useState, useEffect } from 'react';
import { getGroupPreview } from '@services/groupBuilderService';

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: 24,
  background: '#fff',
};

const thtdStyle: React.CSSProperties = {
  border: '1px solid #333',
  padding: '8px 8px',
  fontSize:12,
  textAlign: 'left',
};

const sectionHeaderStyle: React.CSSProperties = {
  background: '#f5f5f5',
  fontWeight: 600,
  border: '1px solid #333',
  borderBottom:'none',
  fontSize: 14,
  textAlign:'center',
  padding: '10px 0',
//   margin: '24px 0 12px 0',
};

const Preview = ({ sections }: { sections: any[] }) => {
  const [previewData, setPreviewData] = useState<any[]>([]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      const response = await getGroupPreview({
        siteId: '1004',
        sectionsIds: sections.map(section => ({
          handle: section.handle,
          sectionLabel: section.sectionLabel,
        })),
      });
      setPreviewData(response);
    };
    fetchPreviewData();
  }, [sections]);

  return (
    <div style={{ width: '750px', margin: '60 auto', padding: 24, overflow:'auto', boxShadow:' rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
      {previewData.map((section, idx) => (
        <div key={section.sectionLabel || idx}>
          <div style={sectionHeaderStyle}>{section.sectionLabel}</div>
          <table style={tableStyle}>
            <tbody>
              {section.components.map((component: any, cidx: number) => (
                <tr key={component.componentLabel || cidx}>
                  <th style={thtdStyle}>{component.componentLabel}</th>
                  <td style={thtdStyle}>{component.defaultValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Preview;