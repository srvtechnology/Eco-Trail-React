import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import NearPlaceMaps from './NearPlaceMaps';
import axios from 'axios';

const libraries = ['places'];
const mapContainerStyle = {
  height: '400px',
  width: '100%'
};
const center = {
  lat: 0,
  lng: 0
};

const EcoTrailForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    place_name: '',
    description: '',
    category_id: '',
    latitude: '',
    longitude: '',
    google_maps_link: '',
    full_address: '',
    featured_image: null,
    gallery_images: [],
    nearby_places: []
  });
  const [errors, setErrors] = useState({});
  const [mapCenter, setMapCenter] = useState(center);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [availableTrees, setAvailableTrees] = useState([
    "Oak", "Maple", "Pine", "Birch", "Willow",
    "Redwood", "Palm", "Cedar", "Spruce", "Elm"
  ]);

  const mapRef = useRef(null);
  const mainAutocompleteRef = useRef(null);
  const nearbyAutocompleteRefs = useRef([]);


  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/space-sub-categories`)
      .then(res => setSubCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  useEffect(() => {
    nearbyAutocompleteRefs.current = nearbyAutocompleteRefs.current.slice(0, formData.nearby_places.length);
  }, [formData.nearby_places.length]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchMainSpace();
    }
    fetchCategories();
  }, [id]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const fetchMainSpace = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/eco-trail/main-spaces/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const response = await res.json();
      const data = response.data;

      const parsedGalleryImages = JSON.parse(data.gallery_images || '[]');
      const parsedNearbyPlaces = data.nearby_places.map(place => ({
        ...place,
        images: JSON.parse(place.images || '[]'),
        trees: JSON.parse(place.trees || '[]'),
        facilities_available: JSON.parse(place.facilities_available || '[]'),
        additional_info: JSON.parse(place.additional_info || '[]'),
        selectedTrees: JSON.parse(place.trees || '[]')
      }));

      setFormData({
        ...data,
        gallery_images: [],
        nearby_places: parsedNearbyPlaces,
        featured_image: null
      });

      setExistingImages(parsedGalleryImages.map(img => ({
        url: `${import.meta.env.VITE_API_BASE_URL}/storage/${img}`,
        path: img
      })));

      if (data.featured_image) {
        setFeaturedImagePreview({
          url: `${import.meta.env.VITE_API_BASE_URL}/storage/${data.featured_image}`,
          path: data.featured_image
        });
      }

      if (data.latitude && data.longitude) {
        setMapCenter({
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude)
        });
      }
    } catch (error) {
      console.error('Failed to fetch main space:', error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/space-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + imagePreviews.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    setSelectedFiles(files);

    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const removeExistingImage = (index) => {
    const newExisting = [...existingImages];
    newExisting.splice(index, 1);
    setExistingImages(newExisting);
  };

  const handlePlaceSelect = () => {
    if (mainAutocompleteRef.current) {
      const place = mainAutocompleteRef.current.getPlace();
      if (!place.geometry) {
        console.log("No geometry available for selected place");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        full_address: place.formatted_address
      }));

      setMapCenter({ lat, lng });
    }
  };

  const handleNearbyPlaceLocationSelect = (placeIndex) => {
    if (nearbyAutocompleteRefs.current[placeIndex]) {
      const place = nearbyAutocompleteRefs.current[placeIndex].getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        handleNearbyPlaceChange(placeIndex, 'latitude', lat);
        handleNearbyPlaceChange(placeIndex, 'longitude', lng);
        handleNearbyPlaceChange(placeIndex, 'address', place.formatted_address);

        if (formData.latitude && formData.longitude) {
          const R = 6371;
          const lat1 = parseFloat(formData.latitude);
          const lon1 = parseFloat(formData.longitude);
          const lat2 = lat;
          const lon2 = lng;

          const dLat = deg2rad(lat2 - lat1);
          const dLon = deg2rad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          handleNearbyPlaceChange(placeIndex, 'distance_from_main', distance.toFixed(2));
        }

        if (placeIndex > 0) {
          calculateDistance(placeIndex);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNearbyPlaceChange = (index, field, value) => {
    const updatedPlaces = [...formData.nearby_places];
    updatedPlaces[index][field] = value;
    setFormData(prev => ({ ...prev, nearby_places: updatedPlaces }));
  };

  const handleTreeSelection = (placeIndex, tree) => {
    const updatedPlaces = [...formData.nearby_places];
    const selectedTrees = updatedPlaces[placeIndex].selectedTrees || [];

    const treeIndex = selectedTrees.indexOf(tree);
    if (treeIndex === -1) {
      selectedTrees.push(tree);
    } else {
      selectedTrees.splice(treeIndex, 1);
    }

    updatedPlaces[placeIndex].selectedTrees = selectedTrees;
    updatedPlaces[placeIndex].trees = selectedTrees;

    setFormData(prev => ({ ...prev, nearby_places: updatedPlaces }));
  };

  const addNearbyPlace = () => {
    setFormData(prev => ({
      ...prev,
      nearby_places: [
        ...prev.nearby_places,
        {
          place_name: '',
          latitude: '',
          longitude: '',
          address: '',
          description: '',
          distance_from_main: '',
          distance_unit: 'km',
          images: [],
          trees: [],
          selectedTrees: [],
          wildlife: '',
          best_time_to_visit: '',
          entry_fee: '',
          opening_hours: '',
          facilities_available: [],
          safety_tips: '',
          estimated_time_spend: '',
          distance_from_last_point: '',
          additional_info: [{ key: '', value: '' }]
        }
      ]
    }));
  };

  const removeNearbyPlace = (index) => {
    const updatedPlaces = [...formData.nearby_places];
    updatedPlaces.splice(index, 1);
    setFormData(prev => ({ ...prev, nearby_places: updatedPlaces }));
  };

  const addKeyValuePair = (placeIndex) => {
    const updatedPlaces = [...formData.nearby_places];
    updatedPlaces[placeIndex].additional_info.push({ key: '', value: '' });
    setFormData(prev => ({ ...prev, nearby_places: updatedPlaces }));
  };

  const removeKeyValuePair = (placeIndex, kvIndex) => {
    const updatedPlaces = [...formData.nearby_places];
    updatedPlaces[placeIndex].additional_info.splice(kvIndex, 1);
    setFormData(prev => ({ ...prev, nearby_places: updatedPlaces }));
  };

  const handleKeyValueChange = (placeIndex, kvIndex, field, value) => {
    const updatedPlaces = [...formData.nearby_places];
    updatedPlaces[placeIndex].additional_info[kvIndex][field] = value;
    setFormData(prev => ({ ...prev, nearby_places: updatedPlaces }));
  };

  const calculateDistance = (placeIndex) => {
    if (placeIndex === 0) return;

    const prevPlace = formData.nearby_places[placeIndex - 1];
    const currentPlace = formData.nearby_places[placeIndex];

    if (!prevPlace.latitude || !prevPlace.longitude || !currentPlace.latitude || !currentPlace.longitude) {
      return;
    }

    const R = 6371;
    const lat1 = deg2rad(parseFloat(prevPlace.latitude));
    const lon1 = deg2rad(parseFloat(prevPlace.longitude));
    const lat2 = deg2rad(parseFloat(currentPlace.latitude));
    const lon2 = deg2rad(parseFloat(currentPlace.longitude));

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    handleNearbyPlaceChange(placeIndex, 'distance_from_last_point', distance.toFixed(2));
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      formDataToSend.append('place_name', formData.place_name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      formDataToSend.append('google_maps_link', formData.google_maps_link);
      formDataToSend.append('full_address', formData.full_address);

      if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image);
      }

      selectedFiles.forEach(file => {
        formDataToSend.append('gallery_images[]', file);
      });

      existingImages.forEach(img => {
        formDataToSend.append('existing_images[]', img.path);
      });

      const nearbyPlacesToSend = formData.nearby_places.map(place => ({
        ...place,
        trees: place.selectedTrees
      }));
      formDataToSend.append('nearby_places', JSON.stringify(nearbyPlacesToSend));

      const url = isEditMode
        ? `${import.meta.env.VITE_API_BASE_URL}/api/eco-trail/main-spaces/${id}?_method=PUT`
        : `${import.meta.env.VITE_API_BASE_URL}/api/eco-trail/main-spaces`;


      const method = isEditMode ? 'POST' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/eco-trail');
      } else {
        setErrors(data.errors || {});
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setLoading(false);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;
  if (loading && isEditMode) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Eco Trail Space' : 'Create New Eco Trail Space'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Place Name*</label>
              <input
                type="text"
                name="place_name"
                value={formData.place_name}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              {errors.place_name && <p className="text-red-500 text-sm">{errors.place_name}</p>}
            </div>

            <div>
              <label className="block mb-2 font-medium">Category*</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                rows="4"
                required
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Location Search*</label>
              <Autocomplete
                onLoad={auto => mainAutocompleteRef.current = auto}
                onPlaceChanged={handlePlaceSelect}
              >
                <input
                  type="text"
                  placeholder="Search for a location"
                  className="w-full border px-3 py-2 rounded"
                  defaultValue={formData.full_address}
                />
              </Autocomplete>
              {errors.full_address && <p className="text-red-500 text-sm">{errors.full_address}</p>}
            </div>

            <div>
              <label className="block mb-2 font-medium">Latitude*</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude}</p>}
            </div>

            <div>
              <label className="block mb-2 font-medium">Longitude*</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Google Maps Link</label>
              <input
                type="url"
                name="google_maps_link"
                value={formData.google_maps_link}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.google_maps_link && <p className="text-red-500 text-sm">{errors.google_maps_link}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Full Address*</label>
              <textarea
                name="full_address"
                value={formData.full_address}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                rows="2"
                required
              />
              {errors.full_address && <p className="text-red-500 text-sm">{errors.full_address}</p>}
            </div>
          </div>


          {formData.latitude && formData.longitude ? (
            <div className="mt-2 text-sm text-gray-600">
              Coordinates: {formData.latitude}, {formData.longitude}
            </div>
          ) : (
            <div className="mt-4" style={{ height: '400px' }}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{
                  lat: parseFloat(formData.latitude),
                  lng: parseFloat(formData.longitude),
                }}
                zoom={15}
                onLoad={onMapLoad}
                onUnmount={onUnmount}
              >
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={{ lat: Number(formData.latitude), lng: Number(formData.longitude) }}
                  />
                )}
              </GoogleMap>
            </div>

          )}

          <NearPlaceMaps lat={formData.latitude} lng={formData.longitude} />
        </div>

        <div className="mb-8 p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Media</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Featured Image</label>
              {featuredImagePreview && (
                <div className="relative mb-2">
                  <img
                    src={featuredImagePreview.url || featuredImagePreview.preview}
                    alt="Featured preview"
                    className="h-32 w-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImagePreview(null);
                      setFormData(prev => ({ ...prev, featured_image: null }));
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFormData(prev => ({ ...prev, featured_image: e.target.files[0] }));
                    setFeaturedImagePreview({
                      file: e.target.files[0],
                      preview: URL.createObjectURL(e.target.files[0])
                    });
                  }
                }}
                className="w-full border px-3 py-2 rounded"
                accept="image/*"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Gallery Images (Max 10)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full border px-3 py-2 rounded"
                accept="image/*"
                multiple
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-4 mt-4">
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={img.url}
                      alt={`Existing ${index}`}
                      className="h-32 w-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={preview.preview}
                      alt={`Preview ${index}`}
                      className="h-32 w-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Nearby Places to Visit</h3>

          {formData.nearby_places.map((place, placeIndex) => (
            <div key={placeIndex} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Place #{placeIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeNearbyPlace(placeIndex)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Place Name*</label>
                  <input
                    type="text"
                    value={place.place_name}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'place_name', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Sub Category (Famous For)</label>
                  <select
                    value={place.sub_cat_id}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'sub_cat_id', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Location Search*</label>
                  <Autocomplete
                    onLoad={auto => nearbyAutocompleteRefs.current[placeIndex] = auto}
                    onPlaceChanged={() => handleNearbyPlaceLocationSelect(placeIndex)}
                  >
                    <input
                      type="text"
                      placeholder="Search for a location"
                      className="w-full border px-3 py-2 rounded"
                      defaultValue={place.address}
                    />
                  </Autocomplete>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Latitude*</label>
                  <input
                    type="text"
                    value={place.latitude}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'latitude', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Longitude*</label>
                  <input
                    type="text"
                    value={place.longitude}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'longitude', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>


                <NearPlaceMaps lat={place?.latitude} lng={place?.longitude} />

                <div>
                  <label className="block mb-2 font-medium">Distance from Main Place*</label>
                  <div className="flex">
                    <input
                      type="number"
                      step="0.01"
                      value={place.distance_from_main}
                      onChange={(e) => handleNearbyPlaceChange(placeIndex, 'distance_from_main', e.target.value)}
                      className="w-full border px-3 py-2 rounded rounded-r-none"
                      required
                    />
                    <select
                      value={place.distance_unit}
                      onChange={(e) => handleNearbyPlaceChange(placeIndex, 'distance_unit', e.target.value)}
                      className="border border-l-0 px-3 py-2 rounded rounded-l-none"
                    >
                      <option value="km">km</option>
                      <option value="miles">miles</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Distance from Previous Point</label>
                  <div className="flex">
                    <input
                      type="number"
                      step="0.01"
                      value={place.distance_from_last_point}
                      onChange={(e) => handleNearbyPlaceChange(placeIndex, 'distance_from_last_point', e.target.value)}
                      className="w-full border px-3 py-2 rounded rounded-r-none"
                      readOnly={placeIndex > 0}
                    />
                    <span className="border border-l-0 px-3 py-2 bg-gray-100 rounded rounded-l-none">
                      {place.distance_unit}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Description*</label>
                  <textarea
                    value={place.description}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'description', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Wildlife</label>
                  <input
                    type="text"
                    value={place.wildlife}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'wildlife', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Best Time to Visit</label>
                  <input
                    type="text"
                    value={place.best_time_to_visit}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'best_time_to_visit', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Entry Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={place.entry_fee}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'entry_fee', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Opening Hours</label>
                  <input
                    type="text"
                    value={place.opening_hours}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'opening_hours', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Estimated Time to Spend</label>
                  <input
                    type="text"
                    value={place.estimated_time_spend}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'estimated_time_spend', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., 2-3 hours"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Safety Tips</label>
                  <textarea
                    value={place.safety_tips}
                    onChange={(e) => handleNearbyPlaceChange(placeIndex, 'safety_tips', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    rows="2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Facilities Available</label>
                  <div className="flex flex-wrap gap-2">
                    {['Restroom', 'Parking', 'Guide', 'Food', 'First Aid', 'Viewpoint', 'Camping'].map(facility => (
                      <div key={facility} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`facility-${placeIndex}-${facility}`}
                          checked={place.facilities_available?.includes(facility) || false}
                          onChange={(e) => {
                            const updatedFacilities = place.facilities_available || [];
                            if (e.target.checked) {
                              updatedFacilities.push(facility);
                            } else {
                              const index = updatedFacilities.indexOf(facility);
                              if (index > -1) {
                                updatedFacilities.splice(index, 1);
                              }
                            }
                            handleNearbyPlaceChange(placeIndex, 'facilities_available', updatedFacilities);
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`facility-${placeIndex}-${facility}`}>{facility}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Trees Found</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTrees.map(tree => (
                      <div key={tree} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`tree-${placeIndex}-${tree}`}
                          checked={place.selectedTrees?.includes(tree) || false}
                          onChange={() => handleTreeSelection(placeIndex, tree)}
                          className="mr-2"
                        />
                        <label htmlFor={`tree-${placeIndex}-${tree}`}>{tree}</label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    Selected: {place.selectedTrees?.join(', ') || 'None'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Additional Info</label>
                  <div className="space-y-2">
                    {place.additional_info?.map((item, kvIndex) => (
                      <div key={kvIndex} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Key"
                          value={item.key}
                          onChange={(e) => handleKeyValueChange(placeIndex, kvIndex, 'key', e.target.value)}
                          className="border px-3 py-2 rounded flex-1"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={item.value}
                          onChange={(e) => handleKeyValueChange(placeIndex, kvIndex, 'value', e.target.value)}
                          className="border px-3 py-2 rounded flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeKeyValuePair(placeIndex, kvIndex)}
                          className="bg-red-500 text-white px-3 py-2 rounded"
                          disabled={place.additional_info.length <= 1}
                        >
                          -
                        </button>
                        {kvIndex === place.additional_info.length - 1 && (
                          <button
                            type="button"
                            onClick={() => addKeyValuePair(placeIndex)}
                            className="bg-green-500 text-white px-3 py-2 rounded"
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addNearbyPlace}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Add Nearby Place
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/eco-trail')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 flex items-center"
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EcoTrailForm;