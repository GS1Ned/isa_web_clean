// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * EPCIS Supply Chain Visualization
 * Interactive network graph showing supply chain nodes and relationships
 */

export default function EPCISSupplyChain() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const {
    data: visualization,
    isLoading,
    error,
  } = trpc.epcis.getSupplyChainVisualization.useQuery();

  useEffect(() => {
    if (!visualization) return;

    // Convert visualization data to React Flow format
    const flowNodes: Node[] = visualization.nodes.map((node: any) => {
      const riskColor =
        node.riskLevel === "high"
          ? "#ef4444"
          : node.riskLevel === "medium"
            ? "#f59e0b"
            : "#10b981";

      return {
        id: node.id.toString(),
        type: "default",
        data: {
          label: (
            <div className="text-center">
              <div className="font-semibold text-sm">{node.name}</div>
              <div className="text-xs text-muted-foreground">
                {node.nodeType}
              </div>
              {node.tierLevel && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Tier {node.tierLevel}
                </Badge>
              )}
            </div>
          ),
        },
        position: node.position || {
          x: Math.random() * 500,
          y: Math.random() * 500,
        },
        style: {
          background: "#ffffff",
          border: `2px solid ${riskColor}`,
          borderRadius: "8px",
          padding: "12px",
          minWidth: "150px",
        },
      };
    });

    const flowEdges: Edge[] = visualization.edges.map((edge: any) => ({
      id: edge.id.toString(),
      source: edge.fromNodeId.toString(),
      target: edge.toNodeId.toString(),
      label: edge.relationshipType,
      type: "smoothstep",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: "#888",
        strokeWidth: 2,
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [visualization, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeData = visualization?.nodes.find(
        (n: any) => n.id.toString() === node.id
      );
      setSelectedNode(nodeData);
    },
    [visualization]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            Loading supply chain visualization...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading supply chain: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!visualization || visualization.nodes.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Supply Chain Visualization
          </h1>
          <p className="text-muted-foreground">
            Interactive network graph of your supply chain nodes and
            relationships
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No supply chain data available. Upload EPCIS events to generate your
            supply chain map.
            <a
              href="/epcis/upload"
              className="ml-2 text-primary hover:underline"
            >
              Upload EPCIS Document →
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Supply Chain Visualization</h1>
        <p className="text-muted-foreground">
          Interactive network graph showing {visualization.nodes.length} nodes
          and {visualization.edges.length} relationships
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div style={{ height: "600px" }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  fitView
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Risk Level Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">High Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Node Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Node Details</CardTitle>
              <CardDescription>Click on a node to view details</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedNode && (
                <div className="text-center text-muted-foreground py-8">
                  <Info className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Select a node to view details</p>
                </div>
              )}

              {selectedNode && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Name
                    </div>
                    <div className="font-semibold">{selectedNode.name}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Type
                    </div>
                    <Badge>{selectedNode.nodeType}</Badge>
                  </div>

                  {selectedNode.gln && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        GLN
                      </div>
                      <div className="text-sm font-mono">
                        {selectedNode.gln}
                      </div>
                    </div>
                  )}

                  {selectedNode.tierLevel && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Tier Level
                      </div>
                      <div className="text-sm">
                        Tier {selectedNode.tierLevel}
                      </div>
                    </div>
                  )}

                  {selectedNode.riskLevel && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Risk Level
                      </div>
                      <Badge
                        variant={
                          selectedNode.riskLevel === "high"
                            ? "destructive"
                            : selectedNode.riskLevel === "medium"
                              ? "default"
                              : "outline"
                        }
                      >
                        {selectedNode.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {selectedNode.locationLat && selectedNode.locationLng && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Location
                      </div>
                      <div className="text-sm">
                        {parseFloat(selectedNode.locationLat).toFixed(4)},{" "}
                        {parseFloat(selectedNode.locationLng).toFixed(4)}
                      </div>
                    </div>
                  )}

                  {selectedNode.certifications &&
                    selectedNode.certifications.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Certifications
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.certifications.map(
                            (cert: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {cert}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {selectedNode.riskFactors &&
                    selectedNode.riskFactors.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Risk Factors
                        </div>
                        <ul className="text-sm space-y-1">
                          {selectedNode.riskFactors.map(
                            (factor: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span>{factor}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Supply Chain Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Nodes
                </span>
                <span className="font-semibold">
                  {visualization.nodes.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Relationships
                </span>
                <span className="font-semibold">
                  {visualization.edges.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  High Risk Nodes
                </span>
                <span className="font-semibold text-red-600">
                  {
                    visualization.nodes.filter(
                      (n: any) => n.riskLevel === "high"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Medium Risk Nodes
                </span>
                <span className="font-semibold text-amber-600">
                  {
                    visualization.nodes.filter(
                      (n: any) => n.riskLevel === "medium"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Low Risk Nodes
                </span>
                <span className="font-semibold text-green-600">
                  {
                    visualization.nodes.filter(
                      (n: any) => n.riskLevel === "low"
                    ).length
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
