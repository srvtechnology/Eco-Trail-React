import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';

function SubCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    cat_id: '',
      name: '',
    short_description: '',
    long_description: '',
    additional_info: [{ note: '', tag: '' }],
    existing_images: [],
    new_images: [],
  });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/space-sub-categories/all-cat`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Load existing data if editing
 // In your useEffect for loading data
useEffect(() => {
  if (id) {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/space-sub-categories/${id}`)
      .then(res => {
        const data = res.data;
        let additionalInfo = [];
        
        try {
          // First parse the string from backend
          const parsedString = JSON.parse(data.additional_info || '[]');
          
          // Then check if it's a string that needs to be parsed again
          if (typeof parsedString === 'string') {
            additionalInfo = JSON.parse(parsedString);
          } else {
            additionalInfo = parsedString;
          }
          
          // Ensure it's an array
          if (!Array.isArray(additionalInfo)) {
            additionalInfo = [additionalInfo];
          }
          
          // Clean up each item
          additionalInfo = additionalInfo.map(item => ({
            note: item?.note || '',
            tag: item?.tag || ''
          }));
          
          // Ensure at least one empty field
          if (additionalInfo.length === 0) {
            additionalInfo = [{ note: '', tag: '' }];
          }
        } catch (e) {
          console.error('Error parsing additional_info:', e);
          additionalInfo = [{ note: '', tag: '' }];
        }

        console.log('Processed additional_info:', additionalInfo);
        
        setForm({
          cat_id: data.cat_id || '',
          name: data.name || '',
          short_description: data.short_description || '',
          long_description: data.long_description || '',
          additional_info: additionalInfo,
          existing_images: JSON.parse(data.images || '[]'),
          new_images: [],
        });
      })
      .catch(err => console.error(err));
  }
}, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('additional_info.')) {
      const [_, index, key] = name.split('.');
      setForm(prev => {
        const updatedAdditionalInfo = [...prev.additional_info];
        updatedAdditionalInfo[index] = {
          ...updatedAdditionalInfo[index],
          [key]: value
        };
        return {
          ...prev,
          additional_info: updatedAdditionalInfo
        };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setForm(prev => ({ ...prev, new_images: Array.from(e.target.files) }));
  };

  const handleDeleteExistingImage = (index) => {
    setForm(prev => {
      const updated = [...prev.existing_images];
      updated.splice(index, 1);
      return { ...prev, existing_images: updated };
    });
  };

  const addAdditionalInfo = () => {
    setForm(prev => ({
      ...prev,
      additional_info: [...prev.additional_info, { note: '', tag: '' }]
    }));
  };

  const removeAdditionalInfo = (index) => {
    if (form.additional_info.length <= 1) return;
    setForm(prev => {
      const updated = [...prev.additional_info];
      updated.splice(index, 1);
      return { ...prev, additional_info: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('cat_id', form.cat_id);
      fd.append('short_description', form.short_description);
      fd.append('long_description', form.long_description);
      fd.append('name', form.name);

      // Stringify the additional_info array
      fd.append('additional_info', JSON.stringify(form.additional_info));

      // Add existing images (only when editing)
      if (id) {
        form.existing_images.forEach(img => fd.append('existing_images[]', img));
      }

      // Add new images
      form.new_images.forEach(file => fd.append('images[]', file));

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (id) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/space-sub-categories/${id}?_method=PUT`,
          fd,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/space-sub-categories`,
          fd,
          config
        );
      }

      navigate('/space-sub-category');
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.response?.data?.message || 'Submit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6">{id ? 'Edit' : 'Create'} Space SubCategory</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            name="cat_id"
            value={form.cat_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

       
        <div>
          <label className="block mb-1 font-medium">Sub Category Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
          </div>

        <div>
          <label className="block mb-1 font-medium">Short Description</label>
          <textarea
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Long Description</label>
          <textarea
            name="long_description"
            value={form.long_description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Additional Info</label>
          {console.log('Additional Info:', form.additional_info)}
          {form.additional_info.map((info, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-4 items-end">
              <div>
                <input
                  type="text"
                  name={`additional_info.${index}.note`}
                  value={info.note || ''}
                  onChange={handleChange}
                  placeholder="Note"
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name={`additional_info.${index}.tag`}
                    value={info.tag || ''}
                    onChange={handleChange}
                    placeholder="Tag"
                    className="border border-gray-300 rounded p-2 flex-1"
                  />
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addAdditionalInfo}
                      className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeAdditionalInfo(index)}
                      className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block mb-1 font-medium">Images</label>
          {!id && form.existing_images.length === 0 && (
            <p className="text-gray-500 mb-2">No images uploaded yet</p>
          )}
          
          {id && (
            <>
              <p className="text-sm text-gray-500 mb-2">Existing Images</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.existing_images.length === 0 ? (
                  <p className="text-gray-500">No existing images</p>
                ) : (
                  form.existing_images.map((img, i) => (
                    <div key={i} className="relative">
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL}${img}`} 
                        alt={`existing-${i}`} 
                        className="h-20 w-20 object-cover rounded border" 
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(i)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          
          <div>
            <label className="block mb-1 font-medium">
              {id ? 'Upload Additional Images' : 'Upload Images'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 rounded p-2 w-full"
            />
            {form.new_images.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {form.new_images.length} file(s) selected
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : (id ? 'Update' : 'Create')}
        </button>
      </form>
    </div>
  );
}

export default SubCategoryForm;