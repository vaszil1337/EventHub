import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';

interface CapacityBadgeProps {
  soldCount: number;
  capacity: number;
}

export const CapacityBadge: React.FC<CapacityBadgeProps> = ({ soldCount, capacity }) => {
  const percentage = Math.min(100, Math.round((soldCount / Math.max(1, capacity)) * 100));
  const isSoldOut = soldCount >= capacity;
  const isHighDemand = !isSoldOut && percentage >= 80;

  // Determine colors based on occupancy level
  let color: 'error' | 'warning' | 'success' | 'primary' = 'success';
  let chipLabel = 'Available';

  if (isSoldOut) {
    color = 'error';
    chipLabel = 'Sold Out';
  } else if (isHighDemand) {
    color = 'warning';
    chipLabel = `${capacity - soldCount} seats left`;
  }

  return (
    <Box sx={{ width: '100%' }} data-testid="capacity-badge-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
          data-testid="capacity-text"
        >
          <Box component="span" sx={{ fontWeight: 700, color: isSoldOut ? 'error.main' : 'text.primary' }}>
            {soldCount}
          </Box>
          {` / ${capacity} seats taken`}
        </Typography>
        <Chip
          label={chipLabel}
          size="small"
          color={color}
          variant={isSoldOut ? 'filled' : 'outlined'}
          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: '#e2e8f0',
        }}
      />
    </Box>
  );
};
