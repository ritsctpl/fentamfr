'use client';
import React from 'react';
import logo from '@/images/fenta_logo.png';
import { useTranslation } from "react-i18next";

const ProcessOrderReleaseManual = () => {
    const { t } = useTranslation();
  return (
    <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '900px', 
        // margin: '40px auto', 
        padding: '20px', 
        fontSize: '14px', 
        lineHeight: '1.5', 
        color: '#000', 
        backgroundColor: '#fff' 
    }}> 
        <div style={{ 
             borderBottom: '2px solid #000',
             marginBottom: '30px',
             paddingBottom: '10px',
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center'
        }}> 
            <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: '0 0 5px 0' 
            }}>Process Order Release Instructions</h1> 
                <img src={logo.src} alt="logo" style={{
            width: '100px',
            height: '50px'
        }} />
            
        </div> 

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Introduction</h2>
            <p><strong>Purpose:</strong> To guide users on how to use the Process Order Release Screen for logging, updating, and tracking maintenance activities.</p>
            <p><strong>Target Users:</strong> Release technicians, supervisors, and system admins.</p>
            <p><strong>Module Name:</strong> Order Release Management</p>
        </div>

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>System Access</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>URL/Application Path</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>/rits/processOrderRelease_app</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Login Requirement</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Username & Password</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Access Roles</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Technician, Supervisor, Admin</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Navigation Path</h2>
            <p>Main Menu &gt; Process Order Release
            &gt; Release Entry/Tracking</p>
        </div>

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Screen Overview</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>Header</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Filters by Category</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Maintenance Table</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Lists past maintenance records (columns like ID, Order)</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Action Buttons</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}> Edit Qty, Close ,Release</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form Panel</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form fields to log or update maintenance</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Add New Maintenance Record/Save</h2> 
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                border: '1px solid #000'
            }}>
                <thead>
                    <tr>
                        <th style={{
                            border: '1px solid #000',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold'
                        }} colSpan={2}>Add New Maintenance Record Steps / Save</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>Step 1</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Click "+ Insert" or select an existing row to edit</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 2: Required Fields</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Status (Read-only)<br />
                            • Order Type (Read-only)<br />
                            • Order Number (Read-only)<br />
                            • Product Code (Read-only)<br />
                            • Product Version (Read-only)<br />
                            • Recipe (Read-only)<br />
                            • Recipe Version (Read-only)<br />
                            • MRP Controller (Read-only)<br />
                            • Production Scheduler (Read-only)<br />
                            • Reservation Number (Read-only)<br />
                            • Production Start Date (Read-only)<br />
                            • Production Finish Date (Read-only)<br />
                            • Actual Start Date (Read-only)<br />
                            • Actual Finish Date (Read-only)<br />
                            • Target Quantity (Read-only)<br />
                            • Priority (Read-only)<br />
                            • Available Quantity to Release (Read-only)<br />
                            • Quantity to Release (Editable)<span style={{ color: 'red' }}>*</span><br />
                            • In Use (Read-only)<br />
                            • UOM (Read-only)<br />
                            • Measured UOM (Read-only)
                        </td>
                    </tr>
                  
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 3</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>After Enter Qty "Release"</td>
                    </tr>
                </tbody>
            </table>
        </div> 

        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Actions for Process Order Release</h2> 
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}> 
                <li style={{ marginBottom: '5px' }}>To Release: Enter quantity &gt; Click "Release" button</li>
                <li style={{ marginBottom: '5px' }}>To Close: Select record &gt; Click "Close" button</li>
                <li style={{ marginBottom: '5px' }}>To Cancel: Select record &gt; Click "Cancel" button</li>
            </ul> 
        </div>

        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Field Definitions</h2> 
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                marginBottom: '20px', 
                border: '1px solid #000' 
            }}> 
                <thead> 
                    <tr> 
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold', 
                            backgroundColor: '#f5f5f5' 
                        }}>Field Name</th> 
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold', 
                            backgroundColor: '#f5f5f5' 
                        }}>Description</th> 
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold', 
                            backgroundColor: '#f5f5f5' 
                        }}>Required</th> 
                    </tr> 
                </thead> 
                <tbody> 
                    {[ 
                        ['Status', 'Current status of the order', 'No'],
                        ['Order Type', 'Type of the order', 'No'],
                        ['Order Number', 'Unique identifier for the order', 'No'],
                        ['Product Code', 'Code identifying the product', 'No'],
                        ['Product Version', 'Version of the product', 'No'],
                        ['Recipe', 'Recipe used for production', 'No'],
                        ['Recipe Version', 'Version of the recipe', 'No'],
                        ['MRP Controller', 'Material Requirements Planning controller', 'No'],
                        ['Production Scheduler', 'Person responsible for scheduling', 'No'],
                        ['Reservation Number', 'Reservation identifier', 'No'],
                        ['Production Start Date', 'Planned start date of production', 'No'],
                        ['Production Finish Date', 'Planned finish date of production', 'No'],
                        ['Actual Start Date', 'Actual start date of production', 'No'],
                        ['Actual Finish Date', 'Actual finish date of production', 'No'],
                        ['Target Quantity', 'Planned production quantity', 'No'],
                        ['Priority', 'Priority level of the order', 'No'],
                        ['Available Quantity to Release', 'Quantity available for release', 'No'],
                        ['Quantity to Release', 'Quantity to be released (editable field)', 'Yes'],
                        ['In Use', 'Indicates if the order is in use', 'No'],
                        ['UOM', 'Unit of measure', 'No'],
                        ['Measured UOM', 'Actual measured unit', 'No']
                    ].map((row, index) => ( 
                        <tr key={index}> 
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row[0]}</td> 
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row[1]}</td> 
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row[2]}</td> 
                        </tr> 
                    ))} 
                </tbody> 
            </table> 
        </div> 


        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Troubleshooting</h2> 
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                marginBottom: '20px', 
                border: '1px solid #000' 
            }}> 
                <thead>
                    <tr>
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left',
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5'
                        }}>Issue</th>
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5'
                        }}>Solution</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Cannot save</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Check all mandatory fields (*) are filled</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form validation error</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Check all tabs to ensure required fields are filled in</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ProcessOrderReleaseManual;