import { Metadata } from "next";

import LoginForm from "@/components/auth/login-form";
import logo from "@/images/logo.png";
import scheduleImage from "@/images/schedule.png";
import Image from "next/image";
export const metadata: Metadata = {
  title: "Authentification",
  description:
    "Formulaires d'authentification construits à l'aide des composants.",
};

export default function AuthenticationPage() {
  return (
    <div className="container h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900"></div>

        <div className="w-full h-1/2 relative mt-auto">
          <Image
            src={scheduleImage}
            fill={true}
            alt={""}
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <div className="lg:p-8 h-full">
        <Image
          src={logo}
          alt={""}
          style={{
            objectFit: "contain",
          }}
          className="w-[350px] mx-auto mb-16"
        />
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground">
              Entrez votre adresse e-mail ci-dessous pour créer votre compte
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
