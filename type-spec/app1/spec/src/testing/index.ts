import { resolvePath } from "@typespec/compiler";
import { createTestLibrary, TypeSpecTestLibrary } from "@typespec/compiler/testing";
import { fileURLToPath } from "url";

export const SpecTestLibrary: TypeSpecTestLibrary = createTestLibrary({
  name: "spec",
  packageRoot: resolvePath(fileURLToPath(import.meta.url), "../../../../"),
});
