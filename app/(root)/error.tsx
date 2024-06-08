"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";

const Error = () => {
  return (
    <div className="flex justify-center items-center w-full mt-10">
      <Card className="w-[400px] shadow-md">
        <CardHeader>
          <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            <h1 className="text-3xl font-semibold flex justify-center">
              <TriangleAlert className="text-destructive w-10 h-10 mr-4" />
              Erreur
            </h1>
            <p className="text-muted-foreground text-sm text-center">
              error base de donnees : verifier le serveur de la base de donnees
              !
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
export default Error;
