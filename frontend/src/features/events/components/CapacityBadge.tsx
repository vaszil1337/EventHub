import React from 'react';
import { Box, Typography } from '@mui/material';

interface CapacityBadgeProps {
  soldCount: number;
  capacity: number;
}

export const CapacityBadge: React.FC<CapacityBadgeProps> = ({ soldCount, capacity }) => {
  const percentage = Math.min(100, Math.round((soldCount / Math.max(1, capacity)) * 100));
  const isSoldOut = soldCount >= capacity;
  const isHighDemand = !isSoldOut && percentage >= 80;

  const statusText = isSoldOut ? 'Sold Out' : isHighDemand ? `${capacity - soldCount} left` : 'Available';
  const dotColor = isSoldOut ? 'error.main' : isHighDemand ? 'warning.main' : 'success.main';
  const barColor = isSoldOut ? 'error.main' : isHighDemand ? 'warning.main' : 'primary.main';
  const pillBg = isSoldOut ? 'error.light' : isHighDemand ? 'warning.light' : 'action.hover';
  const pillColor = isSoldOut ? 'error.dark' : isHighDemand ? 'warning.dark' : 'text.secondary';
  const pillBorder = isSoldOut ? 'error.main' : isHighDemand ? 'warning.main' : 'divider';

  return (
    <Box sx={{ width: '100%' }} data-testid="capacity-badge-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
          data-testid="capacity-text"
        >
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              color: isSoldOut ? 'error.main' : 'text.primary',
            }}
          >
            {soldCount}
          </Box>
          {` / ${capacity} seats taken`}
        </Typography>

        {/* Minimal status pill with dot indicator */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1,
            py: 0.25,
            borderRadius: '9999px',
            bgcolor: pillBg,
            color: pillColor,
            fontSize: '0.72rem',
            fontWeight: 600,
            border: '1px solid',
            borderColor: pillBorder,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: dotColor,
            }}
          />
          {statusText}
        </Box>
      </Box>

      {/* Refined slim track bar */}
      <Box
        sx={{
          width: '100%',
          height: 4,
          borderRadius: 2,
          bgcolor: 'action.hover',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            bgcolor: barColor,
            borderRadius: 2,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </Box>
    </Box>
  );
};
