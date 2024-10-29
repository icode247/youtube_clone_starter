// // backend/src/config/setupPermit.js
// import { Permit } from "permitio";

// const permit = new Permit({
//   pdp: process.env.PERMIT_PDP_URL || "http://0.0.0.0:7766",
//   token:
//     process.env.PERMIT_API_KEY ||
//     "permit_key_JrfSqJxaufgI8duXwcarKn6Dd4e59iUhQcctU36Rdg1VQlKbtV7Dqlk1ALVSaR119eHSjmV9NXgcKOjPeRbidR",
// });

// // backend/src/config/permit.js

// // 1. Define User Sets (Conditions based on user attributes)
// const userSets = {
//   // Verified creators who can monetize
//   monetization_eligible: {
//     conditions: {
//       all: [
//         { equals: { "user.verified": true } },
//         { greater_than: { "user.subscriber_count": 1000 } },
//         { equals: { "user.account_status": "active" } },
//       ],
//     },
//   },
//   // Users in good standing
//   good_standing: {
//     conditions: {
//       all: [
//         { equals: { "user.account_status": "active" } },
//         { equals: { "user.strikes": 0 } },
//       ],
//     },
//   },
// };

// // 2. Define Resource Sets (Conditions based on resource attributes)
// const resourceSets = {
//   // Monetizable videos
//   monetizable_content: {
//     conditions: {
//       all: [
//         { equals: { "resource.status": "published" } },
//         { equals: { "resource.content_type": "original" } },
//         { greater_than: { "resource.duration": 60 } }, // Minimum 1 minute
//         { less_than: { "resource.copyright_claims": 1 } },
//       ],
//     },
//   },
//   // Private videos
//   private_content: {
//     conditions: {
//       all: [
//         { equals: { "resource.visibility": "private" } },
//         { equals: { "resource.owner_id": "${user.id}" } },
//       ],
//     },
//   },
// };

// // 3. Combine with existing RBAC roles
// const roles = [
//   {
//     key: "content_creator",
//     name: "Content Creator",
//     description: "Can create and manage content",
//     permissions: ["video-creators:create", "video-creators:read", "video-creators:update", "video-creators:delete"],
//   },
//   {
//     key: "content_viewer",
//     name: "Viewer",
//     description: "Can view and interact with content",
//     permissions: ["video-creators:read", "video-creators:like", "video-creators:comment"],
//   },
// ];

// // 4. Define ABAC policies using the condition sets
// const abacPolicies = [
//   // Monetization policy
//   {
//     name: "video_monetization",
//     description: "Controls who can monetize videos",
//     resource: "video",
//     action: "monetize",
//     effect: "allow",
//     conditions: {
//       all: [
//         { user_set: "monetization_eligible" },
//         { resource_set: "monetizable_content" },
//       ],
//     },
//   },
//   // Video visibility policy
//   {
//     name: "video_access",
//     description: "Controls who can view videos",
//     resource: "video",
//     action: "read",
//     effect: "allow",
//     conditions: {
//       any: [
//         // Public videos - anyone can view
//         {
//           equals: {
//             "resource.visibility": "public",
//           },
//         },
//         // Private videos - only owner or shared users
//         {
//           all: [
//             { resource_set: "private_content" },
//             { user_set: "good_standing" },
//           ],
//         },
//       ],
//     },
//   },
// ];

// // 5. Export configuration
// const permitConfig = {
//   roles,
//   userSets,
//   resourceSets,
//   abacPolicies,
// };

// async function setupPermit() {
//   try {
//     // 1. Create Resource Type
//     await permit.api.resources.create({
//       key: "video-creators",
//       name: "Video",
//       actions: {
//         create: { name: "create" },
//         read: { name: "read" },
//         update: { name: "update" },
//         delete: { name: "delete" },
//         monetize: { name: "monetize" },
//         like: { name: "like" },
//         comment: { name: "comment" },
//       },
//       attributes: {
//         owner_id: { type: "string" },
//         visibility: { type: "string" },
//         status: { type: "string" },
//         content_type: { type: "string" },
//         duration: { type: "number" },
//         copyright_claims: { type: "number" },
//       },
//     });

//     // 2. Create Roles (RBAC)
//     for (const role of permitConfig.roles) {
//       await permit.api.roles.create(role);
//     }

//     // 3. Create User Sets (ABAC)
//     for (const [key, set] of Object.entries(permitConfig.userSets)) {
//       await permit.api.userSets.create({
//         key,
//         ...set,
//       });
//     }

//     // 4. Create Resource Sets (ABAC)
//     for (const [key, set] of Object.entries(permitConfig.resourceSets)) {
//       await permit.api.resourceSets.create({
//         key,
//         ...set,
//       });
//     }

//     // 5. Create ABAC Policies
//     for (const policy of permitConfig.abacPolicies) {
//       await permit.api.policies.create({
//         key: policy.name.toLowerCase().replace(/\s+/g, "_"),
//         ...policy,
//       });
//     }

//     console.log("Permit.io configuration completed successfully");
//   } catch (error) {
//     console.error("Error initializing Permit.io:", error);
//     throw error;
//   }
// }

// // Run setup
// setupPermit().catch(console.error);

// export default permit;

// backend/src/config/setupPermit.js
import { Permit } from "permitio";

const permit = new Permit({
  pdp: process.env.PERMIT_PDP_URL || "http://0.0.0.0:7766",
  token:
    process.env.PERMIT_API_KEY ||
    "permit_key_JrfSqJxaufgI8duXwcarKn6Dd4e59iUhQcctU36Rdg1VQlKbtV7Dqlk1ALVSaR119eHSjmV9NXgcKOjPeRbidR",
});

const resources = [
  {
    key: "video",
    name: "Video",
    actions: {
      create: { name: "create" },
      read: { name: "read" },
      update: { name: "update" },
      delete: { name: "delete" },
      monetize: { name: "monetize" },
      like: { name: "like" },
      comment: { name: "comment" },
    },
    attributes: {
      owner_id: { type: "string" },
      visibility: {
        type: "string",
      },
      duration: { type: "number" },
      content_type: {
        type: "string",
      },
      copyright_strikes: { type: "number" },
      age_restriction: { type: "number" },
      is_premium: { type: "bool" },
    },
  },
  {
    key: "channel",
    name: "Channel",
    actions: {
      create: { name: "create" },
      read: { name: "read" },
      update: { name: "update" },
      delete: { name: "delete" },
      subscribe: { name: "subscribe" },
      manage: { name: "manage" },
    },
    attributes: {
      owner_id: { type: "string" },
      verified_status: { type: "bool" },
      subscriber_count: { type: "number" },
      channel_strikes: { type: "number" },
    },
  },
  {
    key: "comment",
    name: "Comment",
    actions: {
      create: { name: "create" },
      read: { name: "read" },
      update: { name: "update" },
      delete: { name: "delete" },
    },
    attributes: {
      owner_id: { type: "string" },
      video_id: { type: "string" },
    },
  },
  {
    key: "subscription",
    name: "Subscription",
    actions: {
      create: { name: "create" },
      cancel: { name: "cancel" },
    },
    attributes: {
      status: {
        type: "string",
      },
      expiry_date: { type: "string" },
    },
  },
];

const roles = [
  {
    key: "viewer",
    name: "Viewer",
    description: "Default role for authenticated users",
    permissions: [
      "video:read",
      "video:like",
      "comment:create",
      "comment:read",
      "channel:read",
      "channel:subscribe",
    ],
  },
  {
    key: "content_creator",
    name: "Content Creator",
    description: "Can create and manage content",
    permissions: [
      // Inherit viewer permissions
      "video:read",
      "video:like",
      "comment:create",
      "comment:read",
      "channel:read",
      "channel:subscribe",
      // Additional permissions
      "video:create",
      "video:update",
      "video:delete",
      "video:monetize",
      "channel:create",
      "channel:update",
      "channel:manage",
      "comment:update",
      "comment:delete",
    ],
  },
  {
    key: "admin",
    name: "Administrator",
    description: "Full system access",
    permissions: ["video:*", "channel:*", "comment:*", "subscription:*"],
  },
];

async function setupPermit() {
  try {
    console.log("Setting up Permit.io configuration...");

    // Create resources
    for (const resource of resources) {
      try {
        console.log(`Creating resource: ${resource.key}`);
        await permit.api.resources.create(resource);
      } catch (error) {
        console.log(`Resource ${resource.key} might already exist:`, error);
      }
    }

    // Create roles
    for (const role of roles) {
      try {
        console.log(`Creating role: ${role.key}`);
        await permit.api.roles.create(role);
      } catch (error) {
        console.log(`Role ${role.key} might already exist:`, error.message);
      }
    }

    console.log("Permit.io RBAC configuration completed successfully");
  } catch (error) {
    console.error("Error in Permit.io setup:", error);
    throw error;
  }
}

// Run setup
setupPermit().catch(console.error);

export default permit;
