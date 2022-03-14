
import * as React from 'react';

import ChainSelector, { ChainOption } from './ChainSelector';
import {
  RelayChainLogoIcon,
  BridgeParachainLogoIcon,
  RELAY_CHAIN_NAME,
  BRIDGE_PARACHAIN_NAME
} from 'config/relay-chains';
import { ChainType } from 'common/types/chains.types';

const CHAIN_OPTIONS: Array<ChainOption> = [
  {
    type: ChainType.RelayChain,
    name: RELAY_CHAIN_NAME,
    icon: <RelayChainLogoIcon height={46} />
  },
  {
    type: ChainType.Parachain,
    name: BRIDGE_PARACHAIN_NAME,
    icon: <BridgeParachainLogoIcon height={46} />
  }
];

// TODO: This is only required for supporting kusama -> kintsugi transfer only.
// This will be handled in the XCM form when kintsugi -> kusama implemented.
const RELAY_CHAIN_ONLY = CHAIN_OPTIONS.filter(chain => chain.type === ChainType.RelayChain);
const PARACHAIN_ONLY = CHAIN_OPTIONS.filter(chain => chain.type === ChainType.Parachain);

interface Props {
  label: string;
  callbackFunction?: (chain: ChainOption) => void;
  defaultChain: ChainType;
}

const getChain = (type: ChainType): ChainOption | undefined => CHAIN_OPTIONS.find(chain => chain.type === type);

const Chains = ({
  callbackFunction,
  label,
  defaultChain
}: Props): JSX.Element => {
  const [selectedChain, setSelectedChain] = React.useState<ChainOption | undefined>(getChain(defaultChain));

  React.useEffect(() => {
    if (!callbackFunction) return;
    if (!selectedChain) return;

    callbackFunction(selectedChain);
  }, [
    selectedChain,
    callbackFunction
  ]);

  return (
    <>
      {selectedChain && (
        <ChainSelector
          label={label}
          chainOptions={defaultChain === ChainType.Parachain ? PARACHAIN_ONLY : RELAY_CHAIN_ONLY}
          selectedChain={selectedChain}
          onChange={setSelectedChain} />
      )}
    </>
  );
};

export type { ChainOption };

export {
  CHAIN_OPTIONS,
  getChain
};

export default Chains;
