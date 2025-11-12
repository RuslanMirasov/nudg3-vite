import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Bot } from 'lucide-react';
import { FaviconImage, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Skeleton } from '@/shared/components';
import { analyticsApi } from '@/features/dashboard/api/analytics-api';

// Types for URL analytics data based on the actual API response
interface URLCitation {
  url: string;
  title: string;
  usage_count: number;
}

interface SourceAnalyticsSliderProps {
  open: boolean;
  onClose: () => void;
  sourceId: string | null;
  sourceDomain: string | null;
  filters: {
    start_date: string;
    end_date: string;
    models?: string[];
    tags?: string[];
    workspace_id: string;
  };
  // Optional props for prompt-specific usage
  promptTemplateId?: string | undefined;
  mode?: 'regular' | 'prompt-specific';
}

export function SourceAnalyticsSlider({
  open,
  onClose,
  sourceId,
  sourceDomain,
  filters,
  promptTemplateId,
  mode = 'regular',
}: SourceAnalyticsSliderProps) {
  const [data, setData] = useState<URLCitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle smooth open/close animations
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      // Small delay to ensure the component is rendered with translate-x-full first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Keep component rendered during exit animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Reduced from 300ms to 200ms for faster animation
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle click outside to close (desktop only)
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const slider = document.querySelector('[data-slider-panel]');

      // Only close on desktop (screens larger than md breakpoint)
      if (window.innerWidth >= 768 && slider && !slider.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      let result;

      if (mode === 'prompt-specific' && promptTemplateId) {
        // Use prompt-specific URLs endpoint
        result = await analyticsApi.getPromptSpecificURLs({
          prompt_template_id: promptTemplateId,
          source_id: sourceId!,
          workspace_id: filters.workspace_id,
          page: page,
          page_size: pageSize,
          start_date: filters.start_date,
          end_date: filters.end_date,
          models: filters.models,
        });
      } else {
        // Use regular URLs endpoint
        result = await analyticsApi.getURLAnalytics({
          workspace_id: filters.workspace_id,
          source_id: sourceId!,
          page: page,
          page_size: pageSize,
          start_date: filters.start_date,
          end_date: filters.end_date,
          models: filters.models,
          tags: filters.tags,
        });
      }

      if (result.status === 'success') {
        setData(result.data.citations || []);
        setTotal(result.data.pagination?.total_items || 0);
        setTotalPages(result.data.pagination?.total_pages || 0);
      } else {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters.workspace_id, sourceId, page, pageSize, filters.start_date, filters.end_date, filters.models, filters.tags, mode, promptTemplateId]);

  // Fetch analytics data when slider opens or filters change
  useEffect(() => {
    if (!isVisible || !sourceId || !filters.workspace_id) return;

    fetchAnalyticsData();
  }, [isVisible, sourceId, filters.workspace_id, fetchAnalyticsData]);

  // Reset pagination when slider opens with new source
  useEffect(() => {
    if (isVisible && sourceId) {
      setPage(1);
    }
  }, [isVisible, sourceId]);

  // Handle pagination
  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(totalPages, p + 1));
  const handleFirstPage = () => setPage(1);
  const handleLastPage = () => setPage(totalPages);

  // Get domain from URL for favicon
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <>
      {/* Only render when shouldRender is true */}
      {shouldRender &&
        (typeof document !== 'undefined'
          ? createPortal(
              <>
                {/* Backdrop overlay */}
                <div
                  className={cn(
                    'fixed inset-0 z-90 bg-transparent',
                    'transition-opacity duration-300 ease-out',
                    isVisible ? 'opacity-100' : 'opacity-0'
                  )}
                  onClick={onClose}
                />

                {/* Slider panel */}
                <div
                  data-slider-panel
                  className={cn(
                    'fixed z-100 flex flex-col',
                    'inset-0 md:right-6 md:top-6 md:bottom-6 md:left-auto',
                    'md:w-[45vw] md:min-w-[450px] md:max-w-[650px]',
                    'bg-background/95 backdrop-blur-md',
                    'md:border md:border-border/30 md:rounded-2xl md:shadow-2xl',
                    'md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
                    'transition-transform duration-300 ease-out',
                    isVisible ? 'translate-y-0 md:translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
                  )}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header */}
                  <div
                    className={cn(
                      'relative flex items-center justify-between p-4 md:p-6 border-b border-border/30',
                      'bg-card/40 backdrop-blur-sm md:rounded-t-2xl',
                      'before:absolute before:inset-0 md:before:rounded-t-2xl before:bg-linear-to-r',
                      'before:from-primary/5 before:to-transparent before:pointer-events-none'
                    )}
                  >
                    <div className="flex flex-col gap-1 relative z-10">
                      <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                        <FaviconImage domain={sourceDomain || ''} name={sourceDomain || ''} size={20} className="rounded-sm" />
                        Analytics for {sourceDomain}
                      </h2>
                      <p className="text-xs text-muted-foreground">{total} URL citations and mentions analysis</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className={cn(
                        'h-8 w-8 p-0 hover:bg-muted/50 relative z-10',
                        'border border-border/20 backdrop-blur-sm',
                        'hover:border-border/40 transition-all duration-200'
                      )}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-auto show-scrollbar relative">
                    {!sourceId ? (
                      // Show message when no source_id is available
                      <div className="flex flex-col items-center justify-center h-64 text-center relative px-6">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-full bg-muted/30 backdrop-blur-sm',
                            'flex items-center justify-center mb-4',
                            'border border-border/20'
                          )}
                        >
                          <Bot className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Analytics not available for this source</p>
                        <p className="text-xs text-muted-foreground mt-1">This source uses legacy data format without detailed analytics</p>
                      </div>
                    ) : loading ? (
                      <div className="border-t border-border/30 bg-card/20 backdrop-blur-sm">
                        <Table className="table-fixed">
                          <TableHeader>
                            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                              <TableHead className="border-r text-sm font-medium w-[60px] text-center py-3 text-muted-foreground bg-muted/30">
                                AI
                              </TableHead>
                              <TableHead className="text-sm font-medium text-left py-3 text-muted-foreground bg-muted/30">URL & Content</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TableRow key={i} className="border-b h-12 md:h-14">
                                <TableCell className="border-r py-2 text-center w-[60px]">
                                  <Skeleton className="h-5 w-5 rounded mx-auto" />
                                </TableCell>
                                <TableCell className="py-2 px-3">
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : data.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center relative">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-full bg-muted/30 backdrop-blur-sm',
                            'flex items-center justify-center mb-4',
                            'border border-border/20'
                          )}
                        >
                          <Bot className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {data.length === 0 ? 'No analytics data available' : 'No results match your search'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {data.length === 0 ? 'Try adjusting your date range or filters' : 'Try a different search term'}
                        </p>
                      </div>
                    ) : (
                      <div className="border-t border-border/30 bg-card/20 backdrop-blur-sm">
                        <Table className="table-fixed">
                          <TableHeader>
                            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                              <TableHead className="border-r text-sm font-medium text-left py-3 text-muted-foreground bg-muted/30">
                                URL & Content
                              </TableHead>
                              <TableHead className="text-sm font-medium text-center py-3 text-muted-foreground bg-muted/30 w-20">Usage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.map((item, index) => (
                              <TableRow
                                key={`${item.url}-${index}`}
                                className="border-b h-12 md:h-14 cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => window.open(item.url, '_blank')}
                              >
                                <TableCell className="border-r py-2 px-2 md:px-3">
                                  <div className="min-w-0 flex items-start gap-3">
                                    {/* Favicon */}
                                    <div className="shrink-0 mt-0.5">
                                      <FaviconImage
                                        domain={getDomainFromUrl(item.url)}
                                        name={getDomainFromUrl(item.url)}
                                        size={16}
                                        className="w-4 h-4 rounded-sm"
                                      />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-foreground truncate">{item.title || 'Untitled'}</p>
                                      <p className="text-xs text-muted-foreground truncate font-mono mt-1">{item.url}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 text-center w-20">
                                  <span className="text-sm font-medium text-foreground">{item.usage_count}</span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* Pagination Footer */}
                  {!loading && total > 0 && (
                    <div
                      className={cn(
                        'flex flex-col sm:flex-row items-center justify-between p-3 md:p-5 border-t border-border/30',
                        'bg-card/40 backdrop-blur-sm relative md:rounded-b-2xl gap-3 sm:gap-0',
                        'before:absolute before:inset-0 before:bg-linear-to-r',
                        'before:from-white/5 before:to-transparent before:pointer-events-none'
                      )}
                    >
                      <div className="flex items-center gap-2 relative z-10 order-2 sm:order-1">
                        <p className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">
                          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
                        </p>
                      </div>
                      <div className="flex items-center gap-2 relative z-10 order-1 sm:order-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFirstPage}
                          disabled={page === 1}
                          className={cn(
                            'h-8 w-8 p-0 bg-background/50 backdrop-blur-sm',
                            'border-border/30 hover:border-border/50',
                            'hover:bg-background/70 transition-all duration-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          disabled={page === 1}
                          className={cn(
                            'h-8 w-8 p-0 bg-background/50 backdrop-blur-sm',
                            'border-border/30 hover:border-border/50',
                            'hover:bg-background/70 transition-all duration-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div
                          className={cn(
                            'px-2 md:px-3 py-1 rounded-md bg-background/50 backdrop-blur-sm',
                            'border border-border/20 text-xs md:text-sm font-medium'
                          )}
                        >
                          {page} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={page >= totalPages}
                          className={cn(
                            'h-8 w-8 p-0 bg-background/50 backdrop-blur-sm',
                            'border-border/30 hover:border-border/50',
                            'hover:bg-background/70 transition-all duration-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLastPage}
                          disabled={page >= totalPages}
                          className={cn(
                            'h-8 w-8 p-0 bg-background/50 backdrop-blur-sm',
                            'border-border/30 hover:border-border/50',
                            'hover:bg-background/70 transition-all duration-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>,
              document.body
            )
          : null)}
    </>
  );
}
