"use client";

import {
  updateUserEmail,
  updateUserName,
  updateUserPassword,
} from "@/actions/register";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/getCurrentUser";
import {
  UpdateEmailSchema,
  UpdateNameSchema,
  UpdatePasswordSchema,
} from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

type props = {
  email: string;
};

export const UpdateNameComponent = ({ email }: props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof UpdateNameSchema>>({
    resolver: zodResolver(UpdateNameSchema),
  });

  const onSubmit = async (values: z.infer<typeof UpdateNameSchema>) => {
    setLoading(true);
    try {
      const result = await updateUserName(email, values.name);
      if (result.success) toast.success(result.success);
      else if (result.error) toast.error(result.error);
      form.reset();
      router.refresh();
    } catch (error: any) {
      toast.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 mt-6 w-1/2"
      >
        <h1 className="font-bold text-2xl">Modifier le nom</h1>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="Example ..."
                  autoCapitalize="none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Mettre à jour"
          )}
        </Button>
      </form>
    </Form>
  );
};

export const UpdateEmailComponent = ({ email }: props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof UpdateEmailSchema>>({
    resolver: zodResolver(UpdateEmailSchema),
  });

  const onSubmit = async (values: z.infer<typeof UpdateEmailSchema>) => {
    setLoading(true);
    try {
      const result = await updateUserEmail(email, values.email);
      if (result.success) toast.success(result.success);
      else if (result.error) toast.error(result.error);
      form.reset();
      router.refresh();
    } catch (error: any) {
      toast.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 mt-6 w-1/2"
      >
        <h1 className="font-bold text-2xl">Modifier l&apos;email</h1>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouvel Email</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Mettre à jour"
          )}
        </Button>
      </form>
    </Form>
  );
};

export const UpdatePasswordComponent = ({ email }: props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof UpdatePasswordSchema>>({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  const onSubmit = async (values: z.infer<typeof UpdatePasswordSchema>) => {
    setLoading(true);
    try {
      const result = await updateUserPassword(email, values.password);
      if (result.success) toast.success(result.success);
      else if (result.error) toast.error(result.error);
      form.reset();
      router.refresh();
    } catch (error: any) {
      toast.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 mt-6 w-1/2"
      >
        <h1 className="font-bold text-2xl">Modifier le mot de passe</h1>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="******"
                  type="password"
                  autoCapitalize="none"
                  {...field}
                />
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
              <FormLabel>Confirmation du mot de passe</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="******"
                  type="password"
                  autoCapitalize="none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Mettre à jour"
          )}
        </Button>
      </form>
    </Form>
  );
};

const UserForm = () => {
  const userDetails = useCurrentUser();
  const userEmail = userDetails?.email || "";

  return (
    <div className="flex flex-col items-center space-y-6">
      <UpdateNameComponent email={userEmail} />
      <UpdateEmailComponent email={userEmail} />
      <UpdatePasswordComponent email={userEmail} />
    </div>
  );
};

export default UserForm;
