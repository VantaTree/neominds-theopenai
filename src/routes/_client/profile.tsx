import React, { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, User, Mail, Phone, Loader2 } from "lucide-react";
import { auth, uploadFileToStorage } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { getUserFn, saveUserFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_client/profile")({
  component: RouteComponent,
});

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

function RouteComponent() {
  // Initial profile data loaded (or loaded from localStorage if exists)
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_profile");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    return {
      name: "",
      email: "",
      phone: "",
      avatar: ""
    };
  });

  const [dbUserDoc, setDbUserDoc] = useState<any>(null);

  // Editable form state
  const [formData, setFormData] = useState<ProfileData>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Sync auth details and database fields
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const dbUser = await getUserFn({ data: user.uid });
          if (dbUser) {
            setDbUserDoc(dbUser);
            const uData = {
              name: dbUser.fullName || user.displayName || user.email?.split("@")[0] || "User",
              email: dbUser.email || user.email || "",
              phone: dbUser.phone || "",
              avatar: dbUser.image || user.photoURL || "",
            };
            setProfile(uData);
            if (typeof window !== "undefined") {
              localStorage.setItem("user_profile", JSON.stringify(uData));
            }
          } else {
            const uData = {
              name: user.displayName || user.email?.split("@")[0] || "User",
              email: user.email || "",
              phone: "",
              avatar: user.photoURL || "",
            };
            setProfile(uData);
          }
        } catch (err) {
          console.error("Error loading user profile from database:", err);
          // Fallback
          const uData = {
            name: user.displayName || user.email?.split("@")[0] || "User",
            email: user.email || "",
            phone: "",
            avatar: user.photoURL || "",
          };
          setProfile(uData);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Keep form data in sync if profile changes
  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  // Check if form has unsaved modifications
  const hasChanges =
    formData.name.trim() !== profile.name ||
    formData.phone.trim() !== profile.phone ||
    formData.avatar !== profile.avatar;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const currentUser = auth.currentUser;
    if (file && currentUser) {
      setIsUploadingAvatar(true);
      try {
        const url = await uploadFileToStorage(
          file,
          "users",
          currentUser.uid,
          "profileImg",
          formData.avatar || undefined
        );
        setFormData((prev) => ({ ...prev, avatar: url }));
      } catch (err: any) {
        console.error("Failed to upload avatar:", err);
        alert(err.message || "Failed to upload avatar");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: formData.name.trim(),
          photoURL: formData.avatar,
        });

        const updatedUser = {
          ...dbUserDoc,
          id: user.uid,
          email: user.email || dbUserDoc?.email || "",
          fullName: formData.name.trim(),
          phone: formData.phone.trim(),
          image: formData.avatar || "",
          role: dbUserDoc?.role || "client",
          status: dbUserDoc?.status || "Active",
          businessCount: dbUserDoc?.businessCount ?? 0,
          createdAt: dbUserDoc?.createdAt ? new Date(dbUserDoc.createdAt) : new Date(),
          updatedAt: new Date(),
        };

        await saveUserFn({ data: updatedUser });
        setDbUserDoc(updatedUser);
      }
      setProfile({ ...formData });
      if (typeof window !== "undefined") {
        localStorage.setItem("user_profile", JSON.stringify(formData));
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...profile });
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex-1 w-full px-4.5 py-6 min-[769px]:px-8 min-[769px]:py-10 select-none font-sans text-mm-dark relative pb-24">

      <div className="max-w-xl mx-auto w-full space-y-8 mt-4">
        
        {/* Avatar */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="h-28 w-28 rounded-full border border-mm-border overflow-hidden bg-white flex items-center justify-center transition-all group-hover:opacity-90 shadow-sm relative">
              {isUploadingAvatar ? (
                <div className="absolute inset-0 bg-mm-dark/20 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-mm-orange animate-spin" />
                </div>
              ) : formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="h-full w-full object-cover aspect-square" />
              ) : (
                <div className="h-full w-full bg-mm-orange/10 text-mm-orange text-3xl font-black flex items-center justify-center">
                  {getInitials(formData.name || "JD")}
                </div>
              )}
              
              {/* Hover Camera Icon overlay */}
              <div className="absolute inset-0 bg-mm-dark/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {/* Hidden Input field */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {/* Small camera badge */}
            <button className="absolute bottom-1 right-1 p-2 rounded-full bg-white border border-mm-border text-mm-dark shadow-sm hover:bg-mm-subtle transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1 w-full">
            <h3 className="text-lg font-black text-mm-dark">{profile.name}</h3>
            <p className="text-xs text-mm-gray">{profile.email}</p>
          </div>
        </div>

        {/* Profile Edit Fields Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-5">
            {/* Input field 1: Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Input field 2: Account Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray/50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                  placeholder="Account email"
                  required
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border outline-none text-xs font-bold text-mm-gray bg-mm-subtle/30 cursor-not-allowed transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Input field 3: Contact Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Conditional Save changes bar: Only visible when unsaved data is detected */}
          <div
            className={`sticky bottom-0 border-t border-mm-border/80 pt-4 md:pb-4 mt-6 z-20 flex items-center justify-end gap-3.5 transition-all duration-300 ${
              hasChanges ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 rounded-2xl border border-mm-border text-xs font-bold text-mm-gray hover:bg-mm-subtle hover:text-mm-dark transition-colors cursor-pointer bg-white"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingAvatar}
              className="px-6 py-3 rounded-2xl bg-mm-dark hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Floating Success Toast notification */}
      {showSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-mm-dark text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 select-none">
          <span className="text-xs font-bold">Profile changes saved successfully!</span>
        </div>
      )}
    </div>
  );
}

