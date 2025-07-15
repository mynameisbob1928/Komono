import type { ComponentProps } from "utils/types";

export enum ComponentType {
  Button = "button",
  SelectMenu = "menu",
  Modal = "modal"
};

export function Component<T extends ComponentType>(options: ComponentProps<T>) {
  return {
    id: options.id,
    type: options.type,
    callback: options.callback
  };
};