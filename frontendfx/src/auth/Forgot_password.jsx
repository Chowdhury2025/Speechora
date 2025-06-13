import { useState } from 'react';
import { Mail } from 'lucide-react';

import { API_URL } from '../config';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          frontendUrl: window.location.origin 
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccess(true); // Show success message on success
    } catch (err) {
      setError(err.message); // Show error message on failure
    } finally {
      setLoading(false); // Reset loading state after request is complete
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-primary">
          Reset your password
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {success ? (
            <div className="text-center text-primary font-bold">
              Check your email for the password reset instructions.
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-slate-600">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-error-bg text-error-text text-sm p-4 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl border-b-4 border-primary-dark hover:border-primary-pressed disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 active:mt-1 transition-all duration-200"
                >
                  {loading ? 'Sending instructions...' : 'Send reset instructions'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <a
                  href="/login"
                  className="text-sm font-bold text-secondary hover:text-secondary-hover"
                >
                  Back to login
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
