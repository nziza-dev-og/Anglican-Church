
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CHOIRS_COLLECTION } from "@/lib/constants";
import type { Choir } from "@/types";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const choirInfoFormSchema = z.object({
  name: z.string().min(3, { message: "Choir name must be at least 3 characters." }),
  chamber: z.string().min(2, { message: "Chamber name is required (e.g., Main, Youth)."}),
  description: z.string().optional(),
  adminUids: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []), // Transforms comma-separated string to array
});

type ChoirInfoFormValues = z.infer<typeof choirInfoFormSchema>;

interface ChoirInfoFormProps {
  onChoirSaved: (choir: Choir) => void;
  editingChoir?: Choir | null;
}

export default function ChoirInfoForm({ onChoirSaved, editingChoir }: ChoirInfoFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ChoirInfoFormValues>({
    resolver: zodResolver(choirInfoFormSchema),
    defaultValues: {
      name: "",
      chamber: "",
      description: "",
      adminUids: [],
    },
  });

  useEffect(() => {
    if (editingChoir) {
      form.reset({
        name: editingChoir.name,
        chamber: editingChoir.chamber,
        description: editingChoir.description || "",
        adminUids: editingChoir.adminUids || [],
      });
    } else {
      form.reset({ name: "", chamber: "", description: "", adminUids: []});
    }
  }, [editingChoir, form]);

  async function onSubmit(data: ChoirInfoFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const choirData = {
        name: data.name,
        chamber: data.chamber,
        description: data.description || "",
        adminUids: data.adminUids || [],
        createdBy: user.uid,
      };

      if (editingChoir?.id) {
        const choirDocRef = doc(db, CHOIRS_COLLECTION, editingChoir.id);
        await updateDoc(choirDocRef, { ...choirData, updatedAt: serverTimestamp() });
        toast({ title: "Choir Info Updated", description: `"${data.name}" has been successfully updated.` });
        onChoirSaved({ ...editingChoir, ...choirData, updatedAt: new Date() } as Choir);
      } else {
        const docRef = await addDoc(collection(db, CHOIRS_COLLECTION), { ...choirData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast({ title: "Choir Info Added", description: `"${data.name}" has been successfully added.` });
        onChoirSaved({ id: docRef.id, ...choirData, createdAt: new Date(), updatedAt: new Date() } as Choir);
      }
      form.reset({ name: "", chamber: "", description: "", adminUids: []});
    } catch (error) {
      console.error("Error saving choir info:", error);
      toast({ title: "Failed to Save Choir Info", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Choir Name</FormLabel> <FormControl><Input placeholder="Glorious Singers" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="chamber" render={({ field }) => ( <FormItem> <FormLabel>Chamber</FormLabel> <FormControl><Input placeholder="Main Church / Youth / Sunday School" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea placeholder="About the choir..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField
          control={form.control}
          name="adminUids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choir Admin User IDs (Optional)</FormLabel>
              <FormControl>
                {/* Casting field.value which is string[] to string for Input, then back to string[] in schema transform */}
                <Input 
                  placeholder="uid1, uid2, uid3" 
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </FormControl>
              <FormDescription>Comma-separated list of User IDs for choir administrators.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingChoir ? "Save Changes" : "Add Choir"}
        </Button>
      </form>
    </Form>
  );
}
