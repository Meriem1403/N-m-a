import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  label?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Néméa]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="nemea-panel text-center py-12 px-4">
          <p className="text-sm font-medium text-white/80">
            {this.props.label ?? 'Impossible d\'afficher cette page.'}
          </p>
          <p className="mt-2 text-xs text-white/40 break-words">{this.state.error.message}</p>
          <button
            type="button"
            className="btn-ghost mt-4"
            onClick={() => this.setState({ error: null })}
          >
            Réessayer
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
