const { Schema, model } = require("mongoose");

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: String,
  imageUrl: { type: String, default: '' },
    community: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, required: true },
    responses: { type: Number, default: 0 },
    comments: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: "User" },
        authorName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reactions: [
      {
        by: { type: Schema.Types.ObjectId, ref: "User" },
        type: String,
      },
    ],
    validationStatus: {
      type: String,
      enum: ["pending", "validated", "rejected"],
      default: "validated",
    },
    published: { type: Boolean, default: true },
    aiGenerated: { type: Boolean, default: false },
    editedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

const Post = model("Post", PostSchema);
module.exports = { Post };
