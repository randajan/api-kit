import { isFn } from "./tool"




export const createTrait = (trait)=>{
    if (!trait) { return opt=>opt; }
    if (isFn(trait)) { return trait; }
    throw new Error("config.trait should be a function");
}

export const configTrait = (config)=>{
    config.trait = createTrait(config.trait);
}