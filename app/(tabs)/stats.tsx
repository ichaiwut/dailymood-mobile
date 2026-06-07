import { useTranslation } from 'react-i18next';
import { ComingSoon } from '../../src/components/ComingSoon';

export default function StatsScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('tabs.stats')} milestone="Milestone 4" />;
}
