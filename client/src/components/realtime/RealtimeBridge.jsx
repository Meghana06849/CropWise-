import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket, isRealtimeEnabled } from '../../lib/socket';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export function RealtimeBridge() {
  const queryClient = useQueryClient();
  const { token, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!isRealtimeEnabled || !socket || !isAuthenticated || !token) {
      socket?.disconnect();
      return undefined;
    }

    socket.auth = { token };
    socket.connect();

    const refreshPredictions = () => queryClient.invalidateQueries({ queryKey: ['predictions'] });
    const refreshPosts = () => queryClient.invalidateQueries({ queryKey: ['posts'] });

    const onPredictionCreated = () => {
      refreshPredictions();
      addNotification({
        title: 'New Prediction',
        message: 'A new crop prediction was generated.'
      });
    };

    const onPredictionDeleted = () => {
      refreshPredictions();
      addNotification({
        title: 'Prediction Removed',
        message: 'A prediction was deleted from history.'
      });
    };

    const onPostCreated = () => {
      refreshPosts();
      addNotification({
        title: 'New Community Post',
        message: 'Someone created a new community update.'
      });
    };

    const onCommentCreated = () => {
      refreshPosts();
      addNotification({
        title: 'New Comment',
        message: 'A new comment was added in community.'
      });
    };

    const onPostLiked = () => {
      refreshPosts();
      addNotification({
        title: 'Post Engagement',
        message: 'A community post received a new like.'
      });
    };

    const onPostUpdated = () => {
      refreshPosts();
      addNotification({
        title: 'Post Updated',
        message: 'A community post was updated.'
      });
    };

    const onPostDeleted = () => {
      refreshPosts();
      addNotification({
        title: 'Post Deleted',
        message: 'A community post was removed.'
      });
    };

    const onCommentDeleted = () => {
      refreshPosts();
      addNotification({
        title: 'Comment Deleted',
        message: 'A community comment was removed.'
      });
    };

    socket.on('prediction:created', onPredictionCreated);
    socket.on('prediction:deleted', onPredictionDeleted);
    socket.on('community:postCreated', onPostCreated);
    socket.on('community:commentCreated', onCommentCreated);
    socket.on('community:postLiked', onPostLiked);
    socket.on('community:postUpdated', onPostUpdated);
    socket.on('community:postDeleted', onPostDeleted);
    socket.on('community:commentDeleted', onCommentDeleted);

    return () => {
      socket.off('prediction:created', onPredictionCreated);
      socket.off('prediction:deleted', onPredictionDeleted);
      socket.off('community:postCreated', onPostCreated);
      socket.off('community:commentCreated', onCommentCreated);
      socket.off('community:postLiked', onPostLiked);
      socket.off('community:postUpdated', onPostUpdated);
      socket.off('community:postDeleted', onPostDeleted);
      socket.off('community:commentDeleted', onCommentDeleted);
      socket.disconnect();
    };
  }, [isAuthenticated, token, queryClient, addNotification]);

  return null;
}
