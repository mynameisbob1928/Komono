import { ButtonInteraction, type AnySelectMenuInteraction, ModalSubmitInteraction, type CacheType } from "discord.js";

export namespace Component {
  export enum ComponentTypes {
    Button = "Button",
    SelectMenu = "Menu",
    Modal = "Modal"
  };

  type Interaction<T extends ComponentTypes> = T extends "Button"
  ? ButtonInteraction<CacheType>
  : T extends "Menu"
    ? AnySelectMenuInteraction<CacheType>
    : ModalSubmitInteraction<CacheType>;

  export type ComponentProps<T extends ComponentTypes = ComponentTypes> = {
    id: string;
    type: T;
    callback: (interaction: Interaction<T>, args?: string[]) => Promise<void>;
  };

  export function Create<T extends ComponentTypes>(props: ComponentProps) {
    return {
      id: props.id,
      type: props.type,
      callback: props.callback
    };
  };
};