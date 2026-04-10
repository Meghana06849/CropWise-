import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { useEffect, useState } from 'react';

const categories = ['General', 'Pest Control', 'Irrigation', 'Market Advice', 'Weather Alert', 'Organic Farming'];

export function CreatePostDialog({ open, onOpenChange, onSubmit, isPending, defaultAuthorName = '' }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    photo_url: '',
    crop_name: '',
    state: '',
    district: '',
    author_name: ''
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (open) {
      setForm((current) => ({ ...current, author_name: defaultAuthorName || current.author_name }));
    } else {
      setPreview('');
    }
  }, [defaultAuthorName, open]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setPreview(dataUrl);
      update('photo_url', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm({ title: '', content: '', category: 'General', photo_url: '', crop_name: '', state: '', district: '', author_name: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div>
          <DialogTitle>Create community post</DialogTitle>
          <DialogDescription>Share a field issue, market update, or farm tip with the CropWise community.</DialogDescription>
        </div>
      </DialogHeader>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Title" value={form.title} onChange={(event) => update('title', event.target.value)} required />
          <Input placeholder="Author name" value={form.author_name} onChange={(event) => update('author_name', event.target.value)} required />
        </div>
        <Textarea placeholder="Describe the issue or share advice" value={form.content} onChange={(event) => update('content', event.target.value)} required />
        <div className="grid gap-4 md:grid-cols-3">
          <Select value={form.category} onChange={(event) => update('category', event.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </Select>
          <Input placeholder="Crop name" value={form.crop_name} onChange={(event) => update('crop_name', event.target.value)} />
          <Input placeholder="State" value={form.state} onChange={(event) => update('state', event.target.value)} required />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="District" value={form.district} onChange={(event) => update('district', event.target.value)} required />
          <Input type="file" accept="image/*" onChange={handleFile} />
        </div>
        {preview ? <img src={preview} alt="Preview" className="max-h-64 rounded-3xl object-cover" /> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={isPending}>Publish</Button>
        </div>
      </form>
    </Dialog>
  );
}
