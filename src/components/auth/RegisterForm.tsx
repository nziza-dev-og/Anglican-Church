
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_SECRET_CODES, USERS_COLLECTION, USER_ROLES } from "@/lib/constants";
import type { UserProfile, UserRole } from "@/types";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = z.object({
    displayName: z.string().min(2, { message: t('auth.displayName.errorMinLength') }),
    email: z.string().email({ message: t('contact.form.email.error') }),
    password: z.string().min(6, { message: t('auth.password.errorMinLength') }),
    confirmPassword: z.string().min(6, { message: t('auth.password.errorMinLength') }),
    secretCode: z.string().optional(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('auth.confirmPassword.errorMatch'),
    path: ["confirmPassword"],
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      secretCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    let assignedRole: UserRole = USER_ROLES.REGULAR_MEMBER;
    if (values.secretCode && DEFAULT_SECRET_CODES[values.secretCode]) {
      assignedRole = DEFAULT_SECRET_CODES[values.secretCode].role;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.displayName });
      
      const userDocRef = doc(db, USERS_COLLECTION, user.uid);
      const userProfileData: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: values.displayName,
        photoURL: `https://placehold.co/100x100.png?text=${values.displayName.charAt(0).toUpperCase()}`,
        role: assignedRole,
        interests: [],
        createdAt: serverTimestamp() as Timestamp,
      };
      await setDoc(userDocRef, userProfileData);

      toast({ title: t('auth.register.success.title'), description: t('auth.register.success.description') });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error", error);
      let errorMessage = t('general.error.unexpected');
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('auth.register.error.emailInUse');
      }
      toast({
        title: t('general.failure'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.displayName.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.displayName.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.email.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.email.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.password.label')}</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.password.placeholder')}
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.confirmPassword.label')}</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth.password.placeholder')}
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secretCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.secretCode.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.secretCode.placeholder')} {...field} />
              </FormControl>
              <FormDescription>
                {t('auth.secretCode.description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full btn-animated" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('auth.register')}
        </Button>
      </form>
    </Form>
  );
}
