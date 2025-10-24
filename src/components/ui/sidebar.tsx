// Sidebar.tsx (React Native / Expo)
// Converted from your Vite/React implementation to a mobile-first React Native version.
// No DOM APIs, no cookies, no Radix/Slot, no class-variance-authority.
// Uses React Native primitives and lucide-react-native for the icon.
// Drop this file into `src/components/Sidebar.tsx` in an Expo app.

import * as React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native'
import { PanelLeft } from 'lucide-react-native'

// ----------------------------------------------
// Config (RN doesn’t have CSS vars — we keep simple constants)
// ----------------------------------------------
const SIDEBAR_WIDTH = 256 // 16rem
const SIDEBAR_WIDTH_MOBILE = 288 // 18rem
const SIDEBAR_WIDTH_ICON = 48 // 3rem (not used but kept for parity)

// ----------------------------------------------
// Utilities
// ----------------------------------------------
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(
    Dimensions.get('window').width < 768
  )
  React.useEffect(() => {
    const handler = ({ window }) => setIsMobile(window.width < 768)
    const sub = Dimensions.addEventListener('change', handler)
    return () => sub?.remove?.()
  }, [])
  return isMobile
}

// ----------------------------------------------
// Context
// ----------------------------------------------
export type SidebarContextProps = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean | ((v: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)
export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

// ----------------------------------------------
// Provider
// ----------------------------------------------
export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  style,
  children,
}: React.PropsWithChildren<{
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  style?: any
}>) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value: boolean | ((v: boolean) => boolean)) => {
      const next = typeof value === 'function' ? (value as any)(open) : value
      if (onOpenChange) onOpenChange(next)
      else _setOpen(next)
    },
    [onOpenChange, open]
  )

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((o) => !o)
    else setOpen((o) => !o)
  }, [isMobile, setOpen])

  const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed'

  const ctx = React.useMemo(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, isMobile, openMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={ctx}>
      <View style={[styles.wrapper, style]}>{children}</View>
    </SidebarContext.Provider>
  )
}

// ----------------------------------------------
// Sidebar core
// ----------------------------------------------
export function Sidebar({
  side = 'left',
  variant = 'sidebar', // kept for API parity (no special styles for floating/inset here)
  collapsible = 'offcanvas',
  style,
  children,
}: React.PropsWithChildren<{
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
  style?: any
}>) {
  const { isMobile, state, open, openMobile } = useSidebar()
  const width = isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH

  // Slide animation (works for both desktop and mobile)
  const translateX = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    const isOpen = isMobile ? openMobile : open
    const hiddenOffset = side === 'left' ? -width : width
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : hiddenOffset,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start()
  }, [isMobile, openMobile, open, side, width, translateX])

  if (collapsible === 'none') {
    return (
      <View style={[styles.sidebarContainer, { width }, style]}>
        <View style={styles.sidebarInner}>{children}</View>
      </View>
    )
  }

  // Off-canvas sliding panel
  return (
    <Animated.View
      style=[
        styles.sidebarFixed,
        side === 'left' ? { left: 0 } : { right: 0 },
        { width, transform: [{ translateX }] },
        style,
      ]
    >
      <View style={styles.sidebarInner}>{children}</View>
    </Animated.View>
  )
}

// The clickable thin rail to toggle (desktop concept — here it just exists for parity)
export function SidebarRail({ style }: { style?: any }) {
  const { toggleSidebar } = useSidebar()
  return (
    <Pressable onPress={toggleSidebar} style={[styles.rail, style]} accessibilityLabel="Toggle Sidebar" />
  )
}

// Button to toggle
export function SidebarTrigger({ style }: { style?: any }) {
  const { toggleSidebar } = useSidebar()
  return (
    <Pressable onPress={toggleSidebar} style={[styles.iconButton, style]} accessibilityRole="button">
      <PanelLeft size={18} />
      <Text style={styles.srOnly}>Toggle Sidebar</Text>
    </Pressable>
  )
}

// Layout pieces (simple wrappers)
export const SidebarInset: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ flex: 1 }, style]}>{children}</View>
)

export const SidebarHeader: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[styles.sectionPad, style]}>{children}</View>
)

export const SidebarFooter: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[styles.sectionPad, style]}>{children}</View>
)

export const SidebarContent: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <ScrollView style={[{ flex: 1 }, style]} contentContainerStyle={{ padding: 8 }}>
    {children}
  </ScrollView>
)

export const SidebarSeparator = ({ style }: { style?: any }) => (
  <View style={[styles.separator, style]} />
)

export const SidebarGroup: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ padding: 8 }, style]}>{children}</View>
)

export const SidebarGroupLabel: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <Text style={[styles.groupLabel, style]}>{children}</Text>
)

export const SidebarGroupAction: React.FC<React.PropsWithChildren<{ onPress?: () => void; style?: any }>> = ({ children, onPress, style }) => (
  <Pressable onPress={onPress} style={[styles.groupAction, style]}>{typeof children === 'string' ? <Text>{children}</Text> : children}</Pressable>
)

export const SidebarGroupContent: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ width: '100%' }, style]}>{children}</View>
)

// Menu primitives
export const SidebarMenu: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ gap: 4 }, style]}>{children}</View>
)

export const SidebarMenuItem: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ position: 'relative' }, style]}>{children}</View>
)

export function SidebarMenuButton({
  onPress,
  isActive = false,
  size = 'default',
  style,
  leftIcon,
  rightIcon,
  children,
}: React.PropsWithChildren<{
  onPress?: () => void
  isActive?: boolean
  size?: 'sm' | 'default' | 'lg'
  style?: any
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}>) {
  const sz = size === 'sm' ? 28 : size === 'lg' ? 48 : 36
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.menuButton,
        { height: sz, backgroundColor: isActive ? 'rgba(0,0,0,0.06)' : 'transparent' },
        style,
      ]}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
    >
      {leftIcon}
      <Text numberOfLines={1} style={[styles.menuButtonText, isActive && styles.menuButtonTextActive]}>
        {typeof children === 'string' ? children : children}
      </Text>
      <View style={{ marginLeft: 'auto' }}>{rightIcon}</View>
    </Pressable>
  )
}

export const SidebarMenuAction: React.FC<React.PropsWithChildren<{ onPress?: () => void; style?: any }>> = ({ children, onPress, style }) => (
  <Pressable onPress={onPress} style={[styles.menuAction, style]}>{typeof children === 'string' ? <Text>{children}</Text> : children}</Pressable>
)

export const SidebarMenuBadge: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[styles.badge, style]}>{typeof children === 'string' ? <Text style={styles.badgeText}>{children}</Text> : children}</View>
)

export const SidebarMenuSkeleton: React.FC<{ showIcon?: boolean; style?: any }> = ({ showIcon = false, style }) => (
  <View style={[styles.skeletonRow, style]}>
    {showIcon && <View style={styles.skeletonIcon} />}
    <View style={styles.skeletonText} />
  </View>
)

export const SidebarMenuSub: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ paddingLeft: 12, borderLeftWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB', gap: 4 }, style]}>
    {children}
  </View>
)

export const SidebarMenuSubItem: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ position: 'relative' }, style]}>{children}</View>
)

export function SidebarMenuSubButton({
  onPress,
  isActive = false,
  size = 'md',
  style,
  leftIcon,
  rightIcon,
  children,
}: React.PropsWithChildren<{
  onPress?: () => void
  isActive?: boolean
  size?: 'sm' | 'md'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  style?: any
}>) {
  const sz = size === 'sm' ? 26 : 32
  return (
    <Pressable
      onPress={onPress}
      style={[styles.subButton, { height: sz, backgroundColor: isActive ? 'rgba(0,0,0,0.06)' : 'transparent' }, style]}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
    >
      {leftIcon}
      <Text numberOfLines={1} style={[styles.subButtonText, isActive && styles.menuButtonTextActive]}>
        {typeof children === 'string' ? children : children}
      </Text>
      <View style={{ marginLeft: 'auto' }}>{rightIcon}</View>
    </Pressable>
  )
}

// Inputs (basic stand-ins for your web Input/Skeleton/Separator)
export function SidebarInput({ style, ...props }: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholder="Search" style={[styles.input, style]} {...props} />
}

// ----------------------------------------------
// Styles
// ----------------------------------------------
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  sidebarFixed: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: '#0b1220', // dark-ish sidebar
  },
  sidebarContainer: {
    height: '100%',
    backgroundColor: '#0b1220',
  },
  sidebarInner: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    right: -6,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  srOnly: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  sectionPad: { padding: 8 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 6,
  },
  groupLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 6,
  },
  groupAction: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  menuButtonText: {
    color: '#e6edf3',
    fontSize: 14,
  },
  menuButtonTextActive: {
    fontWeight: '600',
  },
  menuAction: {
    position: 'absolute',
    right: 6,
    top: 6,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badge: {
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    marginLeft: 'auto',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  skeletonRow: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  skeletonIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  skeletonText: {
    height: 14,
    flex: 1,
    borderRadius: 4,
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  subButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  subButtonText: {
    color: '#e6edf3',
    fontSize: 13,
  },
  input: {
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#e6edf3',
  },
})

// ----------------------------------------------
// Example usage (optional – remove if you only need the exports)
// ----------------------------------------------
// export default function Example() {
//   return (
//     <SidebarProvider>
//       <Sidebar side="left">
//         <SidebarHeader>
//           <SidebarTrigger />
//           <SidebarInput placeholder="Search" />
//         </SidebarHeader>
//         <SidebarSeparator />
//         <SidebarContent>
//           <SidebarGroup>
//             <SidebarGroupLabel>Menu</SidebarGroupLabel>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton isActive onPress={() => {}}>Dashboard</SidebarMenuButton>
//               </SidebarMenuItem>
//               <SidebarMenuItem>
//                 <SidebarMenuButton onPress={() => {}}>Orders</SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroup>
//         </SidebarContent>
//         <SidebarFooter>
//           <Text style={{ color: '#e6edf3' }}>v1.0</Text>
//         </SidebarFooter>
//       </Sidebar>
//       <SidebarInset>
//         {/* Your main content */}
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }

export {
  // named exports kept for parity
}
