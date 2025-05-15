import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'nookies';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  console.log("Received code:", code);

  if (!code) {
    res.status(400).json({ error: 'Code is missing' });
    return;
  }

  const encodedParams = new URLSearchParams();
  encodedParams.set('grant_type', 'authorization_code');
  encodedParams.set('client_id', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!);
  encodedParams.set('client_secret', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET!);
  encodedParams.set('code', String(code));
  encodedParams.set('redirect_uri', process.env.NEXT_PUBLIC_REDIRECT_URI!);

  const url = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;

  console.log("Token request URL:", url);
  console.log("Encoded params:", encodedParams.toString());

  try {
    const response = await axios.post(url, encodedParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("Token response:", response.data);

    const { access_token, refresh_token } = response.data;

    setCookie({ res }, 'accessToken', access_token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    setCookie({ res }, 'refreshToken', refresh_token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    res.redirect('/app');
  } catch (error) {
    console.error('Error fetching tokens:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
}

