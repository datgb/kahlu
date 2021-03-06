'use strict';

import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import Button from 'kahlu/components/button';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Icon from 'kahlu/components/icon';
import VerificationBadge from 'kahlu/components/verification_badge';
import ProBadge from 'kahlu/components/pro_badge';
import DonorBadge from 'kahlu/components/donor_badge';
import InvestorBadge from 'kahlu/components/investor_badge';
import { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
});

const dateFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
};

class ProfileInfoPanel extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map,
    identity_proofs: ImmutablePropTypes.list,
    intl: PropTypes.object.isRequired,
    username: PropTypes.string,
  };

  render () {
    const { account, intl, identity_proofs, username } = this.props;

    if (!account) {
      return (
        <div className='profile-info-panel'>
          <div className='profile-info-panel__content'>
            <div className='profile-info-panel-content__name'>
              <h1>
                <span/>
                <small>@{username}</small>
              </h1>
            </div>
          </div>
        </div>
      );
    }

    const lockedIcon = account.get('locked') ? (<Icon id='lock' title={intl.formatMessage(messages.account_locked)} />) : '';
    const badge = account.get('bot') ? (<div className='account-role bot'><FormattedMessage id='account.badges.bot' defaultMessage='Bot' /></div>) : null;
    const content = { __html: account.get('note_emojified') };
    const fields = account.get('fields');
    const acct = account.get('acct');
    const displayNameHtml = { __html: account.get('display_name_html') };
    const memberSinceDate = intl.formatDate(account.get('created_at'), { month: 'long', year: 'numeric' });

    return (
      <div className='profile-info-panel'>
        <div className='profile-info-panel__content'>

          <div className='profile-info-panel-content__name'>
            <h1>
              <span dangerouslySetInnerHTML={displayNameHtml} />
                {account.get('is_verified') && <VerificationBadge />}
                {badge}
              <small>@{acct} {lockedIcon}</small>
            </h1>
          </div>

          <div className='profile-info-panel-content__badges'>
            {account.get('is_pro') && <ProBadge />}
            {account.get('is_donor') && <DonorBadge />}
            {account.get('is_investor') && <InvestorBadge />}
            <div className='profile-info-panel-content__badges__join-date'>
              <Icon id="calendar"/>
              <FormattedMessage id='account.member_since' defaultMessage='Member since {date}' values={{
                date: memberSinceDate
              }} />
            </div>
          </div>

          {
            (account.get('note').length > 0 && account.get('note') !== '<p></p>') &&
            <div className='profile-info-panel-content__bio' dangerouslySetInnerHTML={content} />
          }

          {(fields.size > 0 || identity_proofs.size > 0) && (
            <div className='profile-info-panel-content__fields'>
              {identity_proofs.map((proof, i) => (
                <dl className='test' key={i}>
                  <dt dangerouslySetInnerHTML={{ __html: proof.get('provider') }} />

                  <dd className='verified'>
                    <a href={proof.get('proof_url')} target='_blank' rel='noopener'>
                      <span title={intl.formatMessage(messages.linkVerifiedOn, { date: intl.formatDate(proof.get('updated_at'), dateFormatOptions) })}>
                        <Icon id='check' className='verified__mark' />
                      </span>
                    </a>
                    <a href={proof.get('profile_url')} target='_blank' rel='noopener'>
                      <span dangerouslySetInnerHTML={{ __html: ' ' + proof.get('provider_username') }} />
                    </a>
                  </dd>
                </dl>
              ))}

              {fields.map((pair, i) => (
                <dl className='profile-info-panel-content__fields__item' key={i}>
                  <dt dangerouslySetInnerHTML={{ __html: pair.get('name_emojified') }} title={pair.get('name')} />

                  <dd className={pair.get('verified_at') && 'verified'} title={pair.get('value_plain')}>
                    {pair.get('verified_at') && <span title={intl.formatMessage(messages.linkVerifiedOn, { date: intl.formatDate(pair.get('verified_at'), dateFormatOptions) })}><Icon id='check' className='verified__mark' /></span>} <span dangerouslySetInnerHTML={{ __html: pair.get('value_emojified') }} />
                  </dd>
                </dl>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, { account }) => {
  const identity_proofs = account ? state.getIn(['identity_proofs', account.get('id')], ImmutableList()) : ImmutableList();
  return {
    identity_proofs,
    domain: state.getIn(['meta', 'domain']),
  };
};

export default injectIntl(
  connect(mapStateToProps, null, null, {
    forwardRef: true,
  }
)(ProfileInfoPanel))
