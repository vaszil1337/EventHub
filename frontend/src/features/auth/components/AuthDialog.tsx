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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AuthUser } from '@/features/auth/types';
import { UserRole } from '@/features/events/types';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: AuthUser) => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, onAuthSuccess }) => {
  const { login, register } = useAuth();
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
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 1.5, sm: 2.5 },
          boxShadow: (theme) => `0 20px 25px -5px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
      data-testid="auth-dialog"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          pt: 1,
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Account Authentication
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Spring Security • Server-Signed JWT
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, px: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setError(null);
          }}
          sx={{
            mb: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontWeight: 600,
              fontSize: '0.85rem',
            },
          }}
        >
          <Tab icon={<LockOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Sign In" />
          <Tab icon={<PersonAddAltOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Create Account" />
        </Tabs>

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
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <TextField
              required
              type="email"
              label="Email Address"
              placeholder="organizer@eventhub.hu"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              required
              type="password"
              label="Password"
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
              sx={{ py: 1, fontWeight: 600, borderRadius: '8px' }}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Sign In with JWT
            </Button>

            <Divider sx={{ my: 0.5, borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                QUICK SEEDED ACCOUNTS
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
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' },
                }}
              >
                Participant Demo
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
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' },
                }}
              >
                Organizer Demo
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <TextField
              required
              label="Full Name"
              placeholder="e.g. János Szabó"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              required
              type="email"
              label="Email Address"
              placeholder="janos@example.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              required
              type="password"
              label="Password (min. 6 characters)"
              placeholder="••••••••"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              select
              required
              label="Account Role"
              value={registerRole}
              onChange={(e) => setRegisterRole(e.target.value as UserRole)}
              size="small"
              fullWidth
            >
              <MenuItem value="PARTICIPANT">PARTICIPANT (Book & manage own tickets)</MenuItem>
              <MenuItem value="ORGANIZER">ORGANIZER (Create events & ticket tiers)</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{ py: 1, fontWeight: 600, borderRadius: '8px' }}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Register & Sign In
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
