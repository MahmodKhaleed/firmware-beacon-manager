
import { Home, Upload, Clock, BarChart2, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  // Menu items with conditional admin-only items
  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      adminOnly: false
    },
    {
      title: "Upload Firmware",
      url: "/upload",
      icon: Upload,
      adminOnly: true
    },
    {
      title: "Version History",
      url: "/versions",
      icon: Clock,
      adminOnly: false
    },
    {
      title: "Burn Statistics",
      url: "/statistics",
      icon: BarChart2,
      adminOnly: false
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      adminOnly: false
    },
  ];

  // Filter items based on user role
  const filteredItems = items.filter(item => !item.adminOnly || isAdmin);
  
  // Check if current path matches exactly or is root of the item's path
  const isActive = (url: string) => {
    if (url === '/' && location.pathname === '/') return true;
    if (url !== '/' && location.pathname.startsWith(url)) return true;
    return false;
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-firmware-blue-600 text-white flex items-center justify-center text-lg font-bold">
            F
          </div>
          <span className="font-semibold text-lg">FirmwareOTA</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-active={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
