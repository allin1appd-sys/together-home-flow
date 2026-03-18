import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Home, Loader2, User } from 'lucide-react';

export default function JoinHousehold() {
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const { autoJoin, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('join.enterNameError'));
      return;
    }
    if (!code) {
      toast.error(t('join.invalidLink'));
      return;
    }

    setLoading(true);
    const { error } = await autoJoin(name.trim(), code);
    setLoading(false);

    if (error) {
      toast.error(error.message || t('join.joinFailed'));
    } else {
      toast.success(t('join.welcomeFamily'));
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
            <Home className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t('join.joinHomeHub')}</CardTitle>
          <CardDescription>{t('join.joinDescription')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleJoin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {t('join.yourName')}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('join.enterYourName')}
                required
                autoFocus
                className="h-12 text-base"
              />
            </div>
            {code && (
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">{t('join.inviteCode')}</p>
                <p className="text-sm font-mono font-bold tracking-widest">{code}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-base" type="submit" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('join.joinHousehold')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}