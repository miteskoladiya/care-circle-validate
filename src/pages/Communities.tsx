import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Heart,
  Plus,
  Filter,
  Activity
} from "lucide-react";
import { Navbar } from "@/components/Layout/Navbar";

// Mock user data
const mockUser = {
  id: "user_123",
  name: "John Smith",
  email: "john.smith@example.com",
  role: "Patient" as const,
  avatar: "",
  isVerified: false,
};

// Mock communities data
const mockCommunities = [
  {
    id: "1",
    name: "Diabetes Support",
    description: "A supportive community for people living with diabetes, sharing experiences and tips for management.",
    members: 1250,
    dailyPosts: 15,
    category: "Endocrine",
    isJoined: true,
    moderators: ["Dr. Sarah Johnson", "Dr. Michael Chen"],
    recentActivity: "2 hours ago",
    color: "bg-blue-500"
  },
  {
    id: "2",
    name: "Heart Health",
    description: "Connect with others focusing on cardiovascular health, exercise, and heart-healthy living.",
    members: 890,
    dailyPosts: 8,
    category: "Cardiovascular",
    isJoined: true,
    moderators: ["Dr. Emily Rodriguez"],
    recentActivity: "1 hour ago",
    color: "bg-red-500"
  },
  {
    id: "3",
    name: "Mental Wellness",
    description: "A safe space to discuss mental health, wellness strategies, and emotional support.",
    members: 2100,
    dailyPosts: 23,
    category: "Mental Health",
    isJoined: false,
    moderators: ["Dr. James Wilson", "Dr. Lisa Park"],
    recentActivity: "30 minutes ago",
    color: "bg-green-500"
  },
  {
    id: "4",
    name: "Cancer Warriors",
    description: "Support and resources for cancer patients, survivors, and their families.",
    members: 650,
    dailyPosts: 12,
    category: "Oncology",
    isJoined: false,
    moderators: ["Dr. Robert Kim"],
    recentActivity: "4 hours ago",
    color: "bg-purple-500"
  },
  {
    id: "5",
    name: "Nutrition & Diet",
    description: "Healthy eating habits, dietary advice, and nutrition support for various health conditions.",
    members: 1800,
    dailyPosts: 18,
    category: "Nutrition",
    isJoined: false,
    moderators: ["Dr. Anna Thompson"],
    recentActivity: "1 hour ago",
    color: "bg-orange-500"
  },
  {
    id: "6",
    name: "Chronic Pain Support",
    description: "Understanding and managing chronic pain conditions with peer support and expert guidance.",
    members: 780,
    dailyPosts: 10,
    category: "Pain Management",
    isJoined: false,
    moderators: ["Dr. David Miller"],
    recentActivity: "3 hours ago",
    color: "bg-yellow-500"
  }
];

export default function Communities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [joinedCommunities, setJoinedCommunities] = useState(
    mockCommunities.filter(c => c.isJoined).map(c => c.id)
  );

  const categories = ["All", "Endocrine", "Cardiovascular", "Mental Health", "Oncology", "Nutrition", "Pain Management"];

  const filteredCommunities = mockCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinCommunity = (communityId: string) => {
    setJoinedCommunities(prev => 
      prev.includes(communityId) 
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Health Communities</h1>
            <p className="text-muted-foreground mt-1">
              Join communities that match your health interests and connect with others.
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Request Community</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">
                    {mockCommunities.reduce((sum, c) => sum + c.members, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Communities</p>
                  <p className="text-2xl font-bold">{mockCommunities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="text-2xl font-bold">{joinedCommunities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Daily Posts</p>
                  <p className="text-2xl font-bold">
                    {mockCommunities.reduce((sum, c) => sum + c.dailyPosts, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card key={community.id} className="shadow-card hover:shadow-healthcare transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${community.color}`} />
                    <div>
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {community.category}
                      </Badge>
                    </div>
                  </div>
                  {joinedCommunities.includes(community.id) && (
                    <Badge variant="default">Joined</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {community.description}
                </CardDescription>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{community.members.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{community.dailyPosts} daily posts</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Moderators</p>
                  <div className="flex flex-wrap gap-1">
                    {community.moderators.map((moderator, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {moderator.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{moderator}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active {community.recentActivity}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={joinedCommunities.includes(community.id) ? "outline" : "default"}
                    onClick={() => handleJoinCommunity(community.id)}
                  >
                    {joinedCommunities.includes(community.id) ? "Leave" : "Join"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No communities found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}