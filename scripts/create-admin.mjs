/**
 * Creates or resets the password of an admin account.
 *
 * Public signup refuses any address in ADMIN_EMAILS, so this is the only way an
 * admin account comes into existence. Being in ADMIN_EMAILS is what grants the
 * rights; this just makes the account you sign in with.
 *
 * Usage:
 *   npm run admin:create -- you@example.com
 *   npm run admin:create -- you@example.com --name "Your Name"
 *   npm run admin:create -- you@example.com --reset      # change the password
 *
 * The password is read from stdin, never from argv — an argument would land in
 * your shell history and in the process list.
 */

import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import process from "node:process";
import { promisify } from "node:util";
import { MongoClient, ObjectId } from "mongodb";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const MIN_LENGTH = 12;

try {
  process.loadEnvFile(".env.local");
} catch {
  // Not fatal: the values may come from the real environment instead.
}

/** Same format as src/lib/auth/passwords.ts — `scrypt$<salt hex>$<key hex>`. */
async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

let pipedLines = null;

/** Reads all of stdin once, then serves it a line at a time. */
async function readPipedLine() {
  if (pipedLines === null) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    pipedLines = Buffer.concat(chunks).toString("utf8").split(/\r?\n/);
  }
  return pipedLines.shift() ?? "";
}

/**
 * Reads one line from stdin without echoing it.
 *
 * Handles both shapes of input: an interactive terminal delivers a keystroke at
 * a time, while a pipe (or a paste) delivers a whole line — or several — in one
 * chunk. Treating every chunk as a single character is what makes a naive
 * version of this hang forever on piped input.
 */
function askHidden(prompt) {
  const input = process.stdin;

  // Not a terminal: nothing to hide from, and no raw mode to enter. The whole
  // stream is read once and handed out a line at a time, because closing a
  // readline on stdin discards whatever it had already buffered — which loses
  // the confirmation line.
  if (!input.isTTY) {
    return readPipedLine();
  }

  return new Promise((resolve) => {
    const wasRaw = input.isRaw;
    process.stdout.write(prompt);
    input.setRawMode(true);
    input.resume();

    let value = "";

    const finish = () => {
      input.setRawMode(wasRaw);
      input.pause();
      input.removeListener("data", onData);
      process.stdout.write("\n");
      resolve(value);
    };

    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\n" || char === "\r" || char === "\u0004") return finish();
        if (char === "\u0003") {
          input.setRawMode(wasRaw);
          process.stdout.write("\n");
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        // Ignore the remaining control characters (arrow keys and friends).
        if (char >= " ") value += char;
      }
    };

    input.on("data", onData);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const email = normalizeEmail(args.find((arg) => !arg.startsWith("--")));
  const reset = args.includes("--reset");
  const nameFlag = args.indexOf("--name");
  const name = nameFlag > -1 ? args[nameFlag + 1] : "";

  if (!email || !isValidEmail(email)) {
    console.error('Usage: npm run admin:create -- you@example.com [--name "Your Name"] [--reset]');
    process.exit(1);
  }

  const allowed = (process.env.ADMIN_EMAILS || "").split(",").map(normalizeEmail).filter(Boolean);

  if (!allowed.includes(email)) {
    console.error(
      `✖ ${email} is not in ADMIN_EMAILS.\n` +
        "  Being in that list is what grants admin rights — this script only creates the\n" +
        "  account you sign in with. Add the address to ADMIN_EMAILS (in .env.local for\n" +
        "  local work, and in the Vercel project for production) and run this again.\n" +
        `  Currently allowed: ${allowed.length ? allowed.join(", ") : "(none set)"}`,
    );
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set (checked the environment and .env.local).");
    process.exit(1);
  }

  const { hostname } = new URL(uri.replace(/^mongodb\+srv:\/\//, "https://"));
  console.log(`Target: ${hostname} / ${process.env.MONGODB_DB || "derpx06"} / users\n`);

  const password = await askHidden(`Password for ${email}: `);
  // Without a terminal there is no prompt to type at — an agent shell, a CI
  // step, `npm run` under a pipe. Reading an empty stdin then failing the
  // length check below reads as "your password was too short", which sends you
  // off inventing longer ones forever. Say what actually happened.
  if (!password && !process.stdin.isTTY) {
    console.error(
      "✖ Nothing arrived on stdin, and this is not a terminal, so there was no\n" +
        "  prompt to type at. Either run this in a real terminal window, or pipe\n" +
        "  the password in twice (leading space keeps it out of bash history):\n" +
        `   printf 'your-password\\nyour-password\\n' | npm run admin:create -- ${email}`,
    );
    process.exit(1);
  }
  if (password.length < MIN_LENGTH) {
    console.error(`✖ Use at least ${MIN_LENGTH} characters for an admin account.`);
    process.exit(1);
  }
  const again = await askHidden("Confirm: ");
  if (password !== again) {
    console.error("✖ Those did not match.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const users = client.db(process.env.MONGODB_DB || "derpx06").collection("users");
    await users.createIndex({ email: 1 }, { unique: true });

    const existing = await users.findOne({ email });
    const passwordHash = await hashPassword(password);

    if (existing) {
      if (!reset) {
        console.error(`✖ ${email} already exists. Pass --reset to change its password.`);
        process.exit(1);
      }
      await users.updateOne({ email }, { $set: { passwordHash } });
      console.log(`✓ Password reset for ${email}.`);
    } else {
      await users.insertOne({
        _id: new ObjectId(),
        email,
        name: (name || "").trim() || email.split("@")[0],
        passwordHash,
        createdAt: new Date(),
      });
      console.log(`✓ Created ${email}. Sign in at /signin, then open /admin.`);
    }
  } finally {
    await client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
