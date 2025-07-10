export const templateStructure = {
    "templateMetadata": {
      "templateId": "template_granulation_mfr_001",
      "templateName": "Granulation Master Formula Record",
      "templateVersion": "1.0",
      "derivedFromTemplate": "template_granulation_mfr_001",
      "customizationsApplied": true,
      "productSpecific": true
    },
    "sections": [
      {
        "sectionRef": "section_preparation_001",
        "sectionSequence": 1,
        "inheritSequence": true,
        "customized": true,
        "definition": {
          "sectionId": "section_preparation_001",
          "sectionName": "Equipment Preparation Section - Paracetamol",
          "sectionVersion": "1.0",
          "classification": ["Preparation", "MFR", "BMR", "Paracetamol"],
          "active": true,
          "description": "Equipment preparation stage for Paracetamol granulation including line clearance.",
          "sequenceOrder": 1,
          "visualization": {
            "titleDisplay": true,
            "sectionAlignment": "center",
            "pageBreakBefore": true,
            "backgroundShading": "#F9F9F9"
          },
          "forms": [
            {
              "formRef": "form_line_clearance_001",
              "formSequence": 1,
              "inheritSequence": true,
              "customized": true,
              "definition": {
                "formId": "form_line_clearance_001",
                "formName": "Line Clearance Form - Paracetamol Production",
                "formVersion": "1.0",
                "classification": ["MFR", "BMR", "LineClearance", "Paracetamol"],
                "sequenceOrder": 1,
                "inheritSequence": true,
                "components": [
                  {
                    "componentRef": "comp_text_enterprise_universal_final_002",
                    "componentUsage": "Work Instructions",
                    "componentSequence": 1,
                    "componentAlignment": "center",
                    "inheritSequence": true,
                    "autoSubsequence": true,
                    "showComponentTitle": false,
                    "customized": true,
                    "definition": {
                      "componentId": "comp_text_enterprise_universal_final_002",
                      "componentName": "Universal Text Component (Paracetamol Specific)",
                      "componentType": "text",
                      "componentVersion": "4.0",
                      "componentSequence": 2,
                      "active": true,
                      "description": "Unified MES text component for Paracetamol production with specific instructions.",
                      "createdBy": "mes_architect",
                      "createdAt": "2025-06-22T13:00:00Z",
                      "modifiedBy": "qa_head",
                      "modifiedAt": "2025-06-22T14:00:00Z",
                      "site": "PLANT_001",
                      "tags": ["bmr", "mes", "validated", "prefilled", "instruction", "paracetamol"],
                      "executionMode": "online_offline",
                      "fields": [
                        {
                          "fieldId": "work_instructions",
                          "fieldName": "Instruction Block",
                          "fieldType": "text",
                          "displayMode": "static",
                          "instructionLevel": "step",
                          "multiline": true,
                          "rows": 10,
                          "content": [
                            "1.3 Attach CLEANED status label of the equipment to the Batch Record - PARACETAMOL SPECIFIC",
                            "1.4 Dispense the Paracetamol API under laminar air flow - API handling protocol required",
                            "1.5 Use Head gear, nose mask & hand gloves during operation - Grade A PPE for API handling",
                            "1.6 Maintain the area temperature between 20-25°C for Paracetamol stability",
                            "1.7 Place Silica gel bag between poly bags - Paracetamol is moisture sensitive",
                            "1.8 Avoid loss of materials at each step - document any spillage >0.1% for Paracetamol"
                          ]
                        },
                        {
                          "fieldId": "product_name",
                          "fieldName": "Product Name",
                          "fieldType": "text",
                          "dataSource": "api",
                          "apiEndpoint": "/api/product/PRD_PARA_500",
                          "readOnly": true,
                          "labelPosition": "left",
                          "alignment": "right",
                          "layoutColumn": 1,
                          "order": 1
                        },
                        {
                          "fieldId": "remarks",
                          "fieldName": "Operator Remarks",
                          "fieldType": "text",
                          "dataSource": "user_input",
                          "multiline": true,
                          "rows": 5,
                          "maxLength": 1000,
                          "required": true,
                          "roleControl": { "editableBy": ["Production", "QA"] },
                          "readOnly": false,
                          "labelPosition": "left",
                          "alignment": "left",
                          "layoutColumn": 2,
                          "order": 2,
                          "placeholder": "Record any observations during Paracetamol line clearance..."
                        },
                        {
                          "fieldId": "status",
                          "fieldName": "Line Clearance Status",
                          "fieldType": "enum",
                          "dataSource": "user_input",
                          "options": [
                            { "label": "PASS", "value": "pass" },
                            { "label": "FAIL", "value": "fail" },
                            { "label": "HOLD", "value": "hold" }
                          ],
                          "required": true,
                          "roleControl": { "editableBy": ["Supervisor"] },
                          "layoutColumn": 1,
                          "order": 3
                        },
                        {
                          "fieldId": "breakdown_occurred",
                          "fieldName": "Any Break Down / Incident",
                          "fieldType": "boolean",
                          "dataSource": "user_input",
                          "defaultValue": false,
                          "layoutColumn": 2,
                          "order": 4
                        },
                        {
                          "fieldId": "equipment_id",
                          "fieldName": "Equipment ID",
                          "fieldType": "lookup",
                          "dataSource": "api",
                          "endpoint": "/api/equipment/paracetamol-line",
                          "bindField": "equipment_code",
                          "required": true,
                          "layoutColumn": 1,
                          "order": 5
                        },
                        {
                          "fieldId": "batch_yield",
                          "fieldName": "Expected Batch Yield",
                          "fieldType": "formula",
                          "dataSource": "formula",
                          "formula": "(total_filled_qty / 100000) * 100",
                          "unit": "%",
                          "precision": 2,
                          "readOnly": true,
                          "layoutColumn": 2,
                          "order": 6
                        },
                        {
                          "fieldId": "line_clearance_instruction",
                          "fieldName": "Line Clearance Instruction",
                          "fieldType": "text",
                          "displayMode": "prefilled",
                          "templateText": "Attach CLEANED status label. Line Clearance SOP No: SOP-LC-PARA-001, By QA (Sign/date): {{qa_sign}} / time: {{qa_time}}",
                          "bindingFields": {
                            "sop_no": "api",
                            "qa_sign": "user_input",
                            "qa_time": "user_input"
                          },
                          "multiline": true,
                          "rows": 4,
                          "alignment": "left",
                          "labelPosition": "top"
                        }
                      ]
                    }
                  },
                  {
                    "componentRef": "comp_table_enterprise_full_001",
                    "componentUsage": "Area Check Table",
                    "componentSequence": 2,
                    "componentAlignment": "left",
                    "inheritSequence": true,
                    "showComponentTitle": true,
                    "customized": true,
                    "definition": {
                      "componentId": "comp_table_enterprise_full_001",
                      "componentName": "Paracetamol Granulation Check Table",
                      "componentType": "table",
                      "componentVersion": "6.0",
                      "componentSequence": 2,
                      "active": true,
                      "description": "Paracetamol specific granulation parameters with enhanced validations.",
                      "createdBy": "mes_architect",
                      "created_at": "2025-06-21T10:00:00Z",
                      "modifiedBy": "qa_head",
                      "modifiedAt": "2025-06-21T11:00:00Z",
                      "site": "PLANT_001",
                      "tags": ["bmr", "mes", "gmp", "validated", "paracetamol"],
                      "executionMode": "online_offline",
                      "deviationAllowed": true,
                      "tableConfig": {
                        "headerStructure": [
                          {
                            "label": "Batch Info",
                            "children": [
                              {
                                "label": "Identifiers",
                                "columns": ["batch_no", "stage_no", "equipment_id"]
                              }
                            ]
                          },
                          {
                            "label": "Environmental Parameters",
                            "children": [
                              {
                                "label": "Critical Parameters",
                                "columns": ["temp_c", "humidity", "pressure"]
                              },
                              {
                                "label": "Results",
                                "columns": ["status", "approved", "deviation_flag"]
                              }
                            ]
                          },
                          {
                            "label": "Paracetamol Quality Parameters",
                            "children": [
                              {
                                "label": "Test Parameters",
                                "columns": ["parameter"]
                              },
                              {
                                "label": "Observations",
                                "children": [
                                  {
                                    "label": "RHS",
                                    "columns": ["rhs_observation"]
                                  },
                                  {
                                    "label": "LHS",
                                    "columns": ["lhs_observation"]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "label": "Documentation",
                            "columns": ["remarks", "attached_image", "certificate_file", "review_signature"]
                          }
                        ],
                        "columns": [
                          {
                            "fieldId": "batch_no",
                            "fieldName": "Batch No",
                            "fieldType": "text",
                            "required": true,
                            "validation": {
                              "pattern": "^PARA[0-9]{8}$",
                              "error_message": "Batch number must start with PARA followed by 8 digits"
                            }
                          },
                          {
                            "fieldId": "stage_no",
                            "fieldName": "Stage No",
                            "fieldType": "number",
                            "required": true
                          },
                          {
                            "fieldId": "equipment_id",
                            "fieldName": "Equipment ID",
                            "fieldType": "lookup",
                            "endpoint": "/api/equipment/paracetamol-granulation",
                            "bindField": "equipment_code",
                            "required": true
                          },
                          {
                            "fieldId": "temp_c",
                            "fieldName": "Temperature (°C)",
                            "fieldType": "number",
                            "unit": "°C",
                            "precision": 1,
                            "validation": {
                              "min": 20,
                              "max": 25,
                              "error_message": "Temperature must be between 20-25°C for Paracetamol"
                            },
                            "required": true
                          },
                          {
                            "fieldId": "humidity",
                            "fieldName": "Humidity (%)",
                            "fieldType": "number",
                            "unit": "%",
                            "precision": 1,
                            "validation": {
                              "min": 45,
                              "max": 65,
                              "error_message": "Humidity must be between 45-65% for Paracetamol"
                            },
                            "required": true
                          },
                          {
                            "fieldId": "pressure",
                            "fieldName": "Pressure (Pa)",
                            "fieldType": "number",
                            "unit": "Pa",
                            "precision": 1,
                            "validation": {
                              "min": 100000,
                              "max": 102000
                            }
                          },
                          {
                            "fieldId": "avg_temp_humidity",
                            "fieldName": "Avg Temp-Humidity",
                            "fieldType": "formula",
                            "formula": "(temp_c + humidity) / 2",
                            "precision": 2,
                            "readOnly": true
                          },
                          {
                            "fieldId": "status",
                            "fieldName": "Status",
                            "fieldType": "enum",
                            "options": [
                              { "label": "PASS", "value": "pass" },
                              { "label": "FAIL", "value": "fail" },
                              { "label": "HOLD", "value": "hold" }
                            ],
                            "required": true
                          },
                          {
                            "fieldId": "approved",
                            "fieldName": "Approved",
                            "fieldType": "boolean",
                            "defaultValue": false
                          },
                          {
                            "fieldId": "deviation_flag",
                            "fieldName": "Deviation Raised",
                            "fieldType": "boolean",
                            "defaultValue": false
                          },
                          {
                            "fieldId": "parameter",
                            "fieldName": "Parameter",
                            "fieldType": "text",
                            "readOnly": true
                          },
                          {
                            "fieldId": "rhs_observation",
                            "fieldName": "RHS Observation",
                            "fieldType": "number",
                            "precision": 2
                          },
                          {
                            "fieldId": "lhs_observation",
                            "fieldName": "LHS Observation",
                            "fieldType": "number",
                            "precision": 2
                          },
                          {
                            "fieldId": "remarks",
                            "fieldName": "Remarks",
                            "fieldType": "text",
                            "multiline": true,
                            "maxLength": 1000,
                            "visibilityCondition": "status == 'fail'",
                            "rows": 5
                          },
                          {
                            "fieldId": "attached_image",
                            "fieldName": "Granulation Status Photo",
                            "fieldType": "image",
                            "captureCamera": true,
                            "maxSizeMB": 5
                          },
                          {
                            "fieldId": "certificate_file",
                            "fieldName": "Cleaning Certificate PDF",
                            "fieldType": "file",
                            "fileTypes": ["pdf"],
                            "maxSizeMB": 10
                          },
                          {
                            "fieldId": "review_signature",
                            "fieldName": "Line Clearance Signature",
                            "fieldType": "signature",
                            "signedByRole": ["QA", "Supervisor"],
                            "required": true
                          }
                        ],
                        "preloadRows": [
                          {
                            "parameter": "Appearance of Paracetamol granules (5 samples)",
                          },
                          {
                            "parameter": "Group Weight of 20 Paracetamol Tablets",
                          },
                          {
                            "parameter": "Individual Weight granules (5 samples)",
                          },
                          {
                            "parameter": "Uniformity of weight (20 tablets)",
                          },
                          {
                            "parameter": "Hardness (Paracetamol 500mg)",
                          },
                          {
                            "parameter": "Thickness (Paracetamol 500mg)",
                          },
                          {
                            "parameter": "Friability Test",
                          },
                          {
                            "parameter": "Disintegration Time (Paracetamol)",
                          }
                        ],
                        "rowControls": {
                          "mode": "growing",
                          "minRows": 8,
                          "maxRows": 500,
                          "allowAddRemove": true,
                          "initialRows": 8
                        },
                        "pagination": {
                          "enabled": true,
                          "rowsPerPage": 20
                        },
                        "columnLayout": {
                          "columnCount": 16,
                          "columnWidthMode": "auto",
                          "stickyHeaders": true,
                          "resizableColumns": true
                        },
                        "style": {
                          "tableBorder": true,
                          "stripedRows": true,
                          "alternateRowColor": "#f6f6f6",
                          "headerColor": "#003366",
                          "headerFontColor": "#ffffff"
                        }
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }

export const templateDefinition = {
    ObjectTemplate: templateStructure,
    ObjectValues: {
        "sections": {
          "section_preparation_001": {
            "forms": {
              "form_line_clearance_001": {
                "components": {
                  "comp_text_enterprise_universal_final_002": {
                    "fieldValues": {
                      "work_instructions": [
                        "1.3 Attach CLEANED status label of the equipment to the Batch Record - PARACETAMOL SPECIFIC",
                        "1.4 Dispense the Paracetamol API under laminar air flow - API handling protocol required",
                        "1.5 Use Head gear, nose mask & hand gloves during operation - Grade A PPE for API handling",
                        "1.6 Maintain the area temperature between 20-25°C for Paracetamol stability",
                        "1.7 Place Silica gel bag between poly bags - Paracetamol is moisture sensitive",
                        "1.8 Avoid loss of materials at each step - document any spillage >0.1% for Paracetamol"
                      ],
                      "product_name": "Paracetamol Tablets 500mg",
                      "status": "pass",
                      "breakdown_occurred": true,
                      "batch_yield": 10,
                      "line_clearance_instruction": "Attach CLEANED status label. Line Clearance SOP No: SOP-LC-PARA-001, By QA (Sign/date): {{qa_sign}} / time: {{qa_time}}"
                    }
                  },
                  "comp_table_enterprise_full_001": {
                    "tableData": {
                      "rows": [
                        {
                          "batch_no": null,
                          "stage_no": null,
                          "equipment_id": null,
                          "temp_c": null,
                          "humidity": null,
                          "pressure": null,
                          "avg_temp_humidity": null,
                          "status": null,
                          "approved": false,
                          "deviation_flag": false,
                          "parameter": "Appearance of Paracetamol granules (5 samples)",
                          "allow_sides": true,
                          "rhs_observation": null,
                          "lhs_observation": null,
                          "remarks": null,
                          "attached_image": null,
                          "certificate_file": null,
                          "review_signature": null
                        },
                        {
                          "batch_no": null,
                          "stage_no": null,
                          "equipment_id": null,
                          "parameter": "Group Weight of 20 Paracetamol Tablets",
                          "allow_sides": false,
                          "rhs_observation": null,
                          "lhs_observation": null,
                          "status": null,
                          "approved": false,
                          "deviation_flag": false,
                          "review_signature": null
                        },
                        {
                          "parameter": "Individual Weight granules (5 samples)",
                        },
                        {
                          "parameter": "Uniformity of weight (20 tablets)",
                        },
                        {
                          "parameter": "Hardness (Paracetamol 500mg)",
                        },
                        {
                          "parameter": "Thickness (Paracetamol 500mg)",
                        },
                        {
                          "parameter": "Friability Test",
                        },
                        {
                          "parameter": "Disintegration Time (Paracetamol)",
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }      
}