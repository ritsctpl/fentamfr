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
                <h1 style={style.title}>Site Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Site Maintenance Screen for creating, managing, and configuring site settings, time zones, and activity hooks.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>System administrators and site managers.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Site Maintenance</td>
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
                            <td style={style.td}>Site Creation</td>
                            <td style={style.td}>Create new site configurations with customizable settings</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Time Zone Management</td>
                            <td style={style.td}>Configure site time zones and settings</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Activity Hooks</td>
                            <td style={style.td}>Manage activity hooks for different process points</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Theme Customization</td>
                            <td style={style.td}>Customize site theme, colors, and branding</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Site Reload</td>
                            <td style={style.td}>Initialize and reload site configurations</td>
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
                            <td style={style.td}>https://yourdomain.com/site-maintenance</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Login Requirement</td>
                            <td style={style.td}>Username & Password</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Access Roles</td>
                            <td style={style.td}>System administrators and site managers</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Navigation Path</h2>
                <p>Main Menu → Site Maintenance → Configuration</p>
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
                            <td style={style.td}>Contains search functionality, site selector, and user instructions</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Site List</td>
                            <td style={style.td}>Displays all site configurations with their details (Site, Description, Type, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>+ Add New, Edit, Delete, Reload Site</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Configuration Panel</td>
                            <td style={style.td}>Form fields for creating/editing site configurations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Activity Hook Management</td>
                            <td style={style.td}>Manage activity hooks and their configurations</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Fields Definitions</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field</th>
                            <th style={style.th}>Description</th>
                            <th style={style.th}>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Site</td>
                            <td style={style.td}>Unique identifier for the site (uppercase, no spaces)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Description</td>
                            <td style={style.td}>Detailed description of the site</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Type</td>
                            <td style={style.td}>Type of site (e.g., Production)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Time Zone</td>
                            <td style={style.td}>Site time zone configuration</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>7. Activity Hook Management</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field</th>
                            <th style={style.th}>Description</th>
                            <th style={style.th}>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Hook Point</td>
                            <td style={style.td}>Process point for the activity hook</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Activity</td>
                            <td style={style.td}>Activity name or identifier</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Enabled</td>
                            <td style={style.td}>Toggle to enable/disable the hook</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>User Argument</td>
                            <td style={style.td}>Additional parameters for the hook</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>8. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.1. Creating a New Site</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "+" button in the top right corner</li>
                        <li style={style.listItem}>Fill in the required fields in the Main tab:
                            <ul style={style.list}>
                                <li>Site (uppercase, no spaces)</li>
                                <li>Description</li>
                                <li>Type</li>
                                <li>Time Zone</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Configure Activity Hooks:
                            <ul style={style.list}>
                                <li>Add hook points (Pre_Start, Post_Complete, etc.)</li>
                                <li>Set activity names</li>
                                <li>Enable/disable hooks as needed</li>
                                <li>Add user arguments if required</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Customize Theme (optional):
                            <ul style={style.list}>
                                <li>Set logo</li>
                                <li>Configure background color</li>
                                <li>Set text color</li>
                                <li>Choose line color</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Click "Save" to create the site</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.2. Editing an Existing Site</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a site from the list</li>
                        <li style={style.listItem}>Modify the necessary fields</li>
                        <li style={style.listItem}>Click "Save" to update the site</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.3. Deleting a Site</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the site to delete</li>
                        <li style={style.listItem}>Click the "Delete" button</li>
                        <li style={style.listItem}>Confirm the deletion in the prompt dialog</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.4. Reloading a Site</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the site to reload</li>
                        <li style={style.listItem}>Click the "Reload Site" button</li>
                        <li style={style.listItem}>Confirm the reload in the prompt dialog</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>9. Additional Features</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Feature</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Search</td>
                            <td style={style.td}>Search through existing sites by name, description, or type</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Full Screen Mode</td>
                            <td style={style.td}>Toggle full screen view for better visibility</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Site Selection</td>
                            <td style={style.td}>Switch between different sites for management</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Responsive Design</td>
                            <td style={style.td}>Adapts to different screen sizes and devices</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>10. FAQs / Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Cannot save site</td>
                            <td style={style.td}>Check all required fields are filled and site name is unique</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Activity hooks not working</td>
                            <td style={style.td}>Verify hook points and activity names are properly configured</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Time zone issues</td>
                            <td style={style.td}>Ensure time zone is correctly set and matches system requirements</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Theme not applying</td>
                            <td style={style.td}>Check theme configuration and color values</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
