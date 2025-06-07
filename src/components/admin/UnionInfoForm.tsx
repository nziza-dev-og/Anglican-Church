
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

const UNION_TYPES: UnionType[] = ["Mothers Union", "Fathers Union", "Youth Union", "Other"];

const unionInfoFormSchema = z.object({
  name: z.enum(UNION_TYPES, { required_error: "Union type is required." }),
  description: z.string().optional(),
  adminUids: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
});

type UnionInfoFormValues = z.infer<typeof unionInfoFormSchema>;

interface UnionInfoFormProps {
  onUnionSaved: (union: ChurchUnion) => void;
  editingUnion?: ChurchUnion | null;
}

export default function UnionInfoForm({ onUnionSaved, editingUnion }: UnionInfoFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<UnionInfoFormValues>({
    resolver: zodResolver(unionInfoFormSchema),
    defaultValues: {
      name: "Mothers Union",
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
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
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
        toast({ title: "Union Info Updated", description: `"${data.name}" has been successfully updated.` });
        onUnionSaved({ ...editingUnion, ...unionData, updatedAt: new Date() } as ChurchUnion);
      } else {
        const docRef = await addDoc(collection(db, UNIONS_COLLECTION), { ...unionData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast({ title: "Union Info Added", description: `"${data.name}" has been successfully added.` });
        onUnionSaved({ id: docRef.id, ...unionData, createdAt: new Date(), updatedAt: new Date() } as ChurchUnion);
      }
      form.reset({ name: "Mothers Union", description: "", adminUids: []});
    } catch (error) {
      console.error("Error saving union info:", error);
      toast({ title: "Failed to Save Union Info", variant: "destructive" });
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
              <FormLabel>Union Name/Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a union type" /></SelectTrigger>
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
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea placeholder="About the union..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField
          control={form.control}
          name="adminUids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Union Admin User IDs (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="uid1, uid2, uid3" 
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </FormControl>
              <FormDescription>Comma-separated list of User IDs for union administrators.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingUnion ? "Save Changes" : "Add Union"}
        </Button>
      </form>
    </Form>
  );
}
