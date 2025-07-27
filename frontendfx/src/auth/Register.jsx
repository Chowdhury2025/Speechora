/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { colorGuide, componentStyles } from '../theme/colors';
import AuthLayout from './AuthLayout';

export const countryCodes = [
  { code: '+93',   name: 'Afghanistan' },
  { code: '+355',  name: 'Albania' },
  { code: '+213',  name: 'Algeria' },
  { code: '+1',    name: 'American Samoa' },
  { code: '+376',  name: 'Andorra' },
  { code: '+244',  name: 'Angola' },
  { code: '+1',    name: 'Anguilla' },
  { code: '+1',    name: 'Antigua & Barbuda' },
  { code: '+54',   name: 'Argentina' },
  { code: '+374',  name: 'Armenia' },
  { code: '+297',  name: 'Aruba' },
  { code: '+61',   name: 'Australia' },
  { code: '+43',   name: 'Austria' },
  { code: '+994',  name: 'Azerbaijan' },
  { code: '+1',    name: 'Bahamas' },
  { code: '+973',  name: 'Bahrain' },
  { code: '+880',  name: 'Bangladesh' },
  { code: '+1',    name: 'Barbados' },
  { code: '+375',  name: 'Belarus' },
  { code: '+32',   name: 'Belgium' },
  { code: '+501',  name: 'Belize' },
  { code: '+229',  name: 'Benin' },
  { code: '+1',    name: 'Bermuda' },
  { code: '+975',  name: 'Bhutan' },
  { code: '+591',  name: 'Bolivia' },
  { code: '+387',  name: 'Bosnia & Herzegovina' },
  { code: '+267',  name: 'Botswana' },
  { code: '+55',   name: 'Brazil' },
  { code: '+246',  name: 'British Indian Ocean Territory' },
  { code: '+1',    name: 'British Virgin Islands' },
  { code: '+673',  name: 'Brunei' },
  { code: '+359',  name: 'Bulgaria' },
  { code: '+226',  name: 'Burkina Faso' },
  { code: '+257',  name: 'Burundi' },
  { code: '+855',  name: 'Cambodia' },
  { code: '+237',  name: 'Cameroon' },
  { code: '+1',    name: 'Canada' },
  { code: '+238',  name: 'Cape Verde' },
  { code: '+1',    name: 'Cayman Islands' },
  { code: '+236',  name: 'Central African Republic' },
  { code: '+235',  name: 'Chad' },
  { code: '+56',   name: 'Chile' },
  { code: '+86',   name: 'China' },
  { code: '+61',   name: 'Christmas Island' },
  { code: '+61',   name: 'Cocos (Keeling) Islands' },
  { code: '+57',   name: 'Colombia' },
  { code: '+269',  name: 'Comoros' },
  { code: '+242',  name: 'Congo - Brazzaville' },
  { code: '+243',  name: 'Congo - Kinshasa' },
  { code: '+682',  name: 'Cook Islands' },
  { code: '+506',  name: 'Costa Rica' },
  { code: '+385',  name: 'Croatia' },
  { code: '+53',   name: 'Cuba' },
  { code: '+599',  name: 'Curaçao' },
  { code: '+357',  name: 'Cyprus' },
  { code: '+420',  name: 'Czech Republic' },
  { code: '+45',   name: 'Denmark' },
  { code: '+253',  name: 'Djibouti' },
  { code: '+1',    name: 'Dominica' },
  { code: '+1',    name: 'Dominican Republic' },
  { code: '+593',  name: 'Ecuador' },
  { code: '+20',   name: 'Egypt' },
  { code: '+503',  name: 'El Salvador' },
  { code: '+240',  name: 'Equatorial Guinea' },
  { code: '+291',  name: 'Eritrea' },
  { code: '+372',  name: 'Estonia' },
  { code: '+251',  name: 'Ethiopia' },
  { code: '+500',  name: 'Falkland Islands' },
  { code: '+298',  name: 'Faroe Islands' },
  { code: '+679',  name: 'Fiji' },
  { code: '+358',  name: 'Finland' },
  { code: '+33',   name: 'France' },
  { code: '+594',  name: 'French Guiana' },
  { code: '+689',  name: 'French Polynesia' },
  { code: '+241',  name: 'Gabon' },
  { code: '+220',  name: 'Gambia' },
  { code: '+995',  name: 'Georgia' },
  { code: '+49',   name: 'Germany' },
  { code: '+233',  name: 'Ghana' },
  { code: '+350',  name: 'Gibraltar' },
  { code: '+30',   name: 'Greece' },
  { code: '+299',  name: 'Greenland' },
  { code: '+1',    name: 'Grenada' },
  { code: '+590',  name: 'Guadeloupe' },
  { code: '+1',    name: 'Guam' },
  { code: '+502',  name: 'Guatemala' },
  { code: '+44',   name: 'Guernsey' },
  { code: '+224',  name: 'Guinea' },
  { code: '+245',  name: 'Guinea-Bissau' },
  { code: '+592',  name: 'Guyana' },
  { code: '+509',  name: 'Haiti' },
  { code: '+504',  name: 'Honduras' },
  { code: '+852',  name: 'Hong Kong SAR China' },
  { code: '+36',   name: 'Hungary' },
  { code: '+354',  name: 'Iceland' },
  { code: '+91',   name: 'India' },
  { code: '+62',   name: 'Indonesia' },
  { code: '+98',   name: 'Iran' },
  { code: '+964',  name: 'Iraq' },
  { code: '+353',  name: 'Ireland' },
  { code: '+44',   name: 'Isle of Man' },
  { code: '+972',  name: 'Israel' },
  { code: '+39',   name: 'Italy' },
  { code: '+1',    name: 'Jamaica' },
  { code: '+81',   name: 'Japan' },
  { code: '+44',   name: 'Jersey' },
  { code: '+962',  name: 'Jordan' },
  { code: '+7',    name: 'Kazakhstan' },
  { code: '+254',  name: 'Kenya' },
  { code: '+686',  name: 'Kiribati' },
  { code: '+383',  name: 'Kosovo' },
  { code: '+965',  name: 'Kuwait' },
  { code: '+996',  name: 'Kyrgyzstan' },
  { code: '+856',  name: 'Laos' },
  { code: '+371',  name: 'Latvia' },
  { code: '+961',  name: 'Lebanon' },
  { code: '+266',  name: 'Lesotho' },
  { code: '+231',  name: 'Liberia' },
  { code: '+218',  name: 'Libya' },
  { code: '+423',  name: 'Liechtenstein' },
  { code: '+370',  name: 'Lithuania' },
  { code: '+352',  name: 'Luxembourg' },
  { code: '+853',  name: 'Macau SAR China' },
  { code: '+389',  name: 'North Macedonia' },
  { code: '+261',  name: 'Madagascar' },
  { code: '+265',  name: 'Malawi' },
  { code: '+60',   name: 'Malaysia' },
  { code: '+960',  name: 'Maldives' },
  { code: '+223',  name: 'Mali' },
  { code: '+356',  name: 'Malta' },
  { code: '+692',  name: 'Marshall Islands' },
  { code: '+596',  name: 'Martinique' },
  { code: '+222',  name: 'Mauritania' },
  { code: '+230',  name: 'Mauritius' },
  { code: '+52',   name: 'Mexico' },
  { code: '+691',  name: 'Micronesia' },
  { code: '+373',  name: 'Moldova' },
  { code: '+377',  name: 'Monaco' },
  { code: '+976',  name: 'Mongolia' },
  { code: '+382',  name: 'Montenegro' },
  { code: '+1',    name: 'Montserrat' },
  { code: '+212',  name: 'Morocco' },
  { code: '+258',  name: 'Mozambique' },
  { code: '+95',   name: 'Myanmar (Burma)' },
  { code: '+264',  name: 'Namibia' },
  { code: '+674',  name: 'Nauru' },
  { code: '+977',  name: 'Nepal' },
  { code: '+31',   name: 'Netherlands' },
  { code: '+687',  name: 'New Caledonia' },
  { code: '+64',   name: 'New Zealand' },
  { code: '+505',  name: 'Nicaragua' },
  { code: '+227',  name: 'Niger' },
  { code: '+234',  name: 'Nigeria' },
  { code: '+683',  name: 'Niue' },
  { code: '+850',  name: 'North Korea' },
  { code: '+47',   name: 'Norway' },
  { code: '+968',  name: 'Oman' },
  { code: '+92',   name: 'Pakistan' },
  { code: '+680',  name: 'Palau' },
  { code: '+970',  name: 'Palestine' },
  { code: '+507',  name: 'Panama' },
  { code: '+675',  name: 'Papua New Guinea' },
  { code: '+595',  name: 'Paraguay' },
  { code: '+51',   name: 'Peru' },
  { code: '+63',   name: 'Philippines' },
  { code: '+48',   name: 'Poland' },
  { code: '+351',  name: 'Portugal' },
  { code: '+1',    name: 'Puerto Rico' },
  { code: '+974',  name: 'Qatar' },
  { code: '+262',  name: 'Réunion' },
  { code: '+40',   name: 'Romania' },
  { code: '+7',    name: 'Russia' },
  { code: '+250',  name: 'Rwanda' },
  { code: '+590',  name: 'Saint Barthélemy' },
  { code: '+290',  name: 'Saint Helena' },
  { code: '+1',    name: 'Saint Kitts & Nevis' },
  { code: '+1',    name: 'Saint Lucia' },
  { code: '+508',  name: 'Saint Pierre & Miquelon' },
  { code: '+1',    name: 'Saint Vincent & Grenadines' },
  { code: '+685',  name: 'Samoa' },
  { code: '+378',  name: 'San Marino' },
  { code: '+239',  name: 'São Tomé & Príncipe' },
  { code: '+966',  name: 'Saudi Arabia' },
  { code: '+221',  name: 'Senegal' },
  { code: '+381',  name: 'Serbia' },
  { code: '+248',  name: 'Seychelles' },
  { code: '+232',  name: 'Sierra Leone' },
  { code: '+65',   name: 'Singapore' },
  { code: '+421',  name: 'Slovakia' },
  { code: '+386',  name: 'Slovenia' },
  { code: '+677',  name: 'Solomon Islands' },
  { code: '+252',  name: 'Somalia' },
  { code: '+27',   name: 'South Africa' },
  { code: '+82',   name: 'South Korea' },
  { code: '+211',  name: 'South Sudan' },
  { code: '+34',   name: 'Spain' },
  { code: '+94',   name: 'Sri Lanka' },
  { code: '+1',    name: 'St. Martin' },
  { code: '+249',  name: 'Sudan' },
  { code: '+597',  name: 'Suriname' },
  { code: '+47',   name: 'Svalbard & Jan Mayen' },
  { code: '+268',  name: 'Swaziland' },
  { code: '+46',   name: 'Sweden' },
  { code: '+41',   name: 'Switzerland' },
  { code: '+963',  name: 'Syria' },
  { code: '+886',  name: 'Taiwan' },
  { code: '+992',  name: 'Tajikistan' },
  { code: '+255',  name: 'Tanzania' },
  { code: '+66',   name: 'Thailand' },
  { code: '+670',  name: 'Timor-Leste' },
  { code: '+228',  name: 'Togo' },
  { code: '+690',  name: 'Tokelau' },
  { code: '+676',  name: 'Tonga' },
  { code: '+1',    name: 'Trinidad & Tobago' },
  { code: '+216',  name: 'Tunisia' },
  { code: '+90',   name: 'Turkey' },
  { code: '+993',  name: 'Turkmenistan' },
  { code: '+1',    name: 'Turks & Caicos Islands' },
  { code: '+688',  name: 'Tuvalu' },
  { code: '+1',    name: 'U.S. Virgin Islands' },
  { code: '+256',  name: 'Uganda' },
  { code: '+380',  name: 'Ukraine' },
  { code: '+971',  name: 'United Arab Emirates' },
  { code: '+44',   name: 'United Kingdom' },
  { code: '+1',    name: 'United States' },
  { code: '+598',  name: 'Uruguay' },
  { code: '+998',  name: 'Uzbekistan' },
  { code: '+678',  name: 'Vanuatu' },
  { code: '+379',  name: 'Vatican City' },
  { code: '+58',   name: 'Venezuela' },
  { code: '+84',   name: 'Vietnam' },
  { code: '+681',  name: 'Wallis & Futuna' },
  { code: '+212',  name: 'Western Sahara' },
  { code: '+967',  name: 'Yemen' },
  { code: '+263',  name: 'Zimbabwe' },
  { code: '+260',  name: 'Zambia' },
];


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    countryCode: '+260',
    phoneNumber: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { countryCode, phoneNumber, username, email, password, role } = formData;
      const fullPhone = `${countryCode}${phoneNumber}`;

      const response = await axios.post(`${API_URL}/api/user/register`, {
        username,
        email,
        password,
        phoneNumber: fullPhone,
        role,
        frontendUrl: window.location.origin
      });

      setSuccess(response.data?.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`min-h-screen ${colorGuide.neutral.bgPage} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${colorGuide.neutral.textPrimary}`}>
            Create your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`${colorGuide.neutral.bgCard} py-8 px-4 ${componentStyles.card.base} sm:px-10`}>
            {error && (
              <div className={`${colorGuide.status.error.bg} ${colorGuide.status.error.text} p-4 rounded-md mb-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className={`${colorGuide.status.success.bg} ${colorGuide.status.success.text} p-4 rounded-md mb-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Country Code Selector */}
              <div>
                <label htmlFor="countryCode" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Country Code
                </label>
                <select
                  id="countryCode"
                  name="countryCode"
                  required
                  disabled={isLoading}
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                >
                  {countryCodes.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number with sticky prefix */}
<div>
  <label htmlFor="phoneNumber" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
    Phone Number
  </label>
  <div className="mt-1 relative">
    {/* Prefix */}
    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-medium text-slate-600 pointer-events-none">
      {formData.countryCode}
    </span>
    {/* User types here */}
    <input
      id="phoneNumber"
      name="phoneNumber"
      type="tel"
      autoComplete="tel"
      required
      disabled={isLoading}
      className="w-full pl-[calc(3rem+1px)] pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
      placeholder="Enter local number"
      value={formData.phoneNumber}
      onChange={handleChange}
    />
  </div>
</div>


              {/* Username */}
              <div>
                <label htmlFor="username" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email-address" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${componentStyles.button.primary}`}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${colorGuide.neutral.border}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${colorGuide.neutral.bgCard} ${colorGuide.neutral.textSecondary}`}>
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <Link
                  to="/login"
                  className={`font-medium ${colorGuide.primary.text} ${colorGuide.primary.hover}`}
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
