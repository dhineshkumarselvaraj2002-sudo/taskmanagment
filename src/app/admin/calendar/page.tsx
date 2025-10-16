import CalendarView from '@/components/admin/CalendarView'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-admin-heading flex items-center">    
              Calendar View
            </h1>
            <p className="mt-2 text-admin-body">
              View task deadlines by hovering over calendar dates to see user assignments and task status
            </p>
          </div>

          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              {/* <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Deadline Calendar</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hover over dates with deadlines to see task details, user assignments, and status
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">Critical</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">High</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">Medium</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">Low</span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
            
            <div className="p-6">
              <CalendarView />
            </div>
          </div>

          {/* Help Section */}
          {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Calendar Tips</h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hover over any date with deadlines to see task details, assigned users, and status</li>
                    <li>Dates with deadlines are highlighted with a subtle background color</li>
                    <li>Use the filters above the calendar to view specific users, statuses, or priorities</li>
                    <li>Priority color coding: Red (Critical), Orange (High), Yellow (Medium), Green (Low)</li>
                    <li>Switch between Month, Week, and Day views using the calendar controls</li>
                  </ul>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
