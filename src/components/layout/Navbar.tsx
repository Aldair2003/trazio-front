import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Search, 
  User, 
  LogOut, 
  BookOpen, 
  Menu,
  Bell,
  Settings,
  GraduationCap,
  FileText,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { UserRole } from '@/types'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    authService.logout()
    logout()
    navigate('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = (path: string) => location.pathname === path

  // Navegación basada en el rol del usuario
  const getNavLinks = () => {
    const commonLinks = [
      { path: '/feed', icon: Home, label: 'Feed' },
    ]
    
    if (user?.role === UserRole.STUDENT) {
      return [
        ...commonLinks,
        { path: '/mis-materias', icon: BookOpen, label: 'Mis Materias' },
        { path: '/recursos', icon: FileText, label: 'Recursos' },
      ]
    } else if (user?.role === UserRole.TEACHER) {
      return [
        ...commonLinks,
        { path: '/mis-clases', icon: GraduationCap, label: 'Mis Clases' },
      ]
    }
    
    return commonLinks
  }

  const navLinks = getNavLinks()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TRAZIO
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar publicaciones, hashtags..."
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.currentTarget.value
                    if (query.trim()) {
                      navigate(`/feed?search=${encodeURIComponent(query)}`)
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <TooltipProvider>
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.path)
                
                return (
                  <Tooltip key={link.path}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={active ? "default" : "ghost"}
                        size="icon"
                        asChild
                        className={cn(
                          "relative transition-all",
                          active && "shadow-md"
                        )}
                      >
                        <Link to={link.path}>
                          <Icon className="h-5 w-5" />
                          {active && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                          )}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{link.label}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </div>

          {/* Right Section */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Notifications - Placeholder for future */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                      <Bell className="h-5 w-5" />
                      {/* Badge de notificaciones */}
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notificaciones</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* User Menu - Desktop */}
              <div className="hidden sm:flex items-center gap-2 pl-2 ml-2 border-l">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="text-right hidden xl:block">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                          {user.role === UserRole.STUDENT ? (
                            <>
                              <GraduationCap className="h-3 w-3" />
                              <span>Estudiante</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3" />
                              <span>Docente</span>
                            </>
                          )}
                        </p>
                      </div>
                      <Avatar className="h-9 w-9 border-2 border-gray-200">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user.id}`} className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 border-2 border-gray-200">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {user.role === UserRole.STUDENT ? (
                            <>
                              <GraduationCap className="h-3 w-3" />
                              <span>Estudiante</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3" />
                              <span>Docente</span>
                            </>
                          )}
                        </p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-1">
                    {/* Search - Mobile */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Buscar..."
                        className="pl-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const query = e.currentTarget.value
                            if (query.trim()) {
                              navigate(`/feed?search=${encodeURIComponent(query)}`)
                              setMobileMenuOpen(false)
                            }
                          }
                        }}
                      />
                    </div>

                    {navLinks.map((link) => {
                      const Icon = link.icon
                      const active = isActive(link.path)
                      
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                            active 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      )
                    })}

                    <div className="pt-4 border-t mt-4">
                      <Link
                        to={`/profile/${user.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Mi Perfil</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Configuración</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
