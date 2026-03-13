// @ts-nocheck
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AdminEvidenceVerification() {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(
    null
  );
  const [verificationNotes, setVerificationNotes] = useState("");

  // Fetch all pending evidence for verification
  const {
    data: pendingEvidence,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = trpc.remediation.getStepEvidence.useQuery(
    { stepId: 0 }, // This would need to be updated to fetch all pending evidence
    { enabled: false }
  );

  const verifyEvidenceMutation = trpc.remediation.verifyEvidence.useMutation();

  const handleVerifyEvidence = async (
    evidenceId: number,
    approved: boolean
  ) => {
    try {
      await verifyEvidenceMutation.mutateAsync({
        evidenceId,
        verified: approved,
        notes: verificationNotes,
      });
      setVerificationNotes("");
      setSelectedEvidenceId(null);
      // Refetch evidence list
      await refetchPending();
    } catch (error) {
      alert(`Failed to verify evidence: ${String(error)}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Evidence Verification</h1>
        <p className="text-gray-600">
          Review and verify compliance evidence submitted by users
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {/* Pending Evidence */}
        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <div className="text-center py-8">Loading pending evidence...</div>
          ) : !pendingEvidence || pendingEvidence.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No pending evidence to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingEvidence.map(item => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedEvidenceId(item.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.evidenceType}</CardDescription>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Uploaded by: {item.uploadedBy}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Evidence Review Panel */}
          {selectedEvidenceId && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle>Review Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={e => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about your verification decision..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      handleVerifyEvidence(selectedEvidenceId, true)
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() =>
                      handleVerifyEvidence(selectedEvidenceId, false)
                    }
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Verified Evidence */}
        <TabsContent value="verified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verified Evidence</CardTitle>
              <CardDescription>Evidence that has been approved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p>Verified evidence will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Evidence */}
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Evidence</CardTitle>
              <CardDescription>
                Evidence that requires resubmission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <p>Rejected evidence will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
