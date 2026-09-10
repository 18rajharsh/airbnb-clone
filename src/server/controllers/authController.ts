import { IUser, UserRole } from "../../types";
import { db } from "../models/db";

export interface AuthResponse {
  success: boolean;
  user?: IUser;
  message?: string;
}

export class AuthController {
  // Register new account
  static register(data: { name: string; email: string; role: UserRole; bio?: string }): AuthResponse {
    if (!data.name || !data.email) {
      return { success: false, message: "Name and email are required." };
    }

    const existing = db.findUserByEmail(data.email);
    if (existing) {
      return { success: false, message: "An account with this email already exists." };
    }

    const newUser: IUser = {
      _id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role: data.role || "guest",
      bio: data.bio || "Travel enthusiast and explorer.",
      isSuperhost: data.role === "host",
      joinedDate: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date()),
    };

    db.saveUser(newUser);
    return { success: true, user: newUser, message: "Account created successfully!" };
  }

  // Login
  static login(email: string): AuthResponse {
    if (!email) {
      return { success: false, message: "Email is required." };
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return { success: false, message: "No account found with this email. Please register or select a demo account." };
    }

    return { success: true, user };
  }

  // Quick Switch / Demo Accounts
  static getDemoUsers(): IUser[] {
    return db.getUsers();
  }
}
