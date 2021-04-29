import React, {
  useContext,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import usePreviousValue from "./usePreviousValue";

export interface VirtualContextProps {
  save: () => void;
  restore: () => void;
}
const fallback: VirtualContextProps = {
  save: () => {},
  restore: () => {},
};

export const VirtualContext = React.createContext(fallback);

export function useVirtual() {
  return useContext(VirtualContext);
}

export const withVirtual = <P extends {}>(Component: React.ComponentType<P>) =>
  React.forwardRef((props: P, ref) => (
    <VirtualContext.Consumer>
      {(context) => <Component ref={ref} {...props} {...context} />}
    </VirtualContext.Consumer>
  ));

export function useVirtualResizeState(s: boolean) {
  const [state, _setState] = useState(s);
  const { save, restore } = useVirtual();

  const setState = useCallback(
    (sta: boolean) => {
      save();
      _setState(sta);
    },
    [_setState, save]
  );

  useLayoutEffect(() => {
    restore();
  }, [state]);

  return [state, setState] as const;
}

export function useVirtualResizeProp<T>(prop: T) {
  const { save, restore } = useVirtual();
  const oldProp = usePreviousValue(prop)

  if(prop !== oldProp) {
    save();
  }

  useLayoutEffect(() => {
    restore();
  }, [prop]);


}
