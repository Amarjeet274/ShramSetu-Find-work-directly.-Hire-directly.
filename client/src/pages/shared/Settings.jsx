import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function Settings() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <div className="card">
        <label className="label">Language</label>
        <LanguageSwitcher />
      </div>
      <div className="card space-y-2">
        <p className="font-bold">Account</p>
        <button className="btn-ghost w-full !justify-start">Security</button>
        <button className="btn-ghost w-full !justify-start">Privacy</button>
        <button className="btn-ghost w-full !justify-start">Notifications</button>
      </div>
    </div>
  );
}