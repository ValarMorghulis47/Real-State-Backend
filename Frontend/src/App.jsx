import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import { setInitialFetchDone, signInFailure, signInStart, signInSuccess } from './redux/user/userSlice';
import EditListing from './pages/EditListing';

export default function App() {
  const dispatch = useDispatch()
  const { LoggedIn } = useSelector((state) => state.user);
  const fetchCurrentUser = async () => {
    try {
      dispatch(signInStart());
      const response = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/users/currentuser`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        dispatch(signInSuccess(userData.data));
      } else {
        dispatch(signInFailure());
      }
    } catch (error) {
      // Handle errors here
      dispatch(signInFailure());
    } finally {
      dispatch(setInitialFetchDone());
    }
  };
  useEffect(() => {
    fetchCurrentUser();
  }, [LoggedIn, dispatch]);
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/about' element={<About />} />
        <Route path='/search' element={<Search />} />
        <Route path='/listing/:listingId' element={<Listing />} />

        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/create-listing' element={<CreateListing />} />
          <Route
            path='/update-listing/:listingId'
            element={<EditListing />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
