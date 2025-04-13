import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type PortfolioItem = Database['public']['Tables']['service_agent_portfolio_items']['Insert'];

interface PortfolioItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PortfolioItemForm: React.FC<PortfolioItemFormProps> = ({ onSuccess, onCancel }: PortfolioItemFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev: File[]) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload images
      const imageUrls = await Promise.all(
        images.map(async (file: File) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('portfolio-items')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('portfolio-items')
            .getPublicUrl(fileName);

          return publicUrl;
        })
      );

      // Create portfolio item
      const portfolioItem: PortfolioItem = {
        service_agent_id: user.id,
        title,
        description,
        image_url: imageUrls[0], // Use the first image as the main image
        tags: [], // Empty tags array
        is_featured: false,
      };

      const { error: insertError } = await supabase
        .from('service_agent_portfolio_items')
        .insert(portfolioItem);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio item');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Portfolio Item</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Project Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">
            Completion Date
          </label>
          <input
            type="date"
            id="completionDate"
            value={completionDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompletionDate(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Images
          </label>
          <div className="mt-2 flex flex-wrap gap-4">
            {images.map((file, index) => (
              <div
                key={index}
                className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="mt-2 text-xs text-gray-500">Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                multiple
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Uploading...
              </span>
            ) : (
              'Add Portfolio Item'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioItemForm;