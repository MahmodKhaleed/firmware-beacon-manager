
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useBurnRequestList } from "@/hooks/useBurnRequests";
import { Loader2 } from "lucide-react";

export const BurnRequests = () => {
  const [deviceId] = useState(
    // In a real app, this would be stored/loaded from a configuration
    `controller-${Math.random().toString(36).substring(2, 7)}`
  );
  const { 
    burnRequests, 
    isLoading, 
    error,
    refetch,
    createRequest
  } = useBurnRequestList();
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800"
  };
  
  const initiateNewBurnRequest = (firmwareId: string, version: string) => {
    createRequest.mutate({
      firmwareId,
      firmwareVersion: version,
      deviceId
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Error loading burn requests
            <Button onClick={() => refetch()} size="sm" className="ml-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firmware Burn Requests</CardTitle>
        <CardDescription>
          Track and manage firmware burn operations across devices
        </CardDescription>
        <div className="text-sm text-muted-foreground">Device ID: {deviceId}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firmware</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Initiated By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {burnRequests && burnRequests.length > 0 ? (
                  burnRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.firmwareVersion}</div>
                        <div className="text-xs text-muted-foreground">{request.id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status]}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">{request.initiatedBy}</div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" disabled>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No burn requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
