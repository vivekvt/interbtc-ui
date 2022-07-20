import { useQuery, UseQueryResult } from 'react-query';
import { useSelector } from 'react-redux';
import { CurrencyUnit, ChainBalance } from '@interlay/interbtc-api';
import { Currency } from '@interlay/monetary-js';

// ray test touch <<
import { GOVERNANCE_TOKEN } from 'config/relay-chains';
// ray test touch >>
import useAccountId from 'utils/hooks/use-account-id';
import genericFetcher, { GENERIC_FETCHER } from 'services/fetchers/generic-fetcher';
import { StoreType } from 'common/types/util.types';

// ray test touch <<
type ChainTokenBalance = ChainBalance<CurrencyUnit>;

type UseTokenBalance = UseQueryResult<ChainTokenBalance, Error>;
// ray test touch >>

// `D` stands for Decimals
const useTokenBalance = <D extends CurrencyUnit>(
  token: Currency<D>,
  accountAddress: string | undefined
): UseTokenBalance => {
  const { bridgeLoaded } = useSelector((state: StoreType) => state.general);

  const accountId = useAccountId(accountAddress);

  return useQuery<ChainTokenBalance, Error>(
    [GENERIC_FETCHER, 'tokens', 'balance', token, accountId],
    genericFetcher<ChainTokenBalance>(),
    {
      enabled: !!bridgeLoaded && !!accountId
    }
  );
};

// ray test touch <<
const useGovernanceTokenBalance = (accountAddress?: string): UseTokenBalance => {
  return useTokenBalance(GOVERNANCE_TOKEN, accountAddress);
};

export { useGovernanceTokenBalance };
// ray test touch >>

export default useTokenBalance;
