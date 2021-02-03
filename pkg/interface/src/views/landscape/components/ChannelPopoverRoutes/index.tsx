import React, { useRef } from "react";
import { ModalOverlay } from "~/views/components/ModalOverlay";
import { Col, Box, Text, Row } from "@tlon/indigo-react";
import { ChannelPopoverRoutesSidebar } from "./Sidebar";
import { ChannelDetails } from "./Details";
import { GraphPermissions } from "./ChannelPermissions";
import {
  Association,
  Groups,
  Group,
  Rolodex,
  NotificationGraphConfig,
} from "~/types";
import GlobalApi from "~/logic/api/global";
import { useHashLink } from "~/logic/lib/useHashLink";
import { useOutsideClick } from "~/logic/lib/useOutsideClick";
import { useHistory } from "react-router-dom";
import { ChannelNotifications } from "./Notifications";
import { StatelessAsyncButton } from "~/views/components/StatelessAsyncButton";
import { wait } from "~/logic/lib/util";
import { isChannelAdmin, isHost } from "~/logic/lib/group";

interface ChannelPopoverRoutesProps {
  baseUrl: string;
  association: Association;
  group: Group;
  groups: Groups;
  contacts: Rolodex;
  api: GlobalApi;
  notificationsGraphConfig: NotificationGraphConfig;
}

export function ChannelPopoverRoutes(props: ChannelPopoverRoutesProps) {
  const { association, group, api } = props;
  useHashLink();
  const overlayRef = useRef<HTMLElement>();
  const history = useHistory();

  useOutsideClick(overlayRef, () => {
    history.push(props.baseUrl);
  });

  const handleUnsubscribe = async () => {
    const [,,ship,name] = association.resource.split('/');
    await api.graph.leaveGraph(ship, name);
  };
  const handleRemove = async () => {
    await api.metadata.remove('graph', association.resource, association.group);
  };
  const handleArchive = async () => {
    const [,,,name] = association.resource.split('/');
    await api.graph.deleteGraph(name);
  };

  const canAdmin = isChannelAdmin(group, association.resource);
  const isOwner = isHost(association.resource);

  return (
    <ModalOverlay
      bg="transparent"
      height="100%"
      width="100%"
      spacing={[3, 5, 7]}
      ref={overlayRef}
    >
      <Row
        border="1"
        borderColor="lightGray"
        borderRadius="2"
        bg="white"
        height="100%"
      >
        <ChannelPopoverRoutesSidebar
          isAdmin={canAdmin}
          isOwner={isOwner}
          baseUrl={props.baseUrl}
        />
        <Col height="100%" overflowY="auto" p="5" flexGrow={1}>
          <ChannelNotifications {...props} />
          {!isOwner && (
            <Col mb="6">
              <Text id="unsubscribe" fontSize="2" fontWeight="bold">
                Unsubscribe from Channel
              </Text>
              <Text mt="1" maxWidth="450px" gray>
                Unsubscribing from a channel will revoke your ability to read
                its contents. Any permissions set by the channel host will still
                apply once you have left.
              </Text>
              <Row mt="3">
                <StatelessAsyncButton destructive onClick={handleUnsubscribe}>
                  Unsubscribe from {props.association.metadata.title}
                </StatelessAsyncButton>
              </Row>
            </Col>
          )}
          {canAdmin && (
            <>
              <ChannelDetails {...props} />
              <GraphPermissions {...props} />
              { isOwner ? (
              <Col mt="5" mb="6">
              <Text id="archive" fontSize="2" fontWeight="bold">
                Archive channel
              </Text>
              <Text mt="1" maxWidth="450px" gray>
                Archiving a channel will prevent further updates to the channel.
                Users who are currently joined to the channel will retain a copy
                of the channel.
              </Text>
              <Row mt="3">
                <StatelessAsyncButton destructive onClick={handleArchive}>
                  Archive {props.association.metadata.title}
                </StatelessAsyncButton>
              </Row>
            </Col> 

              ) : (
              <Col mt="5" mb="6">
              <Text id="remove" fontSize="2" fontWeight="bold">
                Remove channel from group
              </Text>
              <Text mt="1" maxWidth="450px" gray>
                Removing a channel will prevent further updates to the channel.
                Users who are currently joined to the channel will retain a copy
                of the channel.
              </Text>
              <Row mt="3">
                <StatelessAsyncButton destructive onClick={handleRemove}>
                  Remove {props.association.metadata.title}
                </StatelessAsyncButton>
              </Row>
            </Col> 

              )}
            </>
          )}
        </Col>
      </Row>
    </ModalOverlay>
  );
}
