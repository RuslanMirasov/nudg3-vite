import type { DateRange } from 'react-day-picker';
import type { DashboardAnalytics } from '@/features/auth/types/auth';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Info } from 'lucide-react';
import { ChartErrorBoundary } from '@/features/dashboard/components/ChartErrorBoundary';
import { assignUniqueColors, CHART_FALLBACK_COLORS, getThemeAwareColor } from '@/features/dashboard/lib/chart-colors';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';

import {
  FaviconImage,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components';

// Type definitions
interface BrandData {
  visibility_score: Record<string, number>;
  sentiment: number;
  position: number;
  domain: string;
  brand_colors?: string[]; // Extracted brand colors from logo
}

interface ChartDataPoint {
  date: string;
  [brandName: string]: string | number;
}

interface BrandsChartWithTableProps {
  data: DashboardAnalytics | null;
  selectedTimeRange: string;
  selectedModels: string[];
  selectedBrand: string;
  selectedTags: string[];
  customDateRange?: DateRange;
  isLoading?: boolean;
  isRefreshing?: boolean;
  // Add export-related props
  startDate?: Date;
  endDate?: Date;
}

export function BrandsChartWithTable({ data, isLoading: isLoadingProp = false, isRefreshing = false }: BrandsChartWithTableProps) {
  // State to track hovered brand for chart highlighting
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  // Add export state - Temporarily Disabled
  // const [isExporting, setIsExporting] = useState(false)
  const { theme } = useTheme();

  // Add export handler - Temporarily Disabled
  /* const handleExport = async (exportType: 'timeseries' | 'summary' | 'combined') => {
      if (!selectedWorkspace || !startDate || !endDate) {
        toast.error("Missing required data for export")
        return
      }

      const token = tokenStorage.getToken()
      if (!token) {
        toast.error("Authentication required")
        return
      }

      setIsExporting(true)

      try {
        // Get export statistics first for user confirmation
        const stats = await exportApi.getDashboardExportStatistics(token, selectedWorkspace.id, {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          models: selectedModels.length > 0 ? selectedModels : undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          export_type: exportType
        })

        // Show confirmation for larger exports
        if (stats.total_data_points > 1000) {
          const confirmed = window.confirm(
            `This export will contain ${stats.total_data_points.toLocaleString()} data points across ${stats.total_brands} brands over ${stats.date_range_days} days (≈${stats.estimated_size_mb.toFixed(1)}MB). Continue?`
          )
          if (!confirmed) {
            setIsExporting(false)
            return
          }
        }

        // Perform the export
        const blob = await exportApi.downloadDashboardGraphCsv(token, selectedWorkspace.id, {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          models: selectedModels.length > 0 ? selectedModels : undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          export_type: exportType
        })

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        const filename = `dashboard_graph_${exportType}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success(`Dashboard data exported successfully (${stats.total_data_points.toLocaleString()} data points)`)

      } catch (error) {
        console.error('Export failed:', error)
        toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsExporting(false)
      }
    } */

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!data?.data.brands) return [];

    // Get all unique dates from all brands
    const allDates = new Set<string>();

    // Safely get brands values with null check
    const brandsData = data.data.brands && typeof data.data.brands === 'object' ? Object.values(data.data.brands) : [];

    brandsData.forEach((brand: BrandData) => {
      if (brand?.visibility_score && typeof brand.visibility_score === 'object') {
        Object.keys(brand.visibility_score).forEach(date => allDates.add(date));
      }
    });

    // Create chart data points for each date
    return Array.from(allDates)
      .sort()
      .map(date => {
        const dataPoint: ChartDataPoint = { date };

        Object.entries(data.data.brands).forEach(([brandName, brandData]: [string, BrandData]) => {
          dataPoint[brandName] = brandData.visibility_score[date] || 0;
        });

        return dataPoint;
      });
  }, [data]);

  // Transform API data to brands table format
  const brandsTableData = useMemo(() => {
    if (!data?.data.brands) return [];

    return Object.entries(data.data.brands)
      .map(([brandName, brandData]: [string, BrandData]) => {
        // Safely get visibility values with null checks
        const visibilityValues =
          brandData?.visibility_score && typeof brandData.visibility_score === 'object' && brandData.visibility_score !== null
            ? Object.values(brandData.visibility_score)
            : [];

        const avgVisibility =
          visibilityValues.length > 0 ? visibilityValues.reduce((sum: number, val: number) => sum + val, 0) / visibilityValues.length : 0;

        return {
          name: brandName,
          visibility: avgVisibility,
          sentiment: brandData.sentiment || 0,
          position: brandData.position || 0,
          domain: brandData.domain,
        };
      })
      .sort((a, b) => b.visibility - a.visibility) // Sort by visibility descending
      .map((brand, index) => ({
        ...brand,
        rank: index + 1, // Assign rank based on sorted position
      }));
  }, [data]);

  // Generate unique colors for each brand with collision detection and theme-aware transformation
  const brandColors = useMemo(() => {
    if (!data?.data.brands) return {};

    // Prepare entities array with extracted colors
    const entities = Object.entries(data.data.brands).map(([brandName, brandData]) => ({
      name: brandName,
      extractedColors: brandData.brand_colors,
    }));

    // Assign unique colors with collision detection
    const colorMap = assignUniqueColors(entities, CHART_FALLBACK_COLORS);

    // Apply theme-aware transformation to all colors
    // This ensures black logos appear white on dark themes and vice versa
    const themeAwareColorMap: Record<string, string> = {};
    colorMap.forEach((color, brandName) => {
      themeAwareColorMap[brandName] = getThemeAwareColor(color, theme);
    });

    return themeAwareColorMap;
  }, [data, theme]);

  // Determine loading and empty states
  const isActuallyLoading = isLoadingProp || isRefreshing;
  const hasData = data?.data.brands && Object.keys(data.data.brands).length > 0;
  const isEmpty = !isActuallyLoading && data && !hasData;

  return (
    <div className="flex gap-3 md:gap-4 flex-col lg:flex-row h-auto">
      {/* Line Chart - First Column */}
      <Card className="w-full lg:w-1/2 flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold dark:font-medium text-muted-foreground dark:text-gray-300">Visibility</CardTitle>
              <CardDescription className="text-xs text-muted-foreground dark:text-gray-400">
                Percentage of chats mentioning each brand
              </CardDescription>
            </div>
            {/* Export Button - Temporarily Disabled */}
            {/* <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isExporting || isActuallyLoading || (isEmpty ?? false)}
                                    className="ml-2 cursor-pointer"
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    <span className="ml-1 hidden sm:inline">Export</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExport('timeseries')}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">Time Series</span>
                                        <span className="text-xs text-muted-foreground">Daily data for each brand</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('summary')}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">Summary</span>
                                        <span className="text-xs text-muted-foreground">Aggregated brand metrics</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('combined')}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">Combined</span>
                                        <span className="text-xs text-muted-foreground">Both time series & summary</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu> */}
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {isActuallyLoading ? (
              <div className="w-full h-[290px] flex flex-col gap-3">
                {/* Chart skeleton with Y-axis labels */}
                <div className="flex h-[250px]">
                  {/* Y-axis skeleton */}
                  <div className="flex flex-col justify-between py-2 w-8 mr-2">
                    <Skeleton className="w-6 h-3" variant="text" />
                    <Skeleton className="w-6 h-3" variant="text" />
                    <Skeleton className="w-6 h-3" variant="text" />
                    <Skeleton className="w-6 h-3" variant="text" />
                    <Skeleton className="w-6 h-3" variant="text" />
                  </div>
                  {/* Chart area */}
                  <Skeleton className="flex-1 h-[250px]" variant="chart" />
                </div>
                {/* X-axis labels skeleton */}
                <div className="flex justify-between px-10">
                  <Skeleton className="w-12 h-3" variant="text" />
                  <Skeleton className="w-12 h-3" variant="text" />
                  <Skeleton className="w-12 h-3" variant="text" />
                  <Skeleton className="w-12 h-3" variant="text" />
                  <Skeleton className="w-12 h-3" variant="text" />
                </div>
              </div>
            ) : isEmpty ? (
              <div className="w-full h-[290px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground dark:text-gray-400">No data available for current filter</p>
              </div>
            ) : (
              <ChartErrorBoundary chartName="Brand Visibility Chart">
                <ResponsiveContainer width="100%" height={290}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 3, bottom: 10 }}>
                    <CartesianGrid stroke="#e2e8f0" className="dark:stroke-gray-700" strokeOpacity={1} vertical={false} horizontal={true} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 13, fill: '#64748b' }}
                      className="dark:[&_.recharts-text]:fill-gray-400 dark:[&_.recharts-cartesian-axis-line]:stroke-gray-700"
                      tickFormatter={value => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      axisLine={{ stroke: '#e2e8f0', strokeOpacity: 1 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 13, fill: '#64748b' }}
                      className="dark:[&_.recharts-text]:fill-gray-400 dark:[&_.recharts-cartesian-axis-line]:stroke-gray-700"
                      axisLine={{ stroke: '#e2e8f0', strokeOpacity: 1, strokeDasharray: '3 3' }}
                      tickLine={false}
                      tickFormatter={value => `${value}%`}
                      width={35}
                    />
                    <ChartTooltip
                      labelFormatter={value =>
                        new Date(value).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                      formatter={(value: number, name: string) => [`${Number(value).toFixed(1)}%`, name]}
                      cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;

                        const sortedPayload = [...payload].sort((a, b) => {
                          const aValue = typeof a.value === 'number' ? a.value : 0;
                          const bValue = typeof b.value === 'number' ? b.value : 0;
                          return bValue - aValue;
                        });

                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[180px]">
                            <p className="text-gray-900 dark:text-gray-100 font-semibold text-base mb-4">
                              {new Date(label).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <div className="space-y-3">
                              {sortedPayload.map((entry, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm">
                                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {entry.dataKey}: {Number(entry.value).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    />
                    {Object.keys(brandColors).map(brandName => {
                      // Calculate opacity based on hover state
                      const isHovered = hoveredBrand === brandName;
                      const hasHover = hoveredBrand !== null;
                      const opacity = hasHover ? (isHovered ? 1 : 0.2) : 1;

                      return (
                        <Line
                          key={brandName}
                          type="monotone"
                          dataKey={brandName}
                          stroke={brandColors[brandName] || '#6B7280'}
                          strokeWidth={2.5}
                          strokeOpacity={opacity}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 0, fill: brandColors[brandName] || '#6B7280', stroke: brandColors[brandName] || '#6B7280' }}
                          isAnimationActive={true}
                          animationDuration={1200}
                          animationBegin={0}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brands Table - Second Column */}
      <Card className="w-full lg:w-1/2 flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base font-semibold dark:font-medium text-muted-foreground dark:text-gray-300">Top Brands</CardTitle>
          <CardDescription className="text-xs text-muted-foreground/70 dark:text-gray-400/70">Most mentioned brands based on filters</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 max-h-full overflow-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`
                            .flex-1.max-h-full.overflow-auto::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/30">
                  <TableHead className="text-left font-medium text-sm text-muted-foreground dark:text-gray-400 px-3 py-3 bg-muted/30 border-r border-border">
                    #
                  </TableHead>
                  <TableHead className="text-left font-medium text-sm text-muted-foreground dark:text-gray-400 px-3 py-3 bg-muted/30 border-r border-border w-16 min-w-0">
                    Brand
                  </TableHead>
                  <TableHead className="text-right font-medium text-sm text-muted-foreground dark:text-gray-400 px-3 py-3 bg-muted/30 border-r border-border">
                    <div className="flex items-center justify-end gap-1">
                      <span>Rank</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Average position rank in AI responses</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-medium text-sm text-muted-foreground dark:text-gray-400 px-3 py-3 bg-muted/30 border-r border-border">
                    <div className="flex items-center justify-end gap-1">
                      <span>Visibility</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of chats mentioning this brand</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-medium text-sm text-muted-foreground dark:text-gray-400 px-3 py-3 bg-muted/30">
                    <div className="flex items-center justify-end gap-1">
                      <span>Sentiment</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Average sentiment score (0-100)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isActuallyLoading ? (
                  // Skeleton rows for 5 brands
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="border-b border-border">
                      <TableCell className="px-3 py-2 border-r border-border">
                        <Skeleton className="w-4 h-4" variant="text" />
                      </TableCell>
                      <TableCell className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-3.5 h-3.5 rounded-full" variant="avatar" />
                          <Skeleton className="w-16 h-4" variant="text" />
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right border-r border-border">
                        <Skeleton className="w-6 h-4 ml-auto" variant="text" />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right border-r border-border">
                        <Skeleton className="w-8 h-4 ml-auto" variant="text" />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right">
                        <Skeleton className="w-10 h-6 ml-auto rounded-full" variant="button" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isEmpty ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="px-3 py-8 text-center">
                      <p className="text-sm text-muted-foreground dark:text-gray-400">No data available for current filter</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  brandsTableData.map(brand => {
                    // Format sentiment as a score out of 100 and determine color
                    const sentimentScore = Math.round(brand.sentiment * 100);

                    return (
                      <TableRow
                        key={brand.name}
                        className="hover:bg-muted/50 border-b border-border transition-colors"
                        onMouseEnter={() => setHoveredBrand(brand.name)}
                        onMouseLeave={() => setHoveredBrand(null)}
                      >
                        <TableCell className="px-3 py-2 border-r border-border">
                          <span className="text-sm font-medium">{brand.rank}</span>
                        </TableCell>
                        <TableCell className="px-3 py-2 border-r border-border">
                          <div className="flex items-center gap-2 min-w-0">
                            <FaviconImage name={brand.name} domain={brand.domain} size={14} className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-sm font-medium truncate" title={brand.name}>
                              {brand.name.length > 40 ? `${brand.name.substring(0, 25)}...` : brand.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right border-r border-border">
                          <span className="text-sm font-medium">{brand.position.toFixed(1)}</span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right border-r border-border">
                          <span className="text-sm font-medium">{brand.visibility.toFixed(0)}%</span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end">
                            <div
                              className={`inline-flex items-center justify-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                sentimentScore >= 75
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : sentimentScore >= 50
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  sentimentScore >= 75 ? 'bg-green-500' : sentimentScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              ></div>
                              {sentimentScore}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-3 py-3 border-t border-border shrink-0">
            <div className="flex justify-center">
              <button className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground transition-colors">View all data</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
