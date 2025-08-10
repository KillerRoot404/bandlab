import React from "react";

/**
 * ErrorBoundary: captura erros de renderização/commit no React e exibe um fallback amigável.
 * Também registra stack e mensagem no console para facilitar o debug.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log detalhado no console para captura rápida
    // Alguns erros de DOM (ex: insertBefore) vêm do commit phase e aparecem aqui
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Runtime error captured", { error, errorInfo });
  }

  handleRetry = () => {
    // Tenta re-renderizar a subárvore problemática
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const details = (this.state.errorInfo && this.state.errorInfo.componentStack) || "";
      return (
        <div className="min-h-[40vh] m-4 rounded-lg border border-red-500/40 bg-red-950/20 p-4 text-red-200">
          <h2 className="text-lg font-semibold mb-2">Ocorreu um erro ao renderizar esta seção.</h2>
          <p className="mb-4">Mensagem: {this.state.error?.message || String(this.state.error)}</p>
          {details ? (
            <details open className="whitespace-pre-wrap text-sm bg-black/40 p-3 rounded border border-red-500/20">
              <summary className="cursor-pointer mb-2">Detalhes técnicos (component stack)</summary>
              {details}
            </details>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button onClick={this.handleRetry} className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white">Tentar novamente</button>
            <button onClick={() => window.location.reload()} className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-800 text-white">Recarregar página</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}