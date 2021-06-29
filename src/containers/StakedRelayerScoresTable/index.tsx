
// TODO: should type properly
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  useMemo,
  useEffect,
  useState
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  useTable,
  useSortBy,
  useFilters,
  useGlobalFilter
} from 'react-table';
import clsx from 'clsx';
import {
  useErrorHandler,
  withErrorBoundary
} from 'react-error-boundary';
import { RelayerData } from '@interlay/interbtc-stats-client';

import EllipsisLoader from 'components/EllipsisLoader';
import ErrorFallback from 'components/ErrorFallback';
import InterlayTable, {
  InterlayTableContainer,
  InterlayThead,
  InterlayTbody,
  InterlayTr,
  InterlayTh,
  InterlayTd
} from 'components/UI/InterlayTable';
import DefaultColumnFilter from 'components/UI/InterlayTable/DefaultColumnFilter';
import NumberRangeColumnFilter from 'components/UI/InterlayTable/NumberRangeColumnFilter';
import SortBy, { SortByContainer } from 'components/UI/InterlayTable/SortBy';
import usePolkabtcStats from 'common/hooks/use-polkabtc-stats';
import { StoreType } from 'common/types/util.types';
import STATUSES from 'utils/constants/statuses';

/**
 * TODO:
 * - Should exclude Interlay owned relayers.
 * - Should sort relayers with highest lifetime sla.
 */

interface Props {
  challengeTime: number;
}

interface PatchedRelayerData extends Omit<RelayerData, 'lifetimeSla'> {
  // eslint-disable-next-line camelcase
  lifetimeSla: string;
}

const StakedRelayerScoresTable = ({
  challengeTime
}: Props): JSX.Element => {
  const { polkaBtcLoaded } = useSelector((state: StoreType) => state.general);
  const statsApi = usePolkabtcStats();
  const [data, setData] = useState<(PatchedRelayerData)[]>([]);
  const [status, setStatus] = useState(STATUSES.IDLE);
  const handleError = useErrorHandler();
  const { t } = useTranslation();

  useEffect(() => {
    if (!polkaBtcLoaded) return;
    if (!statsApi) return;
    if (!handleError) return;

    (async () => {
      try {
        setStatus(STATUSES.PENDING);
        const response = await statsApi.getRelayers({ slaSince: challengeTime });
        const sortedStakedRelayers = response.sort((a, b) => b.lifetimeSla - a.lifetimeSla);
        const transformedStakedRelayers = sortedStakedRelayers.map(stakedRelayer => ({
          ...stakedRelayer,
          lifetimeSla: Number(stakedRelayer.lifetimeSla).toFixed(2)
        }));
        setStatus(STATUSES.RESOLVED);

        setData(transformedStakedRelayers);
      } catch (error) {
        setStatus(STATUSES.REJECTED);
        handleError(error);
      }
    })();
  }, [
    polkaBtcLoaded,
    challengeTime,
    statsApi,
    handleError
  ]);

  const columns = useMemo(
    () => [
      {
        Header: t('leaderboard.account_id'),
        accessor: 'id',
        Filter: DefaultColumnFilter,
        classNames: [
          'text-left'
        ]
      },
      {
        Header: t('leaderboard.block_count'),
        accessor: 'blockCount',
        classNames: [
          'text-right'
        ]
      },
      {
        Header: t('leaderboard.lifetimeSla'),
        accessor: 'lifetimeSla',
        Filter: NumberRangeColumnFilter,
        filter: 'between',
        classNames: [
          'text-right'
        ]
      }
    ],
    [t]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  if (status === STATUSES.IDLE || status === STATUSES.PENDING) {
    return (
      <div
        className={clsx(
          'flex',
          'justify-center'
        )}>
        <EllipsisLoader dotClassName='bg-interlayTreePoppy-400' />
      </div>
    );
  }

  if (status === STATUSES.RESOLVED) {
    return (
      <InterlayTableContainer>
        <InterlayTable {...getTableProps()}>
          <InterlayThead>
            {headerGroups.map(headerGroup => (
              // eslint-disable-next-line react/jsx-key
              <InterlayTr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  // eslint-disable-next-line react/jsx-key
                  <InterlayTh
                    {...column.getHeaderProps([
                      {
                        className: clsx(column.classNames),
                        style: column.style
                      },
                      column.getSortByToggleProps()
                    ])}>
                    <SortByContainer>
                      <span>{column.render('Header')}</span>
                      <SortBy
                        isSorted={column.isSorted}
                        isSortedDesc={column.isSortedDesc} />
                    </SortByContainer>
                    {column.canFilter && column.Filter && (
                      <div>{column.render('Filter', { placeholder: 'Search by Account ID' })}</div>
                    )}
                  </InterlayTh>
                ))}
              </InterlayTr>
            ))}
          </InterlayThead>
          <InterlayTbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);

              return (
                // eslint-disable-next-line react/jsx-key
                <InterlayTr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <InterlayTd
                        {...cell.getCellProps([
                          {
                            className: clsx(cell.column.classNames),
                            style: cell.column.style
                          }
                        ])}>
                        {cell.render('Cell')}
                      </InterlayTd>
                    );
                  })}
                </InterlayTr>
              );
            })}
          </InterlayTbody>
        </InterlayTable>
      </InterlayTableContainer>
    );
  }

  return null;
};

export default withErrorBoundary(StakedRelayerScoresTable, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});
