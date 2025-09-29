import { createTypeSpecLibrary } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "emitter",
  diagnostics: {},
});

export const { reportDiagnostic, createDiagnostic } = $lib;
