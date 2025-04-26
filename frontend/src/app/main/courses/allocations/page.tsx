import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeftRight,
  Info,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetResourceAllocations, useRespondToAllocationRequest, ResourceAllocation } from '@/action/course';
import { useCurrentUser } from '@/action/authentication';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AllocationManagementPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('incoming');
  const [respondingToId, setRespondingToId] = useState<number | null>(null);
  const [respondAction, setRespondAction] = useState<'approved' | 'rejected' | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  
  // Get allocation data from the backend
  const { 
    data: allocationsData = { 
      incoming_allocations: [], 
      outgoing_allocations: [], 
      user_department_id: 0, 
      user_department_name: '' 
    }, 
    isPending: isLoading, 
    refetch 
  } = useGetResourceAllocations();
  
  const { mutate: respondToRequest, isPending: isResponding } = useRespondToAllocationRequest(
    respondingToId || 0,
    () => {
      setRespondingToId(null);
      setRespondAction(null);
      setResponseError(null);
      refetch();
      toast.success(`Request ${respondAction === 'approved' ? 'approved' : 'rejected'} successfully`);
    }
  );
  
  // Filter allocations based on search query
  const filterAllocations = (allocs: ResourceAllocation[]) => {
    if (!searchQuery) return allocs;
    
    const query = searchQuery.toLowerCase();
    return allocs.filter(allocation => 
      allocation.course_detail.course_detail.course_id.toLowerCase().includes(query) || 
      allocation.course_detail.course_detail.course_name.toLowerCase().includes(query) ||
      allocation.original_dept_detail.dept_name.toLowerCase().includes(query) ||
      allocation.teaching_dept_detail.dept_name.toLowerCase().includes(query)
    );
  };
  
  // Get filtered allocations
  const filteredIncoming = filterAllocations(allocationsData.incoming_allocations);
  const filteredOutgoing = filterAllocations(allocationsData.outgoing_allocations);
  
  // Handle response to allocation request
  const handleRespondToRequest = (id: number, action: 'approved' | 'rejected') => {
    setRespondingToId(id);
    setRespondAction(action);
  };
  
  const confirmResponse = () => {
    setResponseError(null);
    if (respondingToId && respondAction) {
      respondToRequest({ status: respondAction }, {
        onError: (error: any) => {
          const errorMessage = error.response?.data?.detail || 
            "Failed to respond to the request. Please try again.";
          setResponseError(errorMessage);
          toast.error("Error", { description: errorMessage });
        }
      });
    }
  };
  
  const closeDialog = () => {
    setRespondingToId(null);
    setRespondAction(null);
    setResponseError(null);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="py-6 max-w-7xl mx-auto space-y-6">
    
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ArrowLeftRight className="h-6 w-6 text-primary" />
                Course Resource Allocations
              </CardTitle>
              <CardDescription className="mt-1">
                Manage incoming and outgoing teaching allocation requests for {allocationsData.user_department_name}
              </CardDescription>
            </div>
            
            <div className="relative sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search allocations..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 h-7 w-7" 
                  onClick={handleClearSearch}
                >
                  <span className="sr-only">Clear search</span>
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              About Resource Allocations
            </h3>
            <p className="text-sm text-muted-foreground">
              Resource allocations allow departments to request other departments to teach their courses. 
              When approved, the teaching department becomes responsible for course delivery while the 
              original department maintains curriculum ownership.
            </p>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="incoming" className="flex items-center gap-1.5">
                Incoming Requests
                {allocationsData.incoming_allocations.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">
                    {allocationsData.incoming_allocations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex items-center gap-1.5">
                Outgoing Requests
                {allocationsData.outgoing_allocations.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">
                    {allocationsData.outgoing_allocations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="incoming">
              <Card>
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg">
                      Incoming Teaching Requests
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-0">
                      Courses other departments want your department to teach
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Requesting Department</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ) : filteredIncoming.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                              {searchQuery ? (
                                <>No matches found. <Button variant="link" className="p-0 h-6" onClick={handleClearSearch}>Clear search</Button></>
                              ) : (
                                "No incoming teaching requests found"
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredIncoming.map((allocation) => (
                            <TableRow key={allocation.id}>
                              <TableCell>
                                <div className="font-medium">{allocation.course_detail.course_detail.course_id}</div>
                                <div className="text-sm text-muted-foreground">{allocation.course_detail.course_detail.course_name}</div>
                              </TableCell>
                              <TableCell>{allocation.original_dept_detail.dept_name}</TableCell>
                              <TableCell>
                                <div className="max-w-[250px] truncate" title={allocation.allocation_reason}>
                                  {allocation.allocation_reason || "No reason provided"}
                                </div>
                              </TableCell>
                              <TableCell>{new Date(allocation.allocation_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    allocation.status === 'approved' ? 'default' : 
                                    allocation.status === 'rejected' ? 'destructive' : 
                                    'outline'
                                  }
                                  className={
                                    allocation.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                    allocation.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  }
                                >
                                  {allocation.status === 'approved' ? 'Approved' : 
                                   allocation.status === 'rejected' ? 'Rejected' : 
                                   'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {allocation.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                                      onClick={() => handleRespondToRequest(allocation.id, 'approved')}
                                    >
                                      <CheckCircle2 className="mr-1 h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                      onClick={() => handleRespondToRequest(allocation.id, 'rejected')}
                                    >
                                      <XCircle className="mr-1 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/courses/${allocation.course_detail.id}`)}
                                  >
                                    View Course
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="outgoing">
              <Card>
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg">
                      Outgoing Teaching Requests
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-0">
                      Requests to other departments to teach your courses
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Teaching Department</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ) : filteredOutgoing.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                              {searchQuery ? (
                                <>No matches found. <Button variant="link" className="p-0 h-6" onClick={handleClearSearch}>Clear search</Button></>
                              ) : (
                                "No outgoing teaching requests found"
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOutgoing.map((allocation) => (
                            <TableRow key={allocation.id}>
                              <TableCell>
                                <div className="font-medium">{allocation.course_detail.course_detail.course_id}</div>
                                <div className="text-sm text-muted-foreground">{allocation.course_detail.course_detail.course_name}</div>
                              </TableCell>
                              <TableCell>{allocation.teaching_dept_detail.dept_name}</TableCell>
                              <TableCell>
                                <div className="max-w-[250px] truncate" title={allocation.allocation_reason}>
                                  {allocation.allocation_reason || "No reason provided"}
                                </div>
                              </TableCell>
                              <TableCell>{new Date(allocation.allocation_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    allocation.status === 'approved' ? 'default' : 
                                    allocation.status === 'rejected' ? 'destructive' : 
                                    'outline'
                                  }
                                  className={
                                    allocation.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                    allocation.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  }
                                >
                                  {allocation.status === 'approved' ? 'Approved' : 
                                   allocation.status === 'rejected' ? 'Rejected' : 
                                   'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/courses/${allocation.course_detail.id}`)}
                                >
                                  View Course
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Response confirmation dialog */}
      <AlertDialog open={!!respondingToId} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {respondAction === 'approved' ? 'Approve Teaching Request?' : 'Reject Teaching Request?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {respondAction === 'approved' 
                ? "By approving, your department will be assigned to teach this course. Your department will be responsible for teaching the course according to the curriculum set by the owner department."
                : "By rejecting, you are declining to teach this course. The requesting department will need to find another department to teach this course."}
            </AlertDialogDescription>
            
            {responseError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{responseError}</AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResponding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResponse}
              className={respondAction === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={isResponding}
            >
              {isResponding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {respondAction === 'approved' ? 'Approving...' : 'Rejecting...'}
                </>
              ) : (
                respondAction === 'approved' ? 'Approve' : 'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 