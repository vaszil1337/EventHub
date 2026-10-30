import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  MenuItem,
  CircularProgress,
  Divider,
  alpha,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AuthUser } from '@/features/auth/types';
import { UserRole } from '@/features/events/types';
import { useTranslation } from '@/shared/context/I18nContext';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: AuthUser) => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, onAuthSuccess }) => {
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Register State
  const [fullName, setFullName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerRole, setRegisterRole] = useState<UserRole>('PARTICIPANT');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await login({ email: loginEmail, password: loginPassword });
      if (onAuthSuccess) {
        onAuthSuccess(loggedInUser);
      }
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setLoginEmail(email);
      setLoginPassword(password);
      const loggedInUser = await login({ email, password });
      if (onAuthSuccess) {
        onAuthSuccess(loggedInUser);
      }
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const createdUser = await register({
        fullName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
      });
      if (onAuthSuccess) {
        onAuthSuccess(createdUser);
      }
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 2.5, sm: 3 },
          boxShadow: (theme) => `0 20px 25px -5px ${alpha(theme.palette.common.black, 0.1)}`,
          // Compact, fixed height to prevent layout shifts without excessive whitespace
          height: { xs: 'auto', sm: 475 },
          minHeight: { xs: 'auto', sm: 475 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      data-testid="auth-dialog"
    >
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          p: 0,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}
          >
            {activeTab === 0 ? t('auth.welcomeBackHeading') : t('auth.register')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {activeTab === 0
              ? t('auth.signInDescription')
              : t('auth.registerDescription')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', mt: -0.5, mr: -0.5 }}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Modern Segmented Control Tab Bar */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => {
          setActiveTab(val);
          setError(null);
        }}
        sx={{
          mb: 2,
          minHeight: 40,
          bgcolor: 'action.hover',
          p: 0.5,
          borderRadius: '8px',
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTab-root': {
            flex: 1,
            minHeight: 32,
            py: 0.5,
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'text.secondary',
            textTransform: 'none',
            transition: 'all 0.15s ease-in-out',
            '&.Mui-selected': {
              color: 'text.primary',
              bgcolor: 'background.paper',
              boxShadow: (theme) => `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`,
            },
          },
        }}
      >
        <Tab label={t('auth.signIn')} />
        <Tab label={t('auth.register')} />
      </Tabs>

      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'error.main',
              bgcolor: 'error.light',
              color: 'error.dark',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </Alert>
        )}

        {activeTab === 0 ? (
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            <TextField
              required
              type="email"
              label={t('auth.email')}
              placeholder="organizer@eventhub.hu"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              required
              type="password"
              label={t('auth.password')}
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              size="small"
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{ py: 1, fontWeight: 700, borderRadius: '8px', mt: 0.25 }}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {t('auth.signIn')}
            </Button>

            {/* Quick Demo Access positioned compactly below submit */}
            <Divider sx={{ my: 0.5, borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('auth.quickDemoLogin')}
              </Typography>
            </Divider>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={loading}
                startIcon={<PersonOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleQuickDemoLogin('participant@eventhub.hu', 'participant123')}
                data-testid="demo-login-participant"
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  py: 0.75,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' },
                }}
              >
                {t('auth.participantDemo')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={loading}
                startIcon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleQuickDemoLogin('organizer@eventhub.hu', 'organizer123')}
                data-testid="demo-login-organizer"
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  py: 0.75,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' },
                }}
              >
                {t('auth.organizerDemo')}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            <TextField
              required
              label={t('auth.fullName')}
              placeholder="e.g. János Szabó"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              required
              type="email"
              label={t('auth.email')}
              placeholder="janos@example.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              required
              type="password"
              label={t('auth.password')}
              placeholder="••••••••"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              select
              required
              label={t('auth.role')}
              value={registerRole}
              onChange={(e) => setRegisterRole(e.target.value as UserRole)}
              size="small"
              fullWidth
            >
              <MenuItem value="PARTICIPANT">{t('auth.participant')}</MenuItem>
              <MenuItem value="ORGANIZER">{t('auth.organizer')}</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{ py: 1, fontWeight: 700, borderRadius: '8px', mt: 0.5 }}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {t('auth.registerAndSignIn')}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
