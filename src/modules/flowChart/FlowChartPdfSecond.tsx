'use client'
import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons'; // Import the minus icon
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { TextArea } = Input;

const FlowChartPdfSecond: React.FC = () => {
  const [inputs, setInputs] = useState<string[]>(['']); // Start with one empty text area

  const handleChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleInsert = () => {
    setInputs([...inputs, '']); // Add a new empty text area
  };

  const handleRemove = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const generatePDF = async () => {
    const pdf = new jsPDF();
    const element = document.getElementById('content-to-print');

    if (element) {
      // Make the element visible for rendering
      element.style.display = 'block';
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = pdf.internal.pageSize.getWidth(); // Full width of the PDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10; // Start with a top margin of 30px

      // Add image to PDF and handle pagination if needed
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= (pdf.internal.pageSize.getHeight() - position); // Adjust for the top margin

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30; // Add margin for subsequent pages
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      // Hide the element again
      element.style.display = 'none';
    }

    pdf.save('output.pdf');
  };


  return (
    <div style={{ padding: '20px' }}>
      <div id="content-to-print" style={{ display: 'none' }}>
  {inputs.map((input, index) => (
    <div key={index} style={{ marginBottom: '20px', textAlign: 'center' }}>
      <div
        style={{
          border: '2px solid black',
          borderRadius: '4px',
          padding: '10px',
          display: 'inline-block',
          width: '90%',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {input}
      </div>
      {/* Only display the arrow in the web view, not in the PDF */}
      {index < inputs.length - 1 && (
        <div style={{ fontSize: '24px' }}>⇩</div>
      )}
    </div>
  ))}
</div>

      {inputs.map((input, index) => (
        <div key={index} style={{ marginBottom: '20px', height:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
          <TextArea
            value={input}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder="Enter text"
            rows={2} // Adjust number of rows as needed
            style={{ width: '500px', marginBottom: '5px' }}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<MinusCircleOutlined />}
            style={{ marginLeft: '10px' }}
            onClick={() => handleRemove(index)}
          />
        </div>
      ))}
      <div style={{ gap: '20px', height:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
      <Button type="dashed" onClick={handleInsert} style={{ margin: '10px 0' }}>
        Insert
      </Button>
      <Button type="primary" onClick={generatePDF}>
        Generate PDF
      </Button>
      </div>
    </div>
  );
};

export default FlowChartPdfSecond;

