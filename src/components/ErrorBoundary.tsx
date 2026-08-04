import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Falha ao renderizar o módulo de estudos", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-200">
          <h3 className="font-bold">Não foi possível abrir este módulo</h3>
          <p className="mt-2 text-sm">Seus dados continuam salvos. Recarregue a página e tente novamente.</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}
