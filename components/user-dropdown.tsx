"use client"

import { useState, useEffect } from "react"
import { useWidgetStore } from "@/store/widgetStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { toast } from "sonner"

export function UserDropdown() {
  const { isLoggedIn, userName, setLoginStatus } = useWidgetStore();
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Initialize local state from store on mount
    setLoginUsername("");
    setLoginPassword("");
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setLoginStatus(true, data.user.username);
        setIsDialogOpen(false); // Close the dialog
        toast.success("Login successful!");
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login.");
    }
  };

  const handleLogout = () => {
    setLoginStatus(false, "Guest");
    toast.info("You have been logged out.");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isLoggedIn ? (
            <>
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </>
          ) : (
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Login</DropdownMenuItem>
            </DialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to log in to your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password"  className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleLogin}>Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}