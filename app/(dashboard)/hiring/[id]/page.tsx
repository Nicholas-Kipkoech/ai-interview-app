"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Copy, Eye } from "lucide-react";

import EditInterview from "./EditInterview";
import Analytics from "./Analytics";
import React from "react";

export default function PositionEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Hiring</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">November 2024 Hiring Class</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tabs with action buttons */}
      <div className="flex items-center justify-between">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="flex-1">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" /> Copy Share Link
            </Button>
          </div>

          {/* Tab Content */}
          <TabsContent value="edit">
            <EditInterview interviewId={id} />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics interviewId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
