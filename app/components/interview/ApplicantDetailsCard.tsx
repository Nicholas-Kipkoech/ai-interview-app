"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ApplicantDetailsCard({
  name,
  email,
  onNameChange,
  onEmailChange,
  onNext,
}: {
  name: string;
  email: string;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-bold">Thank your for applying</CardTitle>
      </CardHeader>
      <CardContent>
        Let’s get some quick information from you so we know who you are.
      </CardContent>
      <CardContent className="space-y-4">
        <Input
          placeholder="Full Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </CardContent>
      <CardFooter className="w-full">
        <Button disabled={!name || !email} onClick={onNext} className="w-full">
          Audio/Video Test
        </Button>
      </CardFooter>
    </>
  );
}
