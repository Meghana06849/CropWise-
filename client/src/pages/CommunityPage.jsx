import { useMemo, useState } from 'react';
import { MessageSquare, Heart, Plus, Trash2, Pencil } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import {
  useAddComment,
  useCreatePost,
  useDeleteComment,
  useDeletePost,
  useUpdatePost,
  usePosts,
  useToggleLike
} from '../hooks/useCropwiseQueries';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { CreatePostDialog } from '../components/community/CreatePostDialog';
import { EditPostDialog } from '../components/community/EditPostDialog';
import { getApiErrorMessage } from '../lib/api';
import { formatDateTime } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'General', 'Pest Control', 'Irrigation', 'Market Advice', 'Weather Alert', 'Organic Farming'];

const getFallbackPostImage = (title = 'CropWise Community') => {
  const safeTitle = String(title || 'CropWise Community').slice(0, 48);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1f5d32" />
          <stop offset="100%" stop-color="#6fbc79" />
        </linearGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#g)" />
      <circle cx="1040" cy="140" r="180" fill="rgba(255,255,255,0.12)" />
      <circle cx="180" cy="520" r="220" fill="rgba(255,255,255,0.1)" />
      <text x="80" y="310" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">
        ${safeTitle}
      </text>
      <text x="80" y="365" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.88)">
        CropWise Community Update
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function CommunityPage() {
  const [category, setCategory] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const { user } = useAuth();

  const postsQuery = usePosts(category === 'All' ? {} : { category });
  const createPostMutation = useCreatePost();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();
  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();
  const toggleLikeMutation = useToggleLike();

  const posts = postsQuery.data?.data || [];

  const sortedPosts = useMemo(() => posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [posts]);

  const handleCreatePost = async (payload) => {
    await createPostMutation.mutateAsync(payload);
  };

  const handleComment = async (postId) => {
    const content = commentDrafts[postId]?.trim();
    if (!content) return;
    try {
      await addCommentMutation.mutateAsync({ postId, payload: { content } });
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  };

  const handleLike = async (postId) => {
    try {
      await toggleLikeMutation.mutateAsync({ postId });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  };

  const canModerate = (createdBy) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return String(createdBy || '') === String(user.id || '');
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post and all its comments?')) return;
    try {
      await deletePostMutation.mutateAsync(postId);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteCommentMutation.mutateAsync({ postId, commentId });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  };

  const handleUpdatePost = async (payload) => {
    if (!editingPost?._id) return;
    try {
      await updatePostMutation.mutateAsync({ postId: editingPost._id, payload });
      setEditingPost(null);
      setEditDialogOpen(false);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Community"
        title="Farmer discussion board"
        description="Share observations, questions, and updates with a live post, like, and comment workflow backed by MongoDB."
        action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />New post</Button>}
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <Button key={item} variant={category === item ? 'default' : 'outline'} size="sm" onClick={() => setCategory(item)}>{item}</Button>
        ))}
      </div>

      {postsQuery.isLoading ? (
        <Card><CardContent>Loading community posts...</CardContent></Card>
      ) : postsQuery.isError ? (
        <ErrorState
          title="Community feed failed to load"
          description={getApiErrorMessage(postsQuery.error)}
          onRetry={() => postsQuery.refetch()}
        />
      ) : sortedPosts.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {sortedPosts.map((post) => (
            <Card key={post._id} className="overflow-hidden">
              {post.photo_url ? (
                <img
                  src={post.photo_url}
                  alt={post.title}
                  className="h-56 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = getFallbackPostImage(post.title);
                  }}
                />
              ) : null}
              <CardContent>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge variant="default">{post.category}</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{post.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{post.author_name} • {post.state}, {post.district} • {formatDateTime(post.createdAt)}</p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-crop-50 px-3 py-2 text-sm font-semibold text-crop-800" onClick={() => handleLike(post._id)} type="button">
                    <Heart className="h-4 w-4" /> {post.likes || 0}
                  </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{post.content}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {post.crop_name ? <Badge variant="neutral">{post.crop_name}</Badge> : null}
                  <Badge variant="neutral">{post.comments?.length || 0} comments</Badge>
                  {canModerate(post.createdBy) ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPost(post);
                          setEditDialogOpen(true);
                        }}
                        disabled={updatePostMutation.isPending}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post._id)} disabled={deletePostMutation.isPending}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </>
                  ) : null}
                </div>

                <div className="mt-5 space-y-3 rounded-3xl border border-crop-100 bg-crop-50/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><MessageSquare className="h-4 w-4" /> Add comment</div>
                  <Textarea rows={3} placeholder="Write your advice or question" value={commentDrafts[post._id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post._id]: event.target.value }))} />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => handleComment(post._id)} disabled={addCommentMutation.isPending}>Post comment</Button>
                  </div>
                </div>

                {post.comments?.length ? (
                  <div className="mt-5 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{comment.author_name} • {formatDateTime(comment.createdAt)}</p>
                          {canModerate(comment.createdBy) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(post._id, comment._id)}
                              disabled={deleteCommentMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="No community posts yet"
          description="Create the first post and start a discussion about field conditions, pests, irrigation, or market signals."
          actionLabel="Create post"
          onAction={() => setDialogOpen(true)}
        />
      )}

      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreatePost}
        isPending={createPostMutation.isPending}
        defaultAuthorName={user?.name || ''}
      />

      <EditPostDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdatePost}
        isPending={updatePostMutation.isPending}
        post={editingPost}
      />
    </div>
  );
}
