import React from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  LogOut,
  //Trophy
} from "lucide-react";
import Link from "next/link";

import { Authenticator } from "@aws-amplify/ui-react";

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen flex flex-col">
          <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" passHref>
                <h1 className="text-xl font-bold">Four In A Row</h1>
              </Link>
              <div className="flex items-center space-x-2">
                <span>Hi, {user?.signInDetails?.loginId}</span>
                <Link href="/" passHref>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-gray-300"
                  >
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Home</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="text-white hover:text-gray-300"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-grow">{children}</main>
        </div>
      )}
    </Authenticator>
  );
};

export default AppWrapper;
