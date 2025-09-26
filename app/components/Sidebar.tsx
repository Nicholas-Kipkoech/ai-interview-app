"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Briefcase,
  BookOpen,
  GraduationCap,
  Clock,
  Star,
  Settings,
  Cog,
  Map,
  MoreHorizontal,
  Send,
  HelpCircle,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="bg-black text-white rounded p-2">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Documentation</p>
          <p className="text-xs text-gray-500">v1.0.1</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <p className="px-2 text-xs font-semibold text-gray-500 mb-2">
          Platform
        </p>

        <Accordion type="single" collapsible className="space-y-1">
          {/* Hiring */}
          <AccordionItem value="hiring">
            <AccordionTrigger className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded">
              <Briefcase className="h-4 w-4" />
              Hiring
            </AccordionTrigger>
            <AccordionContent className="ml-6 space-y-1">
              <Link
                href="/hiring/history"
                className="block px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                History
              </Link>
              <Link
                href="/hiring/settings"
                className="block px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                Settings
              </Link>
            </AccordionContent>
          </AccordionItem>

          {/* Onboarding */}
          <AccordionItem value="onboarding">
            <AccordionTrigger className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded">
              <BookOpen className="h-4 w-4" />
              Onboarding
            </AccordionTrigger>
          </AccordionItem>

          {/* Coaching */}
          <AccordionItem value="coaching">
            <AccordionTrigger className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded">
              <GraduationCap className="h-4 w-4" />
              Coaching
            </AccordionTrigger>
            <AccordionContent className="ml-6 space-y-1">
              <Link
                href="/coaching/history"
                className="block px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                History
              </Link>
              <Link
                href="/coaching/starred"
                className="block px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                Starred
              </Link>
              <Link
                href="/coaching/settings"
                className="block px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                Settings
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Projects Section */}
        <p className="px-2 text-xs font-semibold text-gray-500 mt-4 mb-2">
          Projects
        </p>
        <div className="space-y-1">
          <Link
            href="/projects/design"
            className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
          >
            <Cog className="h-4 w-4" />
            Design Engineering
          </Link>
          <Link
            href="/projects/sales"
            className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
          >
            <Clock className="h-4 w-4" />
            Sales & Marketing
          </Link>
          <Link
            href="/projects/travel"
            className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
          >
            <Map className="h-4 w-4" />
            Travel
          </Link>
          <Link
            href="/projects/more"
            className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
          >
            <MoreHorizontal className="h-4 w-4" />
            More
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-3 space-y-2">
        <Link
          href="/replay"
          className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
        >
          <Send className="h-4 w-4" />
          Replay Portal
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
        >
          <UserCog className="h-4 w-4" />
          Settings
        </Link>

        {/* User profile */}
        <div className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer">
          <Image
            src="https://github.com/shadcn.png"
            alt="user avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <p className="text-sm font-medium">shadcn</p>
            <p className="text-xs text-gray-500">m@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
