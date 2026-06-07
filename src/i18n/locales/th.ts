/**
 * Thai copy. ภาษาพูดธรรมดา ไม่ทางการ/การแพทย์ โทนเบา ไม่กดดัน ไม่ขอให้ "เล่า/บอก"
 * (handover §6.2). error code จาก API แปลงเป็นข้อความสุภาพที่นี่ ไม่โชว์ code ดิบ
 */
import type en from './en';

const th: typeof en = {
  common: {
    appName: 'DailyMood',
    continue: 'ต่อไป',
    back: 'ย้อนกลับ',
    cancel: 'ยกเลิก',
    save: 'บันทึก',
    retry: 'ลองอีกครั้ง',
    loading: 'สักครู่นะ…',
  },
  auth: {
    welcome: 'ยินดีต้อนรับสู่ DailyMood',
    tagline: 'พื้นที่เบาๆ สำหรับความรู้สึกของคุณ',
    emailLabel: 'อีเมล',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'รหัสผ่าน',
    passwordPlaceholder: 'รหัสผ่านของคุณ',
    nameLabel: 'ชื่อ',
    namePlaceholder: 'อยากให้เราเรียกว่าอะไรดี',
    continueWithEmail: 'ต่อไป',
    signIn: 'เข้าสู่ระบบ',
    register: 'สร้างบัญชี',
    createAccount: 'สร้างบัญชีของคุณ',
    forgotPassword: 'ลืมรหัสผ่าน?',
    or: 'หรือ',
    continueWithGoogle: 'ดำเนินการต่อด้วย Google',
    continueWithApple: 'ดำเนินการต่อด้วย Apple',
    socialNeedsDevBuild: 'การเข้าสู่ระบบด้วย Google และ Apple จะมาในเวอร์ชันถัดไป',
    googleOnlyTitle: 'คุณสมัครด้วย Google ไว้',
    googleOnlyBody: 'กดปุ่ม Google เพื่อเข้าสู่ระบบได้เลย',
    verifyTitle: 'เช็กอีเมลของคุณ',
    verifyBody: 'เราส่งลิงก์ไปที่ {{email}} แล้ว เปิดเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบได้เลย',
    resend: 'ส่งอีเมลอีกครั้ง',
    resent: 'ส่งแล้ว — ลองเช็กกล่องอีเมลดูนะ',
    forgotTitle: 'ตั้งรหัสผ่านใหม่',
    forgotBody: 'กรอกอีเมลของคุณ แล้วเราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้',
    forgotSent: 'ถ้ามีอีเมลนี้อยู่ ลิงก์ตั้งรหัสผ่านใหม่กำลังไปหาคุณ',
    sendResetLink: 'ส่งลิงก์ตั้งรหัสใหม่',
    registerSentTitle: 'อีกนิดเดียว',
    registerSentBody: 'เราส่งลิงก์ยืนยันไปที่ {{email}} แล้ว',
    signOut: 'ออกจากระบบ',
  },
  errors: {
    invalid_credentials: 'อีเมลหรือรหัสผ่านดูไม่ตรงนะ',
    email_not_verified: 'ช่วยยืนยันอีเมลก่อนนะ — ลองเช็กกล่องอีเมลดู',
    invalid_token: 'เซสชันสิ้นสุดแล้ว เข้าสู่ระบบอีกครั้งนะ',
    token_expired: 'เซสชันหมดอายุแล้ว เข้าสู่ระบบอีกครั้งนะ',
    rate_limited: 'ลองหลายครั้งไปหน่อย พักสักครู่แล้วลองใหม่นะ',
    auth_required: 'เข้าสู่ระบบก่อนเพื่อไปต่อนะ',
    limit_reached: 'ถึงขีดจำกัดของแพ็กเกจคุณแล้ว',
    network_error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองเช็กอินเทอร์เน็ตดูนะ',
    unknown: 'มีอะไรผิดพลาดนิดหน่อย ลองอีกครั้งนะ',
  },
  tabs: {
    today: 'วันนี้',
    calendar: 'ปฏิทิน',
    stats: 'สถิติ',
    profile: 'คุณ',
  },
};

export default th;
