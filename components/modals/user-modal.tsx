"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/useModalStore";
import { RegisterSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormError } from "../auth/form-error";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const UserModal = () => {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const { isOpen, onClose, type, data } = useModal();
  const { user } = data;
  const router = useRouter();
  const isModalOpen =
    isOpen && (type === "createUser" || type === "updateUser");

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
  });

  useEffect(() => {
    if (user) {
      form.setValue("name", user.name);
      form.setValue("email", user.email);
      form.setValue("isAdmin", user.isAdmin);
    } else {
      form.reset();
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    try {
      if (type === "createUser") await axios.post("/api/user", values);
      else await axios.patch(`/api/user/${user?.id}`, values);
      form.reset();
      router.refresh();
      onClose();
    } catch (error: any) {
      setError(error.response.data);
    }
    router.refresh();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden text-black bg-white">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-2xl font-bold text-center">
            User
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-4 pt-0"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Mohammed ..."
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
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
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Admin</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormError message={error} />
            <DialogFooter className="px-6 py-4 bg-gray-100">
              <Button disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : type === "createUser" ? (
                  "Créer"
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
