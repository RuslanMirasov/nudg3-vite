import { useState } from 'react';
//import { IconKey, IconEye, IconEyeOff } from '@tabler/icons-react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<PasswordData>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const { user } = useAuth();

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswords = (): boolean => {
    const newErrors: Partial<PasswordData> = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwords.currentPassword === passwords.newPassword && passwords.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });

      // Success
      toast.success('Password changed successfully!');

      // Reset form
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setShowPasswords({ current: false, new: false, confirm: false });
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Password change error:', error);
      let errorMessage = 'Failed to change password';

      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          errorMessage = parsed.detail || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPasswords({ current: false, new: false, confirm: false });
    onOpenChange(false);
  };

  const isFormValid =
    passwords.currentPassword && passwords.newPassword && passwords.confirmPassword && Object.keys(errors).length === 0 && !isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <IconKey className="h-5 w-5" /> */}
            <Key className="h-5 w-5" />
            Change Password
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={e => handleInputChange('currentPassword', e.target.value)}
                className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
              />
              <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => togglePasswordVisibility('current')}>
                {showPasswords.current ? (
                  // <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  // <IconEye className="h-4 w-4 text-muted-foreground" />
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Enter new password"
                value={passwords.newPassword}
                onChange={e => handleInputChange('newPassword', e.target.value)}
                className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
              />
              <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => togglePasswordVisibility('new')}>
                {showPasswords.new ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => togglePasswordVisibility('confirm')}>
                {showPasswords.confirm ? (
                  // <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  // <IconEye className="h-4 w-4 text-muted-foreground" />
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
