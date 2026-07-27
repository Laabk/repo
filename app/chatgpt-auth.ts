export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

const DEFAULT_ADMIN_EMAIL = "dlaabgaria@gmail.com";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const email = process.env.SITE_ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
  return {
    displayName: process.env.ADMIN_DISPLAY_NAME?.trim() || "David",
    email,
    fullName: process.env.ADMIN_DISPLAY_NAME?.trim() || "David",
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  void returnTo;
  return (await getChatGPTUser())!;
}

export async function requireSiteAdmin(returnTo: string): Promise<ChatGPTUser> {
  return requireChatGPTUser(returnTo);
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  void returnTo;
  return "/";
}
