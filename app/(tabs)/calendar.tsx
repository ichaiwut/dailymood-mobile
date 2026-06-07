import { useTranslation } from 'react-i18next';
import { ComingSoon } from '../../src/components/ComingSoon';

export default function CalendarScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('tabs.calendar')} milestone="Milestone 3" />;
}
