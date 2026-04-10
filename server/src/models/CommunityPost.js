import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, required: true, trim: true },
    photo_url: { type: String, trim: true },
    crop_name: { type: String, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null
    },
    author_name: { type: String, required: true, trim: true, maxlength: 100 },
    likes: { type: Number, default: 0, min: 0 },
    liked_by: { type: [String], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ state: 1, district: 1, createdAt: -1 });
communityPostSchema.index({ title: "text", content: "text", crop_name: "text" });

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

export default CommunityPost;
