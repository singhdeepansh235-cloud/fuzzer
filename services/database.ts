
import { User } from '../types';

// Keys for LocalStorage
const DB_USERS_KEY = 'sentinel_users_db';
const SESSION_KEY = 'sentinel_active_session';

interface UserRecord extends User {
  passwordHash: string; // Simulated hash
}

// Initial seed if DB is empty
const seedAdmin = () => {
  const users = getUsers();
  if (users.length === 0) {
    const admin: UserRecord = {
      id: 'usr_admin_001',
      name: 'NCIIPC Admin',
      email: 'admin@nciipc.gov.in',
      role: 'admin',
      createdAt: Date.now(),
      passwordHash: btoa('admin123') // Simple base64 for demo purposes
    };
    saveUsers([admin]);
    console.log('Database seeded with default admin.');
  }
};

// Helper to get all users
const getUsers = (): UserRecord[] => {
  const data = localStorage.getItem(DB_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save users
const saveUsers = (users: UserRecord[]) => {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
};

export const db = {
  // Initialize DB
  init: () => {
    seedAdmin();
  },

  // Register a new user
  register: async (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getUsers();
        if (users.find(u => u.email === email)) {
          reject(new Error('User already exists'));
          return;
        }

        const newUser: UserRecord = {
          id: `usr_${Math.random().toString(36).substr(2, 9)}`,
          name,
          email,
          role: 'analyst',
          createdAt: Date.now(),
          passwordHash: btoa(password)
        };

        users.push(newUser);
        saveUsers(users);
        
        // Remove sensitive data before returning
        const { passwordHash, ...userSafe } = newUser;
        resolve(userSafe);
      }, 800); // Simulate network delay
    });
  },

  // Login
  login: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getUsers();
        const user = users.find(u => u.email === email && u.passwordHash === btoa(password));
        
        if (!user) {
          reject(new Error('Invalid credentials'));
          return;
        }

        // Create Session
        const { passwordHash, ...userSafe } = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userSafe));
        resolve(userSafe);
      }, 1000); // Simulate network delay
    });
  },

  // Get Current Session
  getSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Logout
  logout: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    return Promise.resolve();
  }
};
