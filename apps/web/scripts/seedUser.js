import { readFileSync } from "fs";
import fetch from "node-fetch";

const projectId = "demo-nurseconnect"; // same as in firebase.json
const authHost = "http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1";

async function seedUser() {
  const res = await fetch(`${authHost}/accounts:signUp?key=fake-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "password123",
      returnSecureToken: true
    })
  });

  const data = await res.json();
  console.log("Seeded user:", data);
}

seedUser().catch(console.error);