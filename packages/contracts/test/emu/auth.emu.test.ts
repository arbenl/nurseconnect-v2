import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import * as path from 'path';

let testEnv: RulesTestEnvironment;

describe("Auth and Firestore Rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-nurseconnect",
      firestore: {
        rules: readFileSync(path.resolve(__dirname, "../../../packages/database/firestore.rules"), "utf8"),
        host: "127.0.0.1",
        port: 8081,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("should allow a user to read and write their own profile", async () => {
    const alice = testEnv.authenticatedContext("alice_uid");
    const aliceDocRef = doc(alice.firestore(), "users/alice_uid");
    await expect(
      setDoc(aliceDocRef, { name: "Alice" }),
    ).resolves.toBeUndefined();
    const docSnap = await getDoc(aliceDocRef);
    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()?.name).toBe("Alice");
  });

  it("should prevent a user from writing to another user profile", async () => {
    const alice = testEnv.authenticatedContext("alice_uid");
    const bobDocRef = doc(alice.firestore(), "users/bob_uid");
    await expect(setDoc(bobDocRef, { name: "Bob" })).rejects.toThrow();
  });
});
