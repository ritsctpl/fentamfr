import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Divider, Space } from 'antd';
import FormTreeView from './FormTreeData';
import { FormTreeData } from '../types/formTreeTypes';
import { convertJsonToFormTreeData } from '../utils/formTreeDataUtils';

const JsonToFormTreeExample: React.FC = () => {
  const [formTreeData, setFormTreeData] = useState<FormTreeData>({ sections: [] });

  // Example JSON template from the template editor
  const exampleJsonTemplate = {
    template: {
      section0: {
        id: 1,
        section: "Introduction",
        heading: "User Information Form",
        type: "Section",
        component: {
          text1: { type: "text", content: "Please fill out all required fields below." },
          input1: { type: "input", label: "Full Name", placeholder: "Enter your full name", required: true },
          input2: { type: "input", label: "Email", placeholder: "email@example.com", required: true }
        }
      },
      sectionGroup1: {
        id: 2,
        section: "Contact Information",
        heading: "Contact Details",
        type: "SectionGroup",
        sections: [
          {
            id: "nested-2-1",
            section: "Address Information",
            heading: "Address Details",
            type: "Section",
            component: {
              text1: { type: "text", content: "Please provide your current address." },
              input1: { type: "input", label: "Street Address", placeholder: "123 Main St" },
              input2: { type: "input", label: "City", placeholder: "City" },
              select1: { 
                type: "select", 
                label: "State", 
                options: [
                  { label: "California", value: "CA" },
                  { label: "New York", value: "NY" },
                  { label: "Texas", value: "TX" }
                ] 
              },
              input3: { type: "input", label: "ZIP Code", placeholder: "ZIP Code" }
            }
          },
          {
            id: "nested-2-2",
            section: "Phone Information",
            heading: "Phone Numbers",
            type: "Section",
            component: {
              input1: { type: "input", label: "Primary Phone", placeholder: "(555) 123-4567" },
              input2: { type: "input", label: "Secondary Phone", placeholder: "(Optional)" }
            }
          }
        ]
      },
      textSection2: {
        id: 3,
        section: "Terms and Conditions",
        heading: "Terms and Conditions",
        type: "Text Section",
        content: "By submitting this form, you agree to our terms and privacy policy. Your information will be processed in accordance with our data protection guidelines."
      }
    }
  };

  // Convert the example JSON to form tree data
  useEffect(() => {
    const treeData = convertJsonToFormTreeData(exampleJsonTemplate);
    setFormTreeData(treeData);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 24, fontWeight: 600 }}>JSON Template to Form Tree Structure</h2>
      
      <Row gutter={24}>
        <Col span={12}>
          <Card 
            title="Template JSON"
            style={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: 16
            }}
          >
            <pre style={{ 
              maxHeight: '500px', 
              overflow: 'auto',
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {JSON.stringify(exampleJsonTemplate, null, 2)}
            </pre>
          </Card>
          
          <Space>
            <Button 
              type="primary"
              onClick={() => {
                const treeData = convertJsonToFormTreeData(exampleJsonTemplate);
                setFormTreeData(treeData);
              }}
            >
              Convert JSON to Tree
            </Button>
          </Space>
        </Col>
        
        <Col span={12}>
          <Card
            title="Resulting Form Tree Structure"
            style={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <FormTreeView formData={formTreeData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JsonToFormTreeExample; 