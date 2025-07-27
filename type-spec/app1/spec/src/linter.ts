import { defineLinter } from "@typespec/compiler";
import { noInterfaceRule } from "./rules/no-interfaces.rule.js";

export const $linter = defineLinter({
  rules: [noInterfaceRule],
  ruleSets: {
    recommended: {
      enable: { [`spec/${noInterfaceRule.name}`]: true },
    },
    all: {
      enable: { [`spec/${noInterfaceRule.name}`]: true },
    },
  },
});
