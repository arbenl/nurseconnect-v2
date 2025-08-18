import { getAuth } from "firebase/auth";

const auth = getAuth();
console.log("Auth works", !!auth);