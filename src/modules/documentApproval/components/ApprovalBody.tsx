import { useState } from "react";
import { Header } from "./Header";
import { StatusSection } from "./StatusSection";
import { TabSection } from "./TabSection";
import ActionSection from "./ActionSection";
import MessageSection from "./MessageSection";

interface HeaderProps {
    OnClickMessage: () => void;
    count: number;
}

export default function ApprovalBody() {
    const [onClickMessage, setOnClickMessage] = useState(false);
    const data = [
        {
            id: 'Document ID',
            value: 'MFR-Doc-001',
        },
        {
            id: 'Document Type',
            value: 'MFR',
        },
        {
            id: 'Product Code',
            value: 'MFR-001',
        },
        {
            id: 'Submitted By',
            value: 'John Doe',
        },
        {
            id: 'Submitted On',
            value: '2021-01-01',
        },
    ];

    const attachments = [
        {
            name: 'Mfr_record.pdf',
            type: 'Pdf Document'
        },
        {
            name: 'Quality_record.pdf',
            type: 'Pdf Document'
        },
        {
            name: 'Quality_record.pdf',
            type: 'Pdf Document'
        },
        {
            name: 'Quality_record.pdf',
            type: 'Pdf Document'
        }
    ];

    const OnClickMessage = () => {
        setOnClickMessage(!onClickMessage);
    }

    return (
        <div style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
        }}>
            <Header OnClickMessage={OnClickMessage} count={5} onClickMessage={onClickMessage} />
            <StatusSection data={data} />
            {!onClickMessage && <TabSection documents={attachments} />}
            {onClickMessage && <MessageSection />}
            <ActionSection />
        </div>
    );
}