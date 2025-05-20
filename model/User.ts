import mongoose, { Document, Model, HydratedDocument } from "mongoose";

// 1. Define the User interface
interface IUser {
  name: string;
  email: string;
  password?: string; // Optional since required: false
  role: "user" | "admin";
  emailVerified: Date | null;
  onboarded: boolean;
  banned: boolean;
  lastSeen: Date;
  createdAt: Date;
}

// 2. Add Document methods and properties
interface IUserMethods {
  // You can add custom document methods here if needed
}

// 3. Create the type for the User model (static methods)
interface UserModel extends Model<IUser, {}, IUserMethods> {
  // You can add static methods here if needed
}

// 4. Create the schema with proper typing
const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  emailVerified: {
    type: Date,
    default: null
  },
  onboarded: {
    type: Boolean,
    default: false
  },
  banned: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Always remove password from JSON output
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Always remove password from Object output
    }
  }
});

// 5. Type for the hydrated user document
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

// 6. Create and export the model
const User: UserModel = mongoose.models.User || mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;