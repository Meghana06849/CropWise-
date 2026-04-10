import mongoose from "mongoose";

const communityCommentSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: true,
      index: true
    },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null
    },
    author_name: { type: String, required: true, trim: true, maxlength: 100 }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

communityCommentSchema.index({ post_id: 1, createdAt: -1 });

const CommunityComment = mongoose.model("CommunityComment", communityCommentSchema);

export default CommunityComment;
