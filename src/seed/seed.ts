import bcrypt from "bcrypt"
import { db } from "../conn.js"
import { usersTable as users } from "../db/users.js"

async function seed() {
  const password_hash = await bcrypt.hash("password123", 10)

  const [admin1, admin2, admin3, admin4, admin5] = await db
    .insert(users)
    .values(
        [
            { email: "admin1@mail.com", password_hash },
            { email: "admin2@mail.com", password_hash },
            { email: "admin3@mail.com", password_hash },
            { email: "admin4@mail.com", password_hash },
            { email: "admin5@mail.com", password_hash },
        
    ]).returning();

    console.log('Seed complete');
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exit(0);
    })
