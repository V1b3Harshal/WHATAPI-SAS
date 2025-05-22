import mongoose, { Document, Model, HydratedDocument } from "mongoose";
import bcrypt from 'bcryptjs';

// 1. Define the User interface
interface IUser {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  emailVerified: Date | null;
  onboarded: boolean;
  banned: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Add Document methods and properties
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 3. Create the type for the User model (static methods)
interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods> | null>;
}

// 4. Create the schema with proper typing
const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: false,
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
      message: 'Role must be either "user" or "admin"'
    },
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
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    }
  }
});

// Document method for comparing passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method for finding by email (implementation)
UserSchema.statics.findByEmail = async function(email: string) {
  return this.findOne({ email });
};

// Role validation
UserSchema.path('role').validate(function(value) {
  return ['user', 'admin'].includes(value);
}, 'Invalid role');

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ banned: 1 });

// 5. Type for the hydrated user document
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

// 6. Create and export the model
const User: UserModel = (mongoose.models.User as UserModel) || mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;