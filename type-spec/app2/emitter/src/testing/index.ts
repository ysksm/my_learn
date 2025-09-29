import { resolvePath } from "@typespec/compiler";
import { createTestLibrary, TypeSpecTestLibrary } from "@typespec/compiler/testing";
import { fileURLToPath } from "url";

export const EmitterTestLibrary: TypeSpecTestLibrary = createTestLibrary({
  name: "emitter",
  packageRoot: resolvePath(fileURLToPath(import.meta.url), "../../../../"),
});
