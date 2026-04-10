import { api } from '../lib/api';

export const fetchPredictions = async (filters = {}) => {
  const response = await api.get('/predictions', { params: filters });
  return response.data;
};

export const createPrediction = async (payload) => {
  const response = await api.post('/predict', payload);
  return response.data;
};

export const deletePrediction = async (id) => {
  const response = await api.delete(`/predictions/${id}`);
  return response.data;
};

export const fetchWeather = async (state, district) => {
  const response = await api.get('/weather', { params: { state, district } });
  return response.data;
};

export const fetchPosts = async (filters = {}) => {
  const response = await api.get('/posts', { params: filters });
  return response.data;
};

export const createPost = async (payload) => {
  const response = await api.post('/posts', payload);
  return response.data;
};

export const updatePost = async (postId, payload) => {
  const response = await api.patch(`/posts/${postId}`, payload);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const addComment = async (postId, payload) => {
  const response = await api.post(`/posts/${postId}/comment`, payload);
  return response.data;
};

export const deleteComment = async (postId, commentId) => {
  const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
  return response.data;
};

export const toggleLike = async (postId, payload) => {
  const response = await api.post(`/posts/${postId}/like`, payload);
  return response.data;
};
