'use client'

import { motion } from 'framer-motion'
import { Activity, BarChart2, Clock, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import StatCard from '@/components/dashboard/stat-card'
import ActivityItem from '@/components/dashboard/activity-item'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/50 bg-background/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Welcome to your Dashboard!
            </CardTitle>
            <CardDescription>
              Here's an overview of your API usage and account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick Links</p>
                <div className="flex flex-wrap gap-2">
                  <a href="/dashboard/templates" className="text-primary hover:underline">Manage Templates</a>
                  <span className="text-muted-foreground">•</span>
                  <a href="/dashboard/api" className="text-primary hover:underline">API Settings</a>
                  <span className="text-muted-foreground">•</span>
                  <a href="/dashboard/settings" className="text-primary hover:underline">Account Settings</a>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Need Help?</p>
                <p className="text-foreground">
                  Visit our <a href="/docs" className="text-primary hover:underline">documentation</a> or <a href="/support" className="text-primary hover:underline">contact support</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Usage Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          API Usage Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Total Credits Used" 
            value="0" 
            icon={<Zap className="h-5 w-5" />} 
            color="bg-primary/10 text-primary" 
          />
          <StatCard 
            title="Credits Remaining" 
            value="100" 
            icon={<Clock className="h-5 w-5" />} 
            color="bg-green-500/10 text-green-500" 
          />
          <StatCard 
            title="Last API Call" 
            value="Never" 
            icon={<Activity className="h-5 w-5" />} 
            color="bg-yellow-500/10 text-yellow-500" 
          />
        </div>
      </motion.div>

      {/* Recent API Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-border/50 bg-background/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent API Activity
            </CardTitle>
            <CardDescription>
              Your latest API interactions will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem 
                title="No activity yet" 
                time="Get started by making your first API call" 
                description="Check our documentation for examples"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/pricing" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
            <Zap className="h-4 w-4" />
            Buy More Credits
          </a>
          <a href="/dashboard/api" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
            <Activity className="h-4 w-4" />
            View API Settings
          </a>
        </div>
      </motion.div>
    </div>
  )
}