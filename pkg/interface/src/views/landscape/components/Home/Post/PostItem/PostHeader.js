import React from 'react';
import { Col, Row, Icon, Action } from '@tlon/indigo-react';
import Author from '~/views/components/Author';
import { useCopy } from '~/logic/lib/useCopy';
import { getPermalinkForGraph } from '~/logic/lib/permalinks';
import { Dropdown } from '~/views/components/Dropdown';
import useContactState from '~/logic/state/contact';


export function PostHeader(props) {
  const {
    post,
    api,
    association,
    isReply,
    showTimestamp
  } = props;
  const contacts = useContactState(state => state.contacts);
  const mb = isReply ? "2" : "3";

  const permalink = !!association ? getPermalinkForGraph(
    association.group,
    association.resource,
    post.index
  ) : '';
  const { copyDisplay, doCopy } = useCopy(permalink, 'Copy Link');

  return (
    <Row
      width="100%"
      mb={mb}
      pl="2"
      pr="2"
      justifyContent="space-between"
      onClick={(e) => { e.stopPropagation(); }}>
      <Author
        showImage
        contacts={contacts}
        ship={post.author}
        date={post['time-sent']}
        unread={false}
        api={api}
        size={24}
        sigilPadding={6}
        dontShowTime={!showTimestamp}
        isRelativeTime={true}
        showTime={false}
        time={true}
      />
      <Dropdown
        dropWidth="200px"
        alignX="right"
        alignY="top"
        options={
          <Col
            backgroundColor="white"
            border={1}
            borderRadius={1}
            borderColor="lightGray">
            <Row alignItems="center" p={1}>
              <Action bg="white" m={1} color="black" onClick={doCopy}>
                {copyDisplay}
              </Action>
            </Row>
          </Col>
        }>
        <Icon icon="Ellipsis" color="gray" />
      </Dropdown>
    </Row>
  );
}

