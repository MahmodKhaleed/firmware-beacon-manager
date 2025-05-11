
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useBurnerWorkflow } from "@/hooks/useBurnRequests";
import { BurnRequest } from "@/utils/burnRequestUtils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export const BurnSimulator = () => {
  const { toast } = useToast();
  const [deviceId] = useState(
    // In a real app, this would be stored/loaded from a configuration
    `burner-${Math.random().toString(36).substring(2, 7)}`
  );
  const [burnProgress, setBurnProgress] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  
  const {
    currentTask,
    isClaiming,
    isUpdating,
    claimTask,
    completeTask,
    failTask
  } = useBurnerWorkflow(deviceId);
  
  // Progress simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (simulationRunning && currentTask && burnProgress < 100) {
      interval = setInterval(() => {
        setBurnProgress(prev => {
          // Randomly determine if we should fail
          if (prev > 70 && Math.random() > 0.95) {
            setSimulationError("Simulated burn failure at " + prev + "%");
            setSimulationRunning(false);
            clearInterval(interval!);
            return prev;
          }
          
          const newProgress = prev + Math.random() * 5;
          if (newProgress >= 100) {
            setSimulationRunning(false);
            clearInterval(interval!);
            return 100;
          }
          return newProgress;
        });
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationRunning, currentTask, burnProgress]);
  
  // Handle task completion or failure
  useEffect(() => {
    if (!currentTask || simulationRunning || isUpdating) return;
    
    // If burn is complete, update the status
    if (burnProgress === 100) {
      completeTask(currentTask.id);
      toast({
        title: "Burn Completed",
        description: `Successfully burned firmware ${currentTask.firmwareVersion}`
      });
      setBurnProgress(0);
    } 
    // If there was an error, fail the task
    else if (simulationError) {
      failTask(currentTask.id, simulationError);
      toast({
        title: "Burn Failed",
        description: simulationError,
        variant: "destructive"
      });
      setSimulationError(null);
      setBurnProgress(0);
    }
  }, [burnProgress, simulationError, currentTask, simulationRunning, isUpdating]);
  
  const startBurnProcess = () => {
    if (!currentTask) {
      claimTask();
      return;
    }
    
    setBurnProgress(0);
    setSimulationError(null);
    setSimulationRunning(true);
  };
  
  const cancelBurn = () => {
    if (currentTask) {
      setSimulationRunning(false);
      const errorMessage = "Burn operation canceled by user";
      setSimulationError(errorMessage);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>RPi-2 Burn Simulator</CardTitle>
        <CardDescription>
          Simulate firmware burning operations on a Raspberry Pi device
        </CardDescription>
        <div className="text-sm text-muted-foreground">Device ID: {deviceId}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentTask ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Waiting for burn tasks</h3>
            <p className="text-muted-foreground mb-4">
              No active burn task assigned to this device
            </p>
            <Button 
              onClick={startBurnProcess} 
              disabled={isClaiming}
              className="min-w-[200px]"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking for tasks...
                </>
              ) : (
                "Check for burn tasks"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertTitle>Active Firmware Burn Task</AlertTitle>
              <AlertDescription className="grid gap-1 pt-2">
                <div><strong>Firmware:</strong> {currentTask.firmwareVersion}</div>
                <div><strong>Request ID:</strong> {currentTask.id}</div>
                <div><strong>Initiated By:</strong> {currentTask.initiatedBy}</div>
                <div><strong>Created At:</strong> {new Date(currentTask.createdAt).toLocaleString()}</div>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Burn Progress</span>
                <span>{Math.round(burnProgress)}%</span>
              </div>
              <Progress value={burnProgress} className="h-2" />
            </div>
            
            {simulationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Burn Failed</AlertTitle>
                <AlertDescription>{simulationError}</AlertDescription>
              </Alert>
            )}
            
            {burnProgress === 100 && !simulationError && (
              <Alert variant="default" className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Burn Completed</AlertTitle>
                <AlertDescription>Successfully burned firmware {currentTask.firmwareVersion}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentTask && (
          <>
            <Button 
              variant="outline" 
              disabled={!simulationRunning || isUpdating}
              onClick={cancelBurn}
            >
              Cancel Burn
            </Button>
            <Button 
              disabled={simulationRunning || isUpdating || burnProgress === 100 || !!simulationError}
              onClick={startBurnProcess}
            >
              {burnProgress === 0 ? "Start Burn" : "Retry Burn"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
