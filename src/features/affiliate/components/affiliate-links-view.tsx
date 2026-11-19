"use client";

import * as React from "react";
import { useCreateMyAffiliateLinkMutation, useGetMyAffiliateLinksQuery } from "../api/affiliate-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AffiliateLinksView() {
  const { data, isLoading, isError } = useGetMyAffiliateLinksQuery();
  const [createLink, { isLoading: isCreating }] = useCreateMyAffiliateLinkMutation();

  const [label, setLabel] = React.useState("");
  const [targetPath, setTargetPath] = React.useState("/tours");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const code = data?.data?.code ?? "";
  const links = data?.data?.links ?? [];

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://phukettours.com";

  const buildUrl = (path: string) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const sep = cleanPath.includes("?") ? "&" : "?";
    return `${origin}${cleanPath}${sep}ref=${code}`;
  };

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLink({ label: label || undefined, targetPath: targetPath || "/" });
    setLabel("");
  };

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading affiliate links...</div>;
  if (isError) return <div className="p-6 text-sm text-red-600">Unable to load affiliate links. Ensure your account is approved.</div>;

  const generalUrl = buildUrl("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Affiliate Links</h1>
        <p className="text-sm text-muted-foreground">Share general or tour-specific referral links to earn commission.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Input readOnly value={generalUrl} className="max-w-xl font-mono text-xs" />
          <Button type="button" onClick={() => handleCopy("general", generalUrl)}>
            {copiedId === "general" ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`Explore Phuket tours: ${generalUrl}`)}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Share WhatsApp
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Custom / Tour-Specific Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="text-xs font-medium text-muted-foreground">Label</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Phi Phi Island Campaign" />
            </div>
            <div className="min-w-[240px] flex-1">
              <label className="text-xs font-medium text-muted-foreground">Target Path</label>
              <Input value={targetPath} onChange={(e) => setTargetPath(e.target.value)} placeholder="/tours/phi-phi-island" />
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Generate Link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Links ({links.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom links yet. Generate one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4">Label</th>
                    <th className="py-2 pr-4">URL</th>
                    <th className="py-2 pr-4">Clicks</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => {
                    const url = buildUrl(link.targetPath);
                    return (
                      <tr key={link.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{link.label || "Custom Link"}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{url}</td>
                        <td className="py-2 pr-4">{link.clickCount}</td>
                        <td className="py-2">
                          <Button size="sm" variant="outline" onClick={() => handleCopy(link.id, url)}>
                            {copiedId === link.id ? "Copied!" : "Copy"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
