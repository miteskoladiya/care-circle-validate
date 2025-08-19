import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Activity, 
  Plus, 
  TrendingUp,
  Calendar,
  Award,
  CheckCircle,
  Clock
} from "lucide-react";
import { Navbar } from "@/components/Layout/Navbar";

// Mock user data - in real app this would come from authentication
const mockUser: {
  id: string;
  name: string;
  email: string;
  role: "Patient" | "Doctor" | "Admin" | "SuperAdmin";
  avatar: string;
  isVerified: boolean;
} = {
  id: "user_123",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@example.com",
  role: "Doctor",
  avatar: "",
  isVerified: true,
};

// Mock data
const mockCommunities = [
  { id: "1", name: "Diabetes Support", members: 1250, newPosts: 15, color: "bg-blue-500" },
  { id: "2", name: "Heart Health", members: 890, newPosts: 8, color: "bg-red-500" },
  { id: "3", name: "Mental Wellness", members: 2100, newPosts: 23, color: "bg-green-500" },
];

const mockRecentQuestions = [
  {
    id: "1",
    title: "Managing blood sugar levels during exercise",
    community: "Diabetes Support",
    author: "John D.",
    time: "2 hours ago",
    responses: 3,
    validationStatus: "pending"
  },
  {
    id: "2",
    title: "Side effects of new medication",
    community: "Heart Health",
    author: "Mary S.",
    time: "4 hours ago",
    responses: 1,
    validationStatus: "validated"
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const getDashboardContent = () => {
    const role = mockUser.role;
    if (role === "Patient") {
      return <PatientDashboard />;
    } else if (role === "Doctor") {
      return <DoctorDashboard />;
    } else if (role === "Admin" || role === "SuperAdmin") {
      return <AdminDashboard />;
    } else {
      return <PatientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {mockUser.name.split(" ")[0]}!</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening in your healthcare communities today.
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Ask Question</span>
          </Button>
        </div>

        {getDashboardContent()}
      </div>
    </div>
  );
}

function PatientDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities Joined</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Helpful Reactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Received this month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>My Communities</CardTitle>
            <CardDescription>Communities you've joined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCommunities.map((community) => (
                <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${community.color}`} />
                    <div>
                      <p className="font-medium">{community.name}</p>
                      <p className="text-sm text-muted-foreground">{community.members} members</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{community.newPosts} new</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest questions and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentQuestions.map((question) => (
                <div key={question.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{question.title}</p>
                      <p className="text-xs text-muted-foreground">{question.community} • {question.time}</p>
                    </div>
                    <Badge variant={question.validationStatus === "validated" ? "default" : "secondary"}>
                      {question.validationStatus === "validated" ? "Validated" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">{question.responses} responses</span>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DoctorDashboard() {
  return (
    <div className="space-y-6">
      {/* Doctor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validations Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">8</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">15</div>
            <p className="text-xs text-muted-foreground">Responses reviewed</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities Access</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">All</div>
            <p className="text-xs text-muted-foreground">Full platform access</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <Progress value={94} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Doctor-specific content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Question Response Validation Queue</CardTitle>
            <CardDescription>AI-generated responses to patient questions awaiting your medical review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentQuestions.filter(q => q.validationStatus === "pending").map((question) => (
                <div key={question.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{question.title}</p>
                      <p className="text-xs text-muted-foreground">{question.community}</p>
                    </div>
                    <Badge variant="outline">Urgent</Badge>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="default">Review</Button>
                    <Button size="sm" variant="outline">Skip</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Response Validations</CardTitle>
            <CardDescription>AI responses you recently reviewed and validated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentQuestions.filter(q => q.validationStatus === "validated").map((question) => (
                <div key={question.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{question.title}</p>
                      <p className="text-xs text-muted-foreground">{question.community} • Validated {question.time}</p>
                    </div>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">23</div>
            <p className="text-xs text-muted-foreground">Doctor registrations</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Communities</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">All communities active</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">98%</div>
            <p className="text-xs text-muted-foreground">System uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin-specific content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Doctor Registration Approvals</CardTitle>
            <CardDescription>New doctor registrations with documents awaiting verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Dr. Michael Chen", specialization: "Cardiology", submitted: "2 days ago" },
                { name: "Dr. Emily Rodriguez", specialization: "Endocrinology", submitted: "1 day ago" },
                { name: "Dr. James Wilson", specialization: "Psychiatry", submitted: "3 hours ago" },
              ].map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialization} • {doctor.submitted}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="default">Approve</Button>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Platform health and activity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Questions Today</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Responses Generated</span>
                <span className="font-medium">98</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Validations Completed</span>
                <span className="font-medium">76</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New User Registrations</span>
                <span className="font-medium">31</span>
              </div>
              <div className="pt-2">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}