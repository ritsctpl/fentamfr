'use client';
import React from 'react';
import logo from '@/images/fenta_logo.png';

const LinePluginManual = () => {
  return (
    <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '900px', 
        margin: '40px auto', 
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
            }}>LinePlugin Instructions</h1> 
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
            <p><strong>Purpose:</strong> To guide users on how to use the LinePlugin Screen for logging, updating, and tracking LinePlugin activities.</p>
            <p><strong>Target Users:</strong> Plugin technicians, supervisors, and system admins.</p>
            <p><strong>Module Name:</strong> Plugin Management</p>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>/rits/pod_app?WorkStation=POD_NAME</td>
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
            <p>Main Menu &gt; LinePlugin
            &gt; Plugin Entry/Tracking</p>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Line Clearance Table</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Lists past maintenance records Line Clearance Task  (columns like ID, task, etc.)</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Action Buttons</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Start / Complete</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form Panel</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form fields to log or update Line Clearance records</td>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Click "+ Add New" or select an existing row to edit</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 2: Required Fields</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Template Name (Read Only)<br />
                            • Description (Read Only)<br />
                            • Task Name (Read Only)<br />
                            • Evidence (Upload)<br />
                            • Reason Code (Input) <span style={{ color: 'red' }}>*</span><br />
                            • Status (Read Only)<br />
                            • Action Buttons (Start, Complete)
                        </td>
                    </tr>
                   
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 3</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Click "Start" and "Complete" for Line Clearance</td>
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
            }}>Action Buttons</h2> 
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}> 
                <li style={{ marginBottom: '5px' }}>Start: Click to begin the line clearance task</li>
                <li style={{ marginBottom: '5px' }}>Complete: Click to finish the line clearance task</li>
                <li style={{ marginBottom: '5px' }}>Close: Click to close the plugin</li>
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
                        ['Template Name', 'Template name for the line clearance task (Read Only)', 'Yes'],
                        ['Description', 'Detailed description of the line clearance task (Read Only)', 'Yes'],
                        ['Task Name', 'Name of the specific line clearance task (Read Only)', 'Yes'],
                        ['Evidence', 'Upload evidence documentation for the task', 'Yes'],
                        ['Reason Code', 'Input code explaining reason for line clearance', 'Yes'],
                        ['Status', 'Current status of the line clearance task (Read Only)', 'Yes'],
                        ['Start Button', 'Button to initiate the line clearance task', 'No'],
                        ['Complete Button', 'Button to mark the line clearance task as complete', 'No']
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

export default LinePluginManual;