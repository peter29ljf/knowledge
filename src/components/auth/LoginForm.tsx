'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { User, Shield } from 'lucide-react';

export default function LoginForm() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'user' && !userName.trim()) {
        alert('Please enter your name.');
        return;
    }
    login(selectedRole, selectedRole === 'user' ? userName : 'Admin');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base">Select Your Role</Label>
        <RadioGroup
          defaultValue="user"
          onValueChange={(value) => setSelectedRole(value as UserRole)}
          className="mt-2 grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="user" id="user" className="peer sr-only" />
            <Label
              htmlFor="user"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <User className="mb-3 h-6 w-6" />
              User
            </Label>
          </div>
          <div>
            <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
            <Label
              htmlFor="admin"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Shield className="mb-3 h-6 w-6" />
              Admin
            </Label>
          </div>
        </RadioGroup>
      </div>

      {selectedRole === 'user' && (
        <div className="space-y-2">
          <Label htmlFor="username" className="text-base">Your Name</Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="text-base"
          />
        </div>
      )}
      
      {selectedRole === 'admin' && (
         <p className="text-sm text-muted-foreground p-2 rounded-md">
            Admin access is for demonstration. No password required.
          </p>
      )}

      <Button type="submit" className="w-full text-lg py-6">
        Login as {selectedRole === 'user' ? (userName || 'User') : 'Admin'}
      </Button>
    </form>
  );
}
