import React from 'react';
import logo from '@/images/FENTA-LOGO-F.png';

const UserInstructions: React.FC = () => {
    const style = {
        manual: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '900px',
            // margin: '40px auto',
            padding: '20px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#000',
            backgroundColor: '#fff'
        },
        header: {
            borderBottom: '2px solid #000',
            marginBottom: '30px',
            paddingBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold' as const,
            margin: '0 0 5px 0'
        },
        section: {
            marginBottom: '25px'
        },
        sectionTitle: {
            fontSize: '16px',
            fontWeight: 'bold' as const,
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        },
        subTitle: {
            fontSize: '14px',
            fontWeight: 'bold' as const,
            marginBottom: '10px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            marginBottom: '20px',
            border: '1px solid #000'
        },
        th: {
            border: '1px solid #000',
            padding: '8px',
            textAlign: 'left' as const,
            fontWeight: 'bold' as const,
            backgroundColor: '#fff'
        },
        td: {
            border: '1px solid #000',
            padding: '8px',
            verticalAlign: 'top' as const
        },
        list: {
            marginLeft: '20px',
            marginBottom: '15px'
        },
        listItem: {
            marginBottom: '5px'
        },
        required: {
            marginLeft: '5px'
        },
        logo: {
            width: '100px',
            height: '50px'
        }
    };

    return (
        <div style={style.manual} className="manual-content">
            <div style={style.header}>
                <h1 style={style.title}>Workflow Response Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Workflow Response Screen for viewing, filtering, and managing workflow responses and their associated data.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>System administrators, developers, and workflow managers.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Workflow Response</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>2. Main Features</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Feature</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Workflow Record Management</td>
                            <td style={style.td}>View and manage workflow records with their status and details</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search and Filter</td>
                            <td style={style.td}>Search workflow records and filter by status, date range, and identifier</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Response Types</td>
                            <td style={style.td}>View different types of responses including Input Data, Jolt, API, and XSLT responses</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status Tracking</td>
                            <td style={style.td}>Monitor workflow status (Pass/Fail/Pending) with visual indicators</td>
                        </tr>
                        <tr>
                            <td style={style.td}>JSON Viewer</td>
                            <td style={style.td}>View and analyze JSON responses in a formatted display</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Split Screen View</td>
                            <td style={style.td}>View workflow details and responses side by side</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. System Access</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Item</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>URL/Application Path</td>
                            <td style={style.td}>https://yourdomain.com/workflow-response</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Login Requirement</td>
                            <td style={style.td}>Username & Password</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Access Roles</td>
                            <td style={style.td}>System administrators, developers, and workflow managers</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Navigation Path</h2>
                <p>Main Menu → Workflow Response → View Records</p>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Screen Overview</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Section</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Header</td>
                            <td style={style.td}>Contains search functionality, filters, and user instructions</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Workflow List</td>
                            <td style={style.td}>Displays all workflow records with their details (Message ID, Identifier, Status, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Filter Panel</td>
                            <td style={style.td}>Status filter, date range picker, and identifier search</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Details Panel</td>
                            <td style={style.td}>Shows selected workflow details and response data</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Response Types</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Response Type</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Input Data</td>
                            <td style={style.td}>Initial input data for the workflow</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Pre-process Jolt Response</td>
                            <td style={style.td}>Jolt transformation results before processing</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Pre-process API Response</td>
                            <td style={style.td}>API response before processing</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Pre-process XSLT Response</td>
                            <td style={style.td}>XSLT transformation results before processing</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Post-process Jolt Response</td>
                            <td style={style.td}>Jolt transformation results after processing</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Post-process API Response</td>
                            <td style={style.td}>API response after processing</td>
                        </tr>
                        <tr>
                            <td style={style.td}>API to Process Response</td>
                            <td style={style.td}>Response from the processing API</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Pass Handler Response</td>
                            <td style={style.td}>Response from successful workflow execution</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Fail Handler Response</td>
                            <td style={style.td}>Response from failed workflow execution</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>7. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.1. Viewing Workflow Records</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Access the Workflow Response screen</li>
                        <li style={style.listItem}>View the list of workflow records in the main table</li>
                        <li style={style.listItem}>Click on any record to view its details in the side panel</li>
                        <li style={style.listItem}>Select different response types from the dropdown to view various responses</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.2. Filtering Records</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Use the Status dropdown to filter by Pass/Fail/Pending</li>
                        <li style={style.listItem}>Select a date range using the Date Range picker</li>
                        <li style={style.listItem}>Enter an identifier in the search field</li>
                        <li style={style.listItem}>Click "Go" to apply filters</li>
                        <li style={style.listItem}>Click "Reset" to clear all filters</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.3. Viewing Response Details</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a workflow record from the list</li>
                        <li style={style.listItem}>View basic information in the details panel</li>
                        <li style={style.listItem}>Select a response type from the dropdown</li>
                        <li style={style.listItem}>View the formatted JSON response in the text area</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>8. Additional Features</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Feature</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Top 50 View</td>
                            <td style={style.td}>Quick access to the 50 most recent workflow records</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Split Screen</td>
                            <td style={style.td}>View records and details side by side</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status Indicators</td>
                            <td style={style.td}>Visual indicators for Pass (🟢), Fail (❌), and Pending (⏳) statuses</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Multi-language Support</td>
                            <td style={style.td}>Interface available in multiple languages</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Responsive Design</td>
                            <td style={style.td}>Adapts to different screen sizes and devices</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>9. FAQs / Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>No records displayed</td>
                            <td style={style.td}>Check filters and ensure you have proper access rights</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Cannot view response details</td>
                            <td style={style.td}>Verify that the selected record has the requested response type</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Filters not working</td>
                            <td style={style.td}>Ensure all filter values are valid and try resetting filters</td>
                        </tr>
                        <tr>
                            <td style={style.td}>JSON not formatted</td>
                            <td style={style.td}>Check if the response is valid JSON format</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Screen layout issues</td>
                            <td style={style.td}>Try refreshing the page or adjusting browser window size</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
