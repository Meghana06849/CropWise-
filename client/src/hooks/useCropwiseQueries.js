import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addComment,
  createPost,
  createPrediction,
  deleteComment,
  deletePost,
  deletePrediction,
  fetchPosts,
  fetchPredictions,
  fetchWeather,
  updatePost,
  toggleLike
} from '../api/cropwise';

export const queryKeys = {
  predictions: ['predictions'],
  posts: ['posts']
};

export const usePredictions = (filters = {}) =>
  useQuery({
    queryKey: [...queryKeys.predictions, filters],
    queryFn: () => fetchPredictions(filters)
  });

export const usePosts = (filters = {}) =>
  useQuery({
    queryKey: [...queryKeys.posts, filters],
    queryFn: () => fetchPosts(filters)
  });

export const useWeather = (state, district, enabled = true) =>
  useQuery({
    queryKey: ['weather', state, district],
    queryFn: () => fetchWeather(state, district),
    enabled: Boolean(enabled && state && district)
  });

export const useCreatePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions });
    }
  });
};

export const useDeletePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions });
    }
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }) => addComment(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }) => deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }) => updatePost(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};
