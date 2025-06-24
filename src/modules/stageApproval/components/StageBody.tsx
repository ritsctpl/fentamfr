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
            id: 'Batch ID',
            value: 'BN-2025-001',
        },
        {
            id: 'Stage',
            value: 'BFR',
        },
        {
            id: 'Product Code',
            value: 'BFR-001',
        },
        {
            id: 'Priority',
            value: 'High',
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