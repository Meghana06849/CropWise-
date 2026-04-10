import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["farmer", "expert", "admin"], default: "farmer" },
    lastLoginAt: { type: Date, default: null },
    lastLogoutAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    lastLoginAt: this.lastLoginAt,
    lastLogoutAt: this.lastLogoutAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const User = mongoose.model("User", userSchema);

export default User;
