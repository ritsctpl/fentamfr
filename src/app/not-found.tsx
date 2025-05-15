"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import NotFoundPng from '../images/page-not-found.jpg';

const NotFoundPage = () => {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(5); // Initialize with 5 seconds

  const handleGoHome = () => {
    router.push('/');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Decrement every second

    return () => clearInterval(timer); // Clean up the timer on unmount
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <img 
        src={NotFoundPng.src}
        alt="404 Page Not Found"
        style={{ maxWidth: '400px', marginBottom: '20px' }}
      />
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button 
        onClick={handleGoHome} 
        style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }} 
        icon={<HomeOutlined />}
      >
        Go to Home
      </Button>
      <p style={{ marginTop: '20px' }}>
        Redirecting to home in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}...
      </p>
    </div>
  );
};

export default NotFoundPage;
