// src/pages/SpaceCategoryList.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

const SpaceCatList = () => {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); // or wherever you store the token

            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/space-categories?search=${search}&page=${page}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                }
            );

            const data = await res.json();
            setCategories(data.data);
            setMeta(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, [ page]);

    const deleteCategory = async (id) => {
        const token = localStorage.getItem('token');
        if (!confirm('Are you sure to delete this category?')) return;
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/space-categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        fetchCategories();
    };





    const onEdit = (id) => {
        navigate(`/space-category/edit/${id}`);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 w-1/2">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                    <button
                        onClick={fetchCategories} // or your actual search trigger function
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Search
                    </button>
                </div>

                <Link
                    to="/space-category/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add Category
                </Link>
            </div>


            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">ID</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Short Description</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-gray-50 text-center">
                                    <td className="border border-gray-300 px-4 py-2">{cat.id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{cat.name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{cat.short_description || '-'}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(cat.id)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(cat.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            ))
                        )}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            <div className="mt-4 flex justify-end items-center space-x-2">
                <button
                    disabled={!meta?.prev_page_url}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span>Page {meta?.current_page} of {meta?.last_page}</span>
                <button
                    disabled={!meta?.next_page_url}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SpaceCatList;
