"use client"
import React, { useEffect, useState } from "react";
import { BuyOffProvider } from '../hooks/BuyOffContext';
import BuyOffContent from './BuyOffContent';
import CommonAppBar from "@components/CommonAppBar";
import { useTranslation } from "react-i18next";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useAuth } from "@context/AuthContext";

interface DecodedToken {
    preferred_username: string;
}
export default function BuyOff() {
    const { t } = useTranslation();
    const { isAuthenticated, token } = useAuth();
    const [username, setUsername] = useState(null);

    useEffect(() => {
        try {
            const decryptedToken = decryptToken(token);
            const decoded: DecodedToken = jwtDecode(decryptedToken);
            setUsername(decoded.preferred_username);
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        // const decryptedToken = decryptToken(token);
        // const decoded: DecodedToken = jwtDecode(decryptedToken);
        // setUsername(decoded.preferred_username);
    }, [isAuthenticated, token]);

    const [call, setCall] = useState(0);

    return (
        
        <BuyOffProvider>
            <CommonAppBar
                onSearchChange={() => { }}
                allActivities={[]}
                username={username}
                site={null}
                appTitle={t("BuyOff")} onSiteChange={function (newSite: string): void {
                    setCall(call + 1);
                }} />
            <BuyOffContent />
        </BuyOffProvider>
    );
}