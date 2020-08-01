::  lib/push-hook/hoon: helper for creating a push hook
::  
::   lib/push-hook is a helper for automatically pushing data from a
::   local store to the corresponding pull-hook on remote ships. It also
::   proxies remote pokes to the store.
::
::   ## Interfacing notes:
::
::   lib/push-hook provides the inner door with its own separate state.
::   The inner door may interact with the library by producing cards or
::   scrying. Do not pass any cards on a wire beginning with /helper as
::   these wires are reserved by this library. Any watches/pokes/peeks
::   not listed below will be routed to the inner door.
::
::   ##  Subscription paths
::
::   /resource/[resource]: Receive initial state and updates to
::   .resource. .resource should be encoded with de-path:resource from
::   /lib/resource. Facts on this path will be of mark
::   update-mark.config
::
::   ##  Pokes
::
::   %push-hook-action: Add/remove a resource from pushing.
::   [update-mark.config]: A poke to proxy to the local store
::
/-  *push-hook
/+  default-agent, resource
|%
+$  card  card:agent:gall
::
::  $config: configuration for the push hook
::  
::    .store-name: name of the store to proxy pokes and
::    subscriptions to
::    .store-path: subscription path to receive updates on
::    .update-mark: mark that updates will be tagged with
::    .pull-hook-name: name of the corresponding pull-hook
::
+$  config
  $:  store-name=term
      store-path=path
      update=mold
      update-mark=term
      pull-hook-name=term
  ==
::
::  $state-0: state for the push hook
::
::    .sharing: resources that the push hook is proxying
::    .inner-state: state given to internal door
::
+$  state-0
  $:  %0
    sharing=(set resource)
    inner-state=vase
  ==
::
++  push-hook
  |*  =config
  $_  ^|
  |_  bowl:gall
  ::  from agent:gall
  ::
  ++  on-init
    *[(list card) _^|(..on-init)]
  ::
  ++  on-save
    *vase
  ::
  ++  on-load
    |~  vase
    *[(list card) _^|(..on-init)]
  ::
  ++  on-poke
    |~  cage
    *[(list card) _^|(..on-init)]
  ::
  ++  on-watch
    |~  path
    *[(list card) _^|(..on-init)]
  ::
  ++  on-leave
    |~  path
    *[(list card) _^|(..on-init)]
  ::
  ++  on-peek
    |~  path
    *(unit (unit cage))
  ::
  ++  on-agent
    |~  [wire sign:agent:gall]
    *[(list card) _^|(..on-init)]
  ::
  ++  on-arvo
    |~  [wire sign-arvo]
    *[(list card) _^|(..on-init)]
  ::
  ++  on-fail
    |~  [term tang]
    *[(list card) _^|(..on-init)]
  ::
  ::  +resource-for-update: get affected resource from an update
  ::  
  ::    Given a vase of the update, the mark of which is
  ::    update-mark.config, produce the affected resource, if any.
  ::
  ++  resource-for-update
    |~  vase
    *(unit resource)
  ::
  ::  +on-update: handle update from store
  ::
  ::    Given an update from the store, do other things after proxying
  ::    the update
  ::
  ++  take-update
    |~  vase
    *[(list card) _^|(..on-init)]
  ::  +should-proxy-update: should forward update to store
  ::
  ::    If %.y is produced, then the update is forwarded to the local
  ::    store. If %.n is produced then the update is not forwarded and
  ::    the poke fails.
  ::
  ++  should-proxy-update
    |~  vase
    *?
  ::  +initial-watch: produce initial state for a subscription
  ::
  ::    .resource is the resource being subscribed to.
  ::    .path is any additional information in the subscription wire.
  ::    This would typically be used to encode state that the subscriber
  ::    already has. For example, a chat client might encode
  ::    the number of messages that it already has, or the date it last
  ::    received an update.
  ::
  ::    If +initial-watch crashes, the subscription fails.
  ::
  ++  initial-watch
    |~  [path resource]
    *vase
  ::
  --
++  agent
  |*  =config
  |=  =(push-hook config)
  =|  state-0
  =*  state  -
  ^-  agent:gall
  =<

    |_  =bowl:gall
    +*  this  .
        og   ~(. push-hook bowl)
        hc   ~(. +> bowl)
        def  ~(. (default-agent this %|) bowl)
    ++  on-init
      =^  cards  push-hook
        on-init:og
      :_  this
      [watch-store:hc cards]
    ::
    ++  on-load
      |=  =old=vase
      =/  old
        !<(state-0 old-vase)
      =^  cards   push-hook
        (on-load:og inner-state.old)
      `this(state old)
    ::
    ++  on-save
      =.  inner-state
        on-save:og
      !>(state)
    ::
    ++  on-poke
      |=  [=mark =vase]
      ^-  (quip card:agent:gall agent:gall)
      ?:  =(mark %push-hook-action)
        ?>  (team:title our.bowl src.bowl)
        =^  cards  state
          (poke-hook-action:hc !<(action vase))
        [cards this]
      ::
      ?:  =(mark update-mark.config)
        =^  cards  state
          (poke-update:hc vase)
        [cards this]
      ::
      =^  cards  push-hook
        (on-poke:og mark vase)
      [cards this]
    ::
    ++  on-watch
      |=  =path
      ^-  (quip card:agent:gall agent:gall)
      ?.  ?=([%resource *] path)
        =^  cards  push-hook
          (on-watch:og path)
        [cards this]
      ?>  ?=([%ship @ @ *] t.path)
      =/  =resource
        (de-path:resource t.path)
      =/  =vase
        (initial-watch:og t.t.t.path resource)
      :_  this
      [%give %fact ~ update-mark.config vase]~
    ::
    ++  on-agent
      |=  [=wire =sign:agent:gall]
      ^-  (quip card:agent:gall agent:gall)
      ?.  ?=([%helper %push-hook @ *] wire)
        =^  cards  push-hook
          (on-agent:og wire sign)
        [cards this]
      ?.  ?=(%store i.t.t.wire)
        (on-agent:def wire sign)
      ?+   -.sign  (on-agent:def wire sign)
        %kick  [~[watch-store:hc] this]
      ::
          %fact
        ?.  =(update-mark.config p.cage.sign)
          =^  cards  push-hook
            (on-agent:og wire sign)
          [cards this]
        =^  cards  push-hook
          (take-update:og q.cage.sign)
        :_  this
        %+  weld
          (push-updates:hc q.cage.sign)
        cards

      ==
      ++  on-leave
        |=  =path
        =^  cards  push-hook
          (on-leave:og path)
        [cards this]
      ++  on-arvo
        |=  [=wire =sign-arvo]
        =^  cards  push-hook
          (on-arvo:og wire sign-arvo)
        [cards this]
      ++  on-fail
        |=  [=term =tang]
        =^  cards  push-hook
          (on-fail:og term tang)
        [cards this]
      ++  on-peek   on-peek:og
    --
  |_  =bowl:gall
  +*  og   ~(. push-hook bowl)
  ::
  ++  poke-update
    |=  =vase
    ^-  (quip card:agent:gall _state)
    ?>  (should-proxy-update:og vase)
    =/  wire
      (make-wire /store)
    :_  state
    [%pass wire %agent [our.bowl store-name.config] %poke update-mark.config vase]~
  ::
  ++  poke-hook-action
    |=  =action
    ^-  (quip card:agent:gall _state)
    |^
    ?-  -.action
      %add  (add +.action)
      %remove  (remove +.action)
      %revoke  (revoke +.action)
    ==
    ++  add
      |=  rid=resource
      =.  sharing
        (~(put in sharing) rid)
      `state
    ::
    ++  remove
      |=  rid=resource
      =/  pax=path
        [%resource (en-path:resource rid)]
      =/  paths=(list path)
        %+  turn
          (incoming-subscriptions pax)
        |=([ship pox=path] pax)
      =.  sharing
        (~(del in sharing) rid)
      :_  state
      [%give %kick ~[pax] ~]~
    ::
    ++  revoke
      |=  [ships=(set ship) rid=resource]
      =/  pax=path
        [%resource (en-path:resource rid)]
      :_  state
      %+  murn
        (incoming-subscriptions pax)
      |=  [her=ship =path]
      ^-  (unit card)
      ?.  (~(has in ships) her)
        ~
      `[%give %kick ~[path] `her]
    --
  ++  incoming-subscriptions
    |=  prefix=path
    ^-  (list (pair ship path))
    %+  skim
      ~(val by sup.bowl)
    |=  [him=ship pax=path]
    =/  idx=(unit @)
      (find prefix pax)
    ?~  idx  %.n
    =(u.idx 0)
  ::
  ++  make-wire
    |=  =wire
    ^+  wire
    %+  weld
      /helper/push-hook
    wire
  ::
  ++  watch-store
    ^-  card:agent:gall
    =/  =wire
      (make-wire /store)
    [%pass wire %agent [our.bowl store-name.config] %watch store-path.config]
  ::
  ++  push-updates
    |=  =vase
    ^-  (list card:agent:gall)
    =/  rid=(unit resource)
      (resource-for-update:og vase)
    ?~  rid  ~
    =/  =path
      resource+(en-path:resource u.rid)
    [%give %fact ~[path] update-mark.config vase]~
  --
--
