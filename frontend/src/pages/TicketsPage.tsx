import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
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
    navigator.clipboard.writeText(ticketCode).then(() => {
      setCopiedTicketId(ticketId);
      setTimeout(() => setCopiedTicketId(null), 2000);
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          My Tickets
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          View and manage all your purchased event tickets. Click the ticket code to copy it to your clipboard.
        </Typography>

        {tickets.length === 0 ? (
          <Alert severity="info">
            No tickets yet. Browse events and book your first ticket!
          </Alert>
        ) : (
          <Chip
            icon={<ConfirmationNumberIcon />}
            label={`${tickets.length} Ticket${tickets.length !== 1 ? 's' : ''} Issued`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {/* Tickets Grid */}
      {tickets.length > 0 && (
        <Grid container spacing={3}>
          {tickets.map((ticket) => {
            const event = eventMap[ticket.eventId];
            const purchaseDate = new Date(ticket.purchaseDate);
            const formattedPurchaseDate = purchaseDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
                    {/* Event Title */}
                    {event ? (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                        <EventIcon
                          sx={{
                            color: 'primary.main',
                            fontSize: '1.25rem',
                            mt: 0.3,
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {formatEventDate(event.date)}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Event Not Found
                      </Typography>
                    )}

                    {/* Ticket Code */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        mb: 2,
                        borderRadius: 1.5,
                        bgcolor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <ConfirmationNumberIcon
                          sx={{ color: 'primary.main', fontSize: '1rem', flexShrink: 0 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          data-testid="ticket-code-display"
                        >
                          {ticket.ticketCode}
                        </Typography>
                      </Box>
                      <Tooltip title={copiedTicketId === ticket.id ? 'Copied!' : 'Copy ticket code'}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleCopyTicketCode(ticket.ticketCode, ticket.id)}
                          sx={{
                            minWidth: 'auto',
                            p: 0.5,
                            flexShrink: 0,
                            color: copiedTicketId === ticket.id ? 'success.main' : 'text.secondary',
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                        </Button>
                      </Tooltip>
                    </Paper>

                    {/* Participant Info */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          PARTICIPANT
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', ml: 3.5 }}>
                        {ticket.participantName}
                      </Typography>
                    </Box>

                    {/* Email Info */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          EMAIL
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: 'primary.main',
                          ml: 3.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ticket.participantEmail}
                      </Typography>
                    </Box>

                    {/* Price Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        TICKET PRICE
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: 'primary.dark',
                          mt: 0.5,
                        }}
                      >
                        {formatMoney(ticket.price)}
                      </Typography>
                    </Box>

                    {/* Purchase Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: '0.875rem' }} />
                      <Typography variant="caption" color="text.secondary">
                        Purchased on {formattedPurchaseDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};
