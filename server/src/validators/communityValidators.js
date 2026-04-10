import { body, param, query } from "express-validator";

export const createPostValidation = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("content").trim().notEmpty().withMessage("content is required"),
  body("category").trim().notEmpty().withMessage("category is required"),
  body("photo_url")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const isHttpUrl = /^https?:\/\//i.test(value);
      const isDataUrl = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value);
      return isHttpUrl || isDataUrl;
    })
    .withMessage("photo_url must be a valid URL or image data URL"),
  body("crop_name").optional().isString().trim(),
  body("state").trim().notEmpty().withMessage("state is required"),
  body("district").trim().notEmpty().withMessage("district is required"),
  body("author_name").optional().isString().trim()
];

export const getPostsValidation = [
  query("category").optional().isString().trim(),
  query("state").optional().isString().trim(),
  query("district").optional().isString().trim(),
  query("crop_name").optional().isString().trim(),
  query("search").optional().isString().trim()
];

export const addCommentValidation = [
  param("id").isMongoId().withMessage("Valid post id is required"),
  body("content").trim().notEmpty().withMessage("content is required")
];

export const updatePostValidation = [
  param("id").isMongoId().withMessage("Valid post id is required"),
  body("title").optional().trim().notEmpty().withMessage("title cannot be empty"),
  body("content").optional().trim().notEmpty().withMessage("content cannot be empty"),
  body("category").optional().trim().notEmpty().withMessage("category cannot be empty"),
  body("photo_url")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const isHttpUrl = /^https?:\/\//i.test(value);
      const isDataUrl = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value);
      return isHttpUrl || isDataUrl;
    })
    .withMessage("photo_url must be a valid URL or image data URL"),
  body("crop_name").optional().isString().trim(),
  body("state").optional().trim().notEmpty().withMessage("state cannot be empty"),
  body("district").optional().trim().notEmpty().withMessage("district cannot be empty")
];

export const deletePostValidation = [
  param("id").isMongoId().withMessage("Valid post id is required")
];

export const deleteCommentValidation = [
  param("postId").isMongoId().withMessage("Valid post id is required"),
  param("commentId").isMongoId().withMessage("Valid comment id is required")
];

export const likePostValidation = [
  param("id").isMongoId().withMessage("Valid post id is required")
];
