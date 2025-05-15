'use client';
import React from 'react';
import logo from '@/images/fenta_logo.png';

const ListManual = () => {
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
            }}>List Maintenance Instructions</h1> 
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
            <p><strong>Purpose:</strong> To guide users on how to use the List Maintenance Maintenance Screen for logging, updating, and tracking maintenance activities.</p>
            <p><strong>Target Users:</strong> Maintenance technicians, supervisors, and system admins.</p>
            <p><strong>Module Name:</strong> Maintenance Management</p>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>/rits/list_app</td>
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
            <p>Main Menu &gt; List Maintenance Maintenance
            &gt; Maintenance Entry/Tracking</p>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Filters by List</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Maintenance Table</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Lists past maintenance records (columns like ID, List, Date)</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Action Buttons</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>+ Add New, Edit, Close, Delete</td>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Click "+ Add New" or select an existing row to edit</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 2: Required Fields</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Category<br />
                            • List <span style={{ color: 'red' }}>*</span><br />
                            • Description<br />
                            • Maximum Number Of Row<br />
                            • Type<br />
                            • Allow Operator To Change Column Sequence<br />
                            • Allow Operator To Sort Rows<br />
                            • Allow Multiple Selection<br />
                            • Show All Active SFCs To Operator
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 3: List Tab</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Sequence<br />
                            • Column Name *<br />
                            • Row Sort Order<br />
                            • Width *<br />
                            • Details
                        </td>
                    </tr>
                  
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 4</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Click "Save" or "Add"</td>
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
            }}>Edit/Close/Delete Records</h2> 
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}> 
                <li style={{ marginBottom: '5px' }}>To Edit: Select record &gt; Click On Row &gt; Update fields &gt; Click "Save"</li> 
                <li style={{ marginBottom: '5px' }}>To Close: Select in-progress record &gt; Click "Cancel" Or Close Button on Top</li> 
                <li style={{ marginBottom: '5px' }}>To Delete: Select draft record &gt; Click "Delete Icon" &gt; Confirm deletion</li> 
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
                        ['Category', 'Category of the maintenance template', 'Yes'], 
                        ['List', 'List identifier for the maintenance template', 'Yes'], 
                        ['Description', 'Detailed description of the maintenance template', 'No'], 
                        ['Maximum Number Of Row', 'Maximum rows allowed in the list', 'No'], 
                        ['Type', 'Type of maintenance template', 'No'], 
                        ['Allow Operator To Change Column Sequence', 'Enable column reordering', 'No'], 
                        ['Allow Operator To Sort Rows', 'Enable row sorting', 'No'], 
                        ['Allow Multiple Selection', 'Enable multiple item selection', 'No'], 
                        ['Show All Active SFCs To Operator', 'Display all active SFCs', 'No'], 
                        ['Create', 'Create new maintenance record', 'No']
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

        {/* <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Export Data</h2> 
            <p>Click "Export" button to download maintenance records as Excel/PDF</p> 
        </div>  */}

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

export default ListManual;