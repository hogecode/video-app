
// FilterChips.tsx
import React from 'react';
import { Chip, Box } from '@mui/material';

interface FilterChipsProps {
  years: number[];
  selectedYear: number | null;
  onYearSelect: (year: number | null) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ years, selectedYear, onYearSelect }) => {
  return (
    <Box marginBottom={0.5}>
      <Chip
        label="All"
        onClick={() => onYearSelect(null)}
        color={selectedYear === null ? 'primary' : 'default'}
        style={{ margin: '8px'}}
      />
      {years.map((year) => (
        <Chip
          label={year.toString()}
          clickable
          key={year}
          color={selectedYear === year ? 'primary' : 'default'}
          onClick={() => onYearSelect(year)}
          style={{ margin: '8px'}}
        />
      ))}
    </Box>
  );
};

export default FilterChips;
