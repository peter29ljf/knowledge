'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { User, Shield, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 默认凭据
const DEFAULT_CREDENTIALS = {
  users: {
    'yoyo': '100905',
    'lucas': '123123'
  } as Record<string, string>,
  admin: {
    password: '0987'
  }
};

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 用户名验证
    if (selectedRole === 'user' && !userName.trim()) {
      toast({
        title: "验证失败",
        description: "请输入您的名称",
        variant: "destructive"
      });
      return;
    }
    
    // 密码验证
    let isValidPassword = false;
    
    if (selectedRole === 'user') {
      // 检查用户名和密码组合是否正确
      isValidPassword = Object.prototype.hasOwnProperty.call(DEFAULT_CREDENTIALS.users, userName) && 
                        DEFAULT_CREDENTIALS.users[userName] === password;
    } else {
      // 管理员密码验证
      isValidPassword = password === DEFAULT_CREDENTIALS.admin.password;
    }
    
    if (!isValidPassword) {
      toast({
        title: "密码错误",
        description: `${selectedRole === 'user' ? '用户' : '管理员'}密码不正确`,
        variant: "destructive"
      });
      return;
    }
    
    // 登录成功
    login(selectedRole, selectedRole === 'user' ? userName : 'Admin');
    toast({
      title: "登录成功",
      description: `欢迎回来，${selectedRole === 'user' ? userName : '管理员'}`,
      variant: "default"
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base">选择您的角色</Label>
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
              用户
            </Label>
          </div>
          <div>
            <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
            <Label
              htmlFor="admin"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Shield className="mb-3 h-6 w-6" />
              管理员
            </Label>
          </div>
        </RadioGroup>
      </div>

      {selectedRole === 'user' && (
        <div className="space-y-2">
          <Label htmlFor="username" className="text-base">您的名称</Label>
          <Input
            id="username"
            type="text"
            placeholder="请输入您的名称"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="text-base"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">密码</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={`请输入${selectedRole === 'user' ? '用户' : '管理员'}密码`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="text-base pr-10"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* 
        <p className="text-xs text-muted-foreground">
          {selectedRole === 'user' 
            ? '用户: yoyo(密码:100905) 或 lucas(密码:123123)' 
            : '管理员密码: 0987'} (演示用)
        </p>
        */}
      </div>

      <Button type="submit" className="w-full text-lg py-6">
        登录为 {selectedRole === 'user' ? (userName || '用户') : '管理员'}
      </Button>
    </form>
  );
}
