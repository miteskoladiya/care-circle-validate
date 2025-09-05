import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, MessageSquare, Heart, Activity, Plus, TrendingUp, Calendar, Award, CheckCircle, Clock } from "lucide-react";
import { Navbar } from "@/components/Layout/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";
import { initSocketClient } from "@/lib/socket";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, token } = useAuth();
  const API = getApiUrl();
  const [communities, setCommunities] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const cRes = await fetch(`${API}/api/communities`);
        const cJson = await cRes.json();
        setCommunities(cJson.communities || []);

        const pRes = await fetch(`${API}/api/posts`);
        const pJson = await pRes.json();
        setRecentQuestions(pJson.posts || []);
      } catch (err) {
        console.error(err);
        toast({ title: "Load failed", description: "Unable to load dashboard data" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API, token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const role = user?.role;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening in your healthcare communities today.</p>
          </div>
          {!(role === "Admin" || role === "SuperAdmin") && (
            <Button className="flex items-center space-x-2"><Plus className="h-4 w-4" /><span>Ask Question</span></Button>
          )}
          {(role === "Admin" || role === "SuperAdmin") && (
            <Button className="flex items-center space-x-2" onClick={() => window.location.assign('/admin?tab=communities')}><Plus className="h-4 w-4" /><span>Create Community</span></Button>
          )}
        </div>

        {role === "Patient" && <PatientDashboard communities={communities} recentQuestions={recentQuestions} />}
        {role === "Doctor" && <DoctorDashboard recentQuestions={recentQuestions} />}
        {(role === "Admin" || role === "SuperAdmin") && (<AdminDashboard communities={communities} recentQuestions={recentQuestions} token={token} api={API} />)}
      </div>
    </div>
  );
}

function PatientDashboard({ communities, recentQuestions }) {
  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>My Communities</CardTitle>
            <CardDescription>Communities you've joined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communities.map((community) => (
                <div key={community._id || community.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <div>
                      <p className="font-medium">{community.name}</p>
                      <p className="text-sm text-muted-foreground">{community.members ?? 0} members</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{(community.dailyPosts ?? 0)} new</Badge>
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
              {recentQuestions.map((question) => (
                <div key={question._id || question.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{question.title}</p>
                      <p className="text-xs text-muted-foreground">{question.community} • {new Date(question.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge variant={question.validationStatus === "validated" ? "default" : "secondary"}>{question.validationStatus === "validated" ? "Validated" : "Pending"}</Badge>
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

function DoctorDashboard({ recentQuestions }) {
  const { token } = useAuth();
  const API = getApiUrl();
  const { toast } = useToast();
  const [pending, setPending] = useState([]);

  useEffect(() => {
    async function loadPending() {
      try {
        const res = await fetch(`${API}/api/posts/pending`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const json = await res.json();
        if (res.ok) setPending(json.posts || []);
      } catch (err) { console.error(err); }
    }
    loadPending();
  }, [API, token]);

  useEffect(() => {
    const base = API.replace(/\/api\/?$/, "") || window.location.origin;
    const s = initSocketClient(base);
    const onAi = (post) => setPending(prev => [post, ...prev]);
    const onValidated = (data) => setPending(prev => prev.filter(p => String(p._id) !== String(data.postId)));
    s.on("post:ai_created", onAi);
    s.on("post:validated", onValidated);
    return () => { s.off("post:ai_created", onAi); s.off("post:validated", onValidated); };
  }, [API]);

  const approve = async (id) => {
    try {
      const res = await fetch(`${API}/api/posts/${id}/validate`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ status: "validated" }) });
      const json = await res.json();
      if (res.ok) { toast({ title: "Validated", description: json.post.title }); setPending(prev => prev.filter(p => String(p._id) !== String(json.post._id))); }
      else { toast({ title: "Validate failed", description: json.message || "Unable to validate" }); }
    } catch (err) { toast({ title: "Validate failed", description: err?.message || String(err) }); }
  };

  const reject = async (id) => {
    try {
      const res = await fetch(`${API}/api/posts/${id}/validate`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }) });
      const json = await res.json();
      if (res.ok) { toast({ title: "Rejected", description: json.post.title }); setPending(prev => prev.filter(p => String(p._id) !== String(json.post._id))); }
      else { toast({ title: "Reject failed", description: json.message || "Unable to reject" }); }
    } catch (err) { toast({ title: "Reject failed", description: err?.message || String(err) }); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending AI Posts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.filter(p => p.validationStatus === 'validated').length}</div>
            <p className="text-xs text-muted-foreground">Posts you validated</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h 14m</div>
            <p className="text-xs text-muted-foreground">Across your communities</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expert Endorsements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Doctors recommended</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pending AI-generated Posts</CardTitle>
            <CardDescription>Review and validate posts generated by the AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pending.map((post) => (
                <div key={post._id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{post.community} • {new Date(post.createdAt).toLocaleString()}</p>
                      <div className="mt-2 text-sm">{post.content}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Button size="sm" onClick={() => approve(post._id)}>Validate</Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(post._id)}>Reject</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
            <CardDescription>AI-assisted posts and patient questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuestions.slice(0, 8).map((q) => (
                <div className="flex items-center justify-between" key={q._id}>
                  <div>
                    <p className="font-medium text-sm">{q.title}</p>
                    <p className="text-xs text-muted-foreground">{q.community} • {new Date(q.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{q.validationStatus}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ communities, recentQuestions, token, api }) {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const { toast } = useToast();
  const [previewDoc, setPreviewDoc] = useState(null); // { id, url }
  const [viewedDocs, setViewedDocs] = useState(new Set());
  const [previewError, setPreviewError] = useState(false);
  const [rejectingDoctor, setRejectingDoctor] = useState(null); // id of doctor being rejected
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function loadPending() {
      try {
        const res = await fetch(`${api}/api/admin/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const json = await res.json();
        if (res.ok) { setPendingDoctors((json.users || []).filter((u) => u.role === "Doctor" && !u.isVerified)); }
      } catch (err) { console.error(err); }
    }
    loadPending();
  }, [api, token]);

  const approve = async (id) => {
    try {
      const res = await fetch(`${api}/api/admin/users/${id}/approve`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" } });
      const json = await res.json();
      if (res.ok) { toast({ title: "Doctor approved", description: `${json.user.name} is now verified.` }); setPendingDoctors(prev => prev.filter(d => d._id !== id && d.id !== id)); }
      else { toast({ title: "Approve failed", description: json.message || "Unable to approve" }); }
    } catch (err) { toast({ title: "Approve failed", description: err?.message || String(err) }); }
  };

  const openDocPreview = (d) => {
  const backendBase = (api && String(api).trim()) || getApiUrl();
  const base = String(backendBase).replace(/\/api\/?$/, '').replace(/\/$/, '');
  const doc = d.doctorDocument && String(d.doctorDocument).trim();
  const url = doc ? (doc.match(/^https?:\/\//i) ? doc : base + (doc.startsWith('/') ? doc : '/' + doc)) : null;
    if (!url) { toast({ title: 'No document', description: 'No doctor document available' }); return; }
    setPreviewError(false);
    setPreviewDoc({ id: d._id, url });
    setViewedDocs(prev => new Set(prev).add(d._id));
    // quick accessibility check
    (async () => {
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) setPreviewError(true);
      } catch (err) {
        setPreviewError(true);
      }
    })();
  };

  const closePreview = () => setPreviewDoc(null);

  const startReject = (id) => { setRejectingDoctor(id); setRejectReason(""); };

  const confirmReject = async () => {
    const id = rejectingDoctor;
    const reason = rejectReason;
    setRejectingDoctor(null);
    if (reason == null) return; // cancelled
    try {
      // try a dedicated reject endpoint first
      const rejectRes = await fetch(`${api}/api/admin/users/${id}/reject`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
      if (rejectRes.ok) {
        const json = await rejectRes.json();
        toast({ title: 'Rejected', description: json.message || 'Doctor rejected' });
        setPendingDoctors(prev => prev.filter(d => d._id !== id && d.id !== id));
        return;
      }
    } catch (err) { /* ignore and fallback */ }

    // fallback: remove user
    try {
      const res = await fetch(`${api}/api/admin/users/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } });
      const json = await res.json();
      if (res.ok) {
        toast({ title: 'Rejected', description: reason || 'Doctor rejected' });
        setPendingDoctors(prev => prev.filter(d => d._id !== id && d.id !== id));
      } else {
        toast({ title: 'Reject failed', description: json.message || 'Unable to reject' });
      }
    } catch (err) { toast({ title: 'Reject failed', description: err?.message || String(err) }); }
  };

  const editCommunity = async (c) => {
    const name = window.prompt('Name', c.name);
    if (name == null) return; // cancelled
    const category = window.prompt('Category', c.category || '');
    if (category == null) return;
    const description = window.prompt('Description', c.description || '');
    if (description == null) return;
    try {
      const res = await fetch(`${api}/api/communities/${c._id || c.id}`, { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, category, description }) });
      const json = await res.json();
      if (res.ok) {
        setPendingDoctors(prev => prev); // no-op but keeps state change pattern
        // update local communities list
        // communities is a prop; try to update DOM by reloading page section
        toast({ title: 'Updated', description: json.community.name });
        // naive refresh: reload page to pick up changes
        window.location.reload();
      } else {
        toast({ title: 'Update failed', description: json.message || 'Unable to update community' });
      }
    } catch (err) { toast({ title: 'Update failed', description: err?.message || String(err) }); }
  };

  const removeCommunity = async (id) => {
    if (!window.confirm('Delete this community? This cannot be undone.')) return;
    try {
      const res = await fetch(`${api}/api/communities/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } });
      const json = await res.json();
      if (res.ok) {
        toast({ title: 'Deleted', description: 'Community removed' });
        window.location.reload();
      } else {
        toast({ title: 'Delete failed', description: json.message || 'Unable to delete' });
      }
    } catch (err) { toast({ title: 'Delete failed', description: err?.message || String(err) }); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Doctor Verifications</CardTitle>
            <CardDescription>Pending doctor accounts requiring approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDoctors.map((d) => (
                <div key={d._id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8"><AvatarFallback>{(d.name || "").split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.doctorDocument && (
                      <Button size="sm" onClick={() => openDocPreview(d)}>View</Button>
                    )}
                    <Button size="sm" onClick={() => approve(d._id)} disabled={!viewedDocs.has(d._id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => startReject(d._id)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        {previewDoc && (
          <Dialog open={true} onOpenChange={(open) => { if (!open) closePreview(); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Doctor Document</DialogTitle>
                <DialogDescription className="mb-2">Preview the uploaded document.</DialogDescription>
              </DialogHeader>
              <div className="w-full h-[60vh]">
                {previewError ? (
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">Unable to preview the document. You can download it directly:</p>
                    <a className="text-primary underline" href={previewDoc.url} target="_blank" rel="noreferrer">Open / Download document</a>
                  </div>
                ) : (
                  (previewDoc.url.match(/\.(jpg|jpeg|png)$/i)) ? (
                    <img src={previewDoc.url} alt="doctor document" className="w-full h-full object-contain" onError={() => setPreviewError(true)} />
                  ) : (
                    <iframe src={previewDoc.url} title="doctor document" className="w-full h-full" onError={() => setPreviewError(true)} />
                  )
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => { closePreview(); }}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Reject Reason Dialog */}
        {rejectingDoctor && (
          <Dialog open={true} onOpenChange={(open) => { if (!open) setRejectingDoctor(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Doctor</DialogTitle>
                <DialogDescription className="mb-2">Provide a reason for rejecting this doctor account.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full border rounded p-2" rows={4} />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setRejectingDoctor(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => confirmReject()}>Confirm Reject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Communities</CardTitle>
            <CardDescription>Manage communities and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {communities.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.category} • {c.members || 0} members</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => window.location.assign(`/admin?tab=communities&editId=${c._id || c.id}`)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeCommunity(c._id || c.id)}>Delete</Button>
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
