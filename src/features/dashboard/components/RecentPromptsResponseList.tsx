import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FaviconImage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  getAIModelIcon,
} from '@/shared/components';

export interface APIRecentChat {
  prompt_text?: string;
  provider_response_id?: string;
  prompt_template_id?: string;
  response_text: string;
  model: string;
  created_at: string;
  brand_domains?: string[];
  brand_mentions?: Array<{
    brand_name: string;
    visibility_score: number;
    sentiment_score: number;
    position_rank: number;
  }>;
}

interface RecentPromptsResponseListProps {
  data: APIRecentChat[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onViewResponse?: (providerResponseId: string, chat?: APIRecentChat) => void;
}

export function RecentPromptsResponseList({
  data,
  isLoading: isLoadingProp = false,
  isRefreshing = false,
  onViewResponse,
}: RecentPromptsResponseListProps) {
  // Determine loading and empty states
  const isActuallyLoading = isLoadingProp || isRefreshing;
  const hasData = data && data.length > 0;
  const isEmpty = !isActuallyLoading && !hasData;

  // Show all chats since API already returns top 5 brands data - no filtering needed
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Simply return all data since the API already handles filtering for top 5 brands
    return data.slice(0, 10); // Show up to 10 results
  }, [data]);

  const handleRowClick = (chat: APIRecentChat) => {
    // Only call onViewResponse if we have a provider_response_id and the callback is available
    if (chat.provider_response_id && onViewResponse) {
      onViewResponse(chat.provider_response_id, chat);
    }
    // Remove the fallback navigation since we don't have valid prompt IDs
    // and it causes 422 errors when trying to fetch prompt dashboard with invalid IDs
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold dark:font-medium text-muted-foreground dark:text-gray-300">Recent Chat Responses</CardTitle>
        <CardDescription className="text-xs text-muted-foreground/70 dark:text-gray-400/70">
          Chats that mentioned brands • Click any response for detailed analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="bg-muted/30 w-[65%] px-6 py-3 text-left text-sm font-medium text-muted-foreground dark:text-gray-400">
                  Chat
                </TableHead>
                <TableHead className="bg-muted/30 w-[20%] px-6 py-3 text-left text-sm font-medium text-muted-foreground dark:text-gray-400">
                  Top Mentions
                </TableHead>
                <TableHead className="text-right bg-muted/30 w-[15%] px-6 py-3 text-sm font-medium text-muted-foreground dark:text-gray-400">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isActuallyLoading ? (
                // Skeleton rows for 5 chats with improved animation
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell className="py-4 w-[65%] px-6">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <Skeleton className="w-5 h-5 rounded-full" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 w-[20%] px-6">
                      <div className="flex items-center gap-1">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="w-4 h-4 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right w-[15%] px-6">
                      <div className="flex justify-end">
                        <Skeleton className="w-12 h-4" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : isEmpty ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={3} className="px-6 py-30 text-center">
                    <p className="text-sm text-muted-foreground dark:text-gray-400">No data available for current filter</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((chat, index) => {
                  const isClickable = chat.provider_response_id && onViewResponse;
                  return (
                    <TableRow
                      key={index}
                      className={`${isClickable ? 'cursor-pointer hover:bg-muted/50 group' : 'opacity-75'} transition-colors`}
                      onClick={() => handleRowClick(chat)}
                    >
                      {/* Chat Column */}
                      <TableCell className="py-2 w-[65%] px-6">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">{getAIModelIcon(chat.model, { className: 'w-5 h-5' })}</div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate mb-1">{chat.prompt_text || 'No prompt text available'}</div>
                            <div className="text-xs text-muted-foreground dark:text-gray-400 truncate">{chat.response_text}</div>
                          </div>
                          {isClickable && (
                            <ExternalLink className="h-4 w-4 text-muted-foreground dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </TableCell>

                      {/* Mentions Column */}
                      <TableCell className="py-2 w-[20%] px-6">
                        <div className="flex items-center gap-1 flex-wrap">
                          {chat.brand_domains?.slice(0, 3).map((domain, domainIndex) => (
                            <div key={domainIndex} className="w-4 h-4 rounded-md overflow-hidden border border-border/10 bg-muted/20">
                              <FaviconImage domain={domain} name={domain} size={16} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      {/* Created Column */}
                      <TableCell className="py-2 text-right w-[15%] px-6">
                        <div className="text-sm text-muted-foreground dark:text-gray-400">
                          {new Date(chat.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
