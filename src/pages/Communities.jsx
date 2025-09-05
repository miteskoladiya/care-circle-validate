
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users, MessageSquare, TrendingUp, Plus } from "lucide-react";
import { Navbar } from "@/components/Layout/Navbar";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { initSocketClient } from "@/lib/socket";

export default function Communities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: "", description: "", category: "" });
  const [posts, setPosts] = useState([]);
  const [commentTextById, setCommentTextById] = useState({});
  const [joinRequests, setJoinRequests] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);

  const { token, user, refreshUser } = useAuth();
  const API = getApiUrl();
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/communities`);
        const json = await res.json();
        setCommunities(json.communities || []);
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load", description: "Unable to load communities" });
      }
    }
    load();

    async function loadAdmin() {
      if (!token) return;
      try {
        const r1 = await fetch(`${API}/api/admin/join-requests`, { headers: { Authorization: `Bearer ${token}` } });
        const j1 = await r1.json();
        if (r1.ok) setJoinRequests(j1.requests || []);
        const r2 = await fetch(`${API}/api/admin/community-requests`, { headers: { Authorization: `Bearer ${token}` } });
        const j2 = await r2.json();
        if (r2.ok) setCommunityRequests(j2.requests || []);
      } catch (err) { console.error(err); }
    }
    loadAdmin();
  }, [API, token, toast]);

  useEffect(() => {
    if (user && user.communities) setJoinedCommunities((user.communities || []).map((c) => String(c)));
  }, [user]);

  useEffect(() => {
    if (!selectedCommunity) return setPosts([]);
    const cid = String(selectedCommunity._id || selectedCommunity.id);
    if (!(joinedCommunities || []).includes(cid)) return setPosts([]);
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/posts?community=${encodeURIComponent(selectedCommunity.name)}`);
        const data = await res.json();
        const postsArr = Array.isArray(data) ? data : (Array.isArray(data?.posts) ? data.posts : []);
        if (mounted) setPosts(postsArr);
      } catch (err) {
        console.error(err);
        if (mounted) setPosts([]);
      }
    })();
    return () => { mounted = false; };
  }, [API, selectedCommunity, joinedCommunities]);

  useEffect(() => {
    if (!selectedCommunity) return;
    const base = API.replace(/\/api\/?$/, "") || window.location.origin;
    const s = initSocketClient(base);
    const onComment = (data) => {
      setPosts((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.map((p) => String(p._id) === String(data.postId) ? { ...p, comments: [...(p.comments || []), data.comment] } : p);
      });
    };
    const onReact = (data) => {
      setPosts((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.map((p) => String(p._id) === String(data.postId) ? { ...p, reactions: data.reactions } : p);
      });
    };
    const onPostPublished = (post) => {
      if (post.community === selectedCommunity.name) setPosts((prev) => { const arr = Array.isArray(prev) ? prev : []; return [post, ...arr]; });
    };
    s.on("post:comment", onComment);
    s.on("post:react", onReact);
    s.on("post:published", onPostPublished);
    const onKey = (e) => { if (e.key === "Escape") setSelectedCommunity(null); };
    window.addEventListener("keydown", onKey);
    return () => {
      s.off("post:comment", onComment);
      s.off("post:react", onReact);
      s.off("post:published", onPostPublished);
      window.removeEventListener("keydown", onKey);
    };
  }, [API, selectedCommunity]);

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const displayedCommunities = filteredCommunities.filter((c) => {
    if (viewMode === "joined") return (joinedCommunities || []).includes(String(c._id || c.id));
    return true;
  });

  const handleJoinCommunity = async (communityId) => {
    try {
      if (!token) { toast({ title: "Login required", description: "Please log in to join communities" }); return; }
      const isJoined = (joinedCommunities || []).includes(String(communityId));
      if (!isJoined) {
        const res = await fetch(`${API}/api/communities/${communityId}/join`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const json = await res.json();
        if (res.ok) {
          toast({ title: "Joined", description: "You have joined the community" });
          setJoinedCommunities((prev) => Array.from(new Set([...(prev || []), String(communityId)])));
          setCommunities((prev) => (prev || []).map((c) => (String(c._id || c.id) === String(communityId) ? { ...c, members: (c.members || 0) + 1 } : c)));
          try { if (refreshUser) await refreshUser(); } catch (e) { console.warn("refreshUser failed", e); }
        } else {
          toast({ title: "Action failed", description: json.message || "Unable to join" });
        }
      } else {
        const res = await fetch(`${API}/api/communities/${communityId}/leave`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const json = await res.json();
        if (res.ok) {
          toast({ title: "Left", description: "You have left the community" });
          setJoinedCommunities((prev) => (prev || []).filter((x) => String(x) !== String(communityId)));
          setCommunities((prev) => (prev || []).map((c) => (String(c._id || c.id) === String(communityId) ? { ...c, members: Math.max(0, (c.members || 0) - 1) } : c)));
          try { if (refreshUser) await refreshUser(); } catch (e) { console.warn("refreshUser failed", e); }
        } else {
          toast({ title: "Action failed", description: json.message || "Unable to leave" });
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Action failed", description: "Unable to join community" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Health Communities</h1>
            <p className="text-muted-foreground mt-1">Join communities that match your health interests and connect with others.</p>
          </div>
          <Button className="flex items-center space-x-2" onClick={() => setRequestModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Request Community</span>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search communities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="ml-4 flex items-center space-x-2">
              <Button size="sm" variant={viewMode === 'all' ? 'default' : 'outline'} onClick={() => setViewMode('all')}>All</Button>
              <Button size="sm" variant={viewMode === 'joined' ? 'default' : 'outline'} onClick={() => setViewMode('joined')}>My Communities</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCommunities.map((community) => (
            <Card
              key={community._id || community.id}
              className="shadow-card hover:shadow-healthcare cursor-pointer transform hover:-translate-y-1 transition-transform"
              role="button"
              tabIndex={0}
              onClick={() => {
                const cid = String(community._id || community.id);
                if ((joinedCommunities || []).includes(cid)) setSelectedCommunity(community);
                else toast({ title: 'Join to view', description: 'Join this community to see posts.' });
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const cid = String(community._id || community.id); if ((joinedCommunities || []).includes(cid)) setSelectedCommunity(community); else toast({ title: 'Join to view', description: 'Join this community to see posts.' }); } }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">{community.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(joinedCommunities || []).includes(String(community._id || community.id)) && (<Badge variant="default">Joined</Badge>)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">{community.description}</CardDescription>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{(community.members || 0).toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{community.dailyPosts || 0} daily posts</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Moderators</p>
                  <div className="flex flex-wrap gap-1">
                    {(community.moderators || []).map((moderator) => (
                      <div key={String(moderator)} className="flex items-center space-x-1">
                        <Avatar className="h-5 w-5"><AvatarFallback className="text-xs">{(moderator || "").split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
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
                  <Button size="sm" variant={(joinedCommunities || []).includes(String(community._id || community.id)) ? "outline" : "default"} onClick={(e) => { e.stopPropagation(); handleJoinCommunity(community._id || community.id); }}>{(joinedCommunities || []).includes(String(community._id || community.id)) ? "Leave" : "Join"}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayedCommunities.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No communities found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or view mode.</p>
          </div>
        )}

        {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
          <div className="mt-6 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Join Requests</CardTitle>
                <CardDescription>Users requesting to join communities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {joinRequests.map(r => (
                    <div key={r._id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{r.userId?.name}</div>
                        <div className="text-xs text-muted-foreground">{r.userId?.email} → {r.communityId?.name}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={async ()=>{ const res = await fetch(`${API}/api/admin/join-requests/${r._id}/approve`, { method:'POST', headers: { Authorization:`Bearer ${token}` } }); if (res.ok) { toast({ title:'Approved' }); setJoinRequests(prev=>prev.filter(x=>x._id!==r._id)); }}}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={async ()=>{ const reason = window.prompt('Reason'); const res = await fetch(`${API}/api/admin/join-requests/${r._id}/reject`, { method:'POST', headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify({ reason }) }); if (res.ok) { toast({ title:'Rejected' }); setJoinRequests(prev=>prev.filter(x=>x._id!==r._id)); }}}>Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Community Requests</CardTitle>
                <CardDescription>Requests to create communities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communityRequests.map(r => (
                    <div key={r._id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">Requested by {r.userId?.name} • {r.category}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={async ()=>{ const res = await fetch(`${API}/api/admin/community-requests/${r._id}/approve`, { method:'POST', headers: { Authorization:`Bearer ${token}` } }); if (res.ok) { toast({ title:'Approved' }); setCommunityRequests(prev=>prev.filter(x=>x._id!==r._id)); }}}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={async ()=>{ const reason = window.prompt('Reason'); const res = await fetch(`${API}/api/admin/community-requests/${r._id}/reject`, { method:'POST', headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify({ reason }) }); if (res.ok) { toast({ title:'Rejected' }); setCommunityRequests(prev=>prev.filter(x=>x._id!==r._id)); }}}>Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedCommunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded shadow-lg w-full max-w-4xl max-h-[80vh] overflow-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedCommunity.name} — Posts</h2>
                  <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setSelectedCommunity(null)}>Close</Button>
                </div>
              </div>
              <div className="space-y-4">
                {Array.isArray(posts) && posts.length > 0 ? posts.map((post) => (
                  <Card key={post._id || post.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">{post.authorName} • {new Date(post.createdAt).toLocaleString()}</div>
                        <div className="mt-2">{post.content}</div>
                        {post.imageUrl && (
                          <div className="mt-2">
                            <img src={post.imageUrl} alt="post" className="max-h-48 w-full object-cover rounded" />
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-3">
                          <Button size="sm" variant={(post.reactions||[]).some((r)=>String(r.by)===String(user?.id) && (r.type==='like'))?"default":"ghost"} onClick={async () => {
                            try {
                              const res = await fetch(`${API}/api/posts/${post._id || post.id}/react`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ type: "like" }) });
                              const json = await res.json();
                              if (res.ok) setPosts(prev => { const arr = Array.isArray(prev) ? prev : []; return arr.map(p => String(p._id) === String(json.post._id) ? json.post : p); });
                            } catch (err) { console.error(err); }
                          }}>Like ({post.reactions?.filter((r)=>r.type==="like")?.length || 0})</Button>

                          <Button size="sm" variant={(post.reactions||[]).some((r)=>String(r.by)===String(user?.id) && (r.type==='helpful'))?"default":"outline"} onClick={async () => {
                            try {
                              const res = await fetch(`${API}/api/posts/${post._id || post.id}/react`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ type: "helpful" }) });
                              const json = await res.json();
                              if (res.ok) setPosts(prev => { const arr = Array.isArray(prev) ? prev : []; return arr.map(p => String(p._id) === String(json.post._id) ? json.post : p); });
                            } catch (err) { console.error(err); }
                          }}>Helpful ({post.reactions?.filter((r)=>r.type==="helpful")?.length || 0})</Button>

                        </div>
                        <div className="mt-3">
                          <div className="flex space-x-2">
                            <input value={commentTextById[post._id] || ""} onChange={(e) => setCommentTextById(prev=>({ ...prev, [post._id]: e.target.value }))} className="w-full rounded border px-2 py-1" placeholder="Write a comment..." />
                            <Button size="sm" onClick={async () => {
                              const content = commentTextById[post._id] || "";
                              if (!content) return;
                              try {
                                const res = await fetch(`${API}/api/posts/${post._id || post.id}/comment`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
                                const json = await res.json();
                                if (res.ok) { setPosts(prev => { const arr = Array.isArray(prev) ? prev : []; return arr.map(p => String(p._id) === String(json.post._id) ? json.post : p); }); setCommentTextById(prev=>({ ...prev, [post._id]: "" })); }
                              } catch (err) { console.error(err); }
                            }}>Send</Button>
                          </div>
                          <div className="mt-2 space-y-2">
                            {(post.comments||[]).map((c, idx) => (
                              <div key={c._id || c.id || idx} className="border rounded p-2">
                                <div className="text-sm font-medium">{c.authorName}</div>
                                <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
                                <div className="mt-1">{c.content}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{post.validationStatus}</div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">Be the first to post in this community.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
              <h3 className="text-lg font-medium mb-2">Request a Community</h3>
              <div className="space-y-2">
                <Input placeholder="Community name" value={requestForm.name} onChange={(e)=>setRequestForm(prev=>({...prev,name:e.target.value}))} />
                <Input placeholder="Category" value={requestForm.category} onChange={(e)=>setRequestForm(prev=>({...prev,category:e.target.value}))} />
                <textarea className="w-full border rounded p-2" rows={4} placeholder="Description" value={requestForm.description} onChange={(e)=>setRequestForm(prev=>({...prev,description:e.target.value}))} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={()=>setRequestModalOpen(false)}>Cancel</Button>
                <Button onClick={async ()=>{
                  try {
                    const url = `${API}/api/communities/request`;
                    const res = await fetch(url, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }, body: JSON.stringify(requestForm) });
                    const json = await res.json();
                    if (res.ok) { toast({ title: 'Requested', description: 'Community request sent to admins' }); setRequestModalOpen(false); setRequestForm({ name: '', description: '', category: '' }); }
                    else toast({ title: 'Request failed', description: json.message || 'Unable to request' });
                  } catch (err) { console.error(err); toast({ title: 'Request failed', description: 'Unable to request community' }); }
                }}>Send Request</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
