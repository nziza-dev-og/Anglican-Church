
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MapPinIcon, Phone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const ContactPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactFormSchema = z.object({
    name: z.string().min(2, { message: t('contact.form.name.error') }),
    email: z.string().email({ message: t('contact.form.email.error') }),
    subject: z.string().min(5, { message: t('contact.form.subject.error') }),
    message: z.string().min(10, { message: t('contact.form.message.error') }),
  });

  type ContactFormInputs = z.infer<typeof contactFormSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Contact form data:", data);
    toast({
      title: t('contact.form.toast.success.title'),
      description: t('contact.form.toast.success.description'),
    });
    reset();
    setIsSubmitting(false);
  };

  return (
    <AppLayout>
      <PageTitle
        title={t('contact.title')}
        subtitle={t('contact.subtitle')}
      />

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <Card className="card-animated">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('contact.form.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">{t('contact.form.name.label')}</Label>
                <Input
                  id="name"
                  placeholder={t('contact.form.name.placeholder')}
                  {...register("name")}
                  className="mt-1"
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">{t('contact.form.email.label')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('contact.form.email.placeholder')}
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="subject">{t('contact.form.subject.label')}</Label>
                <Input
                  id="subject"
                  placeholder={t('contact.form.subject.placeholder')}
                  {...register("subject")}
                  className="mt-1"
                />
                {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <Label htmlFor="message">{t('contact.form.message.label')}</Label>
                <Textarea
                  id="message"
                  placeholder={t('contact.form.message.placeholder')}
                  rows={5}
                  {...register("message")}
                  className="mt-1"
                />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
              </div>

              <Button type="submit" className="w-full btn-animated" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('contact.form.button.send')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="card-animated">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{t('contact.info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('contact.info.address.title')}</h3>
                  <p className="text-muted-foreground">{t('contact.info.address.value')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('contact.info.phone.title')}</h3>
                  <p className="text-muted-foreground">{t('contact.info.phone.value')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('contact.info.email.title')}</h3>
                  <p className="text-muted-foreground">{t('contact.info.email.value')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-animated">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{t('contact.findUs.title')}</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt={t('contact.findUs.title')}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="map location"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
export default ContactPage;
