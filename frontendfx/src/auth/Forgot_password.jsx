import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Input } from '../components/Input';
import { AuthButton } from '../components/Authbuttonx';
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
    <div className="min-h-screen bg-duo-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-duo-green-600">
          Reset your password
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-duo-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center text-duo-green-600">
              Check your email for the password reset instructions.
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-duo-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    icon={Mail}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              {error && (
                <div className="text-duo-yellow-600 text-sm">{error}</div>
              )}
              <AuthButton loading={loading} className="bg-duo-green-500 hover:bg-duo-green-600 text-duo-white">
                Send reset instructions
              </AuthButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
