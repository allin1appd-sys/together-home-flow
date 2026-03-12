import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Home, Loader2, Phone, Lock } from 'lucide-react';

export default function PhoneSignup() {
  const { signUpWithPhone, signInWithPhone } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (pin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUpWithPhone(phone, pin);
      setLoading(false);
      if (error) {
        if (error.message?.includes('already registered')) {
          toast.error('This phone number is already registered. Try signing in.');
          setMode('login');
        } else {
          toast.error(error.message);
        }
      } else {
        navigate('/', { replace: true });
      }
    } else {
      const { error } = await signInWithPhone(phone, pin);
      setLoading(false);
      if (error) {
        toast.error('Invalid phone number or PIN');
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
            <Home className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'signup' ? 'Welcome to HomeHub' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {mode === 'signup'
              ? 'Enter your phone number and create a 4-digit PIN'
              : 'Sign in with your phone number and PIN'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
                autoComplete="tel"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> 4-Digit PIN
              </Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 4) setPin(val);
                }}
                placeholder="••••"
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
              />
              <p className="text-[11px] text-muted-foreground text-center">
                {mode === 'signup' ? 'Choose a PIN to secure your account' : 'Enter your PIN to sign in'}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full h-12 text-base" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signup' ? 'Get Started 🚀' : 'Sign In'}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {mode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
