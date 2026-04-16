import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f0f2f5] text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-[#191c1e] mb-2">Ops! Algo deu errado</h1>
          <p className="text-slate-600 mb-8 max-w-xs">
            Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
          </p>
          
          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <RefreshCw size={20} />
              Recarregar Página
            </button>
            
            <a
              href="/"
              className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Home size={20} />
              Ir para o Início
            </a>
          </div>

          <div className="mt-8 p-4 bg-slate-800 text-slate-100 rounded-lg text-left w-full max-w-md overflow-auto max-h-40 shadow-inner">
            <p className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap opacity-90">
              {this.state.error?.toString()}
              {this.state.error?.stack && `\n\nStack Trace:\n${this.state.error.stack}`}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
