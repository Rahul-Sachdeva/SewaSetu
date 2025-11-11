import Feed from '@/components/Feed'
import StoriesBar from '@/components/StoriesBar'
import React from 'react'
import Navbar from "../components/Navbar";

function FeedPage() {
  return (
    <>
      <Navbar />
      <StoriesBar />
      <Feed />
    </>
  )
}

export default FeedPage