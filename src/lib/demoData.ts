import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentWeekInfo } from './weekUtils';

export const DEMO_25_STUDENTS = [
  { id: 'demo_std_01', studentName: 'Ali Yılmaz', parentName: 'Fatma Yılmaz', stage: 2, minutes: 60 },
  { id: 'demo_std_02', studentName: 'Ayşe Kaya', parentName: 'Mehmet Kaya', stage: 4, minutes: 120 },
  { id: 'demo_std_03', studentName: 'Can Demir', parentName: 'Selin Demir', stage: 1, minutes: 30 },
  { id: 'demo_std_04', studentName: 'Zeynep Çelik', parentName: 'Ahmet Çelik', stage: 8, minutes: 240 },
  { id: 'demo_std_05', studentName: 'Emirhan Şahin', parentName: 'Derya Şahin', stage: 11, minutes: 330 },
  { id: 'demo_std_06', studentName: 'Elif Yıldız', parentName: 'Hakan Yıldız', stage: 3, minutes: 90 },
  { id: 'demo_std_07', studentName: 'Burak Öztürk', parentName: 'Gül Öztürk', stage: 6, minutes: 180 },
  { id: 'demo_std_08', studentName: 'Ceren Aydın', parentName: 'Murat Aydın', stage: 0, minutes: 0 },
  { id: 'demo_std_09', studentName: 'Deniz Arslan', parentName: 'Banu Arslan', stage: 5, minutes: 150 },
  { id: 'demo_std_10', studentName: 'Ece Doğan', parentName: 'Kerem Doğan', stage: 7, minutes: 210 },
  { id: 'demo_std_11', studentName: 'Kerem Kılıç', parentName: 'Esra Kılıç', stage: 12, minutes: 360 },
  { id: 'demo_std_12', studentName: 'Mira Koç', parentName: 'Serkan Koç', stage: 2, minutes: 60 },
  { id: 'demo_std_13', studentName: 'Mert Aslan', parentName: 'Tülay Aslan', stage: 9, minutes: 270 },
  { id: 'demo_std_14', studentName: 'Nilüfer Kurt', parentName: 'İsmail Kurt', stage: 3, minutes: 90 },
  { id: 'demo_std_15', studentName: 'Oğuzhan Polat', parentName: 'Nuran Polat', stage: 10, minutes: 300 },
  { id: 'demo_std_16', studentName: 'Selin Aksoy', parentName: 'Bülent Aksoy', stage: 4, minutes: 120 },
  { id: 'demo_std_17', studentName: 'Umut Özkan', parentName: 'Zehra Özkan', stage: 1, minutes: 30 },
  { id: 'demo_std_18', studentName: 'Yağmur Tekin', parentName: 'Orhan Tekin', stage: 6, minutes: 180 },
  { id: 'demo_std_19', studentName: 'Yiğit Korkmaz', parentName: 'Semra Korkmaz', stage: 8, minutes: 240 },
  { id: 'demo_std_20', studentName: 'Defne Güneş', parentName: 'Cem Güneş', stage: 2, minutes: 60 },
  { id: 'demo_std_21', studentName: 'Kaan Şen', parentName: 'Aylin Şen', stage: 5, minutes: 150 },
  { id: 'demo_std_22', studentName: 'Melis Erdem', parentName: 'Volkan Erdem', stage: 3, minutes: 90 },
  { id: 'demo_std_23', studentName: 'Ömer Bulut', parentName: 'Hülya Bulut', stage: 7, minutes: 210 },
  { id: 'demo_std_24', studentName: 'Rüzgar Yaman', parentName: 'Fatih Yaman', stage: 11, minutes: 330 },
  { id: 'demo_std_25', studentName: 'Sude Yalçın', parentName: 'Sevgi Yalçın', stage: 4, minutes: 120 },
];

export async function seed25ClassroomStudents(classId: string, classCode: string, className: string): Promise<void> {
  const { weekId } = getCurrentWeekInfo();
  for (const std of DEMO_25_STUDENTS) {
    const userRef = doc(db, 'users', std.id);
    await setDoc(userRef, {
      uid: std.id,
      email: `${std.id}@demo.sinif.okul`,
      displayName: `${std.studentName} (${std.parentName})`,
      studentName: std.studentName,
      parentName: std.parentName,
      role: 'parent',
      userType: 'parent',
      classId: classId,
      classCode: classCode,
      className: className,
      currentWeekId: weekId,
      currentWeekStage: std.stage,
      currentWeekMinutes: std.minutes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function remove25ClassroomStudents(): Promise<void> {
  for (const std of DEMO_25_STUDENTS) {
    const userRef = doc(db, 'users', std.id);
    await deleteDoc(userRef);
  }
}
