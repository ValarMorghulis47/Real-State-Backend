import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import {
  updateError,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [showMessage, setShowMessage] = useState(false);
  const [initialUsername, setInitialUsername] = useState(null);
  const [initialEmail, setInitialEmail] = useState(null);
  const { register, handleSubmit, reset, watch, errors, setError } = useForm()
  const [fileName, setFileName] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      setInitialUsername(currentUser?.username || currentUser?.user.username);
      setInitialEmail(currentUser?.email || currentUser?.user.email);
    }
  }, [currentUser])

  const files = watch('avatar');

  useEffect(() => {
    if (files && files.length > 2) {
      setError('avatar', {
        type: 'manual',
        message: 'You can only upload up to 2 images',
      });
    }
    if (files && files.length > 0) {
      console.log(files);
      setFileName(files[0].name);
    }
    console.log(errors);
  }, [files , setError]);

  const update = async (data) => {
    try {
      const formdata = new FormData();
      dispatch(updateUserStart());
      if (initialUsername !== data?.username) {
        formdata.append('username', data.username);
      }
      if (initialEmail !== data?.email) {
        formdata.append('email', data.email);
      }
      if (data?.password) {
        formdata.append('password', data.password);
      }
      if (data?.confirmpassword) {
        formdata.append('confirmpassword', data.confirmpassword);
      }
      if (data?.avatar[0]) {
        formdata.append('avatar', data.avatar[0]);
      }
      const res = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/users/update-account`, {
        method: 'PATCH',
        body: formdata,
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        dispatch(updateUserFailure(error.error.message));
        return;
      }
      const response = await res.json();
      dispatch(updateUserSuccess(response.data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/users/delete-account`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/users/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
    }
  };

  useEffect(() => {
    if (error) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        dispatch(updateError());
      }, 3000); // Change this value to adjust the time

      return () => clearTimeout(timer); // This will clear the timer if the component unmounts before the timer finishes
    }
    if (updateSuccess) {
      reset({
        password: '',
        confirmpassword: '',
        avatar: '',
      });
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        setUpdateSuccess(false);
      }, 3000); // Change this value to adjust the time

      return () => clearTimeout(timer); // This will clear the timer if the component unmounts before the timer finishes

    }
  }, [error, updateSuccess]);


  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit(update)} className='flex flex-col gap-4' encType='multipart/form-data'>
        <img
          src={currentUser?.avatar || currentUser?.user.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <div className='mx-auto'>
          <label htmlFor="avatar">
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
          {/* {errors.avatar?.message && <p>{errors.avatar.message}</p>} */}
          <input type="file" id="avatar" {...register("avatar")} style={{ display: "none" }} />
          {fileName && <p>{fileName}</p>}
        </div>
        <input
          type='text'
          placeholder='username'
          defaultValue={currentUser?.username || currentUser?.user.username}
          id='username'
          className='border p-3 rounded-lg'
          {...register("username")}
        />
        <input
          type='email'
          placeholder='email'
          id='email'
          defaultValue={currentUser?.email || currentUser?.user.email}
          className='border p-3 rounded-lg'
          {...register("email")}
        />
        <input
          type='password'
          placeholder='New Password'
          id='password'
          className='border p-3 rounded-lg'
          {...register("password")}
        />
        <input
          type='password'
          placeholder='Confirm Password'
          id='confpassword'
          className='border p-3 rounded-lg'
          {...register("confirmpassword")}
        />
        <button
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser}
          className='text-red-700 cursor-pointer'
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>

      {showMessage && error && <p className='text-red-700 mt-5'>{error}</p>}
      {showMessage && updateSuccess && <p className='text-green-700 mt-5'>
        User is updated successfully!
      </p>}
      <button onClick={handleShowListings} className='text-green-700 w-full'>
        Show Listings
      </button>
      <p className='text-red-700 mt-5'>
        {showListingsError ? 'Error showing listings' : ''}
      </p>

      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-700 uppercase'
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
