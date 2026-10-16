import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function LanguagePage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const pick = (lng) => {
    i18n.changeLanguage(lng);
    navigate(user?.role === 'employer' ? '/employer' : '/worker');
  };
  return (
    <div className="w-full max-w-md card">
      <h1 className="text-2xl font-extrabold text-center">{t('auth.chooseLanguage')}</h1>
      <div className="mt-6 space-y-3">
        <button className="btn-secondary w-full !justify-start" onClick={() => pick('hi')}>हिंदी</button>
        <button className="btn-secondary w-full !justify-start" onClick={() => pick('bho')}>भोजपुरी</button>
        <button className="btn-secondary w-full !justify-start" onClick={() => pick('en')}>English</button>
      </div>
    </div>
  );
}