/+  store=contact-store, res=resource, contact, group,
    default-agent, dbug, push-hook
~%  %contact-push-hook-top  ..part  ~
|%
+$  card  card:agent:gall
++  config
  ^-  config:push-hook
  :*  %contact-store
      /updates
      update:store
      %contact-update
      %contact-pull-hook
  ==
::
+$  agent  (push-hook:push-hook config)
--
::
%-  agent:dbug
^-  agent:gall
%-  (agent:push-hook config)
^-  agent
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    con   ~(. contact bowl)
    grp   ~(. group bowl)
::
++  on-init   on-init:def
++  on-save   !>(~)
++  on-load   on-load:def
++  on-poke   on-poke:def
++  on-agent  on-agent:def
++  on-watch  on-watch:def
++  on-leave  on-leave:def
++  on-peek   on-peek:def
++  on-arvo   on-arvo:def
++  on-fail   on-fail:def
::
++  should-proxy-update
  |=  =vase
  ^-  ?
  =/  =update:store  !<(update:store vase)
  ?-  -.update
    %initial     %.n
    %add         %.y
    %remove      %.y
    %edit        %.y
    %allow       %.n
    %disallow    %.n
    %set-public  %.n
  ==
++  resource-for-update  resource-for-update:con
::
++  initial-watch
  |=  [=path =resource:res]
  ^-  vase
  |^
  ?>  (is-allowed:con resource src.bowl)
  !>  ^-  update:store
  [%initial rolo %.n]
  ::
  ++  rolo
    ^-  rolodex:store
    =/  ugroup  (scry-group:grp resource)
    %-  ~(gas by *rolodex:store)
    ?~  ugroup
      =/  c=(unit contact:store)  (get-contact:con our.bowl)
      ?~  c
        [our.bowl *contact:store]~
      [our.bowl u.c]~
    %+  murn  ~(tap in (members:grp resource))
    |=  s=ship
    ^-  (unit [ship contact:store])
    =/  c=(unit contact:store)  (get-contact:con s)
    ?~(c ~ `[s u.c])
  --
::
++  take-update
  |=  =vase
  ^-  [(list card) agent]
  =/  =update:store  !<(update:store vase)
  ?.  ?=(%disallow -.update)  [~ this]
  :_  this
  [%give %kick ~[resource+(en-path:res [our.bowl %our])] ~]~
--