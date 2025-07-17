import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

// This is a simplified stub to enable building
const RegisterPage = () => {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-bold">Register Account</h1>
        <p className="text-muted-foreground">
          Registration is handled through our Auth system.
        </p>
        <div className="pt-4">
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
