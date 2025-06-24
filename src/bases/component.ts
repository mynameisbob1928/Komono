import { ButtonInteraction, type AnySelectMenuInteraction, ModalSubmitInteraction, type CacheType } from "discord.js";

type Interaction<T extends "Button" | "Menu" | "Modal"> = T extends "Button"
  ? ButtonInteraction<CacheType>
  : T extends "Menu"
    ? AnySelectMenuInteraction<CacheType>
    : ModalSubmitInteraction<CacheType>;

export namespace Component {
  export function Create<T extends "Button" | "Menu" | "Modal">(id: string, type: T, callback: (interaction: Interaction<T>, args?: string[]) => Promise<void>) {
    return {
      id,
      type,
      callback
    };
  };
};