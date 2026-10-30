import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  TextField,
  InputAdornment,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { Ticket } from '@/features/ticket-booking/types';
import { ticketService } from '@/features/ticket-booking/services/ticketService';
import { eventService } from '@/features/events/services/eventService';
import { Event, UserRole } from '@/features/events/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';
import { useTranslation } from '@/shared/context/I18nContext';
import { getLocalizedEventTitle, getLocalizedTierName } from '@/shared/utils/eventLocalization';
import { translateBackendMessage } from '@/shared/utils/errorTranslator';

interface TicketsPageProps {
  userRole?: UserRole;
  onTicketCancelled?: (ticket: Ticket) => void;
  onOpenAuth?: () => void;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({
  userRole = 'PARTICIPANT',
  onTicketCancelled,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { locale, t } = useTranslation();
  const effectiveRole = user?.role || userRole;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [eventMap, setEventMap] = useState<Record<string, Event>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadTickets() {
      try {
        setLoading(true);
        const fetchedTickets = effectiveRole === 'ORGANIZER'
          ? await ticketService.getTickets()
          : await ticketService.getTickets(user?.email);
        setTickets(fetchedTickets);

        const allEvents = await eventService.getEvents();
        const eventsByIdMap = allEvents.reduce(
          (acc, event) => {
            acc[event.id] = event;
            return acc;
          },
          {} as Record<string, Event>
        );
        setEventMap(eventsByIdMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('tickets.loadFailed'));
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [isAuthenticated, user?.email, effectiveRole]);

  const handleCopyTicketCode = (ticketCode: string, ticketId: string) => {
    navigator.clipboard?.writeText(ticketCode).then(() => {
      setCopiedTicketId(ticketId);
      setTimeout(() => setCopiedTicketId(null), 2000);
    });
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      setCancellingId(ticketId);
      const cancelled = await ticketService.cancelTicket(ticketId);

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: 'CANCELLED' } : t))
      );

      if (onTicketCancelled) {
        onTicketCancelled(cancelled);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tickets.cancelFailed'));
    } finally {
      setCancellingId(null);
    }
  };

  // Filtered tickets based on search query, event filter, and status filter
  const filteredTickets = tickets.filter((t) => {
    if (selectedEventFilter !== 'ALL' && t.eventId !== selectedEventFilter) {
      return false;
    }
    if (selectedStatusFilter === 'CONFIRMED' && t.status === 'CANCELLED') {
      return false;
    }
    if (selectedStatusFilter === 'CANCELLED' && t.status !== 'CANCELLED') {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const event = eventMap[t.eventId];
      const eventTitleEn = event?.title?.toLowerCase() || '';
      const eventTitleHu = (event ? getLocalizedEventTitle(event, 'hu') : '').toLowerCase();
      const name = t.participantName.toLowerCase();
      const email = t.participantEmail.toLowerCase();
      const code = t.ticketCode.toLowerCase();
      const tier = (t.ticketTypeName || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        eventTitleEn.includes(q) ||
        eventTitleHu.includes(q) ||
        code.includes(q) ||
        tier.includes(q)
      );
    }
    return true;
  });

  // Organizer KPI Calculations
  const activeTickets = tickets.filter((t) => t.status !== 'CANCELLED');
  const cancelledTickets = tickets.filter((t) => t.status === 'CANCELLED');
  const totalRevenue = activeTickets.reduce((sum, t) => sum + (t.price?.amount || 0), 0);
  const revenueCurrency = activeTickets[0]?.price?.currency || 'USD';
  const deliveredEmails = activeTickets.filter((t) => t.emailStatus === 'SENT').length;
  const pendingEmails = activeTickets.filter((t) => t.emailStatus === 'FAILED_PENDING_RETRY').length;
  const emailDeliveryRate = activeTickets.length > 0 ? Math.round((deliveredEmails / activeTickets.length) * 100) : 100;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ color: 'primary.main' }} />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Box
          data-testid="unauthenticated-tickets-notice"
          sx={{
            p: { xs: 4, sm: 6 },
            bgcolor: 'background.paper',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              bgcolor: 'action.hover',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            {t('tickets.loginPromptTitle')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>
            {t('tickets.loginPromptSubtitle')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onOpenAuth}
            startIcon={<LockOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: '8px' }}
          >
            {t('tickets.loginPromptButton')}
          </Button>
        </Box>
      </Container>
    );
  }

  const cleanUserName = user?.fullName?.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim();

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pt: { xs: 5, md: 7 },
          pb: { xs: 4, md: 5 },
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ maxWidth: 680 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '9999px',
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  mb: 2,
                }}
              >
                {effectiveRole === 'ORGANIZER' ? (
                  <>
                    <AssignmentOutlinedIcon sx={{ fontSize: 14 }} />
                    {t('tickets.pillReservations', { count: filteredTickets.length })}
                  </>
                ) : (
                  <>
                    <ConfirmationNumberOutlinedIcon sx={{ fontSize: 14 }} />
                    {t('tickets.pillPasses', { count: filteredTickets.length })}
                  </>
                )}
              </Box>

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  mb: 1.5,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  letterSpacing: '-0.03em',
                }}
              >
                {effectiveRole === 'ORGANIZER' ? t('tickets.organizerTitle') : t('tickets.myTicketsTitle')}
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {effectiveRole === 'ORGANIZER'
                  ? t('tickets.organizerSubtitle', { name: cleanUserName || t('auth.organizer'), email: user?.email || '' })
                  : t('tickets.myTicketsSubtitle', { name: cleanUserName || t('auth.participant'), email: user?.email || '' })}
              </Typography>
            </Box>

            {/* In Participant view, show simple search bar in header if tickets exist */}
            {effectiveRole === 'PARTICIPANT' && tickets.length > 0 && (
              <TextField
                size="small"
                placeholder={t('tickets.filterPassPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 280 }, bgcolor: 'background.default' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="lg">
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'error.main',
              bgcolor: 'error.light',
              color: 'error.dark',
            }}
          >
            {translateBackendMessage(error, t)}
          </Alert>
        )}

        {/* =========================================================================
            ORGANIZER MANAGEMENT VIEW: KPI METRICS + ADVANCED FILTERS + DATA TABLE
            ========================================================================= */}
        {effectiveRole === 'ORGANIZER' ? (
          <Box>
            {/* Top KPI Metrics Cards */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {/* Active Bookings */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('tickets.kpiActiveBookings')}
                    </Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        bgcolor: 'action.hover',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1, mb: 0.5 }}>
                      {activeTickets.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {t('tickets.kpiOutOfTotal', { count: tickets.length })}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Gross Revenue */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('tickets.kpiGrossRevenue')}
                    </Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        bgcolor: 'action.hover',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUpOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1, mb: 0.5 }}>
                      {formatMoney({ amount: totalRevenue, currency: revenueCurrency }, locale)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {t('tickets.kpiFromActiveSeats', { count: activeTickets.length })}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Email Delivery Health */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('tickets.kpiEmailHealth')}
                    </Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        bgcolor: 'action.hover',
                        color: pendingEmails > 0 ? 'warning.main' : 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1, mb: 0.5 }}>
                      {emailDeliveryRate}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: pendingEmails > 0 ? 'warning.dark' : 'text.secondary', fontWeight: 500 }}>
                      {pendingEmails > 0 ? t('tickets.kpiEmailsRetryQueued', { count: pendingEmails }) : t('tickets.kpiAllEmailsSent')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Cancelled Seats */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('tickets.kpiCancelledSeats')}
                    </Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        bgcolor: 'action.hover',
                        color: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1, mb: 0.5 }}>
                      {cancelledTickets.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {t('tickets.kpiReleasedBack')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Organizer Filters Bar */}
            <Box
              sx={{
                p: 2,
                mb: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                <TextField
                  size="small"
                  placeholder={t('tickets.filterSearchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 280 }, bgcolor: 'background.default' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                  <InputLabel id="event-filter-select-label">{t('tickets.filterEventLabel')}</InputLabel>
                  <Select
                    labelId="event-filter-select-label"
                    id="event-filter-select"
                    value={selectedEventFilter}
                    label={t('tickets.filterEventLabel')}
                    onChange={(e) => setSelectedEventFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">{t('tickets.allEventsFilterCount', { count: Object.keys(eventMap).length })}</MenuItem>
                    {Object.values(eventMap).map((ev) => (
                      <MenuItem key={ev.id} value={ev.id}>
                        {getLocalizedEventTitle(ev, locale)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                  <InputLabel id="status-filter-select-label">{t('tickets.filterStatusLabel')}</InputLabel>
                  <Select
                    labelId="status-filter-select-label"
                    id="status-filter-select"
                    value={selectedStatusFilter}
                    label={t('tickets.filterStatusLabel')}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">{t('tickets.allStatuses')}</MenuItem>
                    <MenuItem value="CONFIRMED">{t('tickets.confirmedOnly')}</MenuItem>
                    <MenuItem value="CANCELLED">{t('tickets.cancelledOnly')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {(searchTerm || selectedEventFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedEventFilter('ALL');
                    setSelectedStatusFilter('ALL');
                  }}
                  sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {t('tickets.resetFilters')}
                </Button>
              )}
            </Box>

            {/* Organizer Reservations Data Table */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em', py: 1.5 }}>
                      {t('tickets.thAttendee')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em', py: 1.5 }}>
                      {t('tickets.thEventDate')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em', py: 1.5 }}>
                      {t('tickets.thTier')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em', py: 1.5 }}>
                      {t('tickets.thCode')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em', py: 1.5 }}>
                      {t('tickets.thEmailStatus')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em', py: 1.5 }}>
                      {t('tickets.thStatus')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em', py: 1.5 }}>
                      {t('tickets.thActions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 8, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                          {t('tickets.noReservationsFound')}
                        </Typography>
                        {(searchTerm || selectedEventFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedEventFilter('ALL');
                              setSelectedStatusFilter('ALL');
                            }}
                          >
                            {t('tickets.clearAllFilters')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const event = eventMap[ticket.eventId];
                      const isCancelled = ticket.status === 'CANCELLED';
                      const emailRetryPending = ticket.emailStatus === 'FAILED_PENDING_RETRY';

                      return (
                        <TableRow
                          key={ticket.id}
                          hover
                          sx={{
                            opacity: isCancelled ? 0.65 : 1,
                            bgcolor: isCancelled ? 'action.hover' : 'inherit',
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          {/* Attendee */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {ticket.participantName.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {ticket.participantEmail}
                            </Typography>
                          </TableCell>

                          {/* Event & Date */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {event ? getLocalizedEventTitle(event, locale) : ticket.eventId}
                            </Typography>
                            {event && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {formatEventDate(event.date, locale)} • {event.venue.name}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Tier & Price */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', textTransform: 'uppercase' }}>
                              {ticket.ticketTypeName ? getLocalizedTierName(ticket.ticketTypeName, locale) : t('common.standard')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontFeatureSettings: '"tnum"' }}>
                              {formatMoney(ticket.price, locale)}
                            </Typography>
                          </TableCell>

                          {/* Pass Code */}
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                data-testid="ticket-code-display"
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  color: 'text.primary',
                                  letterSpacing: '0.02em',
                                  textDecoration: isCancelled ? 'line-through' : 'none',
                                }}
                              >
                                {ticket.ticketCode}
                              </Typography>
                              <Tooltip title={copiedTicketId === ticket.id ? t('booking.codeCopied') : t('booking.copyCode')}>
                                <Button
                                  size="small"
                                  onClick={() => handleCopyTicketCode(ticket.ticketCode, ticket.id)}
                                  sx={{
                                    minWidth: 'auto',
                                    p: 0.5,
                                    color: copiedTicketId === ticket.id ? 'success.main' : 'text.secondary',
                                    '&:hover': { bgcolor: 'action.hover' },
                                  }}
                                >
                                  {copiedTicketId === ticket.id ? (
                                    <CheckOutlinedIcon sx={{ fontSize: 15 }} />
                                  ) : (
                                    <ContentCopyOutlinedIcon sx={{ fontSize: 15 }} />
                                  )}
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {/* Email Status */}
                          <TableCell sx={{ py: 2 }}>
                            {emailRetryPending ? (
                              <Chip
                                size="small"
                                variant="outlined"
                                icon={<WarningAmberOutlinedIcon sx={{ fontSize: 14 }} />}
                                label={t('tickets.emailPending')}
                                sx={{
                                  borderColor: 'warning.main',
                                  color: 'warning.dark',
                                  fontWeight: 600,
                                  fontSize: '0.72rem',
                                }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                variant="outlined"
                                icon={<CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                                label={t('tickets.emailDelivered')}
                                sx={{
                                  borderColor: 'success.main',
                                  color: 'success.dark',
                                  fontWeight: 600,
                                  fontSize: '0.72rem',
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ py: 2 }}>
                            {isCancelled ? (
                              <Chip
                                size="small"
                                label={t('tickets.statusCancelled')}
                                sx={{
                                  bgcolor: 'error.light',
                                  border: '1px solid',
                                  borderColor: 'error.main',
                                  color: 'error.dark',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                label={t('tickets.statusConfirmed')}
                                sx={{
                                  bgcolor: 'success.light',
                                  border: '1px solid',
                                  borderColor: 'success.main',
                                  color: 'success.dark',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ py: 2 }}>
                            {!isCancelled ? (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={cancellingId === ticket.id}
                                startIcon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleCancelTicket(ticket.id)}
                                data-testid={`cancel-ticket-${ticket.id}`}
                                sx={{
                                  borderRadius: '6px',
                                  borderColor: 'divider',
                                  color: 'error.main',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  py: 0.4,
                                  px: 1.25,
                                  '&:hover': {
                                    borderColor: 'error.main',
                                    bgcolor: 'error.light',
                                  },
                                }}
                              >
                                {cancellingId === ticket.id ? t('tickets.cancelling') : t('tickets.cancelTicket')}
                              </Button>
                            ) : (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {t('tickets.released')}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          /* =========================================================================
             PARTICIPANT BOARDING PASSES VIEW: CARDS GRID
             ========================================================================= */
          <Box>
            {filteredTickets.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 10,
                  px: 3,
                  bgcolor: 'background.paper',
                  borderRadius: '12px',
                  border: '1px dashed',
                  borderColor: 'divider',
                  maxWidth: 520,
                  mx: 'auto',
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <ConfirmationNumberOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  {t('tickets.noTicketsYet')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  {t('tickets.noTicketsYetDesc')}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/"
                  variant="contained"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '8px',
                    px: 2.5,
                    py: 1,
                  }}
                >
                  {t('tickets.browseEvents')}
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredTickets.map((ticket) => {
                  const event = eventMap[ticket.eventId];
                  const purchaseDate = new Date(ticket.purchaseDate);
                  const formattedPurchaseDate = purchaseDate.toLocaleDateString(locale === 'hu' ? 'hu-HU' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const isCancelled = ticket.status === 'CANCELLED';
                  const emailRetryPending = ticket.emailStatus === 'FAILED_PENDING_RETRY';

                  return (
                    <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                      {/* Modern Boarding Pass / Ticket Card */}
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: isCancelled ? 'error.main' : 'divider',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          opacity: isCancelled ? 0.72 : 1,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          '&:hover': {
                            borderColor: isCancelled ? 'error.main' : 'text.secondary',
                            boxShadow: (theme) => `0 8px 24px -4px ${theme.palette.action.hover}`,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Top Bar: Ticket Status & Purchase Date */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1,
                                py: 0.25,
                                borderRadius: '9999px',
                                bgcolor: isCancelled ? 'error.light' : 'success.light',
                                border: '1px solid',
                                borderColor: isCancelled ? 'error.main' : 'success.main',
                                color: isCancelled ? 'error.dark' : 'success.dark',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  bgcolor: isCancelled ? 'error.main' : 'success.main',
                                }}
                              />
                              {isCancelled ? t('tickets.statusCancelled') : t('tickets.statusConfirmedPass')}
                            </Box>

                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              {formattedPurchaseDate}
                            </Typography>
                          </Box>

                          {/* Event Title & Tier */}
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: '1.05rem',
                              color: 'text.primary',
                              lineHeight: 1.35,
                              mb: 0.5,
                            }}
                          >
                            {event ? getLocalizedEventTitle(event, locale) : 'Event Reservation'}
                          </Typography>

                          {ticket.ticketTypeName && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                mb: 1.25,
                                display: 'block',
                              }}
                            >
                              {t('tickets.tierLabel')}: {ticket.ticketTypeName ? getLocalizedTierName(ticket.ticketTypeName, locale) : t('common.standard')}
                            </Typography>
                          )}

                          {/* Event Meta */}
                          {event && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                                <CalendarTodayOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                  {formatEventDate(event.date, locale)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                                <PlaceOutlinedIcon sx={{ fontSize: '0.9rem', flexShrink: 0 }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {event.venue.name}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Perforated Stub Section */}
                          <Box
                            sx={{
                              mt: 'auto',
                              pt: 2,
                              borderTop: '1px dashed',
                              borderColor: 'divider',
                            }}
                          >
                            {/* Ticket Code Box */}
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: '8px',
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 1.5,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    display: 'block',
                                  }}
                                >
                                  {t('tickets.thCode')}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: '"JetBrains Mono", monospace',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    color: 'text.primary',
                                    letterSpacing: '0.03em',
                                    textDecoration: isCancelled ? 'line-through' : 'none',
                                  }}
                                  data-testid="ticket-code-display"
                                >
                                  {ticket.ticketCode}
                                </Typography>
                              </Box>

                              <Tooltip title={copiedTicketId === ticket.id ? t('booking.codeCopied') : t('booking.copyCode')}>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => handleCopyTicketCode(ticket.ticketCode, ticket.id)}
                                  sx={{
                                    minWidth: 'auto',
                                    p: 0.75,
                                    color: copiedTicketId === ticket.id ? 'success.main' : 'text.secondary',
                                    borderRadius: '6px',
                                    '&:hover': {
                                      bgcolor: 'divider',
                                    },
                                  }}
                                >
                                  {copiedTicketId === ticket.id ? (
                                    <CheckOutlinedIcon sx={{ fontSize: 16 }} />
                                  ) : (
                                    <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                                  )}
                                </Button>
                              </Tooltip>
                            </Box>

                            {/* Email Notification Status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                              {emailRetryPending ? (
                                <>
                                  <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                  <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                                    {t('tickets.emailGatewayRetryQueued')}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <MarkEmailReadOutlinedIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    {t('tickets.confirmationEmailSent')}
                                  </Typography>
                                </>
                              )}
                            </Box>

                            {/* Attendee Info & Price */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <Box sx={{ minWidth: 0, pr: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {ticket.participantName.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {ticket.participantEmail}
                                </Typography>
                              </Box>

                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 800,
                                  color: 'text.primary',
                                  fontFeatureSettings: '"tnum"',
                                  flexShrink: 0,
                                }}
                              >
                                {formatMoney(ticket.price, locale)}
                              </Typography>
                            </Box>

                            {/* Cancel Booking Button */}
                            {!isCancelled && (
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                disabled={cancellingId === ticket.id}
                                startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />}
                                onClick={() => handleCancelTicket(ticket.id)}
                                data-testid={`cancel-ticket-${ticket.id}`}
                                sx={{
                                  mt: 2,
                                  borderRadius: '8px',
                                  borderColor: 'divider',
                                  color: 'error.main',
                                  fontWeight: 600,
                                  fontSize: '0.78rem',
                                  '&:hover': {
                                    borderColor: 'error.main',
                                    bgcolor: 'error.light',
                                  },
                                }}
                              >
                                {cancellingId === ticket.id ? t('tickets.cancelling') : t('tickets.cancelBookingButton')}
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};
