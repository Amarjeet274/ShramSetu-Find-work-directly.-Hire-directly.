import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ChooseRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-md card">
      <h1 className="text-2xl font-extrabold text-center">{t('auth.chooseRole')}</h1>
      <div className="mt-6 space-y-3">
        <button className="btn-primary w-full !justify-start text-lg" onClick={() => navigate('/auth?role=worker')}>
          👷 {t('auth.worker')}
        </button>
        <button className="btn-secondary w-full !justify-start text-lg" onClick={() => navigate('/auth?role=employer')}>
          🧑‍💼 {t('auth.employer')}
        </button>
      </div>
    </div>
  );
}