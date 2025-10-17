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
  Target
} from 'lucide-react'

export default function UserProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailNotifications: true
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        if (data.success) {
          setUserData(data.data)
          setFormData({
            name: data.data.name,
            email: data.data.email,
            emailNotifications: data.data.emailNotifications
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
      const response = await fetch('/api/user/profile', {
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
      <div className="space-y-4 mx-6 mt-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="space-y-4 mx-6 mt-4">
        <div className="text-center py-8">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">Failed to load profile</h3>
          <p className="text-sm text-gray-600">Unable to load your profile data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 mx-6 mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm">Manage your account settings and preferences</p>
        </div>
        <div className="flex gap-2">
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
                    emailNotifications: userData.emailNotifications
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Information */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-4 h-4 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm">Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-50 hover:bg-gray-100 focus:bg-white"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-gray-50 hover:bg-gray-100 focus:bg-white"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              {/* <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Email Notifications</h4>
                    <p className="text-xs text-gray-600">Receive email updates about your tasks</p>
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
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div> */}
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="shadow-sm border-0 mb-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Performance Overview
              </CardTitle>
              <CardDescription className="text-sm">Your task completion and productivity metrics</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-blue-900">{userData.totalTasks}</div>
                  <div className="text-xs text-blue-700">Total Tasks</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-green-900">{userData.completedTasks}</div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-purple-900">{userData.completionRate}%</div>
                  <div className="text-xs text-purple-700">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Profile Card */}
          <Card className="shadow-sm border-0">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{userData.name}</h3>
                <p className="text-gray-600 text-xs mt-1">{userData.email}</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">
                  {userData.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-gray-600" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">Member since</span>
                </div>
                <span className="text-xs font-medium">{new Date(userData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">Last updated</span>
                </div>
                <span className="text-xs font-medium">{new Date(userData.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">Status</span>
                </div>
                <Badge className={userData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {userData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-4 h-4 text-gray-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start hover:bg-gray-50 border-0">
                <Settings className="w-3 h-3 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start hover:bg-gray-50 border-0">
                <Bell className="w-3 h-3 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start hover:bg-gray-50 border-0">
                <Shield className="w-3 h-3 mr-2" />
                Security
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
