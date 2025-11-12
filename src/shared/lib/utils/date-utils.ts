import type { DateRange } from 'react-day-picker';

/**
 * Helper function to format date for API - ensures consistent timezone handling
 */
export const formatDateForAPI = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    console.error('Invalid date passed to formatDateForAPI:', date);
    return new Date().toISOString().split('T')[0] as string;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Helper function to calculate date range based on time range selection and custom range
 */
export const getDateRange = (timeRange: string, customRange?: DateRange) => {
  if (customRange?.from && customRange.from instanceof Date && !isNaN(customRange.from.getTime())) {
    const startDate = customRange.from;
    const endDate = customRange.to && customRange.to instanceof Date && !isNaN(customRange.to.getTime()) ? customRange.to : customRange.from;

    return {
      start_date: formatDateForAPI(startDate),
      end_date: formatDateForAPI(endDate),
    };
  }

  const days = parseInt(timeRange);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
  };
};
