/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  subscribeUserProfile,
  subscribeAllUsers,
  subscribeClassroom,
  subscribeClassroomStudents,
  updateStageProgress,
  syncUserProfile,
  DEFAULT_ADMIN_EMAIL,
} from './lib/firebase';
import { UserProfile, ClassroomInfo } from './types';
import { getCurrentWeekInfo } from './lib/weekUtils';
import { Header } from './components/Header';
import { ParentHeroBanner } from './components/ParentHeroBanner';
import { ParentHomeView } from './components/ParentHomeView';
import { TeacherHomeView } from './components/TeacherHomeView';
import { ParentStagesCompact } from './components/ParentStagesCompact';
import { ParentBadgesView } from './components/ParentBadgesView';
import { ParentClassroomView } from './components/ParentClassroomView';
import { BottomDock, ParentTabType } from './components/BottomDock';
import { AuthScreen } from './components/AuthScreen';
import { ClassroomSetupModal } from './components/ClassroomSetupModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [classroom, setClassroom] = useState<ClassroomInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [parentTab, setParentTab] = useState<ParentTabType>('home');
  const [showClassSetup, setShowClassSetup] = useState(false);

  const weekInfo = getCurrentWeekInfo();

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setUserProfile(profile);

          // Default tab is always 'home'
          setParentTab('home');

          // If user doesn't have classId and hasn't chosen role yet, prompt setup
          if (!profile.classId && !profile.className) {
            setShowClassSetup(true);
          }
        } catch (err) {
          console.error('Error syncing user profile on login:', err);
        }
      } else {
        setUserProfile(null);
        setAllUsers([]);
        setClassroom(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to current user profile updates
  useEffect(() => {
    if (!authUser) return;
    const unsubscribe = subscribeUserProfile(authUser.uid, (profile) => {
      if (profile) {
        setUserProfile(profile);
      }
    });
    return () => unsubscribe();
  }, [authUser]);

  // Listen to classroom data if user belongs to a class
  useEffect(() => {
    if (!userProfile?.classId) {
      setClassroom(null);
      return;
    }
    const unsubscribeClass = subscribeClassroom(userProfile.classId, (classData) => {
      setClassroom(classData);
    });
    return () => unsubscribeClass();
  }, [userProfile?.classId]);

  const isTeacher =
    userProfile?.role === 'admin' ||
    userProfile?.role === 'teacher' ||
    userProfile?.userType === 'teacher' ||
    authUser?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();

  // Listen to students/users list:
  // If user is a teacher with a classroom, listen to that classroom's students
  useEffect(() => {
    if (!authUser) return;

    if (isTeacher && userProfile?.classId) {
      const unsubscribeStudents = subscribeClassroomStudents(userProfile.classId, (students) => {
        setAllUsers(students);
      });
      return () => unsubscribeStudents();
    } else {
      const unsubscribeAll = subscribeAllUsers((users) => {
        setAllUsers(users);
      });
      return () => unsubscribeAll();
    }
  }, [authUser, isTeacher, userProfile?.classId]);

  // Handle stage change (0 to 14)
  const handleUpdateStage = async (newStage: number) => {
    if (!authUser || isUpdatingStage) return;
    try {
      setIsUpdatingStage(true);
      await updateStageProgress(authUser.uid, newStage);
    } catch (err) {
      console.error('Failed to update stage:', err);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  // Loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-200">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Uygulama yükleniyor...
        </p>
      </div>
    );
  }

  // If not logged in, show AuthScreen
  if (!authUser) {
    return <AuthScreen />;
  }

  const currentStage = userProfile?.currentWeekStage ?? 0;

  // Calculate class average minutes for teacher
  const studentList = allUsers.filter(
    (u) => u.role !== 'admin' && (u.userType !== 'teacher' || u.uid !== authUser.uid)
  );
  const totalClassMinutes = studentList.reduce(
    (sum, s) => sum + (s.currentWeekMinutes ?? (s.currentWeekStage || 0) * 30),
    0
  );
  const classAverageMinutes = studentList.length > 0 ? Math.round(totalClassMinutes / studentList.length) : 0;

  return (
    <div className="h-screen max-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-100 select-none">
      {/* 1. Slim Top Navigation Header */}
      <Header
        currentUser={userProfile}
        activeTab="tracker"
        setActiveTab={() => {}}
        isAdmin={isTeacher}
        memberCount={allUsers.length}
        currentWeekLabel={weekInfo.weekLabel}
        onOpenClassSetup={() => setShowClassSetup(true)}
      />

      {/* 2. Main Body: Smooth scrollable container with modern scrollbar */}
      <main className="flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-4 py-2 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto w-full custom-scrollbar flex flex-col touch-pan-y">
        {isTeacher ? (
          /* TEACHER VIEW */
          <div className="flex-1 min-h-0 flex flex-col gap-2.5 pb-8">
            {parentTab === 'home' && (
              <TeacherHomeView
                users={allUsers}
                currentUserId={authUser.uid}
                classroom={classroom}
                teacherProfile={userProfile}
                onOpenClassSetup={() => setShowClassSetup(true)}
                userEmail={authUser.email || undefined}
              />
            )}

            {parentTab === 'stages' && (
              <ParentStagesCompact
                currentStage={currentStage}
                onUpdateStage={handleUpdateStage}
                isUpdating={isUpdatingStage}
                isTeacher={true}
                classAverageMinutes={classAverageMinutes}
              />
            )}

            {parentTab === 'badges' && (
              <ParentBadgesView
                currentStage={currentStage}
                studentName={userProfile?.studentName || userProfile?.displayName}
                userId={userProfile?.uid}
                isTeacher={true}
                userEmail={authUser?.email || undefined}
                students={allUsers}
              />
            )}

            {parentTab === 'classroom' && (
              <ParentClassroomView
                userProfile={userProfile}
                classroom={classroom}
                onOpenClassSetup={() => setShowClassSetup(true)}
                isTeacher={true}
              />
            )}
          </div>
        ) : (
          /* PARENT / VELİ VIEW (Responsive scrolling with rich 3D aesthetic) */
          <div className={`flex flex-col ${parentTab === 'home' ? 'h-full justify-between gap-1 pb-0 flex-1 min-h-0' : 'gap-2.5 sm:gap-3 pb-8'}`}>
            {/* Top Hero Banner (Always fully visible with large yesil.png & progress bar) */}
            <div className="flex-shrink-0">
              <ParentHeroBanner
                currentStage={currentStage}
                studentName={userProfile?.studentName || userProfile?.displayName}
              />
            </div>

            {/* Center Dynamic Tab Content (Switched by bottom dock) */}
            <div className={`w-full ${parentTab === 'home' ? 'flex-1 min-h-0 flex flex-col justify-between' : ''}`}>
              {parentTab === 'home' && (
                <ParentHomeView
                  currentStage={currentStage}
                  onUpdateStage={handleUpdateStage}
                  isUpdating={isUpdatingStage}
                  onNavigateToStages={() => setParentTab('stages')}
                />
              )}

              {parentTab === 'stages' && (
                <ParentStagesCompact
                  currentStage={currentStage}
                  onUpdateStage={handleUpdateStage}
                  isUpdating={isUpdatingStage}
                />
              )}

              {parentTab === 'badges' && (
                <ParentBadgesView
                  currentStage={currentStage}
                  studentName={userProfile?.studentName || userProfile?.displayName}
                  userId={userProfile?.uid}
                  isTeacher={false}
                  userEmail={authUser?.email || undefined}
                />
              )}

              {parentTab === 'classroom' && (
                <ParentClassroomView
                  userProfile={userProfile}
                  classroom={classroom}
                  onOpenClassSetup={() => setShowClassSetup(true)}
                  isTeacher={false}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom 3D Dock Navigation (4 tabs only, teacher button deleted) */}
      <footer className="flex-shrink-0 z-50">
        <BottomDock
          activeTab={parentTab}
          onSelectTab={(tab) => setParentTab(tab)}
          isTeacher={isTeacher}
        />
      </footer>

      {/* Classroom Setup & Role Selection Modal */}
      {showClassSetup && userProfile && (
        <ClassroomSetupModal
          currentUser={userProfile}
          onCompleted={() => setShowClassSetup(false)}
          onCancel={() => setShowClassSetup(false)}
          canCancel={Boolean(userProfile.classId || userProfile.role)}
        />
      )}
    </div>
  );
}
