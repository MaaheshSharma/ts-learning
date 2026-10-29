import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-xl p-6 text-center">
          <div role="alert">
            <h1 className="text-xl font-bold">Something went wrong</h1>

            <p className="mt-2">
              The application couldn't display this page. You can try again.
            </p>
          </div>

          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Try again
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
