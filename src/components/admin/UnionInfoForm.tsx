
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UNIONS_COLLECTION } from "@/lib/constants";
import type { ChurchUnion, UnionType } from "@/types";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const UNION_TYPES: UnionType[] = ["Mothers Union", "Fathers Union", "Youth Union", "Other"];

interface UnionInfoFormProps {
  onUnionSaved: (union: ChurchUnion) => void;
  editingUnion?: ChurchUnion | null;
}

export default function UnionInfoForm({ onUnionSaved, editingUnion }: UnionInfoFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const unionInfoFormSchema = z.object({
    name: z.enum(UNION_TYPES, { required_error: t('unionInfoForm.name.label') }), // Needs specific error
    description: z.string().optional(),
    adminUids: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  });
  
  type UnionInfoFormValues = z.infer<typeof unionInfoFormSchema>;

  const form = useForm<UnionInfoFormValues>({
    resolver: zodResolver(unionInfoFormSchema),
    defaultValues: {
      name: "Mothers Union", // This will be the actual string value
      description: "",
      adminUids: [],
    },
  });

  useEffect(() => {
    if (editingUnion) {
      form.reset({
        name: editingUnion.name,
        description: editingUnion.description || "",
        adminUids: editingUnion.adminUids || [],
      });
    } else {
      form.reset({ name: "Mothers Union", description: "", adminUids: []});
    }
  }, [editingUnion, form]);

  async function onSubmit(data: UnionInfoFormValues) {
    if (!user) {
      toast({ title: t('general.error.title'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const unionData = {
        name: data.name,
        description: data.description || "",
        adminUids: data.adminUids || [],
        createdBy: user.uid,
      };

      if (editingUnion?.id) {
        const unionDocRef = doc(db, UNIONS_COLLECTION, editingUnion.id);
        await updateDoc(unionDocRef, { ...unionData, updatedAt: serverTimestamp() });
        toast({ title: t('unionInfoForm.toast.updated.title'), description: `"${data.name}" ${t('unionInfoForm.toast.updated.description')}` });
        onUnionSaved({ ...editingUnion, ...unionData, updatedAt: new Date() } as ChurchUnion);
      } else {
        const docRef = await addDoc(collection(db, UNIONS_COLLECTION), { ...unionData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast({ title: t('unionInfoForm.toast.added.title'), description: `"${data.name}" ${t('unionInfoForm.toast.added.description')}` });
        onUnionSaved({ id: docRef.id, ...unionData, createdAt: new Date(), updatedAt: new Date() } as ChurchUnion);
      }
      form.reset({ name: "Mothers Union", description: "", adminUids: []});
    } catch (error) {
      console.error("Error saving union info:", error);
      toast({ title: t('unionInfoForm.toast.failed.title'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('unionInfoForm.name.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder={t('unionInfoForm.name.selectPlaceholder')} /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem> 
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>{t('unionInfoForm.description.label')}</FormLabel> <FormControl><Textarea placeholder={t('unionInfoForm.description.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField
          control={form.control}
          name="adminUids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('unionInfoForm.adminUids.label')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('unionInfoForm.adminUids.placeholder')}
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </FormControl>
              <FormDescription>{t('unionInfoForm.adminUids.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingUnion ? t('unionInfoForm.button.save') : t('unionInfoForm.button.add')}
        </Button>
      </form>
    </Form>
  );
}
