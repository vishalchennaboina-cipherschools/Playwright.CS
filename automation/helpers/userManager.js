/**
 * @fileoverview UserManager - Central utility for Test User Management
 *
 * Provides a scalable way to fetch test users based on roles, IDs, or randomly.
 * Abstracts away the underlying data structures (JSON files) and handles credential resolution.
 * 
 * Execution Priority for Credentials:
 * 1. Runtime Credentials (process.env.TEST_EMAIL and process.env.TEST_PASSWORD)
 * 2. Selected Test User's predefined environment variables
 */

'use strict';

const fs = require('fs');
const path = require('path');

class UserManager {
  constructor() {
    this.users = new Map();
    this.loadUsers();
  }

  /**
   * Loads all JSON user definitions into memory.
   * Scans config/applications/ — the single authoritative source for all user data.
   * New applications or roles are loaded automatically when JSON files are added here.
   */
  loadUsers() {
    const appsDir = path.join(__dirname, '../config/applications');
    if (!fs.existsSync(appsDir)) return;

    const apps = fs.readdirSync(appsDir);
    for (const app of apps) {
      const appDir = path.join(appsDir, app);
      if (!fs.statSync(appDir).isDirectory()) continue;

      const files = fs.readdirSync(appDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(appDir, file);
        try {
          const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (Array.isArray(fileData)) {
            for (const user of fileData) {
              if (user.id) {
                this.users.set(user.id, user);
              }
            }
          }
        } catch (error) {
          console.error(`Failed to load users from ${filePath}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Resolves credentials for a given user.
   * Gives priority to runtime credentials (TEST_EMAIL, TEST_PASSWORD).
   * 
   * @param {Object} user 
   * @returns {Object} User object enriched with resolved email and password.
   */
  resolveCredentials(user) {
    if (!user) {
      throw new Error('User not found.');
    }

    // 1. Runtime Credentials
    if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
      return {
        ...user,
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PASSWORD
      };
    }

    // 2. Selected Test User's password from environment variables
    const password = process.env[user.passwordEnv];
    if (!password) {
      throw new Error(`Password not found for user ${user.id}. Missing environment variable: ${user.passwordEnv}`);
    }

    return {
      ...user,
      password
    };
  }

  /**
   * Returns a specific user by ID.
   * @param {string} id 
   * @returns {Object} Resolved User
   */
  getUserById(id) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID '${id}' not found.`);
    }
    return this.resolveCredentials(user);
  }

  /**
   * Returns a specific student user by ID (default: 'student-valid').
   * @param {string} [id='student-valid'] 
   * @returns {Object} Resolved Student User
   */
  getStudent(id = 'student-valid') {
    const user = this.getUserById(id);
    if (user.role !== 'student') {
      throw new Error(`User with ID '${id}' is not a student.`);
    }
    return user;
  }

  /**
   * Returns a specific mentor user by ID (default: 'mentor-valid').
   * @param {string} [id='mentor-valid'] 
   * @returns {Object} Resolved Mentor User
   */
  getMentor(id = 'mentor-valid') {
    const user = this.getUserById(id);
    if (user.role !== 'mentor') {
      throw new Error(`User with ID '${id}' is not a mentor.`);
    }
    return user;
  }

  /**
   * Returns a random user matching the given role.
   * @param {string} role 
   * @returns {Object} Resolved User
   */
  getRandomUserByRole(role) {
    const matchedUsers = Array.from(this.users.values()).filter(u => u.role === role && u.enabled !== false);
    if (matchedUsers.length === 0) {
      throw new Error(`No enabled users found for role: ${role}`);
    }
    const randomIndex = Math.floor(Math.random() * matchedUsers.length);
    return this.resolveCredentials(matchedUsers[randomIndex]);
  }

  /**
   * Returns a random student user.
   * @returns {Object} Resolved Student User
   */
  getRandomStudent() {
    return this.getRandomUserByRole('student');
  }

  /**
   * Returns a random mentor user.
   * @returns {Object} Resolved Mentor User
   */
  getRandomMentor() {
    return this.getRandomUserByRole('mentor');
  }

  /**
   * Future extensibility: Get a specific admin user.
   * @param {string} [id='admin-placeholder'] 
   * @returns {Object} Resolved Admin User
   */
  getAdmin(id = 'admin-placeholder') {
    const user = this.getUserById(id);
    if (user.role !== 'admin') {
      throw new Error(`User with ID '${id}' is not an admin.`);
    }
    return user;
  }

  /**
   * Future extensibility: Filter users by tags.
   * @param {string} tag 
   * @returns {Array<Object>} List of resolved users containing the tag
   */
  getUsersByTag(tag) {
    const matchedUsers = Array.from(this.users.values()).filter(u => u.tags && u.tags.includes(tag));
    return matchedUsers.map(u => this.resolveCredentials(u));
  }

  /**
   * Future extensibility: Get all enabled users.
   * @returns {Array<Object>} List of resolved, enabled users
   */
  getEnabledUsers() {
    const matchedUsers = Array.from(this.users.values()).filter(u => u.enabled !== false);
    return matchedUsers.map(u => this.resolveCredentials(u));
  }
}

// Export a singleton instance
module.exports = new UserManager();
