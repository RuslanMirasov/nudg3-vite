import type { DateRange } from 'react-day-picker';
import { format, isWithinInterval, addMonths, subMonths, getDaysInMonth, getDay, startOfMonth } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { Search, Tag, Calendar, ChevronDown, ChevronUp, Check, Bot } from 'lucide-react';
import { Input, Badge, getAIModelIcon, Button, SidebarTrigger, FaviconImage, Popover, PopoverContent, PopoverTrigger } from '@/shared/components';
import { getTagColor } from '@/shared/lib/utils/tag-helpers';

// Custom Scrollable Dropdown Component with Arrow Navigation
interface ScrollableDropdownProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

function ScrollableDropdown({ children, maxHeight = '40vh', className = '' }: ScrollableDropdownProps) {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
    }
  };

  useEffect(() => {
    checkScrollability();

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(scrollElement);

      return () => {
        resizeObserver.disconnect();
      };
    }

    return undefined;
  }, [children]);

  const handleScroll = () => {
    checkScrollability();
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Scroll Up Arrow - Always visible but disabled when can't scroll */}
      <div
        className={`sticky top-0 z-10 flex cursor-pointer items-center justify-center py-1 transition-opacity ${
          canScrollUp ? 'opacity-100 hover:bg-muted' : 'opacity-30 cursor-default'
        } ${isScrolling ? 'bg-muted/50' : ''}`}
        onClick={canScrollUp ? scrollUp : undefined}
      >
        <ChevronUp className="h-4 w-4" />
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="overflow-y-auto hide-scrollbar" style={{ maxHeight }} onScroll={handleScroll}>
        {children}
      </div>

      {/* Scroll Down Arrow - Always visible but disabled when can't scroll */}
      <div
        className={`sticky bottom-0 z-10 flex cursor-pointer items-center justify-center py-1 transition-opacity ${
          canScrollDown ? 'opacity-100 hover:bg-muted' : 'opacity-30 cursor-default'
        } ${isScrolling ? 'bg-muted/50' : ''}`}
        onClick={canScrollDown ? scrollDown : undefined}
      >
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}

// Add custom scrollbar styles
const scrollbarStyles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb #f3f4f6;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

interface FilterOption {
  value: string;
  label: string;
  domain?: string; // For brands
}

interface Filters {
  timeRange: FilterOption[];
  providers: FilterOption[];
  brands: FilterOption[];
  tags: FilterOption[];
  statuses?: FilterOption[]; // Add status options
  availableDateRange?: {
    from: Date;
    to: Date;
  } | null;
}

interface DashboardFiltersProps {
  filters: Filters;
  selectedTimeRange: string;
  selectedModels: string[];
  selectedBrand: string;
  selectedTags: string[];
  selectedStatus?: string; // Add selected status
  searchQuery?: string;
  customDateRange?: DateRange | undefined; // Add custom date range value prop
  onTimeRangeChange: (value: string) => void;
  onModelToggle: (modelValue: string) => void;
  onBrandChange: (value: string) => void;
  onTagToggle: (tagValue: string) => void;
  onStatusChange?: (value: string) => void; // Add status change handler
  onSearchChange?: (query: string) => void;
  onCustomDateRangeChange?: (range: DateRange | undefined) => void;
  showSearch?: boolean;
  showBrand?: boolean;
  showStatus?: boolean; // Add show status flag
  hideTags?: boolean;
}

// Function to get icon color for tags (for colored tag icons)
const getTagIconColor = (tag: string) => {
  // Specific color mappings for common tags
  const specificColors: { [key: string]: string } = {
    tech: 'text-blue-600',
    budget: 'text-green-600',
    premium: 'text-purple-600',
    gaming: 'text-red-600',
    business: 'text-indigo-600',
    student: 'text-cyan-600',
    creative: 'text-pink-600',
    portable: 'text-emerald-600',
    performance: 'text-orange-600',
    suggested: 'text-violet-600',
    'manually-deactivated': 'text-gray-600',
    desktop: 'text-pink-600',
    kujvbk: 'text-yellow-600',
  };

  // Check if we have a specific color for this tag
  if (specificColors[tag.toLowerCase()]) {
    return specificColors[tag.toLowerCase()];
  }

  const colors = [
    'text-blue-600',
    'text-green-600',
    'text-purple-600',
    'text-orange-600',
    'text-pink-600',
    'text-indigo-600',
    'text-cyan-600',
    'text-emerald-600',
    'text-violet-600',
    'text-amber-600',
  ];

  // Use a simple hash function to consistently assign colors to tags
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  return colors[hash % colors.length];
};

// Function to check if a provider is premium
const isPremiumProvider = (provider: string) => {
  const premiumProviders = ['deepseek', 'llama', 'grok', 'copilot'];
  return premiumProviders.includes(provider.toLowerCase());
};

export function DashboardFilters({
  filters,
  selectedTimeRange,
  selectedModels,
  selectedBrand,
  selectedTags,
  selectedStatus,
  searchQuery = '',
  customDateRange: customDateRangeProp,
  onTimeRangeChange,
  onModelToggle,
  onBrandChange,
  onTagToggle,
  onStatusChange,
  onSearchChange,
  onCustomDateRangeChange,
  showSearch = true,
  showBrand = true,
  showStatus = false,
  hideTags = false,
}: DashboardFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  // Sync prop value to local state when prop changes (for persistence across navigation)
  useEffect(() => {
    if (customDateRangeProp !== undefined) {
      setCustomDateRange(customDateRangeProp);
    }
  }, [customDateRangeProp]);

  // Initialize current month based on API date range
  const getInitialMonth = () => {
    if (filters.availableDateRange) {
      // Start from the latest available date month
      return new Date(filters.availableDateRange.to.getFullYear(), filters.availableDateRange.to.getMonth(), 1);
    }
    return new Date(); // Fallback to current month
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());

  // Update current month when API date range changes
  useEffect(() => {
    if (filters.availableDateRange) {
      setCurrentMonth(new Date(filters.availableDateRange.to.getFullYear(), filters.availableDateRange.to.getMonth(), 1));
    }
  }, [filters.availableDateRange]);

  const getProviderIcon = (providerValue: string) => {
    if (providerValue === 'all') return null;
    return getAIModelIcon(providerValue, { size: 20, className: 'shrink-0' });
  };

  // Calendar helper functions
  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);

    // Don't allow going before the earliest available date if API range is available
    if (filters.availableDateRange) {
      const earliestMonth = new Date(filters.availableDateRange.from.getFullYear(), filters.availableDateRange.from.getMonth(), 1);
      if (prevMonth >= earliestMonth) {
        setCurrentMonth(prevMonth);
      }
    } else {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);

    // Don't allow going after the latest available date if API range is available
    if (filters.availableDateRange) {
      const latestMonth = new Date(filters.availableDateRange.to.getFullYear(), filters.availableDateRange.to.getMonth(), 1);
      if (nextMonth <= latestMonth) {
        setCurrentMonth(nextMonth);
      }
    } else {
      setCurrentMonth(nextMonth);
    }
  };

  // Check if we can navigate to previous/next month
  const canGoPrevious = () => {
    if (!filters.availableDateRange) return true;
    const prevMonth = subMonths(currentMonth, 1);
    const earliestMonth = new Date(filters.availableDateRange.from.getFullYear(), filters.availableDateRange.from.getMonth(), 1);
    return prevMonth >= earliestMonth;
  };

  const canGoNext = () => {
    if (!filters.availableDateRange) return true;
    const nextMonth = addMonths(currentMonth, 1);
    const latestMonth = new Date(filters.availableDateRange.to.getFullYear(), filters.availableDateRange.to.getMonth(), 1);
    return nextMonth <= latestMonth;
  };

  const generateCalendarDays = () => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startDayOfWeek = getDay(firstDayOfMonth) === 0 ? 6 : getDay(firstDayOfMonth) - 1; // Adjust for Monday start

    const days = [];

    // Previous month's trailing days
    if (startDayOfWeek > 0) {
      const prevMonth = subMonths(currentMonth, 1);
      const daysInPrevMonth = getDaysInMonth(prevMonth);
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: daysInPrevMonth - i,
          isCurrentMonth: false,
          date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i),
        });
      }
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
      });
    }

    // Next month's leading days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    const nextMonth = addMonths(currentMonth, 1);
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
      });
    }

    return days;
  };

  // Check if a date is within the allowed range (API date range only)
  const isDateAllowed = (date: Date) => {
    if (!filters.availableDateRange) {
      return true; // Allow all dates if no API range is available
    }

    // Create date objects with same time (midnight) for proper comparison
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const rangeFrom = new Date(
      filters.availableDateRange.from.getFullYear(),
      filters.availableDateRange.from.getMonth(),
      filters.availableDateRange.from.getDate()
    );
    const rangeTo = new Date(
      filters.availableDateRange.to.getFullYear(),
      filters.availableDateRange.to.getMonth(),
      filters.availableDateRange.to.getDate()
    );

    return dateToCheck >= rangeFrom && dateToCheck <= rangeTo;
  };

  // Get the display text for the selected time range
  const getTimeRangeDisplay = () => {
    if (customDateRange?.from && customDateRange?.to) {
      const fromDate = customDateRange.from;
      const toDate = customDateRange.to;

      // Always show in format: "Aug 14 - Aug 18"
      return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d')}`;
    }

    const option = filters.timeRange.find(opt => opt.value === selectedTimeRange);
    return option?.label || 'Last 7 days';
  };

  const handlePresetSelect = (value: string) => {
    setCustomDateRange(undefined);
    onCustomDateRangeChange?.(undefined);
    onTimeRangeChange(value);
    setIsDatePickerOpen(false);
  };

  const getBrandIcon = (brandLabel: string, domain?: string) => {
    if (!domain) return null;
    return <FaviconImage name={brandLabel} domain={domain} size={16} className="w-4 h-4 mr-2" />;
  };

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-black">
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="px-2 md:px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Sidebar Toggle Button */}
            <SidebarTrigger />
            {/* Enhanced Time Range Filter */}
            <div className="flex flex-col space-y-1">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-40 max-w-[220px] w-auto h-8 justify-between text-left font-normal px-3 bg-muted/30 border-muted-foreground/20 text-black dark:text-white hover:bg-muted/50"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">{getTimeRangeDisplay()}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <div className="p-2">
                    {/* Preset Options */}
                    <div className="space-y-1 mb-2">
                      {filters.timeRange.map(option => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          className={`w-full justify-between text-sm h-7 ${
                            selectedTimeRange === option.value && !customDateRange ? 'bg-accent' : ''
                          }`}
                          onClick={() => handlePresetSelect(option.value)}
                        >
                          <span>{option.label}</span>
                          {selectedTimeRange === option.value && !customDateRange && <Check className="h-3 w-3" />}
                        </Button>
                      ))}
                    </div>

                    {/* Calendar - Enhanced */}
                    <div className="border-t pt-2">
                      <div className="p-2">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-2">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={goToPreviousMonth} disabled={!canGoPrevious()}>
                            <ChevronDown className="h-3 w-3 rotate-90" />
                          </Button>
                          <h2 className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={goToNextMonth} disabled={!canGoNext()}>
                            <ChevronDown className="h-3 w-3 -rotate-90" />
                          </Button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2">
                          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDays().map(dayInfo => {
                            const today = new Date(2025, 7, 22); // Current date (August 22, 2025)
                            const isToday = dayInfo.date.toDateString() === today.toDateString();
                            const isAllowed = isDateAllowed(dayInfo.date);

                            // Enhanced selection logic
                            const isStartDate = customDateRange?.from && dayInfo.date.toDateString() === customDateRange.from.toDateString();
                            const isEndDate = customDateRange?.to && dayInfo.date.toDateString() === customDateRange.to.toDateString();
                            const isSelected = isStartDate || isEndDate;
                            const isInRange =
                              customDateRange?.from &&
                              customDateRange?.to &&
                              isWithinInterval(dayInfo.date, { start: customDateRange.from, end: customDateRange.to });

                            // Show pending state when start date is selected but no end date
                            const isPending = customDateRange?.from && !customDateRange?.to && !isStartDate;

                            if (!dayInfo.isCurrentMonth) {
                              return (
                                <div
                                  key={`${dayInfo.date.getMonth()}-${dayInfo.day}`}
                                  className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground/30"
                                >
                                  {dayInfo.day}
                                </div>
                              );
                            }

                            return (
                              <button
                                key={`${dayInfo.date.getMonth()}-${dayInfo.day}`}
                                className={`h-8 w-8 flex items-center justify-center text-xs rounded transition-colors
                                                                ${isStartDate ? 'bg-primary text-primary-foreground font-semibold' : ''}
                                                                ${isEndDate ? 'bg-primary text-primary-foreground font-semibold' : ''}
                                                                ${isInRange && !isSelected ? 'bg-primary/20 text-primary' : ''}
                                                                ${isPending && isAllowed ? 'bg-primary/10 text-primary cursor-pointer' : ''}
                                                                ${isToday && isAllowed ? 'ring-2 ring-blue-500 font-medium' : ''}
                                                                ${!isAllowed ? 'opacity-30 cursor-not-allowed text-muted-foreground' : ''}
                                                                ${
                                                                  isAllowed && !isSelected && !isInRange && !isPending
                                                                    ? 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                                                    : ''
                                                                }
                                                            `}
                                disabled={!isAllowed}
                                onClick={() => {
                                  if (!isAllowed) return; // Prevent selection of disallowed dates

                                  if (!customDateRange?.from || customDateRange?.to) {
                                    // First click or starting new selection - set start date only
                                    const newRange = { from: new Date(dayInfo.date), to: undefined };
                                    setCustomDateRange(newRange);
                                    // DON'T call onCustomDateRangeChange here - keep previous results visible
                                    // Don't make API call yet, don't close popup, don't change time range
                                  } else {
                                    // Second click - determine end date or new start date
                                    let finalRange;
                                    if (dayInfo.date.getTime() === customDateRange.from.getTime()) {
                                      // Same date clicked twice - create single day range
                                      finalRange = { from: new Date(dayInfo.date), to: new Date(dayInfo.date) };
                                    } else if (dayInfo.date < customDateRange.from) {
                                      // Earlier date clicked - make it the new start date, keep existing start as undefined end
                                      finalRange = { from: new Date(dayInfo.date), to: undefined };
                                    } else {
                                      // Later date clicked - complete the range
                                      finalRange = {
                                        from: new Date(customDateRange.from),
                                        to: new Date(dayInfo.date),
                                      };
                                    }
                                    setCustomDateRange(finalRange);

                                    // Only make API call and close popup if we have a complete range
                                    if (finalRange.to) {
                                      onTimeRangeChange('custom');
                                      onCustomDateRangeChange?.(finalRange);
                                      setIsDatePickerOpen(false);
                                    } else {
                                      // Just update the local range, don't trigger parent callbacks
                                      // This keeps previous results visible while selecting new start date
                                    }
                                  }
                                }}
                              >
                                {dayInfo.day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Provider Filter */}
            <div className="flex flex-col space-y-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between text-left font-normal px-3 min-w-[130px] max-w-[220px] w-auto bg-muted/30 border-muted-foreground/20 text-black dark:text-white hover:bg-muted/50"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      {selectedModels.length === 1 ? (
                        <div className="flex items-center gap-2">
                          {getProviderIcon(selectedModels[0] ?? '') && (
                            <div className="w-5 h-5 flex items-center justify-center">{getProviderIcon(selectedModels[0] ?? '')}</div>
                          )}
                          <span className="text-sm truncate">{filters.providers?.find(m => m.value === selectedModels[0])?.label}</span>
                        </div>
                      ) : selectedModels.length > 1 ? (
                        <div className="flex items-center min-w-0 gap-2">
                          {/* Show up to 3 model icons */}
                          <div className="flex items-center">
                            {Array.from({ length: Math.min(selectedModels.length, 3) }, (_, index) => {
                              const modelValue = selectedModels[index] ?? '';
                              const icon = getAIModelIcon(modelValue, { size: 16 });
                              return icon ? (
                                <div key={index} className="flex items-center w-4 h-4" style={{ marginLeft: index > 0 ? '-4px' : '0' }}>
                                  {icon}
                                </div>
                              ) : null;
                            })}
                          </div>
                          <span className="text-xs text-muted-foreground dark:text-gray-400 truncate shrink-0">
                            {selectedModels.length > 3 ? `+${selectedModels.length - 3} more` : `${selectedModels.length} selected`}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2 text-muted-foreground dark:text-gray-400 shrink-0" />
                          <span className="text-sm">All Models</span>
                        </>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0" align="start">
                  <ScrollableDropdown>
                    <div className="space-y-1 p-2">
                      {/* "All Models" option with checkmark on left */}
                      <div
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                        onClick={() => {
                          // Clear all selected models
                          selectedModels.forEach(model => onModelToggle(model));
                        }}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <Bot className="w-4 h-4 mr-2 text-muted-foreground dark:text-gray-400 shrink-0" />
                          <span className="text-sm truncate">All Models</span>
                        </div>
                        <div className="w-4 h-4 shrink-0">{selectedModels.length === 0 && <Check className="h-4 w-4 text-primary" />}</div>
                      </div>

                      {/* Individual model options with icons */}
                      {filters.providers
                        ?.filter(m => m.value !== 'all')
                        .map(option => {
                          const isPremium = isPremiumProvider(option.value);
                          return (
                            <div
                              key={option.value}
                              className={`flex items-center justify-between p-2 rounded-md ${
                                isPremium ? 'cursor-default' : 'hover:bg-muted cursor-pointer'
                              } group`}
                              onClick={() => {
                                if (!isPremium) {
                                  onModelToggle(option.value);
                                }
                              }}
                            >
                              <div className="flex items-center min-w-0 flex-1 gap-2">
                                {getProviderIcon(option.value) && (
                                  <div className="w-5 h-5 flex items-center justify-center">{getProviderIcon(option.value)}</div>
                                )}
                                <span className="text-sm truncate">{option.label}</span>
                              </div>
                              {isPremium && (
                                <Badge variant="secondary" className=" text-xs bg-purple-100 text-purple-800 border-purple-200 shrink-0">
                                  Premium
                                </Badge>
                              )}
                              <div className="w-4 h-4 ml-2 shrink-0">
                                {!isPremium && selectedModels.includes(option.value) && <Check className="h-4 w-4 text-primary" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollableDropdown>
                </PopoverContent>
              </Popover>
            </div>

            {/* Brand Filter */}
            {showBrand && (
              <div className="flex flex-col space-y-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 justify-between text-left font-normal px-3 w-[180px] bg-muted/30 border-muted-foreground/20 text-black dark:text-white hover:bg-muted/50"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        {getBrandIcon(
                          filters.brands.find(b => b.value === selectedBrand)?.label || selectedBrand,
                          filters.brands.find(b => b.value === selectedBrand)?.domain
                        )}
                        <span className="text-sm truncate">{filters.brands.find(b => b.value === selectedBrand)?.label || 'Select brand'}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[180px] p-0" align="start">
                    <ScrollableDropdown>
                      <div className="space-y-1 p-2">
                        {filters.brands.map(option => (
                          <div
                            key={option.value}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                            onClick={() => onBrandChange(option.value)}
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              {getBrandIcon(option.label, option.domain)}
                              <span className="text-sm truncate">{option.label}</span>
                            </div>
                            <div className="w-4 h-4 shrink-0">{selectedBrand === option.value && <Check className="h-4 w-4 text-primary" />}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollableDropdown>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Status Filter */}
            {showStatus && filters.statuses && (
              <div className="flex flex-col space-y-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 justify-between text-left font-normal px-3 min-w-[120px] max-w-[180px] w-auto">
                      <div className="flex items-center min-w-0 flex-1">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 shrink-0 ${
                            selectedStatus === 'active' ? 'bg-green-500' : selectedStatus === 'inactive' ? 'bg-gray-400' : 'bg-blue-500'
                          }`}
                        />
                        <span className="text-sm truncate">{filters.statuses.find(s => s.value === selectedStatus)?.label || 'All Status'}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[150px] p-0" align="start">
                    <ScrollableDropdown>
                      <div className="space-y-1 p-2">
                        {filters.statuses.map(option => (
                          <div
                            key={option.value}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                            onClick={() => onStatusChange?.(option.value)}
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 shrink-0 ${
                                  option.value === 'active' ? 'bg-green-500' : option.value === 'inactive' ? 'bg-gray-400' : 'bg-blue-500'
                                }`}
                              />
                              <span className="text-sm truncate">{option.label}</span>
                            </div>
                            <div className="w-4 h-4 shrink-0">{selectedStatus === option.value && <Check className="h-4 w-4 text-primary" />}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollableDropdown>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Tags Filter - Only show if hideTags is false */}
            {!hideTags && (
              <div className="flex flex-col space-y-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 justify-between text-left font-normal px-3 min-w-[130px] max-w-[220px] w-auto bg-muted/30 border-muted-foreground/20 text-black dark:text-white hover:bg-muted/50"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        {selectedTags.length === 1 ? (
                          <Badge variant="secondary" className={`text-xs border-0 ${getTagColor(selectedTags[0] ?? '')} truncate`}>
                            {filters.tags.find(t => t.value === selectedTags[0])?.label}
                          </Badge>
                        ) : selectedTags.length > 1 ? (
                          <div className="flex items-center min-w-0">
                            {/* Show up to 4 colored tag icons */}
                            <div className="flex items-center">
                              {Array.from({ length: Math.min(selectedTags.length, 4) }, (_, index) => {
                                const tagValue = selectedTags[index] ?? '';
                                return (
                                  <Tag
                                    key={index}
                                    className={`w-3 h-3 ${getTagIconColor(tagValue)}`}
                                    style={{ marginLeft: index > 0 ? '-2px' : '0' }}
                                  />
                                );
                              })}
                            </div>
                            <span className="text-xs text-muted-foreground dark:text-gray-400 truncate ml-2 shrink-0">
                              {selectedTags.length > 4 ? `+${selectedTags.length - 4} more` : `${selectedTags.length} selected`}
                            </span>
                          </div>
                        ) : (
                          <>
                            <Tag className="w-4 h-4 mr-2 text-muted-foreground dark:text-gray-400 shrink-0" />
                            <span className="text-sm">All Tags</span>
                          </>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-0" align="start">
                    <ScrollableDropdown>
                      <div className="space-y-1 p-2">
                        {/* "All Tags" option with checkmark on left */}
                        <div
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                          onClick={e => {
                            e.stopPropagation();
                            // Clear all selected tags
                            selectedTags.forEach(tag => onTagToggle(tag));
                          }}
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <Tag className="w-3 h-3 mr-2 text-muted-foreground dark:text-gray-400 shrink-0" />
                            <span className="text-sm truncate">All Tags</span>
                          </div>
                          <div className="w-4 h-4 shrink-0">{selectedTags.length === 0 && <Check className="h-4 w-4 text-primary" />}</div>
                        </div>

                        {/* Individual tag options as colored badges - show more tags now with dynamic width */}
                        {filters.tags.map(option => (
                          <div
                            key={option.value}
                            className="flex items-start justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                            onClick={e => {
                              e.stopPropagation();
                              onTagToggle(option.value);
                            }}
                          >
                            <Badge
                              variant="secondary"
                              className={`text-sm border-0 whitespace-normal wrap-break-words flex-1 ${getTagColor(option.value)}`}
                            >
                              {option.label}
                            </Badge>
                            <div className="w-4 h-4 ml-2 shrink-0">
                              {selectedTags.includes(option.value) && <Check className="h-4 w-4 text-primary" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollableDropdown>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Search Input - Only show if showSearch is true */}
            {showSearch && (
              <div className="flex flex-col space-y-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={e => onSearchChange?.(e.target.value)}
                    className="pl-8 w-[180px] h-8 bg-muted/60 border-muted-foreground/20 text-black dark:text-white placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
