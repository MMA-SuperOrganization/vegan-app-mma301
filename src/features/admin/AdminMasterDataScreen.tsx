import { CustomHeader, ScreenWrapper } from '@/components';
import { useTranslation } from '@/i18n';
import { spacing, webLayout } from '@/theme';
import { MasterDataPanel } from './MasterDataPanel';
export function AdminMasterDataScreen() { const { t } = useTranslation(); return <ScreenWrapper webMaxWidth={webLayout.catalogMaxWidth} scrollable contentContainerStyle={{ padding: spacing.xl }} header={<CustomHeader title={t('admin.master.title')} showBack={false} />}><MasterDataPanel /></ScreenWrapper>; }
