import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useErrorHandler, withErrorBoundary } from 'react-error-boundary';

import LineChart from 'pages/Dashboard/LineChart';
import DashboardCard from 'pages/Dashboard/cards/DashboardCard';
import Stats, { StatsDt, StatsDd } from 'pages/Dashboard/Stats';
import ErrorFallback from 'components/ErrorFallback';
import { COUNT_OF_DATES_FOR_CHART } from 'config/general';
import { CollateralToken } from 'config/relay-chains';
import { POLKADOT, KUSAMA } from 'utils/constants/relay-chain-names';
import { INTERLAY_DENIM, KINTSUGI_SUPERNOVA } from 'utils/constants/colors';
import { getUsdAmount, displayMonetaryAmount } from 'common/utils/utils';
import { StoreType } from 'common/types/util.types';
import useCumulativeCollateralVolumes from 'services/hooks/use-cumulative-collateral-volumes';

interface Props {
  collateralToken: CollateralToken;
  collateralTokenSymbol: string;
}

const LockedCollateralCard = ({
  collateralToken,
  collateralTokenSymbol
}: Props): JSX.Element => {
  const { prices } = useSelector((state: StoreType) => state.general);
  const { t } = useTranslation();

  const {
    isIdle: cumulativeVolumesIdle,
    isLoading: cumulativeVolumesLoading,
    data: cumulativeVolumes,
    error: cumulativeVolumesError
  } = useCumulativeCollateralVolumes(collateralToken, COUNT_OF_DATES_FOR_CHART);
  useErrorHandler(cumulativeVolumesError);

  const renderContent = () => {
    // TODO: should use skeleton loaders
    if (cumulativeVolumesIdle || cumulativeVolumesLoading) {
      return <>Loading...</>;
    }
    if (cumulativeVolumes === undefined) {
      throw new Error('Something went wrong!');
    }
    const totalLockedCollateralTokenAmount = cumulativeVolumes.slice(-1)[0].amount;

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
              <StatsDd>
                {displayMonetaryAmount(totalLockedCollateralTokenAmount)} {collateralTokenSymbol}
              </StatsDd>
              <StatsDd>${getUsdAmount(totalLockedCollateralTokenAmount, prices.collateralToken?.usd)}</StatsDd>
            </>
          }
        />
        <LineChart
          wrapperClassName='h-full'
          colors={[chartLineColor]}
          labels={[t('dashboard.vault.total_collateral_locked')]}
          yLabels={cumulativeVolumes
            .slice(0, -1)
            .map((dataPoint) => dataPoint.tillTimestamp.toISOString().substring(0, 10))}
          yAxes={[
            {
              ticks: {
                beginAtZero: true,
                precision: 0
              }
            }
          ]}
          datasets={[cumulativeVolumes.slice(1).map((dataPoint) => displayMonetaryAmount(dataPoint.amount))]}
        />
      </>
    );
  };

  return <DashboardCard>{renderContent()}</DashboardCard>;
};

export default withErrorBoundary(LockedCollateralCard, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});
