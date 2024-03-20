import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { set, useForm } from 'react-hook-form';
export default function UpdateListing({ listing }) {
  const { currentUser } = useSelector((state) => state.user);
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFileNames, setSelectedFileNames] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [initialData, setinitialData] = useState({
    title: listing?.title,
    description: listing?.description,
    address: listing?.address,
    rent: listing?.rent,
    sale: listing?.sell,
    beds: String(listing?.beds),
    baths: String(listing?.baths),
    regularPrice: String(listing?.regularPrice),
    discountPrice: String(listing?.discountPrice),
    offer: listing?.offer,
    parking: listing?.parking,
    furnished: listing?.furnished,
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = async (data) => {
    try {
      const formData = new FormData();
      if (data.regularPrice < data.discountPrice)
        return setError('Discount price must be lower than regular price');
      let isSame = true;
      for (let key in data) {
        if (data[key] !== initialData[key]) {
          isSame = false;
          formData.append(key, data[key]);
        }
      }
      if (isSame) {
        return setError('You must change at least one field');
      }
      setLoading(true);
      setError(false);
      const res = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/properties/${params.listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',  //if we are using formdata and there is no file to send then we can use this header otherwise use multipart/form-data
        },
        body: new URLSearchParams(formData),
        credentials: 'include',
      });
      const data2 = await res.json();
      setLoading(false);
      if (data2.success === false) {
        setError(data2.message);
      }
      navigate(`/listing/${data2.data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  const handleFileChange = (index) => (e) => {
    const file = e.target.files[0];
    setSelectedFiles(oldFiles => {
      const existingFileIndex = oldFiles.findIndex(f => f.index === index);
      if (existingFileIndex !== -1) {
        const newFiles = [...oldFiles];
        newFiles[existingFileIndex] = { index, file };
        return newFiles;
      } else {
        return [...oldFiles, { index, file }];
      }
    });
    setSelectedFileNames(oldNames => {
      const existingNameIndex = oldNames.findIndex(n => n.index === index);
      if (existingNameIndex !== -1) {
        const newNames = [...oldNames];
        newNames[existingNameIndex] = { index, name: file.name };
        return newNames;
      } else {
        return [...oldNames, { index, name: file.name }];
      }
    });
  };
  const handleUpdateImage = async (index) => {
    const selectedFile = selectedFiles.find(file => file.index === index);
    if (!selectedFile) {
      setError('You must select an image to update');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile.file);
    formData.append('imageIndices', index);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/properties/updateImages/${listing._id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });
      setLoading(false);
      if (!response.ok) {
        const data = await response.json();
        setError(data.error.message);
        return;
      }
      const data = await response.json();
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (error) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        setError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, showMessage]);
  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit(update)} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Name'
            className='border p-3 rounded-lg'
            id='name'
            maxLength='62'
            minLength='10'
            {...register('title')}
            defaultValue={initialData.title}
          />
          <textarea
            type='text'
            placeholder='Description'
            className='border p-3 rounded-lg'
            id='description'
            {...register('description')}
            defaultValue={initialData.description}
          />
          <input
            type='text'
            placeholder='Address'
            className='border p-3 rounded-lg'
            id='address'
            {...register('address')}
            defaultValue={initialData.address}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='sale'
                className='w-5'
                {...register('sale')}
                defaultChecked={initialData.type === 'sale'}
              />
              <span>Sell</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='rent'
                className='w-5'
                {...register('rent')}
                defaultChecked={initialData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='parking'
                className='w-5'
                {...register('parking')}
                defaultChecked={initialData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='furnished'
                className='w-5'
                {...register('furnished')}
                defaultChecked={initialData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-5'
                {...register('offer')}
                defaultChecked={initialData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bedrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                {...register('beds')}
                defaultValue={initialData.beds}
              />
              <p>Beds</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bathrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                {...register('baths')}
                defaultValue={initialData.baths}
              />
              <p>Baths</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='regularPrice'
                min='50'
                max='10000000'
                className='p-3 border border-gray-300 rounded-lg'
                {...register('regularPrice')}
                defaultValue={initialData.regularPrice}
              />
              <div className='flex flex-col items-center'>
                <p>Regular price</p>
                {initialData.type === 'rent' && (
                  <span className='text-xs'>($ / month)</span>
                )}
              </div>
            </div>
            {initialData.offer && (
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  id='discountPrice'
                  min='0'
                  max='10000000'
                  className='p-3 border border-gray-300 rounded-lg'
                  {...register('discountPrice')}
                  defaultValue={initialData.discountPrice}
                />
                <div className='flex flex-col items-center'>
                  <p>Discounted price</p>
                  {initialData.type === 'rent' && (
                    <span className='text-xs'>($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          {listing && listing.image.length > 0 &&
            listing.image.map((url, index) => (
              <div
                key={url}
                className='flex justify-between p-3 border items-center'
              >
                <img
                  src={url}
                  alt='listing image'
                  className='w-20 h-20 object-contain rounded-lg'
                />
                <div>
                  <label htmlFor={`property${index}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      fill="currentColor"
                      className="bi bi-camera cursor-pointer mx-auto"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                      <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                    </svg>
                  </label>
                  <p>{selectedFileNames.find(file => file.index === index)?.name}</p>
                  <input type="file" id={`property${index}`} style={{ display: "none" }} onChange={handleFileChange(index)} />
                  <button
                    type='button'
                    onClick={() => handleUpdateImage(index)}
                    className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                  >
                    Update
                  </button>
                </div>

              </div>
            ))}
          <button
            disabled={loading}
            className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Updating...' : 'Update listing'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  );
}
