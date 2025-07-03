import { ButtonInteraction, type AnySelectMenuInteraction, ModalSubmitInteraction, type CacheType } from "discord.js";

export namespace Component {
  export enum ComponentTypes {
    Button = "button",
    SelectMenu = "menu",
    Modal = "modal"
  };

  type Interaction<T extends ComponentTypes> = T extends "button"
  ? ButtonInteraction<CacheType>
  : T extends "menu"
    ? AnySelectMenuInteraction<CacheType>
    : ModalSubmitInteraction<CacheType>;

  export type ComponentProps<T extends ComponentTypes> = {
    id: string;
    type: T;
    callback(interaction: Interaction<T>, args?: string[]): Promise<void>;
  };

  export function Create<T extends ComponentTypes>(props: ComponentProps<T>) {
    return {
      id: props.id,
      type: props.type,
      callback: props.callback
    };
  };
};