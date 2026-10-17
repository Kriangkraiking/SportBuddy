// ✏️ แก้ไข: ฟิลด์ icon ของแต่ละกีฬาเปลี่ยนเป็นชื่อ sport-* ที่ components/AppIcon.js แปลงเป็นไอคอนตาม Figma (Lucide + SVG กีฬา)
// เดิมเป็นชื่อ Ionicons ที่ซ้ำกันหลายกีฬา (tennisball-outline ใช้กับแบดมินตัน/เทนนิส/ปิงปอง ฯลฯ) จึงแยกรูปไม่ออก
export const SPORTS = [
  { key: 'football', label: 'ฟุตบอล', icon: 'sport-football' },
  { key: 'basketball', label: 'บาสเกตบอล', icon: 'sport-basketball' },
  { key: 'badminton', label: 'แบดมินตัน', icon: 'sport-badminton' },
  { key: 'running', label: 'วิ่ง', icon: 'sport-running' },
  { key: 'swimming', label: 'ว่ายน้ำ', icon: 'sport-swimming' },
  { key: 'tennis', label: 'เทนนิส', icon: 'sport-tennis' },
  { key: 'volleyball', label: 'วอลเลย์บอล', icon: 'sport-volleyball' },
  { key: 'tabletennis', label: 'ปิงปอง', icon: 'sport-tabletennis' },
  { key: 'yoga', label: 'โยคะ', icon: 'sport-yoga' },
  { key: 'cycling', label: 'ปั่นจักรยาน', icon: 'sport-cycling' },
];

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'มือใหม่' },
  { value: 'intermediate', label: 'มือพอได้' },
  { value: 'advanced', label: 'มีฝีมือ' },
  { value: 'pro', label: 'นักกีฬา' },
];

export const skillLevelLabel = (value) => SKILL_LEVELS.find((l) => l.value === value)?.label || value;
