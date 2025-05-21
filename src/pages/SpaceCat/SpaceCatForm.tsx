// src/pages/SpaceCategoryForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const SpaceCatForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // if present, it's an edit

  const [form, setForm] = useState({
    name: '',
    long_description: '',
    short_description: '',
  });

  const [loading, setLoading] = useState(false);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/space-categories/${id}`,{
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
      const data = await res.json();
      setForm({
        name: data.name || '',
        long_description: data.long_description || '',
        short_description: data.short_description || '',
      });
    } catch (err) {
      console.error('Failed to fetch category:', err);
    }
  };

  useEffect(() => {
    if (id) fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
      const token = localStorage.getItem('token');

    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `${import.meta.env.VITE_API_BASE_URL}/api/space-categories/${id}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/space-categories`;

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setLoading(false);
    navigate('/space-category');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Create'} Space Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            className="border w-full px-3 py-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Short Description</label>
          <textarea
            className="border w-full px-3 py-2 rounded"
            rows="2"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          ></textarea>
        </div>
        <div>
          <label className="block font-medium mb-1">Long Description</label>
          <textarea
            className="border w-full px-3 py-2 rounded"
            rows="4"
            value={form.long_description}
            onChange={(e) => setForm({ ...form, long_description: e.target.value })}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : id ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default SpaceCatForm;
