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
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { Ticket } from '@/features/ticket-booking/types';
import { ticketService } from '@/features/ticket-booking/services/ticketService';
import { eventService } from '@/features/events/services/eventService';
import { Event } from '@/features/events/types';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [eventMap, setEventMap] = useState<Record<string, Event>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const fetchedTickets = await ticketService.getTickets();
        setTickets(fetchedTickets);

        // Load all events to map event titles
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
        setError(err instanceof Error ? err.message : 'Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  const handleCopyTicketCode = (ticketCode: string, ticketId: string) => {
    navigator.clipboard?.writeText(ticketCode).then(() => {
      setCopiedTicketId(ticketId);
      setTimeout(() => setCopiedTicketId(null), 2000);
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ color: 'primary.main' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'error.main',
            bgcolor: 'error.light',
            color: 'error.dark',
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

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
          <Box sx={{ maxWidth: 640 }}>
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
              <ConfirmationNumberOutlinedIcon sx={{ fontSize: 14 }} />
              {tickets.length} {tickets.length === 1 ? 'Pass Issued' : 'Passes Issued'}
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
              My Tickets & Passes
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              View and manage all your reserved tickets. Present your unique pass code at the venue check-in desk.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Container */}
      <Container maxWidth="lg">
        {tickets.length === 0 ? (
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
              No tickets reserved yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Explore the upcoming events and reserve your seat to get your digital access code.
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
              Browse Events
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {tickets.map((ticket) => {
              const event = eventMap[ticket.eventId];
              const purchaseDate = new Date(ticket.purchaseDate);
              const formattedPurchaseDate = purchaseDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

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
                      borderColor: 'divider',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        borderColor: 'text.secondary',
                        boxShadow: (theme) => `0 8px 24px -4px ${theme.palette.action.hover}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Top Bar: Event Category or Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1,
                            py: 0.25,
                            borderRadius: '9999px',
                            bgcolor: 'success.light',
                            border: '1px solid',
                            borderColor: 'success.main',
                            color: 'success.dark',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                          }}
                        >
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'success.main' }} />
                          CONFIRMED PASS
                        </Box>

                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {formattedPurchaseDate}
                        </Typography>
                      </Box>

                      {/* Event Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: 'text.primary',
                          lineHeight: 1.35,
                          mb: 1.5,
                        }}
                      >
                        {event ? event.title : 'Event Reservation'}
                      </Typography>

                      {/* Event Meta */}
                      {event && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                              {formatEventDate(event.date)}
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
                            mb: 2,
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
                              PASS CODE
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'text.primary',
                                letterSpacing: '0.03em',
                              }}
                              data-testid="ticket-code-display"
                            >
                              {ticket.ticketCode}
                            </Typography>
                          </Box>

                          <Tooltip title={copiedTicketId === ticket.id ? 'Copied to clipboard' : 'Copy code'}>
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
                              {ticket.participantName}
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
                            {formatMoney(ticket.price)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
