


export const AuthButton = ({ children, loading, ...props }) => (
  <button
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    disabled={loading}
    {...props}
  >
    {loading ? (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
    ) : (
      children
    )}
  </button>
);