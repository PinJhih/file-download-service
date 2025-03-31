require("dotenv").config({ path: ".env" });
const { v4: uuidv4 } = require("uuid");
const database = require("./database");

BASE_URL = process.env.BASE_URL;

/**
 * Generate a shortened URL
 * @param {string} fileName - file name of the MinIO object
 * @param {string} longURL - original URL
 * @param {number} expiry - expiry time in seconds
 * @returns {Promise<string|null>} - shortened URL
 */
async function generateShortURL(fileName, url, expiry) {
  const expiresAt = new Date(Date.now() + expiry * 1000).toISOString();

  // generate short code
  let shortCode;
  let isUnique = false;
  while (!isUnique) {
    shortCode = uuidv4().substring(24); // last 12 chars of UUID
    const existing = await database.get(
      "SELECT id FROM urls WHERE short_code = ?",
      [shortCode]
    );
    if (!existing) isUnique = true;
  }

  // insert into database
  await database.runQuery(
    "INSERT INTO urls (file_name, short_code, long_url, expires_at) VALUES (?, ?, ?, ?)",
    [fileName, shortCode, url, expiresAt]
  );
  return `${BASE_URL}/${shortCode}`;
}

/**
 * Retrieve the long URL
 * @param {string} shortCode - shortened URL code
 * @returns {string|null} - corresponding long URL, or null if it doesn't exist or has expired
 */
async function toLongURL(shortCode) {
  let longURL = await database.get(
    "SELECT long_url, expires_at FROM urls WHERE short_code = ?",
    [shortCode]
  );
  return longURL;
}

/**
 * Retrieve all short URLs using a file name
 * @param {string} fileName - the file name associated with the long URL
 * @returns {string[]} - corresponding short URLs
 */
async function getAllShortURLs(fileName) {
  let urls = await database.getAll(
    "SELECT long_url FROM urls WHERE file_name = ?",
    [fileName]
  );
  return urls;
}

module.exports = { generateShortURL, toLongURL, getAllShortURLs };
