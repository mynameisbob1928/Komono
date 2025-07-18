import type { AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";

export type ComponentCategory = "button" | "selectMenu" | "modal";

export type ComponentInteraction<T extends ComponentCategory> = T extends "button" ? ButtonInteraction : T extends "selectMenu" ? AnySelectMenuInteraction : ModalSubmitInteraction

export interface ComponentProps<T extends ComponentCategory> {
    id: string;
    type: T;
    run(interaction: ComponentInteraction<T>, args?: any[]): any;
};

export default class Component<T extends ComponentCategory> {
    public id;
    public type;
    public run;

    constructor(props: ComponentProps<T>) {
        this.id = props.id
        this.type = props.type;
        this.run = props.run;
    };
};