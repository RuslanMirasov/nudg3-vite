import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';

interface DashboardFiltersState {
  selectedTimeRange: string;
  selectedModels: string[];
  selectedBrand: string;
  selectedTags: string[];
  customDateRange?: DateRange | undefined;
}

const getStorageKey = (workspaceId?: string) => {
  return workspaceId ? `dashboard-filters-${workspaceId}` : 'dashboard-filters';
};

const getStoredFilters = (workspaceId?: string): Partial<DashboardFiltersState> | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(getStorageKey(workspaceId));
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<DashboardFiltersState>;

    // Parse dates from YYYY-MM-DD strings to avoid timezone issues
    if (parsed.customDateRange) {
      const parseDate = (dateStr: string): Date | undefined => {
        if (!dateStr) return undefined;
        const parts = dateStr.split('-').map(Number);
        const [year, month, day] = parts;

        if (parts.length < 3 || year == null || month == null || day == null || Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
          return undefined;
        }

        return new Date(year, month - 1, day); // Local timezone, month is 0-indexed
      };

      parsed.customDateRange = {
        from: parsed.customDateRange.from ? parseDate(parsed.customDateRange.from as unknown as string) : undefined,
        to: parsed.customDateRange.to ? parseDate(parsed.customDateRange.to as unknown as string) : undefined,
      };
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse stored dashboard filters:', error);
    return null;
  }
};

const storeFilters = (filters: DashboardFiltersState, workspaceId?: string) => {
  if (typeof window === 'undefined') return;

  try {
    // Convert dates to YYYY-MM-DD strings to avoid timezone issues
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const serializedFilters = {
      ...filters,
      customDateRange: filters.customDateRange
        ? {
            from: filters.customDateRange.from ? formatDate(filters.customDateRange.from) : undefined,
            to: filters.customDateRange.to ? formatDate(filters.customDateRange.to) : undefined,
          }
        : undefined,
    };

    sessionStorage.setItem(getStorageKey(workspaceId), JSON.stringify(serializedFilters));
  } catch (error) {
    console.error('Failed to store dashboard filters:', error);
  }
};

export function useDashboardFilters(workspaceId?: string) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastWorkspaceId, setLastWorkspaceId] = useState<string | undefined>(workspaceId);
  const [skipBrandRestore, setSkipBrandRestore] = useState(false);

  // Reset filters when workspace changes
  useEffect(() => {
    if (workspaceId && lastWorkspaceId && workspaceId !== lastWorkspaceId) {
      // Workspace changed, reset filters to defaults
      setSelectedTimeRange('7');
      setSelectedModels([]);
      setSelectedBrand('');
      setSelectedTags([]);
      setCustomDateRange(undefined);
      setLastWorkspaceId(workspaceId);
      // Skip brand restoration from storage - let page auto-select primary brand
      setSkipBrandRestore(true);
      // Re-initialize to load filters for new workspace
      setIsInitialized(false);
    } else if (workspaceId && !lastWorkspaceId) {
      // First time workspace is set
      setLastWorkspaceId(workspaceId);
    }
  }, [workspaceId, lastWorkspaceId]);

  useEffect(() => {
    if (!isInitialized) {
      const storedFilters = getStoredFilters(workspaceId);

      if (storedFilters) {
        if (storedFilters.selectedModels !== undefined) {
          setSelectedModels(storedFilters.selectedModels);
        }
        // Skip brand restoration if workspace just changed (let page auto-select primary brand)
        if (storedFilters.selectedBrand !== undefined && !skipBrandRestore) {
          setSelectedBrand(storedFilters.selectedBrand);
        }
        if (storedFilters.selectedTags !== undefined) {
          setSelectedTags(storedFilters.selectedTags);
        }
        if (storedFilters.customDateRange !== undefined) {
          setCustomDateRange(storedFilters.customDateRange);
          // If custom date range exists with both from and to dates, set time range to "custom"
          if (storedFilters.customDateRange.from && storedFilters.customDateRange.to) {
            setSelectedTimeRange('custom');
          } else if (storedFilters.selectedTimeRange !== undefined) {
            setSelectedTimeRange(storedFilters.selectedTimeRange);
          }
        } else if (storedFilters.selectedTimeRange !== undefined) {
          setSelectedTimeRange(storedFilters.selectedTimeRange);
        }
      }

      setIsInitialized(true);
      // Reset the skip flag after initialization
      if (skipBrandRestore) {
        setSkipBrandRestore(false);
      }
    }
  }, [isInitialized, workspaceId, skipBrandRestore]);

  useEffect(() => {
    if (!isInitialized) return;

    storeFilters(
      {
        selectedTimeRange,
        selectedModels,
        selectedBrand,
        selectedTags,
        customDateRange,
      },
      workspaceId
    );
  }, [selectedTimeRange, selectedModels, selectedBrand, selectedTags, customDateRange, isInitialized, workspaceId]);

  return {
    selectedTimeRange,
    setSelectedTimeRange,
    selectedModels,
    setSelectedModels,
    selectedBrand,
    setSelectedBrand,
    selectedTags,
    setSelectedTags,
    customDateRange,
    setCustomDateRange,
    isInitialized,
  };
}
