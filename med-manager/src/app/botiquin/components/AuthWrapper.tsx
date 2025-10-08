"use client";

import { useEffect, useState } from "react";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular un breve delay para mostrar el loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 segundo de loader

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeContent: 'center', height: '100vh' }}>
        <Cardio
          size={70}
          stroke={5}
          speed={1}
          color="var(--color-info)"
        />
      </div>
    );
  }

  return <>{children}</>;
}
