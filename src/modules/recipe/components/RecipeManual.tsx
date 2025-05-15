'use client';
import React from 'react';
import logo from '@/images/fenta_logo.png';

const RecipeManual = () => {
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
            }}>Recipe Maintenance Instructions</h1> 
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
            <p><strong>Purpose:</strong> To guide users on how to use the Recipe Maintenance Screen for logging, updating, and tracking maintenance activities.</p>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>/rits/recipe_app</td>
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
            <p>Main Menu &gt; Recipe Maintenance
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Filters by Recipe</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Maintenance Table</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Lists past maintenance records (columns like ID, Recipe, etc.)</td>
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
                        }} colSpan={6}>Add New Maintenance Record Steps / Save</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>Step 1</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>Click "+ Add New" or select an existing row to edit</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 2: Required Fields</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>
                            • Recipe ID <span style={{ color: 'red' }}>*</span><br />
                            • Version <span style={{ color: 'red' }}>*</span><br />
                            • Description<br />
                            • Status <span style={{ color: 'red' }}>*</span><br />
                            • Batch Size <span style={{ color: 'red' }}>*</span><br />
                            • Batch UOM <span style={{ color: 'red' }}>*</span><br />
                            • Total Expected Cycle Time<br />
                            • Total Actual Cycle Time<br />
                            • Current Version
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 3: Ingredients Tab (For Active and Inactive)</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Name <span style={{ color: 'red' }}>*</span><br />
                            • Version <span style={{ color: 'red' }}>*</span><br />
                            • Description <br />
                            • Sequence <span style={{ color: 'red' }}>*</span><br />
                            • Quantity <span style={{ color: 'red' }}>*</span><br />
                            • UOM <span style={{ color: 'red' }}>*</span><br />
                            • Tolerance <br />
                            • Material Type <span style={{ color: 'red' }}>*</span><br />
                            • Supplier ID <br />
                            • Source Location <br />
                            • Handling Instructions <br />
                            • Storage Instructions <br />
                            • Unit Cost <br />
                            • Currency <br />
                            • Total Cost <br />
                            • Waste Quantity <br />
                            • Waste UOM <br />
                            • By-Product Description <br />
                            • Hazardous <span style={{ color: 'red' }}>*</span><br />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            <h4>Alternate Ingredients</h4>
                            • Name <span style={{ color: 'red' }}>*</span><br />
                            • Quantity <span style={{ color: 'red' }}>*</span><br />
                            • UOM <span style={{ color: 'red' }}>*</span><br />
                            • Unit Cost <br />
                            • Total Cost <br />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            <h4>QC Parameter</h4>
                            • Parameter <span style={{ color: 'red' }}>*</span><br />
                            • Actual Value <span style={{ color: 'red' }}>*</span><br />
                            • Tolerance <span style={{ color: 'red' }}>*</span><br />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 4: Phases Tab</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Phase Name <span style={{ color: 'red' }}>*</span><br />
                            • Sequence <span style={{ color: 'red' }}>*</span><br />
                            • Phase Description <br />
                            • Entry Phase <span style={{ color: 'red' }}>*</span><br />
                            • Exit Phase <span style={{ color: 'red' }}>*</span><br />
                            • Next Phase <span style={{ color: 'red' }}>*</span><br />
                            • Expected Cycle Time <br />
                            • Conditional <br />
                            • Parallel <br />
                            • Any Order <br />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            <h4>Operation</h4>
                            • Operation <span style={{ color: 'red' }}>*</span><br />
                            • Version <span style={{ color: 'red' }}>*</span><br />
                            • Description <br />
                            • Instruction <br />
                            • Sequence <span style={{ color: 'red' }}>*</span><br />
                            • Type <span style={{ color: 'red' }}>*</span><br />
                            • Sequential <br />
                            • Expected Cycle Time <br />
                            • CCP <br />
                            • Tools <br />
                            • Entry Operation <span style={{ color: 'red' }}>*</span><br />
                            • Last Operation At Phase <br />
                            • Next Operation <span style={{ color: 'red' }}>*</span><br />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            <h4>Resource</h4>
                            • Resource <span style={{ color: 'red' }}>*</span><br />
                            • Description <br />
                            • Work Center <span style={{ color: 'red' }}>*</span><br />
                            • RPM <br />
                            • Duration <span style={{ color: 'red' }}>*</span><br />
                            • Pressure <span style={{ color: 'red' }}>*</span><br />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 5: Packaging Information</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>
                            • Packaging Type <span style={{ color: 'red' }}>*</span><br />
                            • Select packaging type<br />
                            • Primary Packaging Material<br />
                            • Secondary Packaging Type<br />
                            • Container Size<br />
                            • Label Format<br />
                            • Storage Temperature (°C)<br />
                            • Humidity Range (%)<br />
                            • Protection from Light
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 6: Work Center</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>
                            • Work Center <span style={{ color: 'red' }}>*</span><br />
                            • Resource <span style={{ color: 'red' }}>*</span><br />
                            • Description<br />
                            • System Status <span style={{ color: 'red' }}>*</span>
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 7</td>
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
                        ['Recipe ID', 'Unique identifier for the item', 'Yes'],
                        ['Version', 'Version number of the item', 'Yes'],
                        ['Description', 'Detailed description of the item', 'No'],
                        ['Status', 'Current status of the item', 'Yes'],
                        ['Batch Size', 'Standard batch size for the item', 'Yes'],
                        ['Batch UOM', 'Unit of measure for batch size', 'Yes'],
                        ['Total Expected Cycle Time', 'Expected time to complete cycle', 'No'],
                        ['Total Actual Cycle Time', 'Actual time to complete cycle', 'No'],
                        ['Current Version', 'Current version of the item', 'No'],
                        ['Name', 'Name of the ingredient', 'Yes'],
                        ['Sequence', 'Order sequence number', 'Yes'],
                        ['Quantity', 'Amount of ingredient', 'Yes'],
                        ['UOM', 'Unit of measurement', 'Yes'],
                        ['Material Type', 'Type of material', 'Yes'],
                        ['Hazardous', 'Whether material is hazardous', 'Yes'],
                        ['Phase Name', 'Name of the phase', 'Yes'],
                        ['Entry Phase', 'Entry point of phase', 'Yes'],
                        ['Exit Phase', 'Exit point of phase', 'Yes'],
                        ['Next Phase', 'Following phase', 'Yes'],
                        ['Operation', 'Operation details', 'Yes'],
                        ['Type', 'Operation type', 'Yes'],
                        ['Entry Operation', 'Entry point operation', 'Yes'],
                        ['Next Operation', 'Following operation', 'Yes'],
                        ['Resource', 'Resource required', 'Yes'],
                        ['Work Center', 'Associated work center', 'Yes'],
                        ['Duration', 'Time duration', 'Yes'],
                        ['Pressure', 'Pressure measurement', 'Yes'],
                        ['Packaging Type', 'Type of packaging', 'Yes'],
                        ['System Status', 'Current system status', 'Yes']
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

export default RecipeManual;