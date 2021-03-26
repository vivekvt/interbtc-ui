import { useState, useEffect, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Big from 'big.js';

import { PAGES } from 'utils/constants/links';
import DashboardCard from 'pages/dashboard/DashboardCard';
import usePolkabtcStats from 'common/hooks/use-polkabtc-stats';
import ButtonComponent from './button-component';
import { getAccents } from '../dashboardcolors';

// eslint-disable-next-line no-unused-vars
enum Status {
  // eslint-disable-next-line no-unused-vars
  Loading,
  // eslint-disable-next-line no-unused-vars
  Online,
  // eslint-disable-next-line no-unused-vars
  Offline,
  // eslint-disable-next-line no-unused-vars
  NoData,
}

type OracleStatusProps = {
  linkButton?: boolean;
};

const OracleStatus = ({ linkButton }: OracleStatusProps): ReactElement => {
  const statsApi = usePolkabtcStats();
  const { t } = useTranslation();
  // TODO: use translations for status
  const [oracleStatus, setOracleStatus] = useState(Status.Loading);
  const [exchangeRate, setExchangeRate] = useState('0');

  useEffect(() => {
    (async () => {
      try {
        const oracleStatus = (await statsApi.getLatestSubmission()).data;
        const exchangeRate = new Big(oracleStatus.exchangeRate);
        setExchangeRate(exchangeRate.toFixed(2));
        const status = oracleStatus.online ? Status.Online : Status.Offline;
        setOracleStatus(status);
      } catch (error) {
        console.log('[OracleStatus useEffect] error.message => ', error.message);
        setOracleStatus(Status.NoData);
      }
    })();
  }, [statsApi]);

  return (
    <DashboardCard>
      <div className='card-top-content'>
        <div className='values-container'>
          <h1 className='bold-font'>
            {t('dashboard.oracles.oracles_are')}&nbsp;
            {oracleStatus === Status.Online ? (
              <span
                style={{ color: getAccents('d_green').color }}
                id='oracle-text'
                className='bold-font'>
                {t('dashboard.oracles.online')}
              </span>
            ) : oracleStatus === Status.Offline ? (
              <span
                style={{ color: getAccents('d_red').color }}
                id='oracle-text'
                className='bold-font'>
                {t('dashboard.oracles.offline')}
              </span>
            ) : (
              <span
                style={{ color: getAccents('d_grey').color }}
                id='oracle-text'
                className='bold-font'>
                {t('dashboard.oracles.loading')}
              </span>
            )}
          </h1>
        </div>
        {linkButton && (
          <div className='button-container'>
            <ButtonComponent
              buttonName='view oracles'
              propsButtonColor='d_green'
              buttonId='oracle-status'
              buttonLink={PAGES.ORACLES} />
          </div>
        )}
      </div>
      <div className='circle-container'>
        {oracleStatus === Status.Online ? (
          <div
            className='status-circle'
            style={{ borderColor: getAccents('d_green').color }}
            id='oracle-circle'>
            <h1
              className='h1-xl-text-center'
              style={{ color: getAccents('d_green').color }}
              id='oracle-circle-text'>
              {t('online')}
            </h1>
            <h2>{exchangeRate} DOT/BTC</h2>
          </div>
        ) : oracleStatus === Status.Offline ? (
          <div
            className='status-circle'
            style={{ borderColor: getAccents('d_red').color }}
            id='oracle-circle'>
            <h1
              className='h1-xl-text-center'
              style={{ color: getAccents('d_red').color }}
              id='oracle-circle-text'>
              {t('offline')}
            </h1>
            <h2>{exchangeRate} DOT/BTC</h2>
          </div>
        ) : oracleStatus === Status.NoData ? (
          <div
            className='status-circle'
            style={{ borderColor: getAccents('d_grey').color }}
            id='oracle-circle'>
            <h1
              className='h1-xl-text-center'
              style={{ color: getAccents('d_grey').color }}
              id='oracle-circle-text'>
              {t('no_data')}
            </h1>
            <h2>{exchangeRate} DOT/BTC</h2>
          </div>
        ) : (
          <div
            className='status-circle'
            style={{ borderColor: getAccents('d_grey').color }}
            id='oracle-circle'>
            <h1
              className='h1-xl-text-center'
              style={{ color: getAccents('d_grey').color }}
              id='oracle-circle-text'>
              {t('loading')}
            </h1>
            <h2>{exchangeRate} DOT/BTC</h2>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default OracleStatus;
