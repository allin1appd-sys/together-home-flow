import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Home, Loader2, Phone, Lock } from 'lucide-react';

export default function PhoneSignup() {
  const { t } = useTranslation();
  const { signUpWithPhone, signInWithPhone } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      toast.error(t('auth.validPhoneError'));
      return;
    }
    if (pin.length !== 4) {
      toast.error(t('auth.pinLengthError'));
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUpWithPhone(phone, pin);
      setLoading(false);
      if (error) {
        if (error.message?.includes('already registered')) {
          toast.error(t('auth.alreadyRegistered'));
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
        toast.error(t('auth.invalidCredentials'));
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
            {mode === 'signup' ? t('auth.welcomeToHomeHub') : t('auth.welcomeBack')}
          </CardTitle>
          <CardDescription>
            {mode === 'signup' ? t('auth.signupDescription') : t('auth.loginDescription')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {t('auth.phoneNumber')}
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
                <Lock className="h-3.5 w-3.5" /> {t('auth.fourDigitPin')}
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
                {mode === 'signup' ? t('auth.choosePinHint') : t('auth.enterPinHint')}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full h-12 text-base" type="submit" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {mode === 'signup' ? t('auth.getStarted') : t('auth.signIn')}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {mode === 'signup' ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}