import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Shield, Palette, Camera, Loader2, Check, Eye, EyeOff, Save } from 'lucide-react'
import { profileService } from '@/services/profileService'
import { uploadService } from '@/services/uploadService'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/use-toast'

type SettingsSection = 'profile' | 'security' | 'appearance'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection | null>(null)
  const { user, setUser } = useAuthStore()
  const { toast } = useToast()

  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    profileImage: '',
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Load profile data when profile section is opened
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true)
      try {
        const profile = await profileService.getMyProfile()
        setProfileData({
          name: profile.name || '',
          bio: profile.profile?.bio || '',
          profileImage: profile.profileImage || '',
        })
      } catch {
        toast({ title: 'Error al cargar el perfil', variant: 'destructive' })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (activeSection === 'profile') {
      loadProfile()
    }
  }, [activeSection, toast])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Por favor selecciona una imagen válida', variant: 'destructive' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'La imagen no debe superar los 5MB', variant: 'destructive' })
      return
    }

    setIsUploadingImage(true)
    try {
      const uploadResult = await uploadService.uploadImage(file)
      await profileService.updateProfileImage(uploadResult.url)
      
      setProfileData(prev => ({ ...prev, profileImage: uploadResult.url }))
      
      // Actualizar el store de auth con la nueva imagen
      if (user) {
        setUser({ ...user, profileImage: uploadResult.url })
      }
      
      toast({ title: 'Foto de perfil actualizada' })
    } catch (error) {
      toast({ title: 'Error al subir la imagen', variant: 'destructive' })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast({ title: 'El nombre es obligatorio', variant: 'destructive' })
      return
    }

    setIsSavingProfile(true)
    try {
      // Actualizar nombre en el usuario base y bio en el perfil
      if (user?.role === 'student') {
        await profileService.updateStudentProfile({ bio: profileData.bio })
      } else if (user?.role === 'teacher') {
        await profileService.updateTeacherProfile({ bio: profileData.bio })
      }
      
      // Actualizar el store
      if (user) {
        setUser({ ...user, name: profileData.name })
      }
      
      toast({ title: 'Perfil actualizado correctamente' })
    } catch (error) {
      toast({ title: 'Error al actualizar el perfil', variant: 'destructive' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: 'Todos los campos son obligatorios', variant: 'destructive' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({ title: 'La nueva contraseña debe tener al menos 6 caracteres', variant: 'destructive' })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast({ title: 'Contraseña cambiada correctamente' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setActiveSection(null)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast({ title: err.response?.data?.message || 'Error al cambiar la contraseña', variant: 'destructive' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Administra las preferencias de tu cuenta
          </p>
        </div>

        <div className="grid gap-6">
          {/* PERFIL */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
              onClick={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
            >
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal y foto de perfil
              </CardDescription>
            </CardHeader>
            {activeSection === 'profile' && (
              <CardContent className="space-y-6">
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Foto de perfil */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                          <AvatarFallback className="text-lg">
                            {getInitials(profileData.name || user?.name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {isUploadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          aria-label="Subir imagen de perfil"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Haz clic en el icono para cambiar tu foto
                      </p>
                    </div>

                    {/* Nombre */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    {/* Biografía */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Cuéntanos un poco sobre ti..."
                        rows={4}
                      />
                    </div>

                    {/* Botón guardar */}
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSavingProfile}
                      className="w-full"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            )}
          </Card>

          {/* PRIVACIDAD Y SEGURIDAD */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
              onClick={() => setActiveSection(activeSection === 'security' ? null : 'security')}
            >
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidad y Seguridad
              </CardTitle>
              <CardDescription>
                Cambia tu contraseña y configura opciones de privacidad
              </CardDescription>
            </CardHeader>
            {activeSection === 'security' && (
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Cambiar contraseña</h3>
                  
                  {/* Contraseña actual */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Tu nueva contraseña (mínimo 6 caracteres)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Repite tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botón cambiar contraseña */}
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isChangingPassword}
                    className="w-full"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Cambiar contraseña
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* APARIENCIA */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
              onClick={() => setActiveSection(activeSection === 'appearance' ? null : 'appearance')}
            >
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de TRAZIO
              </CardDescription>
            </CardHeader>
            {activeSection === 'appearance' && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Próximamente: Tema oscuro y preferencias visuales
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
