import { useState } from "react";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";

const SAMPLE_NEWS_ITEMS = [
  {
    id: 1,
    title: "CSRD Amendment Proposed: Expanded Scope for SMEs",
    type: "AMENDMENT",
    status: "PUBLISHED",
    publishedDate: "Nov 27, 2024",
    views: 342,
    credibility: "OFFICIAL",
  },
  {
    id: 2,
    title: "ESRS Implementation Guidance Released",
    type: "GUIDANCE",
    status: "DRAFT",
    publishedDate: null,
    views: 0,
    credibility: "OFFICIAL",
  },
  {
    id: 3,
    title: "EU Taxonomy Update: New Activities Included",
    type: "UPDATE",
    status: "PUBLISHED",
    publishedDate: "Nov 22, 2024",
    views: 156,
    credibility: "OFFICIAL",
  },
];

export default function AdminNewsPanel() {
  const { user } = useAuth();
  const [newsItems, setNewsItems] = useState(SAMPLE_NEWS_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⛔</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access the admin panel. Only
            administrators can manage news content.
          </p>
          <Link href="/hub">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Return to Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredNews = newsItems.filter(item => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const publishNews = (id: number) => {
    setNewsItems(
      newsItems.map(item =>
        item.id === id
          ? {
              ...item,
              status: "PUBLISHED",
              publishedDate: new Date().toLocaleDateString(),
            }
          : item
      )
    );
  };

  const deleteNews = (id: number) => {
    setNewsItems(newsItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/hub"
            className="text-accent hover:text-accent/80 transition font-medium"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-lg font-bold text-foreground">
            Admin: News Management
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                News Management
              </h2>
              <p className="text-muted-foreground">
                Create, edit, and publish regulatory news and updates for the
                ESG Hub.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </div>

          {/* New Article Form */}
          {showForm && (
            <div className="card-elevated p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Create New Article
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title
                  </label>
                  <Input
                    type="text"
                    placeholder="Article title..."
                    className="w-full"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type
                    </label>
                    <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                      <option>NEW_LAW</option>
                      <option>AMENDMENT</option>
                      <option>ENFORCEMENT</option>
                      <option>GUIDANCE</option>
                      <option>PROPOSAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Credibility
                    </label>
                    <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                      <option>OFFICIAL</option>
                      <option>INDUSTRY</option>
                      <option>NEWS</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Summary
                  </label>
                  <textarea
                    placeholder="Brief summary of the news..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Content
                  </label>
                  <textarea
                    placeholder="Full article content..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    rows={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Save as Draft
                  </Button>
                  <Button variant="outline">Publish Immediately</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground py-2">
                Filter by status:
              </span>
              {["PUBLISHED", "DRAFT"].map(status => (
                <button
                  key={status}
                  onClick={() =>
                    setSelectedStatus(selectedStatus === status ? null : status)
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedStatus === status
                      ? "bg-accent text-accent-foreground"
                      : "bg-card border border-border text-foreground hover:border-accent"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* News Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 font-semibold text-foreground">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground">
                    Published
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground">
                    Views
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map(item => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-card/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.credibility}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.publishedDate || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {item.status === "DRAFT" && (
                          <button
                            onClick={() => publishNews(item.id)}
                            className="p-2 hover:bg-card rounded-lg transition"
                            title="Publish"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          className="p-2 hover:bg-card rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => deleteNews(item.id)}
                          className="p-2 hover:bg-card rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {newsItems.filter(n => n.status === "PUBLISHED").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Published Articles
              </p>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {newsItems.filter(n => n.status === "DRAFT").length}
              </div>
              <p className="text-xs text-muted-foreground">Draft Articles</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {newsItems
                  .reduce((sum, n) => sum + n.views, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect - ESG Regulations Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
