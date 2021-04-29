import React, { useEffect, useState, useLayoutEffect, ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Text, Row, Col } from '@tlon/indigo-react';
import { Associations, Groups } from '@urbit/api';
import GlobalApi from '~/logic/api/global';
import { MetadataIcon } from '../landscape/components/MetadataIcon';
import { JoinGroup } from '../landscape/components/JoinGroup';
import { useModal } from '~/logic/lib/useModal';
import { GroupSummary } from '../landscape/components/GroupSummary';
import { PropFunc } from '~/types';
import useMetadataState from '~/logic/state/metadata';
import {useVirtual} from '~/logic/lib/virtualContext';

export function GroupLink(
  props: {
    api: GlobalApi;
    resource: string;
    detailed?: boolean;
  } & PropFunc<typeof Row>
): ReactElement {
  const { resource, api, ...rest } = props;
  const name = resource.slice(6);
  const [preview, setPreview] = useState<MetadataUpdatePreview | null>(null);
  const associations = useMetadataState(state => state.associations);
  const { save, restore } = useVirtual();
  const history = useHistory();
  const joined = resource in associations.groups;

  const { modal, showModal } = useModal({
    modal: <JoinGroup api={api} autojoin={name} />
  });

  useEffect(() => {
    (async () => {
      const prev = await api.metadata.preview(resource);
      save();
      setPreview(prev);
    })();

    return () => {
      save();
      setPreview(null);
    };
  }, [resource]);

  useLayoutEffect(() => {
    restore();
  }, [preview]);

  return (
    <Box maxWidth="500px" {...rest} onClick={(e) => { e.stopPropagation(); }}>
      {modal}
      <Row
        width="fit-content"
        flexShrink={1}
        alignItems="center"
        py="2"
        pr="2"
        onClick={
          joined ? () => history.push(`/~landscape/ship/${name}`) : showModal
        }
        cursor='pointer'
        opacity={preview ? '1' : '0.6'}
      >
        <MetadataIcon height={6} width={6} metadata={preview ? preview.metadata : {"color": "0x0"}} />
          <Col>
          <Text ml="2" fontWeight="medium" mono={!preview}>
            {preview ? preview.metadata.title : name}
          </Text>
          <Text pt='1' ml='2'>{preview ? `${preview.members} members` : "Fetching member count"}</Text>
        </Col>
      </Row>
    </Box>
  );
}
