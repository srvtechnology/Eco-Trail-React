import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';

function SubCategoryList() {
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/space-sub-categories`)
      .then(res => setSubcategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/space-sub-categories/${id}`);
      setSubcategories(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
      alert('Delete failed');
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Space SubCategories</h2>
        <Link to="/space-sub-category/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New</Link>
      </div>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border-b">ID</th>
            <th className="p-2 border-b">Category Name</th>
             <th className="p-2 border-b">Sub Category Name</th>
            <th className="p-2 border-b">Short Description</th>
            <th className="p-2 border-b">Images</th>
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map(item => (
            <tr key={item.id} className="border-b hover:bg-gray-50 text-center">
              <td className="border border-gray-300 px-4 py-2">{item.id}</td>
              <td className="border border-gray-300 px-4 py-2">{item.space_cat.name}</td>
              <td className="border border-gray-300 px-4 py-2">{item.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {item.short_description?.slice(0, 40) || '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex justify-center flex-wrap gap-2">
                  {(JSON.parse(item.images || '[]')).map((img, i) => (
                    <img
                      key={i}
                      src={`${import.meta.env.VITE_API_BASE_URL}${img}`}
                      alt="img"
                      className="h-10 w-10 object-cover rounded border"
                    />
                  ))}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  to={`/space-sub-category/edit/${item.id}`}
                  className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="inline-block bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>

          ))}
          {subcategories.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">No subcategories found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SubCategoryList;
