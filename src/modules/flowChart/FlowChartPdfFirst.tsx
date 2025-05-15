'use client';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { Button } from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useState } from 'react';

const FlowChartPdfFirst: React.FC = () => {

    const [text, setText] = useState<string>('');

    const generatePDF = async () => {
      const doc = new jsPDF();
      const element = document.getElementById('pdf-content');
  
      if (element) {
        try {
          // Create a canvas from the element
          const canvas = await html2canvas(element, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
  
          const imgWidth = 190; // Adjust to fit your layout
          const pageHeight = 295; // A4 page height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
  
          let position = 0;
  
          // Add the first image
          doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
  
          // Add additional pages if needed
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
  
          doc.save('document.pdf');
        } catch (error) {
          console.error("Error generating PDF: ", error);
        }
      } else {
        console.error("Element not found");
      }
    };

    return (
        <div style={{width:'600px'}}>
            <h1>First Method</h1>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your Unicode text here"
                rows={10}
                style={{ width: '100%' }}
            />
            <div id="pdf-content" style={{ whiteSpace: 'pre-wrap', fontSize: '28px', padding: '20px' }}>
                <pre>{text}</pre>
            </div>
            <Button type='primary' onClick={generatePDF}>Generate PDF</Button>
      </div >
  );
};

export default FlowChartPdfFirst;

