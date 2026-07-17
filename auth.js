import DiscordProvider from "next-auth/providers/discord";

// Looks up the logged-in user's membership + roles in YOUR server directly
// from Discord's API using the bot token. This is the real verification —
// it can't be faked from the browser because it never trusts client input.
async function fetchGuildMember(discordUserId) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
    { headers: { Authorization: `Bot ${botToken}` } }
  );

  if (!res.ok) return null; // not a member (404) or another API error
  return res.json(); // { roles: [...], nick, joined_at, ... }
}

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      // "identify" is enough — we don't need "guilds" scope since we look
      // membership up server-side with the bot token instead.
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      // Runs on sign-in (profile is only present that one time)
      if (profile) {
        token.discordId = profile.id;
        token.username = profile.username;
        token.avatar = profile.avatar;

        const member = await fetchGuildMember(profile.id);
        token.verified = !!member;
        token.roles = member?.roles || [];
        token.isAdmin = token.roles.includes(process.env.DISCORD_ADMIN_ROLE_ID);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId = token.discordId;
      session.user.username = token.username;
      session.user.avatar = token.avatar;
      session.user.verified = token.verified;
      session.user.roles = token.roles;
      session.user.isAdmin = token.isAdmin;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
