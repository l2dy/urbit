import React from 'react';
import { Box } from '@tlon/indigo-react';

import { EnableGroupFeed } from './EnableGroupFeed';
import { EmptyGroupHome } from './EmptyGroupHome';
import { GroupFeed } from './GroupFeed';
import { AddFeedBanner } from './AddFeedBanner';

import { Route } from 'react-router-dom';

import useGroupState from '~/logic/state/group';
import useMetadataState from '~/logic/state/metadata';
import {resourceFromPath} from '@urbit/api';


function GroupHome(props) {
  const {
    api,
    groupPath,
    baseUrl
  } = props;

  const { ship } = resourceFromPath(groupPath);

  const associations = useMetadataState(state => state.associations);
  const groups = useGroupState(state => state.groups);

  const metadata = associations?.groups[groupPath]?.metadata;

  const askFeedBanner =
    ship === `~${window.ship}` &&
    metadata &&
    metadata.config &&
    'group' in metadata.config &&
    metadata.config.group === null;

  const isFeedEnabled =
    metadata &&
    metadata.config &&
    metadata.config.group &&
    'resource' in metadata.config.group;

  const graphPath = metadata?.config?.group?.resource;
  const graphMetadata = associations?.graph[graphPath]?.metadata;

  return (
    <Box width="100%" height="100%" overflow="hidden">
      <Route path={`${baseUrl}/enable`}
        render={() => {
          return (
            <EnableGroupFeed
              groupPath={groupPath}
              baseUrl={baseUrl}
              api={api}
            />
          );
        }}
      />
      { askFeedBanner ? (
        <AddFeedBanner 
          api={api}
          groupPath={groupPath}
          baseUrl={baseUrl}
          group={groups[groupPath]}
        /> 
      ) : null }
      <Route path={`${baseUrl}/feed`}>
        <GroupFeed
          graphPath={graphPath}
          groupPath={groupPath}
          vip={graphMetadata?.vip || ''}
          api={api}
          baseUrl={baseUrl} />
      </Route>
      <Route path={baseUrl} exact>
        <EmptyGroupHome
          groups={groups}
          associations={associations}
          groupPath={groupPath} />
      </Route>
    </Box>
  );
}

export { GroupHome };
