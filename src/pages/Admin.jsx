import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Layout/Navbar";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { initSocketClient } from "@/lib/socket";

export default function Admin() {
  const { token } = useAuth();
  const API = getApiUrl();
  const [users, setUsers] = useState([]);
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [aiTitle, setAiTitle] = useState("");
  const [aiContent, setAiContent] = useState("");
  const [aiCommunity, setAiCommunity] = useState("");
  const [pendingPosts, setPendingPosts] = useState([]);
  const [tab, setTab] = useState("users");
  const [communities, setCommunities] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // check query params for tab (e.g. /admin?tab=communities) and editId
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('tab');
      const editId = params.get('editId');
      if (q) setTab(q);
      if (editId) {
        setEditingId(editId);
        // try to prefill once communities load below
      }
    } catch (err) { /* ignore */ }

    async function load() {
      try {
        const res = await fetch(`${API}/api/admin/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const json = await res.json();
        if (res.ok) setUsers(json.users || []);
        try {
          const r2 = await fetch(`${API}/api/admin/posts/pending`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          const j2 = await r2.json();
          if (r2.ok) setPendingPosts(j2.posts || []);
        } catch (err) { console.error(err); }
        try {
          const r3 = await fetch(`${API}/api/communities`);
          const j3 = await r3.json();
          if (r3.ok) {
            setCommunities(j3.communities || []);
            // if editingId is present, prefill form
            try {
              const params = new URLSearchParams(window.location.search);
              const editId = params.get('editId');
              if (editId) {
                const target = (j3.communities || []).find(c => (c._id === editId || c.id === editId));
                if (target) {
                  setName(target.name || '');
                  setCategory(target.category || '');
                  setDescription(target.description || '');
                }
              }
            } catch (err) { /* ignore */ }
          }
        } catch (err) { console.error(err); }
      } catch (err) {
        console.error(err);
        toast({ title: "Load failed", description: "Unable to load users" });
      }
    }
    load();
  }, [API, token]);

  useEffect(() => {
    const base = API.replace(/\/api\/?$/, "") || window.location.origin;
    const s = initSocketClient(base);
    const onAi = (post) => setPendingPosts(prev => [post, ...prev]);
    s.on("post:ai_created", onAi);
    return () => s.off("post:ai_created", onAi);
  }, [API]);

  const changeRole = async (id, role) => {
    try {
      const res = await fetch(`${API}/api/admin/users/${id}/role`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const json = await res.json();
      if (res.ok) {
        setUsers(u => u.map(x => (x._id===id||x.id===id)?json.user:x));
        toast({ title: "Role updated", description: `${json.user.name} is now ${json.user.role}` });
      } else {
        toast({ title: "Update failed", description: json.message || "Unable to change role" });
      }
    } catch (err) { toast({ title: "Update failed", description: err?.message || String(err) }); }
  };

  const deleteCommunity = async (id) => {
    try {
      const res = await fetch(`${API}/api/communities/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" } });
      const json = await res.json();
      if (res.ok) {
        setCommunities(prev => prev.filter(c => c._id !== id && c.id !== id));
        toast({ title: "Deleted", description: "Community removed" });
      } else {
        toast({ title: "Delete failed", description: json.message || "Unable to delete" });
      }
    } catch (err) { toast({ title: "Delete failed", description: err?.message || String(err) }); }
  };

  const createCommunity = async () => {
    try {
      if (editingId) {
        const res = await fetch(`${API}/api/communities/${editingId}`, { method: "PUT", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, category }) });
        const json = await res.json();
        if (res.ok) {
          setCommunities(prev => prev.map(c => (c._id === json.community._id || c.id === json.community._id) ? json.community : c));
          toast({ title: "Updated", description: json.community.name });
          setName(""); setDescription(""); setCategory(""); setEditingId(null);
          // remove editId from url
          history.replaceState(null, '', '/admin?tab=communities');
        } else {
          toast({ title: "Update failed", description: json.message || "Unable to update" });
        }
      } else {
        const res = await fetch(`${API}/api/communities`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, category }) });
        const json = await res.json();
        if (res.ok) {
          setCommunities(prev => [json.community, ...prev]);
          toast({ title: "Community created", description: json.community.name });
          setName(""); setDescription(""); setCategory("");
        } else {
          toast({ title: "Create failed", description: json.message || "Unable to create" });
        }
      }
    } catch (err) { toast({ title: "Create failed", description: err?.message || String(err) }); }
  };

  const validatePost = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/posts/${id}/validate`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const json = await res.json();
      if (res.ok) {
        setPendingPosts(prev => prev.filter(p => String(p._id) !== String(json.post._id)));
        toast({ title: status === "validated" ? "Approved" : "Rejected", description: json.post.title });
      } else {
        toast({ title: "Action failed", description: json.message || "Unable to update" });
      }
    } catch (err) { toast({ title: "Action failed", description: err?.message || String(err) }); }
  };

  const approve = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/users/${id}/approve`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" } });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Approved", description: `${json.user.name} is verified` });
        setUsers((u) => u.map((item) => (item._id === id || item.id === id ? json.user : item)));
      } else {
        toast({ title: "Approve failed", description: json.message || "Unable to approve" });
      }
    } catch (err) {
      toast({ title: "Approve failed", description: err?.message || String(err) });
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" } });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Deleted", description: "User removed" });
        setUsers((u) => u.filter((item) => item._id !== id && item.id !== id));
      } else {
        toast({ title: "Delete failed", description: json.message || "Unable to delete" });
      }
    } catch (err) {
      toast({ title: "Delete failed", description: err?.message || String(err) });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <div className="mb-4">
          <div className="flex space-x-2">
            <Button variant={tab === 'users' ? undefined : 'ghost'} onClick={() => setTab('users')}>Users</Button>
            <Button variant={tab === 'communities' ? undefined : 'ghost'} onClick={() => setTab('communities')}>Create Community</Button>
            <Button variant={tab === 'posts' ? undefined : 'ghost'} onClick={() => setTab('posts')}>Posts</Button>
          </div>
        </div>

        {tab === 'users' && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Users</h2>
            <div className="grid grid-cols-1 gap-4">
              {users.map((u) => (
                <Card key={u._id || u.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{(u.name || "").split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-muted-foreground">{u.email} • {u.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select value={u.role} onChange={(e) => changeRole(u._id || u.id, e.target.value)} className="border rounded px-2 py-1">
                      <option value="Patient">Patient</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Admin">Admin</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                    {u.role === "Doctor" && !u.isVerified && (
                      <Button size="sm" onClick={() => approve(u._id || u.id)}>Approve</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => remove(u._id || u.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'communities' && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Create Community</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Create Community</CardTitle>
                  <CardDescription>Add a new community visible to users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                    {/* Color removed to avoid dynamic Tailwind classes */}
                    <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <div className="flex space-x-2 mt-2">
                      <Button onClick={createCommunity}>Create</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-md font-medium mb-2">Existing</h3>
                <div className="space-y-2">
                  {communities.map(c => (
                    <Card key={c._id || c.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-sm text-muted-foreground">{c.category} • {c.members || 0} members</div>
                      </div>
                      <div className="flex space-x-2">
                        {/* <Button size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(c))}>Copy</Button> */}
                        <Button size="sm" variant="destructive" onClick={() => deleteCommunity(c._id || c.id)}>Delete</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'posts' && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Pending AI Posts</h2>
            <div className="space-y-3">
              {pendingPosts.map(p => (
                <Card key={p._id || p.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-muted-foreground">{p.community} • {new Date(p.createdAt).toLocaleString()}</div>
                      <div className="mt-2">{p.content}</div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => validatePost(p._id || p.id, 'validated')}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => validatePost(p._id || p.id, 'rejected')}>Reject</Button>
                      </div>
                      <Button size="sm" onClick={async () => {
                        try {
                          const res = await fetch(`${API}/api/posts/${p._id || p.id}/publish`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" } });
                          const json = await res.json();
                          if (res.ok) {
                            toast({ title: "Published", description: json.post.title });
                            setPendingPosts(prev => prev.filter(x => x._id !== p._id));
                          } else {
                            toast({ title: "Publish failed", description: json.message || "Unable to publish" });
                          }
                        } catch (err) { toast({ title: "Publish failed", description: err?.message || String(err) }); }
                      }}>Publish</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
