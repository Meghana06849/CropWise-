import { useEffect, useState } from 'react';
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';

const categories = ['General', 'Pest Control', 'Irrigation', 'Market Advice', 'Weather Alert', 'Organic Farming'];

export function EditPostDialog({ open, onOpenChange, onSubmit, isPending, post }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    photo_url: '',
    crop_name: '',
    state: '',
    district: ''
  });

  useEffect(() => {
    if (!post) return;
    setForm({
      title: post.title || '',
      content: post.content || '',
      category: post.category || 'General',
      photo_url: post.photo_url || '',
      crop_name: post.crop_name || '',
      state: post.state || '',
      district: post.district || ''
    });
  }, [post]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div>
          <DialogTitle>Edit post</DialogTitle>
          <DialogDescription>Update your post details and save changes.</DialogDescription>
        </div>
      </DialogHeader>

      <form className="grid gap-4" onSubmit={submit}>
        <Input placeholder="Title" value={form.title} onChange={(event) => update('title', event.target.value)} required />
        <Textarea placeholder="Content" value={form.content} onChange={(event) => update('content', event.target.value)} required />
        <div className="grid gap-4 md:grid-cols-3">
          <Select value={form.category} onChange={(event) => update('category', event.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </Select>
          <Input placeholder="Crop name" value={form.crop_name} onChange={(event) => update('crop_name', event.target.value)} />
          <Input placeholder="Photo URL or data URL" value={form.photo_url} onChange={(event) => update('photo_url', event.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="State" value={form.state} onChange={(event) => update('state', event.target.value)} required />
          <Input placeholder="District" value={form.district} onChange={(event) => update('district', event.target.value)} required />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={isPending}>Save changes</Button>
        </div>
      </form>
    </Dialog>
  );
}
