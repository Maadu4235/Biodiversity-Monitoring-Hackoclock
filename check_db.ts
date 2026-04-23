import Database from "better-sqlite3";

const db = new Database("biodiversity.db");

console.log("--- USERS ---");
const users = db.prepare("SELECT id, email, name, role, isApproved FROM users").all();
console.table(users);

console.log("\n--- SIGHTINGS ---");
const sightings = db.prepare("SELECT id, animalType, status, location, userId FROM sightings").all();
console.table(sightings);

db.close();
