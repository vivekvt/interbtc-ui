
import clsx from 'clsx';

import InterlayInput from 'components/UI/InterlayInput';
import InterlayRoseContainedButton from 'components/buttons/InterlayRoseContainedButton';

interface Props {
  endpoint: string;
}

// TODO: should add validation & UX
const SubscribeForm = ({ endpoint }: Props): JSX.Element => (
  <div id='mc_embed_signup'>
    <form
      action={endpoint}
      method='post'
      id='mc-embedded-subscribe-form'
      name='mc-embedded-subscribe-form'
      target='_blank'
      noValidate>
      <div id='mc_embed_signup_scroll'>
        <div
          className={clsx(
            'flex',
            'w-full',
            'max-w-sm',
            'space-x-3'
          )}>
          <InterlayInput
            placeholder='your@email.com'
            id='mce-EMAIL'
            type='email'
            name='EMAIL' />
          <InterlayRoseContainedButton
            type='submit'
            id='mc-embedded-subscribe'>
            SUBSCRIBE
          </InterlayRoseContainedButton>
        </div>
        {/* Do not remove this */}
        {/* Protection from bots */}
        <input
          type='text'
          name='b_4c3c3f21d3ec4c3ed94ea7353_ad217abce9'
          tabIndex={-1}
          defaultValue=''
          hidden
          aria-hidden='true' />
      </div>
    </form>
  </div>
);

export default SubscribeForm;
