import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../constants';

export default function LoginPage() {
  const { signInWithMicrosoft } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 sm:p-10"
      style={{
        background: `linear-gradient(135deg, ${BRAND.orange} 0%, #ff9f2a 100%)`,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logo-login.png"
            alt="Tristar PT Flowsheets"
            className="h-20 sm:h-24 mx-auto mb-4"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            PT Flowsheets
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Physical Therapy Patient Management
          </p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={signInWithMicrosoft}
          className="w-full py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90 mb-4"
          style={{ backgroundColor: BRAND.orange }}
        >
          Sign in with Microsoft
        </button>

        {/* Note */}
        <p className="text-xs text-gray-600">
          Sign in with your Tristar Microsoft 365 account
        </p>
      </div>
    </div>
  );
}
