import { createTestHost, createTestWrapper } from "@typespec/compiler/testing";
import { SpecTestLibrary } from "../src/testing/index.js";

export async function createSpecTestHost() {
  return createTestHost({
    libraries: [SpecTestLibrary],
  });
}

export async function createSpecTestRunner() {
  const host = await createSpecTestHost();

  return createTestWrapper(host, {
    autoUsings: ["Spec"]
  });
}

