import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Users,
  Clock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RoadmapCollaborationProps {
  roadmapId: number;
}

export default function RoadmapCollaboration({
  roadmapId,
}: RoadmapCollaborationProps) {
  const [activeTab, setActiveTab] = useState<
    "comments" | "approvals" | "team" | "activity"
  >("comments");
  const [newComment, setNewComment] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approverIds, setApproverIds] = useState<string>("");
  const [approverRole, setApproverRole] = useState<
    "stakeholder" | "manager" | "admin"
  >("stakeholder");

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } =
    trpc.collaboration.getComments.useQuery({
      roadmapId,
    });

  // Fetch approval status
  const { data: approvalStatus } =
    trpc.collaboration.getApprovalStatus.useQuery({
      roadmapId,
    });

  // Fetch pending approvals
  const { data: pendingApprovals } =
    trpc.collaboration.getPendingApprovals.useQuery({});

  // Fetch activity log
  const { data: activityLog } = trpc.collaboration.getActivityLog.useQuery({
    roadmapId,
  });

  // Fetch team access
  const { data: teamAccess } = trpc.collaboration.getTeamAccess.useQuery({
    roadmapId,
  });

  // Mutations
  const addCommentMutation = trpc.collaboration.addComment.useMutation();
  const requestApprovalMutation =
    trpc.collaboration.requestApproval.useMutation();
  const _grantAccessMutation = trpc.collaboration.grantAccess.useMutation();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await addCommentMutation.mutateAsync({
      roadmapId,
      content: newComment,
    });

    setNewComment("");
  };

  const handleRequestApproval = async () => {
    const ids = approverIds
      .split(",")
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));

    if (ids.length === 0) return;

    await requestApprovalMutation.mutateAsync({
      roadmapId,
      approverIds: ids,
      approverRole,
    });

    setApproverIds("");
    setShowApprovalForm(false);
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200";
      case "rejected":
        return "bg-red-50 border-red-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Approval Status Overview */}
      {approvalStatus && (
        <Card
          className={`border ${getApprovalStatusColor(approvalStatus.status)}`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getApprovalStatusIcon(approvalStatus.status)}
                <div>
                  <p className="font-semibold capitalize">
                    {approvalStatus.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    {approvalStatus.approved} of {approvalStatus.totalApprovals}{" "}
                    approvals
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {approvalStatus.approvalPercentage}%
                </p>
                <p className="text-xs text-gray-600">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("comments")}
          className={`px-4 py-2 font-medium ${
            activeTab === "comments"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Comments
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-4 py-2 font-medium ${
            activeTab === "approvals"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Approvals
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 font-medium ${
            activeTab === "team"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Team
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 font-medium ${
            activeTab === "activity"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Activity
        </button>
      </div>

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Share your thoughts, feedback, or approval..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="min-h-24"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-3">
            {commentsLoading ? (
              <p className="text-gray-500">Loading comments...</p>
            ) : comments && comments.length > 0 ? (
              comments.map(comment => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">User {comment.userId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {comment.isApproval && (
                        <Badge
                          className={
                            comment.approvalStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {comment.approvalStatus}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showApprovalForm ? (
                <Button onClick={() => setShowApprovalForm(true)}>
                  Request Approval
                </Button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Approver IDs (comma-separated)
                    </label>
                    <Input
                      placeholder="e.g., 1, 2, 3"
                      value={approverIds}
                      onChange={e => setApproverIds(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Approver Role
                    </label>
                    <select
                      value={approverRole}
                      onChange={e => setApproverRole(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="stakeholder">Stakeholder</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestApproval}
                      disabled={
                        !approverIds.trim() || requestApprovalMutation.isPending
                      }
                    >
                      {requestApprovalMutation.isPending
                        ? "Requesting..."
                        : "Request"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowApprovalForm(false);
                        setApproverIds("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          {pendingApprovals && pendingApprovals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingApprovals.map(approval => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Roadmap {approval.roadmapId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{approval.approverRole}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {teamAccess && teamAccess.length > 0 ? (
                <div className="space-y-2">
                  {teamAccess.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <p className="font-medium">User {member.userId}</p>
                      <Badge variant="outline">{member.accessLevel}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No team members yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLog && activityLog.length > 0 ? (
              <div className="space-y-3">
                {activityLog.map(activity => (
                  <div
                    key={activity.id}
                    className="flex gap-3 pb-3 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {activity.activityType}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No activity yet</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
