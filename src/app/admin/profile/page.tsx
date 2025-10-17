'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Bell, 
  Shield, 
  Save, 
  Edit, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
  Award,
  Target,
  Users,
  BarChart3,
  Crown,
  Key,
  Database
} from 'lucide-react'

export default function AdminProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailNotifications: true,
    adminSettings: {
      canManageUsers: true,
      canManageTasks: true,
      canViewAnalytics: true,
      canManageSystem: true
    }
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/admin/profile')
        const data = await response.json()
        if (data.success) {
          setUserData(data.data)
          setFormData({
            name: data.data.name,
            email: data.data.email,
            emailNotifications: data.data.emailNotifications,
            adminSettings: data.data.adminSettings || {
              canManageUsers: true,
              canManageTasks: true,
              canViewAnalytics: true,
              canManageSystem: true
            }
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        toast({
          title: "Error",
          description: "Network error. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [toast])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        setUserData(data.data)
        setIsEditing(false)
        toast({
          title: "Success!",
          description: "Profile updated successfully!",
          variant: "success"
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-stone-200">
        <div className="w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-3 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-6 bg-stone-200">
        <div className="w-full">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Failed to load profile</h3>
            <p className="text-gray-600">Unable to load your profile data. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-stone-200">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-600" />
              Admin Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your admin account settings and system preferences</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: userData.name,
                      email: userData.email,
                      emailNotifications: userData.emailNotifications,
                      adminSettings: userData.adminSettings || {
                        canManageUsers: true,
                        canManageTasks: true,
                        canViewAnalytics: true,
                        canManageSystem: true
                      }
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button 
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-3 h-3" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* System Statistics - Full Width */}
        <Card className="shadow-lg border-0 mb-8 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
              System Overview
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">System-wide statistics and performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{userData.totalUsers || 0}</div>
                <div className="text-sm text-blue-700 font-medium">Total Users</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{userData.totalTasks || 0}</div>
                <div className="text-sm text-green-700 font-medium">Total Tasks</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{userData.completedTasks || 0}</div>
                <div className="text-sm text-purple-700 font-medium">Completed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900">{userData.systemUptime || '99.9%'}</div>
                <div className="text-sm text-orange-700 font-medium">System Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Information - Left Side */}
          <div className="lg:col-span-1">
            {/* Combined Admin Profile Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{userData.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{userData.email}</p>
                  <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                    <Crown className="w-4 h-4 mr-2" />
                    {userData.role}
                  </Badge>
                </div>

                {/* Admin Info Section */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Admin Information</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 px-3 bg-stone-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Admin since</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{new Date(userData.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 px-3 bg-stone-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Last updated</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{new Date(userData.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 px-3 bg-stone-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Access level</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 px-2 py-1">
                        Full Access
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Right Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <User className="w-6 h-6  text-blue-600" />
                  Personal Information
                </CardTitle>
                {/* <CardDescription className="text-sm text-gray-600">Update your personal details and contact information</CardDescription> */}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-stone-200 hover:bg-stone-200 focus:bg-white transition-colors"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-stone-200 hover:bg-stone-200 focus:bg-white transition-colors"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                    <Input
                      id="department"
                      value="Administration"
                      className="bg-stone-200 hover:bg-stone-200 focus:bg-white transition-colors"
                      disabled={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position</Label>
                    <Input
                      id="position"
                      value="System Administrator"
                      className="bg-stone-200 hover:bg-stone-200 focus:bg-white transition-colors"
                      disabled={true}
                    />
                  </div>
                </div> */}

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input
                      id="phone"
                      value="+1 (555) 987-6543"
                      className="bg-stone-200 hover:bg-stone-200 focus:bg-white transition-colors"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="location"
                      value="New York, NY"
                      className="bg-stone-200 hover:bg-stone-200 focus:bg-white transition-colors"
                      disabled={!isEditing}
                    />
                  </div>
                </div> */}

                {/* <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                  <textarea
                    id="bio"
                    value="Experienced system administrator with expertise in managing complex IT infrastructure and ensuring optimal system performance. Committed to maintaining security and efficiency across all organizational systems."
                    className="w-full px-3 py-2 bg-stone-200 hover:bg-stone-200 focus:bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                    rows={3}
                    disabled={!isEditing}
                  />
                </div> */}
                
                {/* <div className="flex items-center justify-between p-4 bg-stone-200 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates about system activities</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-purple-900">Admin Privileges</h4>
                        <p className="text-sm text-purple-700">Full system access and control</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">System Status</h4>
                        <p className="text-sm text-green-700">All systems operational</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 px-2 py-1">
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
