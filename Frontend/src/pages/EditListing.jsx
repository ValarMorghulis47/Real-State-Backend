import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import UpdateListing from './UpdateListing';
function EditListing() {
    const [listing, setListing] = useState(null)
    const { listingId } = useParams()
    const navigate = useNavigate()
    useEffect(() => {
        const fetchPost = async () => {
            if (listingId) {
                const post = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/properties/${listingId}`, {
                    method: 'GET',
                    credentials: 'include'
                })
                if (post.status === 200) {
                    const listingData = await post.json();
                    setListing(listingData.data);
                }
                else {
                    navigate('/')
                }
            }
            else {
                navigate('/')
            }
        }
        fetchPost();
    }, [listingId, navigate])
    return listing ? (
        <UpdateListing listing={listing} />
    ) : null
}

export default EditListing