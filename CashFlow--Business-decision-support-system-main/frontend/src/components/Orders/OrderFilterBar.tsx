import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Box, 
  Tabs, 
  Tab, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  InputAdornment,
  IconButton,
  SelectChangeEvent,
  Tooltip,
  Button,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';

interface OrderFilterBarProps {
  statusFilter: string;
  searchQuery: string;
  dateFilter: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onDateFilterChange: (date: string) => void;
}

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  statusFilter,
  searchQuery,
  dateFilter,
  onStatusChange,
  onSearchChange,
  onDateFilterChange
}) => {
  const { t } = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    onStatusChange(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  const handleDateFilterChange = (event: SelectChangeEvent) => {
    onDateFilterChange(event.target.value);
  };

  return (
    <Box sx={{ 
      mb: 3,
      backgroundColor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1
    }}>
      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={statusFilter} 
          onChange={handleTabChange}
          aria-label="order status tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minWidth: 100,
              px: 3,
            }
          }}
        >
          <Tab 
            label={t.orders.status.all} 
            value="" 
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            label={t.orders.status.pending} 
            value="pending"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            label={t.orders.status.completed} 
            value="completed"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            label={t.orders.status.cancelled} 
            value="cancelled"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Box>
      
      {/* Search and Filter Bar */}
      <Box 
        display="flex" 
        gap={2} 
        p={2}
        alignItems="center"
        flexWrap="wrap"
      >
        <TextField
          placeholder={t.orders.filters.search}
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ 
            flexGrow: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.default'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <Tooltip title={t.common.clear}>
                  <IconButton
                    aria-label="clear search"
                    onClick={clearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : null
          }}
        />
        
        <FormControl 
          variant="outlined" 
          size="small" 
          sx={{ 
            minWidth: 180,
            backgroundColor: 'background.default'
          }}
        >
          <InputLabel id="date-filter-label">
            {t.orders.filters.dateRange}
          </InputLabel>
          <Select
            labelId="date-filter-label"
            value={dateFilter}
            onChange={handleDateFilterChange}
            label={t.orders.filters.dateRange}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon color="action" sx={{ ml: 1 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="">{t.orders.filters.allTime}</MenuItem>
            <MenuItem value="today">{t.orders.filters.today}</MenuItem>
            <MenuItem value="yesterday">{t.orders.filters.yesterday}</MenuItem>
            <MenuItem value="thisWeek">{t.orders.filters.thisWeek}</MenuItem>
            <MenuItem value="lastWeek">{t.orders.filters.lastWeek}</MenuItem>
            <MenuItem value="thisMonth">{t.orders.filters.thisMonth}</MenuItem>
            <MenuItem value="lastMonth">{t.orders.filters.lastMonth}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Active Filters Display */}
      {(statusFilter || dateFilter || searchQuery) && (
        <Box 
          sx={{ 
            px: 2, 
            pb: 2,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap'
          }}
        >
          {searchQuery && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={clearSearch}
              endIcon={<ClearIcon fontSize="small" />}
              sx={{ 
                textTransform: 'none',
                borderRadius: '16px',
                px: 1.5,
                py: 0.5
              }}
            >
              <Typography variant="body2">
                {t.common.search}: {searchQuery}
              </Typography>
            </Button>
          )}
          
          {statusFilter && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onStatusChange('')}
              endIcon={<ClearIcon fontSize="small" />}
              sx={{ 
                textTransform: 'none',
                borderRadius: '16px',
                px: 1.5,
                py: 0.5
              }}
            >
              <Typography variant="body2">
                {t.orders.fields.status}: {t.orders.status[statusFilter as keyof typeof t.orders.status]}
              </Typography>
            </Button>
          )}
          
          {dateFilter && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onDateFilterChange('')}
              endIcon={<ClearIcon fontSize="small" />}
              sx={{ 
                textTransform: 'none',
                borderRadius: '16px',
                px: 1.5,
                py: 0.5
              }}
            >
              <Typography variant="body2">
                {t.orders.filters.dateRange}: {t.orders.filters[dateFilter as keyof typeof t.orders.filters]}
              </Typography>
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OrderFilterBar;