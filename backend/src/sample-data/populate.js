// backend/src/sample-data/users.js
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { Permit } from "permitio";
const serviceAccount = require("../serviceAccountKey.json");

const permit = new Permit({
  // in production, you might need to change this url to fit your deployment
  pdp: "http://0.0.0.0:7766",
  // your api key
  token:
    "permit_key_JrfSqJxaufgI8duXwcarKn6Dd4e59iUhQcctU36Rdg1VQlKbtV7Dqlk1ALVSaR119eHSjmV9NXgcKOjPeRbidR",
});


export function initializeFirebase() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://myproject-3ee81.appspot.com", //process.env.FIREBASE_STORAGE_BUCKET,
  });
}
initializeFirebase();
export const auth = admin.auth();
export const db = admin.firestore();

const users = [
  {
    password: "user_password",
    email: "regular@test.com",
    username: "Regular User",
    age: 16,
    verified_status: false,
    subscriber_count: 0,
    channel_strikes: 0,
    subscription_status: "free",
    subscription_expiry: "",
    country: "US",
  },
  {
    password: "user_password",
    email: "creator@test.com",
    username: "Content Creator",
    age: 25,
    verified_status: true,
    subscriber_count: 500, // Not enough for monetization
    channel_strikes: 0,
    subscription_status: "free",
    subscription_expiry: "",
    country: "UK",
  },
  {
    password: "user_password",
    email: "monetized@test.com",
    username: "Monetized Creator",
    age: 30,
    verified_status: true,
    subscriber_count: 1500, // Eligible for monetization
    channel_strikes: 0,
    subscription_status: "free",
    subscription_expiry: "",
    country: "CA",
  },
  {
    password: "user_password",
    email: "premium@test.com",
    username: "Premium User",
    age: 21,
    verified_status: false,
    subscriber_count: 0,
    channel_strikes: 0,
    subscription_status: "premium",
    subscription_expiry: "2024-12-31",
    country: "US",
  },
  {
    password: "user_password",
    email: "admin@test.com",
    username: "Admin User",
    age: 35,
    verified_status: true,
    subscriber_count: 5000,
    channel_strikes: 0,
    subscription_status: "premium",
    subscription_expiry: "2024-12-31",
    country: "US",
  },
];

// backend/src/sample-data/videos.js
const videos = [
  {
    id: "video1",
    title: "Public Regular Video",
    description: "A regular public video",
    owner_id: "user2",
    visibility: "public",
    duration: 5, // 5 minutes
    content_type: "original",
    copyright_strikes: 0,
    age_restriction: 0,
    is_premium: false,
    region_restriction: [],
  },
  {
    id: "video2",
    title: "Age Restricted Video",
    description: "Adults only content",
    owner_id: "user2",
    visibility: "public",
    duration: 15,
    content_type: "original",
    copyright_strikes: 0,
    age_restriction: 18,
    is_premium: false,
    region_restriction: [],
  },
  {
    id: "video3",
    title: "Monetized Video",
    description: "Video with ads",
    owner_id: "user3",
    visibility: "public",
    duration: 12,
    content_type: "original",
    copyright_strikes: 0,
    age_restriction: 0,
    is_premium: false,
    monetization: true,
    region_restriction: [],
  },
  {
    id: "video4",
    title: "Premium Only Video",
    description: "Exclusive content",
    owner_id: "user3",
    visibility: "public",
    duration: 25,
    content_type: "original",
    copyright_strikes: 0,
    age_restriction: 0,
    is_premium: true,
    region_restriction: [],
  },
  {
    id: "video5",
    title: "Private Video",
    description: "Personal content",
    owner_id: "user2",
    visibility: "private",
    duration: 8,
    content_type: "original",
    copyright_strikes: 0,
    age_restriction: 0,
    is_premium: false,
    region_restriction: [],
  },
  {
    id: "video6",
    title: "Region Restricted Video",
    description: "Only available in US",
    owner_id: "user3",
    visibility: "public",
    duration: 18,
    content_type: "original",
    copyright_strikes: 0,
    age_restriction: 0,
    is_premium: false,
    region_restriction: ["US"],
  },
];

// Script to populate database with sample data
async function populateSampleData() {
  try {
    // let userId;
    // // Clear existing data
    // const usersRef = db.collection("users");
    const videosRef = db.collection("videos");

    // // Add users
    // for (const user of users) {
    //   const authUser = await auth.createUser({
    //     email:user.email,
    //     password: user.password,
    //   });
    //   await usersRef.doc(authUser.uid).set(user);
    //   userId = authUser.uid;
    //   console.log(`Added user: ${user.email}`);
    // }

    // Add videos
    for (const video of videos) {
      await videosRef.doc(video.owner_id).set(video);
      console.log(`Added video: ${video.title}`);
    }

    console.log("Sample data populated successfully");
  } catch (error) {
    console.error("Error populating sample data:", error);
  }
}

// Test scenarios
const testScenarios = [
  {
    description: "Regular user trying to view public video",
    user: "regular@test.com",
    video: "video1",
    action: "read",
    expectedResult: true,
  },
  {
    description: "Underage user trying to view age-restricted video",
    user: "regular@test.com",
    video: "video2",
    action: "read",
    expectedResult: false,
  },
  {
    description: "Non-premium user trying to view premium video",
    user: "regular@test.com",
    video: "video4",
    action: "read",
    expectedResult: false,
  },
  {
    description: "Creator trying to monetize video without enough subscribers",
    user: "creator@test.com",
    video: "video1",
    action: "monetize",
    expectedResult: false,
  },
  {
    description: "Eligible creator monetizing video",
    user: "monetized@test.com",
    video: "video3",
    action: "monetize",
    expectedResult: true,
  },
];

// Test function
async function runTests() {
  for (const scenario of testScenarios) {
    try {
      const result = await permit.check(
        scenario.user,
        scenario.action,
        `video:${scenario.video}`
      );
      console.log(`Test: ${scenario.description}`);
      console.log(`Expected: ${scenario.expectedResult}, Got: ${result}`);
      console.log("---");
    } catch (error) {
      console.error(`Error in test "${scenario.description}":`, error);
    }
  }
}
populateSampleData()

export { populateSampleData, runTests };
