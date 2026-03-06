"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { AdminDialog } from "@/components/dashboard/admin-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/app/actions/admin";
import bcrypt from "bcryptjs"; // For password hashing
import AuthWrapper from '@/components/auth/auth-wrapper';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminManagement } from '@/components/dashboard/admin-management';

export default function AdminsPage() {
  return <AdminManagement />;
}
