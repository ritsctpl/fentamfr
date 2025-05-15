import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { DownloadOutlined, ArrowDownOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Entry {
  text: string;
  direction: 'right' | 'down' | null;
}

const FlowChartPdfThird: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [entries, setEntries] = useState<Entry[]>([]);

  const handleAddEntry = () => {
    if (inputText.trim()) {
      setEntries([...entries, { text: inputText.trim(), direction: null }]);
      setInputText('');
    } else {
      message.warning('Please enter some text before adding.');
    }
  };

  const handleExportToPDF = () => {
    const chartArea = document.getElementById('chartArea');
    if (chartArea) {
      html2canvas(chartArea).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 190;
        const pageHeight = 290;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('exported_chart.pdf');
        message.success('PDF exported successfully!');
      });
    } else {
      message.error('Could not find the chart area to export.');
    }
  };

  const handleDirectionChange = (index: number, direction: 'right' | 'down') => {
    const newEntries = [...entries];
    newEntries[index].direction = direction; 
    setEntries(newEntries);
  };

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#E5E7EB', padding: '16px', borderRadius: '8px' }}>
        <Input.TextArea
          placeholder="Type here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flexGrow: 1 }}
          rows={2}
        />
        <Button onClick={handleAddEntry} style={{ backgroundColor: '#3B82F6', color: 'white' }}>
          Add
        </Button>
        <Button onClick={handleExportToPDF} style={{ backgroundColor: '#000000', color: 'white' }} icon={<DownloadOutlined />}>
          Export
        </Button>
      </div>

      <div id="chartArea" style={{ backgroundColor: 'white', padding: '16px' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6B7280' }}>No entries yet. Add some above!</div>
        ) : (
          entries.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', flexDirection: entry.direction === 'down' ? 'column' : 'row', gap: '8px' }}>
              <div style={{ width: '100%', border: '1px solid #000', padding: '16px', borderRadius: '8px', color: 'black' }}>
                {entry.text}
              </div>
              {entry.direction === 'right' && <div style={{ flexShrink: 0 }}>➔</div>}
              {entry.direction === 'down' && <div style={{ flexShrink: 0, padding: '16px' }}>↓</div>}
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {entries.length > 0 && (
          <>
            <Button onClick={() => handleDirectionChange(entries.length - 1, 'down')} style={{ backgroundColor: '#000000', color: 'white' }}>
              <ArrowDownOutlined />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FlowChartPdfThird;
