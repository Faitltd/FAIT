interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);