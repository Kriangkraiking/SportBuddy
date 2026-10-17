import React from 'react';
import { SvgXml } from 'react-native-svg';
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Bike,
  CalendarDays,
  Camera,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CirclePlus,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  Footprints,
  Heart,
  Hourglass,
  House,
  Accessibility,
  Layers,
  LayoutGrid,
  LocateFixed,
  LockKeyhole,
  LogOut,
  Mail,
  MailOpen,
  Map,
  MapPin,
  MessagesSquare,
  Minus,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Star,
  Table2,
  Trash2,
  UserMinus,
  UserPlus,
  UserRound,
  UsersRound,
  Volleyball,
  Waves,
  X,
} from 'lucide-react-native';
import { Ionicons as FallbackIonicons } from '@expo/vector-icons';
import sportSvgs from '../constants/sportSvgs';

// ➕ เพิ่ม: ตัวห่อไอคอนที่ใช้ API เดียวกับ Ionicons (name/size/color/style) แต่วาดด้วยชุด Lucide ตามที่ Figma ใช้
// เพื่อไม่ต้องแก้ call site ทีละจุด — แต่ละไฟล์เปลี่ยนแค่ import เป็น `import Ionicons from '.../components/AppIcon'`
// ชื่อที่ไม่อยู่ใน map จะ fallback เป็น Ionicons จริง (ไม่ error) · ชื่อขึ้นต้น "sport-" = ไอคอนกีฬา (ดู constants/options.js)
// `fill: true` = วาดแบบทึบ (หัวใจ/ดาว/บ้านที่ active) · stroke ปกติ 1.75 ใกล้เคียงเส้นบางมนใน Figma
const LUCIDE = {
  'arrow-back': { Icon: ArrowLeft },
  'arrow-forward': { Icon: ArrowRight },
  calendar: { Icon: CalendarDays },
  'calendar-outline': { Icon: CalendarDays },
  'location-outline': { Icon: MapPin },
  close: { Icon: X },
  search: { Icon: Search },
  'search-outline': { Icon: Search },
  'sparkles-outline': { Icon: Sparkles },
  people: { Icon: UsersRound },
  'people-outline': { Icon: UsersRound },
  notifications: { Icon: Bell },
  'notifications-outline': { Icon: Bell },
  'person-add': { Icon: UserPlus },
  'person-add-outline': { Icon: UserPlus },
  'person-remove-outline': { Icon: UserMinus },
  person: { Icon: UserRound },
  'person-outline': { Icon: UserRound },
  'chevron-forward': { Icon: ChevronRight },
  'chevron-down': { Icon: ChevronDown },
  'checkmark-circle-outline': { Icon: BadgeCheck },
  'checkmark-circle': { Icon: CircleCheck },
  checkmark: { Icon: Check },
  'checkmark-done-outline': { Icon: CheckCheck },
  'time-outline': { Icon: Clock3 },
  heart: { Icon: Heart, fill: true },
  'create-outline': { Icon: Pencil },
  'chatbubbles-outline': { Icon: MessagesSquare },
  add: { Icon: Plus },
  remove: { Icon: Minus },
  'add-circle-outline': { Icon: CirclePlus },
  'mail-outline': { Icon: Mail },
  'mail-open-outline': { Icon: MailOpen },
  'lock-closed-outline': { Icon: LockKeyhole },
  'copy-outline': { Icon: Copy },
  'trash-outline': { Icon: Trash2 },
  'stats-chart-outline': { Icon: ChartNoAxesColumnIncreasing },
  shuffle: { Icon: Shuffle },
  'shuffle-outline': { Icon: Shuffle },
  'shield-checkmark-outline': { Icon: ShieldCheck },
  send: { Icon: Send },
  'paper-plane-outline': { Icon: Send },
  'map-outline': { Icon: Map },
  'log-out-outline': { Icon: LogOut },
  locate: { Icon: LocateFixed },
  camera: { Icon: Camera },
  'albums-outline': { Icon: Layers },
  star: { Icon: Star, fill: true },
  'star-outline': { Icon: Star },
  alarm: { Icon: AlarmClock },
  'grid-outline': { Icon: LayoutGrid },
  'options-outline': { Icon: SlidersHorizontal },
  'hourglass-outline': { Icon: Hourglass },
  home: { Icon: House, fill: true },
  'home-outline': { Icon: House },
  'eye-outline': { Icon: Eye },
  'eye-off-outline': { Icon: EyeOff },
  settings: { Icon: Settings },
  // ไอคอนกีฬาที่ Lucide มี
  'sport-running': { Icon: Footprints },
  'footsteps-outline': { Icon: Footprints },
  'sport-swimming': { Icon: Waves },
  'sport-volleyball': { Icon: Volleyball },
  'sport-tabletennis': { Icon: Table2 },
  'sport-yoga': { Icon: Accessibility },
  'sport-cycling': { Icon: Bike },
};

// ไอคอนกีฬาที่ Lucide ไม่มี → ใช้ SVG ที่ export จาก Figma (ดู constants/sportSvgs.js)
const SPORT_SVG = {
  'sport-football': 'football',
  'football-outline': 'football',
  football: 'football',
  'sport-basketball': 'basketball',
  'basketball-outline': 'basketball',
  basketball: 'basketball',
  'sport-badminton': 'badminton',
  'sport-tennis': 'badminton',
  'tennisball-outline': 'badminton',
};

export default function AppIcon({ name, size = 24, color = '#000', style, strokeWidth = 1.75 }) {
  const svgKey = SPORT_SVG[name];
  if (svgKey) {
    return <SvgXml xml={sportSvgs[svgKey]} width={size} height={size} color={color} style={style} />;
  }
  const entry = LUCIDE[name];
  if (entry) {
    const { Icon, fill } = entry;
    return (
      <Icon
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        fill={fill ? color : 'none'}
        style={style}
      />
    );
  }
  return <FallbackIonicons name={name} size={size} color={color} style={style} />;
}
