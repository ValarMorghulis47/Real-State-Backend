import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signUpStart, signUpFailure, signUpSuccess } from '../redux/user/userSlice';
import { useForm } from 'react-hook-form';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const { register, handleSubmit, reset } = useForm()
  const dispatch = useDispatch();
  const [sucess, setSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [error, setError] = useState(false);
  const loading  = useSelector((state) => state.user.loading);
  const signup = async (data1) => {
    try {
      console.log(data1);
      dispatch(signUpStart());
      const formData = new FormData();
      formData.append('username', data1.username);
      formData.append('email', data1.email);
      formData.append('password', data1.password);
      formData.append('avatar', data1.avatar[0]);
      const userData = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/users/register`, {
        method: "POST",
        body: formData,
      });
      if (!userData.ok) {
        const error = await userData.json();
        console.log(error);
        dispatch(signUpFailure(error.error.message));
        setError(error.error.message);
        return;
      }
      dispatch(signUpSuccess());
      setSuccess(true);
      reset();
    } catch (error) {
      dispatch(signUpFailure(error.message));
      setError(error.message);
    }
  };
  useEffect(() => {
    if (error || sucess) {
        setShowMessage(true);
        const timer = setTimeout(() => {
            setShowMessage(false);
            setSuccess("");
        }, 3000); // Change this value to adjust the time

        return () => clearTimeout(timer); // This will clear the timer if the component unmounts before the timer finishes
    }
}, [error, sucess]);
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit(signup)} encType='multipart/form-data' className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='username'
          className='border p-3 rounded-lg'
          id='username'
          {...register('username')}
        />
        <input
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          id='email'
          {...register('email')}
        />
        <input
          type='password'
          placeholder='password'
          className='border p-3 rounded-lg'
          id='password'
          {...register('password')}
        />
        <input
          type='file'
          placeholder='Enter Your Profile Picture'
          className='border p-3 rounded-lg'
          id='picture'
          {...register('avatar')}
        />

        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth />
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
      {showMessage && error && <p className='text-red-500 mt-5'>{error}</p>}
      {showMessage && sucess && <p className='text-green-500 mt-5'>Account Created Successfully</p>}
    </div>
  );
}
