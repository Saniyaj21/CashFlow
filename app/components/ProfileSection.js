'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ProfileSection() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };



  if (!isLoaded) {
    return (
      <div className="w-full max-w-md flex flex-col items-center justify-center py-8">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-300 rounded-3xl mb-6"></div>
          <div className="h-8 bg-gray-300 rounded mb-3 w-32"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-md flex flex-col items-center justify-center py-8">
        <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
          <FaUserCircle size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Not Signed In</h2>
        <p className="text-gray-600 text-center mb-6">Please sign in to access your profile</p>
        <div className="bg-red-100/50 rounded-2xl p-6 w-full">
          <div className="text-sm text-red-700 text-center">
            ⚠️ You need to be signed in to view your profile
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center py-8">
      {/* User Avatar and Info */}
      <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
        {user.imageUrl ? (
          <Image 
            src={user.imageUrl} 
            alt={user.fullName || 'User'} 
            width={80}
            height={80}
            className="rounded-3xl object-cover"
          />
        ) : (
          <FaUserCircle size={48} className="text-white" />
        )}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {user.fullName || 'User'}
      </h2>
      
      <p className="text-gray-600 text-center mb-2">
        {user.primaryEmailAddress?.emailAddress}
      </p>
      
      <div className="text-xs text-gray-500 mb-8">
        Member since {new Date(user.createdAt).toLocaleDateString()}
      </div>

      {/* Sign Out Option */}
      <div className="w-full mt-6">
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="w-full flex items-center justify-between p-4 bg-red-50/70 backdrop-blur-sm rounded-2xl hover:bg-red-100/90 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <FaSignOutAlt className="text-red-600" size={18} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-red-700">Sign Out</div>
              <div className="text-xs text-red-500">Sign out of your account</div>
            </div>
          </div>
          <div className="text-red-400 group-hover:text-red-600">
            {isLoading ? '...' : '→'}
          </div>
        </button>
      </div>

      {/* App Info */}
      <div className="mt-8 w-full bg-blue-50/50 rounded-2xl p-4">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-semibold mb-1">CashFlow v1.0</div>
          <div>Your personal finance tracker</div>
          <div className="mt-2 text-gray-500">© {new Date().getFullYear()} CashFlow</div>
        </div>
      </div>
    </div>
  );
} 