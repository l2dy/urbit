import React, { ReactElement, ReactNode } from 'react';
import _ from 'lodash';

import { Col, Box, Text } from '@tlon/indigo-react';
import {
  Invites as IInvites,
  Associations,
  Invite,
  JoinRequests,
  Groups,
  Contacts,
  AppInvites,
  JoinProgress,
  JoinRequest
} from '@urbit/api';

import GlobalApi from '~/logic/api/global';
import { resourceAsPath, alphabeticalOrder } from '~/logic/lib/util';
import InviteItem from '~/views/components/Invite';
import useInviteState from '~/logic/state/invite';
import useGroupState from '~/logic/state/group';

interface InvitesProps {
  api: GlobalApi;
  pendingJoin?: any;
}

interface InviteRef {
  uid: string;
  app: string;
  invite: Invite;
}

export function Invites(props: InvitesProps): ReactElement {
  const { api } = props;
  const invites = useInviteState(state => state.invites);

  const inviteArr: InviteRef[] = _.reduce(
    invites,
    (acc: InviteRef[], val: AppInvites, app: string) => {
      const appInvites = _.reduce(
        val,
        (invs: InviteRef[], invite: Invite, uid: string) => {
          return [...invs, { invite, uid, app }];
        },
        []
      );
      return [...acc, ...appInvites];
    },
    []
  );

  const pendingJoin = _.omitBy(props.pendingJoin, 'hidden');

  const invitesAndStatus: { [rid: string]: JoinRequest | InviteRef } = {
    ..._.keyBy(inviteArr, ({ invite }) => resourceAsPath(invite.resource)),
    ...pendingJoin
  };

  return (
    <>
      {Object.keys(invitesAndStatus)
        .sort(alphabeticalOrder)
        .map((resource) => {
          const inviteOrStatus = invitesAndStatus[resource];
          const join = pendingJoin[resource];
          if ('progress' in inviteOrStatus) {
           return (
             <InviteItem
               key={resource}
               resource={resource}
               api={api}
               pendingJoin={join}
             />
            );
          } else {
            const { app, uid, invite } = inviteOrStatus;
            return (
              <InviteItem
                key={resource}
                api={api}
                invite={invite}
                app={app}
                uid={uid}
                resource={resource}
              />
            );
          }
        })
      }
    </>
  );
}
