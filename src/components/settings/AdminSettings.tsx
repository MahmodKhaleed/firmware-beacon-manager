
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type UserWithRole = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
};

const AdminSettings = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [initialAdminCreated, setInitialAdminCreated] = useState(false);

  useEffect(() => {
    fetchUsers();
    createInitialAdmin();
  }, []);
  
  const createInitialAdmin = async () => {
    try {
      // Check if we already have set up the initial admin
      const { data: existingAdmin, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .limit(1);

      if (checkError) throw checkError;
      
      if (!existingAdmin || existingAdmin.length === 0) {
        // Create the admin account if it doesn't exist yet
        const { data: adminData, error: signUpError } = await supabase.auth.signUp({
          email: 'mahmoud.khalid.mo@gmail.com',
          password: '0189643733',
        });
        
        if (signUpError) throw signUpError;
        
        if (adminData.user) {
          // Set the role to admin
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: adminData.user.id,
              role: 'admin'
            });
            
          if (insertError) throw insertError;
          
          toast.success("Initial admin account created");
          setInitialAdminCreated(true);
        }
      } else {
        setInitialAdminCreated(true);
      }
    } catch (error) {
      console.error("Error setting up initial admin:", error);
      toast.error("Failed to set up initial admin account");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all users (this would need admin access in Supabase)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Get all role assignments
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Map roles to users
      const userRolesMap = roles?.reduce((acc, curr) => {
        acc[curr.user_id] = curr.role;
        return acc;
      }, {} as Record<string, 'admin' | 'user'>);
      
      // Format the data
      const formattedUsers = authUsers.users.map(authUser => ({
        id: authUser.id,
        email: authUser.email || 'No email',
        role: userRolesMap[authUser.id] || 'user',
        created_at: authUser.created_at,
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      
      // Fallback to showing current user
      if (user) {
        // Check if the current user has a role
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        setUsers([{
          id: user.id,
          email: user.email || 'No email',
          role: (userRole?.role as 'admin' | 'user') || 'user',
          created_at: user.created_at || new Date().toISOString(),
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role");
      return;
    }
    
    setProcessingUser(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      // Check if user already has a role entry
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
          
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
          
        if (error) throw error;
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setProcessingUser(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    
    setProcessingUser(userId);
    
    try {
      // Delete user (this would require admin access in Supabase)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(u => u.id !== userId));
      
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setProcessingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and access</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {!initialAdminCreated && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <p className="text-amber-800">
                    Setting up initial admin account with email: mahmoud.khalid.mo@gmail.com
                  </p>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={processingUser === user.id}
                            onClick={() => toggleUserRole(user.id, user.role)}
                          >
                            {processingUser === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={processingUser === user.id}
                            onClick={() => deleteUser(user.id)}
                          >
                            {processingUser === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>* Admin users can upload firmware and manage other users</p>
                <p>* Regular users can only view firmware and statistics</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
