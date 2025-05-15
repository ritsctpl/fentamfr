/*import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginButton: React.FC = () => {
  const { login } = useAuth();

  return <button onClick={login}>Login</button>;
};

export default LoginButton;
*/
'use client';

import React from 'react';

const LoginButton: React.FC = () => {
  const handleLogin = () => {
    console.log("Login button clicked");
    // Temporarily comment out Keycloak login logic for debugging
    // const keycloak = getKeycloakInstance();
    // if (keycloak) {
    //   keycloak.login();
    // }
  };

  return (
    <button onClick={handleLogin}>Login</button>
  );
};

export default LoginButton;
