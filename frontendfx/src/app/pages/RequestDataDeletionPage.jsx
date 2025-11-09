import React from 'react';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';

const RequestDataDeletionPage = () => {
  const user = useRecoilValue(userStates);
  const userEmail = user?.email || '';

  const supportEmail = 'support@speechora.com'; // <-- replace with real support email

  const mailtoSubject = encodeURIComponent('Data deletion request');
  const mailtoBody = encodeURIComponent(
    `Hello,

I would like to request deletion of my personal data associated with this account.${userEmail ? `\n\nUser email: ${userEmail}` : ''}

Please confirm once deletion is complete.

Thank you.`
  );

  const mailtoLink = `mailto:${supportEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Request data deletion</h2>
      <p className="text-sm text-gray-600 mb-4">
        As required by the Play Store data deletion policy, you can request that we delete all personal data
        associated with your account. You can submit the request via email using the button below. If you're
        logged in, your email will be included in the draft to help us locate your account faster.
      </p>

      <div className="space-y-3">
        <a
          href={mailtoLink}
          className="inline-block bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-2 px-4 rounded"
        >
          Request data deletion via email
        </a>

        <div className="text-xs text-gray-500">
          Support email: <span className="font-mono">{supportEmail}</span>
        </div>

        <div className="pt-4 text-sm text-gray-700">
          If you'd prefer, you can also contact support directly from the app store listing or from your
          account settings. After we receive your request we'll confirm by email and complete deletion within
          a reasonable timeframe.
        </div>
      </div>
    </div>
  );
};

export default RequestDataDeletionPage;
