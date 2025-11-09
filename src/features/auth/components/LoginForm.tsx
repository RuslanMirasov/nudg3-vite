import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Label, Button } from '@/shared/components';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim().toLowerCase(), password);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);

      const status = (error as { status?: number }).status;
      const message = (error as { message?: string }).message || 'Login failed. Please try again.';

      if (status === 401) {
        toast.error('Invalid email or password');
      } else if (status === 403) {
        toast.error('Access denied. Please contact support.');
      } else if (status === 429) {
        toast.error('Too many login attempts. Please try again later.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting;

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-sm text-muted-foreground">Enter your email and password to access the dashboard</p>
      </div>

      {/* Email/Password Form */}
      <form className="grid gap-6" onSubmit={handleEmailLogin}>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isFormDisabled}
            autoComplete="email"
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isFormDisabled}
              className="pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isFormDisabled}
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isFormDisabled}>
          {isSubmitting && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />}
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
}
