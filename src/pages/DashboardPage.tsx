import { useState, useEffect, useMemo } from 'react';
import { TooltipProvider, DashboardFilters, FullPageLoading } from '@/shared/components';
import { getDateRange } from '@/shared/lib/utils/date-utils';
import { useWorkspace } from '@/features/workspace/hooks/useWorkspace';
import { useRouter } from '@tanstack/react-router';

//dashboard feature
import { mapProvidersToOptions } from '@/shared/lib/utils/provider-utils';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboadFilters';
import { useFilterOptions } from '@/features/dashboard/hooks/useFilterOptions';
import { analyticsApi } from '@/features/dashboard/api/analytics-api';
import { RecentPromptsResponseList } from '@/features/dashboard/components/RecentPromptsResponseList';
import { TopSources } from '@/features/dashboard/components/TopSources';
import { BrandsChartWithTable } from '@/features/dashboard/components/BrandsChartWithTable';
import type { APIRecentChat } from '@/features/dashboard/components/RecentPromptsResponseList';

export function DashboardPage() {
  const router = useRouter();
  const { selectedWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const [hasCheckedPrimaryBrand, setHasCheckedPrimaryBrand] = useState(false);
  const [additionalBrands, setAdditionalBrands] = useState<
    Record<
      string,
      {
        visibility_score: Record<string, number>;
        sentiment: number;
        position: number;
        domain: string;
      }
    >
  >({});

  const {
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
  } = useDashboardFilters(selectedWorkspace?.id);

  const dateRange = useMemo(() => getDateRange(selectedTimeRange, customDateRange), [selectedTimeRange, customDateRange]);
  const { data: filterOptionsData } = useFilterOptions(selectedWorkspace?.id || null);

  // Fetch dashboard data with filters
  const {
    data: dashboardData,
    isLoading,
    isRefreshing,
    //error,
  } = useDashboard({
    ...dateRange,
    models: selectedModels.length > 0 ? selectedModels : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  // filtersData
  const filtersData = useMemo(() => {
    const timeRangeOptions = [
      { value: '7', label: 'Last 7 days' },
      { value: '14', label: 'Last 14 days' },
      { value: '30', label: 'Last 30 days' },
    ];

    const providerOptions = [
      { value: 'all', label: 'All Models' },
      ...mapProvidersToOptions(filterOptionsData?.providers || []),
      ...mapProvidersToOptions(['deepseek', 'llama', 'grok', 'copilot']),
    ];

    const brandOptions = (filterOptionsData?.brands || []).map(brand => ({
      value: brand.name.toLowerCase().replace(/\s+/g, '-'),
      label: brand.name,
      domain: brand.domain,
    }));

    const tagOptions = (filterOptionsData?.tags || []).map((tag: string) => ({
      value: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
    }));

    const availableDateRange = filterOptionsData?.date_range
      ? (() => {
          const [fromYear, fromMonth, fromDay] = filterOptionsData.date_range.earliest_date.split('-').map(Number);
          const [toYear, toMonth, toDay] = filterOptionsData.date_range.latest_date.split('-').map(Number);
          return {
            from: new Date(fromYear ?? 1970, (fromMonth ?? 1) - 1, fromDay ?? 1),
            to: new Date(toYear ?? 1970, (toMonth ?? 1) - 1, toDay ?? 1),
          };
        })()
      : null;

    return {
      timeRange: timeRangeOptions,
      providers: providerOptions,
      brands: brandOptions,
      tags: tagOptions,
      availableDateRange,
    };
  }, [filterOptionsData]);

  // Analytics filters for TopSources component
  const analyticsFilters = useMemo(() => {
    if (!selectedWorkspace?.id) return undefined;

    return {
      workspace_id: selectedWorkspace.id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      models: selectedModels.length > 0 ? selectedModels : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    };
  }, [selectedWorkspace?.id, dateRange, selectedModels, selectedTags]);

  // Create combined dashboard data with additional brands
  const enhancedDashboardData = useMemo(() => {
    if (!dashboardData) return null;

    return {
      ...dashboardData,
      data: {
        ...dashboardData.data,
        brands: {
          ...dashboardData.data.brands,
          ...additionalBrands,
        },
      },
    };
  }, [dashboardData, additionalBrands]);

  // ============================================================================
  // AUTOSELECT PRIMARY BRAND
  // ============================================================================

  // useEffect(() => {
  //   if (!filterOptionsData?.brands || filterOptionsData.brands.length === 0) return;
  //   if (selectedBrand) return;

  //   const primaryBrand = filterOptionsData.brands.find(b => b.is_primary_brand);

  //   if (primaryBrand) {
  //     const primaryValue = primaryBrand.name.toLowerCase().replace(/\s+/g, '-');
  //     setSelectedBrand(primaryValue);
  //   } else {
  //     const firstBrand = filterOptionsData.brands[0];
  //     if (firstBrand) {
  //       setSelectedBrand(firstBrand.name.toLowerCase().replace(/\s+/g, '-'));
  //     }
  //   }
  // }, [filterOptionsData?.brands, selectedBrand, setSelectedBrand, selectedWorkspace?.id]);

  // useEffect(() => {
  //   // Only run this check once when dashboard data is loaded and we have filter options
  //   if (!dashboardData?.data.brands || !filterOptionsData?.brands || hasCheckedPrimaryBrand) {
  //     return;
  //   }

  //   const primaryBrand = filterOptionsData.brands.find(brand => brand.is_primary_brand);
  //   if (!primaryBrand) {
  //     setHasCheckedPrimaryBrand(true);
  //     return;
  //   }

  //   const primaryBrandValue = primaryBrand.name.toLowerCase().replace(/\s+/g, '-');
  //   const currentBrands = Object.keys(dashboardData.data.brands);
  //   const isPrimaryBrandInTop5 = currentBrands.some(brandName => brandName.toLowerCase().replace(/\s+/g, '-') === primaryBrandValue);

  //   // If primary brand is not in top 5, fetch its data
  //   if (!isPrimaryBrandInTop5) {
  //     console.log(`Primary brand ${primaryBrand.name} not in top 5, fetching its data...`);

  //     const fetchPrimaryBrandData = async () => {
  //       try {
  //         const brandAnalytics = await analyticsApi.getSpecificBrandAnalytics({
  //           workspace_id: selectedWorkspace!.id,
  //           brand_id: primaryBrand.id,
  //           ...dateRange,
  //           models: selectedModels.length > 0 ? selectedModels : undefined,
  //           tags: selectedTags.length > 0 ? selectedTags : undefined,
  //         });

  //         // Add primary brand data as 6th entry
  //         setAdditionalBrands(brandAnalytics.data.brands);
  //         console.log(`Successfully loaded primary brand data:`, brandAnalytics.data.brands);
  //       } catch (err) {
  //         console.error('Failed to load primary brand analytics:', err);
  //       }
  //     };

  //     fetchPrimaryBrandData();
  //   }

  //   setHasCheckedPrimaryBrand(true);
  // }, [dashboardData?.data.brands, filterOptionsData?.brands, hasCheckedPrimaryBrand, selectedWorkspace, dateRange, selectedModels, selectedTags]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Smart brand selection handler
  const handleBrandChange = async (value: string) => {
    setSelectedBrand(value);

    // Always clear previous additional brands when selecting a new brand
    setAdditionalBrands({});

    // If "all" is selected or no specific brand, don't load additional data
    if (value === 'all' || !value) {
      return;
    }

    // Check if this brand's data is already in the main dashboard (top 5)
    const currentBrands = dashboardData?.data.brands ? Object.keys(dashboardData.data.brands) : [];
    const isAlreadyDisplayed = currentBrands.some(brandName => brandName.toLowerCase().replace(/\s+/g, '-') === value);

    // If brand is already displayed in the main dashboard, do nothing
    if (isAlreadyDisplayed) {
      console.log(`Brand ${value} is already displayed in the chart (top 5)`);
      return;
    }

    // If brand is not in top 5, fetch its data as additional brand
    const brandInfo = filterOptionsData?.brands?.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === value);

    if (!brandInfo) {
      console.error(`Brand ${value} not found in filter options`);
      return;
    }

    try {
      console.log(`Fetching additional data for brand: ${brandInfo.name} (${brandInfo.id})`);

      // Fetch specific brand analytics
      const brandAnalytics = await analyticsApi.getSpecificBrandAnalytics({
        workspace_id: selectedWorkspace!.id,
        brand_id: brandInfo.id,
        ...dateRange,
        models: selectedModels.length > 0 ? selectedModels : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      // Set the new brand data (this replaces any previous additional brands)
      setAdditionalBrands(brandAnalytics.data.brands);

      console.log(`Successfully loaded additional brand data:`, brandAnalytics.data.brands);
    } catch (err) {
      console.error('Failed to load brand analytics:', err);
    }
  };

  // Handle tag filter toggle
  const handleTagToggle = (tagValue: string) => {
    setSelectedTags(prev => (prev.includes(tagValue) ? prev.filter(t => t !== tagValue) : [...prev, tagValue]));
  };

  // Handle model filter toggle (max 3 models)
  const handleModelToggle = (modelValue: string) => {
    // Check if it's a premium model
    const premiumModels = ['deepseek', 'llama', 'grok', 'copilot'];
    if (premiumModels.includes(modelValue.toLowerCase())) {
      return; // Do nothing for premium models
    }

    setSelectedModels(prev => {
      if (modelValue === 'all') {
        return [];
      }

      if (prev.includes(modelValue)) {
        const newModels = prev.filter(m => m !== modelValue);
        return newModels;
      } else {
        const filteredPrev = prev.filter(m => m !== 'all');
        if (filteredPrev.length < 3) {
          const newModels = [...filteredPrev, modelValue];
          return newModels;
        }
        return filteredPrev;
      }
    });
  };

  const handleViewResponse = (providerResponseId: string, chat?: APIRecentChat) => {
    const promptTemplateId = chat?.prompt_template_id || 'placeholder';
    router.navigate({ to: `/prompts/${promptTemplateId}/analysis?responseId=${providerResponseId}` });
  };

  if (isWorkspaceLoading) {
    return (
      <TooltipProvider>
        <FullPageLoading message="Loading workspace..." />
      </TooltipProvider>
    );
  }

  if (!selectedWorkspace) {
    return (
      <TooltipProvider>
        <FullPageLoading message="No workspace selected. Redirecting..." />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <DashboardFilters
        filters={filtersData}
        selectedTimeRange={selectedTimeRange}
        selectedModels={selectedModels}
        selectedBrand={selectedBrand}
        selectedTags={selectedTags}
        customDateRange={customDateRange}
        onTimeRangeChange={setSelectedTimeRange}
        onModelToggle={handleModelToggle}
        onBrandChange={handleBrandChange}
        onTagToggle={handleTagToggle}
        onCustomDateRangeChange={setCustomDateRange}
        showSearch={false}
      />
      <div className="flex-1 p-2 md:p-4">
        {/* TODO: TrialStatusBanner */}
        {/* <TrialStatusBanner /> */}

        <div className="space-y-2 md:space-y-3">
          <BrandsChartWithTable
            data={enhancedDashboardData}
            selectedTimeRange={selectedTimeRange}
            selectedModels={selectedModels}
            selectedBrand={selectedBrand}
            selectedTags={selectedTags}
            customDateRange={customDateRange}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            startDate={dateRange?.start_date ? new Date(dateRange.start_date) : undefined}
            endDate={dateRange?.end_date ? new Date(dateRange.end_date) : undefined}
          />

          <div className="flex gap-2 md:gap-3 flex-col md:flex-row h-auto">
            <div className="w-full md:w-2/3 flex flex-col">
              <RecentPromptsResponseList
                data={dashboardData?.data.recent_chats || []}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                onViewResponse={handleViewResponse}
              />
            </div>
            <div className="w-full md:w-1/3 flex flex-col">
              {analyticsFilters && (
                <TopSources
                  data={dashboardData?.data.sources_usage || []}
                  selectedTimeRange={selectedTimeRange}
                  customDateRange={customDateRange?.from && customDateRange?.to ? { from: customDateRange.from, to: customDateRange.to } : null}
                  analyticsFilters={analyticsFilters}
                  isLoading={isLoading}
                  isRefreshing={isRefreshing}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
