import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Catches render/runtime errors anywhere in the tree and shows a COSMOS-toned
 * error instead of a blank screen (§42). The real error is logged for developers.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Never hide real errors during development.
    console.error('[COSMOS] Uncaught error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-void px-6 text-center">
          <div className="max-w-sm">
            <p className="mb-2 font-display text-xl text-ink">Algo salió mal.</p>
            <p className="text-sm leading-relaxed text-ink-soft">
              Tu universo sigue aquí. Inténtalo otra vez.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-void transition-colors hover:bg-white"
            >
              Recargar
            </button>
            <pre className="mt-6 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-3 text-left text-[11px] text-ink-faint">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
