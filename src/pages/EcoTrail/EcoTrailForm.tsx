import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import NearPlaceMaps from './NearPlaceMaps';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const libraries = ['places'];

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
    nearby_places: [],
    about_info: [{ title: '', detail: '' }],
    highlight_info: [{ title: '', detail: '' }],
    latlong_info: [],
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
  // console.log(formData)
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

        selectedTrees: JSON.parse(place.trees || '[]')
      }));



      let highlight_info = [];
      try {
        // First parse the string from backend
        const parsedString = JSON.parse(data.highlight_info || '[]');

        // Then check if it's a string that needs to be parsed again
        if (typeof parsedString === 'string') {
          highlight_info = JSON.parse(parsedString);
        } else {
          highlight_info = parsedString;
        }

        // Ensure it's an array
        if (!Array.isArray(highlight_info)) {
          highlight_info = [highlight_info];
        }

        // Clean up each item
        highlight_info = highlight_info.map(item => ({
          title: item?.title || '',
          detail: item?.detail || ''
        }));

        // Ensure at least one empty field
        if (highlight_info.length === 0) {
          highlight_info = [{ title: '', detail: '' }];
        }
      } catch (e) {
        console.error('Error parsing additional_info:', e);
        highlight_info = [{ title: '', detail: '' }];
      }
      // console.log('Processed additional_info:', highlight_info);





      let about_info = [];
      try {
        // First parse the string from backend
        const parsedString = JSON.parse(data.about_info || '[]');

        // Then check if it's a string that needs to be parsed again
        if (typeof parsedString === 'string') {
          about_info = JSON.parse(parsedString);
        } else {
          about_info = parsedString;
        }

        // Ensure it's an array
        if (!Array.isArray(about_info)) {
          about_info = [about_info];
        }

        // Clean up each item
        about_info = about_info.map(item => ({
          title: item?.title || '',
          detail: item?.detail || ''
        }));

        // Ensure at least one empty field
        if (about_info.length === 0) {
          about_info = [{ title: '', detail: '' }];
        }
      } catch (e) {
        console.error('Error parsing aboutinfo:', e);
        about_info = [{ title: '', detail: '' }];
      }
      // console.log('Processed aboutinfo:', about_info);




      let latlong_info = [];
      try {
        // First parse the string from backend
        const parsedString = JSON.parse(data.latlong_info || '[]');

        // Then check if it's a string that needs to be parsed again
        if (typeof parsedString === 'string') {
          latlong_info = JSON.parse(parsedString);
        } else {
          latlong_info = parsedString;
        }

        // Ensure it's an array
        if (!Array.isArray(latlong_info)) {
          latlong_info = [latlong_info];
        }

        // Clean up each item
        latlong_info = latlong_info.map(item => ({
          lat: item?.lat || '',
          lng: item?.lng || '',
          name: item?.name || '',
          description: item?.description || '',
          image: item?.image instanceof File ? `${item.image}` : `${item?.image || null}`
        }));

        // Ensure at least one empty field
        if (latlong_info.length === 0) {
          latlong_info = [];
        }
      } catch (e) {
        console.error('Error parsing latlong_info:', e);
        latlong_info = [];
      }
      // console.log('Processed latlong_info:', latlong_info);




      setFormData({
        ...data,
        gallery_images: [],
        nearby_places: parsedNearbyPlaces,
        featured_image: null,
        about_info: about_info,
        highlight_info: highlight_info,
        latlong_info: latlong_info,
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




  const removeLatLongInfo = (index) => {
    // if (formData.latlong_info.length <= 1) return;
    setFormData(prev => {
      const updated = [...prev.latlong_info];
      updated.splice(index, 1);
      return { ...prev, latlong_info: updated };
    });
  };


  // Update handleInputChange to support latlong_info
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle dynamic fields for about_info and heighlights_info
    if (name.startsWith('about_info.')) {
      const [, idx, key] = name.split('.');
      setFormData(prev => {
        const updated = [...prev.about_info];
        updated[Number(idx)][key] = value;
        return { ...prev, about_info: updated };
      });
      return;
    }

    if (name.startsWith('highlight_info.')) {
      const [, idx, key] = name.split('.');
      setFormData(prev => {
        const updated = [...prev.highlight_info];
        updated[Number(idx)][key] = value;
        return { ...prev, highlight_info: updated };
      });
      return;
    }

    if (name.startsWith('latlong_info.')) {
      const [, idx, key] = name.split('.');
      setFormData(prev => {
        const updated = [...prev.latlong_info];
        updated[Number(idx)][key] = value;
        return { ...prev, latlong_info: updated };
      });
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };





  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append('place_name', formData.place_name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      formDataToSend.append('full_address', formData.full_address);
      formDataToSend.append('highlight_info', JSON.stringify(formData.highlight_info));
      formDataToSend.append('about_info', JSON.stringify(formData.about_info));

      // Handle latlong_info with images
      formData.latlong_info.forEach((point, index) => {
        // Append each point property
        formDataToSend.append(`latlong_info[${index}][lat]`, point.lat);
        formDataToSend.append(`latlong_info[${index}][lng]`, point.lng);
        formDataToSend.append(`latlong_info[${index}][name]`, point.name || '');
        formDataToSend.append(`latlong_info[${index}][description]`, point.description || '');

        // Handle image upload - only append if it's a File object
        if (point.image instanceof File) {
          formDataToSend.append(`latlong_info[${index}][image]`, point.image);
        } else if (typeof point.image === 'string') {
          // For existing image URLs (when editing)
          formDataToSend.append(`latlong_info[${index}][image_url]`, point.image);
        }
      });

      // Also include the stringified version if backend needs it
      formDataToSend.append('latlong_info_json', JSON.stringify(
        formData.latlong_info.map(point => ({
          lat: point.lat,
          lng: point.lng,
          name: point.name,
          description: point.description,
          // Don't include File objects in JSON
          image: point.image instanceof File ? undefined : point.image
        }))
      ));

      // Handle featured image
      if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image);
      }

      // Handle gallery images
      selectedFiles.forEach(file => {
        formDataToSend.append('gallery_images[]', file);
      });

      // Handle existing images
      existingImages.forEach(img => {
        formDataToSend.append('existing_images[]', img.path);
      });

      // Handle nearby places
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
    } finally {
      setLoading(false);
    }
  };




  const addAboutInfo = () => {
    setFormData(prev => ({
      ...prev,
      about_info: [...prev.about_info, { title: '', detail: '' }]
    }));
  };

  const removeAboutInfo = (index) => {
    if (formData.about_info.length <= 1) return;
    setFormData(prev => {
      const updated = [...prev.about_info];
      updated.splice(index, 1);
      return { ...prev, about_info: updated };
    });
  };

  const addHighlightsInfo = () => {
    setFormData(prev => ({
      ...prev,
      highlight_info: [...prev.highlight_info, { title: '', detail: '' }]
    }));
  };

  const removeHighlightsInfo = (index) => {
    if (formData.highlight_info.length <= 1) return;
    setFormData(prev => {
      const updated = [...prev.highlight_info];
      updated.splice(index, 1);
      return { ...prev, highlight_info: updated };
    });
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;
  if (loading && isEditMode) return <div>Loading...</div>;



  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => {
        const updatedLatLongInfo = [...prev.latlong_info];
        updatedLatLongInfo[index] = {
          ...updatedLatLongInfo[index],
          image: file // Store the File object directly
        };
        return {
          ...prev,
          latlong_info: updatedLatLongInfo
        };
      });
    }
  };

  const removeImageTwo = (index) => {
    setFormData(prev => {
      const updatedLatLongInfo = [...prev.latlong_info];
      updatedLatLongInfo[index] = {
        ...updatedLatLongInfo[index],
        image: null
      };
      return {
        ...prev,
        latlong_info: updatedLatLongInfo
      };
    });
  };

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

              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) =>
                  handleInputChange({
                    target: {
                      name: 'description',
                      value: value,
                    },
                  })
                }
                className="bg-white"
              />

              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Location Search</label>
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
              <label className="block mb-2 font-medium">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"

              />
              {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude}</p>}
            </div>

            <div>
              <label className="block mb-2 font-medium">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"

              />
              {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude}</p>}
            </div>

            {/* <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Google Maps Link</label>
              <input
                type="url"
                name="google_maps_link"
                value={formData.google_maps_link}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.google_maps_link && <p className="text-red-500 text-sm">{errors.google_maps_link}</p>}
            </div> */}

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Full Address</label>
              <textarea
                name="full_address"
                value={formData.full_address}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                rows="2"
              />
              {errors.full_address && <p className="text-red-500 text-sm">{errors.full_address}</p>}
            </div>
          </div>


          {formData.latitude && formData.longitude ? (
            <div className="mt-2 text-sm text-gray-600">
              Coordinates: {formData.latitude}, {formData.longitude}
            </div>
          ) : (
            // <div className="mt-4" style={{ height: '400px' }}>
            //   <GoogleMap
            //     mapContainerStyle={mapContainerStyle}
            //     center={{
            //       lat: parseFloat(formData.latitude),
            //       lng: parseFloat(formData.longitude),
            //     }}
            //     zoom={15}
            //     onLoad={onMapLoad}
            //     onUnmount={onUnmount}
            //   >
            //     {formData.latitude && formData.longitude && (
            //       <Marker
            //         position={{ lat: Number(formData.latitude), lng: Number(formData.longitude) }}
            //       />
            //     )}
            //   </GoogleMap>
            // </div>
            <></>

          )}

          {/* <NearPlaceMaps lat={formData.latitude} lng={formData.longitude} /> */}

          {/* <NearPlaceMaps
            lat={formData.latitude}
            lng={formData.longitude}
            latlongInfo={formData.latlong_info}
            onMainMarkerDrag={({ lat, lng }) => {
              setFormData(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng
              }));
            }}
            onMapClickAddPoint={({ lat, lng }) => {
              setFormData(prev => ({
                ...prev,
                latlong_info: [...prev.latlong_info, { lat, lng }]
              }));
            }}
          /> */}

          <NearPlaceMaps
            lat={formData.latitude}
            lng={formData.longitude}
            latlongInfo={formData.latlong_info}
            onMainMarkerDrag={({ lat, lng }) => {
              setFormData(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng
              }));
            }}
            onMapClickAddPoint={({ lat, lng }) => {
              setFormData(prev => ({
                ...prev,
                latlong_info: [...prev.latlong_info, {
                  lat,
                  lng,
                  name: '',
                  description: '',
                  image: null
                }]
              }));
            }}
          />

        </div>



        {/* Dynamic Lat/Long Info Fields */}
        <div>
          <label className="block mb-1 font-medium">Points Information</label>
          <small className="text-gray-500">Click on the map to add a point</small>
          {formData.latlong_info.map((info, index) => (
            <div key={index} className="grid grid-cols-1 gap-4 mb-6 p-4 border rounded-lg">
              <h3 className="font-semibold">Point {index + 1}</h3>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="text"
                    name={`latlong_info.${index}.lat`}
                    value={info.lat || ''}
                    onChange={handleInputChange}
                    placeholder="Latitude"
                    className="border border-gray-300 rounded p-2 w-full"
                    readOnly={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name={`latlong_info.${index}.lng`}
                      value={info.lng || ''}
                      onChange={handleInputChange}
                      placeholder="Longitude"
                      className="border border-gray-300 rounded p-2 flex-1"
                      readOnly={true}
                    />
                    <button
                      type="button"
                      onClick={() => removeLatLongInfo(index)}
                      className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Point Name</label>
                <input
                  type="text"
                  name={`latlong_info.${index}.name`}
                  value={info.name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter point name"
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name={`latlong_info.${index}.description`}
                  value={info.description || ''}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  className="border border-gray-300 rounded p-2 w-full"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, index)}
                  className="border border-gray-300 rounded p-2 w-full"
                />
                {info.image && (
                  <div className="mt-2">
                    {typeof info.image === 'string' ? (
                      // Display existing image (when editing)
                      <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${info.image}`} alt="Preview" className="h-20 object-cover rounded" />
                    ) : (
                      // Display preview for newly uploaded file
                      <img src={URL.createObjectURL(info.image)} alt="Preview" className="h-20 object-cover rounded" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageTwo(index)}
                      className="mt-1 text-red-500 text-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <br></br>


        <div>
          <label className="block mb-1 font-medium">Highlights Info</label>
          {formData.highlight_info.map((info, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-4 items-end">
              <div>
                <input
                  type="text"
                  name={`highlight_info.${index}.title`}
                  value={info.title || ''}
                  onChange={handleInputChange}
                  placeholder="Title"
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name={`highlight_info.${index}.detail`}
                    value={info.detail || ''}
                    onChange={handleInputChange}
                    placeholder="Detail"
                    className="border border-gray-300 rounded p-2 flex-1"
                  />
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addHighlightsInfo}
                      className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeHighlightsInfo(index)}
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
          <label className="block mb-1 font-medium">About Info</label>
          {formData.about_info.map((info, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-4 items-end">
              <div>
                <input
                  type="text"
                  name={`about_info.${index}.title`}
                  value={info.title || ''}
                  onChange={handleInputChange}
                  placeholder="Title"
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name={`about_info.${index}.detail`}
                    value={info.detail || ''}
                    onChange={handleInputChange}
                    placeholder="Detail"
                    className="border border-gray-300 rounded p-2 flex-1"
                  />
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addAboutInfo}
                      className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeAboutInfo(index)}
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


        <div className="mb-8 p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Media</h3>
          {/* {console.log('Featured Image:', errors)} */}
          {errors.featured_image && <p className="text-red-500 text-sm">{errors.featured_image}</p>}
          {Object.keys(errors).map((key) => {
            if (key.startsWith('gallery_images.')) {
              return (
                <p key={key} className="text-red-500 text-sm">
                  {errors[key][0]}
                </p>
              );
            }
            return null;
          })}



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
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EcoTrailForm;