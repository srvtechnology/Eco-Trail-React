import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

const EcoTrailList = () => {
    const [mainSpaces, setMainSpaces] = useState([]);
    const [search, setSearch] = useState('');
    const [CatId, setCatId] = useState('');
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);


    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/space-categories`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                }
            );
            const data = await res.json();
            setCategories(data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchMainSpaces = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${import.meta.env.VITE_API_BASE_URL}/api/eco-trail/main-spaces?page=${page}`;

            if (search) url += `&search=${search}`;
            if (CatId) url += `&cat_id=${CatId}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const data = await res.json();
            // console.log('Main Spaces:', data.data);
            setMainSpaces(data.data.data);
            setMeta(data.data);
        } catch (error) {
            console.error('Failed to fetch main spaces:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMainSpaces();
    }, [page]);

    const deleteMainSpace = async (id) => {
        if (!confirm('Are you sure to delete this eco trail space and all its nearby places?')) return;

        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/eco-trail/main-spaces/delete/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        fetchMainSpaces();
    };

    const onEdit = (id) => {
        // navigate(`/eco-trail/edit/${id}`);
        window.location.href = `/eco-trail/edit/${id}`;
    };



    const filterFun = () => {
        fetchMainSpaces();
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-2/3">
                    <input
                        type="text"
                        placeholder="Search by place name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />

                    <select
                        name="category_id"
                        value={CatId}
                        onChange={(e) => setCatId(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    >
                        <option value="">Select Category</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={filterFun}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
                    >
                        Apply Filters
                    </button>
                </div>

                <a
                    href="/eco-trail/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap w-full md:w-auto text-center"
                >
                    + Add Eco Trail Space
                </a>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">ID</th>
                                <th className="border border-gray-300 px-4 py-2">Place Name</th>
                                <th className="border border-gray-300 px-4 py-2">Category</th>
                                <th className="border border-gray-300 px-4 py-2">Address</th>
                                {/* <th className="border border-gray-300 px-4 py-2">Nearby Places</th> */}
                                <th className="border border-gray-300 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mainSpaces.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        No eco trail spaces found.
                                    </td>
                                </tr>
                            ) : (
                                mainSpaces.map(space => (
                                    <tr key={space.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2 text-center">{space?.id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{space?.place_name}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{space?.cat_details?.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{space?.full_address}</td>
                                        {/* <td className="border border-gray-300 px-4 py-2 text-center">
                                            {space?.nearby_places?.length || 0}
                                        </td> */}
                                        <td className="border border-gray-300 px-4 py-2">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => onEdit(space.id)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteMainSpace(space.id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                                                >
                                                    Delete
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/eco-trail/map-track/${space.id}`)}
                                                    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition text-sm"
                                                >
                                                    Map
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {meta?.last_page > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        Showing {meta?.from} to {meta?.to} of {meta?.total} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                            let pageNum;
                            if (meta.last_page <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= meta.last_page - 2) {
                                pageNum = meta.last_page - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-3 py-1 rounded ${page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            disabled={page === meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className={`px-3 py-1 rounded ${page === meta.last_page ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoTrailList;