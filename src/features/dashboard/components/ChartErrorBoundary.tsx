import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  chartName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('Chart rendering error:', {
      chartName: this.props.chartName || 'Unknown chart',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  override render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="w-full h-[290px] flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500" />
              <p className="text-sm font-medium">Unable to render chart</p>
              <p className="text-xs text-muted-foreground">{this.state.error?.message || 'Data visualization temporarily unavailable'}</p>
              {this.props.chartName && <p className="text-xs text-muted-foreground">Chart: {this.props.chartName}</p>}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
