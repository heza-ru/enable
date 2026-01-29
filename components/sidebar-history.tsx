"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  deleteChat,
  type GroupedChats,
  getGroupedChats,
  searchChats,
} from "@/lib/storage/chat-store";
import type { Chat } from "@/lib/storage/indexeddb";
import { ChatItem } from "./sidebar-history-item";

export function SidebarHistory() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const [groupedChats, setGroupedChats] = useState<GroupedChats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Chat[]>([]);

  // Extract chat ID from pathname
  const id = pathname.split("/").pop();

  // Load chats from IndexedDB
  const loadChats = async () => {
    try {
      setIsLoading(true);
      const chats = await getGroupedChats();
      setGroupedChats(chats);
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  // Search chats
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchChats(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search chats:", error);
      toast.error("Search failed");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  // Load on mount and when pathname changes
  useEffect(() => {
    loadChats();
  }, [pathname]);

  // Refresh chats when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      loadChats();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteChat(deleteId);
      setShowDeleteDialog(false);
      setDeleteId(null);
      toast.success("Chat deleted successfully");

      // Reload chats
      await loadChats();

      // If we're on the deleted chat page, redirect to home
      if (id === deleteId) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  // Check if there are any chats
  const hasChats =
    groupedChats &&
    (groupedChats.today.length > 0 ||
      groupedChats.yesterday.length > 0 ||
      groupedChats.lastWeek.length > 0 ||
      groupedChats.lastMonth.length > 0 ||
      groupedChats.older.length > 0);

  return (
    <>
      {/* Search Input */}
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="relative px-2 py-2">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
            <Input
              className="h-8 pl-8 pr-8 bg-sidebar-accent text-sidebar-foreground placeholder:text-sidebar-foreground/50"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search chats..."
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <Button
                className="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
                onClick={clearSearch}
                size="icon"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Search Results */}
      {searchQuery && (
        <SidebarGroup>
          <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
            Search Results ({searchResults.length})
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {searchResults.length > 0 ? (
                searchResults.map((chat) => (
                  <ChatItem
                    chat={chat}
                    isActive={chat.id === id}
                    key={chat.id}
                    onDelete={(chatId) => {
                      setDeleteId(chatId);
                      setShowDeleteDialog(true);
                    }}
                    setOpenMobile={setOpenMobile}
                  />
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-sidebar-foreground/50">
                  No chats found matching "{searchQuery}"
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Loading State */}
      {!searchQuery && isLoading && (
        <SidebarGroup>
          <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
            Today
          </div>
          <SidebarGroupContent>
            <div className="flex flex-col">
              {[44, 32, 28, 64, 52].map((item) => (
                <div
                  className="flex h-8 items-center gap-2 rounded-md px-2"
                  key={item}
                >
                  <div
                    className="h-4 max-w-(--skeleton-width) flex-1 rounded-md bg-sidebar-accent-foreground/10"
                    style={
                      {
                        "--skeleton-width": `${item}%`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Empty State */}
      {!searchQuery && !isLoading && !hasChats && (
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
              Your conversations will appear here once you start chatting!
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Grouped Chats */}
      {!searchQuery && !isLoading && hasChats && (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedChats && (
                <div className="flex flex-col gap-6">
                  {groupedChats.today.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                        Today
                      </div>
                      {groupedChats.today.map((chat) => (
                        <ChatItem
                          chat={chat}
                          isActive={chat.id === id}
                          key={chat.id}
                          onDelete={(chatId) => {
                            setDeleteId(chatId);
                            setShowDeleteDialog(true);
                          }}
                          setOpenMobile={setOpenMobile}
                        />
                      ))}
                    </div>
                  )}

                  {groupedChats.yesterday.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                        Yesterday
                      </div>
                      {groupedChats.yesterday.map((chat) => (
                        <ChatItem
                          chat={chat}
                          isActive={chat.id === id}
                          key={chat.id}
                          onDelete={(chatId) => {
                            setDeleteId(chatId);
                            setShowDeleteDialog(true);
                          }}
                          setOpenMobile={setOpenMobile}
                        />
                      ))}
                    </div>
                  )}

                  {groupedChats.lastWeek.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                        Last 7 days
                      </div>
                      {groupedChats.lastWeek.map((chat) => (
                        <ChatItem
                          chat={chat}
                          isActive={chat.id === id}
                          key={chat.id}
                          onDelete={(chatId) => {
                            setDeleteId(chatId);
                            setShowDeleteDialog(true);
                          }}
                          setOpenMobile={setOpenMobile}
                        />
                      ))}
                    </div>
                  )}

                  {groupedChats.lastMonth.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                        Last 30 days
                      </div>
                      {groupedChats.lastMonth.map((chat) => (
                        <ChatItem
                          chat={chat}
                          isActive={chat.id === id}
                          key={chat.id}
                          onDelete={(chatId) => {
                            setDeleteId(chatId);
                            setShowDeleteDialog(true);
                          }}
                          setOpenMobile={setOpenMobile}
                        />
                      ))}
                    </div>
                  )}

                  {groupedChats.older.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                        Older
                      </div>
                      {groupedChats.older.map((chat) => (
                        <ChatItem
                          chat={chat}
                          isActive={chat.id === id}
                          key={chat.id}
                          onDelete={(chatId) => {
                            setDeleteId(chatId);
                            setShowDeleteDialog(true);
                          }}
                          setOpenMobile={setOpenMobile}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat from local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
