import { getGroupPreview } from '@services/groupBuilderService';
import React, { useState, useEffect } from 'react';


const Preview = ({ sections }: { sections: any[] }) => {

    const [previewData, setPreviewData] = useState([]);

    useEffect(() => {
        const fetchPreviewData = async () => {
            const response = await getGroupPreview({sectionsIds: sections.map(section => section.handle)});
            setPreviewData(response);
        };
        fetchPreviewData();
    }, [sections]);

    return (
        <div style={{width: '100%', height: '100%', overflow: 'auto', backgroundColor: '#f0f0f0'}}>
            {previewData.map((section, index) => (
                <div key={index}>
                    <h2>{section.sectionLabel}</h2>
                    <div>
                        {section.components.map((component, index) => (
                            <div key={index}>   
                                <h3>{component.componentLabel}</h3>
                                <p>{component.dataType}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Preview;