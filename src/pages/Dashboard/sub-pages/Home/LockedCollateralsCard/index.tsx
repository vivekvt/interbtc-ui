import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useErrorHandler, withErrorBoundary } from 'react-error-boundary';

import LineChart from '../../../LineChart';
import DashboardCard from '../../../cards/DashboardCard';
import Stats, { StatsDt, StatsDd, StatsRouterLink } from '../../../Stats';
import ErrorFallback from 'components/ErrorFallback';
import { COUNT_OF_DATES_FOR_CHART } from 'config/general';
import { RELAY_CHAIN_NATIVE_TOKEN, GOVERNANCE_TOKEN, CollateralToken } from 'config/relay-chains';
import { POLKADOT, KUSAMA } from 'utils/constants/relay-chain-names';
import { INTERLAY_DENIM, KINTSUGI_SUPERNOVA } from 'utils/constants/colors';
import { PAGES } from 'utils/constants/links';
import { getUsdAmount, displayMonetaryAmount } from 'common/utils/utils';
import { StoreType } from 'common/types/util.types';
import useCumulativeCollateralVolumes from 'services/hooks/use-cumulative-collateral-volumes';

const LockedCollateralsCard = (): JSX.Element => {
  const { prices } = useSelector((state: StoreType) => state.general);
  const { t } = useTranslation();

  // ray test touch <
  const {
    isIdle: cumulativeRelayChainNativeTokenVolumesIdle,
    isLoading: cumulativeRelayChainNativeTokenVolumesLoading,
    data: cumulativeRelayChainNativeTokenVolumes,
    error: cumulativeRelayChainNativeTokenVolumesError
  } = useCumulativeCollateralVolumes(RELAY_CHAIN_NATIVE_TOKEN, COUNT_OF_DATES_FOR_CHART);
  useErrorHandler(cumulativeRelayChainNativeTokenVolumesError);

  const {
    isIdle: cumulativeGovernanceTokenVolumesIdle,
    isLoading: cumulativeGovernanceTokenVolumesLoading,
    data: cumulativeGovernanceTokenVolumes,
    error: cumulativeGovernanceTokenVolumesError
  } = useCumulativeCollateralVolumes(GOVERNANCE_TOKEN as CollateralToken, COUNT_OF_DATES_FOR_CHART);
  useErrorHandler(cumulativeGovernanceTokenVolumesError);
  // ray test touch >

  const renderContent = () => {
    // TODO: should use skeleton loaders
    if (
      cumulativeRelayChainNativeTokenVolumesIdle ||
      cumulativeRelayChainNativeTokenVolumesLoading ||
      // ray test touch <
      cumulativeGovernanceTokenVolumesIdle ||
      cumulativeGovernanceTokenVolumesLoading
      // ray test touch >
    ) {
      return <>Loading...</>;
    }
    if (
      cumulativeRelayChainNativeTokenVolumes === undefined ||
      // ray test touch <
      cumulativeGovernanceTokenVolumes === undefined
      // ray test touch >
    ) {
      throw new Error('Something went wrong!');
    }
    // ray test touch <
    console.log('ray : ***** cumulativeRelayChainNativeTokenVolumes => ', cumulativeRelayChainNativeTokenVolumes);
    // ray test touch >

    // ray test touch <
    const totalLockedRelayChainNativeTokenAmount = cumulativeRelayChainNativeTokenVolumes.slice(-1)[0].amount;
    const totalLockedRelayChainNativeTokenValueInUSD = Number(getUsdAmount(totalLockedRelayChainNativeTokenAmount, prices.collateralToken?.usd));

    const totalLockedGovernanceTokenAmount = cumulativeGovernanceTokenVolumes.slice(-1)[0].amount;
    const totalLockedGovernanceTokenValueInUSD = Number(getUsdAmount(totalLockedGovernanceTokenAmount, prices.governanceToken?.usd));

    const totalLockedCollateralValueInUSD =
      totalLockedRelayChainNativeTokenValueInUSD +
      totalLockedGovernanceTokenValueInUSD;
    // ray test touch >

    let chartLineColor;
    if (process.env.REACT_APP_RELAY_CHAIN_NAME === POLKADOT) {
      chartLineColor = INTERLAY_DENIM[500];
      // MEMO: should check dark mode as well
    } else if (process.env.REACT_APP_RELAY_CHAIN_NAME === KUSAMA) {
      chartLineColor = KINTSUGI_SUPERNOVA[500];
    } else {
      throw new Error('Something went wrong!');
    }

    return (
      <>
        <Stats
          leftPart={
            <>
              <StatsDt>{t('dashboard.vault.locked_collateral')}</StatsDt>
              <StatsDd>${totalLockedCollateralValueInUSD}</StatsDd>
            </>
          }
          rightPart={<StatsRouterLink to={PAGES.DASHBOARD_VAULTS}>View vaults</StatsRouterLink>}
        />
        <LineChart
          wrapperClassName='h-full'
          colors={[chartLineColor]}
          labels={[t('dashboard.vault.total_collateral_locked')]}
          yLabels={
            // ray test touch <
            cumulativeRelayChainNativeTokenVolumes
              .slice(0, -1)
              .map((item) => item.tillTimestamp.toISOString().substring(0, 10))
            // ray test touch >
          }
          yAxes={[
            {
              ticks: {
                beginAtZero: true,
                precision: 0
              }
            }
          ]}
          datasets={[
            // ray test touch <
            cumulativeRelayChainNativeTokenVolumes.slice(1).map((item) => displayMonetaryAmount(item.amount))
            // ray test touch >
          ]}
        />
      </>
    );
  };

  return <DashboardCard>{renderContent()}</DashboardCard>;
};

export default withErrorBoundary(LockedCollateralsCard, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});