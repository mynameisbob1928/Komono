import type { Interaction } from "discord.js";

export namespace Component {
  export function Create(id: string, callback: (interaction: Interaction, args?: string[]) => Promise<void>) {
    return {
      id,
      callback
    };
  };
};