import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">CashFlow</h1>
          <p className="text-gray-600">Create your account to start tracking</p>
        </div>
        
        {/* Sign Up Form */}
        <div className="flex justify-center">
          <SignUp />
        </div>
      </div>
    </div>
  )
} 