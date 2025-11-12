import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Info } from 'lucide-react';
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

import { SourceAnalyticsSlider } from '@/features/dashboard/components/SourceAnalyticsSlider';

// Updated API format with source_id
interface SourceDataItem {
  domain: string;
  source_id: string;
  usage_percentage: number;
}

// Backward compatibility - can be either new format or old format
type APISourcesData = (SourceDataItem | Record<string, number>)[];

interface ProcessedSource {
  domain: string;
  source_id: string | null;
  usage_percentage: number;
}

interface TopSourcesProps {
  data: APISourcesData;
  selectedTimeRange?: string;
  customDateRange?: { from: Date; to: Date } | null;
  // Analytics filters passed from parent
  analyticsFilters?: {
    start_date: string;
    end_date: string;
    models?: string[];
    tags?: string[];
    workspace_id: string;
  };
  isLoading?: boolean;
  isRefreshing?: boolean;
  // Optional props for prompt-specific usage
  promptTemplateId?: string;
  mode?: 'regular' | 'prompt-specific';
}

export function TopSources({
  data,
  selectedTimeRange = '7',
  analyticsFilters,
  isLoading: isLoadingProp = false,
  isRefreshing = false,
  promptTemplateId,
  mode = 'regular',
}: TopSourcesProps) {
  const router = useRouter();
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Process the API data into a usable format with better error handling
  const processedSources: ProcessedSource[] = data
    .filter(sourceObj => {
      return sourceObj && typeof sourceObj === 'object';
    }) // Filter out invalid objects
    .map(sourceObj => {
      // Handle new format with domain, source_id, usage_percentage
      if ('domain' in sourceObj && 'source_id' in sourceObj && 'usage_percentage' in sourceObj) {
        const item = sourceObj as SourceDataItem;
        return {
          domain: item.domain.trim(),
          source_id: item.source_id,
          usage_percentage: item.usage_percentage,
        };
      }

      // Handle legacy format {"domain": percentage}
      const entries = Object.entries(sourceObj as Record<string, number>);
      if (entries.length === 0) return null;

      const [domain, usage_percentage] = entries[0] ?? ['', 0];

      // Ensure domain is valid and usage_percentage is a number
      if (!domain || typeof domain !== 'string' || domain.trim() === '') {
        return null;
      }

      const percentage = typeof usage_percentage === 'number' ? usage_percentage : 0;

      return {
        domain: domain.trim(),
        source_id: null, // No source_id in legacy format
        usage_percentage: percentage,
      };
    })
    .filter(source => source !== null) // Remove null entries
    .sort((a, b) => b.usage_percentage - a.usage_percentage);

  // Handle navigation to sources page
  const handleViewAllSources = () => {
    router.navigate({ to: '/sources' });
  };

  // Handle individual source click - open analytics slider instead of navigation
  const handleSourceClick = async (source: ProcessedSource) => {
    try {
      // Only open analytics if we have source_id, otherwise show a brief message
      if (source.source_id) {
        setSelectedDomain(source.domain);
        setSelectedSourceId(source.source_id);
        setAnalyticsOpen(true);
      } else {
        // For legacy sources without source_id, still open but show the message
        setSelectedDomain(source.domain);
        setSelectedSourceId(null);
        setAnalyticsOpen(true);
      }
    } catch (error) {
      console.error('Error handling source click:', error);
      // Fallback to using domain only
      setSelectedDomain(source.domain);
      setSelectedSourceId(null);
      setAnalyticsOpen(true);
    }
  };

  // Determine loading and empty states
  const isActuallyLoading = isLoadingProp || isRefreshing;
  const hasData = data && data.length > 0;
  const isEmpty = !isActuallyLoading && !hasData;

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold dark:font-medium text-muted-foreground dark:text-gray-300">
          Sources
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Sources used by AI models in the last {selectedTimeRange} days</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground/70">Sources used by AI models</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex flex-col">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="bg-muted/30 px-6 py-3 text-left text-sm font-medium text-muted-foreground dark:text-gray-400">Source</TableHead>
              <TableHead className="text-right bg-muted/30 px-6 py-3 text-sm font-medium text-muted-foreground dark:text-gray-400">
                <div className="flex items-center justify-end gap-1">
                  Response Coverage
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground/70" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of AI responses that cite this source</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isActuallyLoading ? (
              <>
                {/* Skeleton rows for 5 sources */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-sm" variant="avatar" />
                        <Skeleton className="w-32 h-4" variant="text" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium px-6 py-3">
                      <Skeleton className="w-10 h-4 ml-auto" variant="text" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="px-6 py-30 text-center">
                  <p className="text-sm text-muted-foreground">No data available for current filter</p>
                </TableCell>
              </TableRow>
            ) : (
              processedSources.slice(0, 5).map((source, index) => (
                <TableRow
                  key={`${source.domain}-${index}`} // Use domain + index for unique keys
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSourceClick(source)}
                >
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <FaviconImage domain={source.domain} name={source.domain} size={16} className="rounded-sm" />
                      <span className="font-medium text-sm">{source.domain}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium px-6 py-3">{source.usage_percentage}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Show skeleton button during loading or real button when data is loaded */}
        {isActuallyLoading ? (
          <div className="px-6 py-3 border-t border-border shrink-0">
            <div className="flex justify-center">
              <Skeleton className="w-24 h-5" variant="text" />
            </div>
          </div>
        ) : (
          processedSources.length >= 5 &&
          mode !== 'prompt-specific' && (
            <div className="px-6 py-5 border-t border-border shrink-0">
              <div className="flex justify-center">
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={handleViewAllSources}>
                  View all sources
                </button>
              </div>
            </div>
          )
        )}
      </CardContent>

      {/* Analytics Slider */}
      {analyticsFilters && (
        <SourceAnalyticsSlider
          open={analyticsOpen}
          onClose={() => setAnalyticsOpen(false)}
          sourceId={selectedSourceId}
          sourceDomain={selectedDomain}
          filters={analyticsFilters}
          promptTemplateId={promptTemplateId}
          mode={mode}
        />
      )}
    </Card>
  );
}
